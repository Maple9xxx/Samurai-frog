// ============================================================
// audio.js — Web Audio API synthesised SFX + procedural BGM
// No external audio files — all sounds generated in code
// ============================================================

export class AudioManager {
  constructor() {
    this._ctx     = null; // AudioContext (lazy init on first user interaction)
    this._master  = null; // Master GainNode
    this._bgmLoop = null; // BGM scheduler timeout
    this._bgmBeat = 0;    // Current beat counter
    this._muted   = false;
    this._bgmPlaying = false;
  }

  // ── Init (must be called after a user gesture) ─────────────

  init() {
    if (this._ctx) return;
    this._ctx    = new (window.AudioContext || window.webkitAudioContext)();
    this._master = this._ctx.createGain();
    this._master.gain.value = 0.35;
    this._master.connect(this._ctx.destination);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._master) {
      this._master.gain.value = this._muted ? 0 : 0.35;
    }
    return this._muted;
  }

  // ── SFX helpers ───────────────────────────────────────────

  /** @param {OscillatorNode} osc @param {GainNode} gain */
  _connect(osc, gain) {
    osc.connect(gain);
    gain.connect(this._master);
  }

  _osc(type, freq, startTime, endFreq, duration) {
    const osc  = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq !== undefined) {
      osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
    }
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    this._connect(osc, gain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  _noise(duration, startTime, filterFreq = 2000) {
    const bufferSize = this._ctx.sampleRate * duration;
    const buffer     = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this._ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this._ctx.createBiquadFilter();
    filter.type            = 'highpass';
    filter.frequency.value = filterFreq;

    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._master);
    source.start(startTime);
  }

  // ── Sound Effects ─────────────────────────────────────────

  playJump() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._osc('square', 300, t, 500, 0.1);
  }

  playDoubleJump() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._osc('square', 300, t, 500, 0.1);
    this._osc('square', 600, t + 0.02, 1000, 0.1);
  }

  playSlash() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._noise(0.08, t, 2000);
    this._osc('sawtooth', 200, t, 80, 0.1);
  }

  playHit() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._osc('square', 150, t, 80, 0.1);
  }

  playCollect() {
    if (!this._ctx) return;
    const t    = this._ctx.currentTime;
    const notes = [523, 659, 784]; // C5 E5 G5
    notes.forEach((freq, i) => {
      this._osc('sine', freq, t + i * 0.08, freq, 0.08);
    });
  }

  playHurt() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._osc('square', 100, t, 60, 0.2);
  }

  playDeath() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._osc('sine', 440, t, 110, 0.5);
  }

  playEnemyDeath() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    this._noise(0.05, t, 1000);
    this._osc('sawtooth', 300, t, 50, 0.12);
  }

  playGoal() {
    if (!this._ctx) return;
    const t     = this._ctx.currentTime;
    const notes = [523, 587, 659, 784, 1047]; // C5 D5 E5 G5 C6
    notes.forEach((freq, i) => {
      this._osc('sine', freq, t + i * 0.1, freq, 0.12);
    });
  }

  playPowerUp() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime;
    [392, 523, 659, 784, 1047].forEach((freq, i) => {
      this._osc('sine', freq, t + i * 0.07, freq * 1.05, 0.1);
    });
  }

  // ── BGM ───────────────────────────────────────────────────

  startBGM() {
    if (!this._ctx || this._bgmPlaying) return;
    this._bgmPlaying = true;
    this._bgmBeat    = 0;
    this._scheduleBGM();
  }

  stopBGM() {
    this._bgmPlaying = false;
    if (this._bgmLoop) clearTimeout(this._bgmLoop);
  }

  _scheduleBGM() {
    if (!this._bgmPlaying) return;

    const BPM        = 120;
    const beatDur    = 60 / BPM;             // 0.5 s per beat
    const t          = this._ctx.currentTime;
    const BEATS_AHEAD = 4;

    // Schedule 4 beats at a time for smooth playback
    for (let b = 0; b < BEATS_AHEAD; b++) {
      const bt = t + b * beatDur;
      this._bgmBeat++;
      this._playBGMBeat(bt, this._bgmBeat);
    }

    // Schedule next batch just before they play out
    this._bgmLoop = setTimeout(
      () => this._scheduleBGM(),
      (BEATS_AHEAD - 1) * beatDur * 1000
    );
  }

  _playBGMBeat(time, beat) {
    // Pentatonic: C4 D4 E4 G4 A4
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00];
    // Simple melody pattern over 8 beats
    const melody = [0, 2, 4, 2,  4, 3, 1, 0];
    const idx    = (beat - 1) % melody.length;
    const freq   = scale[melody[idx]];

    // Melody (triangle wave)
    const mel = this._ctx.createOscillator();
    const mG  = this._ctx.createGain();
    mel.type = 'triangle';
    mel.frequency.value = freq;
    mG.gain.setValueAtTime(0.18, time);
    mG.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    mel.connect(mG);
    mG.connect(this._master);
    mel.start(time);
    mel.stop(time + 0.5);

    // Bass (square wave) — C3 / G3 alternating every 2 beats
    const bassFreq = beat % 4 < 2 ? 130.81 : 196.00;
    const bass = this._ctx.createOscillator();
    const bG   = this._ctx.createGain();
    bass.type = 'square';
    bass.frequency.value = bassFreq;
    bG.gain.setValueAtTime(0.08, time);
    bG.gain.exponentialRampToValueAtTime(0.001, time + 0.48);
    bass.connect(bG);
    bG.connect(this._master);
    bass.start(time);
    bass.stop(time + 0.5);

    // Kick-like noise burst every 2 beats
    if (beat % 2 === 0) {
      this._noise(0.03, time, 500);
    }
  }
}
