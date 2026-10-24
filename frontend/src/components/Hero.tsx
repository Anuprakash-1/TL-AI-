import React from 'react';
import { ShieldCheck, Database, CheckCircle2, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import { Language, translations } from '../i18n';

interface HeroProps {
  lang: Language;
  liveSearchActive: boolean;
}

export const Hero: React.FC<HeroProps> = ({ lang, liveSearchActive }) => {
  const t = translations[lang];

  return (
    <section className="pt-2 sm:pt-6 pb-2 max-w-6xl mx-auto px-4 sm:px-6 relative select-none">
      {/* Floating Left Cyber Rail */}
      <div className="hidden xl:flex fixed left-6 top-1/3 flex-col items-center gap-4 text-white/50 z-30 pointer-events-auto">
        <a
          href="https://github.com/Anuprakash-1/TL-AI-"
          target="_blank"
          rel="noreferrer"
          className="w-8 h-8 rounded-full border border-white/20 hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-all bg-black/60 backdrop-blur-md shadow-lg"
          title="GitHub Repository"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
        <button
          onClick={() => {
            const el = document.getElementById('section-methodology');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-8 h-8 rounded-full border border-white/20 hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-all bg-black/60 backdrop-blur-md"
          title="Methodology & Standards"
        >
          <Database className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            const el = document.getElementById('section-demos');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-8 h-8 rounded-full border border-white/20 hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-all bg-black/60 backdrop-blur-md"
          title="Verified Investigations"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-12 bg-gradient-to-b from-red-500/50 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline and Context */}
        <div className="lg:col-span-8 text-left space-y-5">
          {/* Cyber Alert Status Pill with Glowing Crimson Beacon */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-red-950/40 border border-red-500/40 text-red-200 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                liveSearchActive
                  ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span className="tracking-wide font-bold uppercase text-[11px] text-red-300">
              {liveSearchActive ? 'Alert Beacon: Misinformation Radar Active' : 'Offline Mode'}
            </span>
            <span className="text-red-500/40">•</span>
            <span className="text-white/60 hidden sm:inline">Constitutional Registries & Live Fact-Checks</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            {lang === 'en' ? (
              <>
                <span className="block text-white">Verify Truth</span>
                <span className="block bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent">
                  Claim by Claim
                </span>
              </>
            ) : (
              <>
                <span className="block text-white">सत्य का अन्वेषण</span>
                <span className="block bg-gradient-to-r from-red-500 via-rose-400 to-red-400 bg-clip-text text-transparent">
                  तथ्य दर तथ्य
                </span>
              </>
            )}
          </h1>

          {/* Investigation Mission Block */}
          <div className="pt-2 max-w-xl space-y-1.5">
            <h4 className="text-xs uppercase font-mono tracking-wider text-red-400 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>Real-Time Evidence Engine</span>
            </h4>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              {lang === 'en'
                ? 'Autonomous multi-source intelligence scanning against viral misinformation, fabricated quotes, and deceptive claims. Cross-referencing official gazettes, court records, and international IFCN fact-checkers.'
                : 'सोशल मीडिया पर फैलने वाली अफवाहों और भ्रामक दावों का सरकारी अभिलेखागारों और निष्पक्ष समाचार एजेंसियों से मिलान कर वास्तविक सत्यापन।'}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-white/60 pt-1">
            <div className="flex items-center gap-1.5 text-red-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real Citations Only</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-300">
              <Database className="w-3.5 h-3.5" />
              <span>Public Registries (PIB, ECI, Courts)</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>IFCN Signatory Code</span>
            </div>
          </div>
        </div>

        {/* Right Column: Caption echoing the Cyber Alert Beacon */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-end items-end text-right space-y-1 pr-4">
          <div className="px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            Cyber Threat Detection
          </div>
          <p className="text-sm font-extrabold text-white">
            TruthLens Investigation Hub
          </p>
          <p className="text-xs text-white/50 max-w-[220px]">
            Zero hallucinations • Traceable primary records.
          </p>
        </div>
      </div>
    </section>
  );
};
