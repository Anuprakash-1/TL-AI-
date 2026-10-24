import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Scale } from 'lucide-react';
import { Language, translations } from '../i18n';

interface DemoShowcaseProps {
  onSelectDemo: (demoId: string) => void;
  lang: Language;
}

export const DemoShowcase: React.FC<DemoShowcaseProps> = ({ onSelectDemo, lang }) => {
  const t = translations[lang];

  const demos = [
    {
      id: 'DEMO-TL-RBI2000',
      tag: 'Viral WhatsApp Rumor',
      title: lang === 'en' ? '₹2000 Note Embedded with Nano GPS Chips' : '₹2000 के नोट में नैनो जीपीएस सैटेलाइट चिप',
      verdict: 'FALSE',
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      icon: XCircle,
      sources: 'AFP Fact Check, RBI Official Notifications, BOOM Live',
      summary: lang === 'en'
        ? 'Debunked by direct RBI official clarification and engineering analysis of banknote physical dimensions.'
        : 'आरबीआई द्वारा आधिकारिक खंडन और नोटों की भौतिक संरचना के वैज्ञानिक विश्लेषण से झूठा साबित।'
    },
    {
      id: 'DEMO-TL-ISRO3',
      tag: 'Scientific Achievement',
      title: lang === 'en' ? 'Chandrayaan-3 Soft Landing on Moon\'s South Pole' : 'चंद्रयान-3 की चंद्रमा के दक्षिणी ध्रुव पर ऐतिहासिक लैंडिंग',
      verdict: 'VERIFIED / SUPPORTED',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      sources: 'ISRO Official Releases, Reuters, NASA Deep Space Network',
      summary: lang === 'en'
        ? 'Corroborated by deep space ground telemetry and independent orbital imagery from NASA LRO.'
        : 'इसरो के आधिकारिक टेलीमेट्री डेटा और नासा के ऑर्बिटल इमेजरी द्वारा पूर्णतः प्रमाणित।'
    },
    {
      id: 'DEMO-TL-KANYASUMANGALA',
      tag: 'Hindi Viral Phishing Forward',
      title: lang === 'en' ? 'Govt Free ₹50,000 Direct Cash Scheme for Girls' : 'बेटियों को केंद्र सरकार द्वारा ₹50,000 की मुफ्त नकद सहायता',
      verdict: 'FALSE',
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      icon: XCircle,
      sources: 'PIB Fact Check, Alt News Hindi, WCD Ministry Guidelines',
      summary: lang === 'en'
        ? 'PIB declared the circulating link a phishing scam; no central lump-sum cash scheme exists.'
        : 'पीआईबी फैक्ट चेक द्वारा फर्जी घोषित; साइबर फ्रॉड और डाटा चोरी का दुर्भावनापूर्ण लिंक।'
    },
    {
      id: 'DEMO-TL-SOLARSTORM',
      tag: 'Sensational Science News',
      title: lang === 'en' ? 'NASA Alert: Months-Long Global Internet Apocalypse' : 'नासा की चेतावनी: सोलर स्टॉर्म से 6 महीने का इंटरनेट ब्लैकआउट',
      verdict: 'MISLEADING',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      sources: 'NASA Science, Snopes, ACM SIGCOMM Academic Paper',
      summary: lang === 'en'
        ? 'Misattributed academic theoretical paper jargon to an official NASA predictive alert.'
        : 'शोध पत्र के अकादमिक शब्दों को तोड़-मरोड़कर नासा की चेतावनी के रूप में पेश किया गया।'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Verified Demonstration Data</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.demo_showcase_title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-1">
          {t.demo_showcase_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <div
              key={demo.id}
              onClick={() => onSelectDemo(demo.id)}
              className="group p-5 rounded-2xl bg-white/85 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-cyan-500 hover:shadow-xl cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    {demo.tag}
                  </span>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${demo.badgeClass}`}>
                    <Icon className="w-3 h-3" />
                    <span>{demo.verdict}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 line-clamp-2">
                  {demo.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {demo.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                <span>View Full Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
