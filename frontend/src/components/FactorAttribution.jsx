import React from 'react';
import { HelpCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, Skull } from 'lucide-react';

export default function FactorAttribution({ pkg }) {
  if (!pkg) return null;

  const das = pkg.dasDetails || {};
  const mrs = pkg.mrsDetails || {};
  const rmvs = pkg.rmvsDetails || {};

  return (
    <div className="swiss-card p-5 mb-6">
      <div className="flex items-center justify-between border-b border-[#E3DED4] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#141413]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#141413]">
            Factor Attribution & Point Diagnostics
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#6E6A63] uppercase">
          Detailed Mathematical Drivers Behind Scores
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* DAS Factors */}
        <div className="border border-[#E3DED4] bg-[#FAF8F5] p-3.5">
          <div className="text-xs font-bold uppercase text-[#141413] mb-2 font-mono flex items-center justify-between">
            <span>DAS Factors (S_dev)</span>
            <span className="text-[#6E6A63]">{(pkg.devActivityScore * 100).toFixed(1)}%</span>
          </div>
          <ul className="space-y-1.5 text-[11px] font-mono text-[#4A4742]">
            <li className="flex justify-between">
              <span>Last Commit (t_last):</span>
              <span className="font-bold text-[#141413]">{das.tLastDays ?? 'N/A'} days ago</span>
            </li>
            <li className="flex justify-between">
              <span>Recency Factor:</span>
              <span className="font-bold text-[#141413]">{das.recencyTerm ? das.recencyTerm.toFixed(3) : '0'}</span>
            </li>
            <li className="flex justify-between">
              <span>Velocity Decay:</span>
              <span className="font-bold text-[#141413]">{das.velocityDecay ? das.velocityDecay.toFixed(2) : '0'}x</span>
            </li>
            <li className="flex justify-between">
              <span>Commits (W_e / W_b):</span>
              <span className="font-bold text-[#141413]">{das.Ce ?? 0} / {das.Cb ?? 0}</span>
            </li>
          </ul>
          <div className="mt-2 text-[10px] text-[#6E6A63] border-t border-[#E3DED4] pt-1.5">
            {das.tLastDays > 730 ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <Skull className="w-3 h-3" /> Flatlined: No commit in {das.tLastDays} days
              </span>
            ) : das.velocityDecay < 0.5 ? (
              <span className="text-amber-700 font-bold">Velocity halved compared to baseline</span>
            ) : (
              <span className="text-emerald-700 font-bold">Consistent developer activity</span>
            )}
          </div>
        </div>

        {/* MRS Factors */}
        <div className="border border-[#E3DED4] bg-[#FAF8F5] p-3.5">
          <div className="text-xs font-bold uppercase text-[#141413] mb-2 font-mono flex items-center justify-between">
            <span>MRS Factors (S_resp)</span>
            <span className="text-[#6E6A63]">
              {pkg.mrsDefined ? `${(pkg.maintRespScore * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          {pkg.mrsDefined ? (
            <ul className="space-y-1.5 text-[11px] font-mono text-[#4A4742]">
              <li className="flex justify-between">
                <span>Total PRs in Window:</span>
                <span className="font-bold text-[#141413]">{mrs.totalPRs ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span>PR Resolution (R_dec):</span>
                <span className="font-bold text-[#141413]">{mrs.Rdec ? `${(mrs.Rdec * 100).toFixed(1)}%` : '0%'}</span>
              </li>
              <li className="flex justify-between">
                <span>Stale PRs (P_stale):</span>
                <span className="font-bold text-[#141413]">{mrs.Pstale ? `${(mrs.Pstale * 100).toFixed(1)}%` : '0%'}</span>
              </li>
              <li className="flex justify-between">
                <span>Open / Closed:</span>
                <span className="font-bold text-[#141413]">{mrs.openPRs ?? 0} / {mrs.closedPRs ?? 0}</span>
              </li>
            </ul>
          ) : (
            <div className="text-[11px] font-mono text-[#6E6A63] py-2">
              No PRs observed during evaluation window. Score renormalized across DAS and RMVS.
            </div>
          )}
          <div className="mt-2 text-[10px] text-[#6E6A63] border-t border-[#E3DED4] pt-1.5">
            {mrs.Pstale > 0.5 ? (
              <span className="text-red-700 font-bold">Heavy PR staleness (&gt;50% unanswered)</span>
            ) : mrs.Rdec >= 0.8 ? (
              <span className="text-emerald-700 font-bold">Fast maintainer turnaround on PRs</span>
            ) : (
              <span>Moderate maintainer responsiveness</span>
            )}
          </div>
        </div>

        {/* RMVS & Override Factors */}
        <div className="border border-[#E3DED4] bg-[#FAF8F5] p-3.5">
          <div className="text-xs font-bold uppercase text-[#141413] mb-2 font-mono flex items-center justify-between">
            <span>RMVS & Overrides</span>
            <span className="text-[#6E6A63]">{(pkg.metadataScore * 100).toFixed(1)}%</span>
          </div>
          <ul className="space-y-1.5 text-[11px] font-mono text-[#4A4742]">
            <li className="flex justify-between">
              <span>Stars / Forks:</span>
              <span className="font-bold text-[#141413]">
                {rmvs.stars ? rmvs.stars.toLocaleString() : 0} / {rmvs.forks ? rmvs.forks.toLocaleString() : 0}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Issue Penalty (I_pen):</span>
              <span className="font-bold text-[#141413]">{rmvs.I_pen ? rmvs.I_pen.toFixed(3) : '0'}</span>
            </li>
            <li className="flex justify-between">
              <span>Archival Penalty:</span>
              <span className="font-bold text-[#141413]">{rmvs.archived ? '0.3x (70% penalty)' : 'None (Active)'}</span>
            </li>
            <li className="flex justify-between">
              <span>Proof Override:</span>
              <span className="font-bold text-[#141413]">{pkg.proofOverride ? 'ACTIVE (65.0)' : 'None'}</span>
            </li>
          </ul>
          <div className="mt-2 text-[10px] text-[#6E6A63] border-t border-[#E3DED4] pt-1.5">
            {pkg.isZombie ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <Skull className="w-3 h-3" /> Zombie Dependency: Zero pulse &gt;2 yrs
              </span>
            ) : pkg.proofOverride ? (
              <span className="text-emerald-700 font-bold">Protected by Maintainer Pulse Gate</span>
            ) : (
              <span>Standard RMVS metadata weight</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
