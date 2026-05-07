// ============================================================
// enemies.js — Enemy entities: Bat, SlimeEgg, BabySlime
// ============================================================

import { GROUND_Y, GRAVITY, MAX_FALL_SPEED, COLOR, SCORE } from './constants.js';
import { BAT_ANIMS, SLIME_ANIMS, BABY_ANIMS } from './animation.js';
import { Sprite } from './sprite.js';

// ── Shared AABB helper ────────────────────────────────────────

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ═══════════════════════════════════════════════════════════════
// Bat
// ═══════════════════════════════════════════════════════════════

export class Bat {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this._originY = y;
    this.hp    = 2;
    this.alive = true;
    this.dead  = false;         // flagged for removal
    this.score = SCORE.BAT;
    this.dropsGoldfish = Math.random() < 0.3;

    this._time  = Math.random() * Math.PI * 2; // phase offset
    this._anim  = BAT_ANIMS.fly();

    // Hurt flash
    this._hurtFlash = 0;

    // VFX
    this.deathFX = null; // {x,y,progress}
  }

  get hitbox() {
    return { x: this.x - 14, y: this.y - 10, w: 28, h: 20 };
  }

  update(dt, playerX, playerY) {
    if (!this.alive) {
      if (this.deathFX) this.deathFX.progress += dt * 3;
      if (this.deathFX && this.deathFX.progress >= 1) this.dead = true;
      return;
    }

    // Sine-wave vertical flight
    this._time += dt;
    this.y      = this._originY + Math.sin(this._time * 1.5 * Math.PI) * 40;

    // Horizontal drift towards player
    const dx = playerX - this.x;
    const speed = 60 * dt;
    if (Math.abs(dx) > 8) this.x += Math.sign(dx) * speed;

    // Hurt flash decay
    if (this._hurtFlash > 0) this._hurtFlash -= dt * 6;

    this._anim.update(dt);
  }

  takeDamage(amount) {
    this.hp         -= amount;
    this._hurtFlash  = 1;
    if (this.hp <= 0) {
      this.alive    = false;
      this.deathFX  = { x: this.x, y: this.y, progress: 0 };
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    const sy = this.y;

    if (!this.alive) {
      if (this.deathFX) {
        Sprite.drawHitEffect(ctx, sx, sy, this.deathFX.progress);
      }
      return;
    }

    const flash = Math.max(0, this._hurtFlash);
    const alpha = 1 - flash * 0.5;
    Sprite.drawBat(ctx, sx, sy, this._anim.frame, alpha);
  }
}

// ═══════════════════════════════════════════════════════════════
// SlimeEgg
// ═══════════════════════════════════════════════════════════════

export class SlimeEgg {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.hp    = 1;
    this.alive = true;
    this.dead  = false;
    this.score = SCORE.SLIME_EGG;

    this._time   = Math.random() * Math.PI * 2;
    this._anim   = SLIME_ANIMS.idle();
    this._hurtFlash = 0;
    this.deathFX    = null;

    // Will be set to true to signal spawning of BabySlimes
    this.justDied = false;
  }

  get hitbox() {
    return { x: this.x - 12, y: this.y - 24, w: 24, h: 24 };
  }

  update(dt) {
    if (!this.alive) {
      if (this.deathFX) this.deathFX.progress += dt * 3;
      if (this.deathFX && this.deathFX.progress >= 1) this.dead = true;
      return;
    }
    this._time += dt;
    if (this._hurtFlash > 0) this._hurtFlash -= dt * 6;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hurtFlash = 1;
    if (this.hp <= 0) {
      this.alive     = false;
      this.justDied  = true;
      this.deathFX   = { x: this.x, y: this.y, progress: 0 };
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    const sy = this.y;

    if (!this.alive) {
      if (this.deathFX) Sprite.drawDeathPop(ctx, sx, sy - 12, this.deathFX.progress);
      return;
    }

    const wobble   = 0.95 + Math.sin(this._time * 4) * 0.05;
    const flash    = Math.max(0, this._hurtFlash);
    Sprite.drawSlimeEgg(ctx, sx, sy - 12, wobble, 1 - flash * 0.4);
  }
}

// ═══════════════════════════════════════════════════════════════
// BabySlime
// ═══════════════════════════════════════════════════════════════

export class BabySlime {
  constructor(x, y) {
    this.x     = x;
    this.y     = y;
    this.vy    = -120; // initial jump-spawn velocity
    this.hp    = 1;
    this.alive = true;
    this.dead  = false;
    this.score = SCORE.BABY_SLIME;

    this._onGround  = false;
    this._anim      = BABY_ANIMS.run();
    this._hurtFlash = 0;
    this.deathFX    = null;
  }

  get hitbox() {
    return { x: this.x - 6, y: this.y - 12, w: 12, h: 12 };
  }

  update(dt, playerX) {
    if (!this.alive) {
      if (this.deathFX) this.deathFX.progress += dt * 3;
      if (this.deathFX && this.deathFX.progress >= 1) this.dead = true;
      return;
    }

    // Gravity
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;
    this.y  += this.vy * dt;

    // Ground check
    if (this.y >= GROUND_Y) {
      this.y         = GROUND_Y;
      this.vy        = 0;
      this._onGround = true;
    }

    // Chase player horizontally once grounded
    if (this._onGround) {
      const speed = 80 * dt;
      const dx    = playerX - this.x;
      if (Math.abs(dx) > 4) this.x += Math.sign(dx) * speed;
    }

    if (this._hurtFlash > 0) this._hurtFlash -= dt * 6;
    this._anim.update(dt);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hurtFlash = 1;
    if (this.hp <= 0) {
      this.alive   = false;
      this.deathFX = { x: this.x, y: this.y, progress: 0 };
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    const sy = this.y;

    if (!this.alive) {
      if (this.deathFX) Sprite.drawHitEffect(ctx, sx, sy, this.deathFX.progress);
      return;
    }

    const flash = Math.max(0, this._hurtFlash);
    Sprite.drawBabySlime(ctx, sx, sy - 6, this._anim.frame, 1 - flash * 0.4);
  }
}

// ── Enemy factory ────────────────────────────────────────────

export function createEnemies(enemyData) {
  return enemyData.map(e => {
    switch (e.type) {
      case 'Bat':      return new Bat(e.x, e.y);
      case 'SlimeEgg': return new SlimeEgg(e.x, e.y);
      default:         throw new Error(`Unknown enemy type: ${e.type}`);
    }
  });
}
