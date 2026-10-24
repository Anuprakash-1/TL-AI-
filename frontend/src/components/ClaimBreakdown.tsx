import React from 'react';
import { Tag, Calendar, HelpCircle, CheckCircle2, XCircle, AlertTriangle, Layers, BookOpen, Lightbulb } from 'lucide-react';
import { ExtractedClaim } from '../types';
import { getVerdictBadgeStyle } from './VerdictHeader';
import { Language, translations } from '../i18n';

interface ClaimBreakdownProps {
  claims: ExtractedClaim[];
  lang: Language;
}

export const ClaimBreakdown: React.FC<ClaimBreakdownProps> = ({ claims, lang }) => {
  const t = translations[lang];

  return (
    <div className="bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Layers className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {t.claim_breakdown_title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-mono">
          {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'}
        </span>
      </div>

      <div className="space-y-4">
        {claims.map((claim, index) => {
          const style = getVerdictBadgeStyle(claim.verdict);
          const VerdictIcon = style.icon;

          return (
            <div
              key={claim.claim_id || index}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-navy-950/60 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Claim Top Meta */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-cyan-400">
                    Claim #{index + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                    {claim.category}
                  </span>
                  {claim.time_period && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {claim.time_period}
                    </span>
                  )}
                </div>

                {/* Claim-Specific Verdict Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${style.bg}`}>
                  <VerdictIcon className="w-4 h-4 shrink-0" />
                  <span>{claim.verdict}</span>
                </div>
              </div>

              {/* Exact Claim Text */}
              <blockquote className="border-l-4 border-blue-500 pl-3 py-0.5 text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 italic">
                "{claim.claim_text}"
              </blockquote>

              {/* Entities Involved */}
              {claim.entities && claim.entities.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Entities identified:</span>
                  {claim.entities.map((ent, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              )}

              {/* Explanation */}
              <div className="p-3.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold block text-slate-900 dark:text-slate-200 mb-1">
                  Findings & Assessment:
                </span>
                {claim.explanation}
              </div>

              {/* What Evidence Establishes */}
              {claim.what_evidence_establishes && (
                <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs sm:text-sm space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-cyan-300">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>What Evidence Establishes:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 pl-5">
                    {claim.what_evidence_establishes}
                  </p>
                </div>
              )}

              {/* Corrected / Verified Reality */}
              {claim.corrected_information && (
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 text-xs sm:text-sm space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Corrected / Accurate Information:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 pl-5 font-medium">
                    {claim.corrected_information}
                  </p>
                </div>
              )}

              {/* Remaining Uncertainties if any */}
              {claim.remaining_uncertainties && claim.remaining_uncertainties.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Remaining Uncertainties / Caveats:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 pl-1">
                    {claim.remaining_uncertainties.map((unc, uIdx) => (
                      <li key={uIdx}>{unc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
