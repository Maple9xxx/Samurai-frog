import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

export class HUD {
  constructor(sprite) {
    this.sprite = sprite;
  }

  draw(ctx, player, showTouchControls = true) {
    // Hearts
    for (let i = 0; i < 3; i++) {
      this.sprite.drawHeart(ctx, 8 + i * 14, 8, 12, i < player.hp);
    }

    // Double jump icon
    if (player.doubleJumpUnlocked) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('DJ', 52, 17);
      ctx.restore();
    }

    // Score
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE ${player.score}`, GAME_WIDTH - 8, 18);
    ctx.restore();

    if (showTouchControls) {
      this._drawControls(ctx, player);
    }
  }

  _drawControls(ctx, player) {
    const yBase = GAME_HEIGHT - 70;
    this.sprite.drawDpadButton(ctx, 60, yBase, 35, '◀', false);
    this.sprite.drawDpadButton(ctx, 130, yBase, 35, '▶', false);
    this.sprite.drawActionButton(ctx, GAME_WIDTH - 100, GAME_HEIGHT - 90, 30, 'A', false, false);
    this.sprite.drawActionButton(ctx, GAME_WIDTH - 60, GAME_HEIGHT - 50, 30, 'B', true, false);
  }

  drawGameOver(ctx, score) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.68)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '24px monospace';
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 14);
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
    ctx.font = '14px monospace';
    const blink = Math.floor(performance.now() / 400) % 2 === 0;
    if (blink) ctx.fillText('Tap to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34);
    ctx.restore();
  }

  drawWin(ctx, score) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.58)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#FFD600';
    ctx.textAlign = 'center';
    ctx.font = '24px monospace';
    ctx.fillText('YOU WIN!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 14);
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
    ctx.font = '14px monospace';
    const blink = Math.floor(performance.now() / 400) % 2 === 0;
    if (blink) ctx.fillText('Tap to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34);
    ctx.restore();
  }

  drawStart(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.78)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '24px monospace';
    ctx.fillText('TAP TO START', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4);
    ctx.font = '14px monospace';
    ctx.fillText('Samurai Frog', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18);
    ctx.restore();
  }
}
