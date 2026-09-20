import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Copy, 
  Check, 
  Box, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  Ghost
} from 'lucide-react';
import { MaltaAuditResult } from '../types';
import { synthesizeRemediation, RemediationSolution } from '../utils/maltaPolicyEngine';

interface MaltaRemediationSectionProps {
  auditResult: MaltaAuditResult;
  variant?: 'dashboard' | 'report';
}

export const MaltaRemediationSection: React.FC<MaltaRemediationSectionProps> = ({
  auditResult,
  variant = 'dashboard'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const solutions: RemediationSolution[] = auditResult.dependencies.map(dep => 
    synthesizeRemediation(dep)
  );

  const discordantCount = solutions.filter(s => s.lagType === 'DISCORDANT_GHOST').length;
  const terminalCount = solutions.filter(s => s.lagType === 'TERMINAL_ABANDONED').length;
  const resolvableCount = solutions.filter(s => s.lagType === 'RESOLVABLE_DRIFT').length;

  return (
    <div className={`rounded-3xl border ${
      variant === 'report' 
        ? 'bg-slate-50/70 border-slate-200 p-6 my-8' 
        : 'bg-white border-slate-200 p-6 shadow-sm space-y-6 my-6'
    }`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Zap className="w-3 h-3 text-emerald-600" />
              PEER-REVIEWED REPRODUCIBILITY PROTOCOL
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-500">IEEE TSE / arXiv:2603.10265</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-tight">
            MALTA Scientific Remediation &amp; Action Playbook
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Differentiating <strong className="text-slate-800">Resolvable Lag</strong> (active maintainers) from <strong className="text-rose-700">Terminal Lag</strong> (upstream abandonment) with feasible, verified actions.
          </p>
        </div>

        {/* Quick Summary Pill Strip */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto shrink-0 font-mono text-[11px]">
          {discordantCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold flex items-center gap-1">
              <Ghost className="w-3 h-3" />
              <span>{discordantCount} Discordant</span>
            </span>
          )}
          {terminalCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>{terminalCount} Terminal Lag</span>
            </span>
          )}
          {resolvableCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{resolvableCount} Resolvable</span>
            </span>
          )}
        </div>
      </div>

      {/* Package-by-Package Remediation Cards */}
      <div className="space-y-4 pt-2">
        {solutions.map((sol) => {
          const cmdKey = `cmd-${sol.packageName}`;
          const snippetKey = `snippet-${sol.packageName}`;

          return (
            <div 
              key={sol.packageName}
              className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3.5"
            >
              {/* Card Header: Package Name + Lag Type Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs border border-slate-200">
                    {sol.packageName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold font-mono text-slate-900">
                        {sol.packageName}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({sol.installedVersion} {sol.latestVersion !== sol.installedVersion ? `→ ${sol.latestVersion}` : ''})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${sol.lagTypeBadgeClass}`}>
                    {sol.lagTypeLabel}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Score: {sol.maltaScore}/100
                  </span>
                </div>
              </div>

              {/* Telemetry Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">MAINTENANCE LAG:</span>
                  <span className={`font-bold ${sol.maintenanceLagDays > 365 ? 'text-rose-700' : 'text-slate-800'}`}>
                    {sol.maintenanceLagDays} days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">VERSION LAG:</span>
                  <span className="font-bold text-slate-800">
                    {sol.versionLagDays} days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STEWARDSHIP:</span>
                  <span className="font-bold text-slate-800">
                    {sol.maltaScore >= 60 ? 'Active' : sol.maltaScore >= 40 ? 'Declining' : 'Stalled'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ACTION TYPE:</span>
                  <span className="font-bold text-emerald-700">
                    {sol.primaryAction.effortBadge}
                  </span>
                </div>
              </div>

              {/* Diagnosis */}
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Diagnosis: </strong>
                {sol.diagnosis}
              </p>

              {/* Step 1: Recommended Primary Solution */}
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recommended Action: {sol.primaryAction.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold">
                    {sol.primaryAction.feasibility}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  {sol.primaryAction.description}
                </p>

                {/* Copyable Terminal Command */}
                <div className="flex items-center justify-between bg-slate-900 text-emerald-400 rounded-lg p-2 font-mono text-xs shadow-xs">
                  <span className="truncate pr-2 select-all">
                    $ {sol.primaryAction.command}
                  </span>
                  <button
                    onClick={() => copyToClipboard(cmdKey, sol.primaryAction.command)}
                    className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[10px]"
                    title="Copy command"
                  >
                    {copiedKey === cmdKey ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2: Preservation Strategy (For Terminal/Discordant/Uncommon Dependencies) */}
              {sol.preservationAction && (
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                      <Box className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Scientific Preservation: {sol.preservationAction.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded font-semibold">
                      Immutable Runtime
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    {sol.preservationAction.description}
                  </p>

                  <div className="flex items-center justify-between bg-slate-900 text-indigo-300 rounded-lg p-2 font-mono text-[11px] shadow-xs">
                    <pre className="truncate pr-2 overflow-x-auto select-all">
                      {sol.preservationAction.snippet}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(snippetKey, sol.preservationAction!.snippet)}
                      className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[10px]"
                      title="Copy snippet"
                    >
                      {copiedKey === snippetKey ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
