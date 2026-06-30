/** @file TTS.js - Text-to-Speech using Web Speech API */

export class TTS {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.queue = [];
    this.speaking = false;
    this.enabled = true;

    // Initialize voices when available
    if (this.synth) {
      this.initVoices();
    }
  }

  initVoices() {
    const pickVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer warm, friendly English voices
      const preferred = [
        'Google US English',
        'Samantha',
        'Karen',
        'Alex',
        'Fred',
        'Google UK English Female',
        'Google UK English Male'
      ];
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name));
        if (v) { this.voice = v; break; }
      }
      if (!this.voice) {
        // Fallback: any English voice
        this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      }
    };

    if (this.synth.getVoices().length) {
      pickVoice();
    } else {
      this.synth.onvoiceschanged = pickVoice;
    }
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) this.cancel();
  }

  async speak(text, { rate = 0.85, pitch = 1.1, volume = 0.9 } = {}) {
    if (!this.enabled || !this.synth) return;
    return new Promise((resolve) => {
      this.synth.cancel(); // Stop any current speech
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = volume;
      utter.voice = this.voice;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      this.synth.speak(utter);
    });
  }

  cancel() {
    if (this.synth) this.synth.cancel();
  }

  // Pre-warm the speech engine (browsers often require user interaction first)
  warmup() {
    if (this.synth && this.enabled) {
      const utter = new SpeechSynthesisUtterance(' ');
      utter.volume = 0;
      this.synth.speak(utter);
    }
  }
}

export const tts = new TTS();
