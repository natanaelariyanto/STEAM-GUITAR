/**
 * Pitch detection using Autocorrelation with parabolic peak interpolation
 * optimized for acoustic/electric guitar frequency range (65 Hz to 500 Hz).
 */

export interface PitchResult {
  frequency: number;
  clarity: number; // 0 to 1
  volume: number; // RMS
}

/**
 * Calculate Root Mean Square (volume) of buffer
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Autocorrelation algorithm with parabolic interpolation
 */
export function detectPitchAutocorrelation(
  buffer: Float32Array,
  sampleRate: number,
  minFreq = 65,
  maxFreq = 500
): PitchResult {
  const rms = calculateRMS(buffer);

  // If signal is too weak, ignore noise
  if (rms < 0.015) {
    return { frequency: 0, clarity: 0, volume: rms };
  }

  // Min and max lag corresponding to frequency bounds
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.ceil(sampleRate / minFreq);

  const bufferSize = buffer.length;
  const maxLag = Math.min(maxPeriod, bufferSize - 1);

  // Autocorrelation array
  let bestPeriod = -1;
  let maxCorrelation = -1;

  // Compute energy for normalization
  let totalEnergy = 0;
  for (let i = 0; i < bufferSize; i++) {
    totalEnergy += buffer[i] * buffer[i];
  }

  if (totalEnergy === 0) {
    return { frequency: 0, clarity: 0, volume: 0 };
  }

  // Autocorrelation search
  const correlations = new Float32Array(maxLag + 2);

  for (let lag = minPeriod; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < bufferSize - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum;
  }

  // Find local peaks
  for (let lag = minPeriod + 1; lag < maxLag; lag++) {
    if (
      correlations[lag] > correlations[lag - 1] &&
      correlations[lag] > correlations[lag + 1] &&
      correlations[lag] > maxCorrelation
    ) {
      maxCorrelation = correlations[lag];
      bestPeriod = lag;
    }
  }

  if (bestPeriod === -1) {
    return { frequency: 0, clarity: 0, volume: rms };
  }

  // Parabolic interpolation for fine sub-sample peak location
  const y1 = correlations[bestPeriod - 1];
  const y2 = correlations[bestPeriod];
  const y3 = correlations[bestPeriod + 1];

  const denominator = 2 * (2 * y2 - y1 - y3);
  let delta = 0;
  if (denominator !== 0) {
    delta = (y1 - y3) / denominator;
  }

  const interpolatedPeriod = bestPeriod + delta;
  const detectedFrequency = sampleRate / interpolatedPeriod;

  // Normalized clarity
  const normalizedCorrelation = maxCorrelation / (totalEnergy || 1);
  const clarity = Math.min(Math.max(normalizedCorrelation * 2, 0), 1);

  // Guard against octaves jumps or crazy frequencies
  if (detectedFrequency < minFreq || detectedFrequency > maxFreq || clarity < 0.3) {
    return { frequency: 0, clarity, volume: rms };
  }

  return {
    frequency: detectedFrequency,
    clarity,
    volume: rms,
  };
}
