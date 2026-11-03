import React from 'react';
import { Volume2, Sliders, Music, Info, HelpCircle } from 'lucide-react';
import { TuningPreset } from '../types/tuner';
import { TUNING_PRESETS } from '../utils/musicTheory';

interface HeaderProps {
  currentPreset: TuningPreset;
  onSelectPreset: (preset: TuningPreset) => void;
  a4Frequency: number;
  onChangeA4: (freq: number) => void;
  noiseGate: number;
  onChangeNoiseGate: (gate: number) => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  a4Frequency,
  onChangeA4,
  noiseGate,
  onChangeNoiseGate,
  onOpenGuide,
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100 tracking-tight text-lg">PetikNada</span>
              <span className="text-[11px] font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                Stem Gitar
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Tuner Gitar Akurat & Sederhana</p>
          </div>
        </div>

        {/* Preset & Settings Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <div className="relative">
            <select
              aria-label="Pilih Setelan Tuning Gitar"
              value={currentPreset.id}
              onChange={(e) => {
                const found = TUNING_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-xs sm:text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none pr-8"
            >
              {TUNING_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-200">
                  {p.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Quick A4 calibration indicator / toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Pengaturan Tuner"
            className={`p-2 rounded-lg border transition-colors ${
              showSettings
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title="Pengaturan Kalibrasi A4 & Sensitivitas"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            aria-label="Panduan Stem Gitar"
            className="p-2 rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            title="Panduan Stem Gitar Pemula"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings popdown */}
      {showSettings && (
        <div className="max-w-4xl mx-auto mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-zinc-200 block">Kalibrasi Nada Standar (A4)</span>
              <span className="text-zinc-400 text-[11px]">Standar konser adalah 440 Hz (atau 432 Hz)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onChangeA4(432)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  a4Frequency === 432 ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                432
              </button>
              <button
                onClick={() => onChangeA4(440)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  a4Frequency === 440 ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                440
              </button>
              <button
                onClick={() => onChangeA4(442)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  a4Frequency === 442 ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                442
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-zinc-200">Filter Kebisingan (Noise Gate)</span>
                <span className="font-mono text-zinc-400">{Math.round(noiseGate * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.05"
                step="0.005"
                value={noiseGate}
                onChange={(e) => onChangeNoiseGate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
