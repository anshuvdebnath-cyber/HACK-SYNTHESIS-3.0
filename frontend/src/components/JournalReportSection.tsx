import { MaltaRemediationSection } from './MaltaRemediationSection';
import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  Award, 
  Clock, 
  Hash, 
  Layers, 
  ArrowLeft,
  Ghost
} from 'lucide-react';
import { MaltaAuditResult, SlideId } from '../types';

interface JournalReportSectionProps {
  auditResult: MaltaAuditResult;
  onBackToDashboard: () => void;
  onOpenCiteModal: () => void;
  currentSlide?: SlideId;
  onSelectSlide?: (slide: SlideId) => void;
}

export const JournalReportSection: React.FC<JournalReportSectionProps> = ({
  auditResult,
  onBackToDashboard,
  onOpenCiteModal,
  currentSlide = 'report',
  onSelectSlide,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);

  const markdownSummary = `# REPOVITALS MALTA HEALTH AUDIT CERTIFICATE
**Methodology:** MALTA Standard Formula: Final Score = 100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS)
**Final Score:** ${auditResult.finalScore} / 100 (${auditResult.maintenanceLevel} ${auditResult.levelEmoji})
**Audit Digest:** \`${auditResult.hash}\`
**Evaluation Timestamp:** ${auditResult.timestamp}

## The 3 Pillars Breakdown:
- **1. DAS — Development Activity (55%):** ${auditResult.pillars.das.score}/100 [Formula: min(1, λe/λb) × e^(−t_last/180)]
- **2. MRS — Maintainer Responsiveness (35%):** ${auditResult.pillars.mrs.score}/100 [Formula: R_dec × (1 − D_dec) × (1 − P_stale)]
- **3. RMVS — Metadata Viability (10%):** ${auditResult.pillars.rmvs.score}/100 [Formula: A_pen × (0.25×Stars + 0.25×Forks + 0.25×Watchers + 0.25×License)]

## The Special Sauce: Discordant Detection:
- Discordant Ghost Packages: ${auditResult.discordantDetection.discordantCount} flagged
- Rule: Version lag is LOW and Maintenance lag is HIGH (>365 days). Version says "alive", but repo is "dead".

## 5-Level Scale:
- Current Classification: ${auditResult.maintenanceLevel} ${auditResult.levelEmoji}
`;

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdownSummary);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `repovitals-malta-${auditResult.hash.substring(7, 15)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 print:space-y-6 print:pb-0 print:max-w-none print:w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Live Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={copyMarkdown}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMd ? 'Copied MD' : 'Copy MD'}</span>
          </button>
          <button
            onClick={downloadJson}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Main Journal Certificate Document Container */}
      <div className="bg-white rounded-3xl border border-slate-300/80 p-8 sm:p-12 shadow-md relative overflow-hidden font-sans print:border-none print:shadow-none print:p-0 print:overflow-visible">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-full mb-6 print:mb-4 print:h-1.5" />

        {/* Certificate Header */}
        <div className="border-b border-slate-200 pb-8 text-center sm:text-left relative">
          <div className="flex items-center justify-between gap-4 mb-5 print:mb-4">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-extrabold text-slate-900 tracking-tight text-lg">
                  RepoVitals
                </span>
                <span className="text-[10px] font-mono text-emerald-700 block tracking-widest uppercase font-bold">
                  MALTA Methodology Audit
                </span>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-500 space-y-1">
              <div>DOC REF: <span className="font-bold text-slate-700">{auditResult.hash.substring(7, 19).toUpperCase()}</span></div>
              <div>AUDIT DATE: <span className="text-slate-700">{new Date(auditResult.timestamp).toLocaleDateString()}</span></div>
            </div>
          </div>

          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            MALTA METHODOLOGY AUDIT CERTIFICATE
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight mt-2 text-slate-900">
            Certificate of Repository Maintenance &amp; Health
          </h1>

          <p className="text-xs font-mono text-slate-500 mt-2">
            Final Score = 100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS) with Discordant Ghost Detection
          </p>
        </div>

        {/* Core Verification Banner */}
        <div className="my-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 break-inside-avoid print:break-inside-avoid print:my-5 print:p-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
              MALTA MAINTENANCE LEVEL
            </span>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-0.5">
              {auditResult.maintenanceLevel} {auditResult.levelEmoji}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Mapped against the 5-Level Scale (80-100: Sustained Maintenance, 60-79: Stable, 40-59: Declining, 20-39: Probable, 0-19: Effective Abandonment).
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0 bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 block font-semibold">FINAL COMPOSITE SCORE</span>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span className="text-3xl font-display font-extrabold text-emerald-700">
                {auditResult.finalScore}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">{auditResult.levelEmoji} {auditResult.maintenanceLevel}</span>
          </div>
        </div>

        {/* 3 Pillars Breakdown Table */}
        <div className="space-y-3 mb-8 break-inside-avoid print:break-inside-avoid print:mb-4">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-800">
            Itemized 3 Pillars Evaluation
          </h3>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Pillar</th>
                  <th className="py-2.5 px-4">Mathematical Definition</th>
                  <th className="py-2.5 px-4 text-center">Weight</th>
                  <th className="py-2.5 px-4 text-right">Raw Score</th>
                  <th className="py-2.5 px-4 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    1. DAS — Development Activity
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-sans text-xs">
                    <code className="text-slate-800">min(1, λe/λb) × e^(−t_last/180)</code>. Exponential penalty for days of inactivity; drops ~63% at 180 days.
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">55%</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {auditResult.pillars.das.score} / 100
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {(0.55 * auditResult.pillars.das.score).toFixed(1)} pts
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    2. MRS — Maintainer Responsiveness
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-sans text-xs">
                    <code className="text-slate-800">R_dec × (1 − D_dec) × (1 − P_stale)</code>. Multiplicative: if any factor is bad, the whole score collapses.
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">35%</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {auditResult.pillars.mrs.score} / 100
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {(0.35 * auditResult.pillars.mrs.score).toFixed(1)} pts
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    3. RMVS — Metadata Viability
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-sans text-xs">
                    <code className="text-slate-800">A_pen × (0.25×Stars + 0.25×Forks + 0.25×Watchers + 0.25×License)</code>. Popularity, license, and activity penalty.
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">10%</td>
                  <td className="py-3 px-4 text-right font-bold text-teal-700">
                    {auditResult.pillars.rmvs.score} / 100
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {(0.10 * auditResult.pillars.rmvs.score).toFixed(1)} pts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Discordant Ghost Detection Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono mb-8 flex items-start gap-3 break-inside-avoid print:break-inside-avoid print:mb-4">
          <Ghost className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">Special Sauce: Discordant Detection</div>
            <div className="text-slate-600 mt-0.5 font-sans">
              Rule: A package is discordant when <strong>Version lag is LOW</strong> and <strong>Maintenance lag is HIGH (&gt;365 days)</strong>.
              Detected {auditResult.discordantDetection.discordantCount} discordant ghost dependencies in this repository closure.
            </div>
          </div>
        </div>

        {/* MALTA Scientific Remediation & Action Playbook */}
                {/* Bottom Sign-off Stamp for Certificate */}
        <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-3 break-inside-avoid print:break-inside-avoid print:pt-4">
          <div>Verified via MALTA Standard Evaluation Engine (Panter & Eisty, 2026)</div>
          <div className="text-slate-500 font-semibold">Deterministic Code Replicability Specification</div>
        </div>

        {/* MALTA Scientific Remediation & Action Playbook (Starts cleanly on Page 2 in Print) */}
        <div className="print:break-before-page pt-6 print:pt-0">
          <MaltaRemediationSection auditResult={auditResult} variant="report" />
        </div>
      </div>
    </div>
  );
};
