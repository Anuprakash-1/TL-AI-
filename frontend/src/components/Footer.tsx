import React from 'react';
import { Shield, Globe, ShieldAlert } from 'lucide-react';
import { Language, translations } from '../i18n';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="w-full border-t border-white/10 bg-black/85 backdrop-blur-2xl text-white mt-16 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.5)]">
              TL
            </div>
            <div>
              <span className="font-extrabold text-base text-white">
                {t.brand}
              </span>
              <p className="text-xs text-white/50">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/60">
            <span className="flex items-center gap-1.5 text-red-400">
              <Globe className="w-3.5 h-3.5" />
              English & हिंदी Dual Engine
            </span>
            <span>•</span>
            <span className="text-rose-300">Constitutional Archive Cross-Referencing</span>
            <span>•</span>
            <span className="text-red-400">Zero Fabricated Citations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/50 leading-relaxed text-center sm:text-left">
          <p className="font-semibold text-white/80 mb-1">
            Methodological Notice & Legal Disclaimer:
          </p>
          <p>{t.disclaimer}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 border-t border-white/10 pt-6 gap-2">
          <p>{t.footer_rights}</p>
          <p className="font-mono text-red-400/80 tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>TruthLens AI • Independent Misinformation Detection & Verification</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
