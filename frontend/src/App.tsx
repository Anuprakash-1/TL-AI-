import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VerificationInput } from './components/VerificationInput';
import { ProgressStepper } from './components/ProgressStepper';
import { VerdictHeader } from './components/VerdictHeader';
import { ClaimBreakdown } from './components/ClaimBreakdown';
import { EvidencePanel } from './components/EvidencePanel';
import { SourceComparison } from './components/SourceComparison';
import { ConfidenceCoverage } from './components/ConfidenceCoverage';
import { MethodologySection } from './components/MethodologySection';
import { DemoShowcase } from './components/DemoShowcase';
import { HowItWorks } from './components/HowItWorks';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MethodologyModal } from './components/MethodologyModal';
import { SettingsModal } from './components/SettingsModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Footer } from './components/Footer';

import { VerifyResponse, HistoryItem } from './types';
import { Language, translations } from './i18n';
import { verifyNews, getReport, getHistory, clearHistory as apiClearHistory, checkHealth } from './api';
import { AlertCircle, Flag, RotateCcw, ChevronDown } from 'lucide-react';
import { SectionNavigator } from './components/SectionNavigator';
import { AnimatedBackground } from './components/AnimatedBackground';

export function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('tl_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark investigative navy theme
  });

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('tl_lang');
    return (saved as Language) || 'en';
  });

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('tl_api_key') || '';
  });

  // App States
  const [currentReport, setCurrentReport] = useState<VerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [liveSearchReady, setLiveSearchReady] = useState(true);
  
  // Preserved payload for Retry
  const [lastPayload, setLastPayload] = useState<{
    text?: string;
    url?: string;
    language?: string;
    country?: string;
    as_of_date?: string | null;
  } | null>(null);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Scroll ref
  const reportRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tl_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tl_theme', 'light');
    }
  }, [isDark]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('tl_lang', lang);
  }, [lang]);

  // Persist API key
  useEffect(() => {
    localStorage.setItem('tl_api_key', apiKey);
  }, [apiKey]);

  // Initial load: check health, load history, check query param report_id
  useEffect(() => {
    checkHealth().then((res) => {
      setLiveSearchReady(res.live_search_ready);
    });

    loadHistory();

    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('report_id');
    if (reportId) {
      loadReportById(reportId);
    }
  }, []);

  const loadHistory = async () => {
    try {
      const items = await getHistory();
      setHistory(items);
    } catch {
      // ignore
    }
  };

  const loadReportById = async (reportId: string) => {
    setIsLoading(true);
    setIsFinishing(false);
    setErrorMessage('');
    try {
      const rep = await getReport(reportId);
      setIsFinishing(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsFinishing(false);
        setCurrentReport(rep);
        setTimeout(() => {
          reportRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setIsFinishing(false);
      setErrorMessage(err.message || 'Report not found.');
    }
  };

  const handleVerify = async (payload: {
    text?: string;
    url?: string;
    language?: string;
    country?: string;
    as_of_date?: string | null;
  }) => {
    if (isLoading || isFinishing) return;
    setIsLoading(true);
    setIsFinishing(false);
    setErrorMessage('');
    setCurrentReport(null);
    setLastPayload(payload);

    try {
      const report = await verifyNews({
        ...payload,
        api_key: apiKey || undefined,
      });

      // Stage 5 completion reveal transition
      setIsFinishing(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsFinishing(false);
        setCurrentReport(report);
        loadHistory();
        setTimeout(() => {
          reportRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setIsFinishing(false);
      setErrorMessage(err.message || 'An error occurred during verification.');
    }
  };

  const handleClearHistory = async () => {
    await apiClearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans relative overflow-x-hidden">
      {/* Dynamic Animated Ambient & Neural Constellation Background */}
      <AnimatedBackground isDark={isDark} />
      {/* Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        historyCount={history.length}
      />

      {/* Section Layer Indicator */}
      <SectionNavigator lang={lang} hasReport={Boolean(currentReport && !isLoading)} />

      {/* Main Layered Container */}
      <main className="flex-1 relative z-10">
        {/* Layer 1: Verification Hub (Hero & Interactive Console) */}
        <section
          id="section-verify"
          className="snap-layer-section min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 sm:py-10 relative"
        >
          <Hero lang={lang} liveSearchActive={liveSearchReady} />

          <VerificationInput
            lang={lang}
            onSubmit={handleVerify}
            isLoading={isLoading || isFinishing}
            onSelectDemo={loadReportById}
          />

          {/* Error Alert with Retry Action */}
          {errorMessage && (
            <div className="max-w-4xl mx-auto px-4 mt-6">
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="text-sm">
                    <span className="font-bold block">Verification Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
                {lastPayload && (
                  <button
                    onClick={() => handleVerify(lastPayload)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 transition-colors shadow-sm active:scale-95 self-end sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.btn_retry}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active Futuristic Verification AI Scanner */}
          {isLoading && (
            <div className="mt-8">
              <ProgressStepper
                lang={lang}
                submittedText={lastPayload?.text || lastPayload?.url || ''}
                isComplete={isFinishing}
              />
            </div>
          )}
        </section>

        {/* Verification Report View with Smooth Reveal Transition */}
        {currentReport && !isLoading && (
          <div
            ref={reportRef}
            className="max-w-5xl mx-auto px-4 mt-8 space-y-16 animate-fadeIn transition-all duration-700 ease-out"
          >
            {/* Report Layer 1: Verdict Header & Claim Breakdown */}
            <section id="section-report-verdict" className="snap-layer-section space-y-8 scroll-mt-20">
              <VerdictHeader report={currentReport} lang={lang} />
              <ClaimBreakdown claims={currentReport.extracted_claims} lang={lang} />
            </section>

            {/* Report Layer 2: Evidence Sources Panel */}
            <section id="section-report-sources" className="snap-layer-section scroll-mt-20">
              <EvidencePanel sources={currentReport.evidence_sources} lang={lang} />
            </section>

            {/* Report Layer 3: Side-by-side Source Comparison Matrix & Assessment */}
            <section id="section-report-matrix" className="snap-layer-section space-y-8 scroll-mt-20">
              <SourceComparison comparison={currentReport.source_comparison} lang={lang} />

              <ConfidenceCoverage
                confidence={currentReport.confidence_level}
                confidenceReason={currentReport.confidence_reason}
                coverage={currentReport.research_coverage}
                coverageReason={currentReport.coverage_reason}
                lang={lang}
              />

              <MethodologySection
                method={currentReport.verification_method}
                limitations={currentReport.limitations}
                lang={lang}
              />

              {/* Bottom Feedback Bar */}
              <div className="p-4 rounded-2xl bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Found an inaccuracy or broken link in this report?
                  </span>
                  <span>TruthLens invites transparent citizen and researcher feedback.</span>
                </div>
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shrink-0"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Submit Correction</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Demonstration Case Studies Showcase */}
        {!currentReport && !isLoading && (
          <>
            {/* Layer 2: Case Studies Showcase */}
            <section
              id="section-demos"
              className="snap-layer-section min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:py-16"
            >
              <DemoShowcase onSelectDemo={loadReportById} lang={lang} />
            </section>

            {/* Layer 3: Methodology & Engine Standard */}
            <section
              id="section-methodology"
              className="snap-layer-section min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:py-16"
            >
              <HowItWorks lang={lang} />
            </section>
          </>
        )}
      </main>

      {/* Layer 4: Footer */}
      <div id="section-footer" className="snap-layer-section">
        <Footer lang={lang} />
      </div>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectReport={loadReportById}
        onClearHistory={handleClearHistory}
        lang={lang}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        liveSearchReady={liveSearchReady}
        lang={lang}
      />

      {currentReport && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          reportId={currentReport.report_id}
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;
