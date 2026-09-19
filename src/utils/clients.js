// Service-specific throttled clients with pacing and retry with exponential backoff
const axios = require('axios');
const RateLimiter = require('./rateLimiter');
const { fetchWithRetry } = require('./helpers');

// Minimum gap pacing: 1.5s between GitHub calls, 300ms between pypistats, 200ms between PyPI
const githubLimiter = new RateLimiter(1500);    // 1.5s between GitHub calls
const pypiStatsLimiter = new RateLimiter(300);  // 300ms between pypistats calls
const pypiLimiter = new RateLimiter(200);       // 200ms between PyPI calls

// Throttled GitHub client with automatic rate limit quota monitoring
const githubClient = (url, options) =>
    githubLimiter.schedule(async () => {
        const res = await fetchWithRetry(() => axios.get(url, options), 3, 'GitHub');
        const remaining = res.headers['x-ratelimit-remaining'];
        if (remaining && parseInt(remaining) < 500) {
            console.log(`⚠️  GitHub rate limit remaining: ${remaining}`);
        }
        return res;
    });

// Throttled PyPI Stats client
const pypiStatsClient = (url, options) =>
    pypiStatsLimiter.schedule(() =>
        fetchWithRetry(() => axios.get(url, options), 3, 'pypistats')
    );

// Throttled official PyPI JSON client
const pypiClient = (url, options) =>
    pypiLimiter.schedule(() =>
        fetchWithRetry(() => axios.get(url, options), 3, 'PyPI')
    );

module.exports = { githubClient, pypiStatsClient, pypiClient };
