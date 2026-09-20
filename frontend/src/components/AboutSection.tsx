import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  X, 
  Ghost, 
  TrendingDown, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Zap,
  Layers,
  FileCheck2
} from 'lucide-react';

interface AboutTopic {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  details: string[];
}

const PillarWeightPie: React.FC<{
  weight: number;
  color: string;
  label: string;
}> = ({ weight, color, label }) => {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (weight / 100) * circumference;

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 shadow-2xs group relative cursor-pointer shrink-0"
      title={`${label}: ${weight}% Weight (${weight} Max Pts)`}
    >
      <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
          <circle
            cx="14"
            cy="14"
            r={radius}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3.5"
          />
          <circle
            cx="14"
            cy="14"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
      <span className="text-[10px] font-mono font-bold text-slate-800">
        {weight}%
      </span>
    </div>
  );
};

export const AboutSection: React.FC = () => {
  const [activeModalTopic, setActiveModalTopic] = useState<AboutTopic | null>(null);

  const topics: AboutTopic[] = [
    {
      id: 'methodology',
      title: 'Methodology',
      subtitle: 'The MALTA Formula & 3 Pillars',
      badge: '3 PILLARS',
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      details: [
        'Master Formula: Final Score = 100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS). Bounded between 0 and 100.',
        '1. DAS — Development Activity (55%): min(1, λ_e/λ_b) × e^(−τ_last/180). Models commit velocity and the 180-day inactivity decay penalty.',
        '2. MRS — Maintainer Responsiveness (35%): R_dec × (1 − D_dec) × (1 − P_stale). Multiplicative collapse ensures hanging issues or missing docs zero out responsiveness.',
        '3. RMVS — Metadata Viability (10%): A_pen × (0.25×Stars + 0.25×Forks + 0.25×Watchers + 0.25×License). Community engagement gated by the A_pen archive penalty.'
      ]
    },
    {
      id: 'standards',
      title: 'Peer Review Standards',
      subtitle: 'Discordant Ghost Detection',
      badge: 'SPECIAL SAUCE',
      icon: <Award className="w-5 h-5 text-blue-600" />,
      details: [
        'Diagnostic Rule: Identifies packages where Version lag is LOW (installed version matches latest release) AND Maintenance lag is HIGH (zero commits in upstream repo for >365 days).',
        'Key Diagnostic: "Version says \'alive\', but the repo says \'dead\'."',
        'Protects computational reproducibility by pinpointing dependencies that silently rot without active upstream security or patch releases.',
        'Issues deterministic artifact badges and SHA-256 verification digests for submission to peer-reviewed journals.'
      ]
    },
    {
      id: 'index',
      title: 'Reproducibility Index',
      subtitle: 'The 5-Level Maintenance Scale',
      badge: '5-LEVEL SCALE',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      details: [
        '80–100: Sustained Maintenance 🟢 — Active maintainers, rapid response, zero drift assurance.',
        '60–79: Stable Maintenance 🟢 — Dependable release cadence with minor manageable issue backlog.',
        '40–59: Declining Maintenance 🟡 — Inactivity penalty accumulating, potential upstream release lag.',
        '20–39: Probable Abandonment 🟠 — High maintenance lag (>180d) and hanging unreviewed pull requests.',
        '0–19: Effective Abandonment 🔴 — Archived repository or unmaintained ghost packages with critical rot.'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy Spec',
      subtitle: 'Zero-Egress Security Model',
      badge: 'SANDBOXED',
      icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
      details: [
        'Deterministic execution runs strictly in the client sandbox without unauthorized telemetry.',
        'Private repository tokens and source code snippets are never stored, logged, or forwarded to external servers.',
        'Public repository auditing uses public git commit, release, and metadata timestamps.',
        'Computes immutable SHA-256 verification hash certifying mathematical reproducibility for Nature and ACM replication packages.'
      ]
    }
  ];

  return (
    <section className="w-full mt-10 pt-8 border-t border-slate-200/90 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Architecture &amp; Specifications
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-500">Slide 1 Master Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1.5">
            About The MALTA Score &amp; Parameter Architecture
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
          Complete mathematical reference for the MALTA weighted formula, 3 architectural pillars, parameter decay constants, and ghost repo detection.
        </p>
      </div>

      {/* 1. The MALTA Formula Master Card */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 text-xl font-mono">
              🧮
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                1. The MALTA Formula Implementation
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Final Score is 0–100. Higher score indicates higher software viability.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs font-mono font-bold self-start sm:self-auto">
            WEIGHTED ARITHMETIC
          </span>
        </div>

        {/* Master Formula Box */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-center font-mono">
          <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
            Real-Time Weighted Score Calculation
          </div>
          <div className="text-lg sm:text-2xl text-emerald-300 font-extrabold tracking-wide py-2">
            Final Score = 100 × (0.55 × DAS + 0.35 × MRS + 0.10 × RMVS)
          </div>
          <div className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mt-2 leading-relaxed">
            Composite index balancing <span className="text-emerald-400 font-semibold">Development Activity (55 pts max)</span>, <span className="text-blue-400 font-semibold">Maintainer Responsiveness (35 pts max)</span>, and <span className="text-teal-400 font-semibold">Metadata Viability (10 pts max)</span>.
          </div>
        </div>

        {/* 3 Pillars Arithmetic Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 font-mono">
          <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold">DAS (55% WEIGHT)</span>
              <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                0 – 55 pts
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              Development Activity Score
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Measures recent release cadence versus historical velocity with exponential inactivity decay.
            </p>
          </div>

          <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-400 font-bold">MRS (35% WEIGHT)</span>
              <span className="text-xs bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                0 – 35 pts
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              Maintainer Responsiveness
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Multiplicative product of issue turnaround, documentation vitality, and pending pull requests.
            </p>
          </div>

          <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-400 font-bold">RMVS (10% WEIGHT)</span>
              <span className="text-xs bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
                0 – 10 pts
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              Metadata Viability
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Community adoption (stars, forks, watchers) and OSI license presence, gated by the activity penalty.
            </p>
          </div>
        </div>
      </div>

      {/* 2. The 3 Pillars Architecture & Detailed Parameter Specifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-display text-slate-900">
            🏛️ 2. The 3 Pillars Architecture &amp; Parameter Details
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pillar 1: DAS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  PILLAR 1 (55% WEIGHT)
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  Max 55 Pts
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold font-display text-slate-900">
                  DAS — Development Activity
                </h3>
                <PillarWeightPie weight={55} color="#10b981" label="DAS Weight" />
              </div>

              <div className="mt-3 p-4 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-sm sm:text-base text-center border border-slate-800 font-bold tracking-wide shadow-xs">
                min(1, λe / λb) × e^(−τ_last / 180)
              </div>

              {/* Specific Formula Terms */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Formula Terms:
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div><strong className="text-emerald-800">min(1, λe/λb):</strong> Velocity ratio (recent vs historical, capped at 1.0)</div>
                  <div><strong className="text-emerald-800">λe:</strong> Recent velocity (past 90d release &amp; commit frequency)</div>
                  <div><strong className="text-emerald-800">λb:</strong> Baseline velocity (lifetime average commit rate)</div>
                  <div><strong className="text-emerald-800">e^(−τ_last/180):</strong> Decay multiplier (exponential inactivity penalty)</div>
                  <div><strong className="text-emerald-800">τ_last:</strong> Inactivity elapsed (days since last commit/release)</div>
                  <div><strong className="text-emerald-800">180:</strong> Half-life constant (180d inactive = ~63% score drop)</div>
                </div>
              </div>

              {/* Parameter Details */}
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950 flex items-center justify-between">
                    <span>λe / λb (Velocity Ratio)</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Bounded ≤ 1.0</span>
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    <strong>λe:</strong> Recent commit &amp; release rate over past 90 days. <br />
                    <strong>λb:</strong> Historical baseline commit velocity across project lifetime.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950 flex items-center justify-between">
                    <span>τ_last (Inactivity Elapsed)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">In Days</span>
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    Number of consecutive calendar days since the most recent commit or tagged release.
                  </p>
                </div>

                {/* 180-Day Rule Highlight */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                    <TrendingDown className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>The 180-Day Drop Rule</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans leading-relaxed mt-1">
                    At <strong>τ_last = 180 days</strong>, <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">e^(−180/180) = e^(−1) ≈ 0.368</code>. The score drops precipitously by <strong>~63%</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: MRS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  PILLAR 2 (35% WEIGHT)
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  Max 35 Pts
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold font-display text-slate-900">
                  MRS — Maintainer Responsiveness
                </h3>
                <PillarWeightPie weight={35} color="#3b82f6" label="MRS Weight" />
              </div>

              <div className="mt-3 p-4 bg-slate-900 text-blue-300 rounded-2xl font-mono text-sm sm:text-base text-center border border-slate-800 font-bold tracking-wide shadow-xs">
                R_dec × (1 − D_dec) × (1 − P_stale)
              </div>

              {/* Specific Formula Terms */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Formula Terms:
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div><strong className="text-blue-800">R_dec:</strong> Maintainer response rate (replies to issues/PRs within 14d)</div>
                  <div><strong className="text-blue-800">D_dec:</strong> Documentation decay (penalty for missing/stale documentation)</div>
                  <div><strong className="text-blue-800">(1 − D_dec):</strong> Documentation vitality (healthy usable docs remaining)</div>
                  <div><strong className="text-blue-800">P_stale:</strong> Stale backlog ratio (unaddressed/hanging issues &amp; PRs)</div>
                  <div><strong className="text-blue-800">(1 − P_stale):</strong> Resolution factor (cleanly triaged community threads)</div>
                  <div><strong className="text-rose-800">Multiplication:</strong> Collapse risk (if any factor reaches 0, MRS becomes 0)</div>
                </div>
              </div>

              {/* Parameter Details */}
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950">
                    R_dec (Responsiveness Factor)
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    Maintainer issue response cadence. Tracks whether maintainers still reply to bug reports within 14 days.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950">
                    D_dec (Documentation Decay)
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    Penalizes stale or broken documentation, missing install instructions, or outdated API guides.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950">
                    P_stale (Stale PR/Issue Ratio)
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    Fraction of community pull requests and issues left unmerged or unaddressed without resolution.
                  </p>
                </div>

                {/* Multiplicative Collapse Warning */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Multiplicative Collapse Factor</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans leading-relaxed mt-1">
                    Because terms are multiplied, if maintainers vanish, docs rot, or PRs hang, <strong>the entire MRS score collapses to zero</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3: RMVS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-teal-300 transition-all space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  PILLAR 3 (10% WEIGHT)
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  Max 10 Pts
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold font-display text-slate-900">
                  RMVS — Metadata Viability
                </h3>
                <PillarWeightPie weight={10} color="#14b8a6" label="RMVS Weight" />
              </div>

              <div className="mt-3 p-4 bg-slate-900 text-teal-300 rounded-2xl font-mono text-sm sm:text-base text-center border border-slate-800 font-bold tracking-wide shadow-xs">
                A_pen × (0.25·S + 0.25·F + 0.25·W + 0.25·L)
              </div>

              {/* Specific Formula Terms */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Formula Terms:
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div><strong className="text-teal-800">A_pen:</strong> Activity penalty gate (1.0 active, 0.0 if archived/dead)</div>
                  <div><strong className="text-teal-800">S (Stars, 25%):</strong> Log-normalized developer adoption and trust</div>
                  <div><strong className="text-teal-800">F (Forks, 25%):</strong> Ecosystem derivative work and independent code reuse</div>
                  <div><strong className="text-teal-800">W (Watchers, 25%):</strong> Developers tracking updates &amp; notifications</div>
                  <div><strong className="text-teal-800">L (License, 25%):</strong> OSI-approved open-source license presence (1.0 or 0.0)</div>
                </div>
              </div>

              {/* Parameter Details */}
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950">
                    Community Signals (S, F, W)
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    Log-normalized Stars (25%), Forks (25%), and Watchers (25%) reflecting community adoption and network resilience.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-950">
                    License Compliance (L)
                  </div>
                  <p className="text-slate-700 font-sans text-xs sm:text-sm leading-relaxed mt-1">
                    Binary check (25%) confirming presence of an OSI-approved open-source license (MIT, Apache-2.0, BSD, GPL).
                  </p>
                </div>

                {/* Activity Penalty Callout */}
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                    <Info className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>A_pen (Activity Penalty Factor)</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans leading-relaxed mt-1">
                    Set to <strong>1.0</strong> for active repositories. Drops immediately to <strong>0.0</strong> if the repository is archived, read-only, or dead — completely nullifying vanity metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Discordant Detection (Ghost Repos) & 4. The 5-Level Scale Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Ghost Repo Diagnosis */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-indigo-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                <Ghost className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-indigo-300 uppercase">
                  3. The Special Sauce
                </span>
                <h3 className="text-lg font-bold font-display text-white">
                  Discordant Detection (Ghost Repos)
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              A critical blind spot in standard security scanners is repositories that appear healthy on package managers but have been silently abandoned.
            </p>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-indigo-800/40 space-y-2.5 font-mono text-xs">
              <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
                Diagnostic Condition:
              </div>
              <div className="flex items-center gap-2.5 text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span><strong>Version lag is LOW:</strong> Installed version matches latest release.</span>
              </div>
              <div className="text-center font-bold text-indigo-400 text-[11px]">AND</div>
              <div className="flex items-center gap-2.5 text-rose-400">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center font-bold text-[10px]">!</span>
                <span><strong>Maintenance lag is HIGH:</strong> No commits in repo for &gt;365 days.</span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-indigo-900/40 border border-indigo-500/30 text-center font-display text-sm font-semibold text-white">
              &ldquo;Version says &lsquo;alive&rsquo;, but the repo says &lsquo;dead&rsquo;.&rdquo;
            </div>
          </div>
        </div>

        {/* 5-Level Scale Summary */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                4. Classification Spectrum
              </span>
              <h3 className="text-lg font-bold font-display text-slate-900">
                The 5-Level Maintenance Scale
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Standardized tiers determining long-term stability and peer-reviewed reproducibility risk.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span>🟢</span>
                  <strong className="text-emerald-900">80 – 100</strong>
                  <span className="text-emerald-800">Sustained Maintenance</span>
                </div>
                <span className="text-[10px] text-emerald-700">Zero Drift</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                <div className="flex items-center gap-2">
                  <span>🟢</span>
                  <strong className="text-emerald-900">60 – 79</strong>
                  <span className="text-emerald-700">Stable Maintenance</span>
                </div>
                <span className="text-[10px] text-emerald-700">Dependable</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2">
                  <span>🟡</span>
                  <strong className="text-amber-900">40 – 59</strong>
                  <span className="text-amber-800">Declining Maintenance</span>
                </div>
                <span className="text-[10px] text-amber-700">Accumulating Lag</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/70 border border-orange-200">
                <div className="flex items-center gap-2">
                  <span>🟠</span>
                  <strong className="text-orange-900">20 – 39</strong>
                  <span className="text-orange-800">Probable Abandonment</span>
                </div>
                <span className="text-[10px] text-orange-700">&gt;180d Stalled</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-200">
                <div className="flex items-center gap-2">
                  <span>🔴</span>
                  <strong className="text-rose-900">0 – 19</strong>
                  <span className="text-rose-800">Effective Abandonment</span>
                </div>
                <span className="text-[10px] text-rose-700">Dead / Ghost</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Standards Cards with Interactive Dialogues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => setActiveModalTopic(topic)}
            className="group bg-white/90 hover:bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                  {topic.icon}
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 group-hover:bg-emerald-100/60 group-hover:text-emerald-800 px-2 py-0.5 rounded transition-colors">
                  {topic.badge}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display group-hover:text-emerald-700 transition-colors">
                {topic.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {topic.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-700 group-hover:text-emerald-800">
              <span>Inspect specs</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Dialog */}
      {activeModalTopic && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModalTopic(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                  {activeModalTopic.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {activeModalTopic.badge}
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-0.5">
                    {activeModalTopic.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveModalTopic(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeModalTopic.details.map((paragraph, index) => (
                <div key={index} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{paragraph}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalTopic(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
