import React from 'react';

// Crisp SVG Circular Gauge adhering to Swiss architectural aesthetics
function CircularGauge({ value, maxValue = 100, label, sublabel, color = '#141413', isUndefined = false }) {
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const numericValue = typeof value === 'number' ? Math.min(Math.max(value, 0), maxValue) : 0;
  const strokeDashoffset = circumference - (numericValue / maxValue) * circumference;

  return (
    <div className="swiss-card p-5 flex flex-col items-center justify-between text-center relative">
      <div className="text-[11px] font-bold text-[#6E6A63] uppercase tracking-wider mb-2 font-mono">
        {label}
      </div>

      <div className="relative w-28 h-28 my-1 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#E9E5DC"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          {!isUndefined && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="square"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Value in Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isUndefined ? (
            <span className="text-xl font-bold font-mono text-[#6E6A63]">N/A</span>
          ) : (
            <>
              <span className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>
                {typeof value === 'number' ? value.toFixed(1) : value}
              </span>
              <span className="text-[10px] font-mono text-[#6E6A63] -mt-1 font-semibold">
                / {maxValue}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-[10px] text-[#6E6A63] font-mono mt-2 uppercase tracking-wide">
        {sublabel}
      </div>
    </div>
  );
}

export default function MaltaScorecard({ pkg }) {
  if (!pkg) return null;

  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 60) return '#1E5E3A'; // Swiss Forest Olive (Healthy)
    if (score >= 40) return '#B45309'; // Swiss Ochre (Moderate)
    return '#B91C1C'; // Swiss Crimson (Critical/Dead)
  };

  const finalScore = pkg.finalScore ?? 0;
  const dasScore = pkg.devActivityScore !== null ? pkg.devActivityScore * 100 : 0;
  const mrsScore = pkg.mrsDefined && pkg.maintRespScore !== null ? pkg.maintRespScore * 100 : null;
  const rmvsScore = pkg.metadataScore !== null ? pkg.metadataScore * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase font-bold tracking-wider text-[#141413] flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#141413]"></span>
          <span>Target Scorecard: {pkg.name}</span>
          <span className="text-xs font-mono font-normal text-[#6E6A63]">
            ({pkg.currentVersion ? `v${pkg.currentVersion}` : 'LaTeX Reference'})
          </span>
        </div>

        <div className="text-xs font-mono uppercase font-bold px-2 py-0.5 border border-[#E3DED4] bg-[#FFFFFF]">
          Risk: <span style={{ color: getScoreColor(finalScore) }}>{pkg.riskLevel}</span>
        </div>
      </div>

      {/* 4 Circular Gauge Cards matching User Sketch */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total MALTA Score */}
        <CircularGauge
          value={finalScore}
          maxValue={100}
          label="Total MALTA Score"
          sublabel="Aggregated Metric"
          color={getScoreColor(finalScore)}
        />

        {/* DAS (Dev Activity Score) */}
        <CircularGauge
          value={dasScore}
          maxValue={100}
          label="DAS Score"
          sublabel="S_dev: Commits & Recency"
          color={getScoreColor(dasScore)}
        />

        {/* MRS (Maintenance Responsiveness) */}
        <CircularGauge
          value={mrsScore}
          maxValue={100}
          label="MRS Score"
          sublabel={pkg.mrsDefined ? "S_resp: Pull Requests" : "Undefined (|P|=0)"}
          color={mrsScore !== null ? getScoreColor(mrsScore) : '#6E6A63'}
          isUndefined={!pkg.mrsDefined}
        />

        {/* RMVS (Repo Metadata & Community) */}
        <CircularGauge
          value={rmvsScore}
          maxValue={100}
          label="RMVS Score"
          sublabel="S_meta: Stars, Forks, Issues"
          color={getScoreColor(rmvsScore)}
        />
      </div>
    </div>
  );
}
