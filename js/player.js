// ============================================================
// player.js — Player entity with FSM, physics, combat
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

export class Player {
  constructor(x, y, audio) {
    this.audio = audio;

    // World-space position (bottom-center anchor)
    this.x  = x;
    this.y  = y;
    this.vx = 0;
    this.vy = 0;

    this.hp     = 3;
    this.maxHp  = 3;
    this.score  = 0;
    this.state  = STATE.IDLE;
    this.facingRight = true;

    // Flags
    this.isOnGround     = false;
    this.hasDoubleJump  = false;
    this.canDoubleJump  = false; // resets on land
    this.invincible     = false;
    this.invincibleTimer = 0;
    this.attackTimer    = 0;
    this.isAttacking    = false;
    this.hurtTimer      = 0;

    // Blink alpha for invincibility frame
    this._blinkTimer    = 0;
    this._blinkAlpha    = 1;

    // Animations — keyed by state
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

    // VFX: hit effects array [{x,y,progress}]
    this.hitEffects = [];
  }

  // ── Computed hitbox ───────────────────────────────────────

  get hitbox() {
    return {
      x:  this.x - PLAYER_W / 2,
      y:  this.y - PLAYER_H,
      w:  PLAYER_W,
      h:  PLAYER_H,
      vy: this.vy,
    };
  }

  get attackHitbox() {
    if (!this.isAttacking) return null;
    const dir = this.facingRight ? 1 : -1;
    return {
      x: this.x + (this.facingRight ? 0 : -ATTACK_HITBOX_W),
      y: this.y - PLAYER_H * 0.85,
      w: ATTACK_HITBOX_W,
      h: ATTACK_HITBOX_H,
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
    // Invincibility
    if (this.invincible) {
      this.invincibleTimer -= dt;
      this._blinkTimer     += dt;
      this._blinkAlpha      = Math.floor(this._blinkTimer / 0.1) % 2 === 0 ? 0.4 : 1;
      if (this.invincibleTimer <= 0) {
        this.invincible   = false;
        this._blinkAlpha  = 1;
      }
    }

    // Attack timer
    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this._setState(this.isOnGround ? STATE.IDLE : STATE.FALLING);
      }
    }

    // Hurt timer
    if (this.state === STATE.HURT) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) {
        this._setState(this.isOnGround ? STATE.IDLE : STATE.FALLING);
      }
    }
  }

  _handleInput(dt, input) {
    if (this.state === STATE.HURT || this.state === STATE.DEAD) return;

    // ── Attack ────────────────────────────────────
    if (input.attackPressed && !this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = ATTACK_DURATION;
      this.audio.playSlash();
      this._setState(STATE.ATTACKING);
      return; // skip movement on attack frame
    }

    // ── Horizontal movement ───────────────────────
    if (!this.isAttacking) {
      if (input.keys.left) {
        this.vx          = -PLAYER_SPEED;
        this.facingRight = false;
      } else if (input.keys.right) {
        this.vx          = PLAYER_SPEED;
        this.facingRight = true;
      } else {
        this.vx = 0;
      }
    }

    // ── Jump ──────────────────────────────────────
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
    if (this.state === STATE.DEAD) return;

    // Gravity
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // World bounds — left edge only (right is open)
    if (this.x < PLAYER_W / 2) {
      this.x = PLAYER_W / 2;
      this.vx = 0;
    }
  }

  _resolveLevel(level) {
    const box = {
      x: this.x - PLAYER_W / 2,
      y: this.y - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vy: this.vy,
    };

    const surface = level.getSurface(box);
    if (surface) {
      this.y           = surface.y;
      this.vy          = 0;
      this.isOnGround  = true;
      this.canDoubleJump = this.hasDoubleJump; // refresh on land
    } else {
      // Only set airborne if we were previously grounded (prevents jitter)
      if (this.isOnGround && this.vy > 0) {
        this.isOnGround = false;
      }
    }

    // Bottom of world kill
    if (this.y > GAME_HEIGHT + 40) {
      this.takeDamage(this.hp); // instant death
    }

    // Hazard damage
    if (level.isOnHazard(box)) {
      this.takeDamage(1);
    }
  }

  _updateState() {
    if (this.isAttacking || this.state === STATE.HURT || this.state === STATE.DEAD) return;

    if (!this.isOnGround) {
      if (this.vy < 0) {
        if (this.state !== STATE.DOUBLE_JUMP) this._setState(STATE.JUMPING);
      } else {
        this._setState(STATE.FALLING);
      }
    } else {
      if (this.vx !== 0) this._setState(STATE.RUNNING);
      else                this._setState(STATE.IDLE);
    }
  }

  _setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    const anim = this._anims[newState];
    if (anim) {
      anim.reset();
      this._currentAnim = anim;
    }
  }

  _updateVFX(dt) {
    for (const fx of this.hitEffects) fx.progress += dt * 4;
    this.hitEffects = this.hitEffects.filter(fx => fx.progress < 1);
  }

  // ── Public combat API ─────────────────────────────────────

  takeDamage(amount) {
    if (this.invincible || this.state === STATE.DEAD) return;
    this.hp -= amount;
    this.audio.playHurt();

    if (this.hp <= 0) {
      this.hp = 0;
      this._setState(STATE.DEAD);
      this.audio.playDeath();
      return;
    }

    // Knockback
    this.vy              = -150;
    this.vx              = this.facingRight ? -80 : 80;
    this.invincible      = true;
    this.invincibleTimer = INVINCIBILITY_TIME;
    this._blinkTimer     = 0;
    this.hurtTimer       = 0.35;
    this._setState(STATE.HURT);
  }

  collectItem(type, value) {
    if (type === 'Goldfish') {
      this.hp = Math.min(this.hp + 1, this.maxHp);
    } else if (type === 'HiddenPower') {
      this.hasDoubleJump  = true;
      this.canDoubleJump  = true;
      this.audio.playPowerUp();
      return; // different sound handled outside
    }
    this.score += value;
    this.audio.playCollect();
  }

  addScore(amount) {
    this.score += amount;
  }

  get isDead()  { return this.state === STATE.DEAD; }
  get isAlive() { return this.state !== STATE.DEAD; }

  // ── Draw ──────────────────────────────────────────────────

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    const sy = this.y;

    // Draw hit VFX behind player
    for (const fx of this.hitEffects) {
      Sprite.drawHitEffect(ctx, sx, sy - PLAYER_H / 2, fx.progress);
    }

    Sprite.drawPlayer(
      ctx,
      sx,
      sy,
      this._currentAnim.frame,
      this.state,
      this.facingRight,
      this._blinkAlpha,
      this.hasDoubleJump,
    );
  }
}
