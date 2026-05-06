import { clamp, LEVEL, GAME_WIDTH } from './constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  follow(target) {
    const desiredX = target.x + target.w / 2 - GAME_WIDTH / 2;
    this.x = clamp(desiredX, 0, Math.max(0, LEVEL.width - GAME_WIDTH));
    this.y = 0;
  }
}
