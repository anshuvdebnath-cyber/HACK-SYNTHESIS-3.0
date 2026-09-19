import React, { useState, useRef } from 'react';
import { FileText, Upload, Play, RefreshCw, Layers } from 'lucide-react';

export default function AuditInput({ onRunAudit, loading }) {
  const [activeTab, setActiveTab] = useState('requirements');
  const [reqText, setReqText] = useState('numpy==1.19.5\nseaborn==0.13.2\npymorphy2==0.9.1');
  const [latexFile, setLatexFile] = useState(null);
  const [latexTextPreview, setLatexTextPreview] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLatexFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLatexTextPreview(ev.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'requirements') {
      if (!reqText.trim()) return;
      onRunAudit({ type: 'requirements', data: reqText });
    } else {
      if (!latexFile) return;
      onRunAudit({ type: 'latex', file: latexFile });
    }
  };

  return (
    <div className="swiss-card mb-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#E3DED4] bg-[#F7F5F0]">
        <button
          type="button"
          onClick={() => setActiveTab('requirements')}
          className={`px-6 py-3 text-xs uppercase font-bold tracking-wider transition-colors ${
            activeTab === 'requirements'
              ? 'bg-[#FFFFFF] text-[#141413] border-r border-[#E3DED4]'
              : 'text-[#6E6A63] hover:text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Dependency Stack (requirements.txt)</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('latex')}
          className={`px-6 py-3 text-xs uppercase font-bold tracking-wider transition-colors ${
            activeTab === 'latex'
              ? 'bg-[#FFFFFF] text-[#141413] border-l border-r border-[#E3DED4]'
              : 'text-[#6E6A63] hover:text-[#141413]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Research Paper (LaTeX .tex)</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Input Area */}
        {activeTab === 'requirements' ? (
          <div>
            <label className="block text-[11px] uppercase font-bold tracking-wider text-[#6E6A63] mb-1.5 font-mono">
              Enter Dependencies (name==version per line)
            </label>
            <textarea
              value={reqText}
              onChange={(e) => setReqText(e.target.value)}
              rows={5}
              placeholder="numpy==1.19.5&#10;seaborn==0.13.2&#10;pymorphy2==0.9.1"
              className="w-full p-3 font-mono text-xs bg-[#FAF8F5] border border-[#E3DED4] focus:outline-none focus:border-[#141413] text-[#141413] leading-relaxed resize-y"
            />
          </div>
        ) : (
          <div>
            <label className="block text-[11px] uppercase font-bold tracking-wider text-[#6E6A63] mb-1.5 font-mono">
              Upload Manuscript Source (.tex file)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D5CFC2] hover:border-[#141413] bg-[#FAF8F5] p-6 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-[#6E6A63]" />
              <p className="text-xs font-bold text-[#141413] uppercase">
                {latexFile ? latexFile.name : 'Click to select or drop .tex manuscript'}
              </p>
              <p className="text-[10px] text-[#6E6A63] font-mono mt-1">
                Scans for \href&#123;https://github.com/...&#125; and \url&#123;...&#125; citations (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".tex,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {latexTextPreview && (
              <div className="mt-2 text-[10px] text-[#6E6A63] font-mono truncate">
                Preview: {latexTextPreview.substring(0, 120)}...
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-[11px] text-[#6E6A63] font-mono">
            {loading ? 'Throttled evaluation in progress (1.5s gap)...' : 'Paced sequential API calls enabled'}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#141413] hover:bg-[#2A2926] text-[#FFFFFF] text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing via MALTA...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Health Audit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
