import React from 'react';
import { Shield, Sun, Moon, History, BookOpen, Settings, Globe, Sparkles } from 'lucide-react';
import { Language, translations } from '../i18n';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onOpenHistory: () => void;
  onOpenMethodology: () => void;
  onOpenSettings: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  isDark,
  setIsDark,
  onOpenHistory,
  onOpenMethodology,
  onOpenSettings,
  historyCount,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl text-white transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with BETA badge (Replicating "Wegic BETA" in reference) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white">
              {t.brand}
            </span>
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
              BETA
            </span>
          </div>
        </div>

        {/* Right actions (Replicating "Build your site" pill button + utility icons) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Methodology Trigger */}
          <button
            onClick={onOpenMethodology}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Fact-Checking Standards & Ethics"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.nav_methodology}</span>
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Past Verifications"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav_history}</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-white text-neutral-950">
                {historyCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Settings & API Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Primary High-Contrast Pill CTA Button (Replicating "Build your site" in reference) */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const inputEl = document.querySelector('textarea, input[type="url"]') as HTMLElement;
              inputEl?.focus();
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-white text-neutral-950 hover:bg-slate-100 transition-all duration-200 shadow-lg active:scale-95 ml-1"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[11px] font-bold">
              T
            </div>
            <span>{lang === 'en' ? 'Verify News' : 'तथ्य-जांच'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
