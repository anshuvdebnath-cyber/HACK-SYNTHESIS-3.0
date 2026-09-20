import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  FileCode, 
  Cpu, 
  CheckCircle2, 
  Network, 
  ShieldCheck, 
  Radar, 
  ArrowRight, 
  Lock, 
  Loader2,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';
import { AuditInput, InputMode, PresetRepo, SlideId } from '../types';
import { PRESETS } from '../data/mockData';

const SAMPLE_LATEX_SOURCE = `\\documentclass{article}
\\begin{document}
\\section{Introduction}
Our code is available at \\href{https://github.com/numpy/numpy}{GitHub}.
We also used \\url{https://github.com/pallets/flask}.
Baseline: https://github.com/psf/requests
\\end{document}`;

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
  const [manifestDragOver, setManifestDragOver] = useState(false);
  const [latexDragOver, setLatexDragOver] = useState(false);
  const manifestFileInputRef = useRef<HTMLInputElement>(null);
  const latexFileInputRef = useRef<HTMLInputElement>(null);

  const setMode = (mode: InputMode) => {
    setInput(prev => ({ ...prev, mode }));
  };

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

  const handleManifestFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleManifestDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setManifestDragOver(false);
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

  const handleLatexFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput({
        ...input,
        mode: 'latex',
        latexContent: content,
        latexFileName: file.name,
        latexFile: file
      });
    };
    reader.readAsText(file);
  };

  const handleLatexDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLatexDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput({
        ...input,
        mode: 'latex',
        latexContent: content,
        latexFileName: file.name,
        latexFile: file
      });
    };
    reader.readAsText(file);
  };

  const pkgLinesCount = (input.manifestContent || '').split('\n').filter(l => l.trim() && !l.startsWith('#')).length;

  return (
    <div className="w-full">
      {/* Hero Top: Grid with Copy & 3D Dependency Specimen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-display font-bold text-slate-900 tracking-tight leading-[1.08] max-w-2xl">
            Don’t let your research{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
              die in silence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            RepoVitals detects ghost repositories, silent build decay, and unseeded dependency drift before they compromise peer-reviewed reproducibility.
          </p>

          </div>

        {/* Right Column: Stylized 3D Dependency Ghost Visual (5 Cols) */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] py-4">
          <div className="absolute w-72 h-72 rounded-full border border-purple-300/40 bg-purple-50/20 blur-[1px] animate-pulse-ring" />
          <div className="absolute w-56 h-56 rounded-full border border-emerald-300/40 bg-emerald-50/20 blur-[1px]" />

          <div className="relative z-10 animate-float-ghost flex flex-col items-center">
            <div className="relative w-38 h-46 rounded-3xl bg-white/90 backdrop-blur-xl p-5 border border-slate-200/90 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] flex flex-col items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 via-teal-50 to-purple-100 flex items-center justify-center shadow-inner border border-white">
                <Cpu className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="w-full flex flex-col items-center gap-1.5">
                <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-pulse" />
                </div>
                <span className="font-mono text-[10px] text-slate-400 font-semibold tracking-wider">
                  HOST: CONTAINER_01
                </span>
              </div>

              <div className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-mono text-[9px] font-bold">
                MALTA WATCH v1.0
              </div>
            </div>

            <div className="absolute -left-12 top-4 animate-tag-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-rose-200 shadow-sm text-rose-700 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>pycrypto: <strong className="font-bold">ARCHIVED</strong></span>
              </div>
            </div>

            <div className="absolute -right-10 top-10 animate-tag-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-emerald-200 shadow-sm text-emerald-800 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>torch: <strong className="font-bold">HEALTHY</strong></span>
              </div>
            </div>

            <div className="absolute -bottom-4 right-0 animate-tag-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-purple-200 shadow-sm text-purple-800 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span>scikit-survival: <strong className="font-bold">STALLED</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION HEADER: Ingestion Methodology */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Input Methodology Section
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Choose your primary source to extract dependencies, parse manifest specifications, and compute live MALTA scores.
            </p>
          </div>

          {/* 3-Way Mode Selector Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200 self-start lg:self-auto shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setMode('manifest')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                input.mode === 'manifest'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Requirements.txt</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('github')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                input.mode === 'github'
                  ? 'bg-white text-blue-800 font-bold shadow-xs border border-blue-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>2. GitHub URL</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('latex')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                input.mode === 'latex'
                  ? 'bg-white text-purple-800 font-bold shadow-xs border border-purple-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-purple-600" />
              <span>3. LaTeX Manuscript</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Input Cards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Requirements.txt & Package Manifest */}
        <div 
          onClick={() => setMode('manifest')}
          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative ${
            input.mode === 'manifest'
              ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                  input.mode === 'manifest' 
                    ? 'bg-emerald-500 text-white border-emerald-600' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display leading-tight">
                    Requirements.txt &amp; Package Manifest
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500">
                    METHOD: DIRECT MANIFEST
                  </span>
                </div>
              </div>

              {/* Active Method Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                input.mode === 'manifest'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {input.mode === 'manifest' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <span>SELECT</span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Drop your requirements.txt, environment.yml, pyproject.toml or manually edit dependency specs.
            </p>

            {/* Drag Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setManifestDragOver(true); }}
              onDragLeave={() => setManifestDragOver(false)}
              onDrop={handleManifestDrop}
              onClick={(e) => { e.stopPropagation(); manifestFileInputRef.current?.click(); }}
              className={`border-2 border-dashed rounded-xl p-4 transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer mb-3 ${
                manifestDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-emerald-50/30 hover:border-emerald-400'
              }`}
            >
              <input 
                type="file" 
                ref={manifestFileInputRef} 
                onChange={handleManifestFileUpload} 
                className="hidden" 
                accept=".txt,.yml,.yaml,.lock,.toml"
              />
              <div className="w-8 h-8 mb-1.5 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400">
                <Upload className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {input.manifestFileName ? (
                  <span className="text-emerald-700 font-mono">Loaded: {input.manifestFileName}</span>
                ) : (
                  <>Drag &amp; drop package file or <span className="text-emerald-600 underline">Browse</span></>
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                requirements.txt, environment.yml, pyproject.toml
              </p>
            </div>

            {/* Manifest Direct Editor */}
            <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>EDIT MANIFEST SPEC DIRECTLY:</span>
                <span>{pkgLinesCount} package{pkgLinesCount === 1 ? '' : 's'}</span>
              </div>
              <textarea
                rows={4}
                value={input.manifestContent}
                onChange={(e) => {
                  setInput({
                    ...input,
                    mode: 'manifest',
                    manifestContent: e.target.value
                  });
                }}
                placeholder="numpy==1.19.5
seaborn==0.13.2
pymorphy2==0.9.1"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Card 1 Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">.txt</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">.yml</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">poetry</span>
            </div>
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
              className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              ⚡ Load 3 Packages
            </button>
          </div>
        </div>
        {/* Card 2: GitHub Repository Link */}
        <div 
          onClick={() => setMode('github')}
          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative ${
            input.mode === 'github'
              ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                  input.mode === 'github' 
                    ? 'bg-blue-600 text-white border-blue-700' 
                    : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display leading-tight">
                    GitHub Repository Link
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500">
                    METHOD: REMOTE VCS
                  </span>
                </div>
              </div>

              {/* Active Method Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                input.mode === 'github'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {input.mode === 'github' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <span>SELECT</span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Directly crawl continuous integration artifacts, lockfiles, and git commit history from any public repository.
            </p>

            {/* Input + Branch Group */}
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex rounded-xl shadow-xs border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white overflow-hidden">
                <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-500 font-mono text-[11px] border-r border-slate-200 select-none">
                  github.com/
                </span>
                <input
                  type="text"
                  value={input.repoUrl}
                  onChange={(e) => setInput({ ...input, repoUrl: e.target.value, mode: 'github' })}
                  placeholder="organization/repository"
                  className="flex-1 min-w-0 px-2.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                />
                <select
                  value={input.branch}
                  onChange={(e) => setInput({ ...input, branch: e.target.value })}
                  className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-xs font-mono text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="main">main</option>
                  <option value="master">master</option>
                  <option value="v0.4.0">v0.4.0</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <span className="font-medium text-[11px]">Verified Research Presets:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-2 py-1 rounded-md font-mono text-[10px] text-left truncate transition-all ${
                        input.repoUrl === preset.name && input.mode === 'github'
                          ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={preset.name}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500" onClick={(e) => e.stopPropagation()}>
            <span className="flex items-center gap-1 text-[11px]">
              <Lock className="w-3 h-3 text-blue-600" />
              <span>Zero-sandbox leak guarantee</span>
            </span>
            <span className="font-mono text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              REMOTE VCS
            </span>
          </div>
        </div>

        {/* Card 3: LaTeX Research Manuscript (.tex) */}
        <div 
          onClick={() => setMode('latex')}
          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative ${
            input.mode === 'latex'
              ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20'
              : 'bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                  input.mode === 'latex' 
                    ? 'bg-purple-600 text-white border-purple-700' 
                    : 'bg-purple-50 text-purple-700 border-purple-100'
                }`}>
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display leading-tight">
                    LaTeX Research Manuscript (.tex)
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500">
                    METHOD: LATEX ARTIFACT
                  </span>
                </div>
              </div>

              {/* Active Method Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                input.mode === 'latex'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {input.mode === 'latex' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <span>SELECT</span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Upload peer-reviewed LaTeX paper source (.tex) to extract embedded GitHub repositories and audit reproduction health.
            </p>

            {/* LaTeX Drag Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setLatexDragOver(true); }}
              onDragLeave={() => setLatexDragOver(false)}
              onDrop={handleLatexDrop}
              onClick={(e) => { e.stopPropagation(); latexFileInputRef.current?.click(); }}
              className={`border-2 border-dashed rounded-xl p-4 transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer mb-3 ${
                latexDragOver
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-purple-50/30 hover:border-purple-400'
              }`}
            >
              <input 
                type="file" 
                ref={latexFileInputRef} 
                onChange={handleLatexFileUpload} 
                className="hidden" 
                accept=".tex,.txt"
              />
              <div className="w-8 h-8 mb-1.5 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400">
                <FileCode className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {input.latexFileName ? (
                  <span className="text-purple-700 font-mono">Loaded: {input.latexFileName}</span>
                ) : (
                  <>Drag &amp; drop manuscript (.tex) or <span className="text-purple-600 underline">Browse</span></>
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Extracts embedded \\url and \\href GitHub links
              </p>
            </div>

            {/* LaTeX Direct Editor */}
            <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>EDIT LATEX SOURCE:</span>
                <span>Auto-parses GitHub links</span>
              </div>
              <textarea
                rows={4}
                value={input.latexContent || SAMPLE_LATEX_SOURCE}
                onChange={(e) => {
                  setInput({
                    ...input,
                    mode: 'latex',
                    latexContent: e.target.value
                  });
                }}
                placeholder="\\documentclass{article}..."
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Card 3 Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">.tex</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">arXiv</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">Overleaf</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setInput({
                  ...input,
                  mode: 'latex',
                  latexFileName: 'sample.tex',
                  latexContent: SAMPLE_LATEX_SOURCE
                });
              }}
              className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[11px] font-semibold text-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              ⚡ Load Sample (.tex)
            </button>
          </div>
        </div>
      </div>
      {/* Primary CTA & Execution Estimation Strip */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div>
            <div className="text-sm font-semibold text-slate-900 flex flex-wrap items-center gap-2">
              <span>Ready for MALTA Deep Inspection</span>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ~4.2s MALTA scan time
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                {input.mode === 'manifest' && 'Mode: Requirements.txt Manifest'}
                {input.mode === 'github' && `Mode: GitHub (${input.repoUrl || 'repository'})`}
                {input.mode === 'latex' && `Mode: LaTeX Manuscript (${input.latexFileName || 'sample.tex'})`}
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
          className="w-full sm:w-auto relative px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(0,108,73,0.35)] hover:shadow-[0_6px_22px_rgba(0,108,73,0.45)] transition-all duration-200 active:scale-95 group disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
