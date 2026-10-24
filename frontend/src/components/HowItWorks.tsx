import React from 'react';
import { FileSearch, Search, ShieldCheck, Scale, CheckCircle, HelpCircle } from 'lucide-react';
import { Language, translations } from '../i18n';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = translations[lang];

  const steps = [
    {
      num: '01',
      title: lang === 'en' ? 'Claim Extraction' : 'दावों का पृथक्करण',
      desc:
        lang === 'en'
          ? 'Parses articles into discrete empirical assertions, identifying individuals, institutions, locations, and timeframes.'
          : 'पूरे लेख या संदेश से व्यक्तियों, तिथियों व संस्थानों से जुड़े वास्तविक तथ्यात्मक दावों की पहचान।',
      icon: FileSearch,
    },
    {
      num: '02',
      title: lang === 'en' ? 'Live Web Research' : 'लाइव वेब अनुसंधान',
      desc:
        lang === 'en'
          ? 'Formulates multi-angle search queries across Google News RSS, DDGS, and official government archives (PIB, ECI, Courts). Never fabricated.'
          : 'सर्च इंडेक्स और सरकारी अभिलेखागारों (PIB, सुप्रीम कोर्ट, चुनाव आयोग) में वास्तविक लाइव खोज।',
      icon: Search,
    },
    {
      num: '03',
      title: lang === 'en' ? 'Authority Evaluation' : 'स्रोत विश्वसनीयता का मूल्यांकन',
      desc:
        lang === 'en'
          ? 'Distinguishes primary documentation and certified fact-checkers from wire syndication echo chambers.'
          : 'प्राथमिक दस्तावेजों तथा IFCN प्रमाणित तथ्य-जांचकों की पहचान कर उनकी साख की जांच।',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: lang === 'en' ? 'Evidence Comparison' : 'साक्ष्यों का मिलान व तुलना',
      desc:
        lang === 'en'
          ? 'Extracts verbatim quotations and classifies relation as Supports, Contradicts, or Context against the exact claim.'
          : 'प्रत्येक स्रोत से सीधे उद्धरण लेकर यह तय करना कि साक्ष्य दावे का समर्थन करता है, खंडन करता है या केवल संदर्भ देता है।',
      icon: Scale,
    },
    {
      num: '05',
      title: lang === 'en' ? '9-Verdict Standard' : '9-मानक निष्कर्ष निर्धारण',
      desc:
        lang === 'en'
          ? 'Assigns rigorous verdicts (Verified, False, Misleading, Partly True, Outdated, Disputed, Unverified, Satire, Opinion).'
          : 'पारदर्शी व निष्पक्ष 9-श्रेणी निष्कर्षों में से उचित वर्गीकरण। साक्ष्य अधूरा होने पर जबरन निष्कर्ष नहीं थोपा जाता।',
      icon: CheckCircle,
    },
    {
      num: '06',
      title: lang === 'en' ? 'Honest Uncertainty' : 'ईमानदार अनिश्चितता प्रकटीकरण',
      desc:
        lang === 'en'
          ? 'Discloses what remains unverified, search queries formulated, and explicit methodological limits. No fake certainty.'
          : 'सत्यापन में क्या अज्ञात रह गया, उसकी स्पष्ट व पारदर्शी जानकारी। कोई बनावटी स्कोर या प्रतिशत नहीं।',
      icon: HelpCircle,
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 select-none">
      <div className="relative mb-10 flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-white/40 block mb-1">
            Autonomous Pipeline Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.how_it_works_title}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl mt-1">
            {t.how_it_works_sub}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-6 rounded-2xl bg-neutral-900/60 dark:bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/25 shadow-xl space-y-3 relative overflow-hidden transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white/40 group-hover:text-white transition-colors">
                  PHASE // {step.num}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {step.title}
              </h3>

              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
