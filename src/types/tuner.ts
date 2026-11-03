export interface GuitarString {
  number: number; // 1 to 6 (1 is high E, 6 is low E)
  name: string; // e.g. "E4", "B3"
  note: string; // "E", "B"
  octave: number; // 4, 3, 2
  frequency: number; // in Hz (at A4=440Hz base)
  standardName: string; // e.g. "Senar 1 (Tinggi)"
}

export interface TuningPreset {
  id: string;
  name: string;
  description: string;
  strings: GuitarString[]; // ordered from 6 (thickest / lowest) down to 1 (thinnest / highest)
}

export interface DetectedPitch {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  clarity: number; // 0 to 1
  volume: number; // RMS
  closestString?: GuitarString;
  targetFrequency: number;
}
