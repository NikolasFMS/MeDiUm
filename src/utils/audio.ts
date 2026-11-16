// Web Audio API helper for atmospheric board game sound effects & ambient drone
import { haptics } from './haptics';

const MUTE_STORAGE_KEY = 'medium_mansion_muted_v1';

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private ambientLfoGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientOsc3: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private isPlayingAmbient: boolean = false;
  private ambientListenersAttached: boolean = false;
  private ambientListeners = new Set<(playing: boolean) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
      } catch {}
    }
  }

  private ensureVisibilityHandler() {
    if (this.ambientListenersAttached || typeof document === 'undefined') return;
    this.ambientListenersAttached = true;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (this.ctx && this.ctx.state === 'running' && this.isPlayingAmbient) {
          this.ctx.suspend().catch(() => {});
        }
      } else if (document.visibilityState === 'visible') {
        if (this.isPlayingAmbient && !this.isMuted) {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          } else if (!this.ambientGain) {
            this.startAmbient();
          }
        }
      }
    });
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.ensureVisibilityHandler();
  }

  public onAmbientChange(cb: (playing: boolean) => void): () => void {
    this.ambientListeners.add(cb);
    return () => {
      this.ambientListeners.delete(cb);
    };
  }

  private notifyAmbientListeners() {
    const active = this.isAmbientActive();
    this.ambientListeners.forEach((cb) => cb(active));
  }

  public isAmbientActive(): boolean {
    return this.isPlayingAmbient && !this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(this.isMuted));
    } catch {}
    if (this.isMuted && this.isPlayingAmbient) {
      this.stopAmbientNodes();
    } else if (!this.isMuted && this.isPlayingAmbient) {
      this.startAmbient();
    }
    this.notifyAmbientListeners();
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playClick(skipHaptic = false) {
    if (!skipHaptic) {
      haptics.tap();
    }
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore audio context errors before user interaction
    }
  }

  public playSealSound() {
    haptics.success();
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(330, now + 0.15);
      osc.frequency.setValueAtTime(440, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.8);
    } catch {}
  }

  public playLossSound() {
    haptics.error();
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.6);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.6);
    } catch {}
  }

  public playTimerEndSound() {
    haptics.timerEnd();
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const playBell = (freq: number, startOffset: number, duration: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(0.001, now + startOffset);
        gain.gain.linearRampToValueAtTime(0.22, now + startOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };

      playBell(523.25, 0, 0.45); // C5
      playBell(392.0, 0.25, 0.7); // G4
    } catch {}
  }

  public toggleAmbient(): boolean {
    this.isPlayingAmbient = !this.isPlayingAmbient;
    if (this.isPlayingAmbient && !this.isMuted) {
      this.startAmbient();
    } else {
      this.stopAmbientNodes();
    }
    this.notifyAmbientListeners();
    return this.isPlayingAmbient;
  }

  private startAmbient() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ambientGain) {
        this.stopAmbientNodes();
      }
      const now = this.ctx.currentTime;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.055, now + 0.9);

      // Band-friendly low-pass filter tuned for mobile phone speakers (140Hz - 460Hz)
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(340, now);
      this.ambientFilter.Q.setValueAtTime(1.4, now);

      // Slow LFO gently sweeps filter cutoff for eerie mansion breathing
      this.ambientLfo = this.ctx.createOscillator();
      this.ambientLfo.type = 'sine';
      this.ambientLfo.frequency.setValueAtTime(0.11, now);

      this.ambientLfoGain = this.ctx.createGain();
      this.ambientLfoGain.gain.setValueAtTime(120, now);

      this.ambientLfo.connect(this.ambientLfoGain);
      this.ambientLfoGain.connect(this.ambientFilter.frequency);

      // Phone-audible warm minor drone (D3, A3, F3-detuned)
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientOsc.type = 'triangle';
      this.ambientOsc.frequency.setValueAtTime(146.83, now); // D3

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'sine';
      this.ambientOsc2.frequency.setValueAtTime(220.0, now); // A3

      this.ambientOsc3 = this.ctx.createOscillator();
      this.ambientOsc3.type = 'sine';
      this.ambientOsc3.frequency.setValueAtTime(174.61, now); // F3 (minor third)

      this.ambientOsc.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientOsc3.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientLfo.start();
      this.ambientOsc.start();
      this.ambientOsc2.start();
      this.ambientOsc3.start();
    } catch {}
  }

  private stopAmbientNodes() {
    try {
      if (this.ambientOsc) {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientOsc = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
      if (this.ambientOsc3) {
        this.ambientOsc3.stop();
        this.ambientOsc3.disconnect();
        this.ambientOsc3 = null;
      }
      if (this.ambientLfo) {
        this.ambientLfo.stop();
        this.ambientLfo.disconnect();
        this.ambientLfo = null;
      }
      if (this.ambientLfoGain) {
        this.ambientLfoGain.disconnect();
        this.ambientLfoGain = null;
      }
      if (this.ambientFilter) {
        this.ambientFilter.disconnect();
        this.ambientFilter = null;
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
    } catch {}
  }
}

export const soundManager = new SoundManager();
