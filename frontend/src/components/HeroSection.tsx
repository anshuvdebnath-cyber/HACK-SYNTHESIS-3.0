import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Code2, 
  Cpu, 
  CheckCircle2, 
  Network, 
  ShieldCheck, 
  Radar, 
  ArrowRight, 
  Lock, 
  FileCode, 
  Sparkles,
  Check,
  AlertTriangle
} from 'lucide-react';
import { AuditInput, InputMode, PresetRepo, SlideId } from '../types';
import { PRESETS } from '../data/mockData';

interface HeroSectionProps {
  input: AuditInput;
  setInput: React.Dispatch<React.SetStateAction<AuditInput>>;
  onStartAudit: () => void;
  isScanning: boolean;
  currentSlide: SlideId;
  onSelectSlide: (slide: SlideId) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  input,
  setInput,
  onStartAudit,
  isScanning,
  currentSlide,
  onSelectSlide,
}) => {
  const [activeTab, setActiveTab] = useState<'remote_direct' | 'code_inspect'>('remote_direct');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = (preset: PresetRepo) => {
    setInput({
      ...input,
      mode: 'github',
      repoUrl: preset.name,
      branch: preset.branch,
      manifestContent: preset.sampleManifest,
      codeContent: preset.sampleCode,
      presetId: preset.id,
      manifestFileName: 'requirements.txt'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput({
        ...input,
        mode: 'manifest',
        manifestContent: content,
        manifestFileName: file.name
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput({
        ...input,
        mode: 'manifest',
        manifestContent: content,
        manifestFileName: file.name
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      {/* Hero Top: Grid with Copy & 3D Dependency Specimen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-3">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-display font-bold text-slate-900 tracking-tight leading-[1.08] max-w-2xl">
            Don’t let your research{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
              die in silence.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            RepoVitals detects ghost repositories, silent build decay, and unseeded dependency drift before they compromise peer-reviewed reproducibility.
          </p>

          {/* Micro Meta Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-md border border-slate-200/70 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deterministic Replay</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-md border border-slate-200/70 shadow-2xs">
              <Network className="w-3.5 h-3.5 text-purple-600" />
              <span>Transitive Ghost Graphs</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-md border border-slate-200/70 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Nature Protocols Compatible</span>
            </span>
          </div>
        </div>

        {/* Right Column: Stylized 3D Dependency Ghost Visual (5 Cols) */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] py-4">
          {/* Ambient Spectral Rings */}
          <div className="absolute w-72 h-72 rounded-full border border-purple-300/40 bg-purple-50/20 blur-[1px] animate-pulse-ring" />
          <div className="absolute w-56 h-56 rounded-full border border-emerald-300/40 bg-emerald-50/20 blur-[1px]" />

          {/* Center Floating Specimen / Ghost Container */}
          <div className="relative z-10 animate-float-ghost flex flex-col items-center">
            {/* 3D Frosted Ghost Capsule */}
            <div className="relative w-38 h-46 rounded-3xl bg-white/90 backdrop-blur-xl p-5 border border-slate-200/90 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] flex flex-col items-center justify-between">
              {/* Spectral Ring Beacon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 via-teal-50 to-purple-100 flex items-center justify-center shadow-inner border border-white">
                <Cpu className="w-6 h-6 text-emerald-600" />
              </div>

              {/* Glowing Heartbeat Specimen */}
              <div className="w-full flex flex-col items-center gap-1.5">
                <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-pulse" />
                </div>
                <span className="font-mono text-[10px] text-slate-400 font-semibold tracking-wider">
                  HOST: CONTAINER_01
                </span>
              </div>

              {/* Specimen Badge */}
              <div className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-mono text-[9px] font-bold">
                MALTA WATCH v1.0
              </div>
            </div>

            {/* Dependency Connective Floating Diagnostic Tags */}
            {/* Tag 1: pycrypto (Critical/Archived) */}
            <div className="absolute -left-12 top-4 animate-tag-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-rose-200 shadow-sm text-rose-700 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>pycrypto: <strong className="font-bold">ARCHIVED</strong></span>
              </div>
            </div>

            {/* Tag 2: torch (Healthy) */}
            <div className="absolute -right-10 top-10 animate-tag-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-emerald-200 shadow-sm text-emerald-800 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>torch: <strong className="font-bold">HEALTHY</strong></span>
              </div>
            </div>

            {/* Tag 3: scikit-survival (Stalled) */}
            <div className="absolute -bottom-4 right-0 animate-tag-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-purple-200 shadow-sm text-purple-800 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span>scikit-survival: <strong className="font-bold">STALLED</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Mode Selector Sub-header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Input Methodology:
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setActiveTab('remote_direct')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'remote_direct'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Repository Link &amp; Manifest Spec
            </button>
            <button
              onClick={() => setActiveTab('code_inspect')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'code_inspect'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Code Inspector</span>
            </button>
          </div>
        </div>

        {input.presetId && (
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-block">
            Loaded: {input.presetId}
          </span>
        )}
      </div>

      {/* Input Section (Dual-Action Cards Side-by-Side Bento or Direct Code Inspector) */}
      {activeTab === 'remote_direct' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card A: Upload Manifest Spec */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Upload Manifest Spec</h3>
                </div>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                  METHOD: DIRECT
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Drop your local lockfile or package inventory to generate immediate ghost dependency risk maps.
              </p>

              {/* Dotted Drag Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-emerald-50/30 hover:border-emerald-400'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".txt,.yml,.yaml,.lock,.toml"
                />
                <div className="w-10 h-10 mb-2 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Drag &amp; drop package file here, or{' '}
                  <span className="text-emerald-600 underline">Browse Files</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Supports <span className="font-semibold text-slate-700">requirements.txt</span>,{' '}
                  <span className="font-semibold text-slate-700">environment.yml</span>,{' '}
                  <span className="font-semibold text-slate-700">pyproject.toml</span>
                </p>

                {input.manifestFileName && (
                  <div className="mt-3 px-3 py-1 rounded-md bg-emerald-100/70 text-emerald-800 text-xs font-mono font-medium flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Loaded: {input.manifestFileName}</span>
                  </div>
                )}
              </div>

              {/* Direct Manifest Text Editor */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase">
                    Or Edit Packages Manifest Directly:
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">1 package per line</span>
                </div>
                <textarea
                  rows={3}
                  value={input.manifestContent || ''}
                  onChange={(e) => {
                    setInput({
                      ...input,
                      mode: 'manifest',
                      manifestFileName: 'requirements.txt',
                      manifestContent: e.target.value
                    });
                  }}
                  placeholder={`numpy==1.19.5\nseaborn==0.13.2\npymorphy2==0.9.1`}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Quick Presets & Format Badges */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">.txt</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">.yml</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">poetry.lock</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInput({
                      ...input,
                      mode: 'manifest',
                      manifestFileName: 'requirements.txt',
                      manifestContent: `numpy==1.19.5\nseaborn==0.13.2\npymorphy2==0.9.1\n`
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  ⚡ Load 3 Packages (numpy, seaborn, pymorphy2)
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Paste GitHub Repository URL */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Paste GitHub Repository URL</h3>
                </div>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                  METHOD: REMOTE VCS
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Directly crawl continuous integration artifacts, lockfiles, and git commit history from any public repository.
              </p>

              {/* Input + Branch Group */}
              <div className="space-y-3">
                <div className="flex rounded-xl shadow-xs border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white overflow-hidden">
                  <span className="inline-flex items-center px-3.5 bg-slate-50 text-slate-500 font-mono text-xs border-r border-slate-200 select-none">
                    https://github.com/
                  </span>
                  <input
                    type="text"
                    value={input.repoUrl}
                    onChange={(e) => setInput({ ...input, repoUrl: e.target.value, mode: 'github' })}
                    placeholder="organization/repository"
                    className="flex-1 min-w-0 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                  <select
                    value={input.branch}
                    onChange={(e) => setInput({ ...input, branch: e.target.value })}
                    className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="main">branch: main</option>
                    <option value="master">branch: master</option>
                    <option value="v0.4.0">tag: v0.4.0</option>
                  </select>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-medium shrink-0">Verified Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-all ${
                          input.repoUrl === preset.name
                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Replay Verification Assurance */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-sandbox execution leak guarantee</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                MALTA ENGINE READY
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Direct Code Inspector Tab */
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">Direct Code &amp; Script Inspection</h3>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                  MALTA v1.0 PRNG &amp; AST HEURISTIC
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Paste Python / PyTorch / CUDA training scripts to directly audit random seed determinism, unseeded gaussian sampling, and float precision.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInput({ ...input, mode: 'code', codeContent: PRESETS[0].sampleCode })}
                className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-medium transition-colors"
              >
                + Seeded Deterministic Loop
              </button>
              <button
                type="button"
                onClick={() => setInput({ ...input, mode: 'code', codeContent: PRESETS[1].sampleCode })}
                className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono font-medium transition-colors"
              >
                + Unseeded Stochastic Loop
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={input.codeContent}
              onChange={(e) => setInput({ ...input, mode: 'code', codeContent: e.target.value })}
              rows={8}
              placeholder="# Paste Python script here (e.g. torch training loop, seed definitions, model init)..."
              className="w-full p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
              Python 3.10+ / PyTorch AST
            </div>
          </div>
        </div>
      )}

      {/* Primary CTA & Execution Estimation Strip */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Ready for MALTA Deep Inspection
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ~4.2s MALTA scan time
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Includes ghost dependency graph synthesis, container determinism test, and citation drift score.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartAudit}
          disabled={isScanning}
          className="w-full sm:w-auto relative px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(0,108,73,0.35)] hover:shadow-[0_6px_22px_rgba(0,108,73,0.45)] transition-all duration-200 active:scale-95 group disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Executing MALTA v1.0 Audit...</span>
            </>
          ) : (
            <>
              <Radar className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Start Scientific Audit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
