import React from 'react';
import { Skull, HeartHandshake, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function DependencyList({ dependencies, selectedPkg, onSelectPkg }) {
  if (!dependencies || dependencies.length === 0) return null;

  const getScoreBadge = (score) => {
    if (score >= 60) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 40) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="swiss-card overflow-hidden mb-8">
      <div className="p-4 border-b border-[#E3DED4] bg-[#FFFFFF] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#141413]">
            Audited Dependencies Matrix ({dependencies.length} Packages)
          </h3>
          <p className="text-[10px] text-[#6E6A63] font-mono uppercase">
            Click any row to display its circular gauges, point diagnostics, and remediation
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E3DED4] text-[#6E6A63] uppercase text-[10px] tracking-wider">
              <th className="p-3">Package / Repository</th>
              <th className="p-3">Installed</th>
              <th className="p-3">Latest</th>
              <th className="p-3 text-right">MALTA Score</th>
              <th className="p-3">Risk Assessment</th>
              <th className="p-3">Health Indicators</th>
              <th className="p-3 text-right">Select</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3DED4] bg-[#FFFFFF]">
            {dependencies.map((pkg, idx) => {
              const isSelected = selectedPkg?.name === pkg.name;
              return (
                <tr
                  key={idx}
                  onClick={() => onSelectPkg(pkg)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F2ECE1]/70 font-semibold' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  {/* Name */}
                  <td className="p-3 text-[#141413] font-bold">
                    {pkg.name}
                  </td>

                  {/* Versions */}
                  <td className="p-3 text-[#6E6A63]">
                    {pkg.currentVersion ? `v${pkg.currentVersion}` : '—'}
                  </td>
                  <td className="p-3 text-[#6E6A63]">
                    {pkg.latestVersion ? `v${pkg.latestVersion}` : '—'}
                  </td>

                  {/* Final Score */}
                  <td className="p-3 text-right">
                    {pkg.finalScore !== null ? (
                      <span className={`inline-block px-2 py-0.5 border text-[11px] font-bold ${getScoreBadge(pkg.finalScore)}`}>
                        {pkg.finalScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-red-600">Error</span>
                    )}
                  </td>

                  {/* Risk Level */}
                  <td className="p-3">
                    <span className="text-[11px] text-[#141413]">
                      {pkg.riskLevel}
                    </span>
                  </td>

                  {/* Indicators */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pkg.isZombie && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] uppercase font-bold tracking-wider">
                          <Skull className="w-2.5 h-2.5" /> Zombie
                        </span>
                      )}
                      {pkg.proofOverride && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-700 text-white text-[9px] uppercase font-bold tracking-wider">
                          <HeartHandshake className="w-2.5 h-2.5" /> Pulse Verified
                        </span>
                      )}
                      {pkg.isDiscordant && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-600 text-white text-[9px] uppercase font-bold tracking-wider">
                          <AlertTriangle className="w-2.5 h-2.5" /> Discordant
                        </span>
                      )}
                      {!pkg.isZombie && !pkg.proofOverride && !pkg.isDiscordant && pkg.finalScore >= 60 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-700 text-white text-[9px] uppercase font-bold tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Healthy
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action arrow */}
                  <td className="p-3 text-right text-[#6E6A63]">
                    <ChevronRight className={`w-4 h-4 inline-block transition-transform ${isSelected ? 'translate-x-1 text-[#141413]' : ''}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
