import { GAME_WIDTH, GAME_HEIGHT, aabb } from '../constants.js';
import { Level } from '../level.js';
import { Camera } from '../camera.js';
import { Sprite } from '../sprite.js';
import { Player } from '../player.js';
import { HUD } from '../hud.js';
import { spawnEnemy, SlimeEgg, BabySlime } from '../enemies.js';
import { Goldfish, JadeOrb, HiddenPower } from '../collectibles.js';

export class PlayScene {
  constructor(input, audio, onGameOver, onWin) {
    this.input = input;
    this.audio = audio;
    this.onGameOver = onGameOver;
    this.onWin = onWin;
    this.level = new Level();
    this.camera = new Camera();
    this.sprite = new Sprite();
    this.hud = new HUD(this.sprite);
    this.player = new Player(80, 180);
    this.enemies = this.level.enemyData.map(spawnEnemy).filter(Boolean);
    this.items = this.level.itemData.map((item) => {
      if (item.type === 'Goldfish') return new Goldfish(item.x, item.y);
      if (item.type === 'JadeOrb') return new JadeOrb(item.x, item.y);
      if (item.type === 'HiddenPower') return new HiddenPower(item.x, item.y);
      return null;
    }).filter(Boolean);
    this.spawnQueue = [];
    this.time = 0;
    this.finished = false;
    this.win = false;
  }

  update(dt) {
    if (this.finished) return;
    this.time += dt;

    this.player.update(dt, this.input, this.level, this.audio);
    this._resolveWorldCollisions();
    this._updateEnemies(dt);
    this._updateItems();

    this.camera.follow(this.player);

    if (this.player.hp <= 0 && !this.finished) {
      this.finished = true;
      if (this.audio) this.audio.death();
      setTimeout(() => this.onGameOver?.(this.player.score), 700);
    }

    if (this.player.x + this.player.w >= this.level.goal.x && !this.win) {
      this.win = true;
      this.finished = true;
      if (this.audio) this.audio.goal();
      setTimeout(() => this.onWin?.(this.player.score), 900);
    }
  }

  _resolveWorldCollisions() {
    const p = this.player;
    const prev = { x: p.prevX, y: p.prevY, w: p.w, h: p.h };
    const curr = p.hitbox;

    // Ground first.
    if (p.y + p.h >= this.level.groundY) {
      p.land(this.level.groundY);
    }

    // Platforms use previous position to detect landing/ceiling/side hits.
    for (const plat of this.level.platforms) {
      const platBox = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };
      const overlapX = curr.x < platBox.x + platBox.w && curr.x + curr.w > platBox.x;
      if (!overlapX) continue;

      const prevBottom = prev.y + prev.h;
      const currBottom = p.y + p.h;
      const prevTop = prev.y;
      const currTop = p.y;
      const platBottom = platBox.y + platBox.h;

      if (p.vy >= 0 && prevBottom <= platBox.y && currBottom >= platBox.y) {
        p.land(platBox.y);
        continue;
      }

      if (p.vy < 0 && prevTop >= platBottom && currTop <= platBottom) {
        p.hitCeiling(platBottom);
        continue;
      }

      const prevRight = prev.x + prev.w;
      const currRight = p.x + p.w;
      const prevLeft = prev.x;
      const currLeft = p.x;
      const overlapY = curr.y < platBox.y + platBox.h && curr.y + curr.h > platBox.y;
      if (!overlapY) continue;

      if (prevRight <= platBox.x && currRight > platBox.x) {
        p.x = platBox.x - p.w;
        p.vx = Math.min(0, p.vx);
      } else if (prevLeft >= platBox.x + platBox.w && currLeft < platBox.x + platBox.w) {
        p.x = platBox.x + platBox.w;
        p.vx = Math.max(0, p.vx);
      }
    }

    // Spikes.
    for (const spike of this.level.spikes) {
      const hb = { x: spike.x, y: spike.y - spike.h, w: spike.w, h: spike.h };
      if (aabb(p.hitbox, hb) && p.invincible <= 0) {
        p.takeDamage(1, p.facing * -100);
        if (this.audio) this.audio.hurt();
      }
    }

