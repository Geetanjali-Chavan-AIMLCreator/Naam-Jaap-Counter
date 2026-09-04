import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Check, Sparkles, Flame, Calendar, Award } from 'lucide-react';
import { Mantra, UserProfile } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  activeMantra: Mantra;
  todayCount: number;
  todayMala: number;
  lifetimeCount: number;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  user,
  activeMantra,
  todayCount,
  todayMala,
  lifetimeCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Render high-res spiritual card on HTML5 Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions (1080 x 1080 square for Instagram / WhatsApp Status)
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background serene sky-blue gradient (#8ED1E8 to #4FAFD1)
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#8ED1E8');
    grad.addColorStop(0.5, '#68BFDC');
    grad.addColorStop(1, '#4FAFD1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative soft radial glow
    const radial = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 520);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    radial.addColorStop(1, 'rgba(79, 175, 209, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Subtle spiritual mandala ring decor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 380, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 430, 0, Math.PI * 2);
    ctx.stroke();

    // Top Header: App Branding & Devotee
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('✨ NAAM JAAP SADHANA ✨', width / 2, 110);

    const todayDate = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(todayDate, width / 2, 155);

    // Inner Glass Card
    const cardX = 100;
    const cardY = 200;
    const cardW = width - 200;
    const cardH = height - 340;
    const radius = 40;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(30, 58, 76, 0.2)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fill();
    ctx.restore();

    // Devotee Name & Greeting
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4FAFD1';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Hari Om, ${user?.name || 'Devotee'} 🙏`, width / 2, 275);

    // Active Mantra Name
    ctx.fillStyle = '#1E3A4C';
    ctx.font = 'bold 74px "Mukta", serif';
    const deityDisplay = `${activeMantra.name.hi} (${activeMantra.name.en})`;
    ctx.fillText(deityDisplay, width / 2, 380);

    // Decorative divider
    ctx.strokeStyle = '#BFE3F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 420);
    ctx.lineTo(width / 2 + 180, 420);
    ctx.stroke();

    // Today's Chanting Highlight Box
    ctx.fillStyle = '#6F8794';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("TODAY'S SACRED CHANTS", width / 2, 470);

    // Big Count & Malas
    ctx.fillStyle = '#1E3A4C';
    ctx.font = '800 96px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(todayCount.toLocaleString(), width / 2, 570);

    // Mala completed pill
    ctx.fillStyle = '#4FAFD1';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`📿 ${todayMala} Malas Completed Today`, width / 2, 640);

    // Two Column Stats Box at bottom of inner card
    const colY = 720;
    // Lifetime Chants
    ctx.textAlign = 'center';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6F8794';
    ctx.fillText('LIFETIME JAAP', width / 2 - 200, colY);
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1E3A4C';
    ctx.fillText(lifetimeCount.toLocaleString(), width / 2 - 200, colY + 45);

    // Consistency Message
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6F8794';
    ctx.fillText('STATUS', width / 2 + 200, colY);
    ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText('🔥 Daily Sadhana Active', width / 2 + 200, colY + 45);

    // Sloka quote at bottom
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 500 26px "Mukta", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('"हरेर्नाम हरेर्नाम हरेर्नामैव केवलम् | कलौ नास्त्येव नास्त्येव नास्त्येव गतिरन्यथा ||"', width / 2, 980);

    // Update download URL
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setDownloadUrl(dataUrl);
    } catch {
      // Ignore
    }
  }, [isOpen, user, activeMantra, todayCount, todayMala, lifetimeCount]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `NaamJaap_${user?.name || 'Sadhana'}_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hari Om! 🙏 Today I completed ${todayCount.toLocaleString()} sacred chants (${todayMala} Malas) of ${activeMantra.name.hi} (${activeMantra.name.en}) on the Naam Jaap Sadhana App.\n\n"हरेर्नाम हरेर्नाम हरेर्नामैव केवलम्"\n\nMaintain your daily chanting consistency!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E3A4C]/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-lg bg-[#F8FCFE] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#BFE3F0] overflow-hidden flex flex-col max-h-[92vh] text-[#1E3A4C]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#BFE3F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF5FA] border border-[#BFE3F0] text-[#4FAFD1] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold tracking-wide text-[#1E3A4C]">
                Daily Sadhana Progress Card
              </h3>
            </div>
            <button
              id="close-share-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white text-[#6F8794] hover:text-[#1E3A4C] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Canvas Preview */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#BFE3F0] w-full max-w-[340px] aspect-square bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-[#6F8794] mt-2.5 text-center">
              Pristine 1080x1080 devotional card ready to share
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#BFE3F0] space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="share-card-download-btn"
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4FAFD1] hover:bg-[#43A0C1] text-white font-semibold text-xs transition cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                id="share-card-whatsapp-btn"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition shadow-md shadow-[#25D366]/20 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>
            </div>

            <button
              id="share-card-dismiss-btn"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-medium text-[#6F8794] hover:text-[#1E3A4C] transition cursor-pointer"
            >
              Back to Sadhana
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
