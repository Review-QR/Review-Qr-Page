/**
 * Zero-dependency Web Audio synthesizer for loud merchant & rider alert chimes.
 * Generates clean, crisp audio tones (like hotel reception bells & dispatch chimes)
 * completely offline with zero external audio assets.
 */

class SoundChimePlayer {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a dual-tone pleasant yet loud reception bell ("Ding-Dong!")
   */
  public playNewOrderChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Tone 1: High crisp 'Ding' (880 Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.7, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Tone 2: Warm follow-up 'Dong' (587.33 Hz - D5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(587.33, now + 0.25);
      gain2.gain.setValueAtTime(0.8, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.2);
    } catch {
      // Ignore audio context unlock errors before user interaction
    }
  }

  /**
   * Plays a high-urgency repeating alert for rider ("Order is Ready at Counter!")
   */
  public playOrderReadyAlert() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.15, 0.3].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1046.5 + idx * 100, now + delay); // C6+
        gain.gain.setValueAtTime(0.8, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch {
      // Audio context unlock error
    }
  }

  /**
   * Loops the chime every 4 seconds until dismissed
   */
  public startRepeatingChime(type: "new_order" | "order_ready" = "new_order") {
    this.stopRepeating();
    if (type === "new_order") {
      this.playNewOrderChime();
      this.intervalId = window.setInterval(() => this.playNewOrderChime(), 4000);
    } else {
      this.playOrderReadyAlert();
      this.intervalId = window.setInterval(() => this.playOrderReadyAlert(), 3500);
    }
  }

  public stopRepeating() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const soundChimes = new SoundChimePlayer();
