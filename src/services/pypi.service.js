// PyPI and PyPIStats services utilizing throttled clients and 24-hour download stats cache
const { pypiClient, pypiStatsClient } = require('../utils/clients');

// 24-hour in-memory cache for PyPIStats download metrics to prevent redundant hits
const downloadCache = {};
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches package metadata from the official PyPI JSON API using throttled pypiClient
 */
async function fetchPackageMetadata(packageName) {
    // Throttled PyPI JSON metadata client
    const response = await pypiClient(`https://pypi.org/pypi/${packageName}/json`, {
        timeout: 10000
    });
    return response.data;
}

/**
 * PROOF OF LIFE: Fetches monthly download count from pypistats API using throttled pypiStatsClient
 */
async function fetchPypiDownloadStats(packageName) {
    const cached = downloadCache[packageName];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        console.log(`[PyPIStats Cache] Cache HIT for ${packageName}: ${cached.downloads} downloads`);
        return cached.downloads;
    }

    const url = `https://pypistats.org/api/packages/${packageName}/recent`;
    console.log(`[PyPIStats] Fetching download stats for package: ${packageName}`);
    try {
        // Throttled pypistats client with retry and backoff
        const response = await pypiStatsClient(url, {
            headers: { 'User-Agent': 'RepoVitals-Audit/1.0 (https://github.com/anshuvdebnath-cyber/HACK-SYNTHESIS-3.0)' },
            timeout: 5000
        });
        const lastMonth = response.data?.data?.last_month || null;
        console.log(`[PyPIStats] Success for ${packageName}: last_month = ${lastMonth}`);
        if (lastMonth !== null) {
            downloadCache[packageName] = {
                downloads: lastMonth,
                timestamp: Date.now()
            };
        }
        return lastMonth;
    } catch (error) {
        const status = error.response ? error.response.status : 'NO RESPONSE';
        console.error(`[PyPIStats] Error fetching ${packageName}: Status: ${status}, Message: ${error.message}, URL: ${url}`);
        return null;
    }
}

module.exports = {
    fetchPackageMetadata,
    fetchPypiDownloadStats
};
