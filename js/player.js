// ============================================================
// player.js — Player FSM, physics, combat
// v2: Screen-shake on hurt, combo attack system, floating text
// ============================================================

import {
  GAME_WIDTH, GAME_HEIGHT,
  GRAVITY, MAX_FALL_SPEED, PLAYER_SPEED, JUMP_FORCE, DOUBLE_JUMP_FORCE,
  PLAYER_W, PLAYER_H,
  INVINCIBILITY_TIME, ATTACK_DURATION, ATTACK_HITBOX_W, ATTACK_HITBOX_H,
  STATE, GROUND_Y,
} from './constants.js';
import { PLAYER_ANIMS } from './animation.js';
import { Sprite } from './sprite.js';

// Combo: chain attacks within this window
const COMBO_WINDOW   = 0.55; // seconds
const COMBO_MAX      = 3;
const COMBO_BONUSES  = [0, 0, 50, 150]; // bonus score on combo 2, 3

export class Player {
  constructor(x, y, audio) {
    this.audio = audio;

    this.x  = x;
    this.y  = y;
    this.vx = 0;
    this.vy = 0;

    this.hp     = 3;
    this.maxHp  = 3;
    this.score  = 0;
    this.state  = STATE.IDLE;
    this.facingRight = true;

    this.isOnGround     = false;
    this.hasDoubleJump  = false;
    this.canDoubleJump  = false;
    this.invincible     = false;
    this.invincibleTimer = 0;
    this.attackTimer    = 0;
    this.isAttacking    = false;
    this.hurtTimer      = 0;

    // Blink for i-frames
    this._blinkTimer = 0;
    this._blinkAlpha = 1;

    // ── Combo system ──────────────────────────────────────
    this.comboCount   = 0;  // current combo depth (1-3)
    this._comboTimer  = 0;  // decay timer — resets on each attack
    this._comboLocked = false; // true during current attack animation

    // ── Animations ───────────────────────────────────────
    this._anims = {
      [STATE.IDLE]:        PLAYER_ANIMS.idle(),
      [STATE.RUNNING]:     PLAYER_ANIMS.run(),
      [STATE.JUMPING]:     PLAYER_ANIMS.jump(),
      [STATE.DOUBLE_JUMP]: PLAYER_ANIMS.jump(),
      [STATE.FALLING]:     PLAYER_ANIMS.fall(),
      [STATE.ATTACKING]:   PLAYER_ANIMS.attack(),
      [STATE.HURT]:        PLAYER_ANIMS.hurt(),
      [STATE.DEAD]:        PLAYER_ANIMS.dead(),
    };
    this._currentAnim = this._anims[STATE.IDLE];

    // VFX queues (for playScene to render)
    this.hitEffects  = [];
    this.pendingVFX  = []; // {type, x, y, text, color}
  }

  // ── Hitboxes ──────────────────────────────────────────────

  get hitbox() {
    return { x: this.x - PLAYER_W / 2, y: this.y - PLAYER_H,
             w: PLAYER_W, h: PLAYER_H, vy: this.vy };
  }

  get attackHitbox() {
    if (!this.isAttacking) return null;
    // Combo 3 = wider/taller sweep
    const extraW = this.comboCount === 3 ? 12 : 0;
    const extraH = this.comboCount === 3 ? 8  : 0;
    return {
      x: this.facingRight ? this.x : this.x - ATTACK_HITBOX_W - extraW,
      y: this.y - PLAYER_H * 0.85,
      w: ATTACK_HITBOX_W + extraW,
      h: ATTACK_HITBOX_H + extraH,
    };
  }

  // ── Update ────────────────────────────────────────────────

  update(dt, input, level) {
    if (this.state === STATE.DEAD) {
      this._currentAnim.update(dt);
      return;
    }

    this._updateTimers(dt);
    this._handleInput(dt, input);
    this._applyPhysics(dt);
    this._resolveLevel(level);
    this._updateState();
    this._currentAnim.update(dt);
    this._updateVFX(dt);
  }

