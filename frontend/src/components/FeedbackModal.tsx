import React, { useState } from 'react';
import { X, Flag, Check, AlertCircle } from 'lucide-react';
import { submitFeedback } from '../api';
import { Language, translations } from '../i18n';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  claimId?: string;
  lang: Language;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  reportId,
  claimId,
  lang,
}) => {
  const t = translations[lang];
  const [feedbackType, setFeedbackType] = useState('incorrect_verdict');
  const [comments, setComments] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitFeedback({
        report_id: reportId,
        claim_id: claimId,
        feedback_type: feedbackType,
        comments: comments.trim(),
        user_email: userEmail.trim() || undefined,
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        setComments('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'en' ? 'Submit Correction or Feedback' : 'सुधार या प्रतिक्रिया दर्ज करें'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Report ID
              </label>
              <input
                type="text"
                readOnly
                value={reportId}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-navy-950 font-mono text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Feedback Type
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="incorrect_verdict">Flag Incorrect Verdict</option>
                <option value="broken_link">Broken or Inaccessible Citation Link</option>
                <option value="new_evidence">Submit Additional Evidence or Document</option>
                <option value="missing_context">Missing Crucial Context</option>
                <option value="other">Other Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Detailed Observation / Supporting Link
              </label>
              <textarea
                required
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Explain the discrepancy, provide a link to the primary government gazette or official denial..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email (Optional — for follow-up notifications)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="researcher@example.org"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
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
                disabled={isSubmitting || !comments.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
