import React from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react';

interface TunerGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TunerGuide: React.FC<TunerGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-zinc-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">Panduan Praktis Stem Gitar</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Panduan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4 text-xs sm:text-sm text-zinc-300">
          {/* Section 1: Membaca Status Tuner */}
          <div>
            <h4 className="font-semibold text-zinc-100 mb-2 flex items-center gap-1.5">
              <span>1. Membaca Jarum & Warna Indikator</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-400 block mb-1">Terlalu Rendah (Flat)</span>
                <p className="text-zinc-400">
                  Jarum condong ke kiri (-¢). Kencangkan putaran tuning peg perlahan ke arah atas.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-400 block mb-1">Pas / Tepat (In Tune)</span>
                <p className="text-zinc-400">
                  Jarum berada di tengah (0¢) dan warna berubah hijau. Nada sudah sempurna!
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-rose-400 block mb-1">Terlalu Tinggi (Sharp)</span>
                <p className="text-zinc-400">
                  Jarum condong ke kanan (+¢). Kendurkan putaran pasak senar perlahan ke arah bawah.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Penomoran Senar Standar */}
          <div>
            <h4 className="font-semibold text-zinc-100 mb-2">2. Urutan & Nada Senar Standar (EADGBE)</h4>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                <span className="text-zinc-400">Senar 6 (Paling Tebal / Paling Atas)</span>
                <span className="text-amber-400 font-bold">E2 (82.4 Hz)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                <span className="text-zinc-400">Senar 5</span>
                <span className="text-amber-400 font-bold">A2 (110.0 Hz)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                <span className="text-zinc-400">Senar 4</span>
                <span className="text-amber-400 font-bold">D3 (146.8 Hz)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                <span className="text-zinc-400">Senar 3</span>
                <span className="text-amber-400 font-bold">G3 (196.0 Hz)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                <span className="text-zinc-400">Senar 2</span>
                <span className="text-amber-400 font-bold">B3 (246.9 Hz)</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-zinc-400">Senar 1 (Paling Tipis / Paling Bawah)</span>
                <span className="text-amber-400 font-bold">E4 (329.6 Hz)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Rahasia Stem Stabil */}
          <div>
            <h4 className="font-semibold text-zinc-100 mb-2">3. Tips Profesional Agar Stem Gitar Tahan Lama</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">Selalu stem dari nada rendah ke tinggi (Tune Up):</strong> Jika senar terlalu tinggi (sharp), kendurkan dulu di bawah nada target, lalu putar naik perlahan hingga pas. Ini mencegah slip pada gir pasak.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">Petik senar lepas dengan tenang:</strong> Petik dengan kekuatan sedang dekat lubang suara (soundhole) dan biarkan bergetar bebas tanpa menyentuh senar lain.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">Senar baru perlu adaptasi (stretching):</strong> Senar gitar yang baru dipasang cenderung melar dalam beberapa hari pertama, jadi lakukan penyeteman berulang kali.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Mengerti & Mulai Menyetem
          </button>
        </div>
      </div>
    </div>
  );
};
