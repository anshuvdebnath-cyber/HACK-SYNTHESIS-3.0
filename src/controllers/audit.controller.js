// Audit controller orchestrating sequential, throttled dependency evaluation with MALTA scoring
const { fetchPackageMetadata, fetchPypiDownloadStats } = require('../services/pypi.service');
const { fetchRepoDataWithCache } = require('../services/github.service');
const {
    calculateMALTA_DAS,
    calculateMALTA_MRS,
    calculateMALTA_RMVS,
    calculateMALTA_FinalScore
} = require('../services/malta.service');
const { getGithubUrl, parseGithubRepo } = require('../utils/helpers');
const { extractGithubUrlsFromLatex } = require('../services/latex.service');

// Per-package timeout helper preventing long-hanging audits
const withTimeout = (promise, ms) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Package audit timeout')), ms)
        )
    ]);

/**
 * Controller: Verifies outbound connectivity with PyPI
 */
async function getTestPypi(req, res) {
    try {
        const data = await fetchPackageMetadata('numpy');
        res.json({
            status: 'online',
            package: data.info.name,
            latestVersion: data.info.version,
            summary: data.info.summary
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}

/**
 * Controller: Audits a list of dependencies sequentially using the MALTA framework
 */
async function auditRequirements(req, res) {
    const { requirements } = req.body;

    if (!requirements) {
        res.status(400).json({ error: "pls provide the requirements.txt" });
        return;
    }

    const lines = requirements.split('\n');
    const parsedPackages = [];

    // Parse non-empty, non-comment lines
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [rawName, rawVersion] = trimmed.split('==');
            parsedPackages.push({
                name: rawName.trim(),
                version: rawVersion ? rawVersion.trim() : null
            });
        }
    }

    const results = [];
    const auditStartTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    // Define MALTA observation windows: We = 18 months, Wb = 24 months before We
    const now = new Date();
    const weStart = new Date(now);
    weStart.setMonth(weStart.getMonth() - 18);

    const wbStart = new Date(weStart);
    wbStart.setMonth(wbStart.getMonth() - 24);

    // Process packages SEQUENTIALLY to respect service rate limits and pacing
    for (let idx = 0; idx < parsedPackages.length; idx++) {
        const { name, version } = parsedPackages[idx];
        const packageStartTime = Date.now();
        console.log(`[${idx + 1}/${parsedPackages.length}] Processing: ${name}`);

        try {
            // Wrap single package audit in 30-second circuit breaker
            const packageResult = await withTimeout((async () => {
                // Fetch package metadata from PyPI
                const response = await fetchPackageMetadata(name);

                let maintenanceLagDays = null;
                let dasResult = null;
                let mrsResult = null;
                let rmvsResult = null;
                let finalResult = null;

                const githubUrl = getGithubUrl(response);
                const repoInfo = parseGithubRepo(githubUrl);

                if (repoInfo) {
                    const { owner, repo } = repoInfo;
                    try {
                        const token = process.env.GITHUB_TOKEN;
                        const { repoData, allCommits, latestCommitOverall, pulls } = await fetchRepoDataWithCache(
                            owner,
                            repo,
                            token,
                            wbStart,
                            weStart
                        );

                        const isArchived = Boolean(repoData.archived);

                        const lastPush = new Date(repoData.pushed_at);
                        maintenanceLagDays = Math.floor((now - lastPush) / (1000 * 60 * 60 * 24));
                        rmvsResult = calculateMALTA_RMVS(repoData);

                        dasResult = calculateMALTA_DAS(allCommits, latestCommitOverall, wbStart, weStart, now);

                        mrsResult = calculateMALTA_MRS(pulls, now);

                        // Set archivedOverride flag only when repository is archived and MRS is undefined
                        if (isArchived === true && !mrsResult.mrsDefined) {
                            if (mrsResult.mrsDetails) {
                                mrsResult.mrsDetails.archivedOverride = true;
                            }
                        }

                        // Compute Final Aggregate Score with normalization & archival policy
                        finalResult = calculateMALTA_FinalScore(
                            dasResult.devActivityScore,
                            mrsResult.maintRespScore,
                            rmvsResult.metadataScore,
                            mrsResult.mrsDefined,
                            isArchived
                        );
                    } catch (e) {
                        console.log(`GitHub data fetch failed for ${name} (${owner}/${repo}): ${e.message}`);
                    }
                }

                // PROOF OF LIFE & ZOMBIE/GHOST DETECTION
                // Gate A: Mature package override requires >= 1M downloads AND active repository pulse (<= 730 days)
                // Gate B: Ghost / Zombie dependency flagged if >= 100k downloads but zero pulse (> 730 days dead)
                let proofOverride = false;
                let proofReason = null;
                let isZombie = false;
                let zombieReason = null;

                if (finalResult && finalResult.finalScore !== null &&
                    (finalResult.riskLevel === "Probable Abandonment" || finalResult.riskLevel === "Effective Abandonment")) {
                    const monthlyDownloads = await fetchPypiDownloadStats(name);
                    const lastCommitDays = dasResult?.dasDetails?.tLastDays ?? maintenanceLagDays;
                    const hasPulse = lastCommitDays !== null && lastCommitDays <= 730;

                    if (monthlyDownloads && monthlyDownloads >= 1000000 && hasPulse) {
                        // Mature & Stable: High adoption with recent maintainer activity
                        finalResult.finalScore = Math.max(finalResult.finalScore, 65);
                        finalResult.riskLevel = "Sustained Maintenance (Mature)";
                        proofOverride = true;
                        proofReason = `High real-world adoption detected (${monthlyDownloads.toLocaleString()} monthly downloads with active repository pulse).`;
                    } else if (monthlyDownloads && monthlyDownloads >= 100000 && !hasPulse) {
                        // Ghost / Zombie: Heavy real-world dependency on completely abandoned code
                        isZombie = true;
                        zombieReason = `Zombie Dependency (Ghost): ${monthlyDownloads.toLocaleString()} monthly downloads despite no maintenance in ${lastCommitDays} days. Critical unmaintained upstream risk.`;
                        finalResult.riskLevel = "Zombie Dependency (Ghost)";
                    }
                }

                // Calculate Major Version Lag
                let versionLag = null;
                if (version && response.info.version) {
                    const currentMajor = parseInt(version.split('.')[0], 10);
                    const latestMajor = parseInt(response.info.version.split('.')[0], 10);
                    if (!isNaN(currentMajor) && !isNaN(latestMajor)) {
                        versionLag = Math.max(0, latestMajor - currentMajor);
                    }
                }

                // Calculate Time Lag Days from release upload dates
                let timeLagDays = null;
                if (version && response.releases) {
                    const currentFiles = response.releases[version];
                    const latestFiles = response.releases[response.info.version];

                    if (currentFiles && currentFiles.length > 0 && latestFiles && latestFiles.length > 0) {
                        const currentTime = new Date(currentFiles[0].upload_time);
                        const latestTime = new Date(latestFiles[0].upload_time);
                        timeLagDays = Math.max(0, Math.floor((latestTime - currentTime) / (1000 * 60 * 60 * 24)));
                    }
                }

                // Flag discordant packages (low/null version lag but high MALTA abandonment risk)
                const isDiscordant = Boolean(
                    (versionLag <= 0 || versionLag === null) &&
                    finalResult &&
                    finalResult.finalScore !== null &&
                    finalResult.finalScore < 40
                );

                return {
                    name: name,
                    currentVersion: version ? version : 'unknown',
                    latestVersion: response.info.version,
                    versionLag: versionLag,
                    timeLagDays: timeLagDays,
                    maintenanceLagDays: maintenanceLagDays,
                    devActivityScore: dasResult ? dasResult.devActivityScore : null,
                    maintRespScore: mrsResult ? mrsResult.maintRespScore : null,
                    mrsDefined: mrsResult ? mrsResult.mrsDefined : false,
                    metadataScore: rmvsResult ? rmvsResult.metadataScore : null,
                    finalScore: finalResult ? finalResult.finalScore : null,
                    riskLevel: finalResult ? finalResult.riskLevel : "Unknown (No Repository)",
                    isDiscordant: isDiscordant,
                    proofOverride: proofOverride,
                    proofReason: proofReason,
                    isZombie: isZombie,
                    zombieReason: zombieReason,
                    dasDetails: dasResult ? dasResult.dasDetails : null,
                    mrsDetails: mrsResult ? mrsResult.mrsDetails : null,
                    rmvsDetails: rmvsResult ? rmvsResult.rmvsDetails : null
                };
            })(), 30000);

            results.push(packageResult);
            successCount++;
            const elapsed = Date.now() - packageStartTime;
            console.log(`   ✔️  ${name} done in ${elapsed}ms`);
        } catch (error) {
            failCount++;
            const elapsed = Date.now() - packageStartTime;
            console.error(`   ❌ ${name} failed in ${elapsed}ms: ${error.message}`);
            if (error.message === 'Package audit timeout') {
                results.push({ name: name, error: 'Timeout' });
            } else if (error.response && error.response.status === 404) {
                results.push({ name: name, error: "package not found on pypi" });
            } else {
                results.push({ name: name, error: error.message });
            }
        }
    }

    const totalMs = Date.now() - auditStartTime;
    console.log(`🏁 Audit complete: ${successCount} succeeded, ${failCount} failed in ${totalMs}ms`);

    res.json({ count: results.length, dependencies: results });
}


/**
 * Controller: Extracts GitHub repository links from an uploaded LaTeX manuscript (.tex) and runs MALTA scoring
 */
async function auditLatex(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a .tex file" });
    }

    const latexContent = req.file.buffer.toString('utf-8');
    const urls = extractGithubUrlsFromLatex(latexContent);

    if (!urls || urls.length === 0) {
        return res.status(400).json({ error: "No GitHub repository links found in the LaTeX file." });
    }

    console.log(`📄 Found ${urls.length} GitHub links in LaTeX file`);

    const results = [];
    const auditStartTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    // Define MALTA observation windows: We = 18 months, Wb = 24 months before We
    const now = new Date();
    const weStart = new Date(now);
    weStart.setMonth(weStart.getMonth() - 18);

    const wbStart = new Date(weStart);
    wbStart.setMonth(wbStart.getMonth() - 24);

    const token = process.env.GITHUB_TOKEN;

    // Process repositories SEQUENTIALLY to respect service rate limits and pacing
    for (let idx = 0; idx < urls.length; idx++) {
        const url = urls[idx];
        const repoInfo = parseGithubRepo(url);

        if (!repoInfo) {
            console.log(`[${idx + 1}/${urls.length}] Skipping invalid GitHub URL: ${url}`);
            continue;
        }

        const { owner, repo } = repoInfo;
        const repoName = `${owner}/${repo}`;
        const repoStartTime = Date.now();
        console.log(`[${idx + 1}/${urls.length}] Processing: ${repoName}`);

        try {
            // Wrap single repository processing in 30-second circuit breaker
            const repoResult = await withTimeout((async () => {
                const { repoData, allCommits, latestCommitOverall, pulls } = await fetchRepoDataWithCache(
                    owner,
                    repo,
                    token,
                    wbStart,
                    weStart
                );

                const isArchived = Boolean(repoData.archived);
                const lastPush = new Date(repoData.pushed_at);
                const maintenanceLagDays = Math.floor((now - lastPush) / (1000 * 60 * 60 * 24));

                const rmvsResult = calculateMALTA_RMVS(repoData);
                const dasResult = calculateMALTA_DAS(allCommits, latestCommitOverall, wbStart, weStart, now);
                const mrsResult = calculateMALTA_MRS(pulls, now);

                if (isArchived === true && !mrsResult.mrsDefined) {
                    if (mrsResult.mrsDetails) {
                        mrsResult.mrsDetails.archivedOverride = true;
                    }
                }

                const finalResult = calculateMALTA_FinalScore(
                    dasResult.devActivityScore,
                    mrsResult.maintRespScore,
                    rmvsResult.metadataScore,
                    mrsResult.mrsDefined,
                    isArchived
                );

                // Pure MALTA schema for LaTeX repositories (no PyPI-dependent fields)
                return {
                    name: repoName,
                    currentVersion: null,
                    latestVersion: null,
                    devActivityScore: dasResult.devActivityScore,
                    maintRespScore: mrsResult.maintRespScore,
                    mrsDefined: mrsResult.mrsDefined,
                    metadataScore: rmvsResult.metadataScore,
                    finalScore: finalResult.finalScore,
                    riskLevel: finalResult.riskLevel,
                    maintenanceLagDays: maintenanceLagDays,
                    dasDetails: dasResult.dasDetails,
                    mrsDetails: mrsResult.mrsDetails,
                    rmvsDetails: rmvsResult.rmvsDetails
                };
            })(), 30000);

            results.push(repoResult);
            successCount++;
            const elapsed = Date.now() - repoStartTime;
            console.log(`   ✔️  ${repoName} done in ${elapsed}ms`);
        } catch (error) {
            failCount++;
            const elapsed = Date.now() - repoStartTime;
            console.error(`   ❌ ${repoName} failed in ${elapsed}ms: ${error.message}`);
            if (error.message === 'Package audit timeout') {
                results.push({ name: repoName, error: 'Timeout' });
            } else {
                results.push({ name: repoName, error: error.message });
            }
        }
    }

    const totalMs = Date.now() - auditStartTime;
    console.log(`🏁 LaTeX audit complete: ${successCount} succeeded, ${failCount} failed in ${totalMs}ms`);

    res.json({
        count: results.length,
        source: "latex",
        dependencies: results
    });
}

module.exports = {
    getTestPypi,
    auditRequirements,
    auditLatex
};
