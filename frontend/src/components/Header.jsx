import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Header({ backendOnline }) {
  return (
    <header className="bg-[#FFFFFF] swiss-border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#141413] text-[#FFFFFF] flex items-center justify-center font-bold text-sm tracking-wider">
              RV
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#141413] uppercase">
                RepoVitals
              </h1>
              <p className="text-xs text-[#6E6A63] tracking-wider uppercase font-medium">
                MALTA Framework • Technical Lag & Zombie Software Detector
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F5F0] border border-[#E3DED4] text-xs font-mono">
            <span className="w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-600' : 'bg-red-500 animate-pulse'}"></span>
            <span className="text-[#141413] uppercase font-semibold">
              Engine: {backendOnline ? 'Online (Port 3003)' : 'Connecting...'}
            </span>
          </div>

          <div className="hidden lg:block text-right">
            <span className="text-[11px] text-[#6E6A63] uppercase tracking-widest font-mono block">
              Evaluation Windows
            </span>
            <span className="text-xs font-semibold text-[#141413] font-mono">
              W_e = 18m | W_b = 24m
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
