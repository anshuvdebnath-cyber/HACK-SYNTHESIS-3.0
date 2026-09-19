import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuditInput from './components/AuditInput';
import MaltaScorecard from './components/MaltaScorecard';
import FactorAttribution from './components/FactorAttribution';
import ActionSuggestions from './components/ActionSuggestions';
import DependencyList from './components/DependencyList';
import { checkBackendHealth, auditRequirements, auditLatexFile } from './services/api';
import { AlertTriangle, CheckCircle, BarChart3, Database } from 'lucide-react';

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendOnline(res.ok);
    });
    const timer = setInterval(() => {
      checkBackendHealth().then((res) => setBackendOnline(res.ok));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleRunAudit = async (payload) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let data;
      if (payload.type === 'requirements') {
        data = await auditRequirements(payload.data);
      } else {
        data = await auditLatexFile(payload.file);
      }
      setAuditResult(data);
      if (data.dependencies && data.dependencies.length > 0) {
        setSelectedPkg(data.dependencies[0]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || err.message || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  // Stack Summary Statistics
  const totalPackages = auditResult?.dependencies?.length || 0;
  const zombieCount = auditResult?.dependencies?.filter(d => d.isZombie)?.length || 0;
  const discordantCount = auditResult?.dependencies?.filter(d => d.isDiscordant)?.length || 0;
  const avgScore = totalPackages > 0
    ? (auditResult.dependencies.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / totalPackages).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0]">
      <Header backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-900 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Controls */}
        <AuditInput onRunAudit={handleRunAudit} loading={loading} />

        {/* Results Section */}
        {auditResult && (
          <div>
            {/* Top KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="swiss-card p-4">
                <span className="text-[10px] text-[#6E6A63] uppercase font-bold tracking-wider font-mono block">
                  Average Stack Vitality
                </span>
                <span className="text-2xl font-bold font-mono text-[#141413] mt-1 block">
                  {avgScore} <span className="text-xs text-[#6E6A63]">/ 100</span>
                </span>
              </div>

              <div className="swiss-card p-4">
                <span className="text-[10px] text-[#6E6A63] uppercase font-bold tracking-wider font-mono block">
                  Audited Entities
                </span>
                <span className="text-2xl font-bold font-mono text-[#141413] mt-1 block">
                  {totalPackages} <span className="text-xs text-[#6E6A63]">Items</span>
                </span>
              </div>

              <div className="swiss-card p-4">
                <span className="text-[10px] text-[#6E6A63] uppercase font-bold tracking-wider font-mono block">
                  Zombie Software Flagged
                </span>
                <span className={`text-2xl font-bold font-mono mt-1 block ${zombieCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {zombieCount} <span className="text-xs text-[#6E6A63]">Zombies</span>
                </span>
              </div>

              <div className="swiss-card p-4">
                <span className="text-[10px] text-[#6E6A63] uppercase font-bold tracking-wider font-mono block">
                  Discordant Upstream
                </span>
                <span className={`text-2xl font-bold font-mono mt-1 block ${discordantCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {discordantCount} <span className="text-xs text-[#6E6A63]">Warnings</span>
                </span>
              </div>
            </div>

            {/* Dependency Matrix Table */}
            <DependencyList
              dependencies={auditResult.dependencies}
              selectedPkg={selectedPkg}
              onSelectPkg={setSelectedPkg}
            />

            {/* User Hand-Drawn Sketch Dashboard Components */}
            {selectedPkg && (
              <>
                {/* 4 Circular Progress Gauge Cards */}
                <MaltaScorecard pkg={selectedPkg} />

                {/* "Why & How Points Altered" Diagnostic Panel */}
                <FactorAttribution pkg={selectedPkg} />

                {/* Actionable Suggestions & Remediation Panel */}
                <ActionSuggestions pkg={selectedPkg} />
              </>
            )}
          </div>
        )}
      </main>

      <footer className="swiss-border-t bg-[#FFFFFF] py-6 px-6 text-center text-xs text-[#6E6A63] font-mono">
        RepoVitals • Built strictly with React 18, Tailwind CSS, Recharts & Lucide React • Swiss Architectural Aesthetic
      </footer>
    </div>
  );
}
