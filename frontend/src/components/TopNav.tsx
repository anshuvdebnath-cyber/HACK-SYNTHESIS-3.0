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
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs border-b border-slate-200/90 transition-all duration-200">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        {/* Big Attractive RepoVitals Heading */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSlide('hero')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            aria-label="RepoVitals Home"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl lg:text-3.5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-emerald-800 to-teal-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-600 transition-all duration-200">
                RepoVitals
              </span>
            </div>
          </button>
        </div>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCiteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Cite Paper</span>
          </button>

          <button
            onClick={onRunAudit}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed shadow-emerald-600/20 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

