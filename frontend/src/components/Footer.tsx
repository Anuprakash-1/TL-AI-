import React from 'react';
import { Shield, Globe } from 'lucide-react';
import { Language, translations } from '../i18n';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="w-full border-t border-white/10 bg-neutral-950/80 backdrop-blur-xl text-white mt-16 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-white" />
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

          <div className="flex items-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              English & हिंदी Fact-Checking
            </span>
            <span>•</span>
            <span>Strict SSRF Protection</span>
            <span>•</span>
            <span>Zero Fabricated Citations</span>
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
          <p className="flex items-center gap-1">
            Built for factual integrity & transparent journalism
          </p>
        </div>
      </div>
    </footer>
  );
};
