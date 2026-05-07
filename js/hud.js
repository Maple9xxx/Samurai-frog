// ============================================================
// hud.js — HUD overlay + mobile virtual controls
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

  /** Draw heads-up display (HP hearts, score, double-jump indicator) */
  drawHUD(ctx, hp, maxHp, score, hasDoubleJump) {
    // ── Hearts ────────────────────────────────────────
    for (let i = 0; i < maxHp; i++) {
      this._drawHeart(ctx, 8 + i * 20, 8, i < hp);
    }

    // ── Double jump indicator ──────────────────────────
    if (hasDoubleJump) {
      ctx.fillStyle = '#FFD600';
      ctx.font      = '7px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('✦ DOUBLE JUMP', 8, 30);
    }

    // ── Score ─────────────────────────────────────────
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
    // Classic heart via two arcs + V bottom
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(0, -r * 0.5, -r, -r * 0.5, -r, 0);
    ctx.bezierCurveTo(-r, r * 0.6, 0, r, 0, r * 1.4);
    ctx.bezierCurveTo(0, r, r, r * 0.6, r, 0);
    ctx.bezierCurveTo(r, -r * 0.5, 0, -r * 0.5, 0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (filled) {
      // Shine highlight
      ctx.fillStyle   = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(-2, -1, 2, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Draw mobile virtual D-pad and action buttons */
  drawMobileControls(ctx) {
    // ── D-Pad (left side) ──────────────────────────────
    const dpadY = GAME_HEIGHT - 55;

    // Left button
    this._drawDpadButton(ctx, 35, dpadY, '◀');
    // Right button
    this._drawDpadButton(ctx, 85, dpadY, '▶');

    // ── Action buttons (right side) ───────────────────
    const btnY_jump   = GAME_HEIGHT - 70;
    const btnY_attack = GAME_HEIGHT - 35;
    const btnX        = GAME_WIDTH - 50;

    this._drawActionButton(ctx, btnX, btnY_jump,   'A', 'rgba(100,200,255,0.5)');
    this._drawActionButton(ctx, btnX + 32, btnY_attack, 'B', 'rgba(255,210,0,0.5)');
  }

  _drawDpadButton(ctx, cx, cy, icon) {
    ctx.fillStyle   = 'rgba(255,255,255,0.22)';
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle    = 'rgba(255,255,255,0.8)';
    ctx.font         = '14px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, cx, cy);
  }

  _drawActionButton(ctx, cx, cy, label, color) {
    ctx.fillStyle   = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle    = '#FFFFFF';
    ctx.font         = 'bold 11px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }

  /** Big "TAP TO START" overlay */
  drawStartScreen(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    ctx.fillStyle    = COLOR.GOLD;
    ctx.font         = 'bold 28px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = '#FF6D00';
    ctx.shadowBlur   = 12;
    ctx.fillText('SAMURAI FROG', GAME_WIDTH / 2, GAME_HEIGHT * 0.35);
    ctx.shadowBlur   = 0;

    // Subtitle
    ctx.fillStyle = '#FFFFFF';
    ctx.font      = '10px monospace';
    ctx.fillText('Defeat the demons. Reach the shrine.', GAME_WIDTH / 2, GAME_HEIGHT * 0.5);

    // Blink prompt
    if (this._blinkOn) {
      ctx.fillStyle = '#FFEE58';
      ctx.font      = '12px monospace';
      ctx.fillText('TAP  TO  START', GAME_WIDTH / 2, GAME_HEIGHT * 0.65);
    }

    // Controls hint
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '8px monospace';
    ctx.fillText('Keyboard: ← → SPACE Z    |    Touch: D-pad  A  B', GAME_WIDTH / 2, GAME_HEIGHT * 0.82);
  }

  /** Win screen overlay */
  drawWinScreen(ctx, score) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#FFD600';
    ctx.font      = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#FF6D00';
    ctx.shadowBlur  = 10;
    ctx.fillText('YOU WIN!', GAME_WIDTH / 2, GAME_HEIGHT * 0.35);
    ctx.shadowBlur  = 0;

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
