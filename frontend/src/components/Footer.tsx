import React from 'react';
import { Shield, ExternalLink, Heart, Globe } from 'lucide-react';
import { Language, translations } from '../i18n';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.brand}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              English & हिंदी Fact-Checking
            </span>
            <span>•</span>
            <span>Strict SSRF Protection</span>
            <span>•</span>
            <span>Zero Fabricated Citations</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center sm:text-left">
          <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Methodological Notice & Legal Disclaimer:
          </p>
          <p>{t.disclaimer}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-6 gap-2">
          <p>{t.footer_rights}</p>
          <p className="flex items-center gap-1">
            Built for factual integrity & transparent journalism
          </p>
        </div>
      </div>
    </footer>
  );
};
