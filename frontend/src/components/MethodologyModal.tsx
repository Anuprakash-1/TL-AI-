import React from 'react';
import { X, BookOpen, ShieldCheck, Scale, Lock, EyeOff, CheckCircle2 } from 'lucide-react';
import { Language } from '../i18n';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-navy-800 text-indigo-600 dark:text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Verification Standards, Principles & Security
              </h3>
              <p className="text-xs text-slate-400">
                Ethical fact-checking guidelines & system safety disclosures
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

        {/* Content Sections */}
        <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
          {/* Principle 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" />
              1. Non-Partisanship & Evidence-Driven Fairness
            </h4>
            <p>
              TruthLens AI applies an identical evidentiary standard to all claims regardless of the political, religious, or commercial affiliation of the claimant. Findings are based solely on primary records, verified datasets, and corroborated journalistic reporting.
            </p>
          </div>

          {/* Principle 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              2. Absolute Transparency of Sources
            </h4>
            <p>
              Every claim checked must link directly to real, publicly accessible sources. We never fabricate citations or synthesize synthetic quotation texts. If a source cannot be accessed or indexed, it is openly marked as inaccessible rather than presumed.
            </p>
          </div>

          {/* Principle 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              3. Honest Communication of Uncertainty
            </h4>
            <p>
              Absence of evidence is never equated with proof of falsehood. When available evidence is ambiguous or incomplete, claims receive the <strong className="text-slate-800 dark:text-slate-200">UNVERIFIED</strong> or <strong className="text-slate-800 dark:text-slate-200">DISPUTED</strong> classification. Arbitrary percentages or pseudoscientific probabilities are strictly forbidden.
            </p>
          </div>

          {/* Security & SSRF */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              4. Server-Side SSRF Protection & Content Sanitization
            </h4>
            <p>
              When analyzing submitted URLs, TruthLens runs strict pre-flight DNS and IP validation. Private networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, loopbacks, and cloud metadata 169.254.169.254) are permanently blocked. Submitted webpage contents are isolated in untrusted execution sandboxes, rendering prompt injection attempts inert.
            </p>
          </div>

          {/* Privacy */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-500" />
              5. Privacy & Data Minimization
            </h4>
            <p>
              Users do not need to register or provide personal credentials to verify claims. Verification history is kept locally in your browser storage and ephemeral backend caches. You can clear your history completely at any time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Close & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
