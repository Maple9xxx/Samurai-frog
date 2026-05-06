import { HUD } from '../hud.js';
import { Sprite } from '../sprite.js';

export class GameOverScene {
  constructor(input, audio, onRestart, score = 0, win = false) {
    this.input = input;
    this.audio = audio;
    this.onRestart = onRestart;
    this.score = score;
    this.win = win;
    this.hud = new HUD(new Sprite());
  }

  update() {
    if (this.input.consumePressed('jump') || this.input.consumePressed('attack')) {
      this.onRestart?.();
    }
  }

  draw(ctx) {
    if (this.win) this.hud.drawWin(ctx, this.score);
    else this.hud.drawGameOver(ctx, this.score);
  }
}
