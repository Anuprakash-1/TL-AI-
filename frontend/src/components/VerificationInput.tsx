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
  AlertTriangle,
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
      {/* Cyber Alert Carbon Glassmorphic Card */}
      <div className="bg-neutral-950/80 dark:bg-black/85 backdrop-blur-2xl border border-red-500/25 hover:border-red-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.12)] p-4 sm:p-6 transition-all duration-300 relative overflow-hidden group">
        {/* Top Glowing Crimson Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_10px_#ef4444]" />

        {/* Top Header Line */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
            <span className="text-white/80">
              {lang === 'en'
                ? 'TruthLens AI • Misinformation Verification Terminal'
                : 'ट्रूथ-लेंस AI • भ्रामक सूचना सत्यापन टर्मिनल'}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/30'
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
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/30'
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
                    ? 'Paste viral claim, statement, news excerpt, or social media forward to scan for misinformation...'
                    : 'कोई भी समाचार, सोशल मीडिया दावा, भाषण या वायरल संदेश यहाँ पेस्ट करें...'
                }
                rows={4}
                maxLength={15000}
                className="w-full p-4 rounded-xl sm:rounded-2xl bg-neutral-950/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm leading-relaxed resize-y selection:bg-red-500/30"
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
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl sm:rounded-2xl bg-neutral-950/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
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
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>
                  SSRF Protection Active: Internal network domains (127.0.0.1, 10.x, metadata) are blocked.
                </span>
              </div>
            </div>
          )}

          {/* Quick Case Study Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-white/60">
            <span className="flex items-center gap-1 font-semibold text-red-400 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reference Cases:</span>
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
                  className="hover:text-red-300 hover:underline transition-colors text-white/70"
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
              <SlidersHorizontal className="w-3 h-3 text-red-400" />
              <span>{showFilters ? 'Hide Advanced Filters' : 'Advanced Filters (Country, Language, Date)'}</span>
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-white/10 animate-fadeIn">
                {/* Country Context */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {t.filter_country}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-400"
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
                    <Globe className="w-3.5 h-3.5 text-rose-400" />
                    {t.filter_lang}
                  </label>
                  <select
                    value={inputLang}
                    onChange={(e) => setInputLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                  >
                    <option value="auto">Auto-detect (English / हिंदी)</option>
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                {/* As-Of Date */}
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                    {t.filter_date}
                  </label>
                  <input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950/80 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-400"
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
                className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 shadow-lg shadow-red-600/30 transition-all duration-200 active:scale-95 ${
                  isLoading || (activeTab === 'text' ? !text.trim() : !url.trim())
                    ? 'opacity-40 cursor-not-allowed'
                    : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* "SCROLL TO EXPLORE" Indicator with Crimson Beacon */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => {
            const nextElem =
              document.getElementById('section-demos') ||
              document.getElementById('section-methodology');
            nextElem?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-white/50 hover:text-red-400 transition-all focus:outline-none"
        >
          <span>SCROLL TO EXPLORE</span>
          <div className="w-5 h-5 rounded-full border border-white/30 group-hover:border-red-400 flex items-center justify-center relative transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" />
          </div>
        </button>
      </div>
    </div>
  );
};
