import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, FileText, Globe, Calendar, MapPin, Sparkles, X, ShieldAlert } from 'lucide-react';
import { Language, translations } from '../i18n';

interface VerificationInputProps {
  lang: Language;
  onSubmit: (payload: {
    text?: string;
    url?: string;
    language?: string;
    country?: string;
    as_of_date?: string | null;
  }) => void;
  isLoading: boolean;
  onSelectDemo: (demoId: string) => void;
}

export const VerificationInput: React.FC<VerificationInputProps> = ({
  lang,
  onSubmit,
  isLoading,
  onSelectDemo,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [country, setCountry] = useState('IN');
  const [inputLang, setInputLang] = useState('auto');
  const [asOfDate, setAsOfDate] = useState('');

  // Handle Ctrl+Enter submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, url, activeTab, country, inputLang, asOfDate, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'text') {
      if (!text.trim()) return;
      onSubmit({
        text: text.trim(),
        url: undefined,
        language: inputLang,
        country,
        as_of_date: asOfDate || null,
      });
    } else {
      if (!url.trim()) return;
      onSubmit({
        text: undefined,
        url: url.trim(),
        language: inputLang,
        country,
        as_of_date: asOfDate || null,
      });
    }
  };

  const handleClear = () => {
    setText('');
    setUrl('');
  };

  const sampleChips = [
    {
      id: 'DEMO-TL-RBI2000',
      label: lang === 'en' ? 'RBI ₹2000 GPS Chip' : '₹2000 नोट में जीपीएस चिप',
      sampleText: 'Reserve Bank of India has embedded NGC Nano GPS Chips in ₹2000 notes allowing satellites to track money underground.',
    },
    {
      id: 'DEMO-TL-ISRO3',
      label: lang === 'en' ? 'Chandrayaan-3 Moon Landing' : 'चंद्रयान-3 की सॉफ्ट लैंडिंग',
      sampleText: 'India Chandrayaan-3 successfully completed soft landing on lunar south pole on August 23, 2023.',
    },
    {
      id: 'DEMO-TL-KANYASUMANGALA',
      label: lang === 'en' ? 'Govt ₹50,000 Scheme Forward' : 'कन्या सुमंगला ₹50,000 मैसेज',
      sampleText: 'वायरल मैसेज: केंद्र सरकार की नई योजना के तहत हर बेटी को ₹50,000 की राशि सीधे बैंक खाते में दी जा रही है।',
    },
    {
      id: 'DEMO-TL-SOLARSTORM',
      label: lang === 'en' ? 'NASA Internet Apocalypse' : 'नासा सोलर स्टॉर्म इंटरनेट ब्लैकआउट',
      sampleText: 'NASA officially warned of an impending solar superstorm that will shut down the internet worldwide for 6 months.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-2">
      <div className="bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden transition-all duration-200">
        {/* Tab headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tab_text}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>{t.tab_url}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {activeTab === 'text' ? (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.placeholder_text}
                rows={5}
                maxLength={15000}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed resize-y"
              />
              <div className="flex justify-between items-center mt-1 px-1 text-[11px] text-slate-400">
                <span>Ctrl + Enter to verify</span>
                <span>
                  {text.length} / 15,000 {t.chars_limit}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t.placeholder_url}
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <LinkIcon className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  SSRF Protection Active: Internal network domains (127.0.0.1, 10.x, metadata) are blocked. If the article is behind a paywall, please copy and paste the text in the Text tab.
                </span>
              </div>
            </div>
          )}

          {/* Quick Sample Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.quick_tests}
            </span>
            {sampleChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setActiveTab('text');
                  setText(chip.sampleText);
                  onSelectDemo(chip.id);
                }}
                className="px-2.5 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-cyan-500 hover:bg-blue-50 dark:hover:bg-navy-700 transition-all font-medium"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Filter options row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Country Context */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {t.filter_country}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="IN">India (PIB, ECI, Courts, Indian News)</option>
                <option value="US">United States (AP, Reuters, Federal Archives)</option>
                <option value="GB">United Kingdom (BBC, Reuters, UK Govt)</option>
                <option value="GLOBAL">Global / International (WHO, UN, International Wires)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                {t.filter_lang}
              </label>
              <select
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="auto">Auto-detect (English / हिंदी)</option>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* As-Of Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                {t.filter_date}
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            {(text || url) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {t.btn_clear}
              </button>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={isLoading || (activeTab === 'text' ? !text.trim() : !url.trim())}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
                  isLoading || (activeTab === 'text' ? !text.trim() : !url.trim())
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/25 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.btn_verifying}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t.btn_verify}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
