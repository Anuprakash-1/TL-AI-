import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, XCircle, Info, Calendar, ShieldCheck, Filter } from 'lucide-react';
import { EvidenceSource, EvidenceRelation } from '../types';
import { Language, translations } from '../i18n';

interface EvidencePanelProps {
  sources: EvidenceSource[];
  lang: Language;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ sources, lang }) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<'ALL' | EvidenceRelation>('ALL');

  const filteredSources = sources.filter((s) => {
    if (filter === 'ALL') return true;
    return s.evidence_relation === filter;
  });

  const getRelationBadge = (rel: EvidenceRelation) => {
    switch (rel) {
      case 'SUPPORTS':
        return {
          label: t.filter_supports,
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'CONTRADICTS':
        return {
          label: t.filter_contradicts,
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
          icon: XCircle,
        };
      case 'CONTEXT':
      default:
        return {
          label: t.filter_context,
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          icon: Info,
        };
    }
  };

  const counts = {
    ALL: sources.length,
    SUPPORTS: sources.filter((s) => s.evidence_relation === 'SUPPORTS').length,
    CONTRADICTS: sources.filter((s) => s.evidence_relation === 'CONTRADICTS').length,
    CONTEXT: sources.filter((s) => s.evidence_relation === 'CONTEXT').length,
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.evidence_panel_title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-mono">
              {sources.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real retrieved documents and verifiable articles. Citations link directly to primary publishers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.filter_all_sources} ({counts.ALL})
          </button>
          <button
            onClick={() => setFilter('CONTRADICTS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter === 'CONTRADICTS'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-red-500'
            }`}
          >
            {t.filter_contradicts} ({counts.CONTRADICTS})
          </button>
          <button
            onClick={() => setFilter('SUPPORTS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter === 'SUPPORTS'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500'
            }`}
          >
            {t.filter_supports} ({counts.SUPPORTS})
          </button>
          <button
            onClick={() => setFilter('CONTEXT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter === 'CONTEXT'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-blue-500'
            }`}
          >
            {t.filter_context} ({counts.CONTEXT})
          </button>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {filteredSources.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-500">
            No sources found under the "{filter}" category.
          </p>
        ) : (
          filteredSources.map((source, index) => {
            const relBadge = getRelationBadge(source.evidence_relation);
            const RelIcon = relBadge.icon;

            return (
              <div
                key={index}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/40 hover:bg-slate-50 dark:hover:bg-navy-950/80 transition-all space-y-3"
              >
                {/* Source Top Line */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {source.publisher}
                    </span>
                    {source.domain_authority_notes && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-navy-800 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-900">
                        <ShieldCheck className="w-3 h-3" />
                        {source.domain_authority_notes.replace(/_/g, ' ')}
                      </span>
                    )}
                    {source.published_at && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {source.published_at.slice(0, 10)}
                      </span>
                    )}
                  </div>

                  {/* Relation Badge */}
                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${relBadge.bg}`}>
                    <RelIcon className="w-3.5 h-3.5" />
                    <span>{relBadge.label}</span>
                  </div>
                </div>

                {/* Source Title & Real Link */}
                <div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-start gap-1.5 group"
                  >
                    <span>{source.title}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 mt-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono break-all mt-0.5">
                    {source.url}
                  </p>
                </div>

                {/* Excerpt Block */}
                <blockquote className="p-3.5 rounded-lg bg-white dark:bg-navy-900 border-l-4 border-slate-400 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{source.relevant_excerpt}"
                </blockquote>

                {/* Relevance Explanation */}
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                    {t.why_evidence_matters}
                  </span>
                  <span>{source.relevance_explanation}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
