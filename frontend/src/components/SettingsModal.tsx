import React, { useState } from 'react';
import { X, Settings, Key, CheckCircle2, Shield, Info, Database } from 'lucide-react';
import { Language } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  liveSearchReady: boolean;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  liveSearchReady,
  lang,
}) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Engine Settings & Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Manage search integrations and AI keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Status */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            System Subsystems Status
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Database className="w-4 h-4 text-blue-500" />
              Live Search Providers (Google News RSS & DDGS)
            </span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${liveSearchReady ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
              {liveSearchReady ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Shield className="w-4 h-4 text-cyan-500" />
              SSRF & Prompt Injection Filters
            </span>
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
              ACTIVE
            </span>
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              Google Gemini / AI Studio API Key (Optional)
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-navy-950 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Optional: TruthLens operates out-of-the-box using its built-in factual heuristic engine and live web search. Supplying a Gemini API key enables high-level semantic reasoning and summary synthesis. Keys are stored locally in your session and never logged.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
