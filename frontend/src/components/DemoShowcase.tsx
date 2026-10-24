import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Shield, Play } from 'lucide-react';
import { Language, translations } from '../i18n';

interface DemoShowcaseProps {
  onSelectDemo: (demoId: string) => void;
  lang: Language;
}

export const DemoShowcase: React.FC<DemoShowcaseProps> = ({ onSelectDemo, lang }) => {
  const t = translations[lang];
  const [activeSlide, setActiveSlide] = useState(0);

  const demos = [
    {
      id: 'DEMO-TL-RBI2000',
      handle: '@ReserveBankOfIndia',
      sourceOrg: 'RBI & PIB Fact Check',
      title: lang === 'en' ? '₹2000 Note Embedded with Nano GPS Chips' : '₹2000 के नोट में नैनो जीपीएस सैटेलाइट चिप',
      verdict: 'FALSE',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
      icon: XCircle,
      sources: 'AFP Fact Check, RBI Official Notifications, BOOM Live',
      summary:
        lang === 'en'
          ? 'Debunked by direct RBI official clarification and engineering analysis of banknote physical dimensions.'
          : 'आरबीआई द्वारा आधिकारिक खंडन और नोटों की भौतिक संरचना के वैज्ञानिक विश्लेषण से झूठा साबित।',
    },
    {
      id: 'DEMO-TL-ISRO3',
      handle: '@ISRO',
      sourceOrg: 'ISRO & NASA Telemetry',
      title: lang === 'en' ? "Chandrayaan-3 Soft Landing on Moon's South Pole" : 'चंद्रयान-3 की चंद्रमा के दक्षिणी ध्रुव पर ऐतिहासिक लैंडिंग',
      verdict: 'VERIFIED',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      sources: 'ISRO Official Releases, Reuters, NASA Deep Space Network',
      summary:
        lang === 'en'
          ? 'Corroborated by deep space ground telemetry and independent orbital imagery from NASA LRO.'
          : 'इसरो के आधिकारिक टेलीमेट्री डेटा और नासा के ऑर्बिटल इमेजरी द्वारा पूर्णतः प्रमाणित।',
    },
    {
      id: 'DEMO-TL-KANYASUMANGALA',
      handle: '@PIBFactCheck',
      sourceOrg: 'PIB & Ministry of WCD',
      title: lang === 'en' ? 'Govt Free ₹50,000 Direct Cash Scheme for Girls' : 'बेटियों को केंद्र सरकार द्वारा ₹50,000 की मुफ्त नकद सहायता',
      verdict: 'FALSE',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
      icon: XCircle,
      sources: 'PIB Fact Check, Alt News Hindi, WCD Ministry Guidelines',
      summary:
        lang === 'en'
          ? 'PIB declared the circulating link a phishing scam; no central lump-sum cash scheme exists.'
          : 'पीआईबी फैक्ट चेक द्वारा फर्जी घोषित; साइबर फ्रॉड और डाटा चोरी का दुर्भावनापूर्ण लिंक।',
    },
    {
      id: 'DEMO-TL-SOLARSTORM',
      handle: '@NASASun',
      sourceOrg: 'NASA Science Division',
      title: lang === 'en' ? 'NASA Alert: Months-Long Global Internet Apocalypse' : 'नासा की चेतावनी: सोलर स्टॉर्म से 6 महीने का इंटरनेट ब्लैकआउट',
      verdict: 'MISLEADING',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      sources: 'NASA Science, Snopes, ACM SIGCOMM Academic Paper',
      summary:
        lang === 'en'
          ? 'Misattributed academic theoretical paper jargon to an official NASA predictive alert.'
          : 'शोध पत्र के अकादमिक शब्दों को तोड़-मरोड़कर नासा की चेतावनी के रूप में पेश किया गया।',
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 select-none">
      {/* 1. Narrative Intro Section (Directly replicating frame 42 of reference GIF:
             "Hi, I'm Wegic... An AI web designer... With support from three amazing assistants...") */}
      <div className="max-w-3xl mb-12 space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>Hi, I'm</span>
          <span className="font-extrabold tracking-tight px-2.5 py-0.5 rounded-lg bg-white/10 text-white border border-white/20">
            TruthLens
          </span>
        </h3>
        <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
          {lang === 'en'
            ? 'An AI misinformation & fact verification engine by your side.'
            : 'एक निष्पक्ष AI तथ्य-सत्यापन एवं भ्रामक सूचना विश्लेषक आपके साथ।'}
        </p>
        <p className="text-base sm:text-lg text-white/60 leading-relaxed">
          {lang === 'en'
            ? 'With support from official gazettes, international press bureaus, and verified databases, I bring the truth to light.'
            : 'सरकारी गजट, आधिकारिक अभिलेखागार, अंतरराष्ट्रीय समाचार एजेंसियों और प्रमाणित डेटाबेसों के माध्यम से सत्य को सामने लाना।'}
        </p>
        <p className="text-sm font-semibold text-white/90 pt-1">
          {lang === 'en' ? "Let's inspect featured investigations:" : 'प्रमुख सत्यापित मामलों का अवलोकन करें:'}
        </p>
      </div>

      {/* 2. Headline with Faded Watermark & Page Counter (Replicating frame 85 in reference) */}
      <div className="relative mb-8 flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-white/40 block mb-1">
            Featured Evidence Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            RECENT FACT-CHECKS
          </h2>
        </div>
        <div className="text-xs font-mono font-bold text-white/50 tracking-wider">
          <span>1 / 4</span>
        </div>
      </div>

      {/* 3. Dark Sleek Testimonial / Evidence Source Cards (Replicating frame 128 in reference GIF) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <div
              key={demo.id}
              onClick={() => onSelectDemo(demo.id)}
              className="group cursor-pointer rounded-2xl bg-neutral-900/60 dark:bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/30 p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Row: Avatar / Handle / Close-Check icon */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {demo.sourceOrg.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {demo.sourceOrg}
                    </h4>
                    <span className="text-xs text-white/40 font-mono">{demo.handle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${demo.badgeClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{demo.verdict}</span>
                  </span>
                </div>
              </div>

              {/* Title & Summary */}
              <div className="space-y-2 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  "{demo.title}"
                </h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  {demo.summary}
                </p>
              </div>

              {/* Bottom Action / Sources */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span className="truncate max-w-[240px]">
                  Sources: {demo.sources}
                </span>
                <span className="flex items-center gap-1 font-semibold text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  <span>Inspect Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
