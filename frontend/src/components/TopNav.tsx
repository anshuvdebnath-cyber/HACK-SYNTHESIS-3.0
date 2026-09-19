import React from 'react';
import { Share2, Play, Sparkles } from 'lucide-react';
import { SlideId } from '../types';

interface TopNavProps {
  currentSlide: SlideId;
  onSelectSlide: (slide: SlideId) => void;
  onRunAudit: () => void;
  onOpenCiteModal: () => void;
  isScanning?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentSlide,
  onSelectSlide,
  onRunAudit,
  onOpenCiteModal,
  isScanning = false,
}) => {
  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-200">
      <nav
        aria-label="Unified Floating Navigation"
        className="max-w-7xl mx-auto pointer-events-auto bg-white/92 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-8 transition-all duration-200"
      >
        {/* Left: Brand Heading */}
        <button
          onClick={() => onSelectSlide('hero')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none shrink-0"
          aria-label="RepoVitals Home"
        >
          <span className="text-xl sm:text-2xl lg:text-2.5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-emerald-800 to-teal-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-600 transition-all duration-200">
            RepoVitals
          </span>
        </button>

        {/* Center: Slide Switcher Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100/80 rounded-xl sm:rounded-full border border-slate-200/70 text-xs font-mono">
          <button
            onClick={() => onSelectSlide('hero')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-full transition-all duration-200 cursor-pointer ${
              currentSlide === 'hero'
                ? 'bg-emerald-700 text-white font-bold shadow-xs ring-1 ring-emerald-600/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/80 font-medium'
            }`}
          >
            {currentSlide === 'hero' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            )}
            <span className="hidden md:inline">1. </span>Hero &amp; Input
          </button>

          <button
            onClick={() => onSelectSlide('dashboard')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-full transition-all duration-200 cursor-pointer ${
              currentSlide === 'dashboard'
                ? 'bg-emerald-700 text-white font-bold shadow-xs ring-1 ring-emerald-600/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/80 font-medium'
            }`}
          >
            {currentSlide === 'dashboard' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            )}
            <span className="hidden md:inline">2. </span>Live Dashboard
          </button>

          <button
            onClick={() => onSelectSlide('report')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-full transition-all duration-200 cursor-pointer ${
              currentSlide === 'report'
                ? 'bg-emerald-700 text-white font-bold shadow-xs ring-1 ring-emerald-600/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/80 font-medium'
            }`}
          >
            {currentSlide === 'report' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            )}
            <span className="hidden md:inline">3. </span>Journal Report
          </button>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenCiteModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Cite Paper</span>
          </button>

          <button
            onClick={onRunAudit}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed shadow-emerald-600/20 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span className="hidden sm:inline">Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Run Audit</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
