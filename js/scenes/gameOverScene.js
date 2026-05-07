// ============================================================
// gameOverScene.js — Game Over screen
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT, COLOR } from '../constants.js';

export class GameOverScene {
  /**
   * @param {InputHandler} input
   * @param {AudioManager} audio
   * @param {number}       finalScore
   * @param {Function}     onRestart
   */
  constructor(input, audio, finalScore, onRestart) {
    this.input      = input;
    this.audio      = audio;
    this.score      = finalScore;
    this.onRestart  = onRestart;

    this._time       = 0;
    this._blinkOn    = true;
    this._blinkTimer = 0;
    this._ready      = false;    // Wait a moment before accepting input
    this._readyTimer = 0;
    this._particles  = this._genParticles();
  }

  // ── Particle ambience ─────────────────────────────────────

  _genParticles() {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x:     Math.random() * GAME_WIDTH,
        y:     Math.random() * GAME_HEIGHT,
        vx:    (Math.random() - 0.5) * 20,
        vy:    -(10 + Math.random() * 20),
        alpha: Math.random(),
        size:  1 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#EF5350' : '#FF8A65',
      });
    }
    return particles;
  }

  // ── Update ────────────────────────────────────────────────

  update(dt) {
    this._time       += dt;
    this._blinkTimer += dt;
    this._readyTimer += dt;

    if (this._blinkTimer >= 0.5) {
      this._blinkTimer = 0;
      this._blinkOn    = !this._blinkOn;
    }

    // Accept tap/click only after 1.5s (prevent accidental skip)
    if (this._readyTimer >= 1.5) this._ready = true;

    // Update particles
    for (const p of this._particles) {
      p.x     += p.vx * dt;
      p.y     += p.vy * dt;
      p.alpha -= dt * 0.3;
      if (p.alpha <= 0) {
        // Reset particle
        p.x     = Math.random() * GAME_WIDTH;
        p.y     = GAME_HEIGHT;
        p.vx    = (Math.random() - 0.5) * 20;
        p.vy    = -(10 + Math.random() * 20);
        p.alpha = 1;
      }
    }

    // Input
    if (this._ready) {
      const tapped = this.input.jumpPressed || this.input.attackPressed ||
                     this.input.keys.jump   || this.input.keys.attack;
      if (tapped && this.onRestart) this.onRestart();
    }
  }

  // ── Draw ──────────────────────────────────────────────────

  draw(ctx) {
    // Background
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Particles
    for (const p of this._particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.fillStyle    = '#EF5350';
    ctx.font         = 'bold 26px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = '#B71C1C';
    ctx.shadowBlur   = 16;
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT * 0.35);
    ctx.shadowBlur   = 0;

    // Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font      = '14px monospace';
    ctx.fillText(`SCORE: ${this.score}`, GAME_WIDTH / 2, GAME_HEIGHT * 0.52);

    // Blink restart prompt
    if (this._blinkOn && this._ready) {
      ctx.fillStyle = '#FFEE58';
      ctx.font      = '11px monospace';
      ctx.fillText('TAP TO RESTART', GAME_WIDTH / 2, GAME_HEIGHT * 0.68);
    }
  }
}
