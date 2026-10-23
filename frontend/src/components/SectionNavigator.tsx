import React, { useEffect, useState } from 'react';
import { Search, Sparkles, BookOpen, Shield, FileCheck, Layers } from 'lucide-react';
import { Language } from '../i18n';

interface SectionNavigatorProps {
  lang: Language;
  hasReport: boolean;
}

interface NavItem {
  id: string;
  labelEn: string;
  labelHi: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({ lang, hasReport }) => {
  const [activeId, setActiveId] = useState<string>('section-verify');

  const defaultItems: NavItem[] = [
    {
      id: 'section-verify',
      labelEn: 'Verification Hub',
      labelHi: 'सत्यापन केंद्र',
      badge: '01',
      icon: Search,
    },
    {
      id: 'section-demos',
      labelEn: 'Case Studies',
      labelHi: 'केस स्टडीज',
      badge: '02',
      icon: Sparkles,
    },
    {
      id: 'section-methodology',
      labelEn: 'Methodology',
      labelHi: 'कार्यप्रणाली',
      badge: '03',
      icon: BookOpen,
    },
    {
      id: 'section-footer',
      labelEn: 'Integrity & Info',
      labelHi: 'पारदर्शिता व सूचना',
      badge: '04',
      icon: Shield,
    },
  ];

  const reportItems: NavItem[] = [
    {
      id: 'section-verify',
      labelEn: 'Verification Query',
      labelHi: 'सत्यापन प्रश्न',
      badge: '01',
      icon: Search,
    },
    {
      id: 'section-report-verdict',
      labelEn: 'Verdict & Claims',
      labelHi: 'निष्कर्ष व दावे',
      badge: '02',
      icon: FileCheck,
    },
    {
      id: 'section-report-sources',
      labelEn: 'Evidence Sources',
      labelHi: 'साक्ष्य स्रोत',
      badge: '03',
      icon: Layers,
    },
    {
      id: 'section-report-matrix',
      labelEn: 'Comparison Matrix',
      labelHi: 'साक्ष्य तुलना',
      badge: '04',
      icon: BookOpen,
    },
    {
      id: 'section-footer',
      labelEn: 'Integrity & Info',
      labelHi: 'पारदर्शिता व सूचना',
      badge: '05',
      icon: Shield,
    },
  ];

  const items = hasReport ? reportItems : defaultItems;

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      if (sectionElements.length === 0) return;

      const scrollPosition = window.scrollY + 160;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      aria-label="Section layer navigation"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-3 pointer-events-none"
    >
      <div className="p-2 rounded-2xl bg-white/70 dark:bg-navy-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl flex flex-col gap-2.5 pointer-events-auto">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const label = lang === 'en' ? item.labelEn : item.labelHi;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              aria-label={`Scroll to ${label}`}
              className="group relative flex items-center justify-end focus:outline-none"
            >
              {/* Flyout Label Tooltip on Hover */}
              <span className="absolute right-8 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-slate-900 dark:bg-slate-800 text-white shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0">
                <span className="font-mono text-cyan-400 mr-1.5">{item.badge}</span>
                {label}
              </span>

              {/* Indicator Dot / Pill */}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-7 h-7 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md shadow-cyan-500/30'
                    : 'w-3 h-3 mx-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500 hover:scale-125'
                }`}
              >
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
