import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Radar } from 'lucide-react';

const AUDIT_STAGES = [
  {
    step: 1,
    title: '1. Upstream Registry & Metadata Extraction',
    formula: 'PyPI JSON API ⟶ Canonical VCS Mapping',
    description: 'Resolving release versions, homepage URLs, dependencies, and GitHub repository origins...'
  },
  {
    step: 2,
    title: '2. Development Activity Score (DAS)',
    formula: 'S_dev = min(1, λ_E / λ_B) × e^(-t_last / 180)',
    description: 'Analyzing non-trivial commit velocity in We (18m) & Wb (24m) windows with recency decay...'
  },
  {
    step: 3,
    title: '3. Maintainer Responsiveness Score (MRS)',
    formula: 'S_resp = R_dec × (1 - D_dec) × (1 - P_stale)',
    description: 'Benchmarking pull request resolution rate, decision timeliness, and open staleness penalties...'
  },
  {
    step: 4,
    title: '4. Repository Viability Score (RMVS)',
    formula: 'S_meta = A_pen × [0.25·S* + 0.25·F* + 0.25·W* + 0.25·(1 - I*)]',
    description: 'Evaluating star/fork adoption momentum, open issue ratio, and archival safety factors...'
  },
  {
    step: 5,
    title: '5. MALTA Synthesis & Ghost Detection',
    formula: 'Score = 100 × (0.55·DAS + 0.35·MRS + 0.10·RMVS)',
    description: 'Verifying mature sustained overrides (≥1M downloads) and flagging zombie abandonment gates...'
  }
];

export const MaltaScanningOverlay: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    // Advance through the stages smoothly to provide real-time visual progress feedback
    const interval = setInterval(() => {
      setActiveStage(prev => {
        if (prev < AUDIT_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 850);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round(((activeStage + 1) / AUDIT_STAGES.length) * 100));

  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 p-6 sm:p-10 text-center shadow-xl my-4 max-w-2xl mx-auto transition-all duration-300">
      <div className="space-y-6">
        {/* New Scientific Radar Gyroscope Logo */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/50 animate-[spin_8s_linear_infinite]" />
          
          {/* Middle pulsing glow ring */}
          <div className="absolute inset-2 rounded-full border border-teal-400/60 animate-ping opacity-30" />
          
          {/* Middle counter-rotating ring */}
          <div className="absolute inset-2 rounded-full border border-emerald-400/40 animate-[spin_5s_linear_infinite_reverse]" />

          {/* Core glowing scientific badge */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 shadow-[0_0_25px_rgba(16,185,129,0.45)] flex items-center justify-center text-white">
            <Radar className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        {/* Heading & Aggregate Formula */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold mb-2 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE BACKEND AUDIT PIPELINE
          </span>
          <h2 className="text-2xl sm:text-2.5xl font-black font-display text-slate-900 tracking-tight">
            Evaluating MALTA Formula
          </h2>
          <p className="font-mono text-xs text-emerald-700 bg-emerald-50/80 py-1 px-3.5 rounded-full inline-block mt-2 border border-emerald-200/80 shadow-2xs">
            100 × (0.55 × DAS + 0.35 × MRS + 0.10 × RMVS)
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-600 px-1">
            <span className="font-semibold text-emerald-800">
              Stage {activeStage + 1} of {AUDIT_STAGES.length}: {AUDIT_STAGES[activeStage].title}
            </span>
            <span className="font-bold text-emerald-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Progression List with Smooth Transitions */}
        <div className="space-y-2.5 text-left">
          {AUDIT_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStage;
            const isActive = idx === activeStage;

            return (
              <div
                key={stage.step}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-50/90 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20 translate-x-1'
                    : isCompleted
                    ? 'bg-white border-slate-200/80 opacity-90'
                    : 'bg-slate-50/60 border-slate-200/50 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform duration-200 scale-105">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-700 flex items-center justify-center shadow-xs animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-400 flex items-center justify-center text-[10px] font-mono">
                        {stage.step}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4
                        className={`text-xs sm:text-sm font-bold font-display ${
                          isActive
                            ? 'text-emerald-950'
                            : isCompleted
                            ? 'text-slate-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {stage.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-emerald-200/80 text-emerald-900'
                            : isCompleted
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {stage.formula}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] mt-0.5 transition-all duration-200 ${
                        isActive
                          ? 'text-emerald-800 font-medium'
                          : isCompleted
                          ? 'text-slate-500 font-mono text-[10px]'
                          : 'text-slate-400 font-mono text-[10px]'
                      }`}
                    >
                      {stage.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
