/**
 * 5-Minute In-Memory Cache for GitHub API responses
 * Prevents hitting the 5,000 req/hr rate limit and speeds up repeat package audits
 */
const cache = {};
const CACHE_TTL_MS = 300000; // 5 minutes

function getCacheKey(owner, repo) {
    return `${owner}/${repo}`;
}

function getCachedData(owner, repo) {
    const key = getCacheKey(owner, repo);
    const entry = cache[key];
    if (entry && (Date.now() - entry.timestamp < CACHE_TTL_MS)) {
        return entry;
    }
    return null;
}

function setCachedData(owner, repo, data) {
    const key = getCacheKey(owner, repo);
    cache[key] = {
        ...data,
        timestamp: Date.now()
    };
}

module.exports = {
    getCacheKey,
    getCachedData,
    setCachedData
};
