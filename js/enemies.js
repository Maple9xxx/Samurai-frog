import { AnimationState } from './animation.js';
import { aabb, clamp } from './constants.js';

class BaseEnemy {
  constructor(x, y, w, h, hp, score) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hp = hp;
    this.maxHp = hp;
    this.score = score;
    this.dead = false;
    this.remove = false;
    this.hitFlash = 0;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
  }

  get hitbox() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  takeDamage(amount, audio) {
    if (this.dead) return false;
    this.hp -= amount;
    this.hitFlash = 0.12;
    if (this.hp <= 0) {
      this.dead = true;
      if (audio) audio.enemyDeath();
    }
    return true;
  }

  updateHitFlash(dt) {
    if (this.hitFlash > 0) this.hitFlash -= dt;
  }
}

export class Bat extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 28, 20, 2, 200);
    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 60;
    this.anim = new AnimationState([0, 1], 150, true);
  }

  update(dt, player) {
    this.phase += dt * Math.PI * 2 * 1.5;
    const dir = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;
    this.facing = dir;
    this.x += dir * this.speed * dt;
    this.y = this.baseY + Math.sin(this.phase) * 40;
    this.anim.update(dt);
    this.updateHitFlash(dt);
  }

  draw(ctx, sprite, camX, time) {
    const alpha = this.hitFlash > 0 ? 0.4 + Math.sin(time * 60) * 0.5 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    sprite.drawBat(ctx, this.x - camX, this.y, this.w, this.h, this.anim.getFrame(), { facing: this.facing });
    ctx.restore();
  }
}

export class SlimeEgg extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 24, 24, 1, 100);
    this.anim = new AnimationState([0], 999, true);
    this.deathAnim = new AnimationState([0, 1], 100, false);
    this.state = 'idle';
    this.spawned = false;
  }

  update(dt) {
    this.anim.update(dt);
    if (this.dead) this.deathAnim.update(dt);
    this.updateHitFlash(dt);
  }

  draw(ctx, sprite, camX, time) {
    const x = this.x - camX;
    const y = this.y;
    if (this.dead) {
      ctx.save();
      const t = this.deathAnim.currentFrame;
      ctx.globalAlpha = t === 0 ? 1 : 0.3;
      sprite.drawSlimeEgg(ctx, x, y + (t === 0 ? 0 : 4), this.w, this.h, 0, { time });
      ctx.restore();
    } else {
      const alpha = this.hitFlash > 0 ? 0.5 + Math.sin(time * 55) * 0.4 : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      sprite.drawSlimeEgg(ctx, x, y, this.w, this.h, 0, { time });
      ctx.restore();
    }
  }
}

export class BabySlime extends BaseEnemy {
  constructor(x, y) {
    super(x, y, 12, 12, 1, 50);
    this.anim = new AnimationState([0, 1], 120, true);
    this.speed = 80;
  }

  update(dt, player) {
    const dir = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;
    this.facing = dir;
    this.vx = dir * this.speed;
    this.x += this.vx * dt;
    this.y = clamp(this.y, 0, 9999);
    this.anim.update(dt);
    this.updateHitFlash(dt);
  }

  draw(ctx, sprite, camX) {
    const alpha = this.hitFlash > 0 ? 0.4 + Math.sin(performance.now() / 40) * 0.4 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    sprite.drawBabySlime(ctx, this.x - camX, this.y, this.w, this.h, this.anim.getFrame(), { facing: this.facing });
    ctx.restore();
  }
}

export function spawnEnemy(data) {
  if (data.type === 'Bat') return new Bat(data.x, data.y);
  if (data.type === 'SlimeEgg') return new SlimeEgg(data.x, data.y);
  if (data.type === 'BabySlime') return new BabySlime(data.x, data.y);
  return null;
}

export function isEnemyDead(enemy) {
  return enemy.dead && (!(enemy instanceof SlimeEgg) || enemy.deathAnim.finished);
}

export { aabb };
