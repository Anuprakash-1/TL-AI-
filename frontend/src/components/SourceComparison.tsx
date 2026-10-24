import React from 'react';
import { Columns, CheckCircle2, AlertCircle, RefreshCw, GitCompare } from 'lucide-react';
import { SourceComparison as SourceComparisonType } from '../types';
import { Language, translations } from '../i18n';

interface SourceComparisonProps {
  comparison?: SourceComparisonType | null;
  lang: Language;
}

export const SourceComparison: React.FC<SourceComparisonProps> = ({ comparison, lang }) => {
  const t = translations[lang];

  if (!comparison) return null;

  return (
    <div className="bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.source_comparison_title}
          </h3>
        </div>
        {comparison.common_origin_suspected && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Common Wire / Syndication Echo Suspected
          </span>
        )}
      </div>

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source A */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-cyan-400">
            Source Assessment A
          </span>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {comparison.source_a}
          </p>
        </div>

        {/* Source B */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
            Source Assessment B
          </span>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {comparison.source_b}
          </p>
        </div>
      </div>

      {/* Areas of Agreement & Disagreement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Agreements */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Areas of Agreement</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
            {comparison.areas_of_agreement.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Disagreements */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>Key Areas of Conflict or Nuance</span>
          </div>
          {comparison.areas_of_disagreement && comparison.areas_of_disagreement.length > 0 ? (
            <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
              {comparison.areas_of_disagreement.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No material disagreement found between examined sources.
            </p>
          )}
        </div>
      </div>

      {/* Additional note */}
      {comparison.additional_sources && (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Triangulation: {comparison.additional_sources}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {comparison.comparison_summary}
          </span>
        </div>
      )}
    </div>
  );
};
