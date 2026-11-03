import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, Minus, Disc } from 'lucide-react';
import { playMetronomeClick } from '../utils/audioContext';

export const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  const tapTimesRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Handle play / stop loop
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentBeat(0);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    let beat = 0;

    // play immediate first beat
    playMetronomeClick(true);
    setCurrentBeat(1);
    beat = 1;

    intervalRef.current = window.setInterval(() => {
      beat = (beat % beatsPerBar) + 1;
      setCurrentBeat(beat);
      playMetronomeClick(beat === 1);
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, bpm, beatsPerBar]);

  // Tap tempo handler
  const handleTapTempo = () => {
    const now = performance.now();
    const recentTaps = tapTimesRef.current.filter((t) => now - t < 3000);
    recentTaps.push(now);
    tapTimesRef.current = recentTaps;

    if (recentTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Disc className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>Metronom Latihan</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Jaga kestabilan tempo ketukan saat berlatih lagu atau skala gitar.
          </p>
        </div>

        {/* Time Signature Buttons */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {[2, 3, 4, 6].map((b) => (
            <button
              key={b}
              onClick={() => {
                setBeatsPerBar(b);
                setCurrentBeat(0);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                beatsPerBar === b
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {b}/4
            </button>
          ))}
        </div>
      </div>

      {/* Main Metronome Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: BPM display & Slider */}
        <div className="w-full md:w-2/3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-100 font-mono tracking-tight">{bpm}</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">BPM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setBpm((prev) => Math.max(30, prev - 1))}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Kurangi 1 BPM"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBpm((prev) => Math.min(250, prev + 1))}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Tambah 1 BPM"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <input
            type="range"
            min="30"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          {/* Visual Beat Dots */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: beatsPerBar }).map((_, i) => {
              const beatNumber = i + 1;
              const isActive = isPlaying && currentBeat === beatNumber;
              const isAccent = beatNumber === 1;

              return (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-full transition-all duration-75 ${
                    isActive
                      ? isAccent
                        ? 'bg-amber-400 ring-4 ring-amber-500/40 scale-105'
                        : 'bg-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Controls (Play/Stop & Tap Tempo) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleTapTempo}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
          >
            Ketuk Tempo (Tap)
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Berhenti</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
