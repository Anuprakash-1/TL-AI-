import React from 'react';
import { Search, Database, Calendar, CheckSquare, AlertTriangle, FileCode } from 'lucide-react';
import { VerificationMethod } from '../types';
import { Language, translations } from '../i18n';

interface MethodologySectionProps {
  method: VerificationMethod;
  limitations: string[];
  lang: Language;
}

export const MethodologySection: React.FC<MethodologySectionProps> = ({
  method,
  limitations,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <FileCode className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t.methodology_title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Search Queries Executed */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            <span>Search Queries Formulated & Executed</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            {method.search_queries.map((q, idx) => (
              <div key={idx} className="truncate">
                • {q}
              </div>
            ))}
          </div>
        </div>

        {/* Repositories & Authority Types */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <span>Source Repositories & Authority Classifications</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-50 dark:bg-navy-950">
            {method.source_types.map((st, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
              >
                {st}
              </span>
            ))}
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Evaluation & Weighting Criteria</span>
          </div>
          <ul className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
            {method.evaluation_criteria.map((crit, idx) => (
              <li key={idx}>{crit}</li>
            ))}
          </ul>
        </div>

        {/* Methodological Limitations */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Methodological Boundaries & Limitations</span>
          </div>
          <ul className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
            {[...method.important_limitations, ...limitations].map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
