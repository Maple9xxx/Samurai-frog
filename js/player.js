import { AnimationState } from './animation.js';
import { PLAYER, LEVEL, clamp } from './constants.js';

export class Player {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.w = PLAYER.width;
    this.h = PLAYER.height;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.state = 'IDLE';
    this.hp = PLAYER.maxHP;
    this.invincible = 0;
    this.onGround = false;
    this.doubleJumpUnlocked = false;
    this.canDoubleJump = false;
    this.attackTimer = 0;
    this.attackLock = 0;
    this.hurtTimer = 0;
    this.deadTimer = 0;
    this.score = 0;
    this.blink = 1;
    this.animations = {
      idle: new AnimationState([0, 1, 2, 3], 200, true),
      run: new AnimationState([0, 1, 2, 3, 4, 5], 80, true),
      jump: new AnimationState([0, 1], 150, false),
      fall: new AnimationState([0, 1], 150, false),
      attack: new AnimationState([0, 1, 2, 3], 60, false),
      hurt: new AnimationState([0, 1], 200, false),
      dead: new AnimationState([0, 1, 2], 300, false)
    };
  }

  get hitbox() {
    return { x: this.x + 6, y: this.y + 5, w: 20, h: 36 };
  }

  get attackHitbox() {
    const hb = this.hitbox;
    if (this.facing >= 0) return { x: hb.x + hb.w - 2, y: hb.y + 4, w: 18, h: 24 };
    return { x: hb.x - 16, y: hb.y + 4, w: 18, h: 24 };
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.prevX = this.spawnX;
    this.prevY = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.state = 'IDLE';
    this.hp = PLAYER.maxHP;
    this.invincible = 0;
    this.onGround = false;
    this.canDoubleJump = false;
    this.attackTimer = 0;
    this.attackLock = 0;
    this.hurtTimer = 0;
    this.deadTimer = 0;
    this.score = 0;
    this.blink = 1;
    for (const anim of Object.values(this.animations)) anim.reset();
  }

  unlockDoubleJump() {
    this.doubleJumpUnlocked = true;
    this.canDoubleJump = true;
  }

  takeDamage(amount, knockbackX = 0) {
    if (this.invincible > 0 || this.state === 'DEAD') return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invincible = PLAYER.invincibleTime;
    this.vx = knockbackX;
    this.vy = -220;
    this.state = this.hp <= 0 ? 'DEAD' : 'HURT';
    if (this.hp <= 0) {
      this.deadTimer = 0.8;
      this.animations.dead.reset();
    } else {
      this.hurtTimer = 0.35;
      this.animations.hurt.reset();
    }
    return true;
  }

  addScore(points) {
    this.score += points;
  }

  update(dt, input, level, audio) {
    this.prevX = this.x;
    this.prevY = this.y;

    if (this.invincible > 0) this.invincible = Math.max(0, this.invincible - dt);
    if (this.attackLock > 0) this.attackLock = Math.max(0, this.attackLock - dt);
    if (this.hurtTimer > 0) this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    if (this.deadTimer > 0) this.deadTimer = Math.max(0, this.deadTimer - dt);

    if (this.state === 'DEAD') {
      this.vx *= 0.95;
      this.vy = clamp(this.vy + PLAYER.gravity * dt * 0.4, -9999, PLAYER.maxFallSpeed);
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.x = clamp(this.x, 0, LEVEL.width - this.w);
      if (this.y > LEVEL.groundY) this.y = LEVEL.groundY;
      this._updateAnimation(dt);
      this._updateBlink();
      return;
    }

    const attackPressed = input.consumePressed('attack');
    const jumpPressed = input.consumePressed('jump');
    const move = (input.keys.right ? 1 : 0) - (input.keys.left ? 1 : 0);

    if (move !== 0) this.facing = move;

    if (this.attackLock <= 0 && attackPressed) {
      this.state = 'ATTACKING';
      this.attackTimer = 0.24;
      this.attackLock = 0.3;
      this.animations.attack.reset();
      if (audio) audio.slash();
    }

    if (this.state === 'ATTACKING') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.state = this.onGround ? (Math.abs(this.vx) > 1 ? 'RUNNING' : 'IDLE') : (this.vy < 0 ? 'JUMPING' : 'FALLING');
      }
    }

    if (jumpPressed && this.state !== 'ATTACKING') {
      if (this.onGround) {
        this.vy = -PLAYER.jumpSpeed;
        this.onGround = false;
        this.canDoubleJump = this.doubleJumpUnlocked;
        this.state = 'JUMPING';
        this.animations.jump.reset();
        if (audio) audio.jump();
      } else if (this.canDoubleJump) {
        this.vy = -PLAYER.jumpSpeed;
        this.canDoubleJump = false;
        this.state = 'DOUBLE_JUMP';
        this.animations.jump.reset();
        if (audio) audio.doubleJump();
      }
    }

    if (this.state !== 'ATTACKING') {
      this.vx = move * PLAYER.moveSpeed;
    } else {
      this.vx = move * PLAYER.moveSpeed * 0.2;
    }

    this.vy = clamp(this.vy + PLAYER.gravity * dt, -9999, PLAYER.maxFallSpeed);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x = clamp(this.x, 0, LEVEL.width - this.w);

    // Update broad state for animation while airborne.
    if (!this.onGround && this.state !== 'ATTACKING' && this.state !== 'HURT') {
      this.state = this.vy < 0 ? (this.state === 'DOUBLE_JUMP' ? 'DOUBLE_JUMP' : 'JUMPING') : 'FALLING';
    }

    this._updateAnimation(dt);

    if (this.state === 'HURT' && this.hurtTimer <= 0) {
      this.state = this.onGround ? (Math.abs(this.vx) > 1 ? 'RUNNING' : 'IDLE') : (this.vy < 0 ? 'JUMPING' : 'FALLING');
    }

    this._updateBlink();
  }

  _updateBlink() {
    if (this.invincible > 0) {
      this.blink = 0.35 + Math.abs(Math.sin(performance.now() / 70)) * 0.65;
    } else {
      this.blink = 1;
    }
  }

  _updateAnimation(dt) {
    if (this.state === 'ATTACKING') this.animations.attack.update(dt);
    else if (this.state === 'HURT') this.animations.hurt.update(dt);
    else if (this.state === 'DEAD') this.animations.dead.update(dt);
    else if (!this.onGround) {
      if (this.vy < 0) this.animations.jump.update(dt);
      else this.animations.fall.update(dt);
    } else if (Math.abs(this.vx) > 1) {
      this.animations.run.update(dt);
    } else {
      this.animations.idle.update(dt);
    }
  }

  land(y) {
    this.y = y - this.h;
    this.vy = 0;
    this.onGround = true;
    this.canDoubleJump = this.doubleJumpUnlocked;
    if (this.state !== 'ATTACKING' && this.state !== 'DEAD') {
      this.state = Math.abs(this.vx) > 1 ? 'RUNNING' : 'IDLE';
    }
  }

  hitCeiling(y) {
    this.y = y;
    this.vy = Math.max(0, this.vy);
  }

  getCurrentFrame() {
    if (this.state === 'ATTACKING') return this.animations.attack.getFrame();
    if (this.state === 'HURT') return this.animations.hurt.getFrame();
    if (this.state === 'DEAD') return this.animations.dead.getFrame();
    if (!this.onGround) {
      if (this.vy < 0) return this.animations.jump.getFrame();
      return this.animations.fall.getFrame();
    }
    return Math.abs(this.vx) > 1 ? this.animations.run.getFrame() : this.animations.idle.getFrame();
  }
}
