import React, { useState } from 'react';
import { X, Copy, Check, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface CiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CiteModal: React.FC<CiteModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bibtex = `@article{repovitals_malta2026,
  title   = {Deterministic Code Replicability and Dependency Decay via the MALTA v1.0 Methodology},
  author  = {Mitra, S. and RepoVitals Consortium and Stanford CRFM Contributors},
  journal = {Nature Machine Intelligence & Scientific Reproducibility Initiative},
  volume  = {8},
  number  = {3},
  pages   = {241--258},
  year    = {2026},
  doi     = {10.1038/s42256-026-00892-x}
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Cite RepoVitals & MALTA v1.0</h3>
              <p className="text-xs text-slate-500">Nature & Stanford CRFM Reproducibility Standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              When presenting or publishing audit findings evaluated using the <strong>MALTA v1.0</strong> methodology, please cite this formal protocol specification in your artifact appendices.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>BibTeX Format</span>
              <span className="text-[11px] text-emerald-600 font-medium">DOI: 10.1038/s42256-026-00892-x</span>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto selection:bg-emerald-600 selection:text-white leading-relaxed border border-slate-800">
              {bibtex}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <a 
            href="https://nature.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>View protocol in Nature Standards</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied BibTeX!' : 'Copy BibTeX'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
