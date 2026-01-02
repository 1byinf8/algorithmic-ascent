// Sound utility for timer phase notifications
// Uses Web Audio API for instant playback without external files

type SoundType = 'timerStart' | 'phase1Complete' | 'phase2Complete' | 'problemSolved';

// Create audio context lazily (browser requires user interaction first)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate different tones for different events
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Fade in and out for smoother sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
};

// Play a sequence of tones
const playSequence = (tones: { freq: number; duration: number; delay: number }[]) => {
  tones.forEach(({ freq, duration, delay }) => {
    setTimeout(() => playTone(freq, duration), delay * 1000);
  });
};

export const playSound = (type: SoundType) => {
  switch (type) {
    case 'timerStart':
      // Single rising tone - "let's go!"
      playSequence([
        { freq: 440, duration: 0.1, delay: 0 },     // A4
        { freq: 523.25, duration: 0.15, delay: 0.1 }, // C5
      ]);
      break;

    case 'phase1Complete':
      // Two ascending notes - "keyboard unlocked"
      playSequence([
        { freq: 523.25, duration: 0.15, delay: 0 },    // C5
        { freq: 659.25, duration: 0.2, delay: 0.15 },  // E5
      ]);
      break;

    case 'phase2Complete':
      // Three notes - "editorial available"
      playSequence([
        { freq: 440, duration: 0.12, delay: 0 },       // A4
        { freq: 554.37, duration: 0.12, delay: 0.12 }, // C#5
        { freq: 659.25, duration: 0.2, delay: 0.24 },  // E5
      ]);
      break;

    case 'problemSolved':
      // Victory fanfare - celebratory sequence
      playSequence([
        { freq: 523.25, duration: 0.1, delay: 0 },     // C5
        { freq: 659.25, duration: 0.1, delay: 0.1 },   // E5
        { freq: 783.99, duration: 0.1, delay: 0.2 },   // G5
        { freq: 1046.5, duration: 0.3, delay: 0.3 },   // C6
      ]);
      break;
  }
};

// Check if sounds are enabled (stored in localStorage)
export const isSoundEnabled = (): boolean => {
  const setting = localStorage.getItem('timer_sounds_enabled');
  return setting !== 'false'; // Default to true
};

export const setSoundEnabled = (enabled: boolean) => {
  localStorage.setItem('timer_sounds_enabled', enabled.toString());
};

// Get settings
export interface TimerSettings {
  baseThreshold: number;
  monthlyIncrease: number;
  soundsEnabled: boolean;
  hideRatings: boolean;
}

export const getTimerSettings = (): TimerSettings => {
  const saved = localStorage.getItem('timer_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fall through to defaults
    }
  }
  return {
    baseThreshold: 1500,
    monthlyIncrease: 100,
    soundsEnabled: true,
    hideRatings: false,
  };
};

export const saveTimerSettings = (settings: TimerSettings) => {
  localStorage.setItem('timer_settings', JSON.stringify(settings));
};
