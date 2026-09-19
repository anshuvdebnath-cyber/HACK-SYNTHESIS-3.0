import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileSpreadsheet, Sparkles, Check } from 'lucide-react';
import { SlideId } from '../types';

interface SlideMenuDrawerProps {
  currentSlide: SlideId;
  onSelectSlide: (slide: SlideId) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const SlideMenuDrawer: React.FC<SlideMenuDrawerProps> = ({
  currentSlide,
  onSelectSlide,
  className = '',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const slides: {
    id: SlideId;
    index: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'hero',
      index: 1,
      title: 'Hero & Specification Input',
      subtitle: 'Upload manifest, GitHub repository link, or direct code inspection',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'dashboard',
      index: 2,
      title: 'Live Analytical Dashboard',
      subtitle: 'MALTA v1.0 collective & specific scores, radar & seed variance charts',
      icon: <LayoutDashboard className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'report',
      index: 3,
      title: 'Scientific Journal Report',
      subtitle: 'Nature Research Standard reproducibility certificate & audit export',
      icon: <FileSpreadsheet className="w-4 h-4 text-purple-600" />,
    }
  ];

  const handleSelect = (id: SlideId) => {
    onSelectSlide(id);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block z-30 ${className}`}>
      {/* 3-Dash Menu Button - Pure 3-dash icon with breathing & morphing animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Change Slide"
        title="Change Slide"
        className={`group relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 active:scale-90 cursor-pointer shadow-xs ${
          isOpen
            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-md ring-2 ring-emerald-400/30'
            : 'bg-white hover:bg-emerald-50/40 border-slate-200/90 text-slate-700 hover:border-emerald-400 hover:shadow-sm'
        }`}
      >
        {/* Pulsing Breathing Aura Glow around the 3 dashes */}
        <span 
          className={`absolute -inset-1 rounded-xl bg-emerald-400/25 pointer-events-none transition-opacity duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100 animate-breathe-glow'
          }`} 
        />

        {/* The 3-Dash Icon Container with smooth morphing */}
        <div className="relative flex flex-col justify-center items-center w-5 h-4 gap-[3.5px]">
          {/* Dash 1 */}
          <span
            className={`h-[2.5px] rounded-full bg-emerald-600 transition-all duration-300 origin-center ${
              isOpen 
                ? 'w-4.5 rotate-45 translate-y-[6px] bg-emerald-700' 
                : 'w-4.5 group-hover:w-5'
            }`}
          />
          {/* Dash 2 */}
          <span
            className={`h-[2.5px] rounded-full bg-emerald-600 transition-all duration-200 ${
              isOpen 
                ? 'opacity-0 scale-x-0' 
                : 'w-3.5 group-hover:w-4.5'
            }`}
          />
          {/* Dash 3 */}
          <span
            className={`h-[2.5px] rounded-full bg-emerald-600 transition-all duration-300 origin-center ${
              isOpen 
                ? 'w-4.5 -rotate-45 -translate-y-[6px] bg-emerald-700' 
                : 'w-4.5 group-hover:w-4'
            }`}
          />
        </div>
      </button>

      {/* Slide Opener Menu Drawer with smooth spring & fade animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click dismiss */}
            <div
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute mt-2 w-80 sm:w-92 bg-white/98 backdrop-blur-xl border border-slate-200/95 rounded-2xl shadow-2xl z-30 p-2 overflow-hidden ${
                align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Change Slide
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
                  MALTA v1.0
                </span>
              </div>

              <div className="p-1 space-y-1 mt-1">
                {slides.map((slide) => {
                  const isActive = currentSlide === slide.id;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => handleSelect(slide.id)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50/90 border border-emerald-200/90 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isActive 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:border-slate-300'
                      }`}>
                        {isActive ? <Check className="w-3.5 h-3.5 text-white" /> : slide.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold font-display ${isActive ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                            {slide.index}. {slide.title}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 px-1.5 py-0.5 bg-emerald-100/80 rounded-md">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug truncate mt-0.5">
                          {slide.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
