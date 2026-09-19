# 🩺 RepoVitals

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%207.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

**Don’t let your research die in silence.**  
RepoVitals detects ghost repositories, silent build decay, and unseeded dependency drift before they compromise peer-reviewed reproducibility.

[Live Demo](#) · [Report Bug](https://github.com/iammrmitra-6/RepoVitalFrontend/issues) · [Request Feature](https://github.com/iammrmitra-6/RepoVitalFrontend/issues)

</div>

---

## 📖 Overview

Scientific software and computational reproducibility face a silent threat: **unmaintained upstream dependencies and ghost repositories**. A project may install cleanly today, yet rely on upstream libraries whose maintainers have abandoned development, leaving unresolved CVEs and deprecated API surfaces.

**RepoVitals** provides a mathematical audit engine powered by the **MALTA (Maintenance & Longevity Temporal Assessment)** framework to evaluate dependency vitality, detect discordant ghost packages, and generate Nature-standard reproducibility certificates.

---

## 🧮 The MALTA Mathematical Framework

The **MALTA Score** quantifies repository vitality into a single normalized index ($0 \le \text{Score} \le 100$) evaluated across three core pillars:

$$\text{Final Score} = 100 \times \Big( 0.55 \times \text{DAS} + 0.35 \times \text{MRS} + 0.10 \times \text{RMVS} \Big)$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MALTA MASTER FORMULA                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   1. DAS (55%)   :  min(1, λe / λb) × exp(−t_last / 180)               │
│   2. MRS (35%)   :  R_dec × (1 − D_dec) × (1 − P_stale)                │
│   3. RMVS (10%)  :  A_pen × (0.25·Stars + 0.25·Forks + 0.25·W + 0.25·L) │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. DAS — Development Activity Score (55% Weight)
$$\text{DAS} = \min\left(1, \frac{\lambda_e}{\lambda_b}\right) \times e^{-\frac{t_{\text{last}}}{180}}$$
- **$\lambda_e / \lambda_b$**: Ratio of recent commit velocity ($\lambda_e$, past 90 days) to baseline lifetime velocity ($\lambda_b$), capped at 1.0.
- **$t_{\text{last}}$**: Elapsed calendar days since the last upstream commit or release.
- **$180$-Day Half-Life**: Exponential decay penalizing repositories inactive for $>180$ days ($\sim 63\%$ penalty drop).

### 2. MRS — Maintainer Responsiveness Score (35% Weight)
$$\text{MRS} = R_{\text{dec}} \times (1 - D_{\text{dec}}) \times (1 - P_{\text{stale}})$$
- **$R_{\text{dec}}$**: Maintainer response rate to community issues and PRs within 14 days.
- **$D_{\text{dec}}$**: Documentation decay and staleness penalty.
- **$P_{\text{stale}}$**: Proportion of unresolved, hanging pull requests and issues.
- **Multiplicative Collapse**: If any single factor drops to 0, the maintainer score collapses to 0.

### 3. RMVS — Repository Metadata & Viability Score (10% Weight)
$$\text{RMVS} = A_{\text{pen}} \times \left(0.25 \cdot \text{Stars} + 0.25 \cdot \text{Forks} + 0.25 \cdot \text{Watchers} + 0.25 \cdot \text{License}\right)$$
- **$A_{\text{pen}}$**: Activity penalty gate ($1.0$ if active, $0.0$ if archived or marked deprecated).
- Log-normalized community adoption metrics + OSI-approved open source license validation.

---

## 🚦 5-Level Maintenance Scale

| Score Range | Classification | Status Indicator | Description |
|:---:|:---|:---:|:---|
| **80 – 100** | **Sustained Maintenance** | 🟢 | Active upstream commits, rapid maintainer response, vibrant community |
| **60 – 79** | **Stable Maintenance** | 🟢 | Periodic releases, stable API surface, healthy documentation |
| **40 – 59** | **Declining Maintenance** | 🟡 | Decreasing commit frequency, accumulating PR backlog, mild staleness |
| **20 – 39** | **Probable Abandonment** | 🟠 | High inactivity ($>180\text{d}$), unanswered issues, elevated risk |
| **0 – 19** | **Effective Abandonment** | 🔴 | Archived repository, zero maintainer presence, critical ghost risk |

---

## ✨ Key Features

- **🚀 Flexible Specification Modes**:
  - Direct GitHub repository inspection.
  - Manifest file upload/pasting (`requirements.txt`, `package.json`, `environment.yml`, `pyproject.toml`).
  - Raw code and import tree parsing.
- **👻 Discordant Ghost Repository Detection**:
  - Flags packages with *low version lag* (latest version installed) but *high maintenance lag* ($>365$ days since last commit).
- **📊 Interactive Mathematical Analytics**:
  - Radial gauges, half-life decay curves, weighted pillar contribution pie charts, and radar graphs.
- **📜 Nature-Standard Reproducibility Certificate**:
  - Detailed scientific report with cryptographic audit hash, JSON export, and printable certificate view.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualizations & Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- `npm` or `pnpm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iammrmitra-6/RepoVitalFrontend.git
   cd RepoVitalFrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📂 Project Structure

```
repovitals/
├── public/                # Static public assets
├── src/
│   ├── components/        # React UI components
│   │   ├── AboutSection.tsx         # Detailed MALTA formula & 3 pillars breakdown
│   │   ├── BottomDock.tsx           # Floating slide navigation bar
│   │   ├── CiteModal.tsx            # Academic BibTeX citation modal
│   │   ├── DashboardSection.tsx     # Live mathematical dashboard & charts
│   │   ├── HeroSection.tsx          # Manifest upload & specification inputs
│   │   ├── JournalReportSection.tsx # Scientific reproducibility report & certificate
│   │   └── TopNav.tsx               # Top branding and actions header
│   ├── data/
│   │   └── mockData.ts              # Preset sample repositories & benchmarks
│   ├── utils/
│   │   └── maltaEngine.ts           # Core MALTA score calculation engine
│   ├── types.ts                     # TypeScript definitions & data models
│   ├── App.tsx                      # Main application container
│   ├── index.css                    # Tailwind CSS v4 design tokens & keyframes
│   └── main.tsx                     # Vite React entrypoint
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📜 Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Starts the Vite development server on `http://localhost:3000` |
| `npm run build` | Bundles and optimizes the production build into `dist/` |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the production build locally |

---

## 📄 Citation

If you use RepoVitals or the MALTA framework in your research, please cite:

```bibtex
@article{repovitals2026malta,
  title={MALTA: A Mathematical Framework for Quantifying Dependency Vitality and Ghost Repositories in Scientific Software},
  author={RepoVitals Research Initiative},
  journal={Journal of Open Source Software & Reproducibility},
  year={2026},
  url={https://github.com/iammrmitra-6/RepoVitalFrontend}
}
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
