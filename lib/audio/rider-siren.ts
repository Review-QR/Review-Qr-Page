"use client";

/**
 * High-Precision WebAudio Dual-Frequency Proximity Siren & Rider Sound Engine
 * Generates:
 * 1. Authentic 960Hz / 1440Hz pulsating radar buzzer for incoming rides (Zomato/Rapido style)
 * 2. Crisp 587Hz -> 880Hz Ding-Dong bell chime for Counter Order Ready handover
 * 3. Haptic Cash-Chime upon completion
 * 4. Auto-unlock AudioContext on first user interaction to defeat browser autoplay policies
 */

class RiderAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
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
   * Starts the loud pulsating siren alert (960Hz alternating with 1440Hz)
   */
  public playProximitySiren() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.isPlaying = true;

      // Master gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Dual Oscillators for rich harmonic alert buzz
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();

      this.osc1.type = "sawtooth";
      this.osc2.type = "sine";

      const now = this.ctx.currentTime;
      // Pulsating frequency modulation for 40 seconds or until stopped
      for (let i = 0; i < 40; i += 0.4) {
        this.osc1.frequency.setValueAtTime(960, now + i);
        this.osc1.frequency.setValueAtTime(1440, now + i + 0.2);
        this.osc2.frequency.setValueAtTime(1440, now + i);
        this.osc2.frequency.setValueAtTime(960, now + i + 0.2);
      }

      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);

      this.osc1.start();
      this.osc2.start();

      // Mobile device physical vibration
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300, 100]);
      }
    } catch {
      // Audio autoplay restrictions gracefully handled
    }
  }

  /**
   * Stops the active siren immediately
   */
  public stopSiren() {
    if (!this.isPlaying) return;
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
      this.gainNode?.disconnect();
    } catch {}
    this.isPlaying = false;
  }

  /**
   * Sound 2: Crisp Two-Tone Counter Bell Ding-Dong (587Hz -> 880Hz / D5 -> A5)
   * Triggers when merchant clicks "Mark Ready / Call Rider to Counter"
   */
  public playOrderReadyDingDong() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Bell 1: Ding (587.33 Hz - D5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Bell 2: Dong (880 Hz - A5)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.35);
      gain2.gain.setValueAtTime(0.55, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 0.95);

      // Mobile device double buzz
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([150, 80, 250]);
      }
    } catch {}
  }

  /**
   * Sound 3: Crisp single haptic cash-chime upon delivery & payout
   */
  public playCashChime() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  /**
   * Hindi Text-to-Speech Voice Alert Announcement
   */
  public speakHindiAlert(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const riderAudio = new RiderAudioSynthesizer();
