# REPOVITAL: MALTA Scientific Software Health & Reproducibility Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v5.0-646cff.svg)](https://vitejs.dev/)
[![MALTA Framework](https://img.shields.io/badge/Paper-arXiv%3A2603.10265-purple.svg)](https://arxiv.org/abs/2603.10265)

An end-to-end, academic-grade dependency health and software reproducibility auditing platform. Powered by the **MALTA (Maintenance-Aware Technical Lag and Technical Abandonment)** mathematical framework (*Panter & Eisty, 2026*), RepoVitals evaluates software repositories, dependency manifests, and peer-reviewed LaTeX manuscripts to identify upstream abandonment, stale maintainer responses, and discordant ghost dependencies.

---

## Table of Contents
1. [Overview & The Ghost Dependency Problem](#overview--the-ghost-dependency-problem)
2. [The MALTA Mathematical Framework](#the-malta-mathematical-framework)
   - [Pillar 1: Development Activity Score (DAS)](#1-development-activity-score-das--weight-055)
   - [Pillar 2: Maintainer Responsiveness Score (MRS)](#2-maintainer-responsiveness-score-mrs--weight-035)
   - [Pillar 3: Release & Metadata Viability Score (RMVS)](#3-release--metadata-viability-score-rmvs--weight-010)
   - [The Master Composite Score & 5-Level Scale](#the-master-composite-score--5-level-scale)
   - [Special Sauce: Discordant Ghost Detection](#special-sauce-discordant-ghost-detection)
   - [Proof of Life Exemption](#proof-of-life-exemption)
3. [System Architecture](#system-architecture)
4. [Ingestion Modalities](#ingestion-modalities)
   - [1. Dependency Manifests (requirements.txt)](#1-dependency-manifests-requirementstxt)
   - [2. Public GitHub Repositories](#2-public-github-repositories)
   - [3. Peer-Reviewed LaTeX Manuscripts (.tex)](#3-peer-reviewed-latex-manuscripts-tex)
5. [AI Remediation Playbook Engine](#ai-remediation-playbook-engine)
6. [Rate-Limiting & High-Availability Architecture](#rate-limiting--high-availability-architecture)
7. [Reproducibility Certificate & Print Engine](#reproducibility-certificate--print-engine)
8. [Real Research Benchmark Datasets](#real-research-benchmark-datasets)
9. [API Specification & Endpoints](#api-specification--endpoints)
10. [Getting Started & Installation](#getting-started--installation)
11. [Environment Configuration](#environment-configuration)
12. [Academic Citation](#academic-citation)

---

## Overview & The Ghost Dependency Problem

Traditional software engineering metrics rely heavily on **Version Lag** (the difference between the installed package version and the latest published release). However, empirical studies reveal a severe vulnerability in this paradigm: **Discordant Ghost Dependencies**.

> **The Discordant Trap:**  
> A software project pins a package to version `1.2.0`. The package registry reports that `1.2.0` is indeed the latest version available (Version Lag = 0 days). Traditional tools mark this package as 100% "Healthy". In reality, the upstream maintainer abandoned the repository 3 years ago, pull requests are ignored, and zero security patches have been shipped. The version is current only because no one is alive to publish a newer one.

RepoVitals solves this by crawling active upstream telemetry (commits, pull request cycle times, issue turnaround, and archival metadata) to construct a holistic, mathematically rigorous multi-pillar score.

---

## The MALTA Mathematical Framework

The platform implements the complete formulation from *Panter & Eisty (2026)*:

### 1. Development Activity Score (DAS) — Weight: 0.55
DAS quantifies whether an open-source project is maintaining its historical development momentum or undergoing velocity decay:
- **Baseline Window ($W_b$):** 24 months preceding the evaluation window ($t - 42\text{ mo}$ to $t - 18\text{ mo}$).
- **Evaluation Window ($W_e$):** Most recent 18 months ($t - 18\text{ mo}$ to $t$).

$$\lambda_b = \frac{C_b}{24}, \quad \lambda_e = \frac{C_e}{18}$$

$$\text{Velocity Ratio } V_d = \begin{cases} 1.0 & \text{if } \lambda_b = 0 \text{ and } \lambda_e > 0 \\ 0.0 & \text{if } \lambda_b = 0 \text{ and } \lambda_e = 0 \\ \min\left(1.0, \frac{\lambda_e}{\lambda_b}\right) & \text{otherwise} \end{cases}$$

$$\text{Recency Decay } R_t = e^{-t_{\text{last}} / 180}$$

$$S_{\text{dev}} = V_d \cdot R_t$$

*Where $t_{\text{last}}$ is the elapsed time (in days) since the most recent non-trivial commit. The half-life decay threshold of 180 days ensures that projects without recent activity drop by approximately 63% in score.*

---

### 2. Maintainer Responsiveness Score (MRS) — Weight: 0.35
MRS measures how actively maintainers engage with contributor contributions (pull requests opened within $W_e$):

$$S_{\text{resp}} = R_{\text{dec}} \cdot (1 - D_{\text{dec}}) \cdot (1 - P_{\text{stale}})$$

- **Decision Rate ($R_{\text{dec}}$):** Ratio of closed or merged PRs to total PRs opened in $W_e$.
- **Decision Delay Penalty ($D_{\text{dec}}$):** Log-scaled penalty on median resolution latency:
  $$D_{\text{dec}} = \min\left(1.0, \frac{\ln(\text{median days to decision} + 1)}{\ln(365)}\right)$$
- **Stale Backlog Penalty ($P_{\text{stale}}$):** Proportion of open PRs exceeding 90 days without maintainer interaction.

> **Undefined MRS Handling & Renormalization:**  
> If $|P_{W_e}| = 0$ (no pull requests were submitted in the last 18 months), MRS is treated as **undefined**. Rather than penalizing a project for having zero inbound PRs, the engine dynamically renormalizes the composite weights across the observed signals:
> $$\text{Final Score} = \frac{0.55 \cdot S_{\text{dev}} + 0.10 \cdot S_{\text{meta}}}{0.55 + 0.10} \times 100$$

---

### 3. Release & Metadata Viability Score (RMVS) — Weight: 0.10
RMVS computes community viability and repository health from log-saturated metrics:

$$S^* = \min\left(1.0, \frac{\ln(\text{stars} + 1)}{\ln(10000)}\right), \quad F^* = \min\left(1.0, \frac{\ln(\text{forks} + 1)}{\ln(5000)}\right)$$

$$W^* = \min\left(1.0, \frac{\ln(\text{watchers} + 1)}{\ln(1000)}\right), \quad L^* = \begin{cases} 1.0 & \text{if valid OSI license present} \\ 0.0 & \text{otherwise} \end{cases}$$

$$S_{\text{meta}} = A_{\text{pen}} \cdot \left(0.25 S^* + 0.25 F^* + 0.25 W^* + 0.25 L^*\right)$$

*If the GitHub repository is marked as `archived: true`, the archival penalty multiplier $A_{\text{pen}} = 0.3$ is applied immediately.*

---

### The Master Composite Score & 5-Level Scale

$$\text{Final Score} = 100 \times \left(0.55 \cdot S_{\text{dev}} + 0.35 \cdot S_{\text{resp}} + 0.10 \cdot S_{\text{meta}}\right)$$

| Score Range | Classification Tier | Indicator | Meaning |
| :--- | :--- | :---: | :--- |
| **80 – 100** | **Sustained Maintenance** | 🟢 | Thriving open-source ecosystem, rapid review turnaround, active development. |
| **60 – 79** | **Stable Maintenance** | 🟢 | Reliable codebase, predictable release cadence, moderate response times. |
| **40 – 59** | **Declining Maintenance** | 🟡 | Slowing commit velocity, mounting PR backlog, elevated maintenance lag. |
| **20 – 39** | **Probable Abandonment** | 🟠 | Severe triage latency, near-zero commits in $W_e$, high regression risk. |
| **0 – 19** | **Effective Abandonment** | 🔴 | Archived, dead repository, critical unpatched security liability. |

---

### Special Sauce: Discordant Ghost Detection
A dependency is flagged with `isDiscordant: true` when:
$$\text{Version\_Lag} \le 0 \quad \land \quad \text{Maintenance\_Lag} > 365\text{ days}$$
*(The package manager says you are on the latest version, but the upstream source code has had 0 commits in over a year).*

---

### Proof of Life Exemption
To prevent stable, foundational libraries (such as `requests`, `scipy`, or `urllib3`) from being penalized during quiet development cycles, RepoVitals cross-references the **PyPI Stats API**:
- If monthly downloads exceed **100,000**, the package is granted a *Proof of Life Override*, capping false-positive abandonment penalties while preserving raw activity visibility.

---

## 🏗️ System Architecture

```text
HACK-SYNTHESIS-3.0/
├── app.js                          # Express entry point (Port 3003)
├── package.json                    # Backend dependencies and scripts
├── .env                            # Environment variables (GitHub & Gemini keys)
├── src/
│   ├── controllers/
│   │   └── audit.controller.js     # Audit orchestration, proof-of-life & timeout circuit breaker
│   ├── routes/
│   │   └── audit.routes.js         # API endpoints (/api/audit, /api/audit-latex, /api/remediation)
│   ├── services/
│   │   ├── github.service.js       # GitHub commit and pull request fetcher with 5-min caching
│   │   ├── pypi.service.js         # PyPI package data, version lag, and download statistics
│   │   ├── latex.service.js        # Regex extractor and sanitizer for LaTeX manuscripts
│   │   └── remediation.service.js  # Google Gemini AI remediation client & fallback synthesis
│   └── utils/
│       ├── malta.js                # Core mathematical implementation of DAS, MRS, RMVS
│       ├── clients.js              # Throttled HTTP client with 5-layer HTTP 429 rate limiter
│       ├── cache.js                # In-memory TTL cache
│       └── helpers.js              # Commit filters and date parsing
└── frontend/
    ├── package.json                # Frontend dependencies (React, Vite, Tailwind, Lucide, Recharts)
    ├── vite.config.ts              # Vite configuration with proxy to Port 3003
    └── src/
        ├── App.tsx                 # Root component and slide state management
        ├── types.ts                # TypeScript interfaces for MALTA metrics and ingestion
        ├── components/
        │   ├── HeroSection.tsx            # 3 Ingestion modalities (Manifest, GitHub, LaTeX)
        │   ├── DashboardSection.tsx       # Live real-time dashboard and 3-pillar breakdown
        │   ├── JournalReportSection.tsx   # Formal reproducibility certificate with @media print layout
        │   ├── MaltaRemediationSection.tsx # AI Remediation Playbook
        │   ├── TopNav.tsx                 # Navigation bar and global audit button
        │   ├── BottomDock.tsx             # Interactive slide selector
        │   └── AboutSection.tsx           # Academic paper summary and architecture guide
        └── utils/
            ├── liveAuditBridge.ts   # Native FormData bridge connecting frontend to backend API
            └── maltaPolicyEngine.ts # Panter & Eisty (2026) deterministic remediation policy rules
```

---

## 📥 Ingestion Modalities

RepoVitals accepts input across three distinct research and engineering modalities:

### 1. Dependency Manifests (`requirements.txt`)
- Drag & drop or paste standard Python package manifests.
- Extracts pinned versions (e.g., `transformers>=4.28.1`, `torch==2.1.0`).
- Fetches PyPI release dates, computes Version Lag against the latest release, and crawls linked GitHub repositories to calculate MALTA scores.

### 2. Public GitHub Repositories
- Accepts raw repository URLs (e.g., `https://github.com/tatsu-lab/stanford_alpaca`) or repository slugs (`owner/repo`).
- Evaluates commit velocity, issue turnaround times, and PR resolution metrics across 18-month and 24-month observation windows.

### 3. Peer-Reviewed LaTeX Manuscripts (`.tex`)
- Upload complete LaTeX paper sources (`.tex`).
- **Regex Extraction & Sanitization:** Employs `/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/gi` to discover repository URLs in `\url{}`, `\href{}{}`, plain footnotes, and BibTeX entries.
- Strips LaTeX syntax artifacts, trailing punctuation (`}, .\`), and filters out reserved top-level GitHub routes (`/pricing`, `/features`).
- Verifies whether software cited in preprints and published papers is actively maintained or abandoned post-publication.

---

## 🤖 AI Remediation Playbook Engine

When an audit detects packages with **Probable Abandonment**, **Effective Abandonment**, or **Discordant Ghost** statuses, RepoVitals synthesizes an actionable remediation playbook:

1. **Gemini Live AI Remediation (`/api/remediation`):**
   - Sends the dependency metadata closure to Google's Gemini generative AI model.
   - Generates step-by-step migration commands, active fork recommendations, and containerization isolation scripts.
2. **Deterministic Academic Fallback (`maltaPolicyEngine.ts`):**
   - Implements Panter & Eisty (2026) remediation taxonomy:
     - **Triage Action:** Pin to verified commit SHA / Fork active community branch.
     - **Containerization Strategy:** Dockerfile hermetic sandbox with pinned Python interpreter.
     - **Migration Alternatives:** Verified active drops-in replacements (e.g., `urllib3` → `httpx`).

---

## 🛡️ Rate-Limiting & High-Availability Architecture

Crawling dozens of repositories simultaneously can trigger GitHub's secondary rate limits (**HTTP 429 Too Many Requests**). RepoVitals implements a robust **5-Layer Shield**:

1. **In-Memory TTL Caching (`cache.js`):** 5-minute memory caching on repository metadata, commits, and pull requests to eliminate redundant calls.
2. **Axios Client Throttling with Jitter (`clients.js`):** Enforces rate-limiting gaps between outbound calls and parses `Retry-After` headers.
3. **Exponential Backoff:** Automatically catches 403/429 responses and retries requests with exponential backoff and randomized jitter.
4. **Sequential Execution Queue:** LaTeX audits with multiple repository citations are processed sequentially rather than in burst concurrency.
5. **30-Second Circuit Breaker:** Each repository evaluation is wrapped in a 30-second circuit breaker with an error fallback, preventing slow endpoints from blocking the entire pipeline.

---

## 📜 Reproducibility Certificate & Print Engine

RepoVitals includes a dedicated peer-review certificate generator ([JournalReportSection.tsx](frontend/src/components/JournalReportSection.tsx)):
- **Cryptographic Audit Digest:** Calculates a SHA-256 digest over the audited dependency closure for tamper-proof verification.
- **Publication-Grade Print Layout:** Fully customized `@media print` CSS layout:
  - **Page 1:** Formal Certificate of Software Reproducibility with Master Score and 3 Pillars.
  - **Page 2:** Complete Actionable Remediation Playbook.
  - Fully styled with `page-break-inside: avoid` for clean PDF export.

---

## 🧪 Real Research Benchmark Datasets

The repository includes genuine, non-fabricated research files in the root folder to benchmark all 3 ingestion methods:

| Benchmark File | Origin / Research Lab | Description |
| :--- | :--- | :--- |
| [`real_stanford_alpaca_requirements.txt`](real_stanford_alpaca_requirements.txt) | **Stanford CRFM** (*Taori et al., 2023*) | Official dependencies from Stanford's Alpaca instruction-tuning paper. |
| [`real_whisper_requirements.txt`](real_whisper_requirements.txt) | **OpenAI** (*Radford et al., 2022*) | Official environment requirements from OpenAI's Whisper speech paper. |
| [`real_reproducibility_paper_mue-x.tex`](real_reproducibility_paper_mue-x.tex) | **arXiv Preprint** (KORRO Research) | Full LaTeX manuscript citing `KorroAi/mue-x`, `Significant-Gravitas/AutoGPT`, `Aider-AI/aider`, and `crewAIInc/crewAI`. |
| [`real_reproducibility_paper_minia.tex`](real_reproducibility_paper_minia.tex) | **INRIA / CNRS** (*Chikhi et al.*) | Real computational biology manuscript citing `GATB/gatb-minia-pipeline`, `GATB/bcalm`, `dib-lab/khmer`, and `marekkokot/KMC`. |

---

## 📡 API Specification & Endpoints

### 1. Audit Requirements Manifest
`POST /api/audit`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "requirements": "numpy==1.24.3\ntorch>=2.0.0"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "count": 2,
    "source": "requirements.txt",
    "dependencies": [
      {
        "name": "numpy",
        "currentVersion": "1.24.3",
        "latestVersion": "1.26.4",
        "devActivityScore": 0.88,
        "maintRespScore": 0.82,
        "metadataScore": 0.95,
        "finalScore": 86.6,
        "riskLevel": "Sustained Maintenance",
        "maintenanceLagDays": 12,
        "isDiscordant": false
      }
    ]
  }
  ```

### 2. Audit LaTeX Manuscript
`POST /api/audit-latex`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:** `file`: `manuscript.tex` (Binary or plain text)
- **Response (200 OK):** Returns evaluated MALTA scores for all GitHub repositories cited in the paper.

### 3. AI Remediation Synthesis
`POST /api/remediation`
- **Headers:** `Content-Type: application/json`
- **Body:** `{ "dependencies": [ ... ] }`
- **Response (200 OK):** Returns step-by-step remediation plans and migration scripts.

### 4. Health Check
`GET /api/test-pypi`
- Validates PyPI and upstream network connectivity.

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git**

### 1. Clone the repository
```bash
git clone https://github.com/anshuvdebnath-cyber/HACK-SYNTHESIS-3.0.git
cd HACK-SYNTHESIS-3.0
```

### 2. Install dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Setup environment variables
Create a `.env` file in the project root:
```ini
PORT=3003
GITHUB_TOKEN=your_personal_github_token_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```
*(A personal GitHub token increases rate limits from 60 to 5,000 requests per hour).*

### 4. Run the application
- **Start Backend Server (Port 3003):**
  ```bash
  npm start
  ```
- **Start Frontend Application (Port 5050):**
  ```bash
  cd frontend
  npm run dev
  ```
- Open **`http://localhost:5050`** in your browser.

---

## ⚙️ Environment Configuration

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3003` | Port for Express backend service. |
| `GITHUB_TOKEN` | Recommended | `null` | GitHub Personal Access Token (PAT) for 5,000 req/hr rate limits. |
| `GEMINI_API_KEY` | Optional | `null` | Google Gemini API key for live AI remediation synthesis. |
| `NODE_ENV` | No | `development` | Node environment mode (`development` / `production`). |

---

## 📚 Academic Citation

If you use RepoVitals or the MALTA framework in academic research or technical audits, please cite:

```bibtex
@article{panter2026malta,
  title   = {MALTA: Maintenance-Aware Technical Lag and Technical Abandonment in Software Ecosystems},
  author  = {Panter, K. and Eisty, N.},
  journal = {arXiv preprint arXiv:2603.10265},
  year    = {2026}
}
```

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
