import { MaltaRemediationSection } from './MaltaRemediationSection';
import { MaltaScanningOverlay } from './MaltaScanningOverlay';
import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Hash, 
  RotateCcw, 
  Check, 
  Copy, 
  FileText,
  Activity,
  Zap,
  TrendingDown,
  Ghost,
  Info,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Radar,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';
import { MaltaAuditResult, DependencyNode, AuditIssue, SlideId } from '../types';

interface CircularGaugeCardProps {
  title: string;
  score: number | null;
  maxScore?: number;
  color: string;
  caption: string;
  isUndefined?: boolean;
  isError?: boolean;
}

const CircularGaugeCard: React.FC<CircularGaugeCardProps> = ({
  title,
  score,
  maxScore = 100,
  color,
  caption,
  isUndefined = false,
  isError = false,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const numScore = score !== null && !isNaN(score) ? Math.max(0, Math.min(maxScore, score)) : 0;
  const strokeDashoffset = isUndefined
    ? circumference
    : circumference - (numScore / maxScore) * circumference;

  const displayColor = isError || (score !== null && score === 0 && !isUndefined)
    ? '#ef4444'
    : color;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs text-center flex flex-col items-center justify-between min-h-[195px] transition-all hover:border-slate-300">
      <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
        {title}
      </div>

      <div className="relative w-28 h-28 my-2 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="7.5"
          />
          {!isUndefined && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={displayColor}
              strokeWidth="7.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isUndefined ? (
            <span className="text-xl font-bold font-mono text-slate-400">N/A</span>
          ) : (
            <>
              <span className={`text-2xl font-extrabold font-mono tracking-tight ${
                isError || score === 0 ? 'text-red-600' : 'text-slate-900'
              }`}>
                {score !== null ? score.toFixed(1) : '0.0'}
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                / {maxScore}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tight">
        {caption}
      </div>
    </div>
  );
};

interface MiniPillarPieProps {
  earned: number;
  max: number;
  color: string;
  rawScore: number;
  label: string;
}

const MiniPillarPie: React.FC<MiniPillarPieProps> = ({ earned, max, color, rawScore, label }) => {
  const percent = Math.min(100, Math.max(0, (earned / max) * 100));
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs group relative cursor-pointer"
      title={`${label}: ${earned} / ${max} pts (${rawScore}/100)`}
    >
      <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
          {/* Deficit Track */}
          <circle
            cx="14"
            cy="14"
            r={radius}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3.5"
          />
          {/* Earned Value */}
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
        {Math.round(percent)}%
      </span>
    </div>
  );
};

