/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { OnboardingModal } from './components/OnboardingModal';
import { ChantingCounter } from './components/ChantingCounter';
import { StatsAnalytics } from './components/StatsAnalytics';
import { SettingsPage } from './components/SettingsPage';
import { MantraSelectorModal } from './components/MantraSelectorModal';
import { SocialShareModal } from './components/SocialShareModal';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { 
  getAppSettings, 
  getDailyLogs, 
  getMantras, 
  getTodayKey, 
  getUserProfile, 
  resetAllData, 
  saveAppSettings, 
  saveDailyLogs 
} from './services/storage';
import { AppSettings, DailyLog, Mantra, UserProfile } from './types';

export default function App() {
  // Load state from local storage (100% offline, zero server subscription)
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !getUserProfile());
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const [mantras, setMantras] = useState<Mantra[]>(() => getMantras());
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() => getDailyLogs());
  const [activeTab, setActiveTab] = useState<NavTab>('counter');

  // Modals
  const [isMantraSelectorOpen, setIsMantraSelectorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Synchronize settings changes
  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveAppSettings(updated);
      return updated;
    });
  }, []);

  // Refresh custom and default mantras from storage
  const handleRefreshMantras = useCallback(() => {
    setMantras(getMantras());
  }, []);

  // Today's stats
  const todayKey = getTodayKey();
  const todayLog = dailyLogs[todayKey];
  const todayCount = todayLog?.totalCount || 0;
  const todayMala = todayLog?.malaCount || Math.floor(todayCount / 108);

  // Active mantra
  const activeMantra = useMemo(() => {
    return mantras.find((m) => m.id === settings.activeMantraId) || mantras[0];
  }, [mantras, settings.activeMantraId]);

  // Lifetime counts
  const lifetimeTotal = useMemo(() => {
    return (Object.values(dailyLogs) as DailyLog[]).reduce((acc, log) => acc + (log.totalCount || 0), 0);
  }, [dailyLogs]);

  const activeMantraLifetime = useMemo(() => {
    return (Object.values(dailyLogs) as DailyLog[]).reduce(
      (acc, log) => acc + (log.byMantra?.[activeMantra.id] || 0),
      0
    );
  }, [dailyLogs, activeMantra.id]);

  // Handle tap increment
  const handleChantIncrement = useCallback((newCount: number, newMala: number) => {
    // Reload logs from local storage to keep state fresh
    setDailyLogs(getDailyLogs());
  }, []);

  // Reset all data
  const handleResetAll = useCallback(() => {
    resetAllData();
    setUser(null);
    setShowOnboarding(true);
    setSettings(getAppSettings());
    setMantras(getMantras());
    setDailyLogs(getDailyLogs());
    setActiveTab('counter');
  }, []);

  // Daily reminder notification checker (if alarms are set)
  useEffect(() => {
    if (typeof window === 'undefined' || !settings.reminders?.length) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;

      settings.reminders.forEach((r) => {
        if (r.enabled && r.time === currentTimeStr && now.getSeconds() < 10) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🕉️ Naam Jaap Chanting Reminder', {
              body: `Time for ${r.title}! Maintain your daily sadhana with ${activeMantra.name.hi}.`,
              icon: '/favicon.ico',
            });
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [settings.reminders, activeMantra]);

  return (
    <div className="min-h-screen w-full bg-spiritual-gradient bg-spiritual-radial text-[#1E3A4C] flex flex-col font-sans relative overflow-x-hidden">
      {/* Background subtle sacred aura motifs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-white/25 rounded-full blur-3xl pointer-events-none" />

      {/* Screen 1: User Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={(profile) => {
          setUser(profile);
          setShowOnboarding(false);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col w-full">
        {activeTab === 'counter' && (
          <ChantingCounter
            user={user}
            settings={settings}
            mantras={mantras}
            todayCount={todayCount}
            todayMala={todayMala}
            totalMantraLifetime={activeMantraLifetime}
            onUpdateSettings={handleUpdateSettings}
            onChantIncrement={handleChantIncrement}
            onOpenMantraSelector={() => setIsMantraSelectorOpen(true)}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsAnalytics
            logs={dailyLogs}
            mantras={mantras}
            user={user}
            language={settings.language}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            user={user}
            settings={settings}
            mantras={mantras}
            onUpdateUser={setUser}
            onUpdateSettings={handleUpdateSettings}
            onRefreshMantras={handleRefreshMantras}
            onResetAllData={handleResetAll}
          />
        )}
      </main>

      {/* Modal: Quick Deity / Mantra Selector */}
      <MantraSelectorModal
        isOpen={isMantraSelectorOpen}
        onClose={() => setIsMantraSelectorOpen(false)}
        mantras={mantras}
        settings={settings}
        onSelectMantra={(id) => handleUpdateSettings({ activeMantraId: id })}
      />

      {/* Modal: Social Share Progress Card (WhatsApp / PNG Download) */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={user}
        activeMantra={activeMantra}
        todayCount={todayCount}
        todayMala={todayMala}
        lifetimeCount={lifetimeTotal}
      />

      {/* Bottom Navigation (Chant, Analytics, Settings) */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        language={settings.language}
      />
    </div>
  );
}
