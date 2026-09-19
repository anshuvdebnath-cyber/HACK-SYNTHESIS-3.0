const { fetchPackageMetadata, fetchPypiDownloadStats } = require('../services/pypi.service');
const { fetchRepoDataWithCache } = require('../services/github.service');
const {
    calculateMALTA_DAS,
    calculateMALTA_MRS,
    calculateMALTA_RMVS,
    calculateMALTA_FinalScore
} = require('../services/malta.service');
const { getGithubUrl, parseGithubRepo } = require('../utils/helpers');

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
 * Controller: Audits a list of dependencies using the MALTA framework
 */
async function auditRequirements(req, res) {
    const { requirements } = req.body;

    if (!requirements) {
        res.status(400).json({ error: "pls provide the requirements.txt" });
        return;
    }

    const lines = requirements.split('\n');
    const results = [];

    // Define MALTA observation windows: We = 18 months, Wb = 24 months before We
    const now = new Date();
    const weStart = new Date(now);
    weStart.setMonth(weStart.getMonth() - 18);

    const wbStart = new Date(weStart);
    wbStart.setMonth(wbStart.getMonth() - 24);

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [rawName, rawVersion] = trimmed.split('==');
            const name = rawName.trim();
            const version = rawVersion ? rawVersion.trim() : null;

            try {
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

                // PROOF OF LIFE OVERRIDE: Check monthly downloads if package is flagged as at-risk
                let proofOverride = false;
                let proofReason = null;

                if (finalResult && finalResult.finalScore !== null &&
                    (finalResult.riskLevel === "Probable Abandonment" || finalResult.riskLevel === "Effective Abandonment")) {
                    const monthlyDownloads = await fetchPypiDownloadStats(name);
                    if (monthlyDownloads && monthlyDownloads > 100000) {
                        finalResult.finalScore = Math.max(finalResult.finalScore, 65);
                        finalResult.riskLevel = "Sustained Maintenance (Mature)";
                        proofOverride = true;
                        proofReason = "High real-world usage detected (over 100,000 monthly downloads).";
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

                results.push({
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
                    dasDetails: dasResult ? dasResult.dasDetails : null,
                    mrsDetails: mrsResult ? mrsResult.mrsDetails : null,
                    rmvsDetails: rmvsResult ? rmvsResult.rmvsDetails : null
                });
            } catch (error) {
                console.error(`Error processing ${name}:`, error.message);
                if (error.response && error.response.status === 404) {
                    results.push({ name: name, error: "package not found on pypi" });
                } else {
                    results.push({ name: name, error: error.message });
                }
            }
        }
    }

    res.json({ count: results.length, dependencies: results });
}

module.exports = {
    getTestPypi,
    auditRequirements
};