  _updateTimers(dt) {
    // Invincibility blink
    if (this.invincible) {
      this.invincibleTimer -= dt;
      this._blinkTimer     += dt;
      this._blinkAlpha = Math.floor(this._blinkTimer / 0.09) % 2 === 0 ? 0.35 : 1;
      if (this.invincibleTimer <= 0) {
        this.invincible  = false;
        this._blinkAlpha = 1;
      }
    }

    // Attack timer
    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking  = false;
        this._comboLocked = false;
        this._setState(this.isOnGround ? STATE.IDLE : STATE.FALLING);
      }
    }

    // Combo window decay (only when NOT attacking)
    if (!this.isAttacking && this.comboCount > 0) {
      this._comboTimer += dt;
      if (this._comboTimer >= COMBO_WINDOW) {
        this.comboCount  = 0;
        this._comboTimer = 0;
      }
    }

    // Hurt timer
    if (this.state === STATE.HURT) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0)
        this._setState(this.isOnGround ? STATE.IDLE : STATE.FALLING);
    }
  }

  _handleInput(dt, input) {
    if (this.state === STATE.HURT || this.state === STATE.DEAD) return;

    // ── Attack / Combo ────────────────────────────────────
    if (input.attackPressed) {
      // Accept next combo hit once previous swing finishes
      if (!this._comboLocked) {
        this.comboCount  = Math.min(this.comboCount + 1, COMBO_MAX);
        this._comboTimer = 0;
        this._comboLocked = true;
        this.isAttacking  = true;
        this.attackTimer  = ATTACK_DURATION;
        this.audio.playSlash();
        this._setState(STATE.ATTACKING);
        this._anims[STATE.ATTACKING].reset();
        return;
      }
    }

    // ── Horizontal movement ───────────────────────────────
    if (!this.isAttacking) {
      if (input.keys.left)       { this.vx = -PLAYER_SPEED; this.facingRight = false; }
      else if (input.keys.right) { this.vx =  PLAYER_SPEED; this.facingRight = true;  }
      else                       { this.vx = 0; }
    }

    // ── Jump ──────────────────────────────────────────────
    if (input.jumpPressed) {
      if (this.isOnGround) {
        this.vy = JUMP_FORCE;
        this.isOnGround = false;
        this.audio.playJump();
        this._setState(STATE.JUMPING);
      } else if (this.hasDoubleJump && this.canDoubleJump) {
        this.vy            = DOUBLE_JUMP_FORCE;
        this.canDoubleJump = false;
        this.audio.playDoubleJump();
        this._setState(STATE.DOUBLE_JUMP);
      }
    }
  }

  _applyPhysics(dt) {
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    if (this.x < PLAYER_W / 2) { this.x = PLAYER_W / 2; this.vx = 0; }
  }

  _resolveLevel(level) {
    const box = this.hitbox;
    const surface = level.getSurface(box);
    if (surface) {
      this.y             = surface.y;
      this.vy            = 0;
      this.isOnGround    = true;
      this.canDoubleJump = this.hasDoubleJump;
    } else if (this.isOnGround && this.vy > 0) {
      this.isOnGround = false;
    }

    if (this.y > GAME_HEIGHT + 40)      this.takeDamage(this.hp, null);
    if (level.isOnHazard(this.hitbox))  this.takeDamage(1, null);
  }

  _updateState() {
    if (this.isAttacking || this.state === STATE.HURT || this.state === STATE.DEAD) return;
    if (!this.isOnGround) {
      if (this.vy < 0 && this.state !== STATE.DOUBLE_JUMP) this._setState(STATE.JUMPING);
      else if (this.vy >= 0) this._setState(STATE.FALLING);
    } else {
      this._setState(this.vx !== 0 ? STATE.RUNNING : STATE.IDLE);
    }
  }

  _setState(s) {
    if (this.state === s) return;
    this.state = s;
    const anim = this._anims[s];
    if (anim) { anim.reset(); this._currentAnim = anim; }
  }

  _updateVFX(dt) {
    for (const fx of this.hitEffects) fx.progress += dt * 4;
    this.hitEffects = this.hitEffects.filter(fx => fx.progress < 1);
  }

  // ── Combat API ────────────────────────────────────────────

  /**
   * @param {number}  amount
   * @param {Camera|null} camera  Pass camera to trigger shake
   */
  takeDamage(amount, camera) {
    if (this.invincible || this.state === STATE.DEAD) return;
    this.hp -= amount;
    this.audio.playHurt();
    if (camera) camera.addTrauma(0.55);

    if (this.hp <= 0) {
      this.hp = 0;
      this._setState(STATE.DEAD);
      this.audio.playDeath();
      return;
    }

    this.vy               = -150;
    this.vx               = this.facingRight ? -80 : 80;
    this.invincible        = true;
    this.invincibleTimer   = INVINCIBILITY_TIME;
    this._blinkTimer       = 0;
    this.hurtTimer         = 0.35;
    this._setState(STATE.HURT);
  }

  collectItem(type, value) {
    if (type === 'Goldfish') {
      this.hp = Math.min(this.hp + 1, this.maxHp);
      this.pendingVFX.push({ type: 'text', x: this.x, y: this.y - PLAYER_H - 5,
        text: '♥ +1', color: '#EF5350' });
    } else if (type === 'HiddenPower') {
      this.hasDoubleJump = true;
      this.canDoubleJump = true;
      this.audio.playPowerUp();
      this.pendingVFX.push({ type: 'burst', x: this.x, y: this.y - PLAYER_H / 2,
        colors: ['#FF6D00','#FFD600','#FFFFFF'], count: 14 });
      this.pendingVFX.push({ type: 'text', x: this.x, y: this.y - PLAYER_H - 5,
        text: 'DOUBLE JUMP!', color: '#FFD600' });
      return;
    }
    this.score += value;
    this.audio.playCollect();
  }

  /** Called by playScene when an enemy is killed by this player */
  onEnemyKilled(enemy) {
    this.score += enemy.score;

    // Combo bonus
    const bonus = COMBO_BONUSES[this.comboCount] || 0;
    if (bonus > 0) {
      this.score += bonus;
      this.pendingVFX.push({ type: 'text', x: enemy.x, y: enemy.y - 20,
        text: `COMBO! +${bonus}`, color: '#FF6D00' });
    }

    this.pendingVFX.push({ type: 'burst', x: enemy.x, y: enemy.y,
      colors: ['#EF5350','#FF8A65','#FFCC02'], count: 8 });
    this.pendingVFX.push({ type: 'text', x: enemy.x, y: enemy.y - 8,
      text: `+${enemy.score}`, color: '#FFFFFF' });
  }

  addScore(n) { this.score += n; }

  get isDead()  { return this.state === STATE.DEAD; }
  get isAlive() { return this.state !== STATE.DEAD; }

  // ── Draw ──────────────────────────────────────────────────

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    for (const fx of this.hitEffects) {
      Sprite.drawHitEffect(ctx, sx, this.y - PLAYER_H / 2, fx.progress);
    }
    Sprite.drawPlayer(ctx, sx, this.y, this._currentAnim.frame,
      this.state, this.facingRight, this._blinkAlpha, this.hasDoubleJump);
  }
}
