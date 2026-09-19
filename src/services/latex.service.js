// Extracts and sanitizes unique GitHub repository URLs from raw LaTeX manuscript text
function extractGithubUrlsFromLatex(latexContent) {
    if (!latexContent || typeof latexContent !== 'string') return [];

    // Matches GitHub repository URLs in \href, \url, plain text, and bare forms
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/gi;
    const uniqueUrls = new Set();
    let match;

    while ((match = githubRegex.exec(latexContent)) !== null) {
        let owner = match[1].trim();
        let repo = match[2].trim();

        // Strip trailing punctuation (braces, commas, periods, backslashes, brackets)
        repo = repo.replace(/[\.,;:?\}>)\]\\]+$/, '').replace(/\.git$/, '');
        owner = owner.replace(/[\.,;:?\}>)\]\\]+$/, '');

        // Validate 2 path segments after github.com and exclude reserved top-level GitHub routes
        const reserved = ['features', 'pricing', 'enterprise', 'topics', 'trending', 'collections', 'events', 'about', 'contact', 'login', 'signup'];
        if (reserved.includes(owner.toLowerCase())) {
            continue;
        }

        if (owner && repo) {
            uniqueUrls.add(`https://github.com/${owner}/${repo}`);
        }
    }

    return Array.from(uniqueUrls);
}

module.exports = {
    extractGithubUrlsFromLatex
};
