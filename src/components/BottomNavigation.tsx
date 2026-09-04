import React from 'react';
import { CircleDot, BarChart3, Settings } from 'lucide-react';
import { Language } from '../types';

export type NavTab = 'counter' | 'stats' | 'settings';

interface BottomNavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  language: Language;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  language,
}) => {
  const tabs = [
    {
      id: 'counter' as NavTab,
      label: language === 'hi' ? 'जाप' : language === 'mr' ? 'नामजप' : 'Chant',
      icon: CircleDot,
    },
    {
      id: 'stats' as NavTab,
      label: language === 'hi' ? 'आंकड़े' : language === 'mr' ? 'आकडेवारी' : 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavTab,
      label: language === 'hi' ? 'सेटिंग्स' : language === 'mr' ? 'सेटिंग्ज' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav aria-label="Main Navigation" className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-6 sm:gap-8 bg-[#F8FCFE]/95 backdrop-blur-2xl border border-[#BFE3F0] px-6 sm:px-10 py-3 sm:py-3.5 rounded-full shadow-[0_10px_30px_rgba(30,58,76,0.12)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer group ${
                isActive ? 'text-[#1E3A4C]' : 'text-[#6F8794] hover:text-[#1E3A4C]'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#4FAFD1] shadow-[0_0_8px_rgba(79,175,209,0.6)] scale-110' : 'bg-transparent'
                }`}
              />
              <span className="text-[10px] uppercase tracking-widest font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
