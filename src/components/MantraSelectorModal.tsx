import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles } from 'lucide-react';
import { AppSettings, Mantra } from '../types';

interface MantraSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mantras: Mantra[];
  settings: AppSettings;
  onSelectMantra: (id: string) => void;
}

export const MantraSelectorModal: React.FC<MantraSelectorModalProps> = ({
  isOpen,
  onClose,
  mantras,
  settings,
  onSelectMantra,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1E3A4C]/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-[#F8FCFE] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#BFE3F0] max-h-[85vh] flex flex-col text-[#1E3A4C]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#BFE3F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF5FA] border border-[#BFE3F0] text-[#4FAFD1] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold tracking-wide text-[#1E3A4C]">
                Choose Sacred Mantra
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white text-[#6F8794] hover:text-[#1E3A4C] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Mantras */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {mantras.map((m) => {
              const isSelected = settings.activeMantraId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMantra(m.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF5FA] border-[#4FAFD1] shadow-sm scale-[1.01]'
                      : 'bg-white border-[#BFE3F0] hover:bg-[#F8FCFE]'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-medium font-serif tracking-wide text-[#1E3A4C]">
                        {settings.language === 'mr'
                          ? m.name.mr
                          : settings.language === 'hi'
                          ? m.name.hi
                          : m.name.en}
                      </span>
                      <span className="text-xs text-[#6F8794]">
                        {settings.language === 'mr'
                          ? `(हिंदी: ${m.name.hi} • ${m.name.en})`
                          : settings.language === 'hi'
                          ? `(मराठी: ${m.name.mr} • ${m.name.en})`
                          : `(मराठी: ${m.name.mr} • हिंदी: ${m.name.hi})`}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-[11px] text-[#6F8794] mt-0.5">
                        {m.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected
                        ? 'border-[#4FAFD1] bg-[#4FAFD1] text-white'
                        : 'border-[#BFE3F0] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
