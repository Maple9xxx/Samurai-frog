// ============================================================
// level.js — Level geometry, enemy/item spawn data
// ============================================================

import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_Y, LEVEL_WIDTH, COLOR,
} from './constants.js';
import { Sprite } from './sprite.js';

// ── Static level data ─────────────────────────────────────────

export const LEVEL_DATA = {
  playerStart: { x: 80, y: 180 },

  platforms: [
    { x: 600,  y: 160, w: 200 },
    { x: 1200, y: 130, w: 150 },
    { x: 1900, y: 140, w: 180 },
    { x: 2600, y: 120, w: 200 },
    { x: 3200, y: 150, w: 160 },
    { x: 4000, y: 140, w: 200 },
    { x: 4700, y: 160, w: 180 },
    { x: 5400, y: 130, w: 200 },
  ],

  hazards: [
    { x: 1800, w: 50, y: GROUND_Y },
    { x: 3400, w: 50, y: GROUND_Y },
    { x: 4400, w: 50, y: GROUND_Y },
  ],

  enemies: [
    { type: 'Bat',      x: 700,  y: 150 },
    { type: 'SlimeEgg', x: 900,  y: 205 },
    { type: 'Bat',      x: 1400, y: 140 },
    { type: 'SlimeEgg', x: 1700, y: 200 },
    { type: 'Bat',      x: 2300, y: 120 },
    { type: 'Bat',      x: 2800, y: 110 },
    { type: 'SlimeEgg', x: 3100, y: 200 },
    { type: 'Bat',      x: 3600, y: 150 },
    { type: 'SlimeEgg', x: 4100, y: 205 },
    { type: 'Bat',      x: 4500, y: 160 },
    { type: 'Bat',      x: 5000, y: 140 },
    { type: 'SlimeEgg', x: 5200, y: 210 },
  ],

  items: [
    { type: 'JadeOrb',     x: 500,  y: 200 },
    { type: 'JadeOrb',     x: 800,  y: 190 },
    { type: 'Goldfish',    x: 1100, y: 210 },
    { type: 'JadeOrb',     x: 1300, y: 200 },
    { type: 'JadeOrb',     x: 1600, y: 190 },
    { type: 'Goldfish',    x: 2000, y: 210 },
    { type: 'HiddenPower', x: 2500, y: 110 },
    { type: 'JadeOrb',     x: 2900, y: 190 },
    { type: 'Goldfish',    x: 3300, y: 210 },
    { type: 'JadeOrb',     x: 3700, y: 200 },
    { type: 'JadeOrb',     x: 4300, y: 190 },
    { type: 'Goldfish',    x: 4800, y: 210 },
    { type: 'JadeOrb',     x: 5100, y: 200 },
    { type: 'JadeOrb',     x: 5500, y: 190 },
  ],

  goal: { x: 5800, y: GROUND_Y - 120, w: 100, h: 120 },
};

// ── Level renderer ────────────────────────────────────────────

export class Level {
  constructor() {
    this.data = LEVEL_DATA;
  }

  /** Draw all terrain (called after background, before entities) */
  draw(ctx, cameraX, time) {
    const visLeft  = cameraX - 64;
    const visRight = cameraX + GAME_WIDTH + 64;

    // Ground strip
    const tileW = 32;
    const groundH = GAME_HEIGHT - GROUND_Y;
    for (let tx = Math.floor(visLeft / tileW) * tileW; tx < visRight; tx += tileW) {
      const sx = tx - cameraX;
      Sprite.drawGroundTile(ctx, sx, GROUND_Y, tileW, groundH);
    }

    // Platforms
    for (const p of this.data.platforms) {
      const sx = p.x - cameraX;
      if (sx + p.w < -64 || sx > GAME_WIDTH + 64) continue;
      Sprite.drawPlatform(ctx, sx, p.y, p.w);
    }

    // Spikes / Hazards
    for (const h of this.data.hazards) {
      const sx = h.x - cameraX;
      if (sx + h.w < 0 || sx > GAME_WIDTH) continue;
      Sprite.drawSpike(ctx, sx, h.y - 14, h.w);
    }

    // Goal gate
    const g  = this.data.goal;
    const gx = g.x - cameraX;
    if (gx > -120 && gx < GAME_WIDTH + 120) {
      Sprite.drawGoalGate(ctx, gx, g.y, g.h, time);
    }
  }

  /** Solid-surface check — returns landing Y and surface type, or null */
  getSurface(rect) {
    // Ground
    if (rect.y + rect.h >= GROUND_Y && rect.y + rect.h <= GROUND_Y + 20) {
      return { y: GROUND_Y, type: 'ground' };
    }

    // Platforms (one-way: only land from above)
    for (const p of this.data.platforms) {
      const ph = 12;
      if (
        rect.x + rect.w > p.x &&
        rect.x < p.x + p.w &&
        rect.y + rect.h >= p.y &&
        rect.y + rect.h <= p.y + ph + 8 && // small tolerance
        rect.vy >= 0 // only when falling
      ) {
        return { y: p.y, type: 'platform' };
      }
    }
    return null;
  }

  /** Check if a rect is overlapping a hazard */
  isOnHazard(rect) {
    for (const h of this.data.hazards) {
      if (
        rect.x + rect.w > h.x &&
        rect.x < h.x + h.w &&
        rect.y + rect.h >= h.y - 14 &&
        rect.y + rect.h <= h.y
      ) {
        return true;
      }
    }
    return false;
  }

  /** Check if a rect overlaps the goal zone */
  isAtGoal(rect) {
    const g = this.data.goal;
    return (
      rect.x + rect.w > g.x &&
      rect.x < g.x + g.w &&
      rect.y + rect.h > g.y
    );
  }

  /** Check if world-X is past the level boundary */
  clampX(x) {
    return Math.max(0, Math.min(x, LEVEL_WIDTH));
  }
}
