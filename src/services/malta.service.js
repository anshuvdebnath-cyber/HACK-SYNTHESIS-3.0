const { calculateMedian, isNonTrivialCommit } = require('../utils/helpers');

/**
 * Calculates the MALTA Development Activity Score (DAS)
 * Sdev = min(1, Dc) * Rc (Paper Section IV-C)
 */
function calculateMALTA_DAS(allCommits, latestCommitOverall, wbStart, weStart, now) {
    const nonTrivialCommits = allCommits.filter(isNonTrivialCommit);

    let Cb = 0; // Baseline non-trivial commits [wbStart, weStart)
    let Ce = 0; // Evaluation non-trivial commits [weStart, now]

    for (const item of nonTrivialCommits) {
        const commitDate = new Date(item.commit.committer?.date || item.commit.author?.date);
        if (commitDate >= wbStart && commitDate < weStart) {
            Cb++;
        } else if (commitDate >= weStart && commitDate <= now) {
            Ce++;
        }
    }

    // Observation window durations in months: |Wb| = 24, |We| = 18
    const WbDurationMonths = 24;
    const WeDurationMonths = 18;

    const lambdaB = Cb / WbDurationMonths;
    const lambdaE = Ce / WeDurationMonths;

    let Dc = 0;
    if (lambdaB > 0) {
        Dc = lambdaE / lambdaB;
    } else if (lambdaB === 0 && lambdaE > 0) {
        Dc = 1;
    } else {
        Dc = 0;
    }

    const mostRecentNonTrivial = nonTrivialCommits[0] || (latestCommitOverall && isNonTrivialCommit(latestCommitOverall) ? latestCommitOverall : null);

    let t_last = null;
    let Rc = 0;

    if (mostRecentNonTrivial) {
        const lastDate = new Date(mostRecentNonTrivial.commit.committer?.date || mostRecentNonTrivial.commit.author?.date);
        t_last = Math.max(0, Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)));
        Rc = Math.exp(-t_last / 180);
    } else if (latestCommitOverall) {
        const lastDate = new Date(latestCommitOverall.commit.committer?.date || latestCommitOverall.commit.author?.date);
        t_last = Math.max(0, Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)));
        Rc = Math.exp(-t_last / 180);
    }

    const Sdev = Math.min(1, Dc) * Rc;

    return {
        devActivityScore: Number(Sdev.toFixed(4)),
        dasDetails: {
            Cb,
            Ce,
            lambdaB: Number(lambdaB.toFixed(4)),
            lambdaE: Number(lambdaE.toFixed(4)),
            velocityDecay: Number(Dc.toFixed(4)),
            recencyTerm: Number(Rc.toFixed(4)),
            tLastDays: t_last
        }
    };
}

/**
 * Calculates the MALTA Maintainer Responsiveness Score (MRS)
 * Returns mrsDefined: false when |P| = 0 to avoid docking 35% of the score unfairly (Paper Section IV-D)
 */
function calculateMALTA_MRS(pulls, now) {
    if (!pulls || pulls.length === 0) {
        return {
            maintRespScore: null,
            mrsDefined: false,
            mrsDetails: {
                totalPRs: 0,
                closedPRs: 0,
                openPRs: 0,
                Rdec: 0,
                Ddec: 0,
                Pstale: 0
            }
        };
    }

    const totalPRs = pulls.length;
    const closedPRs = pulls.filter(pr => pr.state === 'closed');
    const openPRs = pulls.filter(pr => pr.state === 'open');

    // Decision Responsiveness: Rdec = |Pterm| / |P|
    const Rdec = closedPRs.length / totalPRs;

    // Decision Timeliness: Ddec = median of min(1, delta_t / 180)
    let Ddec = 0;
    if (closedPRs.length > 0) {
        const dDecValues = closedPRs.map(pr => {
            const created = new Date(pr.created_at);
            const closed = new Date(pr.closed_at || pr.updated_at);
            const daysToClose = Math.max(0, (closed - created) / (1000 * 60 * 60 * 24));
            return Math.min(1, daysToClose / 180);
        });
        Ddec = calculateMedian(dDecValues);
    }

    // Open-PR Staleness Penalty: Pstale = median of min(1, age / 180)
    let Pstale = 0;
    if (openPRs.length > 0) {
        const pStaleValues = openPRs.map(pr => {
            const created = new Date(pr.created_at);
            const ageDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
            return Math.min(1, ageDays / 180);
        });
        Pstale = calculateMedian(pStaleValues);
    }

    // Paper rule: If |P| > 0 but |Pterm| = 0, Sresp = 0
    let Sresp = 0;
    if (closedPRs.length > 0) {
        Sresp = Math.max(0, Math.min(1, Rdec * (1 - Ddec) * (1 - Pstale)));
    }

    return {
        maintRespScore: Number(Sresp.toFixed(4)),
        mrsDefined: true,
        mrsDetails: {
            totalPRs,
            closedPRs: closedPRs.length,
            openPRs: openPRs.length,
            Rdec: Number(Rdec.toFixed(4)),
            Ddec: Number(Ddec.toFixed(4)),
            Pstale: Number(Pstale.toFixed(4))
        }
    };
}

