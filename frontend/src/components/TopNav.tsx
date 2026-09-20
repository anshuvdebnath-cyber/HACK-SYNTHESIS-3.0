import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { SlideId } from '../types';

interface TopNavProps {
  currentSlide: SlideId;
  onSelectSlide: (slide: SlideId) => void;
  onRunAudit: () => void;
  isScanning?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentSlide,
  onSelectSlide,
  onRunAudit,
  isScanning = false,
}) => {
  return (
    <div className="fixed top-3.5 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-200 print:hidden">
      <nav
        aria-label="Unified Floating Navigation"
        className="max-w-7xl mx-auto pointer-events-auto bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_12px_44px_rgba(0,0,0,0.11)] rounded-2xl sm:rounded-full px-5 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 sm:gap-8 transition-all duration-200"
      >
        {/* Left: Brand Heading */}
        <button
          onClick={() => onSelectSlide('hero')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none shrink-0"
          aria-label="RepoVitals Home"
        >
          <span className="text-2xl sm:text-3xl lg:text-3.5xl font-display font-black tracking-tight bg-gradient-to-r from-slate-950 via-emerald-800 to-teal-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-600 transition-all duration-200">
            RepoVitals
          </span>
        </button>

        {/* Center: Slide Switcher Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/90 rounded-xl sm:rounded-full border border-slate-200/80 text-xs sm:text-sm font-mono">
          <button
            onClick={() => onSelectSlide('hero')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-lg sm:rounded-full transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentSlide === 'hero'
                ? 'bg-emerald-700 text-white font-bold shadow-sm ring-2 ring-emerald-600/30'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/90 font-semibold'
            }`}
          >
            {currentSlide === 'hero' && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            )}
            <span className="hidden md:inline">1. </span>Hero &amp; Input
          </button>

          <button
            onClick={() => onSelectSlide('dashboard')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-lg sm:rounded-full transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentSlide === 'dashboard'
                ? 'bg-emerald-700 text-white font-bold shadow-sm ring-2 ring-emerald-600/30'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/90 font-semibold'
            }`}
          >
            {currentSlide === 'dashboard' && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            )}
            <span className="hidden md:inline">2. </span>Live Dashboard
          </button>

          <button
            onClick={() => onSelectSlide('report')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-lg sm:rounded-full transition-all duration-200 cursor-pointer text-xs sm:text-sm ${
              currentSlide === 'report'
                ? 'bg-emerald-700 text-white font-bold shadow-sm ring-2 ring-emerald-600/30'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/90 font-semibold'
            }`}
          >
            {currentSlide === 'report' && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            )}
            <span className="hidden md:inline">3. </span>Journal Report
          </button>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onRunAudit}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-150 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed shadow-emerald-600/25 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="hidden sm:inline">Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>Run Audit</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
