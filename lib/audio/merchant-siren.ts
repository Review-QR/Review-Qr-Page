"use client";

/**
 * High-Precision WebAudio Kitchen Siren & Merchant Alert Engine
 * Features:
 * 1. Zomato/Swiggy-style Kitchen Siren for new incoming orders
 * 2. 2-tone Ding-Dong Bell for KOT print & Rider Handover
 * 3. Ka-Ching Cash Register Chime for instant UPI payments
 * 4. Auto-unlocked on user touch/click to defeat browser autoplay restrictions
 */

class MerchantAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isUnlocked = false;

  constructor() {
    if (typeof window !== "undefined") {
      const handleUserUnlock = () => {
        this.unlock();
      };
      window.addEventListener("click", handleUserUnlock, { once: false, passive: true });
      window.addEventListener("touchstart", handleUserUnlock, { once: false, passive: true });
      window.addEventListener("keydown", handleUserUnlock, { once: false, passive: true });
    }
  }

  public unlock() {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      this.isUnlocked = true;
    } catch {}
  }

  private initContext() {
    this.unlock();
  }

  /**
   * Loud Zomato/Swiggy Kitchen Siren (Alternating 880Hz and 1320Hz)
   */
  public playIncomingOrderSiren(durationSeconds = 6) {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.isPlaying = true;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.25, now);

      // Alternating siren frequency
      const pulseInterval = 0.25;
      const totalPulses = Math.floor(durationSeconds / pulseInterval);

      for (let i = 0; i < totalPulses; i++) {
        const pulseTime = now + i * pulseInterval;
        const freq = i % 2 === 0 ? 880 : 1320;
        osc.frequency.setValueAtTime(freq, pulseTime);
      }

      // Gradual fade out at the end
      gain.gain.setValueAtTime(0.25, now + durationSeconds - 0.3);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      setTimeout(() => {
        this.isPlaying = false;
      }, durationSeconds * 1000);
    } catch {
      this.isPlaying = false;
    }
  }

  /**
   * Pleasant Ding-Dong Bell Chime (587Hz -> 880Hz)
   */
  public playDingDong() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Ding
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Dong
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.25); // A5
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.9);
    } catch {}
  }

  /**
   * Cash Register "Ka-Ching" Sound (UPI Payment Received)
   */
  public playCashRegister() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2600, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }
}

export const merchantAudio = new MerchantAudioSynthesizer();
