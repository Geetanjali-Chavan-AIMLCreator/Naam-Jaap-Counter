import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) {
      errs.name = 'Please enter your name for daily chanting blessings.';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (phone.trim() && !/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim() || 'devotee@naamjaap.local',
      phone: phone.trim() || '+91 9876543210',
      joinedDate: new Date().toISOString(),
    };

    saveUserProfile(profile);
    onComplete(profile);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E3A4C]/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#F8FCFE] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#BFE3F0] overflow-hidden relative text-[#1E3A4C]"
        >
          {/* Spiritual top decor */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#8ED1E8]/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#4FAFD1]/20 rounded-full blur-xl pointer-events-none" />

          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF5FA] border border-[#BFE3F0] text-[#4FAFD1] shadow-md mb-3.5">
              <span className="text-3xl font-serif">ॐ</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#1E3A4C]">
              Welcome to Naam Jaap
            </h2>
            <p className="text-xs text-[#6F8794] mt-1 max-w-xs mx-auto leading-relaxed">
              Maintain your daily sacred chanting consistency with 100% private offline tracking.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1.5">
                Your Sacred Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8794]" />
                <input
                  id="onboarding-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rohan Sharma / Radha Das"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border ${
                    errors.name ? 'border-rose-400 focus:ring-rose-300/30' : 'border-[#BFE3F0] focus:border-[#4FAFD1] focus:ring-[#4FAFD1]/20'
                  } focus:outline-none focus:ring-2 transition text-[#1E3A4C] placeholder:text-[#6F8794]/60 text-sm font-medium`}
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8794]" />
                <input
                  id="onboarding-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="devotee@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border ${
                    errors.email ? 'border-rose-400 focus:ring-rose-300/30' : 'border-[#BFE3F0] focus:border-[#4FAFD1] focus:ring-[#4FAFD1]/20'
                  } focus:outline-none focus:ring-2 transition text-[#1E3A4C] placeholder:text-[#6F8794]/60 text-sm`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6F8794] font-semibold mb-1.5">
                Phone Number (for reminders & sync)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8794]" />
                <input
                  id="onboarding-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-300/30' : 'border-[#BFE3F0] focus:border-[#4FAFD1] focus:ring-[#4FAFD1]/20'
                  } focus:outline-none focus:ring-2 transition text-[#1E3A4C] placeholder:text-[#6F8794]/60 text-sm`}
                />
              </div>
              {errors.phone && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.phone}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                id="onboarding-submit-button"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#4FAFD1] hover:bg-[#43A0C1] text-white font-semibold transition cursor-pointer shadow-md shadow-[#4FAFD1]/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Chanting Sadhana</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-[#6F8794] flex items-center justify-center gap-1.5 mt-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4FAFD1]" />
              100% Offline Local Storage • Zero Subscriptions
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
