/**
 * Audio Context manager for Microphone input & Guitar string sound synthesis
 */

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

export interface MicNodes {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  filter: BiquadFilterNode;
  analyser: AnalyserNode;
}

/**
 * Setup microphone with guitar bandpass filter (60Hz to 850Hz) and high-res analyser
 */
export async function setupMicrophone(): Promise<MicNodes> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  const source = ctx.createMediaStreamSource(stream);

  // Bandpass filter to suppress low rumble (<60Hz) and high squeaks (>850Hz)
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 220; // Center around A3
  filter.Q.value = 0.5; // Wide musical Q

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096; // 4096 samples provides good resolution for low guitar E2 (82Hz)

  source.connect(filter);
  filter.connect(analyser);

  return { stream, source, filter, analyser };
}

let activeToneNodes: {
  oscillators: OscillatorNode[];
  gainNodes: GainNode[];
  stopTimeout?: number;
} | null = null;

export function stopCurrentTone(): void {
  if (activeToneNodes) {
    if (activeToneNodes.stopTimeout) {
      window.clearTimeout(activeToneNodes.stopTimeout);
    }
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    activeToneNodes.gainNodes.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      } catch {
        // ignore
      }
    });
    const oscs = activeToneNodes.oscillators;
    window.setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // ignore
        }
      });
    }, 60);
    activeToneNodes = null;
  }
}

/**
 * Synthesizes an acoustic plucked guitar string tone
 */
export function playGuitarStringTone(frequency: number, durationSeconds = 3.2): void {
  stopCurrentTone();
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Master gain for this pluck
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [masterGain];

  // Harmonics config for rich warm guitar string tone
  const harmonics = [
    { mult: 1, gain: 0.55, decayRate: 1.0 }, // Fundamental
    { mult: 2, gain: 0.25, decayRate: 1.2 }, // 2nd Harmonic
    { mult: 3, gain: 0.12, decayRate: 1.5 }, // 3rd Harmonic
    { mult: 4, gain: 0.06, decayRate: 2.0 }, // 4th Harmonic
    { mult: 5, gain: 0.03, decayRate: 2.4 }, // 5th Harmonic
  ];

  harmonics.forEach(({ mult, gain: harmGainVal, decayRate }) => {
    const osc = ctx.createOscillator();
    const harmGain = ctx.createGain();

    osc.type = mult % 2 === 1 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(frequency * mult, now);

    // Envelope: quick attack, natural exponential decay
    harmGain.gain.setValueAtTime(0.0001, now);
    harmGain.gain.linearRampToValueAtTime(harmGainVal, now + 0.015);
    const effectiveDuration = durationSeconds / decayRate;
    harmGain.gain.exponentialRampToValueAtTime(0.0001, now + effectiveDuration);

    osc.connect(harmGain);
    harmGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + effectiveDuration + 0.1);

    oscillators.push(osc);
    gainNodes.push(harmGain);
  });

  // Short noise pick attack for realistic guitar strike feel
  try {
    const pickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const data = pickBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = pickBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(Math.min(frequency * 3, 2500), now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noise.start(now);
  } catch {
    // noise generator optional fallback
  }

  const stopTimeout = window.setTimeout(() => {
    activeToneNodes = null;
  }, (durationSeconds + 0.2) * 1000);

  activeToneNodes = {
    oscillators,
    gainNodes,
    stopTimeout,
  };
}

/**
 * Play an accurate metronome click sound
 */
export function playMetronomeClick(accent = false): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 1400 : 900, now);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}
