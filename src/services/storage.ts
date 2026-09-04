import { AppSettings, DailyLog, Mantra, UserProfile } from '../types';

export const DEFAULT_MANTRAS: Mantra[] = [
  {
    id: 'radha',
    name: {
      en: 'Radha',
      hi: 'राधा',
      mr: 'राधा',
    },
    description: 'Divine Feminine Energy & Supreme Love (श्रीराधा)',
  },
  {
    id: 'krishna',
    name: {
      en: 'Krishna',
      hi: 'कृष्ण',
      mr: 'कृष्ण',
    },
    description: 'Supreme Joy, Wisdom & Playfulness (श्रीकृष्ण)',
  },
  {
    id: 'ram',
    name: {
      en: 'Ram',
      hi: 'राम',
      mr: 'राम',
    },
    description: 'Righteousness, Truth & Inner Strength (श्रीराम)',
  },
  {
    id: 'om-namah-shivaya',
    name: {
      en: 'Om Namah Shivaya',
      hi: 'ॐ नमः शिवाय',
      mr: 'ॐ नमः शिवाय',
    },
    description: 'Purity, Dissolution of Ego & Transcendence',
  },
  {
    id: 'hare-krishna',
    name: {
      en: 'Hare Krishna',
      hi: 'हरे कृष्ण',
      mr: 'हरे कृष्ण',
    },
    description: 'Maha Mantra for Spiritual Bliss & Awakening',
  },
  {
    id: 'gayatri',
    name: {
      en: 'Gayatri Mantra',
      hi: 'गायत्री मंत्र',
      mr: 'गायत्री मंत्र',
    },
    description: 'Solar Radiance, Intellect & Illumination',
  },
  {
    id: 'vithal',
    name: {
      en: 'Vitthal',
      hi: 'विठ्ठल',
      mr: 'विठ्ठल',
    },
    description: 'Supreme Devotion of Pandharpur (विठू माऊली)',
  },
  {
    id: 'hanuman',
    name: {
      en: 'Hanuman',
      hi: 'हनुमान',
      mr: 'हनुमान',
    },
    description: 'Courage, Strength & Unwavering Bhakti (मारुती)',
  },
  {
    id: 'ganesh',
    name: {
      en: 'Shri Ganesh',
      hi: 'श्री गणेश',
      mr: 'श्री गणेश',
    },
    description: 'Remover of Obstacles & Auspicious Beginnings',
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  activeMantraId: 'radha',
  language: 'hi', // Spiritual default with smooth toggle to English and Marathi
  hapticEnabled: true,
  soundEnabled: true,
  malaBellEnabled: true,
  dailyTargetMalas: 5,
  reminders: [
    {
      id: 'r1',
      title: 'Brahma Muhurta Jaap',
      time: '05:30',
      enabled: true,
      repeatDaily: true,
    },
    {
      id: 'r2',
      title: 'Sandhya Aarti Jaap',
      time: '18:45',
      enabled: true,
      repeatDaily: true,
    },
  ],
};

const STORAGE_KEYS = {
  USER_PROFILE: 'naam_jaap_user_profile',
  SETTINGS: 'naam_jaap_settings',
  MANTRAS: 'naam_jaap_mantras',
  DAILY_LOGS: 'naam_jaap_daily_logs',
  SESSION_COUNTER: 'naam_jaap_session_counter',
};

// Helper: Format date as YYYY-MM-DD
export function getTodayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getMantras(): Mantra[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MANTRAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(DEFAULT_MANTRAS));
      return DEFAULT_MANTRAS;
    }
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length === 0) {
      localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(DEFAULT_MANTRAS));
      return DEFAULT_MANTRAS;
    }

    // Synchronize default mantras to ensure proper translations (e.g. Radha in Marathi = राधा)
    const customMantras = saved.filter((m: Mantra) => m.isCustom);
    const updatedDefaultMantras = DEFAULT_MANTRAS.map((dm) => {
      const existing = saved.find((m: Mantra) => m.id === dm.id);
      return {
        ...dm,
        ...(existing?.isCustom ? existing : {}),
        name: {
          ...dm.name,
          ...(existing?.name || {}),
          mr: dm.name.mr, // enforce canonical Marathi spelling
          hi: dm.name.hi, // enforce canonical Hindi spelling
          en: dm.name.en, // enforce canonical English spelling
        },
      };
    });

    const combined = [...updatedDefaultMantras, ...customMantras];
    localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(combined));
    return combined;
  } catch {
    return DEFAULT_MANTRAS;
  }
}

