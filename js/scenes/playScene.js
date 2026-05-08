// ============================================================
// playScene.js — Orchestrates all gameplay systems
// v2: VFX pipeline, screen shake, combo kills, hit-stop flash
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../constants.js';
import { Camera }       from '../camera.js';
import { Level, LEVEL_DATA } from '../level.js';
import { Player }       from '../player.js';
import { createEnemies, BabySlime } from '../enemies.js';
import { createCollectibles } from '../collectibles.js';
import { HUD }          from '../hud.js';
import { FloatingText, ParticleBurst } from '../vfx.js';

// ── AABB ──────────────────────────────────────────────────────

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ─────────────────────────────────────────────────────────────

export class PlayScene {
  constructor(input, audio, onGameOver, onWin) {
    this.input      = input;
    this.audio      = audio;
    this.onGameOver = onGameOver;
    this.onWin      = onWin;

    this._build();
    this._time = 0;

    // VFX pools
    this._floatingTexts = [];
    this._particles     = [];

    // Hit-stop: brief freeze-frame on kill
    this._hitStopTimer  = 0;
  }

  _build() {
    this.camera = new Camera();
    this.level  = new Level();
    this.player = new Player(LEVEL_DATA.playerStart.x, LEVEL_DATA.playerStart.y, this.audio);
    this.enemies      = createEnemies(LEVEL_DATA.enemies);
    this.collectibles = createCollectibles(LEVEL_DATA.items);
    this.hud          = new HUD();

    this._winTriggered  = false;
    this._winTimer      = 0;
    this._overTriggered = false;
    this._overTimer     = 0;
  }

  // ── Update ────────────────────────────────────────────────

  update(dt) {
    // Hit-stop: pause physics briefly for impact feel
    if (this._hitStopTimer > 0) {
      this._hitStopTimer -= dt;
      this.hud.update(dt);
      // Still update camera shake even during hit-stop
      this.camera.update(this.player.x, dt);
      return;
    }

    this._time += dt;
    this.hud.update(dt);
    this.player.update(dt, this.input, this.level);
    this.camera.update(this.player.x, dt);

    // Enemies
    const newBabies = [];
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player.x, this.player.y);
      if (enemy.justDied) {
        enemy.justDied = false;
        newBabies.push(new BabySlime(enemy.x - 10, enemy.y - 20));
        newBabies.push(new BabySlime(enemy.x + 10, enemy.y - 20));
        this.audio.playEnemyDeath();
      }
    }
    this.enemies = this.enemies.filter(e => !e.dead);
    this.enemies.push(...newBabies);

    // Collectibles
    for (const item of this.collectibles) {
      if (!item.collected) item.update(dt);
    }

    // Collision detection
    this._resolveCollisions();

    // Drain VFX queue from player
    this._drainPlayerVFX();

    // Update VFX
    for (const ft of this._floatingTexts) ft.update(dt);
    for (const pb of this._particles)     pb.update(dt);
    this._floatingTexts = this._floatingTexts.filter(v => !v.dead);
    this._particles     = this._particles.filter(v => !v.dead);

    // Win / Lose
    if (!this._winTriggered && this.level.isAtGoal(this.player.hitbox)) {
      this._winTriggered = true;
      this.audio.playGoal();
      this.audio.stopBGM();
    }
    if (this._winTriggered) {
      this._winTimer += dt;
      if (this._winTimer >= 2.8 && this.onWin) this.onWin(this.player.score);
    }

    if (!this._overTriggered && this.player.isDead) {
      this._overTriggered = true;
      this.audio.stopBGM();
    }
    if (this._overTriggered) {
      this._overTimer += dt;
      if (this._overTimer >= 2.0 && this.onGameOver) this.onGameOver(this.player.score);
    }
  }

  // ── Drain VFX queue from player ───────────────────────────

  _drainPlayerVFX() {
    for (const vfx of this.player.pendingVFX) {
      if (vfx.type === 'text') {
        this._floatingTexts.push(new FloatingText(vfx.x, vfx.y, vfx.text, vfx.color));
      } else if (vfx.type === 'burst') {
        this._particles.push(new ParticleBurst(vfx.x, vfx.y, vfx.colors, vfx.count));
      }
    }
    this.player.pendingVFX = [];
  }

  // ── Collision resolution ──────────────────────────────────

  _resolveCollisions() {
    const player    = this.player;
    const playerBox = player.hitbox;
    const attackBox = player.attackHitbox;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const enemyBox = enemy.hitbox;

      // Attack hits enemy
      if (attackBox && overlaps(attackBox, enemyBox)) {
        enemy.takeDamage(1);
        this.audio.playHit();

        if (!enemy.alive) {
          player.onEnemyKilled(enemy);
          // Hit-stop: 60ms freeze on kill (feels impactful)
          this._hitStopTimer = 0.06;
          this.camera.addTrauma(0.2);
        }
      }

      // Enemy hurts player
      if (overlaps(playerBox, enemyBox)) {
        player.takeDamage(1, this.camera);
      }
    }

    // Collect items
    for (const item of this.collectibles) {
      if (item.collected) continue;
      if (overlaps(playerBox, item.hitbox)) {
        item.collected = true;
        player.collectItem(item.type, item.value);
      }
    }
  }

  // ── Draw ──────────────────────────────────────────────────

  draw(ctx) {
    // 1. Parallax background (includes shake)
    this.camera.drawBackground(ctx);

    // 2. World with shake applied
    ctx.save();
    ctx.translate(this.camera._shakeX, this.camera._shakeY);

    // Level terrain
    this.level.draw(ctx, this.camera.x, this._time);

    // Collectibles
    for (const item of this.collectibles) {
      if (!item.collected) item.draw(ctx, this.camera.x);
    }

    // Enemies
    for (const enemy of this.enemies) enemy.draw(ctx, this.camera.x);

    // Player
    this.player.draw(ctx, this.camera.x);

    // Particles (world-space)
    for (const pb of this._particles) pb.draw(ctx, this.camera.x);

    // Floating texts (world-space)
    for (const ft of this._floatingTexts) ft.draw(ctx, this.camera.x);

    ctx.restore();

    // 3. HUD — NO shake, always stable
    this.hud.drawHUD(ctx, this.player.hp, this.player.maxHp,
      this.player.score, this.player.hasDoubleJump);

    // 4. Combo display
    this._drawComboHUD(ctx);

    // 5. Landscape canvas controls (portrait = HTML buttons)
    this.hud.drawMobileControls(ctx);

    // 6. Win overlay
    if (this._winTriggered) this.hud.drawWinScreen(ctx, this.player.score);
  }

  // ── Combo HUD ─────────────────────────────────────────────

  _drawComboHUD(ctx) {
    const combo = this.player.comboCount;
    if (combo < 2) return;

    const labels = ['', '', '2 HIT!', '3 HIT COMBO!!'];
    const colors = ['', '', '#FF8A65', '#FF1744'];
    const label  = labels[combo];
    const color  = colors[combo];

    ctx.save();
    ctx.font         = `bold ${combo === 3 ? 13 : 11}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle  = 'rgba(0,0,0,0.7)';
    ctx.lineWidth    = 3;
    ctx.fillStyle    = color;
    const tx = this.player.x - this.camera.x;
    const ty = this.player.y - 50;
    ctx.strokeText(label, tx, ty);
    ctx.fillText(label, tx, ty);
    ctx.restore();
  }
}
