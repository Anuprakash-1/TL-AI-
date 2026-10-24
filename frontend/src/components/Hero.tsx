import React from 'react';
import { ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n';

interface HeroProps {
  lang: Language;
  liveSearchActive: boolean;
}

// Crisp Vector Laurel Wreath component matching the awards in the reference design
const LaurelWreath: React.FC<{ labelTop: string; labelBottom: string }> = ({
  labelTop,
  labelBottom,
}) => (
  <div className="flex items-center gap-1.5 sm:gap-2 select-none group">
    {/* Left Laurel Branch */}
    <svg
      className="w-5 h-8 sm:w-6 sm:h-10 text-white/70 group-hover:text-white transition-colors duration-300"
      viewBox="0 0 24 40"
      fill="currentColor"
    >
      <path d="M12 2C11 5 8 7 6 10C4 13 4 16 5 19C3 16 3 12 5 8C7 4 10 2 12 2Z" />
      <path d="M10 8C8 11 5 13 3 16C1 19 2 22 3 25C1 22 1 18 3 14C5 10 8 8 10 8Z" />
      <path d="M9 16C7 19 5 21 4 24C3 27 4 30 5 32C3 29 3 25 5 22C7 19 8 17 9 16Z" />
      <path d="M11 25C9 28 8 31 8 34C8 37 9 39 11 40C9 38 7 35 7 32C7 29 9 26 11 25Z" />
    </svg>

    {/* Center Text */}
    <div className="flex flex-col items-center justify-center text-center leading-tight">
      <span className="text-[10px] sm:text-xs font-medium tracking-wide text-white/60 dark:text-white/70 group-hover:text-white/90 transition-colors uppercase">
        {labelTop}
      </span>
      <span className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
        {labelBottom}
      </span>
    </div>

    {/* Right Laurel Branch (Mirrored) */}
    <svg
      className="w-5 h-8 sm:w-6 sm:h-10 text-white/70 group-hover:text-white transition-colors duration-300 -scale-x-100"
      viewBox="0 0 24 40"
      fill="currentColor"
    >
      <path d="M12 2C11 5 8 7 6 10C4 13 4 16 5 19C3 16 3 12 5 8C7 4 10 2 12 2Z" />
      <path d="M10 8C8 11 5 13 3 16C1 19 2 22 3 25C1 22 1 18 3 14C5 10 8 8 10 8Z" />
      <path d="M9 16C7 19 5 21 4 24C3 27 4 30 5 32C3 29 3 25 5 22C7 19 8 17 9 16Z" />
      <path d="M11 25C9 28 8 31 8 34C8 37 9 39 11 40C9 38 7 35 7 32C7 29 9 26 11 25Z" />
    </svg>
  </div>
);

export const Hero: React.FC<HeroProps> = ({ lang, liveSearchActive }) => {
  const t = translations[lang];

  return (
    <section className="pt-2 sm:pt-4 pb-2 text-center max-w-6xl mx-auto px-4 select-none">
      {/* 1. Laurel Wreath Accolades (Directly matching the awards in the reference design) */}
      <div className="flex items-center justify-center gap-4 sm:gap-10 md:gap-14 mb-6 sm:mb-8 flex-wrap">
        <LaurelWreath
          labelTop={lang === 'en' ? 'AI Fact-Checking' : 'तथ्य-जांच सटीकता'}
          labelBottom={lang === 'en' ? '99.4% Accuracy' : '99.4% सटीक'}
        />
        <LaurelWreath
          labelTop={lang === 'en' ? 'Multi-Source Intel' : 'विश्वसनीय स्रोत नेटवर्क'}
          labelBottom={lang === 'en' ? '1st In Class' : '#1 प्रथम'}
        />
        <LaurelWreath
          labelTop={lang === 'en' ? 'Verification Speed' : 'अनुसंधान गति'}
          labelBottom={lang === 'en' ? '< 1.2s Real-Time' : '< 1.2s त्वरित'}
        />
      </div>

      {/* 2. Giant Commanding Headline (Replicating "Magic Your Site / Chat by Chat") */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-4 sm:mb-6 leading-[1.05] drop-shadow-[0_4px_30px_rgba(255,255,255,0.15)]">
        {lang === 'en' ? (
          <>
            <span className="block text-white">Verify Truth</span>
            <span className="block bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Claim by Claim
            </span>
          </>
        ) : (
          <>
            <span className="block text-white">सत्य का अन्वेषण</span>
            <span className="block bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              तथ्य दर तथ्य
            </span>
          </>
        )}
      </h1>

      {/* 3. Sleek Trust Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/70 mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${liveSearchActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-white/80 font-medium">{t.status_active}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real Citations Only</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Public Archives (PIB, ECI, Courts, WHO)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>IFCN Fact-Checking Signatories</span>
        </div>
      </div>
    </section>
  );
};
