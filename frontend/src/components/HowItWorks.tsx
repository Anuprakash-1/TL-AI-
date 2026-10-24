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
      desc: lang === 'en'
        ? 'Parses articles into discrete empirical claims, identifying persons, institutions, locations, and timeframes.'
        : 'पूरे लेख या संदेश से व्यक्तियों, तिथियों व संस्थानों से जुड़े वास्तविक तथ्यात्मक दावों की पहचान।',
      icon: FileSearch,
    },
    {
      num: '02',
      title: lang === 'en' ? 'Live Web Research' : 'लाइव वेब अनुसंधान',
      desc: lang === 'en'
        ? 'Formulates multi-angle search queries across Google News RSS, DDGS, and official government archives (PIB, ECI, Courts). Never fabricated.'
        : 'सर्च इंडेक्स और सरकारी अभिलेखागारों (PIB, सुप्रीम कोर्ट, चुनाव आयोग) में वास्तविक लाइव खोज।',
      icon: Search,
    },
    {
      num: '03',
      title: lang === 'en' ? 'Authority Evaluation' : 'स्रोत विश्वसनीयता का मूल्यांकन',
      desc: lang === 'en'
        ? 'Distinguishes primary documentation and certified fact-checkers from wire syndication echo chambers.'
        : 'प्राथमिक दस्तावेजों तथा IFCN प्रमाणित तथ्य-जांचकों की पहचान कर उनकी साख की जांच।',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: lang === 'en' ? 'Evidence Comparison' : 'साक्ष्यों का मिलान व तुलना',
      desc: lang === 'en'
        ? 'Extracts verbatim quotations and classifies relation as Supports, Contradicts, or Context against the exact claim.'
        : 'प्रत्येक स्रोत से सीधे उद्धरण लेकर यह तय करना कि साक्ष्य दावे का समर्थन करता है, खंडन करता है या केवल संदर्भ देता है।',
      icon: Scale,
    },
    {
      num: '05',
      title: lang === 'en' ? '9-Verdict Standard' : '9-मानक निष्कर्ष निर्धारण',
      desc: lang === 'en'
        ? 'Assigns rigorous verdicts (Verified, False, Misleading, Partly True, Outdated, Disputed, Unverified, Satire, Opinion).'
        : 'पारदर्शी व निष्पक्ष 9-श्रेणी निष्कर्षों में से उचित वर्गीकरण। साक्ष्य अधूरा होने पर जबरन निष्कर्ष नहीं थोपा जाता।',
      icon: CheckCircle,
    },
    {
      num: '06',
      title: lang === 'en' ? 'Honest Uncertainty' : 'ईमानदार अनिश्चितता प्रकटीकरण',
      desc: lang === 'en'
        ? 'Discloses what remains unverified, search queries formulated, and explicit methodological limits. No fake certainty.'
        : 'सत्यापन में क्या अज्ञात रह गया, उसकी स्पष्ट व पारदर्शी जानकारी। कोई बनावटी स्कोर या प्रतिशत नहीं।',
      icon: HelpCircle,
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.how_it_works_title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-1">
          {t.how_it_works_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-6 rounded-2xl bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xl font-mono font-black text-slate-300 dark:text-slate-700">
                  {step.num}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
