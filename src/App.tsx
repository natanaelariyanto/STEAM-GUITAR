import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TuningMeter } from './components/TuningMeter';
import { GuitarHeadstock } from './components/GuitarHeadstock';
import { Metronome } from './components/Metronome';
import { TunerGuide } from './components/TunerGuide';
import { TUNING_PRESETS, frequencyToNote, findClosestString, getAdjustedPreset } from './utils/musicTheory';
import { setupMicrophone, playGuitarStringTone, stopCurrentTone, MicNodes, getAudioContext } from './utils/audioContext';
import { detectPitchAutocorrelation } from './utils/pitchDetection';
import { DetectedPitch, GuitarString, TuningPreset } from './types/tuner';
import { Music, Radio, Disc, HelpCircle } from 'lucide-react';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<TuningPreset>(TUNING_PRESETS[0]);
  const [a4Frequency, setA4Frequency] = useState<number>(440);
  const [noiseGate, setNoiseGate] = useState<number>(0.015);
  const [selectedString, setSelectedString] = useState<GuitarString | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [detectedPitch, setDetectedPitch] = useState<DetectedPitch | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tuner' | 'metronome'>('tuner');

  const micNodesRef = useRef<MicNodes | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const silenceCounterRef = useRef<number>(0);

  // Active adjusted preset based on current A4 frequency
  const activePreset = React.useMemo(() => {
    return getAdjustedPreset(currentPreset, a4Frequency);
  }, [currentPreset, a4Frequency]);

  // Handle String Selection (Lock or Unlock)
  const handleSelectString = useCallback(
    (str: GuitarString) => {
      if (selectedString?.number === str.number) {
        setSelectedString(null);
      } else {
        setSelectedString(str);
      }
      // Also play the reference tone when tapped
      playGuitarStringTone(str.frequency);
    },
    [selectedString]
  );

  // Stop microphone stream
  const stopMicrophone = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (micNodesRef.current) {
      micNodesRef.current.stream.getTracks().forEach((track) => track.stop());
      micNodesRef.current = null;
    }
    setIsListening(false);
    setDetectedPitch(null);
  }, []);

  // Audio analysis frame loop
  const analyzeAudio = useCallback(() => {
    if (!micNodesRef.current) return;
    const { analyser } = micNodesRef.current;
    const ctx = getAudioContext();
    const buffer = new Float32Array(analyser.fftSize);

    const checkPitch = () => {
      analyser.getFloatTimeDomainData(buffer);
      const pitchResult = detectPitchAutocorrelation(
        buffer,
        ctx.sampleRate,
        65, // Min frequency (~C2)
        520 // Max frequency (~C5)
      );

      if (pitchResult.frequency > 0 && pitchResult.volume >= noiseGate) {
        silenceCounterRef.current = 0;
        const noteInfo = frequencyToNote(pitchResult.frequency, a4Frequency);

        let cents = noteInfo.cents;
        let targetFreq = noteInfo.targetFreq;
        let matchedString: GuitarString | undefined = undefined;

        if (selectedString) {
          // If a string is explicitly selected, calculate deviation from THAT target
          matchedString = selectedString;
          targetFreq = selectedString.frequency;
          cents = Math.round(1200 * Math.log2(pitchResult.frequency / selectedString.frequency));
        } else {
          matchedString = findClosestString(pitchResult.frequency, activePreset.strings);
        }

        setDetectedPitch({
          frequency: pitchResult.frequency,
          note: noteInfo.note,
          octave: noteInfo.octave,
          cents,
          clarity: pitchResult.clarity,
          volume: pitchResult.volume,
          closestString: matchedString,
          targetFrequency: targetFreq,
        });
      } else {
        silenceCounterRef.current += 1;
        // Keep note steady for ~12 frames (approx 200ms) to avoid jarring flicker between plucks
        if (silenceCounterRef.current > 14) {
          setDetectedPitch(null);
        }
      }

      rafIdRef.current = requestAnimationFrame(checkPitch);
    };

    rafIdRef.current = requestAnimationFrame(checkPitch);
  }, [a4Frequency, noiseGate, selectedString, activePreset]);

  // Start microphone
  const startMicrophone = useCallback(async () => {
    try {
      setErrorMessage(null);
      const nodes = await setupMicrophone();
      micNodesRef.current = nodes;
      setIsListening(true);
      setHasMicPermission(true);
      analyzeAudio();
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      setIsListening(false);
      setHasMicPermission(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
        setErrorMessage('Izin mikrofon ditolak. Izinkan akses mikrofon di browser Anda untuk menggunakan fitur stem otomatis.');
      } else {
        setErrorMessage('Gagal mengakses mikrofon. Pastikan mikrofon terpasang atau gunakan suara referensi manual.');
      }
    }
  }, [analyzeAudio]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }, [isListening, stopMicrophone, startMicrophone]);

  // Rebind analyzer when settings change if already listening
  useEffect(() => {
    if (isListening && micNodesRef.current) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      analyzeAudio();
    }
  }, [isListening, analyzeAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
      stopCurrentTone();
    };
  }, [stopMicrophone]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-zinc-950">
      {/* Header */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={(p) => {
          setCurrentPreset(p);
          setSelectedString(null);
        }}
        a4Frequency={a4Frequency}
        onChangeA4={setA4Frequency}
        noiseGate={noiseGate}
        onChangeNoiseGate={setNoiseGate}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs (Tuner vs Metronome) */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tuner')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tuner'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Tuner Gitar (Stem)</span>
            </button>

            <button
              onClick={() => setActiveTab('metronome')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'metronome'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>Metronom Latihan</span>
            </button>
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan Stem</span>
          </button>
        </div>

        {activeTab === 'tuner' ? (
          <>
            {/* Primary Meter & Pitch Indicator */}
            <TuningMeter
              isListening={isListening}
              onToggleListening={toggleListening}
              detectedPitch={detectedPitch}
              selectedString={selectedString}
              onClearStringSelection={() => setSelectedString(null)}
              onPlayString={playGuitarStringTone}
              hasMicPermission={hasMicPermission}
              errorMessage={errorMessage}
            />

            {/* Interactive Guitar Strings & Reference Sound Pegs */}
            <GuitarHeadstock
              strings={activePreset.strings}
              selectedString={selectedString}
              onSelectString={handleSelectString}
              onPlayStringTone={playGuitarStringTone}
              detectedStringNumber={detectedPitch?.closestString?.number}
            />

            {/* Quick Helper Banner */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-200 font-medium block">
                    Tidak ingin menggunakan mikrofon?
                  </span>
                  <span>
                    Klik tombol <strong className="text-zinc-300">Bunyikan</strong> pada masing-masing senar di atas untuk stem gitar menggunakan telinga (by ear).
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="shrink-0 text-amber-400 hover:text-amber-300 font-semibold underline text-xs cursor-pointer"
              >
                Lihat Panduan Pemula →
              </button>
            </div>
          </>
        ) : (
          /* Metronome practice screen */
          <div className="space-y-6">
            <Metronome />

            {/* Quick Tempo Reference */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-3">Istilah Tempo Musik Standar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-amber-400 font-bold block">Largo</span>
                  <span className="text-zinc-400">40 - 60 BPM (Sangat Lambat)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-amber-400 font-bold block">Andante</span>
                  <span className="text-zinc-400">76 - 108 BPM (Santai / Sedang)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-amber-400 font-bold block">Moderato</span>
                  <span className="text-zinc-400">108 - 120 BPM (Wajar)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                  <span className="text-amber-400 font-bold block">Allegro</span>
                  <span className="text-zinc-400">120 - 156 BPM (Cepat & Enerjik)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-4 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PetikNada · Aplikasi Stem Gitar HTML Akurat & Sederhana</span>
          <div className="flex items-center gap-3">
            <span>A4 = {a4Frequency} Hz</span>
            <span>·</span>
            <span>{currentPreset.name}</span>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      <TunerGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
