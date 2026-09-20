const axios = require('axios');

const MALTA_SYSTEM_PROMPT = `You are an expert software engineer and academic reproducibility auditor specializing in dependency health and the MALTA framework (Panter & Eisty, IEEE TSE / arXiv:2603.10265, 2026).

Analyze the provided array of software dependencies and their live calculated MALTA metrics.
For EVERY dependency, you must output a structured, actionable remediation object.

CRITICAL PAPER PRINCIPLES & CONSTRAINTS:
1. RESOLVABLE LAG: Upstream is actively maintained (DAS >= 60, recent commits, responsive maintainers), but project has version drift. Prescribe a safe upgrade path.
2. TERMINAL LAG: Upstream maintenance has ceased (DAS ≈ 0, maintenance lag > 365 days, or archived). No future update path exists.
3. DISCORDANT GHOST: Version lag is low/zero, but maintenance lag is high (>365 days). Version currency masks abandonment.
4. NO HALLUCINATIONS:
   - NEVER invent or guess fake package names.
   - For common packages with verified successors (e.g. pycrypto -> pycryptodome, pymorphy2 -> pymorphy3, sklearn -> scikit-learn), recommend the real successor.
   - For uncommon or custom research packages with NO known successor, DO NOT invent one. Instead, output primaryAction as a transitive hash freeze (pip-compile --generate-hashes) and preservationAction as an era-matched Docker container based on maintenanceLagDays (e.g. maintenanceLag > 1800d -> python:3.8-slim-buster).

OUTPUT SCHEMA (JSON ARRAY of objects):
[
  {
    "packageName": "string",
    "installedVersion": "string",
    "latestVersion": "string",
    "lagType": "DISCORDANT_GHOST" | "TERMINAL_ABANDONED" | "RESOLVABLE_DRIFT" | "SUSTAINED_HEALTHY",
    "lagTypeLabel": "string",
    "lagTypeBadgeClass": "string (tailwind classes, e.g. bg-purple-50 text-purple-800 border-purple-300)",
    "maltaScore": number,
    "maintenanceLagDays": number,
    "versionLagDays": number,
    "diagnosis": "concise 1-2 sentence root-cause diagnosis based on the metrics",
    "primaryAction": {
      "title": "string",
      "description": "string",
      "command": "string (executable CLI command)",
      "feasibility": "string",
      "effortBadge": "string"
    },
    "preservationAction": {
      "title": "string",
      "description": "string",
      "snippet": "string (multi-line Dockerfile or lockfile snippet)",
      "type": "docker" | "git" | "lock"
    }
  }
]
`;

async function synthesizeLiveRemediation(dependencies) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    console.log('ℹ️  GEMINI_API_KEY not set in .env; using local MALTA heuristic fallback.');
    return null;
  }

  // Sanitize and condense payload to minimize token consumption
  const payload = dependencies.map(dep => ({
    name: dep.name,
    installedVersion: dep.installedVersion || dep.version || 'latest',
    latestVersion: dep.latestVersion || dep.version || 'latest',
    maltaScore: dep.maltaScore ?? dep.finalScore ?? 50,
    maintenanceLagDays: dep.maintenanceLagDays || 0,
    versionLagDays: dep.versionLagDays || 0,
    isDiscordant: Boolean(dep.isDiscordant),
    isZombie: Boolean(dep.isZombie),
    isArchived: Boolean(dep.rmvsDetails && dep.rmvsDetails.archived),
    dasScore: dep.dasScore || 0,
    mrsScore: dep.mrsScore || 0,
    repositoryUrl: dep.repositoryUrl || null
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: `${MALTA_SYSTEM_PROMPT}\n\nINPUT AUDITED DEPENDENCIES TELEMETRY:\n${JSON.stringify(payload, null, 2)}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.0,
      responseMimeType: "application/json"
    }
  };

  try {
    const startTime = Date.now();
    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 25000
    });

    const elapsed = Date.now() - startTime;
    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0) {
      const text = candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      console.log(`✨ Gemini AI live remediation generated for ${parsed.length} packages in ${elapsed}ms`);
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn(`⚠️ Gemini remediation call failed: ${err.message}`);
    return null;
  }
}

module.exports = {
  synthesizeLiveRemediation
};
