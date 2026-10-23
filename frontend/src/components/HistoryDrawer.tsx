import React from 'react';
import { X, Trash2, History, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';
import { getVerdictBadgeStyle } from './VerdictHeader';
import { Language, translations } from '../i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectReport: (reportId: string) => void;
  onClearHistory: () => void;
  lang: Language;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onClearHistory,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.history_title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-mono">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">{t.history_empty}</p>
            </div>
          ) : (
            history.map((item) => {
              const style = getVerdictBadgeStyle(item.verdict);
              const VerdictIcon = style.icon;

              return (
                <div
                  key={item.report_id}
                  onClick={() => {
                    onSelectReport(item.report_id);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/60 hover:bg-blue-50/50 dark:hover:bg-navy-800 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${style.bg}`}>
                      <VerdictIcon className="w-3 h-3" />
                      <span>{item.verdict}</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                    {item.headline || item.submitted_content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span>{item.report_id}</span>
                    <span className="flex items-center gap-0.5 text-blue-500 font-sans">
                      View report <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Clear History */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/50">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.btn_clear_history}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
