export class AnimationState {
  constructor(frames, frameDuration, loop = true) {
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.loop = loop;
    this.currentFrame = 0;
    this.timer = 0;
    this.finished = false;
  }

  update(deltaTime) {
    this.timer += deltaTime * 1000;
    while (this.timer >= this.frameDuration) {
      this.timer -= this.frameDuration;
      this.currentFrame++;
      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.finished = true;
        }
      }
    }
  }

  reset() {
    this.currentFrame = 0;
    this.timer = 0;
    this.finished = false;
  }

  getFrame() {
    return this.frames[this.currentFrame] ?? this.frames[0] ?? 0;
  }
}
