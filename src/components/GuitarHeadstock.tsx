import React from 'react';
import { Volume2, Lock, Music } from 'lucide-react';
import { GuitarString } from '../types/tuner';

interface GuitarHeadstockProps {
  strings: GuitarString[];
  selectedString: GuitarString | null;
  onSelectString: (str: GuitarString) => void;
  onPlayStringTone: (freq: number) => void;
  detectedStringNumber?: number;
}

export const GuitarHeadstock: React.FC<GuitarHeadstockProps> = ({
  strings,
  selectedString,
  onSelectString,
  onPlayStringTone,
  detectedStringNumber,
}) => {
  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>Senar Gitar & Suara Referensi</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Klik senar untuk mengunci fokus deteksi atau dengarkan nada akustiknya.
          </p>
        </div>
        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>Senar 6 = Paling Tebal (Bass) · Senar 1 = Paling Tipis (Treble)</span>
        </div>
      </div>

      {/* Grid of 6 Strings (from 6 to 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {strings.map((str) => {
          const isSelected = selectedString?.number === str.number;
          const isDetected = detectedStringNumber === str.number;

          // Wire thickness visual indicator (senar 6 is thicker than senar 1)
          const wireThickness = Math.max(1.5, (7 - str.number) * 0.75);

          return (
            <div
              key={str.number}
              onClick={() => onSelectString(str)}
              className={`relative group rounded-xl p-3 border transition-all cursor-pointer flex flex-col items-center justify-between min-h-[110px] ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-zinc-100 ring-2 ring-amber-500/30'
                  : isDetected
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-zinc-100'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70 text-zinc-300'
              }`}
            >
              {/* Top row: String number and target lock indicator */}
              <div className="w-full flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-zinc-400">
                  Senar {str.number}
                </span>
                {isSelected && (
                  <span className="text-[10px] bg-amber-500 text-zinc-950 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Kunci
                  </span>
                )}
                {isDetected && !isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>

              {/* Center note symbol and gauge wire */}
              <div className="my-1 flex flex-col items-center justify-center">
                <span className="font-extrabold text-2xl tracking-tight text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {str.note}
                  <span className="text-xs text-zinc-400 font-normal ml-0.5">{str.octave}</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  {str.frequency.toFixed(1)} Hz
                </span>
              </div>

              {/* Simulated guitar string wire bar */}
              <div className="w-full my-1.5 flex items-center justify-center">
                <div
                  className={`w-full rounded-full transition-colors ${
                    isSelected
                      ? 'bg-amber-400'
                      : isDetected
                      ? 'bg-emerald-400'
                      : 'bg-zinc-700 group-hover:bg-zinc-500'
                  }`}
                  style={{ height: `${wireThickness}px` }}
                />
              </div>

              {/* Bottom: Play reference tone button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayStringTone(str.frequency);
                }}
                title={`Bunyikan nada ${str.name}`}
                className="w-full mt-1 py-1 px-2 rounded-md bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Volume2 className="w-3 h-3" />
                <span>Bunyikan</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
