/**
 * Extracts a GitHub repository URL from PyPI metadata
 */
function getGithubUrl(pypiData) {
    const urls = pypiData.info?.project_urls || {};
    for (const val of Object.values(urls)) {
        if (typeof val === 'string' && val.includes('github.com')) {
            return val;
        }
    }
    if (typeof pypiData.info?.home_page === 'string' && pypiData.info.home_page.includes('github.com')) {
        return pypiData.info.home_page;
    }
    return null;
}

/**
 * Parses GitHub owner and repo from a GitHub URL
 */
function parseGithubRepo(githubUrl) {
    if (!githubUrl) return null;
    try {
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
        if (match) {
            const owner = match[1];
            const repo = match[2].replace(/\.git$/, '');
            return { owner, repo };
        }
    } catch (e) {}
    return null;
}

/**
 * Helper to compute the median of a numerical array
 */
function calculateMedian(arr) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * MALTA Non-Trivial Commit Filter:
 * Excludes merge commits and documentation-only changes
 */
function isNonTrivialCommit(commitItem) {
    if (!commitItem || !commitItem.commit) return false;

    if (commitItem.parents && commitItem.parents.length > 1) {
        return false;
    }

    const message = (commitItem.commit.message || '').trim();

    if (/^merge\s+/i.test(message)) {
        return false;
    }

    const isDocOnly = /^(docs?|documentation)(\([^)]*\))?:\s*/i.test(message) ||
                      /^update\s+(readme|docs?|documentation)/i.test(message) ||
                      /^\[docs?\]/i.test(message);
    if (isDocOnly) {
        return false;
    }

    return true;
}

module.exports = {
    getGithubUrl,
    parseGithubRepo,
    calculateMedian,
    isNonTrivialCommit
};
