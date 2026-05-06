export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicTimer = null;
    this.enabled = false;
    this.musicStep = 0;
    this.musicLoop = null;
  }

  async init() {
    if (this.enabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.3;
    this.master.connect(this.ctx.destination);
    this.enabled = true;
    await this.ctx.resume();
    this.startMusic();
  }

  stop() {
    if (this.musicLoop) clearInterval(this.musicLoop);
    this.musicLoop = null;
  }

  _tone(type, freq, duration, gain = 0.1, targetFreq = null) {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (targetFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + duration);
    }
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  _noiseBurst(duration = 0.05, gain = 0.12, highpass = 1000) {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    const g = ctx.createGain();
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    source.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    source.start();
    source.stop(ctx.currentTime + duration + 0.02);
  }

  jump() {
    this._tone('square', 300, 0.08, 0.12, 500);
  }

  doubleJump() {
    this._tone('square', 600, 0.1, 0.13, 1000);
  }

  slash() {
    this._noiseBurst(0.08, 0.12, 2000);
    this._tone('sawtooth', 200, 0.08, 0.05, 80);
  }

  hit() {
    this._tone('square', 150, 0.1, 0.14);
  }

  collect() {
    this._tone('sine', 523, 0.08, 0.08);
    setTimeout(() => this._tone('sine', 659, 0.08, 0.08), 85);
    setTimeout(() => this._tone('sine', 784, 0.08, 0.08), 170);
  }

  hurt() {
    this._tone('square', 100, 0.2, 0.16);
  }

  death() {
    this._tone('sine', 440, 0.18, 0.12, 220);
    setTimeout(() => this._tone('sine', 220, 0.16, 0.1, 110), 140);
  }

  enemyDeath() {
    this._noiseBurst(0.05, 0.08, 800);
    this._tone('sawtooth', 300, 0.07, 0.08, 50);
  }

  goal() {
    const notes = [523, 587, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this._tone('sine', f, 0.1, 0.08), i * 105));
  }

  startMusic() {
    if (!this.enabled || this.musicLoop) return;
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0];
    const bass = [130.81, 196.0];
    let step = 0;
    this.musicLoop = setInterval(() => {
      if (!this.enabled) return;
      const beat = step % 8;
      const note = notes[beat % notes.length];
      this._tone('triangle', note, 0.16, 0.035);
      if (beat % 2 === 0) this._tone('square', bass[(beat / 2) % bass.length], 0.22, 0.04);
      if (beat === 0 || beat === 4) this._noiseBurst(0.025, 0.03, 400);
      step++;
    }, 250);
  }
}
