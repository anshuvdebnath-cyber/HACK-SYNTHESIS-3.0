const { osvClient } = require('../utils/clients');

/**
 * FEATURE 4: CVE DETECTION via OSV.dev
 * Queries OSV.dev for known vulnerabilities for a given package and version
 */
async function fetchVulnerabilitiesFromOSV(packageName, version) {
    const queryBody = {
        package: {
            name: packageName,
            ecosystem: "PyPI"
        }
    };

    if (version && version !== 'unknown' && version !== 'latest') {
        queryBody.version = version;
    }

    try {
        const response = await osvClient('https://api.osv.dev/v1/query', queryBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000
        });

        const vulns = response.data?.vulns || [];

        return {
            hasVulnerabilities: vulns.length > 0,
            vulnerabilityCount: vulns.length,
            vulnerabilities: vulns.slice(0, 5).map(v => ({
                id: v.id,
                summary: v.summary || v.details?.slice(0, 100) || "No summary",
                severity: v.severity?.[0]?.score || "UNKNOWN"
            }))
        };
    } catch (error) {
        return {
            hasVulnerabilities: false,
            vulnerabilityCount: 0,
            vulnerabilities: [],
            error: error.message
        };
    }
}

module.exports = {
    fetchVulnerabilitiesFromOSV
};
