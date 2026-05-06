class BaseItem {
  constructor(x, y, w, h, score = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.score = score;
    this.collected = false;
  }

  get hitbox() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

export class Goldfish extends BaseItem {
  constructor(x, y) { super(x, y, 20, 12, 50); }
  collect(player) { player.hp = Math.min(3, player.hp + 1); player.addScore(this.score); this.collected = true; }
  draw(ctx, sprite, camX, time) { sprite.drawGoldfish(ctx, this.x - camX, this.y, this.w, this.h, time); }
}

export class JadeOrb extends BaseItem {
  constructor(x, y) { super(x, y, 14, 14, 100); }
  collect(player) { player.addScore(this.score); this.collected = true; }
  draw(ctx, sprite, camX, time) { sprite.drawJadeOrb(ctx, this.x - camX, this.y, this.w, this.h, time); }
}

export class HiddenPower extends BaseItem {
  constructor(x, y) { super(x, y, 18, 18, 0); }
  collect(player) { player.unlockDoubleJump(); player.addScore(200); this.collected = true; }
  draw(ctx, sprite, camX, time) { sprite.drawHiddenPower(ctx, this.x - camX, this.y, this.w, this.h, time); }
}
