import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SlideId } from '../types';

interface BottomDockProps {
  currentSlide: SlideId;
  onSelectSlide: (slide: SlideId) => void;
}

export const SlideNavBar: React.FC<BottomDockProps> = ({
  currentSlide,
  onSelectSlide,
}) => {
  const getNextSlide = (): { id: SlideId; label: string } => {
    if (currentSlide === 'hero') return { id: 'dashboard', label: 'Live Dashboard' };
    if (currentSlide === 'dashboard') return { id: 'report', label: 'Journal Report' };
    return { id: 'hero', label: 'Hero & Input' };
  };

  const nextSlide = getNextSlide();

  return (
    <nav aria-label="Slide Switcher" className="w-full py-2.5 sm:py-3 px-4 sm:px-8 flex items-center justify-center print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {/* Big 1, 2, 3 and Next Slide Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md border-2 border-slate-200/90 p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-md hover:shadow-lg transition-all duration-200">
          {/* Slide 1 */}
          <button
            onClick={() => onSelectSlide('hero')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm md:text-base font-mono transition-all duration-200 cursor-pointer ${
              currentSlide === 'hero'
                ? 'bg-emerald-700 text-white font-bold shadow-md ring-2 ring-emerald-500/30'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white font-semibold'
            }`}
          >
            {currentSlide === 'hero' && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
            1. Hero &amp; Input
          </button>

          {/* Slide 2 */}
          <button
            onClick={() => onSelectSlide('dashboard')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm md:text-base font-mono transition-all duration-200 cursor-pointer ${
              currentSlide === 'dashboard'
                ? 'bg-emerald-700 text-white font-bold shadow-md ring-2 ring-emerald-500/30'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white font-semibold'
            }`}
          >
            {currentSlide === 'dashboard' && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
            2. Live Dashboard
          </button>

          {/* Slide 3 */}
          <button
            onClick={() => onSelectSlide('report')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm md:text-base font-mono transition-all duration-200 cursor-pointer ${
              currentSlide === 'report'
                ? 'bg-emerald-700 text-white font-bold shadow-md ring-2 ring-emerald-500/30'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white font-semibold'
            }`}
          >
            {currentSlide === 'report' && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
            3. Journal Report
          </button>

          {/* Big Next Button */}
          <div className="pl-1 sm:pl-2 border-l border-slate-300 sm:border-slate-300/80">
            <button
              onClick={() => onSelectSlide(nextSlide.id)}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm md:text-base font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Next: {nextSlide.label}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const BottomDock = SlideNavBar;
