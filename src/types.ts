export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
}

export interface Mantra {
  id: string;
  name: {
    en: string;
    hi: string;
    mr: string;
  };
  description?: string;
  isCustom?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  year: number;
  month: number; // 0-11
  totalCount: number;
  malaCount: number;
  byMantra: Record<string, number>; // mantraId -> count
}

export interface ChantReminder {
  id: string;
  title: string;
  time: string; // "06:00"
  enabled: boolean;
  repeatDaily: boolean;
}

export interface AppSettings {
  activeMantraId: string;
  language: Language;
  hapticEnabled: boolean;
  soundEnabled: boolean;
  malaBellEnabled: boolean;
  dailyTargetMalas: number;
  reminders: ChantReminder[];
}

export interface FloatingParticle {
  id: number;
  text: string;
  x: number;
  y: number;
  angle: number;
}
