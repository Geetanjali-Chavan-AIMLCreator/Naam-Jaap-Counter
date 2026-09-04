import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Check, 
  Volume2, 
  Vibrate, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  RotateCcw,
  HelpCircle,
  Award
} from 'lucide-react';
import { AppSettings, ChantReminder, Mantra, UserProfile } from '../types';
import { addCustomMantra, deleteCustomMantra, resetAllData, saveAppSettings, saveUserProfile } from '../services/storage';
import { playMalaBellSound, triggerHaptic } from '../services/audio';

interface SettingsPageProps {
  user: UserProfile | null;
  settings: AppSettings;
  mantras: Mantra[];
  onUpdateUser: (updated: UserProfile) => void;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
  onRefreshMantras: () => void;
  onResetAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  settings,
  mantras,
  onUpdateUser,
  onUpdateSettings,
  onRefreshMantras,
  onResetAllData,
}) => {
  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Custom Mantra inputs
  const [customNameEn, setCustomNameEn] = useState('');
  const [customNameHi, setCustomNameHi] = useState('');
  const [customNameMr, setCustomNameMr] = useState('');
  const [isAddingMantra, setIsAddingMantra] = useState(false);

  // New reminder inputs
  const [newReminderTime, setNewReminderTime] = useState('06:00');
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  // Reset modal state
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // Save profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: UserProfile = {
      name: name.trim(),
      email: email.trim() || 'devotee@naamjaap.local',
      phone: phone.trim() || '+91 9876543210',
      joinedDate: user?.joinedDate || new Date().toISOString(),
    };
    saveUserProfile(updated);
    onUpdateUser(updated);

    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  // Add custom mantra
  const handleAddCustomMantra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameEn.trim()) return;

    const newMantra = addCustomMantra(
      customNameEn,
      customNameHi || customNameEn,
      customNameMr || customNameHi || customNameEn
    );

    // Switch active mantra to this newly added custom mantra
    onUpdateSettings({ activeMantraId: newMantra.id });
    onRefreshMantras();

    setCustomNameEn('');
    setCustomNameHi('');
    setCustomNameMr('');
    setIsAddingMantra(false);
  };

  // Delete custom mantra
  const handleDeleteCustomMantra = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomMantra(id);
    if (settings.activeMantraId === id) {
      onUpdateSettings({ activeMantraId: 'radha' });
    }
    onRefreshMantras();
  };

  // Add daily reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTime) return;

    const reminder: ChantReminder = {
      id: `rem_${Date.now()}`,
      time: newReminderTime,
      title: newReminderTitle.trim() || 'Sacred Chanting Time',
      enabled: true,
      repeatDaily: true,
    };

    const updatedReminders = [...settings.reminders, reminder];
    onUpdateSettings({ reminders: updatedReminders });

    // Request notification permission if supported
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    setNewReminderTitle('');
    setIsAddingReminder(false);
  };

  // Toggle reminder
  const handleToggleReminder = (id: string) => {
    const updated = settings.reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onUpdateSettings({ reminders: updated });
  };

  // Remove reminder
  const handleRemoveReminder = (id: string) => {
    const updated = settings.reminders.filter((r) => r.id !== id);
    onUpdateSettings({ reminders: updated });
  };

  // Test Bell sound
  const handleTestBell = () => {
    playMalaBellSound();
    triggerHaptic('mala');
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 space-y-6 pb-28 text-[#1E3A4C]">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 block">
          Preferences & Sadhana Configuration
        </span>
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
          Settings & Mantras
        </h2>
      </div>

      {/* SECTION 1: ACTIVE MANTRA SELECTOR */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4FAFD1]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#1E3A4C]">
              Active Chanting Mantra
            </h3>
          </div>
          <button
            id="toggle-add-mantra-btn"
            onClick={() => setIsAddingMantra(!isAddingMantra)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4FAFD1] hover:bg-[#43A0C1] text-white text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom</span>
          </button>
        </div>

        {/* Custom Mantra Form */}
        <AnimatePresence>
          {isAddingMantra && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddCustomMantra}
              className="p-4 rounded-2xl bg-[#EAF5FA] border border-[#BFE3F0] space-y-3 overflow-hidden"
            >
              <h4 className="text-xs uppercase tracking-wider text-[#6F8794] font-semibold">
                Add New Sacred Name / Custom Mantra
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customNameEn}
                    onChange={(e) => setCustomNameEn(e.target.value)}
                    placeholder="e.g., Hanuman"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] placeholder:text-[#6F8794]/60 focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                    Hindi Script (हिंदी)
                  </label>
                  <input
                    type="text"
                    value={customNameHi}
                    onChange={(e) => setCustomNameHi(e.target.value)}
                    placeholder="उदा. हनुमान"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] placeholder:text-[#6F8794]/60 focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                    Marathi Script (मराठी)
                  </label>
                  <input
                    type="text"
                    value={customNameMr}
                    onChange={(e) => setCustomNameMr(e.target.value)}
                    placeholder="उदा. मारुती"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] placeholder:text-[#6F8794]/60 focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingMantra(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6F8794] hover:bg-white/60 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#4FAFD1] hover:bg-[#43A0C1] text-white shadow-sm transition cursor-pointer"
                >
                  Save Mantra
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Mantras List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {mantras.map((m) => {
            const isSelected = settings.activeMantraId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => onUpdateSettings({ activeMantraId: m.id })}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAF5FA] border-[#4FAFD1] shadow-sm scale-[1.01]'
                    : 'bg-white border-[#BFE3F0] hover:bg-[#F8FCFE]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'border-[#4FAFD1] bg-[#4FAFD1] text-white'
                        : 'border-[#BFE3F0] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-[#1E3A4C]">
                      {m.name.hi} <span className="text-[#6F8794] font-normal">({m.name.en})</span>
                    </span>
                    <span className="text-[10px] text-[#6F8794] block mt-0.5">
                      {m.description || m.name.mr}
                    </span>
                  </div>
                </div>

                {m.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomMantra(m.id, e)}
                    className="p-1.5 text-[#6F8794] hover:text-rose-500 rounded-lg hover:bg-white/60 transition cursor-pointer"
                    title="Delete custom mantra"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: NOTIFICATIONS & REMINDERS */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#4FAFD1]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#1E3A4C]">
              Daily Chanting Reminders & Alarms
            </h3>
          </div>
          <button
            id="toggle-add-reminder-btn"
            onClick={() => setIsAddingReminder(!isAddingReminder)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#4FAFD1] hover:bg-[#43A0C1] text-white text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Alarm</span>
          </button>
        </div>

        {/* Add Reminder Form */}
        <AnimatePresence>
          {isAddingReminder && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddReminder}
              className="p-4 rounded-2xl bg-[#EAF5FA] border border-[#BFE3F0] space-y-3"
            >
              <h4 className="text-xs uppercase tracking-wider text-[#6F8794] font-semibold">
                Create Daily Chanting Alarm
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                    Time (24-Hour)
                  </label>
                  <input
                    type="time"
                    required
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                    Alarm Title
                  </label>
                  <input
                    type="text"
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    placeholder="e.g. Morning Sadhana"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] placeholder:text-[#6F8794]/60 focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingReminder(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6F8794] hover:bg-white/60 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#4FAFD1] hover:bg-[#43A0C1] text-white shadow-sm transition cursor-pointer"
                >
                  Save Alarm
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reminders list */}
        <div className="space-y-2.5">
          {settings.reminders.length === 0 ? (
            <p className="text-xs text-[#6F8794] italic py-2 text-center">
              No chanting reminders set. Click "+ Set Alarm" to add one.
            </p>
          ) : (
            settings.reminders.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl bg-white border border-[#BFE3F0] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF5FA] border border-[#BFE3F0] text-[#4FAFD1] flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#1E3A4C] block">
                      {r.time}
                    </span>
                    <span className="text-xs text-[#6F8794]">
                      {r.title} • Daily
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReminder(r.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                      r.enabled
                        ? 'bg-[#4FAFD1]/15 border border-[#4FAFD1]/30 text-[#1E3A4C]'
                        : 'bg-slate-100 text-[#6F8794]'
                    }`}
                  >
                    {r.enabled ? 'Active' : 'Off'}
                  </button>
                  <button
                    onClick={() => handleRemoveReminder(r.id)}
                    className="p-1.5 text-[#6F8794] hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: AUDIO & HAPTIC EXPERIENCE */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-[#1E3A4C] flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#4FAFD1]" />
          Chanting Sound & Haptics
        </h3>

        <div className="space-y-3.5 divide-y divide-[#BFE3F0]">
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-semibold text-[#1E3A4C] block">
                Wooden Bead Tap Sound
              </span>
              <span className="text-[11px] text-[#6F8794]">
                Gentle acoustic feedback on each Japa count
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#4FAFD1] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-semibold text-[#1E3A4C] block">
                Mala Completion Temple Bell
              </span>
              <span className="text-[11px] text-[#6F8794]">
                Resonant brass bell chime every 108 counts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestBell}
                className="px-2.5 py-1 text-[11px] font-medium bg-[#EAF5FA] hover:bg-[#BFE3F0]/40 rounded-lg text-[#1E3A4C] border border-[#BFE3F0] cursor-pointer"
              >
                Test Sound
              </button>
              <input
                type="checkbox"
                checked={settings.malaBellEnabled}
                onChange={(e) => onUpdateSettings({ malaBellEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#4FAFD1] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-semibold text-[#1E3A4C] block">
                Haptic Vibration
              </span>
              <span className="text-[11px] text-[#6F8794]">
                Vibrate phone lightly on every bead tap
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticEnabled}
              onChange={(e) => onUpdateSettings({ hapticEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#4FAFD1] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3.5">
            <div>
              <span className="text-xs font-semibold text-[#1E3A4C] block">
                Daily Mala Target
              </span>
              <span className="text-[11px] text-[#6F8794]">
                Target malas to complete daily (1 Mala = 108 counts)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="108"
                value={settings.dailyTargetMalas}
                onChange={(e) =>
                  onUpdateSettings({ dailyTargetMalas: Math.max(1, Number(e.target.value)) })
                }
                className="w-16 px-2.5 py-1.5 text-center font-mono font-medium text-sm rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C]"
              />
              <span className="text-xs text-[#6F8794] font-medium">Malas</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: USER PROFILE (STORED LOCALLY) */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-[#1E3A4C] flex items-center gap-2">
            <User className="w-4 h-4 text-[#4FAFD1]" />
            Devotee Profile (Local Device)
          </h3>
          {profileSavedToast && (
            <span className="text-xs font-medium text-[#4FAFD1] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#BFE3F0] text-[#1E3A4C] focus:outline-none focus:ring-2 focus:ring-[#4FAFD1]/30"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4FAFD1] hover:bg-[#43A0C1] text-white shadow-sm transition cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 5: DATA STORAGE & ZERO SUBSCRIPTION NOTICE */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#4FAFD1]" />
          <h3 className="text-sm font-semibold tracking-wide text-[#1E3A4C]">
            Local Storage & Privacy
          </h3>
        </div>
        <p className="text-xs text-[#6F8794] leading-relaxed">
          All chanting logs, sacred mantras, profile data, and analytics are stored 100% locally on your device with <strong>₹0 recurring subscription</strong>. Your spiritual practice remains private to you.
        </p>

        <div className="pt-2.5 border-t border-[#BFE3F0] flex items-center justify-between">
          <span className="text-xs text-[#6F8794]">Need to reset counters?</span>
          <button
            type="button"
            onClick={() => setConfirmResetModal(true)}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
          >
            Clear Data / Reset
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {confirmResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E3A4C]/60 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white border border-[#BFE3F0] rounded-3xl p-6 shadow-2xl space-y-4 text-[#1E3A4C]">
              <h4 className="text-base font-semibold">
                Confirm Reset All Data?
              </h4>
              <p className="text-xs text-[#6F8794] leading-relaxed">
                This will reset your local chant counters, custom mantras, and logs. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#1E3A4C]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setConfirmResetModal(false);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
