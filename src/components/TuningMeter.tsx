import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, ArrowLeft, ArrowRight, Check, Volume2 } from 'lucide-react';
import { DetectedPitch, GuitarString } from '../types/tuner';

interface TuningMeterProps {
  isListening: boolean;
  onToggleListening: () => void;
  detectedPitch: DetectedPitch | null;
  selectedString: GuitarString | null;
  onClearStringSelection: () => void;
  onPlayString: (freq: number) => void;
  hasMicPermission: boolean | null;
  errorMessage: string | null;
}

export const TuningMeter: React.FC<TuningMeterProps> = ({
  isListening,
  onToggleListening,
  detectedPitch,
  selectedString,
  onClearStringSelection,
  onPlayString,
  hasMicPermission,
  errorMessage,
}) => {
  // Smoothly damp the cents value to prevent harsh flutter
  const [smoothCents, setSmoothCents] = React.useState(0);
  const targetCentsRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (detectedPitch && detectedPitch.frequency > 0) {
      targetCentsRef.current = Math.max(-50, Math.min(50, detectedPitch.cents));
    } else {
      // slowly return toward center when silence
      targetCentsRef.current = 0;
    }
  }, [detectedPitch]);

  useEffect(() => {
    let current = 0;
    const animate = () => {
      // Lerp smoothing factor
      current += (targetCentsRef.current - current) * 0.22;
      setSmoothCents(current);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const hasPitch = detectedPitch && detectedPitch.frequency > 0;
  const cents = detectedPitch?.cents ?? 0;
  const isPerfect = hasPitch && Math.abs(cents) <= 4;
  const isClose = hasPitch && Math.abs(cents) <= 10;
  const isFlat = hasPitch && cents < -4;
  const isSharp = hasPitch && cents > 4;

  // Active note to show
  const displayNote = selectedString
    ? selectedString.note
    : detectedPitch?.note || '—';
  const displayOctave = selectedString
    ? selectedString.octave
    : detectedPitch?.octave ?? null;

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Subtle background glow when in tune */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isPerfect
            ? 'opacity-25 bg-radial from-emerald-500 via-transparent to-transparent'
            : isFlat
            ? 'opacity-10 bg-radial from-amber-500 via-transparent to-transparent'
            : isSharp
            ? 'opacity-10 bg-radial from-rose-500 via-transparent to-transparent'
            : 'opacity-0'
        }`}
      />

      {/* Top row: Mode indication & Mic Button */}
      <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {selectedString ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium px-2.5 py-1 rounded-lg">
              <span>Mengunci: {selectedString.standardName} ({selectedString.name})</span>
              <button
                onClick={onClearStringSelection}
                className="hover:text-amber-100 ml-1 text-amber-400 underline cursor-pointer text-[11px]"
              >
                Ubah ke Otomatis
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mode Otomatis (Mendeteksi semua nada)</span>
            </div>
          )}
        </div>

        {/* Start / Stop Mic button */}
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all shadow-sm ${
            isListening
              ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-emerald-500/20'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Matikan Mikrofon</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Nyalakan Mikrofon</span>
            </>
          )}
        </button>
      </div>

      {/* Main Meter Area */}
      <div className="py-2 text-center relative z-10">
        {/* Large Note Representation */}
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <span
            className={`font-black text-6xl sm:text-7xl tracking-tighter transition-colors duration-200 select-none ${
              !hasPitch
                ? 'text-zinc-600'
                : isPerfect
                ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                : isFlat
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {hasPitch ? displayNote : isListening ? '...' : '—'}
          </span>
          {hasPitch && displayOctave !== null && (
            <span
              className={`text-2xl font-bold font-mono transition-colors duration-200 ${
                isPerfect ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {displayOctave}
            </span>
          )}
        </div>

        {/* Status text & Actionable advice */}
        <div className="min-h-[44px] flex flex-col items-center justify-center">
          {!isListening ? (
            <p className="text-zinc-400 text-sm">
              Klik <strong className="text-zinc-200 font-medium">Nyalakan Mikrofon</strong> untuk mulai menyetem instrumen gitar Anda.
            </p>
          ) : !hasPitch ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400/60 animate-ping" />
              <span>Mendengarkan... Petik salah satu senar gitar Anda</span>
            </div>
          ) : isPerfect ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base sm:text-lg">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              </div>
              <span>NADA PAS & SEIMBANG!</span>
            </div>
          ) : isFlat ? (
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm sm:text-base">
              <ArrowRight className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Terlalu Rendah (Flat {Math.abs(cents)}¢) — Kencangkan putaran senar</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Terlalu Tinggi (Sharp +{cents}¢) — Kendurkan putaran senar</span>
            </div>
          )}
        </div>

        {/* Visual Needle & Cents Graduation Bar */}
        <div className="mt-6 mb-2 max-w-lg mx-auto">
          {/* Graduation numbers */}
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 px-2 mb-2 select-none">
            <span className="text-amber-400/80">-50¢</span>
            <span>-30</span>
            <span>-15</span>
            <span className="text-emerald-400 font-bold">0 (Pas)</span>
            <span>+15</span>
            <span>+30</span>
            <span className="text-rose-400/80">+50¢</span>
          </div>

          {/* Meter Track */}
          <div className="relative h-12 bg-zinc-950 rounded-xl border border-zinc-800 p-1 flex items-center overflow-hidden">
            {/* Center target zone */}
            <div className="absolute left-1/2 -translate-x-1/2 w-8 h-full bg-emerald-500/10 border-x border-emerald-500/20 pointer-events-none" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-emerald-500 pointer-events-none" />

            {/* Tick lines */}
            <div className="absolute inset-x-4 inset-y-0 flex justify-between items-center opacity-30 pointer-events-none">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[1px] bg-zinc-400 ${
                    i % 5 === 0 ? 'h-5 bg-zinc-200' : 'h-2.5'
                  }`}
                />
              ))}
            </div>

            {/* Dynamic Needle Indicator */}
            <div
              className="absolute top-1 bottom-1 transition-transform duration-75 ease-out"
              style={{
                left: `${Math.max(4, Math.min(96, 50 + (smoothCents / 50) * 46))}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className={`w-3 h-full rounded-md flex flex-col items-center justify-between shadow-lg transition-colors ${
                  !hasPitch
                    ? 'bg-zinc-700/60'
                    : isPerfect
                    ? 'bg-emerald-400 ring-4 ring-emerald-500/30'
                    : isFlat
                    ? 'bg-amber-400 ring-2 ring-amber-500/30'
                    : 'bg-rose-400 ring-2 ring-rose-500/30'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mt-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mb-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Frequency & Details Readout */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Frekuensi Terdeteksi:</span>
            <span className="text-zinc-200 font-semibold">
              {hasPitch ? `${detectedPitch.frequency.toFixed(1)} Hz` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Target Nada:</span>
            <span className="text-zinc-200 font-semibold">
              {hasPitch
                ? `${detectedPitch.targetFrequency.toFixed(1)} Hz`
                : selectedString
                ? `${selectedString.frequency.toFixed(1)} Hz`
                : '—'}
            </span>
          </div>

          {detectedPitch?.closestString && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Cocok Dengan:</span>
              <span className="text-amber-400 font-semibold">
                {detectedPitch.closestString.standardName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error or Permission warning */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <button
            onClick={onToggleListening}
            className="text-xs bg-red-800/50 hover:bg-red-700/50 text-white px-2.5 py-1 rounded-md font-medium"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
