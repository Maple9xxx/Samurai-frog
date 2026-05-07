// ============================================================
// camera.js — Follows player on X-axis, parallax background
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT, LEVEL_WIDTH, COLOR } from './constants.js';

export class Camera {
  constructor() {
    this.x = 0; // world-space left edge of viewport
    this.y = 0;

    // Pre-generate static background detail so we don't GC every frame
    this._mountains  = this._genMountains();
    this._clouds     = this._genClouds();
    this._trees      = this._genTrees();
    this._bushes     = this._genBushes();
  }

  // ── Update ────────────────────────────────────────────────

  update(playerX) {
    const target = playerX - GAME_WIDTH * 0.35;
    // Smooth follow
    this.x += (target - this.x) * 0.12;
    this.x = Math.max(0, Math.min(this.x, LEVEL_WIDTH - GAME_WIDTH));
  }

  // World → screen coordinate transform
  toScreen(worldX, worldY) {
    return { x: worldX - this.x, y: worldY };
  }

  // ── Draw Parallax Background ──────────────────────────────

  drawBackground(ctx) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0,   '#B2EBF2');
    grad.addColorStop(0.6, '#E0F7FA');
    grad.addColorStop(1,   '#A5D6A7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const ox1 = -(this.x * 0.2) % LEVEL_WIDTH;
    const ox2 = -(this.x * 0.5) % LEVEL_WIDTH;
    const ox3 = -(this.x * 0.8) % LEVEL_WIDTH;

    this._drawLayer1(ctx, ox1); // far: mountains + clouds
    this._drawLayer2(ctx, ox2); // mid: trees
    this._drawLayer3(ctx, ox3); // near: bushes
  }

  // ── Layer 1: Mountains + Clouds ───────────────────────────

  _drawLayer1(ctx, offsetX) {
    // Mountains
    ctx.fillStyle = '#81C784';
    for (const m of this._mountains) {
      const sx = m.x + offsetX;
      // Draw twice for seamless wrap
      for (let wrap = -1; wrap <= 1; wrap++) {
        const x = sx + wrap * LEVEL_WIDTH;
        if (x + m.w < 0 || x > GAME_WIDTH) continue;
        ctx.beginPath();
        ctx.moveTo(x, GAME_HEIGHT * 0.75);
        ctx.lineTo(x + m.w * 0.5, m.peak);
        ctx.lineTo(x + m.w, GAME_HEIGHT * 0.75);
        ctx.closePath();
        ctx.fill();
        // Snow cap
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

    // Clouds
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = COLOR.CLOUD;
    for (const c of this._clouds) {
      const sx = c.x + offsetX;
      for (let wrap = -1; wrap <= 1; wrap++) {
        const x = sx + wrap * LEVEL_WIDTH;
        if (x + c.w * 2 < 0 || x > GAME_WIDTH) continue;
        this._drawCloud(ctx, x, c.y, c.w);
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawCloud(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x,         y,     r,     0, Math.PI * 2);
    ctx.arc(x + r,     y - 4, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r * 2, y,     r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Layer 2: Bamboo Trees ─────────────────────────────────

  _drawLayer2(ctx, offsetX) {
    for (const t of this._trees) {
      const sx = t.x + offsetX;
      for (let wrap = -1; wrap <= 1; wrap++) {
        const x = sx + wrap * LEVEL_WIDTH;
        if (x + 20 < 0 || x > GAME_WIDTH) continue;
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

    // Nodes
    ctx.fillStyle = '#1B5E20';
    for (let ny = top + 15; ny < bottom; ny += 22) {
      ctx.fillRect(x - w / 2 - 1, ny, w + 2, 3);
    }

    // Leaves at top
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const lx    = x + Math.cos(angle) * 10;
      const ly    = top + Math.sin(angle) * 5;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 10, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Layer 3: Bushes + Grass ───────────────────────────────

  _drawLayer3(ctx, offsetX) {
    for (const b of this._bushes) {
      const sx = b.x + offsetX;
      for (let wrap = -1; wrap <= 1; wrap++) {
        const x = sx + wrap * LEVEL_WIDTH;
        if (x + b.r * 2 < 0 || x > GAME_WIDTH) continue;
        this._drawBush(ctx, x, b.y, b.r);
      }
    }
  }

  _drawBush(ctx, x, y, r) {
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(x,         y,     r,       0, Math.PI * 2);
    ctx.arc(x + r,     y + 2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x - r * 0.6, y + 2, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#558B2F';
    ctx.beginPath();
    ctx.arc(x + 2, y - 2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Procedural Generation ─────────────────────────────────

  _genMountains() {
    const mountains = [];
    for (let x = 0; x < LEVEL_WIDTH + 400; x += 250 + Math.floor(Math.random() * 150)) {
      mountains.push({
        x,
        w:     120 + Math.floor(Math.random() * 100),
        peak:  40  + Math.floor(Math.random() * 40),
        snowH: 15  + Math.floor(Math.random() * 15),
      });
    }
    return mountains;
  }

  _genClouds() {
    const clouds = [];
    for (let x = 0; x < LEVEL_WIDTH + 200; x += 200 + Math.floor(Math.random() * 200)) {
      clouds.push({
        x,
        y: 20 + Math.floor(Math.random() * 50),
        w: 10 + Math.floor(Math.random() * 14),
      });
    }
    return clouds;
  }

  _genTrees() {
    const trees = [];
    for (let x = 0; x < LEVEL_WIDTH + 100; x += 40 + Math.floor(Math.random() * 40)) {
      trees.push({ x, h: 60 + Math.floor(Math.random() * 50) });
    }
    return trees;
  }

  _genBushes() {
    const bushes = [];
    for (let x = 0; x < LEVEL_WIDTH + 100; x += 80 + Math.floor(Math.random() * 60)) {
      bushes.push({
        x,
        y: GAME_HEIGHT * 0.82 + Math.floor(Math.random() * 10),
        r: 6 + Math.floor(Math.random() * 8),
      });
    }
    return bushes;
  }
}
