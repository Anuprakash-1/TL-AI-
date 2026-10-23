import React, { useEffect, useState } from 'react';
import {
  FileSearch, Database, GitCompare, Scale, CheckCircle2,
  Shield, Sparkles, Radio, Activity, Search, Globe, FileText
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface ProgressStepperProps {
  lang: Language;
  submittedText?: string;
  isComplete?: boolean;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  lang,
  submittedText = '',
  isComplete = false,
}) => {
  const t = translations[lang];
  const [activeStage, setActiveStage] = useState<number>(1);

  // Smooth stage progression while real backend request is executing
  useEffect(() => {
    if (isComplete) {
      setActiveStage(5);
      return;
    }

    const t1 = setTimeout(() => setActiveStage(2), 2000);
    const t2 = setTimeout(() => setActiveStage(3), 4200);
    const t3 = setTimeout(() => setActiveStage(4), 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isComplete]);

  // Stage configurations matching prompt requirements
  const stages = [
    {
      id: 1,
      badge: '01',
      title: t.stage_1_title,
      message: t.stage_1_msg,
      sub: t.stage_1_sub,
      icon: FileSearch,
      color: 'from-cyan-500 to-blue-600',
      ringColor: 'border-cyan-500',
      glowColor: 'rgba(6, 182, 212, 0.4)',
    },
    {
      id: 2,
      badge: '02',
      title: t.stage_2_title,
      message: t.stage_2_msg,
      sub: t.stage_2_sub,
      icon: Database,
      color: 'from-blue-500 to-indigo-600',
      ringColor: 'border-blue-500',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    {
      id: 3,
      badge: '03',
      title: t.stage_3_title,
      message: t.stage_3_msg,
      sub: t.stage_3_sub,
      icon: GitCompare,
      color: 'from-indigo-500 to-purple-600',
      ringColor: 'border-indigo-500',
      glowColor: 'rgba(99, 102, 241, 0.4)',
    },
    {
      id: 4,
      badge: '04',
      title: t.stage_4_title,
      message: t.stage_4_msg,
      sub: t.stage_4_sub,
      icon: Scale,
      color: 'from-purple-500 to-pink-600',
      ringColor: 'border-purple-500',
      glowColor: 'rgba(168, 85, 247, 0.4)',
    },
    {
      id: 5,
      badge: '05',
      title: t.stage_5_title,
      message: t.stage_5_msg,
      sub: t.stage_5_sub,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-cyan-500',
      ringColor: 'border-emerald-500',
      glowColor: 'rgba(16, 185, 129, 0.4)',
    },
  ];

  const currentStageConfig = stages.find((s) => s.id === activeStage) || stages[0];
  const CurrentIcon = currentStageConfig.icon;

  // Clean claim preview text
  const previewClaim = submittedText.trim()
    ? submittedText.length > 140
      ? submittedText.slice(0, 140) + '...'
      : submittedText
    : lang === 'en'
    ? 'Submitted content under multi-source investigative scrutiny...'
    : 'सत्यापन हेतु प्रस्तुत सामग्री की बहु-स्रोतीय जांच जारी है...';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8 transition-all duration-300">
      <div className="relative rounded-3xl bg-slate-900/95 dark:bg-navy-950/95 border border-cyan-500/30 dark:border-cyan-500/25 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden backdrop-blur-xl text-slate-100">
        
        {/* Subtle Background Glow Gradients */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient Floating Micro-Particles */}
        <div className="absolute top-12 left-16 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-particle-1 pointer-events-none" />
        <div className="absolute top-24 right-20 w-2 h-2 rounded-full bg-indigo-400 animate-particle-2 pointer-events-none" />
        <div className="absolute bottom-16 right-36 w-1 h-1 rounded-full bg-purple-400 animate-particle-3 pointer-events-none" />
        <div className="absolute bottom-20 left-28 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-particle-2 pointer-events-none" />

        {/* Top Status Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                TruthLens Deep Verification Core
              </span>
              <p className="text-[11px] text-slate-400">
                Live multi-source cross-referencing • Real web indexes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Stage <span className="text-cyan-400 font-bold">{activeStage}</span> of 5
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Connected" />
          </div>
        </div>

        {/* Central HUD: Circular AI Scanner & Stage Details */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Circular AI Scanner Graphic */}
          <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              
              {/* Outer Calibrated HUD Ring (Slow Clockwise Rotation) */}
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-spin-slow" />
              
              {/* Second Segmented Ring (Medium Counter-Clockwise Rotation) */}
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-500/70 border-b-cyan-500/70 animate-spin-reverse-medium" />
              
              {/* Third Concentric Ring with Calibration Dots */}
              <div className="absolute inset-6 rounded-full border border-slate-800 flex items-center justify-center">
                <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-purple-400" />
                <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-blue-400" />
                <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>

              {/* Conic Radar Scanning Beam */}
              <div
                className="absolute inset-4 rounded-full pointer-events-none animate-radar-sweep opacity-75"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(6, 182, 212, 0.08) 310deg, rgba(6, 182, 212, 0.5) 360deg)',
                }}
              />

              {/* Pulsing AI Analysis Center Core */}
              <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-950 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center text-center p-2 animate-core-pulse">
                <CurrentIcon className="w-8 h-8 text-cyan-300 transition-all duration-300" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mt-1">
                  AI SCAN
                </span>
                <span className="text-[9px] font-mono text-cyan-400">
                  ACTIVE
                </span>
              </div>

              {/* Concentric Glow Halo */}
              <div
                className="absolute inset-8 rounded-full transition-all duration-500"
                style={{
                  boxShadow: `0 0 45px ${currentStageConfig.glowColor}`,
                }}
              />
            </div>

            {/* Status Indicator Under Scanner */}
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Verifying Against Independent Wires</span>
            </div>
          </div>

          {/* Right Dynamic Stage Information & Active Hologram */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Active Stage Heading */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentStageConfig.title}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 pt-1">
                <span>{currentStageConfig.message}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentStageConfig.sub}
              </p>
            </div>

            {/* Dynamic Stage Visual Container */}
            <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-4 overflow-hidden">
              
              {/* Glowing Scanning Beam for Stage 1 */}
              {activeStage === 1 && (
                <div className="space-y-3 relative overflow-hidden py-1">
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-scan-beam pointer-events-none" />
                  
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Deconstructing Target Claim
                    </span>
                    <span className="text-slate-400">Semantic Parsing</span>
                  </div>

                  <p className="text-xs font-medium text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 line-clamp-3">
                    "{previewClaim}"
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-mono">
                      Named Entities: Identified
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-mono">
                      Category: Factual Assertion
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 font-mono">
                      Verifiability: Empirical
                    </span>
                  </div>
                </div>
              )}

              {/* Animated Source Discovery Radar for Stage 2 */}
              {activeStage === 2 && (
                <div className="space-y-3 py-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      Discovering Corroborating Repositories
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Query
                    </span>
                  </div>

                  {/* Animated Skeleton Source Cards with Shimmer */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl border border-slate-800 shimmer-card flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-slate-200">Google News RSS & Live Wires</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        Querying...
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-800 shimmer-card flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-slate-200">Government & Primary Portals (PIB, Court)</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Index Lookup
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-800 shimmer-card flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-slate-200">Certified IFCN Fact-Checking Archives</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Matching
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Animated Neural Connections for Stage 3 */}
              {activeStage === 3 && (
                <div className="space-y-3 py-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                      Cross-Checking Available Evidence
                    </span>
                    <span className="text-indigo-400">Neural Triangulation</span>
                  </div>

                  {/* Connecting Graphic Representation */}
                  <div className="py-2 flex items-center justify-around gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-sm w-32">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold">Node A</span>
                      <span className="text-xs text-slate-200 truncate block">News Claim</span>
                    </div>

                    {/* Animated Pulsing Connecting Lines */}
                    <div className="flex-1 flex flex-col items-center justify-center px-1">
                      <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/70 animate-scan-beam" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                        Cross-Referencing
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/40 shadow-sm w-32">
                      <span className="text-[10px] font-mono text-purple-400 uppercase block font-bold">Node B</span>
                      <span className="text-xs text-slate-200 truncate block">Official Sources</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center font-mono">
                    Detecting syndication repetition vs independent corroboration...
                  </p>
                </div>
              )}

              {/* Subtle Evidence Analysis Balance for Stage 4 */}
              {activeStage === 4 && (
                <div className="space-y-3 py-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-purple-400" />
                      Evidence Analysis Interface
                    </span>
                    <span className="text-purple-300">Classifying Findings</span>
                  </div>

                  {/* Multi-channel evidence balances */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                        Supporting
                      </span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-3/4 rounded-full animate-pulse" />
                      </div>
                      <span className="text-[9px] text-emerald-300 font-mono">Corroborating</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">
                        Contradicting
                      </span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full w-2/3 rounded-full animate-pulse" />
                      </div>
                      <span className="text-[9px] text-rose-300 font-mono">Refutations</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                        Context
                      </span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full w-4/5 rounded-full animate-pulse" />
                      </div>
                      <span className="text-[9px] text-cyan-300 font-mono">Nuances</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center font-mono">
                    Weighting primary document authority & analyzing uncertainty...
                  </p>
                </div>
              )}

              {/* Stage 5: Verification Complete */}
              {activeStage === 5 && (
                <div className="py-3 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Audit Verification Synthesized
                  </h4>
                  <p className="text-xs text-slate-400">
                    Displaying full evidence cards, verdict summary, and source citations...
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Dots / Stage Selector */}
            <div className="flex items-center justify-between gap-1 pt-2">
              {stages.map((stg) => {
                const isPassed = activeStage > stg.id;
                const isCurrent = activeStage === stg.id;
                return (
                  <div
                    key={stg.id}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_#06b6d4]'
                        : isPassed
                        ? 'bg-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
