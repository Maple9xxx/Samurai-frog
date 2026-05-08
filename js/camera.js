// ============================================================
// camera.js — Follows player, parallax background, screen shake
// v2: Added trauma-based screen shake
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT, LEVEL_WIDTH } from './constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;

    // ── Screen shake (trauma model) ──────────────────────────
    // trauma: 0..1, decays over time. shake = trauma².
    this._trauma     = 0;
    this._shakeX     = 0;
    this._shakeY     = 0;
    this._shakeTime  = 0;

    // Pre-generated static background data
    this._mountains = this._genMountains();
    this._clouds    = this._genClouds();
    this._trees     = this._genTrees();
    this._bushes    = this._genBushes();
  }

  // ── Trauma API ────────────────────────────────────────────

  /** Add trauma (0..1). Stacks additively, capped at 1. */
  addTrauma(amount) {
    this._trauma = Math.min(1, this._trauma + amount);
  }

  // ── Update ────────────────────────────────────────────────

  update(playerX, dt) {
    // Smooth follow
    const target = playerX - GAME_WIDTH * 0.35;
    this.x += (target - this.x) * 0.12;
    this.x  = Math.max(0, Math.min(this.x, LEVEL_WIDTH - GAME_WIDTH));

    // Decay trauma
    this._trauma = Math.max(0, this._trauma - dt * 2.2);

    // Compute shake offset (trauma²)
    const shake = this._trauma * this._trauma;
    this._shakeTime += dt * 60;
    const MAX_SHAKE = 5;
    this._shakeX = shake * MAX_SHAKE * (Math.sin(this._shakeTime * 1.7) * 0.6 + Math.sin(this._shakeTime * 3.1) * 0.4);
    this._shakeY = shake * MAX_SHAKE * (Math.sin(this._shakeTime * 2.3) * 0.6 + Math.sin(this._shakeTime * 4.1) * 0.4);
  }

  /** Apply camera transform to ctx (call save/restore around this) */
  applyShake(ctx) {
    if (this._shakeX !== 0 || this._shakeY !== 0) {
      ctx.translate(this._shakeX, this._shakeY);
    }
  }

  // ── Draw Parallax Background ──────────────────────────────

  drawBackground(ctx) {
    ctx.save();
    this.applyShake(ctx);

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0,   '#B2EBF2');
    grad.addColorStop(0.6, '#E0F7FA');
    grad.addColorStop(1,   '#A5D6A7');
    ctx.fillStyle = grad;
    ctx.fillRect(-10, -10, GAME_WIDTH + 20, GAME_HEIGHT + 20);

    const ox1 = -(this.x * 0.2);
    const ox2 = -(this.x * 0.5);
    const ox3 = -(this.x * 0.8);

    this._drawLayer1(ctx, ox1);
    this._drawLayer2(ctx, ox2);
    this._drawLayer3(ctx, ox3);

    ctx.restore();
  }

  // ── Layer 1: Mountains + Clouds ───────────────────────────

  _drawLayer1(ctx, offsetX) {
    ctx.fillStyle = '#81C784';
    for (const m of this._mountains) {
      const sx = (m.x + offsetX) % (LEVEL_WIDTH * 0.25);
      for (let w = -1; w <= 1; w++) {
        const x = sx + w * LEVEL_WIDTH * 0.25;
        if (x + m.w < -20 || x > GAME_WIDTH + 20) continue;
        ctx.beginPath();
        ctx.moveTo(x, GAME_HEIGHT * 0.75);
        ctx.lineTo(x + m.w * 0.5, m.peak);
        ctx.lineTo(x + m.w, GAME_HEIGHT * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.moveTo(x + m.w * 0.5, m.peak);
        ctx.lineTo(x + m.w * 0.35, m.peak + m.snowH);
        ctx.lineTo(x + m.w * 0.65, m.peak + m.snowH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#81C784';
      }
    }

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#FFFFFF';
    for (const c of this._clouds) {
      const sx = (c.x + offsetX) % (LEVEL_WIDTH * 0.25);
      for (let w = -1; w <= 1; w++) {
        const x = sx + w * LEVEL_WIDTH * 0.25;
        if (x + c.w * 2 < -20 || x > GAME_WIDTH + 20) continue;
        this._drawCloud(ctx, x, c.y, c.w);
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawCloud(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x,         y,     r,       0, Math.PI * 2);
    ctx.arc(x + r,     y - 4, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r * 2, y,     r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Layer 2: Trees ────────────────────────────────────────

  _drawLayer2(ctx, offsetX) {
    for (const t of this._trees) {
      const sx = (t.x + offsetX) % (LEVEL_WIDTH * 0.6);
      for (let w = -1; w <= 1; w++) {
        const x = sx + w * LEVEL_WIDTH * 0.6;
        if (x + 20 < -20 || x > GAME_WIDTH + 20) continue;
        this._drawBambooTree(ctx, x, t.h);
      }
    }
  }

  _drawBambooTree(ctx, x, h) {
    const bottom = GAME_HEIGHT * 0.78;
    const top    = bottom - h;
    const w      = 6;
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(x - w / 2, top, w, h);
    ctx.fillStyle = '#1B5E20';
    for (let ny = top + 15; ny < bottom; ny += 22) {
      ctx.fillRect(x - w / 2 - 1, ny, w + 2, 3);
    }
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(angle) * 10, top + Math.sin(angle) * 5, 10, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Layer 3: Bushes ───────────────────────────────────────

  _drawLayer3(ctx, offsetX) {
    for (const b of this._bushes) {
      const sx = (b.x + offsetX) % (LEVEL_WIDTH * 0.85);
      for (let w = -1; w <= 1; w++) {
        const x = sx + w * LEVEL_WIDTH * 0.85;
        if (x + b.r * 2 < -20 || x > GAME_WIDTH + 20) continue;
        this._drawBush(ctx, x, b.y, b.r);
      }
    }
  }

  _drawBush(ctx, x, y, r) {
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(x,           y,     r,       0, Math.PI * 2);
    ctx.arc(x + r,       y + 2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x - r * 0.6, y + 2, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#558B2F';
    ctx.beginPath();
    ctx.arc(x + 2, y - 2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Procedural generation ─────────────────────────────────

  _genMountains() {
    const out = [];
    // Use fixed seed-like sequence for determinism
    let x = 0;
    const steps = [280, 340, 260, 300, 380, 250, 310, 290, 270, 350];
    for (let i = 0; i < steps.length; i++) {
      x += steps[i];
      out.push({ x, w: 110 + (i * 23) % 100, peak: 40 + (i * 17) % 40, snowH: 14 + (i * 7) % 16 });
    }
    return out;
  }

  _genClouds() {
    const out = [];
    let x = 60;
    const steps = [220, 280, 190, 310, 240, 260, 200, 290, 230, 270, 210, 300];
    for (let i = 0; i < steps.length; i++) {
      x += steps[i];
      out.push({ x, y: 18 + (i * 13) % 48, w: 10 + (i * 7) % 14 });
    }
    return out;
  }

  _genTrees() {
    const out = [];
    for (let x = 30; x < LEVEL_WIDTH * 0.65; x += 35 + (x % 43)) {
      out.push({ x, h: 60 + (x % 53) });
    }
    return out;
  }

  _genBushes() {
    const out = [];
    for (let x = 20; x < LEVEL_WIDTH * 0.9; x += 70 + (x % 61)) {
      out.push({ x, y: GAME_HEIGHT * 0.82 + (x % 11), r: 6 + (x % 9) });
    }
    return out;
  }

  toScreen(worldX, worldY) {
    return { x: worldX - this.x + this._shakeX, y: worldY + this._shakeY };
  }
}
