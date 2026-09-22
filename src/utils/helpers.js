const axios = require('axios');

function isReservedGithubPath(name) {
    const reserved = ['features', 'pricing', 'enterprise', 'topics', 'trending', 'collections', 'events', 'about', 'contact', 'login', 'signup', 'security', 'site', 'blog', 'orgs'];
    return reserved.includes((name || '').toLowerCase());
}

function cleanRepoName(repo) {
    return (repo || '').replace(/[.,;:?}>)]\]+$/, '').replace(/\.git$/, '');
}

function cleanGithubUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/https?:\/\/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/);
    if (match && !isReservedGithubPath(match[1])) {
        return `https://github.com/${match[1]}/${cleanRepoName(match[2])}`;
    }
    return null;
}

/**
 * Fully dynamic repository discovery without ANY hardcoded package registries:
 * Tier 1: PyPI JSON metadata (project_urls, home_page)
 * Tier 2: PyPI Warehouse HTML (OIDC trusted publishing provenance)
 * Tier 3: Google deps.dev Open Source Insights API (canonical upstream repository)
 * Tier 4: Custom documentation homepage crawling (extracts GitHub repo links)
 * Tier 5: Convention fallback (owner/repo matching package name)
 */
async function getGithubUrl(pypiData) {
    if (!pypiData || !pypiData.info) return null;
    const pkgName = (pypiData.info.name || '').toLowerCase().trim();

    // 1. Direct PyPI metadata project_urls (fastest, covers majority of packages)
    const urls = pypiData.info.project_urls || {};
    for (const val of Object.values(urls)) {
        if (typeof val === 'string' && val.includes('github.com')) {
            const cleaned = cleanGithubUrl(val);
            if (cleaned) return cleaned;
        }
    }

    // 2. Direct PyPI home_page check
    if (typeof pypiData.info.home_page === 'string' && pypiData.info.home_page.includes('github.com')) {
        const cleaned = cleanGithubUrl(pypiData.info.home_page);
        if (cleaned) return cleaned;
    }

    // 3. PyPI description/summary scan
    const desc = pypiData.info.description || pypiData.info.summary || '';
    if (typeof desc === 'string') {
        const match = desc.match(/https?:\/\/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/);
        if (match && !isReservedGithubPath(match[1])) {
            return `https://github.com/${match[1]}/${cleanRepoName(match[2])}`;
        }
    }

    // 4. Dynamic Discovery: PyPI Warehouse Project HTML (extracts OIDC Publishing Repo)
    try {
        const pRes = await axios.get(`https://pypi.org/project/${encodeURIComponent(pkgName)}/`, { timeout: 3000 });
        const pubMatch = pRes.data.match(/Publishing repository[\s\S]*?href=["'](https:\/\/github\.com\/[^\/"']+\/[^\/"'\s]+)/i);
        if (pubMatch) {
            const cleaned = cleanGithubUrl(pubMatch[1]);
            if (cleaned) return cleaned;
        }
        const tabMatch = pRes.data.match(/href=["'](https:\/\/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+))["'][^>]*rel=["'][^"']*noopener/i);
        if (tabMatch && !isReservedGithubPath(tabMatch[2])) {
            const cleaned = cleanGithubUrl(tabMatch[1]);
            if (cleaned) return cleaned;
        }
    } catch (e) {}

    // 5. Dynamic Discovery: Google deps.dev Open Source Insights API
    try {
        const dRes = await axios.get(`https://api.deps.dev/v3/systems/pypi/packages/${encodeURIComponent(pkgName)}`, { timeout: 3000 });
        const versions = dRes.data.versions || [];
        const latest = versions[versions.length - 1]?.versionKey?.version;
        if (latest) {
            const vRes = await axios.get(`https://api.deps.dev/v3/systems/pypi/packages/${encodeURIComponent(pkgName)}/versions/${encodeURIComponent(latest)}`, { timeout: 3000 });
            const source = vRes.data.relatedProjects?.find(p => p.relationType === 'SOURCE_REPO');
            if (source?.projectKey?.id) {
                return `https://${source.projectKey.id}`;
            }
        }
    } catch (e) {}

    // 6. Dynamic Discovery: Crawl custom documentation homepage (e.g. numba.pydata.org)
    const homePage = pypiData.info.home_page;
    if (homePage && typeof homePage === 'string' && homePage.startsWith('http') && !homePage.includes('github.com')) {
        try {
            const hRes = await axios.get(homePage, { headers: { 'User-Agent': 'RepoVitals/1.0' }, timeout: 3000 });
            const m = hRes.data.match(/https?:\/\/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/);
            if (m && !isReservedGithubPath(m[1])) {
                return `https://github.com/${m[1]}/${cleanRepoName(m[2])}`;
            }
        } catch (e) {}
    }

    // 7. Convention fallback: owner/repo matching package name
    if (pkgName && !pkgName.includes('/')) {
        return `https://github.com/${pkgName}/${pkgName}`;
    }

    return null;
}

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

// Executes an HTTP call with retry and exponential backoff on 429, 502, and 503 errors
async function fetchWithRetry(axiosCall, maxRetries = 3, serviceName = 'API') {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await axiosCall();
        } catch (err) {
            const status = err.response?.status;
            const isRetryable = status === 429 || status === 503 || status === 502;
            if (isRetryable && attempt < maxRetries - 1) {
                const waitMs = Math.pow(2, attempt) * 2000;
                console.log(`⚠️  [${serviceName}] ${status} on attempt ${attempt + 1}. Retrying in ${waitMs}ms...`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            console.error(`❌ [${serviceName}] Failed after ${attempt + 1} attempts: ${err.message}`);
            throw err;
        }
    }
}

module.exports = {
    getGithubUrl,
    parseGithubRepo,
    calculateMedian,
    isNonTrivialCommit,
    fetchWithRetry
};
