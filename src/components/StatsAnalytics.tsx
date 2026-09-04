import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Filter, 
  Share2, 
  ChevronDown, 
  Sparkles, 
  BarChart3, 
  X,
  Layers
} from 'lucide-react';
import { DailyLog, Language, Mantra, UserProfile } from '../types';

interface StatsAnalyticsProps {
  logs: Record<string, DailyLog>;
  mantras: Mantra[];
  user: UserProfile | null;
  language?: Language;
  onOpenShareModal: () => void;
}

export type StatsViewMode = 'monthly' | 'weekly' | 'yearly' | 'mantra_distribution' | 'overall';

interface BarDataPoint {
  id: string;
  label: string;
  subLabel?: string;
  count: number;
  mala: number;
  dateKey?: string;
  breakdown?: Record<string, number>;
}

export const StatsAnalytics: React.FC<StatsAnalyticsProps> = ({
  logs,
  mantras,
  language = 'en',
  onOpenShareModal,
}) => {
  const currentSystemYear = new Date().getFullYear();

  // State: View mode (Dropdown: Monthly, Weekly, Yearly, Mantra Distribution, Overall)
  const [viewMode, setViewMode] = useState<StatsViewMode>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(currentSystemYear);
  const [selectedMantraFilter, setSelectedMantraFilter] = useState<string>('all');
  const [activeBarPopup, setActiveBarPopup] = useState<BarDataPoint | null>(null);

  // Available years from logs
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([currentSystemYear, currentSystemYear - 1]);
    (Object.values(logs) as DailyLog[]).forEach((log) => {
      if (log.year) yearsSet.add(log.year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [logs, currentSystemYear]);

  // Aggregate metrics: Lifetime, Daily Average, and Selected Year Total
  const aggregateMetrics = useMemo(() => {
    let lifetimeTotal = 0;
    let yearTotal = 0;
    const activeDaysSet = new Set<string>();

    (Object.entries(logs) as [string, DailyLog][]).forEach(([dateStr, log]) => {
      if (log.totalCount > 0) {
        activeDaysSet.add(dateStr);
        lifetimeTotal += log.totalCount;
      }
      if (log.year === selectedYear) {
        yearTotal += log.totalCount;
      }
    });

    const activeDaysCount = Math.max(activeDaysSet.size, 1);
    const averageDaily = Math.round(lifetimeTotal / activeDaysCount);
    const lifetimeMalas = Math.floor(lifetimeTotal / 108);

    return {
      lifetimeTotal,
      lifetimeMalas,
      yearTotal,
      averageDaily,
      activeDaysCount,
    };
  }, [logs, selectedYear]);

  // Mantra Totals for dropdown info
  const mantraTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    mantras.forEach((m) => {
      totals[m.id] = 0;
    });

    (Object.values(logs) as DailyLog[]).forEach((log) => {
      if (log.byMantra) {
        Object.entries(log.byMantra).forEach(([mId, count]) => {
          totals[mId] = (totals[mId] || 0) + (Number(count) || 0);
        });
      }
    });

    return totals;
  }, [logs, mantras]);

  // Localized Month Names
  const monthLabels = useMemo(() => {
    if (language === 'mr') {
      return ['जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'];
    }
    if (language === 'hi') {
      return ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं'];
    }
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }, [language]);

  const fullMonthNames = useMemo(() => {
    if (language === 'mr') {
      return ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
    }
    if (language === 'hi') {
      return ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    }
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }, [language]);

  // Chart data based on dropdown selection: Monthly, Weekly, Yearly, Mantra Distribution, Overall
  const chartData = useMemo<BarDataPoint[]>(() => {
    const result: BarDataPoint[] = [];

    if (viewMode === 'monthly') {
      // 12 Months of the selected year
      for (let m = 0; m < 12; m++) {
        let monthCount = 0;
        const monthBreakdown: Record<string, number> = {};

        (Object.values(logs) as DailyLog[]).forEach((log) => {
          if (log.year === selectedYear && log.month === m) {
            const cnt =
              selectedMantraFilter === 'all'
                ? log.totalCount
                : log.byMantra?.[selectedMantraFilter] || 0;
            monthCount += cnt;

            if (log.byMantra) {
              Object.entries(log.byMantra).forEach(([mId, c]) => {
                monthBreakdown[mId] = (monthBreakdown[mId] || 0) + (Number(c) || 0);
              });
            }
          }
        });

        result.push({
          id: `month-${m}`,
          label: monthLabels[m],
          subLabel: `${fullMonthNames[m]} ${selectedYear}`,
          count: monthCount,
          mala: Math.floor(monthCount / 108),
          breakdown: monthBreakdown,
        });
      }
    } else if (viewMode === 'weekly') {
      // Past 8 weeks
      const today = new Date();
      for (let w = 7; w >= 0; w--) {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - w * 7);
        const startOfWeek = new Date(endOfWeek);
        startOfWeek.setDate(endOfWeek.getDate() - 6);

        let weekCount = 0;
        const weekBreakdown: Record<string, number> = {};

        for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const dayNum = String(d.getDate()).padStart(2, '0');
          const key = `${y}-${m}-${dayNum}`;
          const log = logs[key];

          if (log) {
            const cnt =
              selectedMantraFilter === 'all'
                ? log.totalCount
                : log.byMantra?.[selectedMantraFilter] || 0;
            weekCount += cnt;

            if (log.byMantra) {
              Object.entries(log.byMantra).forEach(([mId, c]) => {
                weekBreakdown[mId] = (weekBreakdown[mId] || 0) + (Number(c) || 0);
              });
            }
          }
        }

        const label = `W${8 - w}`;
        const subLabel = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;

        result.push({
          id: `week-${w}`,
          label,
          subLabel,
          count: weekCount,
          mala: Math.floor(weekCount / 108),
          breakdown: weekBreakdown,
        });
      }
    } else if (viewMode === 'yearly') {
      // Year by Year
      const sortedYears = [...availableYears].sort((a, b) => a - b);
      sortedYears.forEach((yr) => {
        let yrCount = 0;
        const yrBreakdown: Record<string, number> = {};

        (Object.values(logs) as DailyLog[]).forEach((log) => {
          if (log.year === yr) {
            const cnt =
              selectedMantraFilter === 'all'
                ? log.totalCount
                : log.byMantra?.[selectedMantraFilter] || 0;
            yrCount += cnt;

            if (log.byMantra) {
              Object.entries(log.byMantra).forEach(([mId, c]) => {
                yrBreakdown[mId] = (yrBreakdown[mId] || 0) + (Number(c) || 0);
              });
            }
          }
        });

        result.push({
          id: `year-${yr}`,
          label: `${yr}`,
          subLabel: `${yr} Total`,
          count: yrCount,
          mala: Math.floor(yrCount / 108),
          breakdown: yrBreakdown,
        });
      });
    } else if (viewMode === 'mantra_distribution') {
      // Mantra Distribution: Bar for each Mantra!
      mantras.forEach((m) => {
        let count = 0;
        (Object.values(logs) as DailyLog[]).forEach((log) => {
          // If year filter is active or overall
          if (selectedYear ? log.year === selectedYear : true) {
            count += log.byMantra?.[m.id] || 0;
          }
        });

        const primaryName = language === 'mr' ? m.name.mr : language === 'hi' ? m.name.hi : m.name.en;
        const secondaryName = language === 'mr' ? m.name.hi : language === 'hi' ? m.name.mr : m.name.hi;

        result.push({
          id: `mantra-${m.id}`,
          label: primaryName,
          subLabel: `${primaryName} (${secondaryName})`,
          count,
          mala: Math.floor(count / 108),
        });
      });
    } else {
      // Overall (All-time aggregated by month)
      for (let m = 0; m < 12; m++) {
        let monthCount = 0;
        const monthBreakdown: Record<string, number> = {};

        (Object.values(logs) as DailyLog[]).forEach((log) => {
          if (log.month === m) {
            const cnt =
              selectedMantraFilter === 'all'
                ? log.totalCount
                : log.byMantra?.[selectedMantraFilter] || 0;
            monthCount += cnt;

            if (log.byMantra) {
              Object.entries(log.byMantra).forEach(([mId, c]) => {
                monthBreakdown[mId] = (monthBreakdown[mId] || 0) + (Number(c) || 0);
              });
            }
          }
        });

        result.push({
          id: `overall-month-${m}`,
          label: monthLabels[m],
          subLabel: `${fullMonthNames[m]} (All Time)`,
          count: monthCount,
          mala: Math.floor(monthCount / 108),
          breakdown: monthBreakdown,
        });
      }
    }

    return result;
  }, [viewMode, logs, selectedYear, selectedMantraFilter, monthLabels, fullMonthNames, availableYears, mantras, language]);

  // Calculate highest count for bar chart scaling
  const maxBarCount = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.count), 1);
    return max;
  }, [chartData]);

  // Helper to get mantra name cleanly
  const getMantraDisplayName = (mId: string) => {
    const found = mantras.find((m) => m.id === mId);
    if (!found) return mId;
    return language === 'mr' ? found.name.mr : language === 'hi' ? found.name.hi : found.name.en;
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 space-y-6 pb-28 text-[#1E3A4C]">
      {/* Top Header & Share Button */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 block">
            {language === 'mr' ? 'साधना अंतर्दृष्टी' : language === 'hi' ? 'आध्यात्मिक अंतर्दृष्टी' : 'Devotional Insights'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2">
            <span>{language === 'mr' ? 'साधना आकडेवारी' : language === 'hi' ? 'साधना विश्लेषण' : 'Sadhana Analytics'}</span>
            <Sparkles className="w-5 h-5 text-[#FFFDF7]" />
          </h2>
        </div>

        {/* Social Share Progress Card Button */}
        <button
          id="open-share-modal-btn"
          onClick={onOpenShareModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 text-white font-medium text-xs shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share Card</span>
        </button>
      </div>

      {/* Aggregate Metrics Display: Lifetime Progress Hero Card + Daily Average + Current Year Total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: Lifetime Progress */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-widest text-[#4FAFD1] block font-semibold">
            {language === 'mr' ? 'एकूण साधना प्रगती' : language === 'hi' ? 'जीवनकाल प्रगति' : 'Lifetime Progress'}
          </span>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-[#1E3A4C]">
              {aggregateMetrics.lifetimeTotal.toLocaleString()}
            </div>
            <div className="text-xs text-[#6F8794] font-medium mt-1">
              {aggregateMetrics.lifetimeMalas.toLocaleString()} {language === 'mr' ? 'माळा पूर्ण' : language === 'hi' ? 'मालाएं पूर्ण' : 'Malas Completed'}
            </div>
          </div>
          <span className="text-[10px] text-[#6F8794]/80 uppercase tracking-wider font-medium">
            {language === 'mr' ? 'सर्वकालिक नामस्मरण' : language === 'hi' ? 'सर्वकालिक पावन जाप' : 'All-time sacred progress'}
          </span>
        </div>

        {/* Metric 2: Average Daily Count */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-widest text-[#6F8794] block font-semibold">
            {language === 'mr' ? 'दैनिक सरासरी' : language === 'hi' ? 'दैनिक औसत' : 'Daily Average'}
          </span>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-[#1E3A4C]">
              {aggregateMetrics.averageDaily.toLocaleString()}
            </div>
            <div className="text-xs text-[#4FAFD1] font-semibold mt-1">
              ~{(aggregateMetrics.averageDaily / 108).toFixed(1)} {language === 'mr' ? 'माळा / दिवस' : language === 'hi' ? 'मालाएं / दिन' : 'Malas / Day'}
            </div>
          </div>
          <span className="text-[10px] text-[#6F8794]/80 uppercase tracking-wider font-medium">
            {language === 'mr' ? 'नियमितता गती' : language === 'hi' ? 'नियमितता गति' : 'Consistency pace'}
          </span>
        </div>

        {/* Metric 3: Current / Selected Year Total */}
        <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-widest text-[#6F8794] block font-semibold">
            {selectedYear} {language === 'mr' ? 'एकूण जप' : language === 'hi' ? 'कुल जाप' : 'Total'}
          </span>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-light tracking-tight text-[#1E3A4C]">
              {aggregateMetrics.yearTotal.toLocaleString()}
            </div>
            <div className="text-xs text-[#4FAFD1] font-semibold mt-1">
              {Math.floor(aggregateMetrics.yearTotal / 108)} {language === 'mr' ? 'माळा' : language === 'hi' ? 'मालाएं' : 'Malas'} in {selectedYear}
            </div>
          </div>
          <span className="text-[10px] text-[#6F8794]/80 uppercase tracking-wider font-medium">
            {language === 'mr' ? 'या वर्षातील प्रगती' : language === 'hi' ? 'सक्रिय वर्ष प्रगति' : 'Active year progress'}
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS BAR: View Interval & Mantra Distribution Dropdowns */}
      <div className="glass-card rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dropdown 1: View Mode / Mantra Distribution Dropdown */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6F8794] mb-1.5 flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#4FAFD1]" />
              {language === 'mr' ? 'आलेख स्वरूप (प्रकार)' : language === 'hi' ? 'चार्ट प्रकार' : 'Chart View / Interval'}
            </label>
            <div className="relative">
              <select
                id="chart-interval-select"
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value as StatsViewMode);
                  setActiveBarPopup(null);
                }}
                className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30 transition cursor-pointer"
              >
                <option value="monthly" className="bg-white text-[#1E3A4C]">
                  {language === 'mr' ? 'मासिक (१२ महिने)' : language === 'hi' ? 'मासिक (12 महीने)' : 'Monthly (12 Months)'}
                </option>
                <option value="weekly" className="bg-white text-[#1E3A4C]">
                  {language === 'mr' ? 'साप्ताहिक (मागील ८ आठवडे)' : language === 'hi' ? 'साप्ताहिक (8 सप्ताह)' : 'Weekly (Past 8 Weeks)'}
                </option>
                <option value="yearly" className="bg-white text-[#1E3A4C]">
                  {language === 'mr' ? 'वार्षिक (वर्षानिहाय)' : language === 'hi' ? 'वार्षिक (वर्षवार)' : 'Yearly (Year by Year)'}
                </option>
                <option value="mantra_distribution" className="bg-white text-[#1E3A4C]">
                  {language === 'mr' ? 'नामजप वितरण (मूर्ती / मंत्र)' : language === 'hi' ? 'मंत्र वितरण (नाम अनुसार)' : 'Mantra Distribution (By Deity)'}
                </option>
                <option value="overall" className="bg-white text-[#1E3A4C]">
                  {language === 'mr' ? 'एकूण (सर्वकाळ महिने)' : language === 'hi' ? 'कुल (सर्वकालिक)' : 'Overall (All-Time)'}
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8794] pointer-events-none" />
            </div>
          </div>

          {/* Dropdown 2: Year Selector Dropdown */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6F8794] mb-1.5 flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#4FAFD1]" />
              {language === 'mr' ? 'वर्ष निवडा' : language === 'hi' ? 'वर्ष चुनें' : 'Year Filter'}
            </label>
            <div className="relative">
              <select
                id="historical-year-select"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setActiveBarPopup(null);
                }}
                disabled={viewMode === 'yearly' || viewMode === 'overall'}
                className={`w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30 transition cursor-pointer ${
                  viewMode === 'yearly' || viewMode === 'overall' ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''
                }`}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-white text-[#1E3A4C]">
                    {language === 'mr' ? `वर्ष ${yr}` : language === 'hi' ? `वर्ष ${yr}` : `Year ${yr}`} {yr === currentSystemYear ? '(Active)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8794] pointer-events-none" />
            </div>
          </div>

          {/* Dropdown 3: Name / Mantra Filter */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6F8794] mb-1.5 flex items-center gap-1.5 font-semibold">
              <Filter className="w-3.5 h-3.5 text-[#4FAFD1]" />
              {language === 'mr' ? 'नामजप फिल्टर' : language === 'hi' ? 'मंत्र फिल्टर' : 'Deity / Mantra Filter'}
            </label>
            <div className="relative">
              <select
                id="mantra-filter-select"
                value={selectedMantraFilter}
                onChange={(e) => {
                  setSelectedMantraFilter(e.target.value);
                  setActiveBarPopup(null);
                }}
                disabled={viewMode === 'mantra_distribution'}
                className={`w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30 transition cursor-pointer ${
                  viewMode === 'mantra_distribution' ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''
                }`}
              >
                <option value="all" className="bg-white text-[#1E3A4C]">
                  {language === 'mr' ? 'सर्व नामजप' : language === 'hi' ? 'सभी मंत्र व नाम' : 'All Deities & Mantras'} ({aggregateMetrics.lifetimeTotal.toLocaleString()})
                </option>
                {mantras.map((m) => {
                  const cnt = mantraTotals[m.id] || 0;
                  const primary = language === 'mr' ? m.name.mr : language === 'hi' ? m.name.hi : m.name.en;
                  return (
                    <option key={m.id} value={m.id} className="bg-white text-[#1E3A4C]">
                      {primary}: {cnt.toLocaleString()}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8794] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE BAR GRAPH CHART ACCORDINGLY */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4FAFD1]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#1E3A4C]">
              {viewMode === 'monthly'
                ? language === 'mr'
                  ? `मासिक साधना आलेख (${selectedYear})`
                  : language === 'hi'
                  ? `मासिक साधना चार्ट (${selectedYear})`
                  : `Monthly Performance (${selectedYear})`
                : viewMode === 'weekly'
                ? language === 'mr'
                  ? 'साप्ताहिक साधना आलेख (मागील ८ आठवडे)'
                  : language === 'hi'
                  ? 'साप्ताहिक साधना चार्ट (8 सप्ताह)'
                  : 'Weekly Performance (Past 8 Weeks)'
                : viewMode === 'yearly'
                ? language === 'mr'
                  ? 'वार्षिक साधना आलेख (वर्षवार)'
                  : language === 'hi'
                  ? 'वार्षिक साधना चार्ट'
                  : 'Yearly Performance Comparison'
                : viewMode === 'mantra_distribution'
                ? language === 'mr'
                  ? `नामजप वितरण आलेख (${selectedYear})`
                  : language === 'hi'
                  ? `मंत्र वितरण चार्ट (${selectedYear})`
                  : `Mantra Distribution Chart (${selectedYear})`
                : language === 'mr'
                ? 'सर्वकालिक मासिक साधना आलेख'
                : language === 'hi'
                ? 'सर्वकालिक मासिक चार्ट'
                : 'Overall Monthly Performance'}
            </h3>
          </div>
          <span className="text-[11px] text-[#4FAFD1] font-medium">
            {language === 'mr'
              ? 'संख्या पाहण्यासाठी स्तंभावर टॅप करा'
              : language === 'hi'
              ? 'संख्या देखने के लिए बार पर टैप करें'
              : 'Tap any bar to reveal exact numbers'}
          </span>
        </div>

        {/* Clean Single Bar Chart: Shows bars without permanent clutter; numbers reveal on click */}
        <div className="h-60 sm:h-72 flex items-end gap-1.5 sm:gap-2.5 pt-10 pb-6 px-1 border-b border-[#BFE3F0]">
          {chartData.map((item) => {
            const heightPercent = maxBarCount > 0 ? Math.max(6, Math.round((item.count / maxBarCount) * 100)) : 6;
            const isSelected = activeBarPopup?.id === item.id;

            return (
              <div
                key={item.id}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onClick={() => setActiveBarPopup(isSelected ? null : item)}
              >
                {/* Floating number pill: Visible ONLY when clicking on that bar! */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -top-12 z-30 px-2.5 py-1 rounded-lg bg-[#1E3A4C] text-white shadow-xl flex flex-col items-center whitespace-nowrap"
                    >
                      <span className="text-[12px] font-bold font-mono leading-none">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-[#8ED1E8] font-semibold leading-tight">
                        {item.mala} {language === 'mr' ? 'माळा' : language === 'hi' ? 'मालाएं' : 'Malas'}
                      </span>
                      <div className="w-2 h-2 bg-[#1E3A4C] rotate-45 -mb-1 mt-0.5" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* The Bar */}
                <div className="w-full flex items-end justify-center relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#4FAFD1] shadow-[0_0_16px_rgba(79,175,209,0.5)] ring-2 ring-[#BFE3F0]'
                        : item.count > 0
                        ? 'bg-[#8ED1E8] hover:bg-[#4FAFD1] group-hover:scale-105'
                        : 'bg-[#BFE3F0]/40'
                    }`}
                  />
                </div>

                {/* X-axis Label */}
                <span
                  className={`text-[10px] sm:text-[11px] mt-2 font-mono truncate w-full text-center transition ${
                    isSelected ? 'text-[#1E3A4C] font-bold' : 'text-[#6F8794] group-hover:text-[#1E3A4C]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Numbers & Details Card: Revealed when user clicks on any bar */}
        <AnimatePresence>
          {activeBarPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25 }}
              className="mt-4 p-4 rounded-2xl bg-[#EAF5FA] text-[#1E3A4C] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#BFE3F0]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#4FAFD1] text-white flex items-center justify-center font-serif text-xl shadow-sm">
                  ॐ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-wide text-[#1E3A4C]">
                      {activeBarPopup.subLabel || activeBarPopup.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#4FAFD1]/15 text-[#1E3A4C] border border-[#4FAFD1]/30">
                      {activeBarPopup.mala} {language === 'mr' ? 'माळा' : language === 'hi' ? 'मालाएं' : 'Malas'}
                    </span>
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-[#1E3A4C] mt-0.5">
                    {activeBarPopup.count.toLocaleString()}{' '}
                    <span className="text-xs text-[#6F8794] font-normal">
                      {language === 'mr' ? 'एकूण नामजप' : language === 'hi' ? 'कुल पवित्र जाप' : 'Sacred Counts'}
                    </span>
                  </p>
                </div>
              </div>

              {/* If there is a breakdown by mantra in this period, show quick summary pills */}
              {activeBarPopup.breakdown && Object.keys(activeBarPopup.breakdown).length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                  {Object.entries(activeBarPopup.breakdown)
                    .filter(([, c]) => Number(c) > 0)
                    .slice(0, 4)
                    .map(([mId, c]) => (
                      <span
                        key={mId}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#BFE3F0] text-[#6F8794] font-medium"
                      >
                        {getMantraDisplayName(mId)}: {Number(c).toLocaleString()}
                      </span>
                    ))}
                </div>
              )}

              <button
                onClick={() => setActiveBarPopup(null)}
                className="self-end sm:self-center p-2 rounded-xl hover:bg-white/60 text-[#6F8794] hover:text-[#1E3A4C] transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
