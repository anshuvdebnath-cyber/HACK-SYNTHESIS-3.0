const axios = require('axios');

/**
 * Fetches package metadata from the official PyPI JSON API
 */
async function fetchPackageMetadata(packageName) {
    const response = await axios.get(`https://pypi.org/pypi/${packageName}/json`, {
        timeout: 10000
    });
    return response.data;
}

/**
 * PROOF OF LIFE: Fetches monthly download count from pypistats API
 */
async function fetchPypiDownloadStats(packageName) {
    const url = `https://pypistats.org/api/packages/${packageName}/recent`;
    console.log(`[PyPIStats] Fetching download stats for package: ${packageName}`);
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'RepoVitals-Audit/1.0' },
            timeout: 5000
        });
        const lastMonth = response.data?.data?.last_month || null;
        console.log(`[PyPIStats] Success for ${packageName}: last_month = ${lastMonth}`);
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