    // World bounds.
    if (p.y > GAME_HEIGHT + 100 && p.state !== 'DEAD') {
      p.takeDamage(1, 0);
    }
  }

  _updateEnemies(dt) {
    const p = this.player;
    for (const enemy of this.enemies) {
      if (enemy.dead) {
        if (enemy instanceof SlimeEgg) {
          if (!enemy.spawned && enemy.deathAnim.currentFrame === 1) {
            enemy.spawned = true;
            this.spawnQueue.push(new BabySlime(enemy.x - 10, enemy.y + 8));
            this.spawnQueue.push(new BabySlime(enemy.x + 10, enemy.y + 8));
          }
          if (enemy.deathAnim.finished) enemy.remove = true;
        } else {
          enemy.remove = true;
        }
        continue;
      }

      enemy.update(dt, p);

      if (aabb(p.hitbox, enemy.hitbox) && p.invincible <= 0 && p.state !== 'ATTACKING') {
        const knock = p.x < enemy.x ? -120 : 120;
        if (p.takeDamage(1, knock) && this.audio) this.audio.hurt();
      }

      if (p.state === 'ATTACKING' && aabb(p.attackHitbox, enemy.hitbox)) {
        const wasAlive = !enemy.dead;
        if (enemy.takeDamage(1, this.audio)) {
          p.addScore(enemy.score);
          if (this.audio) this.audio.hit();
          if (wasAlive && enemy.dead && !(enemy instanceof SlimeEgg)) {
            enemy.remove = true;
            if (Math.random() < 0.3) {
              this.items.push(new Goldfish(enemy.x, enemy.y - 12));
            }
          }
        }
      }
    }

    if (this.spawnQueue.length) {
      this.enemies.push(...this.spawnQueue);
      this.spawnQueue.length = 0;
    }

    this.enemies = this.enemies.filter((enemy) => !enemy.remove);
  }

  _updateItems() {
    for (const item of this.items) {
      if (!item.collected && aabb(this.player.hitbox, item.hitbox)) {
        item.collect(this.player);
        if (this.audio) this.audio.collect();
      }
    }
    this.items = this.items.filter((item) => !item.collected);
  }

  draw(ctx) {
    this._drawBackground(ctx);
    this._drawLevel(ctx);
    this._drawItems(ctx);
    this._drawEnemies(ctx);
    this._drawPlayer(ctx);
    this._drawHud(ctx);
  }

  _drawBackground(ctx) {
    const camX = this.camera.x;
    ctx.save();
    ctx.fillStyle = '#A7D8FF';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#81C784';
    for (let i = -1; i < 8; i++) {
      const baseX = i * 120 - (camX * 0.2) % 120;
      ctx.beginPath();
      ctx.moveTo(baseX, 160);
      ctx.lineTo(baseX + 40, 90);
      ctx.lineTo(baseX + 80, 130);
      ctx.lineTo(baseX + 120, 70);
      ctx.lineTo(baseX + 160, 160);
      ctx.closePath();
      ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
      const x = (i * 120 - camX * 0.2) % 560;
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath();
      ctx.ellipse(x + 50, 50 + Math.sin(this.time + i) * 5, 20, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 66, 48, 24, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 86, 50, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 18; i++) {
      const x = (i * 70 - camX * 0.5) % 560 - 20;
      const h = 110 + (i % 4) * 12;
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(x + 8, 130 - h, 6, h);
      ctx.fillStyle = '#1B5E20';
      for (let j = 0; j < h; j += 22) ctx.fillRect(x + 7, 130 - j - 3, 8, 2);
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.moveTo(x + 10, 80);
      ctx.lineTo(x + 20, 75);
      ctx.lineTo(x + 26, 80);
      ctx.lineTo(x + 16, 84);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#388E3C';
    for (let i = 0; i < 12; i++) {
      const x = (i * 50 - camX * 0.8) % 540;
      ctx.beginPath();
      ctx.arc(x + 20, 210, 18, 0, Math.PI * 2);
      ctx.arc(x + 36, 206, 15, 0, Math.PI * 2);
      ctx.arc(x + 50, 212, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawLevel(ctx) {
    const camX = this.camera.x;
    for (let x = -((camX) % 32); x < GAME_WIDTH + 32; x += 32) {
      this.sprite.drawGroundTile(ctx, x, this.level.groundY, 32);
    }
    for (const p of this.level.platforms) {
      this.sprite.drawPlatformBamboo(ctx, p.x - camX, p.y, p.w, p.h);
    }
    for (const s of this.level.spikes) {
      this.sprite.drawSpike(ctx, s.x - camX, s.y - s.h, s.w, s.h);
    }
    this.sprite.drawGate(ctx, this.level.goal.x - camX, this.level.groundY, 100, 100, this.time);
  }

  _drawItems(ctx) {
    const camX = this.camera.x;
    for (const item of this.items) item.draw(ctx, this.sprite, camX, this.time);
  }

  _drawEnemies(ctx) {
    const camX = this.camera.x;
    for (const enemy of this.enemies) enemy.draw(ctx, this.sprite, camX, this.time);
  }

  _drawPlayer(ctx) {
    const frame = this.player.getCurrentFrame();
    this.sprite.drawPlayer(
      ctx,
      this.player.x - this.camera.x,
      this.player.y,
      this.player.w,
      this.player.h,
      frame,
      {
        facing: this.player.facing,
        attack: this.player.state === 'ATTACKING',
        hurt: this.player.state === 'HURT',
        blink: this.player.blink
      }
    );
  }

  _drawHud(ctx) {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.hud.draw(ctx, this.player, isTouch);
  }
}
