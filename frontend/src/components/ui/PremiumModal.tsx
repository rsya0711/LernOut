import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full p-6 sm:p-8 glass-hero rounded-3xl shadow-2xl relative space-y-6 border border-white/90">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Selamat Datang di LearnOut PRO!
            </h3>
            <p className="text-xs text-slate-500">
              Langganan berhasil diaktifkan. Akses paket UTBK Intensif dan perlindungan streak kini aktif.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <Badge variant="streak" size="sm" className="bg-amber-100 text-amber-900 border-amber-200 font-black">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> LEARN OUT PRO
              </Badge>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Tingkatkan Skor <span className="text-shimmer">UTBK</span> Hingga Maksimal
              </h2>
              <p className="text-xs text-slate-500">
                Akses tanpa batas ke seluruh modul, tryout berkala, dan fitur akselerasi belajar.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 py-2">
              {[
                'Bank Soal UTBK / SNBT & Pembahasan Lengkap',
                'Simulasi Ujian Tak Terbatas dengan Pembobotan IRT',
                'Streak Saver: Perlindungan streak jika terlewat 1 hari',
                'Badge Eksklusif PRO di Papan Peringkat (Leaderboard)',
                'Akses Prioritas Materi Baru & Prediksi Soal',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Pricing Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-800 block">
                  Paket Persiapan UTBK 2026
                </span>
                <span className="text-xl font-black text-slate-900">
                  Rp 49.000 <span className="text-xs font-semibold text-slate-500">/ bulan</span>
                </span>
              </div>
              <Badge variant="streak" size="sm">Diskon 40%</Badge>
            </div>

            {/* Action Button */}
            <div className="space-y-2 pt-1">
              <Button
                fullWidth
                variant="streak"
                size="lg"
                className="gap-2 shadow-button-streak font-black"
                onClick={handleSubscribe}
              >
                <CreditCard className="w-5 h-5" />
                Aktifkan LearnOut PRO Sekarang
              </Button>
              <p className="text-[11px] text-center text-slate-400">
                Dapat dibatalkan kapan saja • Transaksi simulasi aman
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
