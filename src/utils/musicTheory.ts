import { GuitarString, TuningPreset } from '../types/tuner';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Calculate frequency of any MIDI note given reference A4 (MIDI note 69)
 */
export function midiToFrequency(midiNote: number, a4 = 440): number {
  return a4 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Get MIDI note number and cents offset from frequency
 */
export function frequencyToNote(frequency: number, a4 = 440): {
  note: string;
  octave: number;
  midi: number;
  cents: number;
  targetFreq: number;
} {
  const midiFraction = 69 + 12 * Math.log2(frequency / a4);
  const midi = Math.round(midiFraction);
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const targetFreq = midiToFrequency(midi, a4);
  const cents = Math.floor(1200 * Math.log2(frequency / targetFreq));

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    midi,
    cents,
    targetFreq,
  };
}

/**
 * Tuning Presets for 6-string Guitar
 * Note frequencies are calculated dynamically based on A4 reference if needed,
 * but default frequencies assume A4 = 440Hz.
 */
export const TUNING_PRESETS: TuningPreset[] = [
  {
    id: 'standard',
    name: 'Standar (E A D G B E)',
    description: 'Setelan paling umum untuk gitar akustik dan listrik.',
    strings: [
      { number: 6, name: 'E2', note: 'E', octave: 2, frequency: 82.41, standardName: 'Senar 6 (Bass Rendah)' },
      { number: 5, name: 'A2', note: 'A', octave: 2, frequency: 110.00, standardName: 'Senar 5' },
      { number: 4, name: 'D3', note: 'D', octave: 3, frequency: 146.83, standardName: 'Senar 4' },
      { number: 3, name: 'G3', note: 'G', octave: 3, frequency: 196.00, standardName: 'Senar 3' },
      { number: 2, name: 'B3', note: 'B', octave: 3, frequency: 246.94, standardName: 'Senar 2' },
      { number: 1, name: 'E4', note: 'E', octave: 4, frequency: 329.63, standardName: 'Senar 1 (Treble Tinggi)' },
    ],
  },
  {
    id: 'drop_d',
    name: 'Drop D (D A D G B E)',
    description: 'Senar 6 diturunkan ke D, populer untuk musik rock dan riff berat.',
    strings: [
      { number: 6, name: 'D2', note: 'D', octave: 2, frequency: 73.42, standardName: 'Senar 6 (Drop D)' },
      { number: 5, name: 'A2', note: 'A', octave: 2, frequency: 110.00, standardName: 'Senar 5' },
      { number: 4, name: 'D3', note: 'D', octave: 3, frequency: 146.83, standardName: 'Senar 4' },
      { number: 3, name: 'G3', note: 'G', octave: 3, frequency: 196.00, standardName: 'Senar 3' },
      { number: 2, name: 'B3', note: 'B', octave: 3, frequency: 246.94, standardName: 'Senar 2' },
      { number: 1, name: 'E4', note: 'E', octave: 4, frequency: 329.63, standardName: 'Senar 1' },
    ],
  },
  {
    id: 'half_step_down',
    name: 'Setengah Nada Turun (Eb Ab Db Gb Bb Eb)',
    description: 'Semua senar diturunkan 1/2 nada (Gitar Jimi Hendrix, Guns N\' Roses).',
    strings: [
      { number: 6, name: 'D#2/Eb2', note: 'D#', octave: 2, frequency: 77.78, standardName: 'Senar 6' },
      { number: 5, name: 'G#2/Ab2', note: 'G#', octave: 2, frequency: 103.83, standardName: 'Senar 5' },
      { number: 4, name: 'C#3/Db3', note: 'C#', octave: 3, frequency: 138.59, standardName: 'Senar 4' },
      { number: 3, name: 'F#3/Gb3', note: 'F#', octave: 3, frequency: 185.00, standardName: 'Senar 3' },
      { number: 2, name: 'A#3/Bb3', note: 'A#', octave: 3, frequency: 233.08, standardName: 'Senar 2' },
      { number: 1, name: 'D#4/Eb4', note: 'D#', octave: 4, frequency: 311.13, standardName: 'Senar 1' },
    ],
  },
  {
    id: 'open_d',
    name: 'Open D (D A D F# A D)',
    description: 'Dipetik lepas langsung membentuk akor D Mayor. Sangat merdu untuk slide.',
    strings: [
      { number: 6, name: 'D2', note: 'D', octave: 2, frequency: 73.42, standardName: 'Senar 6' },
      { number: 5, name: 'A2', note: 'A', octave: 2, frequency: 110.00, standardName: 'Senar 5' },
      { number: 4, name: 'D3', note: 'D', octave: 3, frequency: 146.83, standardName: 'Senar 4' },
      { number: 3, name: 'F#3', note: 'F#', octave: 3, frequency: 185.00, standardName: 'Senar 3' },
      { number: 2, name: 'A3', note: 'A', octave: 3, frequency: 220.00, standardName: 'Senar 2' },
      { number: 1, name: 'D4', note: 'D', octave: 4, frequency: 293.66, standardName: 'Senar 1' },
    ],
  },
  {
    id: 'open_g',
    name: 'Open G (D G D G B D)',
    description: 'Setelan khas Keith Richards (Rolling Stones) dan musik blues akustik.',
    strings: [
      { number: 6, name: 'D2', note: 'D', octave: 2, frequency: 73.42, standardName: 'Senar 6' },
      { number: 5, name: 'G2', note: 'G', octave: 2, frequency: 98.00, standardName: 'Senar 5' },
      { number: 4, name: 'D3', note: 'D', octave: 3, frequency: 146.83, standardName: 'Senar 4' },
      { number: 3, name: 'G3', note: 'G', octave: 3, frequency: 196.00, standardName: 'Senar 3' },
      { number: 2, name: 'B3', note: 'B', octave: 3, frequency: 246.94, standardName: 'Senar 2' },
      { number: 1, name: 'D4', note: 'D', octave: 4, frequency: 293.66, standardName: 'Senar 1' },
    ],
  },
  {
    id: 'dadgad',
    name: 'DADGAD (Celtic / Folk)',
    description: 'Setelan modal khas musik Celtic, folk akustik, bernuansa mistis dan luas.',
    strings: [
      { number: 6, name: 'D2', note: 'D', octave: 2, frequency: 73.42, standardName: 'Senar 6' },
      { number: 5, name: 'A2', note: 'A', octave: 2, frequency: 110.00, standardName: 'Senar 5' },
      { number: 4, name: 'D3', note: 'D', octave: 3, frequency: 146.83, standardName: 'Senar 4' },
      { number: 3, name: 'G3', note: 'G', octave: 3, frequency: 196.00, standardName: 'Senar 3' },
      { number: 2, name: 'A3', note: 'A', octave: 3, frequency: 220.00, standardName: 'Senar 2' },
      { number: 1, name: 'D4', note: 'D', octave: 4, frequency: 293.66, standardName: 'Senar 1' },
    ],
  },
];

/**
 * Adjust preset string frequencies based on custom A4 (e.g. 432 Hz vs 440 Hz)
 */
export function getAdjustedPreset(preset: TuningPreset, a4: number): TuningPreset {
  if (a4 === 440) return preset;
  const ratio = a4 / 440;
  return {
    ...preset,
    strings: preset.strings.map((str) => ({
      ...str,
      frequency: Number((str.frequency * ratio).toFixed(2)),
    })),
  };
}

/**
 * Find closest guitar string in preset for a given frequency
 */
export function findClosestString(frequency: number, strings: GuitarString[]): GuitarString | undefined {
  if (!frequency || frequency <= 0) return undefined;
  let minDiff = Infinity;
  let closest: GuitarString | undefined = undefined;

  for (const str of strings) {
    const diff = Math.abs(frequency - str.frequency);
    if (diff < minDiff) {
      minDiff = diff;
      closest = str;
    }
  }

  return closest;
}