export function saveMantras(mantras: Mantra[]): void {
  localStorage.setItem(STORAGE_KEYS.MANTRAS, JSON.stringify(mantras));
}

export function addCustomMantra(nameEn: string, nameHi: string, nameMr: string): Mantra {
  const mantras = getMantras();
  const id = `custom_${Date.now()}`;
  const newMantra: Mantra = {
    id,
    name: {
      en: nameEn.trim() || 'Custom Mantra',
      hi: nameHi.trim() || nameEn.trim(),
      mr: nameMr.trim() || nameHi.trim() || nameEn.trim(),
    },
    isCustom: true,
  };
  const updated = [...mantras, newMantra];
  saveMantras(updated);
  return newMantra;
}

export function deleteCustomMantra(id: string): void {
  const mantras = getMantras().filter(m => m.id !== id);
  saveMantras(mantras);
}

// Generate realistic seed history if this is the first open
function generateHistoricalSeedLogs(): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const today = new Date();
  
  // Seed past 2 years (prior year + current year up to yesterday)
  const currentYear = today.getFullYear();
  const mantras = ['radha', 'krishna', 'ram', 'om-namah-shivaya'];

  // Seed for past 180 days to give realistic depth
  for (let i = 180; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getTodayKey(d);
    
    // Vary daily counts (108 to 1080 counts with occasional rest days)
    const isChantingDay = Math.random() > 0.08;
    if (!isChantingDay) continue;

    const malas = Math.floor(Math.random() * 8) + 2; // 2 to 9 malas
    const count = malas * 108 + Math.floor(Math.random() * 30);
    
    const primaryMantra = mantras[Math.floor(Math.random() * mantras.length)];
    const secondaryMantra = mantras[Math.floor(Math.random() * mantras.length)];

    const primaryCount = Math.floor(count * 0.75);
    const secondaryCount = count - primaryCount;

    logs[dateStr] = {
      date: dateStr,
      year: d.getFullYear(),
      month: d.getMonth(),
      totalCount: count,
      malaCount: Math.floor(count / 108),
      byMantra: {
        [primaryMantra]: primaryCount,
        ...(secondaryMantra !== primaryMantra ? { [secondaryMantra]: secondaryCount } : {}),
      },
    };
  }

  // Also seed some prior year logs (e.g., last year)
  for (let m = 0; m < 12; m++) {
    for (let day = 1; day <= 28; day += 3) {
      const priorDate = new Date(currentYear - 1, m, day);
      const dateStr = getTodayKey(priorDate);
      const malas = Math.floor(Math.random() * 6) + 3;
      const count = malas * 108;
      logs[dateStr] = {
        date: dateStr,
        year: currentYear - 1,
        month: m,
        totalCount: count,
        malaCount: malas,
        byMantra: {
          radha: Math.floor(count * 0.5),
          krishna: Math.floor(count * 0.3),
          ram: count - Math.floor(count * 0.5) - Math.floor(count * 0.3),
        },
      };
    }
  }

  return logs;
}

export function getDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (!raw) {
      const seeded = generateHistoricalSeedLogs();
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveDailyLogs(logs: Record<string, DailyLog>): void {
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
}

export function recordChant(mantraId: string, amount: number = 1): { todayCount: number; todayMala: number; totalMantraCount: number } {
  const todayKey = getTodayKey();
  const today = new Date();
  const logs = getDailyLogs();

  const currentLog: DailyLog = logs[todayKey] || {
    date: todayKey,
    year: today.getFullYear(),
    month: today.getMonth(),
    totalCount: 0,
    malaCount: 0,
    byMantra: {},
  };

  const newTotal = Math.max(0, currentLog.totalCount + amount);
  const newMantraCount = Math.max(0, (currentLog.byMantra[mantraId] || 0) + amount);

  currentLog.totalCount = newTotal;
  currentLog.malaCount = Math.floor(newTotal / 108);
  currentLog.byMantra[mantraId] = newMantraCount;

  logs[todayKey] = currentLog;
  saveDailyLogs(logs);

  // Calculate cumulative lifetime count for this mantra
  let totalMantraCount = 0;
  Object.values(logs).forEach(log => {
    totalMantraCount += log.byMantra[mantraId] || 0;
  });

  return {
    todayCount: newTotal,
    todayMala: currentLog.malaCount,
    totalMantraCount,
  };
}

export function resetTodayChants(): void {
  const todayKey = getTodayKey();
  const logs = getDailyLogs();
  if (logs[todayKey]) {
    delete logs[todayKey];
    saveDailyLogs(logs);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.MANTRAS);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}
