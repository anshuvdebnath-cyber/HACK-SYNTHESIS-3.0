// GitHub API service utilizing throttled githubClient and 5-minute memory caching
const { githubClient } = require('../utils/clients');
const { getCachedData, setCachedData } = require('../utils/cache');
const { isNonTrivialCommit } = require('../utils/helpers');

/**
 * Fetches commits from GitHub API across the MALTA observation windows
 * Raised pagination cap to 10 pages (up to 1,000 commits) to prevent understating Cb for active repositories
 */
async function fetchRepoCommitData(owner, repo, token, wbStartDate) {
    const headers = {
        'User-Agent': 'RepoVitals-Audit',
        ...(token ? { Authorization: `token ${token}` } : {})
    };

    let allCommits = [];
    let page = 1;
    const maxPages = 10;

    while (page <= maxPages) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${wbStartDate.toISOString()}&per_page=100&page=${page}`;
            // Call throttled GitHub client instead of direct axios.get
            const res = await githubClient(url, { headers, timeout: 10000 });
            if (!Array.isArray(res.data) || res.data.length === 0) break;
            allCommits.push(...res.data);
            if (res.data.length < 100) break;
            page++;
        } catch (err) {
            console.log(`Commit fetch page ${page} failed for ${owner}/${repo}: ${err.message}`);
            break;
        }
    }

    let latestCommitOverall = null;
    if (allCommits.length > 0) {
        latestCommitOverall = allCommits[0];
    } else {
        try {
            // Call throttled GitHub client for fallback check
            const res = await githubClient(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { headers, timeout: 10000 });
            if (Array.isArray(res.data) && res.data.length > 0) {
                latestCommitOverall = res.data.find(isNonTrivialCommit) || res.data[0];
            }
        } catch (err) {
            console.log(`Latest commit check failed for ${owner}/${repo}: ${err.message}`);
        }
    }

    return { allCommits, latestCommitOverall };
}

/**
 * Fetches pull requests from GitHub API for MRS calculation
 * Scopes pull requests strictly to the evaluation window [weStart, now] with pagination (Paper Section IV-D)
 */
async function fetchRepoPulls(owner, repo, token, weStart) {
    const headers = {
        'User-Agent': 'RepoVitals-Audit',
        ...(token ? { Authorization: `token ${token}` } : {})
    };

    let pulls = [];
    let page = 1;
    const maxPages = 3;

    while (page <= maxPages) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&sort=created&direction=desc&per_page=100&page=${page}`;
            // Call throttled GitHub client for pull requests
            const res = await githubClient(url, { headers, timeout: 10000 });
            if (!Array.isArray(res.data) || res.data.length === 0) break;

            let reachedOlder = false;
            for (const pr of res.data) {
                const created = new Date(pr.created_at);
                if (created >= weStart) {
                    pulls.push(pr);
                } else {
                    reachedOlder = true;
                }
            }
            if (reachedOlder || res.data.length < 100) break;
            page++;
        } catch (err) {
            console.log(`Pull request fetch page ${page} failed for ${owner}/${repo}: ${err.message}`);
            break;
        }
    }
    return pulls;
}

/**
 * Fetches repository data, commits, and pull requests with 5-minute caching
 */
async function fetchRepoDataWithCache(owner, repo, token, wbStart, weStart) {
    const cached = getCachedData(owner, repo);
    if (cached) {
        return cached;
    }

    const headers = {
        'User-Agent': 'RepoVitals-Audit',
        ...(token ? { Authorization: `token ${token}` } : {})
    };

    // 1. Fetch repo metadata via throttled GitHub client
    const ghResponse = await githubClient(`https://api.github.com/repos/${owner}/${repo}`, { headers, timeout: 10000 });
    const repoData = ghResponse.data;

    // 2. Fetch commit history
    const commitData = await fetchRepoCommitData(owner, repo, token, wbStart);

    // 3. Fetch pull requests scoped to evaluation window
    const pulls = await fetchRepoPulls(owner, repo, token, weStart);

    const freshData = {
        repoData,
        allCommits: commitData.allCommits,
        latestCommitOverall: commitData.latestCommitOverall,
        pulls
    };

    setCachedData(owner, repo, freshData);
    return freshData;
}

module.exports = {
    fetchRepoCommitData,
    fetchRepoPulls,
    fetchRepoDataWithCache
};
