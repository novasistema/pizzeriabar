/**
 * Web Audio API synthesizer for instant pleasant audio feedback and admin chimes.
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleSound(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playSuccessTone();
    }
    return !this.isMuted;
  }

  /**
   * Sound for adding item to cart (Electric Guitar Power Chord)
   */
  public playAddToCart() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Electric guitar power chord: Root (E3 = 164.81), 5th (B3 = 246.94), Octave (E4 = 329.63)
      const freqs = [164.81, 246.94, 329.63];

      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.015);

        // Lowpass filter for guitar amp tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(350, now + 0.35);

        gain.gain.setValueAtTime(0.12, now + i * 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.015);
        osc.stop(now + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Vinyl needle drop / crackle sound effect
   */
  public playVinylNeedleDrop() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate soft vinyl dust crackle
      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() < 0.03) {
          output[i] = (Math.random() * 2 - 1) * 0.3;
        } else {
          output[i] = (Math.random() * 2 - 1) * 0.02;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  /**
   * Rock Riff Celebration (for placing an order or switching vinyl track)
   */
  public playRockRiff() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Classic rock pentatonic riff: A4, C5, D5, D#5, D5, C5, A4
      const notes = [
        { f: 220.0, d: 0.1, t: 0 },
        { f: 261.63, d: 0.1, t: 0.09 },
        { f: 293.66, d: 0.12, t: 0.18 },
        { f: 311.13, d: 0.08, t: 0.29 },
        { f: 293.66, d: 0.12, t: 0.36 },
        { f: 440.0, d: 0.4, t: 0.48 },
      ];

      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now + n.t);
        filter.frequency.exponentialRampToValueAtTime(600, now + n.t + n.d);

        gain.gain.setValueAtTime(0.12, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Sound for a new order received (Restaurant bell/chime)
   */
  public playNewOrderBell() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (major chord arpeggio)
      
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.3, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } catch {
      // Ignore audio failure if not interacted yet
    }
  }

  /**
   * Sound for payment verified or order successfully placed
   */
  public playSuccessTone() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound for status progression (e.g. En Horno, En Camino)
   */
  public playStatusPing() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880.0, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  public playOrderReceived() {
    this.playNewOrderBell();
  }

  public playNotificationTone() {
    this.playStatusPing();
  }

  public playCashSound() {
    this.playSuccessTone();
  }
}

export const soundManager = new SoundEffectsManager();
