import React, { useState, useEffect } from 'react';
import {
  Search,
  Link as LinkIcon,
  FileText,
  Globe,
  Calendar,
  MapPin,
  Sparkles,
  X,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

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
      sampleText:
        'Reserve Bank of India has embedded NGC Nano GPS Chips in ₹2000 notes allowing satellites to track money underground.',
    },
    {
      id: 'DEMO-TL-ISRO3',
      label: lang === 'en' ? 'Chandrayaan-3 Moon Landing' : 'चंद्रयान-3 की सॉफ्ट लैंडिंग',
      sampleText:
        'India Chandrayaan-3 successfully completed soft landing on lunar south pole on August 23, 2023.',
    },
    {
      id: 'DEMO-TL-KANYASUMANGALA',
      label: lang === 'en' ? 'Govt ₹50,000 Scheme Forward' : 'कन्या सुमंगला ₹50,000 मैसेज',
      sampleText:
        'वायरल मैसेज: केंद्र सरकार की नई योजना के तहत हर बेटी को ₹50,000 की राशि सीधे बैंक खाते में दी जा रही है।',
    },
    {
      id: 'DEMO-TL-SOLARSTORM',
      label: lang === 'en' ? 'NASA Internet Apocalypse' : 'नासा सोलर स्टॉर्म इंटरनेट ब्लैकआउट',
      sampleText:
        'NASA officially warned of an impending solar superstorm that will shut down the internet worldwide for 6 months.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-2 select-none">
      {/* Wegic-Style Floating AI Assistant Glassmorphism Box */}
      <div className="bg-neutral-900/75 dark:bg-black/75 backdrop-blur-2xl border border-white/15 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 transition-all duration-300 hover:border-white/25">
        {/* Top Assistant Greeting Line (Replicating "👋 I'm Wegic, the AI web designer & developer by your side!") */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <span className="text-base sm:text-lg">👋</span>
            <span className="text-white/80">
              {lang === 'en'
                ? "I'm TruthLens, the AI misinformation & fact verification engine by your side!"
                : 'नमस्ते, मैं ट्रूथ-लेंस हूँ, आपका निष्पक्ष AI तथ्य-सत्यापन सहायक!'}
            </span>
          </div>

          {/* Mode Switcher Tabs (Text / URL) */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.tab_text}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{t.tab_url}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {activeTab === 'text' ? (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Chat with me or paste any news claim, statement, viral forward, or article...'
                    : 'मुझसे पूछें या कोई भी समाचार, सोशल मीडिया दावा, भाषण या वायरल संदेश यहाँ पेस्ट करें...'
                }
                rows={4}
                maxLength={15000}
                className="w-full p-4 rounded-xl sm:rounded-2xl bg-neutral-950/60 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 text-sm leading-relaxed resize-y selection:bg-cyan-500/30"
              />
              <div className="flex justify-between items-center mt-1 px-1 text-[11px] text-white/40">
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
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl sm:rounded-2xl bg-neutral-950/60 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 text-sm"
                />
                <LinkIcon className="w-5 h-5 absolute left-3.5 top-3.5 text-white/40" />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
                <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  SSRF Protection Active: Internal network domains (127.0.0.1, 10.x, metadata) are blocked.
                </span>
              </div>
            </div>
          )}

          {/* Prompt Suggestions (Directly replicating the "⚡ Reference: I want a website..." row in reference) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-white/60">
            <span className="flex items-center gap-1 font-semibold text-white/80 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Reference:</span>
            </span>
            {sampleChips.map((chip, index) => (
              <React.Fragment key={chip.id}>
                {index > 0 && <span className="text-white/20">|</span>}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setText(chip.sampleText);
                    onSelectDemo(chip.id);
                  }}
                  className="hover:text-white hover:underline transition-colors text-white/70"
                >
                  "{chip.label}"
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Advanced Filter Collapsible Bar */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showFilters ? 'Hide Advanced Filters' : 'Advanced Filters (Country, Language, Date)'}</span>
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-white/10 animate-fadeIn">
                {/* Country Context */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {t.filter_country}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                  >
                    <option value="IN">India (PIB, ECI, Courts, Indian News)</option>
                    <option value="US">United States (AP, Reuters, Federal Archives)</option>
                    <option value="GB">United Kingdom (BBC, Reuters, UK Govt)</option>
                    <option value="GLOBAL">Global / International (WHO, UN, International Wires)</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    {t.filter_lang}
                  </label>
                  <select
                    value={inputLang}
                    onChange={(e) => setInputLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                  >
                    <option value="auto">Auto-detect (English / हिंदी)</option>
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                {/* As-Of Date */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {t.filter_date}
                  </label>
                  <input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {(text || url) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white transition-colors"
              >
                {t.btn_clear}
              </button>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={isLoading || (activeTab === 'text' ? !text.trim() : !url.trim())}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-neutral-950 bg-white hover:bg-slate-100 shadow-xl transition-all duration-200 active:scale-95 ${
                  isLoading || (activeTab === 'text' ? !text.trim() : !url.trim())
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:shadow-white/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t.btn_verifying}</span>
                  </>
                ) : (
                  <>
                    <span>{t.btn_verify}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* "SCROLL TO EXPLORE" Indicator (Directly replicating the bottom indicator in reference) */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => {
            const nextElem =
              document.getElementById('section-demos') ||
              document.getElementById('section-methodology');
            nextElem?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white transition-all focus:outline-none"
        >
          <span>SCROLL TO EXPLORE</span>
          {/* Animated circular indicator matching reference */}
          <div className="w-5 h-5 rounded-full border border-white/40 group-hover:border-white flex items-center justify-center relative">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 animate-spin-slow opacity-60"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="20 40"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};