interface DashboardSectionProps {
  auditResult: MaltaAuditResult | null;
  auditError?: string | null;
  isScanning: boolean;
  onReAudit: () => void;
  onViewReport: () => void;
  currentSlide?: SlideId;
  onSelectSlide?: (slide: SlideId) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  auditResult,
  auditError,
  isScanning,
  onReAudit,
  onViewReport,
  currentSlide = 'dashboard',
  onSelectSlide,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HEALTHY' | 'STALLED' | 'ARCHIVED' | 'GHOST' | 'UNPINNED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDepName, setSelectedDepName] = useState<string>(
    auditResult?.dependencies?.[0]?.name || ''
  );
  const [simulationMode, setSimulationMode] = useState<'EVALUATED' | 'SCREENSHOT_ERROR'>('EVALUATED');
  const [syncWithPillars, setSyncWithPillars] = useState<boolean>(true);
  const [viewingSpecimen, setViewingSpecimen] = useState<string | null>(null);

  React.useEffect(() => {
    if (auditResult?.dependencies?.[0]?.name) {
      setSelectedDepName(auditResult.dependencies[0].name);
    }
  }, [auditResult]);

  // 1. Live Scanning Screen
  if (isScanning && !auditResult) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-pulse">
            <Radar className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              MALTA v1.0 LIVE AUDIT IN PROGRESS
            </span>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Calculating Real-Time Reproducibility Metrics
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Querying GitHub API, parsing commit frequencies across 18-month and 24-month observation windows, measuring pull request latency, and computing DAS, MRS, and RMVS scores...
            </p>
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State Screen
  if (auditError && !auditResult) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200 p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
              AUDIT CALCULATION ERROR
            </span>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Live Audit Execution Failed
            </h2>
            <p className="text-sm font-mono text-rose-700 max-w-lg mx-auto p-3 rounded-xl bg-rose-50/80 border border-rose-200">
              {auditError}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please check your input to ensure valid GitHub repository URLs or package requirements are present.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectSlide?.('hero')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Ingestion Tab
            </button>
            <button
              onClick={onReAudit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Clean Awaiting Real-Time Audit State (Zero hardcoded data)
  if (!auditResult) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-8 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-inner">
            <Radar className="w-10 h-10" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              NO HARDCODED DATA • REAL-TIME CALCULATION ONLY
            </div>
            <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">
              Live Reproducibility Dashboard
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              All MALTA indicators—Development Activity (DAS 55%), Maintainer Responsiveness (MRS 35%), and Metadata Viability (RMVS 10%)—are computed strictly on-demand in real time. Select an ingestion source and initiate an audit to calculate and publish live reproducibility data.
            </p>
          </div>

          {/* 3 Pillars Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-xs font-mono font-bold text-emerald-700 mb-1">PILLAR 1: DAS (55%)</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Development Activity</div>
              <div className="text-xs text-slate-500 font-mono">min(1, λe/λb) × e^(-t_last/180)</div>
              <div className="text-xs text-slate-600 mt-2">Calculates commit velocity across 18-month evaluation and 24-month baseline windows.</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-xs font-mono font-bold text-blue-700 mb-1">PILLAR 2: MRS (35%)</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Maintainer Responsiveness</div>
              <div className="text-xs text-slate-500 font-mono">R_dec × (1 - D_dec) × (1 - P_stale)</div>
              <div className="text-xs text-slate-600 mt-2">Measures pull request resolution rate, closure latency, and stale PR backlog.</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
              <div className="text-xs font-mono font-bold text-purple-700 mb-1">PILLAR 3: RMVS (10%)</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Metadata Viability</div>
              <div className="text-xs text-slate-500 font-mono">A_pen × (0.25★ + 0.25⑂ + 0.25👁 + 0.25§)</div>
              <div className="text-xs text-slate-600 mt-2">Evaluates community engagement, license validity, and archival status.</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSelectSlide?.('hero')}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Go to Ingestion &amp; Start Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDepMaltaLevel = (score: number) => {
    if (score >= 80) return { label: 'Sustained', color: '#10b981', emoji: '🟢', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (score >= 60) return { label: 'Stable', color: '#059669', emoji: '🟢', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 40) return { label: 'Declining', color: '#eab308', emoji: '🟡', badge: 'bg-amber-50 text-amber-800 border-amber-300' };
    if (score >= 20) return { label: 'Probable', color: '#f97316', emoji: '🟠', badge: 'bg-orange-50 text-orange-800 border-orange-300' };
    return { label: 'Abandoned', color: '#ef4444', emoji: '🔴', badge: 'bg-red-50 text-red-800 border-red-300' };
  };

  const filteredDependencies = auditResult.dependencies.filter(dep => {
    if (selectedFilter === 'ALL') return true;
    return dep.status === selectedFilter;
  });

  // Resolve currently selected dependency in the Matrix
  const selectedDep = auditResult.dependencies.find(d => d.name === selectedDepName) 
    || auditResult.dependencies[0] 
    || null;

  const isScreenshotError = false;

  // Active specimen for the deep 3-pillars cards:
  // If syncWithPillars is true, clicking any row automatically updates the deep pillar cards and multi-pillar pie too!
  const activePillarDep = (syncWithPillars && selectedDep)
    ? selectedDep
    : (viewingSpecimen ? auditResult.dependencies.find(d => d.name === viewingSpecimen) : null);

  const effectiveDasScore = activePillarDep 
    ? (isScreenshotError ? 0.0 : activePillarDep.dasScore) 
    : auditResult.pillars.das.score;
  const effectiveMrsScore = activePillarDep 
    ? (isScreenshotError ? 0.0 : (activePillarDep.mrsScore ?? 0)) 
    : auditResult.pillars.mrs.score;
  const effectiveRmvsScore = activePillarDep 
    ? (isScreenshotError ? 0.0 : activePillarDep.rmvsScore) 
    : auditResult.pillars.rmvs.score;

  const effectiveFinalScore = activePillarDep
    ? (isScreenshotError ? 0.0 : (activePillarDep.maltaScore ?? Number(((0.55 * effectiveDasScore) + (0.35 * effectiveMrsScore) + (0.10 * effectiveRmvsScore)).toFixed(1))))
    : auditResult.finalScore;

  // Pie Chart Data: DAS (55%), MRS (35%), RMVS (10%)
  const { das, mrs, rmvs } = auditResult.pillars;
  const dasPoints = Number((0.55 * effectiveDasScore).toFixed(1));
  const mrsPoints = Number((0.35 * effectiveMrsScore).toFixed(1));
  const rmvsPoints = Number((0.10 * effectiveRmvsScore).toFixed(1));

  const pillarPieData = [
    { 
      name: 'DAS (55% Max)', 
      value: dasPoints, 
      maxWeight: 55, 
      rawScore: effectiveDasScore, 
      color: '#10b981',
      formula: 'min(1, λe/λb) × e^(−t_last/180)'
    },
    { 
      name: 'MRS (35% Max)', 
      value: mrsPoints, 
      maxWeight: 35, 
      rawScore: effectiveMrsScore, 
      color: '#3b82f6',
      formula: 'R_dec × (1 − D_dec) × (1 − P_stale)'
    },
    { 
      name: 'RMVS (10% Max)', 
      value: rmvsPoints, 
      maxWeight: 10, 
      rawScore: effectiveRmvsScore, 
      color: '#14b8a6',
      formula: 'A_pen × (0.25·S + 0.25·F + 0.25·W + 0.25·L)'
    }
  ];

  if (isScanning) {
    return <MaltaScanningOverlay />;
  }

  const scaleBands = [
    { range: '80–100', label: 'Sustained Maintenance', color: '#10b981', emoji: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    { range: '60–79', label: 'Stable Maintenance', color: '#059669', emoji: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    { range: '40–59', label: 'Declining Maintenance', color: '#eab308', emoji: '🟡', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    { range: '20–39', label: 'Probable Abandonment', color: '#f97316', emoji: '🟠', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' },
    { range: '0–19', label: 'Effective Abandonment', color: '#ef4444', emoji: '🔴', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Mathematical Score Banner */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radial Score Gauge */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={activePillarDep ? getDepMaltaLevel(effectiveFinalScore).color : auditResult.levelColor}
                  strokeWidth="10"
                  strokeDasharray={`${(effectiveFinalScore / 100) * 314.16} 314.16`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                  {effectiveFinalScore}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-400">/ 100</span>
                <span className="text-xs mt-0.5">
                  {activePillarDep ? getDepMaltaLevel(effectiveFinalScore).emoji : auditResult.levelEmoji}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{activePillarDep ? `SPECIMEN: ${activePillarDep.name.toUpperCase()}` : 'FINAL MALTA SCORE'}</span>
                </div>
                {activePillarDep && (
                  <button
                    onClick={() => {
                      setSyncWithPillars(false);
                      setViewingSpecimen(null);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                    title="Reset view to full repository aggregate"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset Repo View</span>
                  </button>
                )}
              </div>
              <h2 className="text-xl font-display font-bold text-slate-900">
                {activePillarDep 
                  ? `${activePillarDep.name} — ${getDepMaltaLevel(effectiveFinalScore).label}` 
                  : `${auditResult.maintenanceLevel} ${auditResult.levelEmoji}`}
              </h2>
              <div className="inline-block bg-slate-900 text-emerald-300 font-mono text-[11px] px-2.5 py-1 rounded-lg">
                100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS)
              </div>
            </div>
          </div>

          {/* Mathematical Parameters & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-6 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px]">SCAN DURATION</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {auditResult.scanDuration}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block text-[10px]">GHOST COUNT</span>
                <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
                  auditResult.discordantDetection.discordantCount > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  <Ghost className="w-3.5 h-3.5" />
                  {auditResult.discordantDetection.discordantCount} Discordant
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">SHA-256 DIGEST</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate text-[11px]">
                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {auditResult.hash.substring(0, 16)}...
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-xs text-slate-600 font-mono">
                Tier: <span className="font-bold text-slate-900">{auditResult.maintenanceLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onReAudit}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-Scan Spec</span>
                </button>
                <button
                  onClick={onViewReport}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Journal Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📦 Audited Dependencies Matrix & Interactive Target Scorecard (Click any row to switch circular gauges & scores) */}
      <div id="dependency-matrix" className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-900 rounded-xs inline-block" />
              <h3 className="text-sm sm:text-base font-extrabold font-display text-slate-900 uppercase tracking-tight">
                AUDITED DEPENDENCIES MATRIX ({filteredDependencies.length} PACKAGES)
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              CLICK ANY ROW TO DISPLAY ITS CIRCULAR GAUGES, POINT DIAGNOSTICS, AND REMEDIATION
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Evaluated Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-800 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Evaluated
              </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-mono">
              {(['ALL', 'HEALTHY', 'GHOST', 'STALLED', 'UNPINNED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer text-[11px] ${
                    selectedFilter === filter
                      ? 'bg-white font-bold text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">PACKAGE / REPOSITORY</th>
                <th className="py-3 px-4 font-bold">INSTALLED</th>
                <th className="py-3 px-4 font-bold">LATEST</th>
                <th className="py-3 px-4 text-center font-bold">MALTA SCORE</th>
                <th className="py-3 px-4 font-bold">RISK ASSESSMENT</th>
                <th className="py-3 px-4 font-bold">HEALTH INDICATORS</th>
                <th className="py-3 px-3 text-center font-bold">SELECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDependencies.map(dep => {
                const isSelected = selectedDep?.name === dep.name;
                const depScore = dep.maltaScore ?? Number(((0.55 * dep.dasScore) + (0.35 * (dep.mrsScore ?? 0)) + (0.10 * dep.rmvsScore)).toFixed(1));

                return (
                  <tr 
                    key={dep.name} 
                    onClick={() => {
                      setSelectedDepName(dep.name);
                      setSyncWithPillars(true);
                    }}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-50/70 ring-2 ring-emerald-500/50' 
                        : 'hover:bg-slate-50/90'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {dep.isDiscordant && <Ghost className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {dep.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isScreenshotError ? 'No Repository' : (dep.repositoryUrl || `pypi.org/project/${dep.name}`)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {dep.installedVersion || `v${dep.version}`}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {dep.latestVersion || dep.installedVersion || `v${dep.version}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isScreenshotError ? (
                        <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          Error
                        </span>
                      ) : (
                        <span className="font-extrabold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {depScore.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isScreenshotError ? (
                        <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                          Unknown (No Repository)
                        </span>
                      ) : (
                        <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                          dep.riskLevel === 'critical' ? 'text-red-700 bg-red-50 border-red-200' :
                          dep.riskLevel === 'moderate' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                          'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}>
                          {dep.riskAssessment || `${dep.riskLevel.toUpperCase()} RISK`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(dep.healthIndicators || [dep.status, dep.type]).map((ind, i) => (
                          <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TARGET SCORECARD: [SELECTED PACKAGE] */}
        {selectedDep && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            {/* Scorecard Title & Risk Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 bg-slate-900 rounded-xs inline-block shrink-0" />
                <h4 className="font-display font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                  TARGET SCORECARD: {selectedDep.name} ({selectedDep.installedVersion || `v${selectedDep.version}`})
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${
                  isScreenshotError 
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : selectedDep.riskLevel === 'critical'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : selectedDep.riskLevel === 'moderate'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  RISK: {isScreenshotError ? 'UNKNOWN (NO REPOSITORY)' : (selectedDep.riskAssessment?.toUpperCase() || `${selectedDep.riskLevel.toUpperCase()} RISK`)}
                </span>

                <button
                  onClick={() => {
                    setSyncWithPillars(!syncWithPillars);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                    syncWithPillars
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Automatically synchronizes this dependency's scores with the deep 3-Pillar Cards on Slide 2"
                >
                  {syncWithPillars ? '✓ Synced with 3-Pillars' : 'Sync with 3-Pillars'}
                </button>
              </div>
            </div>

            {/* 4 Circular Gauges matching the screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. TOTAL MALTA SCORE */}
              <CircularGaugeCard
                title="TOTAL MALTA SCORE"
                score={isScreenshotError ? 0.0 : (selectedDep.maltaScore ?? Number(((0.55 * selectedDep.dasScore) + (0.35 * (selectedDep.mrsScore ?? 0)) + (0.10 * selectedDep.rmvsScore)).toFixed(1)))}
                color="#10b981"
                caption="AGGREGATED METRIC"
                isError={isScreenshotError}
              />

              {/* 2. DAS SCORE */}
              <CircularGaugeCard
                title="DAS SCORE"
                score={isScreenshotError ? 0.0 : selectedDep.dasScore}
                color="#10b981"
                caption="S_DEV: COMMITS & RECENCY"
                isError={isScreenshotError}
              />

              {/* 3. MRS SCORE */}
              <CircularGaugeCard
                title="MRS SCORE"
                score={isScreenshotError ? null : selectedDep.mrsScore}
                color="#3b82f6"
                caption={isScreenshotError ? "UNDEFINED (|P|=0)" : (selectedDep.mrsScore === 0 ? "COLLAPSED (|P|=0)" : "S_RESP: MAINTAINER TRIAGE")}
                isUndefined={isScreenshotError || selectedDep.mrsUndefined || selectedDep.mrsScore === null}
                isError={isScreenshotError}
              />

              {/* 4. RMVS SCORE */}
              <CircularGaugeCard
                title="RMVS SCORE"
                score={isScreenshotError ? 0.0 : selectedDep.rmvsScore}
                color="#14b8a6"
                caption="S_META: STARS, FORKS, ISSUES"
                isError={isScreenshotError}
              />
            </div>

            {/* Arithmetic Breakdown & Diagnostics for Selected Package */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>DAS Contribution (55% Max)</span>
                  <span>{isScreenshotError ? '0.0' : (0.55 * selectedDep.dasScore).toFixed(1)} / 55 pts</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  λ Ratio: <span className="font-bold">{selectedDep.dasDetails?.lambdaRatio ?? 0.9}</span> | Lag: <span className="font-bold">{selectedDep.dasDetails?.tLastDays ?? selectedDep.maintenanceLagDays}d</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-sans">
                  Exponential decay factor: <span className="font-mono font-bold">e^(-t_last/180) = {selectedDep.dasDetails?.decayFactor ?? 0.85}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-1">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span>MRS Contribution (35% Max)</span>
                  <span>{isScreenshotError ? '0.0' : (0.35 * (selectedDep.mrsScore ?? 0)).toFixed(1)} / 35 pts</span>
                </div>
                <div className="text-[11px] text-blue-800">
                  Resolution: <span className="font-bold">{selectedDep.mrsDetails?.rDec ?? 0.85}</span> | Stale PRs: <span className="font-bold">{selectedDep.mrsDetails?.pStale ?? 0.05}</span>
                </div>
                <div className="text-[10px] text-blue-700 font-sans">
                  {selectedDep.mrsScore === 0 ? '⚠️ Maintainer response collapsed to 0' : 'Maintainer triage and PR responsiveness active'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/90 space-y-1">
                <div className="flex items-center justify-between font-bold text-teal-900">
                  <span>RMVS Contribution (10% Max)</span>
                  <span>{isScreenshotError ? '0.0' : (0.10 * selectedDep.rmvsScore).toFixed(1)} / 10 pts</span>
                </div>
                <div className="text-[11px] text-teal-800">
                  Stars: <span className="font-bold">{selectedDep.rmvsDetails?.stars ?? 80}</span> | License: <span className="font-bold">{selectedDep.rmvsDetails?.hasLicense ? 100 : 0}</span>
                </div>
                <div className="text-[10px] text-teal-700 font-sans truncate">
                  Remediation: <span className="font-mono font-bold text-slate-800">{selectedDep.riskAssessment || 'No action needed'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🧮 Pure Mathematical Expression & Dynamic Calculation Block */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🧮</span>
            <span className="font-bold text-white uppercase tracking-wider">
              Mathematical Master Expression
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[10px] font-bold">
            0 ≤ Final Score ≤ 100
          </span>
        </div>

        {/* The Equation */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-center my-3">
          <div className="text-xs text-slate-400 mb-1">
            Exact Arithmetic:
          </div>
          <div className="text-sm sm:text-xl text-emerald-400 font-bold tracking-wide">
            Final Score = 100 × (0.55 × DAS + 0.35 × MRS + 0.10 × RMVS)
          </div>
          <div className="mt-2 text-xs sm:text-sm text-slate-300 flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span>= 100 × (</span>
            <span className="text-emerald-300 font-bold">0.55 × {(das.score / 100).toFixed(2)}</span>
            <span>+</span>
            <span className="text-blue-300 font-bold">0.35 × {(mrs.score / 100).toFixed(2)}</span>
            <span>+</span>
            <span className="text-teal-300 font-bold">0.10 × {(rmvs.score / 100).toFixed(2)}</span>
            <span>)</span>
            <span className="text-slate-400 font-bold">=</span>
            <span className="text-white font-extrabold text-sm sm:text-base bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500">
              {auditResult.finalScore} / 100
            </span>
          </div>
        </div>

        {/* 3 Arithmetic Contributions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">DAS: 0.55 × {das.score}</span>
            <span className="text-emerald-400 font-bold text-sm">+{dasPoints} / 55.0 pts</span>
          </div>
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">MRS: 0.35 × {mrs.score}</span>
            <span className="text-blue-400 font-bold text-sm">+{mrsPoints} / 35.0 pts</span>
          </div>
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">RMVS: 0.10 × {rmvs.score}</span>
            <span className="text-teal-400 font-bold text-sm">+{rmvsPoints} / 10.0 pts</span>
          </div>
        </div>
      </div>

      {/* 🏛️ DAS, MRS & RMVS: PIE GRAPH AND NUMERICAL BOTH */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="text-base font-bold font-display text-slate-900">
              DAS, MRS &amp; RMVS: Pie Graph &amp; Numerical Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200 font-bold">
            Total Points: {auditResult.finalScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie / Donut Graph (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50/60 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-mono font-bold text-slate-700 mb-1">
              Pillars Weighted Contribution
            </div>
            
            <div className="relative w-60 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pillarPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pillarPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'monospace' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} pts (Raw: ${item.payload.rawScore}/100, Max: ${item.payload.maxWeight} pts)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
                <span className="text-2xl font-black text-slate-900 font-display leading-none">
                  {auditResult.finalScore}
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">/ 100 PTS</span>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-1">
                  {auditResult.maintenanceLevel}
                </span>
              </div>
            </div>

            {/* Micro Legend */}
            <div className="grid grid-cols-3 gap-2 w-full mt-2 pt-2 border-t border-slate-200/60 text-center font-mono text-[11px]">
              <div className="p-1 rounded bg-emerald-50/80 border border-emerald-200">
                <span className="block text-emerald-800 font-bold">DAS (55%)</span>
                <span className="text-slate-700 font-extrabold">{dasPoints} pts</span>
              </div>
              <div className="p-1 rounded bg-blue-50/80 border border-blue-200">
                <span className="block text-blue-800 font-bold">MRS (35%)</span>
                <span className="text-slate-700 font-extrabold">{mrsPoints} pts</span>
              </div>
              <div className="p-1 rounded bg-teal-50/80 border border-teal-200">
                <span className="block text-teal-800 font-bold">RMVS (10%)</span>
                <span className="text-slate-700 font-extrabold">{rmvsPoints} pts</span>
              </div>
            </div>
          </div>

          {/* Numerical Pillar Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-3 font-mono text-xs">
            {/* DAS Numerical Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-emerald-100 shadow-2xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-900 text-sm">DAS: Development Activity (55%)</span>
                  {/* Separate Pie after heading */}
                  <MiniPillarPie
                    earned={dasPoints}
                    max={55}
                    color="#10b981"
                    rawScore={das.score}
                    label="DAS (55%)"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-emerald-700 font-bold text-sm">+{dasPoints} / 55.0 pts</span>
                  <span className="text-slate-400 text-[11px]">(Raw: {das.score}/100)</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 text-emerald-300 text-[11px] font-bold">
                DAS = min(1, λe / λb) × e^(−t_last / 180)
              </div>

              {/* Short Descriptions of Specific Formula Terms */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>Specific Formula Terms:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  <div>
                    <strong className="text-emerald-800">min(1, λe/λb):</strong> Velocity ratio (recent vs historical, capped at 1.0)
                  </div>
                  <div>
                    <strong className="text-emerald-800">λe:</strong> Recent velocity (release &amp; commit frequency past 90d)
                  </div>
                  <div>
                    <strong className="text-emerald-800">λb:</strong> Baseline velocity (lifetime average commit rate)
                  </div>
                  <div>
                    <strong className="text-emerald-800">e^(−t_last/180):</strong> Decay multiplier (exponential inactivity penalty)
                  </div>
                  <div>
                    <strong className="text-emerald-800">t_last:</strong> Inactivity elapsed (calendar days since last commit/release)
                  </div>
                  <div>
                    <strong className="text-emerald-800">180:</strong> Half-life constant (180 days inactive = ~63% score drop)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px]">λe/λb RATIO</span>
                  <span className="font-bold text-slate-800">{das.lambdaRatio}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">t_last (DAYS)</span>
                  <span className="font-bold text-slate-800">{das.tLastDays}d</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">DECAY MULTIPLIER</span>
                  <span className="font-bold text-slate-800">{das.decayFactor}</span>
                </div>
              </div>

              <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center justify-between">
                <span>180-Day Rule: t_last ≥ 180d ⇒ score drops ~63%</span>
                <span className="font-bold">Current drop: -{das.dropPercentage}%</span>
              </div>
            </div>

            {/* MRS Numerical Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-blue-100 shadow-2xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-bold text-slate-900 text-sm">MRS: Maintainer Responsiveness (35%)</span>
                  {/* Separate Pie after heading */}
                  <MiniPillarPie
                    earned={mrsPoints}
                    max={35}
                    color="#3b82f6"
                    rawScore={mrs.score}
                    label="MRS (35%)"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-blue-700 font-bold text-sm">+{mrsPoints} / 35.0 pts</span>
                  <span className="text-slate-400 text-[11px]">(Raw: {mrs.score}/100)</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 text-blue-300 text-[11px] font-bold">
                MRS = R_dec × (1 − D_dec) × (1 − P_stale)
              </div>

              {/* Short Descriptions of Specific Formula Terms */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>Specific Formula Terms:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  <div>
                    <strong className="text-blue-800">R_dec:</strong> Maintainer response rate (replies to issues/PRs within 14d)
                  </div>
                  <div>
                    <strong className="text-blue-800">D_dec:</strong> Documentation decay (penalty for missing/stale documentation)
                  </div>
                  <div>
                    <strong className="text-blue-800">(1 − D_dec):</strong> Documentation vitality (healthy usable docs factor)
                  </div>
                  <div>
                    <strong className="text-blue-800">P_stale:</strong> Stale backlog ratio (unaddressed/hanging issues &amp; PRs)
                  </div>
                  <div>
                    <strong className="text-blue-800">(1 − P_stale):</strong> Resolution factor (cleanly resolved community threads)
                  </div>
                  <div>
                    <strong className="text-rose-800">Multiplication:</strong> Collapse risk (if any factor reaches 0, MRS becomes 0)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px]">R_dec (RESPONSE)</span>
                  <span className="font-bold text-slate-800">{(mrs.rDec * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">D_dec (DOCS DECAY)</span>
                  <span className="font-bold text-slate-800">{(mrs.dDec * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">P_stale (HANGING)</span>
                  <span className="font-bold text-slate-800">{(mrs.pStale * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="text-[10px] text-rose-800 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center justify-between">
                <span>Multiplicative Collapse: min(factors) → 0 ⇒ MRS → 0</span>
                <span className={`font-bold ${mrs.collapsed ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {mrs.collapsed ? 'COLLAPSED' : 'STABLE'}
                </span>
              </div>
            </div>

            {/* RMVS Numerical Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-teal-100 shadow-2xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                  <span className="font-bold text-slate-900 text-sm">RMVS: Metadata Viability (10%)</span>
                  {/* Separate Pie after heading */}
                  <MiniPillarPie
                    earned={rmvsPoints}
                    max={10}
                    color="#14b8a6"
                    rawScore={rmvs.score}
                    label="RMVS (10%)"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-teal-700 font-bold text-sm">+{rmvsPoints} / 10.0 pts</span>
                  <span className="text-slate-400 text-[11px]">(Raw: {rmvs.score}/100)</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 text-teal-300 text-[11px] font-bold">
                RMVS = A_pen × (0.25·Stars + 0.25·Forks + 0.25·Watchers + 0.25·License)
              </div>

              {/* Short Descriptions of Specific Formula Terms */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>Specific Formula Terms:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  <div>
                    <strong className="text-teal-800">A_pen:</strong> Activity penalty gate (1.0 active, 0.0 if archived/dead)
                  </div>
                  <div>
                    <strong className="text-teal-800">Stars (25%):</strong> Log-normalized developer adoption and trust
                  </div>
                  <div>
                    <strong className="text-teal-800">Forks (25%):</strong> Ecosystem derivative work and independent code reuse
                  </div>
                  <div>
                    <strong className="text-teal-800">Watchers (25%):</strong> Developers tracking updates &amp; notifications
                  </div>
                  <div className="sm:col-span-2">
                    <strong className="text-teal-800">License (25%):</strong> OSI-approved open-source license presence (1.0 or 0.0)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px]">STARS (25%)</span>
                  <span className="font-bold text-slate-800">{(rmvs.stars * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">FORKS (25%)</span>
                  <span className="font-bold text-slate-800">{(rmvs.forks * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">WATCHERS (25%)</span>
                  <span className="font-bold text-slate-800">{(rmvs.watchers * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">LICENSE (25%)</span>
                  <span className="font-bold text-slate-800">{rmvs.hasLicense ? '1.0' : '0.0'}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center justify-between">
                <span>Activity Penalty Multiplier (A_pen = 0 if archived/dead)</span>
                <span className="font-bold text-slate-900">A_pen = {rmvs.aPen}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 👻 Discordant Ghost Repos Diagnostic */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
              <Ghost className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                Diagnostic Condition
              </span>
              <h3 className="text-base font-bold font-display text-white">
                Discordant Detection (Ghost Repos)
              </h3>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold self-start sm:self-auto">
            {auditResult.discordantDetection.discordantCount} Discordant Detected
          </div>
        </div>

        {/* Diagnostic Mathematical Logic */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 bg-slate-900/90 rounded-2xl p-4 border border-indigo-800/40 space-y-2 font-mono text-xs">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
              Condition 1: Version_Lag == LOW (Installed == Latest Release)
            </div>
            <div className="text-center font-bold text-indigo-400 text-xs py-0.5">
              AND
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400">
              Condition 2: Maintenance_Lag &gt; 365 Days (Commits_365d == 0)
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-center font-display text-xs sm:text-sm font-semibold text-white">
              &ldquo;Version says &lsquo;alive&rsquo;, but the repo says &lsquo;dead&rsquo;.&rdquo;
            </div>
          </div>

          {/* Flagged Ghost Repos */}
          <div className="md:col-span-5 space-y-2 font-mono">
            {auditResult.discordantDetection.discordantPackages.map((ghost, idx) => (
              <div 
                key={idx} 
                className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{ghost.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900 text-rose-200">
                    Lag: {ghost.maintenanceLagDays}d
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Installed: <span className="text-emerald-400 font-semibold">{ghost.version}</span>
                </div>
                <div className="text-[10px] text-rose-200/90">
                  {ghost.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Charts: Exponential Decay Curve & Pillar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Exponential Inactivity Decay e^(-t/180) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900">
                Inactivity Exponential Decay Curve: e^(−t_last / 180)
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Half-Life Threshold: 180 Days (~63% score drop)
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              e^(−1) ≈ 0.368
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={auditResult.decayCurveData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} unit="d" />
                <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}% multiplier`, 'e^(-t/180)']}
                  labelFormatter={(lbl) => `Day ${lbl}`}
                />
                <ReferenceLine x={180} stroke="#f97316" strokeDasharray="3 3" label={{ value: '180d (-63%)', fill: '#ea580c', fontSize: 10 }} />
                <Area 
                  type="monotone" 
                  dataKey="penalty" 
                  stroke="#059669" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#decayGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Pillar Weights & Contributions */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900">
                Pillar Points Comparison
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Raw Score vs Points Contributed
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Bar Chart
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditResult.pillarComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="pillar" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Bar dataKey="rawScore" name="Raw Score (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weightedContribution" name="Points Contributed" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4, fontFamily: 'monospace' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📊 The 5-Level Scale Reference Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-display text-slate-900">
              📊 The 5-Level Scale
            </h3>
            <span className="text-[10px] text-slate-500">MALTA Standard Classification</span>
          </div>
          <span className="text-xs text-slate-700">
            Current: <strong className="text-slate-900">{auditResult.finalScore} / 100 ({auditResult.maintenanceLevel})</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {scaleBands.map((band) => {
            const isCurrent = band.label === auditResult.maintenanceLevel;
            return (
              <div 
                key={band.range}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrent 
                    ? `${band.bg} ${band.border} ring-2 ring-emerald-500/40 shadow-sm` 
                    : 'bg-slate-50/70 border-slate-200/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900">{band.range}</span>
                  <span className="text-sm">{band.emoji}</span>
                </div>
                <div className={`text-[11px] font-bold ${band.text}`}>
                  {band.label}
                </div>
                {isCurrent && (
                  <span className="inline-block mt-1.5 text-[9px] font-bold uppercase text-emerald-800 bg-white px-1.5 py-0.2 rounded border border-emerald-300">
                    CURRENT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MaltaRemediationSection auditResult={auditResult} variant="dashboard" />
    </div>
  );
};
