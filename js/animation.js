// ============================================================
// animation.js — Frame-based animation state machine
// ============================================================

export class AnimationState {
  /**
   * @param {number[]} frames       Array of frame indices
   * @param {number}   frameDuration Milliseconds per frame
   * @param {boolean}  loop         Whether to loop
   */
  constructor(frames, frameDuration, loop = true) {
    this.frames        = frames;
    this.frameDuration = frameDuration;
    this.loop          = loop;
    this.currentFrame  = 0;
    this.timer         = 0;
    this.finished      = false;
  }

  /** @param {number} deltaTime seconds */
  update(deltaTime) {
    if (this.finished && !this.loop) return;

    this.timer += deltaTime * 1000; // convert to ms

    while (this.timer >= this.frameDuration) {
      this.timer -= this.frameDuration;
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.finished     = true;
          return;
        }
      }
    }
  }

  get frame() {
    return this.frames[this.currentFrame];
  }

  reset() {
    this.currentFrame = 0;
    this.timer        = 0;
    this.finished     = false;
  }
}

// ── Pre-defined animation sets ────────────────────────────────

export const PLAYER_ANIMS = {
  idle:   () => new AnimationState([0, 1, 2, 3],          200, true),
  run:    () => new AnimationState([0, 1, 2, 3, 4, 5],    80,  true),
  jump:   () => new AnimationState([0, 1],                 150, false),
  fall:   () => new AnimationState([0, 1],                 150, false),
  attack: () => new AnimationState([0, 1, 2, 3],           60,  false),
  hurt:   () => new AnimationState([0, 1],                 200, false),
  dead:   () => new AnimationState([0, 1, 2],              300, false),
};

export const BAT_ANIMS = {
  fly:  () => new AnimationState([0, 1], 150, true),
  hurt: () => new AnimationState([0],    100, false),
};

export const SLIME_ANIMS = {
  idle:  () => new AnimationState([0], 200, true),
  death: () => new AnimationState([0, 1], 100, false),
};

export const BABY_ANIMS = {
  run: () => new AnimationState([0, 1], 120, true),
};
