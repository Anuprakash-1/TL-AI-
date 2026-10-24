import React from 'react';
import { Shield, Sun, Moon, History, BookOpen, Settings, Globe, Search, ArrowRight } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-2xl text-white transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Mark (Matching the bold "YB" in srtp_theme.jpg) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-emerald-500 to-teal-500 p-[1px] shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center font-black text-sm tracking-tighter text-white">
              TL
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              {t.brand}
            </span>
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0 Live
            </span>
          </div>
        </div>

        {/* Center Minimalist Navigation Links (Matching srtp_theme.jpg header) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-white/70 tracking-wide">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-amber-400 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('section-demos');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-emerald-400 transition-colors"
          >
            Investigations
          </button>
          <button
            onClick={onOpenMethodology}
            className="hover:text-teal-300 transition-colors"
          >
            Methodology
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('section-methodology');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Pipeline
          </button>
        </nav>

        {/* Right Actions: Search + Pill Capsule Language Switch (Matching "IDN / ENG" in srtp_theme.jpg) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Past Verifications"
          >
            <History className="w-4 h-4 text-teal-400" />
            {historyCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center">
                {historyCount}
              </span>
            )}
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
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-300" />}
          </button>

          {/* SRTP-Style Capsule Pill Button: "EN / IDN" style language switch */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/30 hover:border-white text-white bg-white/5 hover:bg-white/10 transition-all shadow-sm"
            title="Switch Language / भाषा बदलें"
          >
            <span>{lang === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const inputEl = document.querySelector('textarea, input[type="url"]') as HTMLElement;
              inputEl?.focus();
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-neutral-950 hover:brightness-110 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
          >
            <span>Verify News</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
