/**
 * Kanakita - Audio Controller Module
 * Handles Web Speech API (Japanese pronunciation) and Web Audio API sound effects.
 */

class AudioController {
  constructor() {
    this.synth = window.speechSynthesis;
    this.audioCtx = null;
    this.isMuted = false;
  }

  // Initialize Web Audio Context on user interaction
  initAudioCtx() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Speak Japanese Text using Web Speech API
  speakJapanese(text) {
    if (this.isMuted || !this.synth) return;
    
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // Slightly slower for clear learning pronunciation

    // Try finding a native Japanese voice if available
    const voices = this.synth.getVoices();
    const jaVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    this.synth.speak(utterance);
  }

  // Play Click Sound Effect
  playClick() {
    if (this.isMuted) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  // Play Correct Answer Chime
  playCorrect() {
    if (this.isMuted) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  // Play Wrong Answer Sound
  playWrong() {
    if (this.isMuted) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Play Fanfare Victory Melody
  playFanfare() {
    if (this.isMuted) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const melody = [
      { note: 523.25, time: 0 },
      { note: 659.25, time: 0.12 },
      { note: 783.99, time: 0.24 },
      { note: 1046.50, time: 0.4 }
    ];

    melody.forEach(item => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.note, now + item.time);

      gain.gain.setValueAtTime(0.25, now + item.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + item.time);
      osc.stop(now + item.time + 0.4);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

const audioController = new AudioController();
