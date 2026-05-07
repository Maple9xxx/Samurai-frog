// ============================================================
// collectibles.js — Goldfish, JadeOrb, HiddenPower
// ============================================================

import { SCORE } from './constants.js';
import { Sprite } from './sprite.js';

// ── Base collectible ─────────────────────────────────────────

class Collectible {
  constructor(x, y, type, value) {
    this.x       = x;
    this.y       = y;
    this.type    = type;
    this.value   = value;
    this.collected = false;
    this._time   = Math.random() * Math.PI * 2; // phase offset for bob
  }

  get hitbox() {
    return { x: this.x - 10, y: this.y - 10, w: 20, h: 20 };
  }

  update(dt) {
    this._time += dt;
  }
}

// ── Goldfish ──────────────────────────────────────────────────

export class Goldfish extends Collectible {
  constructor(x, y) {
    super(x, y, 'Goldfish', SCORE.GOLDFISH);
  }

  draw(ctx, cameraX) {
    if (this.collected) return;
    Sprite.drawGoldfish(ctx, this.x - cameraX, this.y, this._time);
  }
}

// ── JadeOrb ───────────────────────────────────────────────────

export class JadeOrb extends Collectible {
  constructor(x, y) {
    super(x, y, 'JadeOrb', SCORE.JADE_ORB);
  }

  draw(ctx, cameraX) {
    if (this.collected) return;
    Sprite.drawJadeOrb(ctx, this.x - cameraX, this.y, this._time);
  }
}

// ── HiddenPower ───────────────────────────────────────────────

export class HiddenPower extends Collectible {
  constructor(x, y) {
    super(x, y, 'HiddenPower', 500);
  }

  draw(ctx, cameraX) {
    if (this.collected) return;
    Sprite.drawHiddenPower(ctx, this.x - cameraX, this.y, this._time);
  }
}

// ── Factory ──────────────────────────────────────────────────

export function createCollectibles(itemData) {
  return itemData.map(item => {
    switch (item.type) {
      case 'Goldfish':    return new Goldfish(item.x, item.y);
      case 'JadeOrb':     return new JadeOrb(item.x, item.y);
      case 'HiddenPower': return new HiddenPower(item.x, item.y);
      default: throw new Error(`Unknown item type: ${item.type}`);
    }
  });
}
