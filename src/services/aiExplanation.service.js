const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * FEATURE 5: GEMINI EXPLANATION LAYER (only for phrasing, NOT facts)
 * Transforms pre-computed package facts into a concise 2-3 sentence non-technical summary
 */
async function generateAiExplanation(packageData, actionHint = '') {
    const riskLevel = packageData.riskLevel || 'Unknown';
    const finalScore = packageData.finalScore !== null && packageData.finalScore !== undefined 
        ? packageData.finalScore 
        : 'N/A';
    const fallbackString = `Risk level: ${riskLevel}. Score: ${finalScore}/100. ${actionHint || ''}`.trim();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return fallbackString;
    }

    const prompt = `You are a research software sustainability analyst. Given the JSON data below about a Python package, generate a 2-3 sentence summary for a non-technical journal editor.

STRICT RULES:
- Do NOT invent any facts. Only use data provided below.
- If a field is null or missing, do not mention it.
- Do NOT suggest specific CVEs unless they appear in the data.
- End with a clear "what to do" recommendation.

Package data:
${JSON.stringify(packageData, null, 2)}

Return ONLY a plain text summary (2-3 sentences). No markdown. No JSON.`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // 10-second timeout promise
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API call timed out after 10 seconds')), 10000)
        );

        const callModel = async () => {
            try {
                // gemini-1.5-flash as requested by user prompt
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                return await model.generateContent(prompt);
            } catch (err) {
                const isNotFound = err.message && (
                    err.message.includes('not found') || 
                    err.message.includes('404') || 
                    err.message.includes('no longer available')
                );
                if (isNotFound) {
                    const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
                    return await fallbackModel.generateContent(prompt);
                }
                throw err;
            }
        };

        const result = await Promise.race([callModel(), timeoutPromise]);
        const text = result?.response?.text()?.trim();
        return text || fallbackString;
    } catch (err) {
        console.warn(`[AI Explanation] Gemini call for ${packageData.name} fell back: ${err.message}`);
        return fallbackString;
    }
}

module.exports = {
    generateAiExplanation
};
