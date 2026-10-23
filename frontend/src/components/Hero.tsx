import React from 'react';
import { Search, Database, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../i18n';

interface HeroProps {
  lang: Language;
  liveSearchActive: boolean;
}

export const Hero: React.FC<HeroProps> = ({ lang, liveSearchActive }) => {
  const t = translations[lang];

  return (
    <section className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4">
      {/* Live Status Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border bg-slate-100 dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 mb-6 shadow-sm">
        <span className={`w-2 h-2 rounded-full ${liveSearchActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span>{t.status_active}</span>
        <span className="text-slate-400 dark:text-slate-600">|</span>
        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">{t.status_notice}</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
        {lang === 'en' ? (
          <>
            Verify News & Claims with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              Traceable Evidence
            </span>
          </>
        ) : (
          <>
            साक्ष्यों के साथ करें खबरों का{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              सत्यापन व तथ्य-जांच
            </span>
          </>
        )}
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
        {t.hero_sub}
      </p>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>No AI Guesses — Only Real Citations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="w-4 h-4 text-blue-500" />
          <span>Official Archives (PIB, ECI, Courts, WHO)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          <span>IFCN Fact-Checking Signatories</span>
        </div>
      </div>
    </section>
  );
};
