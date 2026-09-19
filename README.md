# REPOVITAL

An advanced dependency health and software abandonment auditing backend powered by the **MALTA (Maintenance-Aware Technical Lag and Technical Abandonment)** framework (arXiv:2603.10265v1).

---

## 🚀 Overview

Traditional dependency metrics (like Version Lag) suffer from a critical blind spot: they cannot distinguish between actively maintained packages and abandoned packages whose versions are simply frozen. 

This engine implements the full mathematical **MALTA** framework alongside real-world enhancements to accurately classify dependencies into five maintenance health tiers:
1. **Sustained Maintenance** (80–100)
2. **Stable Maintenance** (60–79)
3. **Declining Maintenance** (40–59)
4. **Probable Abandonment** (20–39)
5. **Effective Abandonment** (0–19)

---

## 🔬 Core Framework & Methodology

### 1. Development Activity Score (DAS) — Weight: 0.55
Evaluates non-trivial commit frequency across a 24-month baseline window ($W_b$) and an 18-month evaluation window ($W_e$), combined with an exponential recency decay:
$$S_{dev} = \min(1, D_c) \cdot e^{-t_{last} / 180}$$

### 2. Maintainer Responsiveness Score (MRS) — Weight: 0.35
Measures PR decision responsiveness, timeliness, and staleness penalties strictly scoped to pull requests opened during the evaluation window ($W_e$):
$$S_{resp} = R_{dec} \cdot (1 - D_{dec}) \cdot (1 - P_{stale})$$
*When no pull requests exist in $W_e$ ($|P| = 0$), MRS is treated as undefined and the score is automatically renormalized over observed signals.*

### 3. Repository Metadata Viability Score (RMVS) — Weight: 0.10
Log-saturated signals of stars, forks, watchers, and open issues ($I_{pen}$):
$$S_{meta} = A_{pen} \cdot (0.25 S^* + 0.25 F^* + 0.25 W^* + 0.25 I_{pen})$$
*Archived repositories receive an empirical policy down-weight factor of $A_{pen} = 0.3\times$.*

### 4. Discordant Package Detection
Detects packages that appear version-current (Version Lag $\le 0$) but suffer from upstream abandonment (Final Score $< 40$), flagging them with `isDiscordant: true`.

### 5. Proof of Life Override
Leverages the PyPI Stats API to prevent misclassifying mature, stable, high-download libraries (e.g., Flask, Seaborn) as abandoned if monthly downloads exceed 100,000.

---

## 🏗️ Architecture & Project Structure

The project follows a clean, modular Express architecture:

```text
HACK-SYNTHESIS-3.0/
├── app.js                         # Application entry point & Express configuration
├── package.json                   # Dependencies and scripts
├── .gitignore                     # Excludes .env and node_modules
├── test.http                      # Pre-configured test suite for Port 3003
└── src/
    ├── controllers/
    │   └── audit.controller.js    # Request parsing, orchestrator, Proof-of-Life check
    ├── routes/
    │   └── audit.routes.js        # API endpoints: GET /api/test-pypi, POST /api/audit
    ├── services/
    │   ├── github.service.js      # GitHub commit & PR fetcher with 5-minute caching
    │   ├── malta.service.js       # Mathematical DAS, MRS, RMVS & Final Score formulas
    │   └── pypi.service.js        # PyPI metadata & PyPIStats download counter
    └── utils/
        ├── cache.js               # 5-minute in-memory caching engine
        └── helpers.js             # Parsers, array median, non-trivial commit filters
```

---

## 🛠️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
GITHUB_TOKEN=your_personal_access_token_here
PORT=3003
```

### 3. Start the Server
```bash
npm start
```
The server will boot on `http://localhost:3003`.

---

## 📡 API Endpoints

### 1. `GET /api/test-pypi`
Fast health check verifying outbound connectivity to the PyPI registry.

### 2. `POST /api/audit`
Audits a list of dependencies supplied in `requirements.txt` format.

#### Request Body:
```json
{
  "requirements": "numpy==1.19.5\nrequests==2.31.0\nflask==2.3.0"
}
```

#### Response:
```json
{
  "count": 3,
  "dependencies": [
    {
      "name": "numpy",
      "currentVersion": "1.19.5",
      "latestVersion": "2.5.3",
      "finalScore": 90.6,
      "riskLevel": "Sustained Maintenance",
      "isDiscordant": false,
      "proofOverride": false,
      "dasDetails": { ... },
      "mrsDetails": { ... },
      "rmvsDetails": { ... }
    }
  ]
}
```
