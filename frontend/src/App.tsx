import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { DashboardSection } from './components/DashboardSection';
import { JournalReportSection } from './components/JournalReportSection';
import { SlideNavBar } from './components/BottomDock';
import { AboutSection } from './components/AboutSection';
import { CiteModal } from './components/CiteModal';
import { AuditInput, SlideId, MaltaAuditResult } from './types';
import { PRESETS, INITIAL_AUDIT_RESULT } from './data/mockData';
import { runLiveMaltaAudit } from './utils/liveAuditBridge';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState<SlideId>('hero');
  const [isCiteModalOpen, setIsCiteModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [input, setInput] = useState<AuditInput>({
    mode: 'github',
    repoUrl: PRESETS[0].name,
    branch: PRESETS[0].branch,
    manifestContent: PRESETS[0].sampleManifest,
    manifestFileName: 'requirements.txt',
    codeContent: PRESETS[0].sampleCode,
    presetId: PRESETS[0].id
  });

  const [auditResult, setAuditResult] = useState<MaltaAuditResult>(INITIAL_AUDIT_RESULT);

  const handleStartAudit = async () => {
    setIsScanning(true);
    setCurrentSlide('dashboard');

    try {
      console.log('🚀 Executing live backend MALTA audit for:', input);
      const result = await runLiveMaltaAudit(input);
      setAuditResult(result);
    } catch (err) {
      console.error('Audit execution error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Ambient Light Mesh Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-blue-100/40 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-24 left-10 w-[26rem] h-[26rem] bg-purple-100/45 rounded-full blur-3xl opacity-50" />
        {/* Fine geometric graph lattice pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: 'radial-gradient(#0b1c30 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      {/* Top Navigation Bar with RepoVitals Heading */}
      <TopNav
        currentSlide={currentSlide}
        onSelectSlide={setCurrentSlide}
        onRunAudit={handleStartAudit}
        onOpenCiteModal={() => setIsCiteModalOpen(true)}
        isScanning={isScanning}
      />

      

      {/* Main Slide Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 pt-28 sm:pt-36 pb-16 w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentSlide === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <HeroSection
                input={input}
                setInput={setInput}
                onStartAudit={handleStartAudit}
                isScanning={isScanning}
                currentSlide={currentSlide}
                onSelectSlide={setCurrentSlide}
              />
              {/* About section with MALTA score, 3 pillars & parameters in Slide 1 */}
              <AboutSection />
            </motion.div>
          )}

          {currentSlide === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <DashboardSection
                auditResult={auditResult}
                isScanning={isScanning}
                onReAudit={handleStartAudit}
                onViewReport={() => setCurrentSlide('report')}
                currentSlide={currentSlide}
                onSelectSlide={setCurrentSlide}
              />
            </motion.div>
          )}

          {currentSlide === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <JournalReportSection
                auditResult={auditResult}
                onBackToDashboard={() => setCurrentSlide('dashboard')}
                onOpenCiteModal={() => setIsCiteModalOpen(true)}
                currentSlide={currentSlide}
                onSelectSlide={setCurrentSlide}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      
    </div>
  );
}
