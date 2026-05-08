// ============================================================
// hud.js — HUD overlay + landscape fallback canvas controls
// v2: HTML controls handle portrait — this file only draws
//     in-canvas controls when in landscape (CSS hides #controls)
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT, COLOR } from './constants.js';

export class HUD {
  constructor() {
    this._blinkTimer = 0;
    this._blinkOn    = true;
  }

  update(dt) {
    this._blinkTimer += dt;
    if (this._blinkTimer >= 0.5) {
      this._blinkTimer = 0;
      this._blinkOn    = !this._blinkOn;
    }
  }

  // ── HUD overlay ───────────────────────────────────────────

  drawHUD(ctx, hp, maxHp, score, hasDoubleJump) {
    // Hearts
    for (let i = 0; i < maxHp; i++) {
      this._drawHeart(ctx, 8 + i * 20, 8, i < hp);
    }

    // Double-jump badge
    if (hasDoubleJump) {
      ctx.fillStyle    = '#FFD600';
      ctx.font         = '7px monospace';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('✦ DOUBLE JUMP', 8, 30);
    }

    // Score
    ctx.fillStyle    = '#FFFFFF';
    ctx.font         = '12px monospace';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.shadowColor  = '#000000';
    ctx.shadowBlur   = 3;
    ctx.fillText(`SCORE ${String(score).padStart(6, '0')}`, GAME_WIDTH - 6, 6);
    ctx.shadowBlur   = 0;
  }

  _drawHeart(ctx, x, y, filled) {
    const r = 6;
    ctx.save();
    ctx.translate(x + r, y + r);
    ctx.fillStyle   = filled ? '#EF5350' : '#424242';
    ctx.strokeStyle = filled ? '#B71C1C' : '#212121';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(0, -r * 0.5, -r, -r * 0.5, -r, 0);
    ctx.bezierCurveTo(-r, r * 0.6, 0, r, 0, r * 1.4);
    ctx.bezierCurveTo(0, r, r, r * 0.6, r, 0);
    ctx.bezierCurveTo(r, -r * 0.5, 0, -r * 0.5, 0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (filled) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(-2, -1, 2, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Landscape fallback in-canvas controls ─────────────────
  // Drawn only when #controls HTML panel is hidden

  drawMobileControls(ctx) {
    const el = document.getElementById('controls');
    const htmlVisible = el && window.getComputedStyle(el).display !== 'none';
    if (htmlVisible) return; // portrait: HTML buttons handle it

    // D-pad
    this._drawCanvasBtn(ctx, 35,  GAME_HEIGHT - 55, '◀', 'rgba(255,255,255,0.22)');
    this._drawCanvasBtn(ctx, 85,  GAME_HEIGHT - 55, '▶', 'rgba(255,255,255,0.22)');
    // Actions
    this._drawCanvasBtn(ctx, GAME_WIDTH - 55, GAME_HEIGHT - 75, 'A', 'rgba(80,180,255,0.35)');
    this._drawCanvasBtn(ctx, GAME_WIDTH - 25, GAME_HEIGHT - 40, 'B', 'rgba(255,200,0,0.40)');
  }

  _drawCanvasBtn(ctx, cx, cy, label, color) {
    ctx.fillStyle   = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle    = 'rgba(255,255,255,0.9)';
    ctx.font         = 'bold 11px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }

  // ── Screens ───────────────────────────────────────────────

  drawStartScreen(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle    = COLOR.GOLD;
    ctx.font         = 'bold 28px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = '#FF6D00';
    ctx.shadowBlur   = 14;
    ctx.fillText('SAMURAI FROG', GAME_WIDTH / 2, GAME_HEIGHT * 0.33);
    ctx.shadowBlur   = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font      = '9px monospace';
    ctx.fillText('Defeat the demons. Reach the shrine.', GAME_WIDTH / 2, GAME_HEIGHT * 0.50);

    if (this._blinkOn) {
      ctx.fillStyle = '#FFEE58';
      ctx.font      = 'bold 12px monospace';
      ctx.fillText('TAP  TO  START', GAME_WIDTH / 2, GAME_HEIGHT * 0.65);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '7px monospace';
    ctx.fillText('Keyboard: ← → SPACE Z    |    Touch: D-pad  A  B', GAME_WIDTH / 2, GAME_HEIGHT * 0.82);
  }

  drawWinScreen(ctx, score) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle    = '#FFD600';
    ctx.font         = 'bold 24px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = '#FF6D00';
    ctx.shadowBlur   = 10;
    ctx.fillText('YOU WIN!', GAME_WIDTH / 2, GAME_HEIGHT * 0.35);
    ctx.shadowBlur   = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font      = '13px monospace';
    ctx.fillText(`SCORE: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT * 0.52);

    if (this._blinkOn) {
      ctx.fillStyle = '#FFEE58';
      ctx.font      = '11px monospace';
      ctx.fillText('TAP TO RESTART', GAME_WIDTH / 2, GAME_HEIGHT * 0.68);
    }
  }
}
