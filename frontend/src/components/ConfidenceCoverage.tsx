import React from 'react';
import { ShieldCheck, Layers, Info } from 'lucide-react';
import { ConfidenceLevel, CoverageLevel } from '../types';
import { Language, translations } from '../i18n';

interface ConfidenceCoverageProps {
  confidence: ConfidenceLevel;
  confidenceReason: string;
  coverage: CoverageLevel;
  coverageReason: string;
  lang: Language;
}

export const ConfidenceCoverage: React.FC<ConfidenceCoverageProps> = ({
  confidence,
  confidenceReason,
  coverage,
  coverageReason,
  lang,
}) => {
  const t = translations[lang];

  const getLevelColor = (lvl: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (lvl) {
      case 'HIGH':
        return 'bg-emerald-500 text-white';
      case 'MEDIUM':
        return 'bg-amber-500 text-white';
      case 'LOW':
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <ShieldCheck className="w-5 h-5 text-blue-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t.confidence_title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assessment Confidence */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.confidence_label}
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${getLevelColor(confidence)}`}>
              {confidence}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {confidenceReason}
          </p>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200 dark:border-slate-800/60">
            <Info className="w-3 h-3 shrink-0" />
            <span>Reflects how conclusively the assembled evidence supports the final verdict.</span>
          </div>
        </div>

        {/* Research Coverage */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.coverage_label}
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${getLevelColor(coverage)}`}>
              {coverage}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {coverageReason}
          </p>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200 dark:border-slate-800/60">
            <Layers className="w-3 h-3 shrink-0" />
            <span>Note: High coverage does not imply truth; it means extensive sources were examined.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
