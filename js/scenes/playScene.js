// ============================================================
// playScene.js — Orchestrates all gameplay systems
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../constants.js';
import { Camera }       from '../camera.js';
import { Level, LEVEL_DATA } from '../level.js';
import { Player }       from '../player.js';
import { createEnemies, BabySlime } from '../enemies.js';
import { createCollectibles } from '../collectibles.js';
import { HUD }          from '../hud.js';
import { Sprite }       from '../sprite.js';

// ── AABB helper ───────────────────────────────────────────────

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ── PlayScene ─────────────────────────────────────────────────

export class PlayScene {
  /**
   * @param {InputHandler}  input
   * @param {AudioManager}  audio
   * @param {Function}      onGameOver  Callback when player dies
   * @param {Function}      onWin       Callback when player reaches goal
   */
  constructor(input, audio, onGameOver, onWin) {
    this.input      = input;
    this.audio      = audio;
    this.onGameOver = onGameOver;
    this.onWin      = onWin;

    this._build();
    this._time = 0; // global elapsed time for VFX
  }

  _build() {
    this.camera = new Camera();
    this.level  = new Level();
    this.player = new Player(
      LEVEL_DATA.playerStart.x,
      LEVEL_DATA.playerStart.y,
      this.audio
    );
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
    this._time += dt;
    this.hud.update(dt);

    // ── Player ────────────────────────────────────────
    this.player.update(dt, this.input, this.level);

    // ── Camera follows player ─────────────────────────
    this.camera.update(this.player.x);

    // ── Enemies ───────────────────────────────────────
    const newBabies = [];
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player.x, this.player.y);

      // Check if SlimeEgg just died → spawn 2 BabySlimes
      if (enemy.justDied) {
        enemy.justDied = false;
        newBabies.push(new BabySlime(enemy.x - 10, enemy.y - 20));
        newBabies.push(new BabySlime(enemy.x + 10, enemy.y - 20));
        this.audio.playEnemyDeath();
      }
    }
    // Remove fully dead enemies (death FX finished)
    this.enemies = this.enemies.filter(e => !e.dead);
    this.enemies.push(...newBabies);

    // ── Collectibles ──────────────────────────────────
    for (const item of this.collectibles) {
      if (!item.collected) item.update(dt);
    }

    // ── Collision detection ───────────────────────────
    this._resolveCollisions();

    // ── Win / Lose transitions ────────────────────────
    if (!this._winTriggered && this.level.isAtGoal(this.player.hitbox)) {
      this._winTriggered = true;
      this.audio.playGoal();
      this.audio.stopBGM();
    }

    if (this._winTriggered) {
      this._winTimer += dt;
      if (this._winTimer >= 2.5 && this.onWin) this.onWin(this.player.score);
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

  // ── Collision resolution ──────────────────────────────────

  _resolveCollisions() {
    const player     = this.player;
    const playerBox  = player.hitbox;
    const attackBox  = player.attackHitbox;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      const enemyBox = enemy.hitbox;

      // Attack hits enemy
      if (attackBox && overlaps(attackBox, enemyBox)) {
        enemy.takeDamage(1);
        player.hitEffects.push({ x: 0, y: 0, progress: 0 });
        this.audio.playHit();
        if (!enemy.alive) {
          player.addScore(enemy.score);
        }
      }

      // Enemy hurts player
      if (overlaps(playerBox, enemyBox)) {
        player.takeDamage(1);
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
    // 1. Parallax background
    this.camera.drawBackground(ctx);

    // 2. Level terrain
    this.level.draw(ctx, this.camera.x, this._time);

    // 3. Collectibles
    for (const item of this.collectibles) {
      if (!item.collected) item.draw(ctx, this.camera.x);
    }

    // 4. Enemies
    for (const enemy of this.enemies) {
      enemy.draw(ctx, this.camera.x);
    }

    // 5. Player
    this.player.draw(ctx, this.camera.x);

    // 6. HUD
    this.hud.drawHUD(
      ctx,
      this.player.hp,
      this.player.maxHp,
      this.player.score,
      this.player.hasDoubleJump
    );

    // 7. Mobile controls
    this.hud.drawMobileControls(ctx);

    // 8. Win overlay
    if (this._winTriggered) {
      this.hud.drawWinScreen(ctx, this.player.score);
    }
  }
}