/**
 * Calculates the MALTA Repository Metadata Viability Score (RMVS)
 * Applies 0.3x archival multiplier (Apen = 1 - 0.7 = 0.3) instead of returning 0 outright (Paper Section IV-E)
 */
function calculateMALTA_RMVS(repoData) {
    if (!repoData) {
        return { metadataScore: 0, rmvsDetails: null };
    }

    const isArchived = Boolean(repoData.archived);
    const stars = repoData.stargazers_count || 0;
    const forks = repoData.forks_count || 0;
    const watchers = repoData.subscribers_count || repoData.watchers_count || 0;
    const openIssues = repoData.open_issues_count || 0;

    // Approximation. Paper uses per-metric 95th percentile from their dataset (Section IV-E), which we cannot reconstruct.
    const Ks = 1000;
    const logDenom = Math.log(1 + Ks);
    const phi = (x) => Math.min(1, Math.log(1 + Math.max(0, x)) / logDenom);

    const S_star = phi(stars);
    const F_star = phi(forks);
    const W_star = phi(watchers);
    const I_pen = 1 - phi(openIssues);

    const rawSmeta = 0.25 * S_star + 0.25 * F_star + 0.25 * W_star + 0.25 * I_pen;
    // Paper Section IV-E: Apen = 1 - alpha*A with alpha = 0.7 => 0.3 if archived, 1.0 otherwise
    const Apen = isArchived ? 0.3 : 1.0;
    const Smeta = Math.max(0, Math.min(1, Apen * rawSmeta));

    return {
        metadataScore: Number(Smeta.toFixed(4)),
        rmvsDetails: {
            archived: isArchived,
            stars,
            forks,
            watchers,
            openIssues,
            S_star: Number(S_star.toFixed(4)),
            F_star: Number(F_star.toFixed(4)),
            W_star: Number(W_star.toFixed(4)),
            I_pen: Number(I_pen.toFixed(4)),
            Apen
        }
    };
}

/**
 * Calculates the Final Aggregate MALTA Score and Classification
 * Renormalizes over observed signals when MRS is undefined, or sets Sresp = 0 if archived (Paper Section IV-F)
 */
function calculateMALTA_FinalScore(dasScore, mrsScore, rmvsScore, mrsDefined = true, isArchived = false) {
    if (dasScore === null || rmvsScore === null) {
        return { finalScore: null, riskLevel: "Unknown (No Repository)" };
    }

    let Sfinal;
    if (mrsDefined === true && mrsScore !== null) {
        // Normal 3-term formula: 0.55*DAS + 0.35*MRS + 0.10*RMVS
        Sfinal = (0.55 * dasScore) + (0.35 * mrsScore) + (0.10 * rmvsScore);
    } else if (mrsDefined === false && isArchived === false) {
        // Renormalize over observed signals: (0.55*DAS + 0.10*RMVS) / (0.55 + 0.10)
        Sfinal = ((0.55 * dasScore) + (0.10 * rmvsScore)) / 0.65;
    } else {
        // mrsDefined === false && isArchived === true: Sresp = 0
        Sfinal = (0.55 * dasScore) + (0.35 * 0) + (0.10 * rmvsScore);
    }

    const finalScore_100 = Number(Math.max(0, Math.min(100, Sfinal * 100)).toFixed(1));

    let riskLevel = "Effective Abandonment";
    if (finalScore_100 >= 80) {
        riskLevel = "Sustained Maintenance";
    } else if (finalScore_100 >= 60) {
        riskLevel = "Stable Maintenance";
    } else if (finalScore_100 >= 40) {
        riskLevel = "Declining Maintenance";
    } else if (finalScore_100 >= 20) {
        riskLevel = "Probable Abandonment";
    } else {
        riskLevel = "Effective Abandonment";
    }

    return {
        finalScore: finalScore_100,
        riskLevel
    };
}

module.exports = {
    calculateMALTA_DAS,
    calculateMALTA_MRS,
    calculateMALTA_RMVS,
    calculateMALTA_FinalScore
};
