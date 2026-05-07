// ============================================================
// sprite.js — All procedural sprite drawing (no external assets)
// Every method signature: draw*(ctx, x, y, frame, options)
// x, y = bottom-center anchor unless noted
// ============================================================

import { COLOR } from './constants.js';

export const Sprite = {

  // ═══════════════════════════════════════════════════════════
  // PLAYER — Kaeru the Samurai Frog
  // ═══════════════════════════════════════════════════════════

  drawPlayer(ctx, x, y, frame, state, facingRight, alpha = 1, hasDoubleJump = false) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);

    const s = 1; // base scale

    switch (state) {
      case 'IDLE':    this._kaeru_idle(ctx, frame, s);    break;
      case 'RUNNING': this._kaeru_run(ctx, frame, s);     break;
      case 'JUMPING':
      case 'DOUBLE_JUMP': this._kaeru_jump(ctx, frame, s); break;
      case 'FALLING': this._kaeru_fall(ctx, frame, s);   break;
      case 'ATTACKING': this._kaeru_attack(ctx, frame, s); break;
      case 'HURT':    this._kaeru_hurt(ctx, frame, s);   break;
      case 'DEAD':    this._kaeru_dead(ctx, frame, s);   break;
      default:        this._kaeru_idle(ctx, 0, s);       break;
    }

    // Double-jump aura glow when available
    if (hasDoubleJump && (state === 'JUMPING' || state === 'DOUBLE_JUMP')) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.shadowColor = '#FFD600';
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(0, -18, 16, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD600';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },

  /** Shared frog body drawing — used by all stances */
  _kaeru_body(ctx, legPhase, armRaise, s) {
    // ── Legs ──────────────────────────────────────────
    const legOff = Math.sin(legPhase) * 4;
    // Back leg
    ctx.fillStyle = '#1A5C20';
    ctx.beginPath();
    ctx.ellipse(-5, -2 + legOff * 0.5, 4, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    this._frogFoot(ctx, -7, 4 + legOff * 0.5);
    // Front leg
    ctx.fillStyle = COLOR.FROG_GREEN;
    ctx.beginPath();
    ctx.ellipse(5, -2 - legOff * 0.5, 4, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    this._frogFoot(ctx, 7, 4 - legOff * 0.5);

    // ── Torso / Armour ─────────────────────────────────
    ctx.fillStyle = COLOR.ARMOR_RED;
    ctx.beginPath();
    ctx.ellipse(0, -14, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Gold trim
    ctx.strokeStyle = COLOR.GOLD;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -14, 9, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Chest line detail
    ctx.strokeStyle = COLOR.GOLD;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -20); ctx.lineTo(0, -23); ctx.lineTo(4, -20);
    ctx.stroke();

    // ── Belt & Scabbard ────────────────────────────────
    ctx.fillStyle = COLOR.BELT_BLACK;
    ctx.fillRect(-9, -6, 18, 3);
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.roundRect(-8, -5, 5, 10, 2);
    ctx.fill();

    // ── Arms ───────────────────────────────────────────
    const ar = armRaise || 0;
    ctx.fillStyle = COLOR.CLOTH_GRAY;
    // Back arm
    ctx.beginPath();
    ctx.ellipse(-8, -14 + ar * 0.3, 3, 6, -0.3 + ar * 0.1, 0, Math.PI * 2);
    ctx.fill();
    this._frogHand(ctx, -10, -8 + ar * 0.5);
    // Front arm
    ctx.beginPath();
    ctx.ellipse(8, -14 + ar * 0.3, 3, 6, 0.3 - ar * 0.1, 0, Math.PI * 2);
    ctx.fill();
    this._frogHand(ctx, 10, -8 + ar * 0.5);
  },

  _frogFoot(ctx, x, y) {
    ctx.fillStyle = COLOR.FROG_DARK;
    ctx.beginPath();
    // Three webbed toes
    for (let i = -1; i <= 1; i++) {
      ctx.ellipse(x + i * 3, y, 2.5, 2, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  },

  _frogHand(ctx, x, y) {
    ctx.fillStyle = COLOR.FROG_DARK;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(x + i * 2.5, y, 2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  _kaeru_head(ctx, bobY) {
    const by = bobY || 0;
    // Neck
    ctx.fillStyle = COLOR.FROG_GREEN;
    ctx.fillRect(-4, -26 + by, 8, 4);

    // Head shape — wide ellipse
    ctx.fillStyle = COLOR.FROG_GREEN;
    ctx.beginPath();
    ctx.ellipse(0, -31 + by, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLOR.FROG_DARK;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Headband
    ctx.fillStyle = COLOR.ARMOR_RED;
    ctx.fillRect(-11, -34 + by, 22, 4);
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(8, -34 + by, 5, 3);

    // Eyes — bulging
    this._frogEye(ctx, -7, -36 + by);
    this._frogEye(ctx,  7, -36 + by);

    // Mouth
    ctx.fillStyle = COLOR.MOUTH_PINK;
    ctx.beginPath();
    ctx.arc(0, -28 + by, 5, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = COLOR.MOUTH_DARK;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  },

  _frogEye(ctx, x, y) {
    // Outer
    ctx.fillStyle = COLOR.FROG_DARK;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // White sclera
    ctx.fillStyle = COLOR.EYE_WHITE;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = COLOR.PUPIL_BLACK;
    ctx.beginPath();
    ctx.ellipse(x + 1, y, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 1.5, y - 1.5, 1, 0, Math.PI * 2);
    ctx.fill();
  },

  // ── Stances ───────────────────────────────────────────────

  _kaeru_idle(ctx, frame, s) {
    const bob = frame < 2 ? 0 : 1;
    this._kaeru_body(ctx, 0, 0, s);
    this._kaeru_head(ctx, bob);
  },

  _kaeru_run(ctx, frame, s) {
    const phase = (frame / 6) * Math.PI * 2;
    const bob   = Math.sin(phase * 2) * 1.5;
    this._kaeru_body(ctx, phase, 0, s);
    this._kaeru_head(ctx, bob);
  },

  _kaeru_jump(ctx, frame, s) {
    ctx.save();
    if (frame === 0) ctx.translate(0, -2);
    this._kaeru_body(ctx, -0.5, -0.3, s);
    this._kaeru_head(ctx, -2);
    ctx.restore();
  },

  _kaeru_fall(ctx, frame, s) {
    ctx.save();
    if (frame === 0) ctx.translate(0, 2);
    this._kaeru_body(ctx, 0.5, 0.2, s);
    this._kaeru_head(ctx, 1);
    ctx.restore();
  },

  _kaeru_attack(ctx, frame, s) {
    this._kaeru_body(ctx, 0, -0.4, s);
    this._kaeru_head(ctx, 0);
    // Katana slash — extended on frames 1-2
    if (frame === 0) {
      this._drawKatana(ctx, 10, -14, 0.3, 0.3);
    } else if (frame === 1 || frame === 2) {
      this._drawKatana(ctx, 14, -12, -0.2, 1.0);
      // Slash arc effect
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(5, -16, 24, -0.5, 0.5);
      ctx.stroke();
    } else {
      this._drawKatana(ctx, 8, -10, 0.6, 0.5);
    }
  },

  _drawKatana(ctx, x, y, angle, alpha) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Handle
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(-2, 0, 4, 10);
    // Guard
    ctx.fillStyle = COLOR.GOLD;
    ctx.fillRect(-4, -1, 8, 3);
    // Blade
    ctx.fillStyle = COLOR.BLADE_SILVER;
    ctx.beginPath();
    ctx.moveTo(-1.5, -30);
    ctx.lineTo(1.5,  -30);
    ctx.lineTo(1,    0);
    ctx.lineTo(-1,   0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLOR.BLADE_DARK;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Tip shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0.8, -26);
    ctx.lineTo(-0.8, -26);
    ctx.fill();
    ctx.restore();
  },

  _kaeru_hurt(ctx, frame, s) {
    ctx.save();
    ctx.translate(frame === 0 ? -2 : 2, frame === 0 ? -3 : 0);
    this._kaeru_body(ctx, 0, 0.3, s);
    this._kaeru_head(ctx, 0);
    // Stars
    if (frame === 0) {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        this._drawStar(ctx, Math.cos(a) * 10, -40 + Math.sin(a) * 5, 4);
      }
    }
    ctx.restore();
  },

  _drawStar(ctx, x, y, r) {
    ctx.fillStyle = '#FFD600';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 2 / 5) * Math.PI - Math.PI / 2;
      const a2 = ((i * 2 + 1) / 5) * Math.PI - Math.PI / 2;
      const ox = i === 0 ? Math.cos(a1) * r : Math.cos(a1) * r;
      const oy = i === 0 ? Math.sin(a1) * r : Math.sin(a1) * r;
      if (i === 0) ctx.moveTo(x + ox, y + oy);
      else ctx.lineTo(x + ox, y + oy);
      ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
    }
    ctx.closePath();
    ctx.fill();
  },

  _kaeru_dead(ctx, frame, s) {
    ctx.save();
    if (frame === 0) {
      this._kaeru_body(ctx, 0, 0, s);
      this._kaeru_head(ctx, 0);
    } else if (frame === 1) {
      ctx.rotate(0.8);
      ctx.translate(0, 4);
      this._kaeru_body(ctx, 0, 0, s);
      this._kaeru_head(ctx, 0);
    } else {
      ctx.globalAlpha *= 0.3;
      ctx.rotate(1.4);
      ctx.translate(0, 8);
      this._kaeru_body(ctx, 0, 0, s);
      this._kaeru_head(ctx, 0);
    }
    ctx.restore();
  },

  // ═══════════════════════════════════════════════════════════
  // ENEMIES
  // ═══════════════════════════════════════════════════════════

  drawBat(ctx, x, y, frame, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    const wingFlap = frame === 0 ? -1 : 1;

    // Wings
    ctx.fillStyle = COLOR.BAT_WING;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, wingFlap * -12, -24, wingFlap * -8, -26, 4);
    ctx.bezierCurveTo(-20, 8, -10, 6, 0, 4);
    ctx.closePath();
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(10, wingFlap * -12, 24, wingFlap * -8, 26, 4);
    ctx.bezierCurveTo(20, 8, 10, 6, 0, 4);
    ctx.closePath();
    ctx.fill();

    // Wing membranes
    ctx.strokeStyle = COLOR.BAT_WING_RIM;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, wingFlap * -6);
    ctx.moveTo(0, 0);
    ctx.lineTo(20, wingFlap * -6);
    ctx.stroke();

    // Body
    ctx.fillStyle = COLOR.BAT_BODY;
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly lighter
    ctx.fillStyle = COLOR.BAT_BELLY;
    ctx.beginPath();
    ctx.ellipse(0, 4, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.shadowColor = COLOR.BAT_EYE;
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = COLOR.BAT_EYE;
    ctx.beginPath();
    ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( 3, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-2, 6); ctx.lineTo(-1, 9); ctx.lineTo(-3, 9); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo( 2, 6); ctx.lineTo( 3, 9); ctx.lineTo( 1, 9); ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  drawSlimeEgg(ctx, x, y, wobble = 1, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(wobble, 2 - wobble); // squeeze/stretch effect

    // Body
    ctx.fillStyle = COLOR.SLIME_GREEN;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slime drips
    ctx.fillStyle = '#69F000';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 8, 12, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = COLOR.SLIME_BORDER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-5, -4, 4, 4.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse( 5, -4, 4, 4.5,  0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-5, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( 5, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Evil grin
    ctx.strokeStyle = COLOR.BAT_EYE;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
  },

  drawBabySlime(ctx, x, y, frame, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    // frame 0: squish wide, frame 1: squish tall
    const scaleX = frame === 0 ? 1.2 : 0.85;
    const scaleY = frame === 0 ? 0.85 : 1.15;
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = COLOR.BABY_GREEN;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COLOR.BABY_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( 3, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-3, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( 3, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // ═══════════════════════════════════════════════════════════
  // COLLECTIBLES
  // ═══════════════════════════════════════════════════════════

  drawGoldfish(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);
    // Gentle bob
    ctx.translate(0, Math.sin(time * 3) * 2);

    // Tail
    ctx.fillStyle = COLOR.FISH_FIN;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-16, -5);
    ctx.lineTo(-16,  5);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = COLOR.GOLD_FISH;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly highlight
    ctx.fillStyle = COLOR.FISH_BELLY;
    ctx.beginPath();
    ctx.ellipse(1, 1, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = COLOR.FISH_FIN;
    ctx.beginPath();
    ctx.moveTo(-2, -6); ctx.lineTo(3, -10); ctx.lineTo(6, -6);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(6, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(6.8, -1.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Bubble sparkle
    const bAlpha = (Math.sin(time * 5 + 1) * 0.5 + 0.5) * 0.6;
    ctx.globalAlpha = bAlpha;
    ctx.fillStyle   = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(10, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawJadeOrb(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.translate(0, Math.sin(time * 2.5) * 2);

    const pulse = Math.sin(time * 4) * 0.5 + 0.5;

    ctx.shadowColor = COLOR.JADE;
    ctx.shadowBlur  = 6 + pulse * 6;

    // Diamond shape
    ctx.fillStyle = COLOR.JADE;
    ctx.beginPath();
    ctx.moveTo(0,   -10);
    ctx.lineTo(9,   0);
    ctx.lineTo(0,   10);
    ctx.lineTo(-9,  0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = COLOR.JADE_BORDER;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Inner highlight
    ctx.fillStyle   = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(0,  -5);
    ctx.lineTo(4,   0);
    ctx.lineTo(0,   2);
    ctx.lineTo(-4,  0);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  drawHiddenPower(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 1.2);
    ctx.translate(0, Math.sin(time * 2) * 1.5);

    const pulse = Math.sin(time * 5) * 0.5 + 0.5;

    ctx.shadowColor = COLOR.POWER;
    ctx.shadowBlur  = 8 + pulse * 8;

    // Octagon body
    ctx.fillStyle = COLOR.POWER;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      const r = 11;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = COLOR.POWER_BORDER;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // "W" symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font      = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.rotate(-time * 1.2); // counter-rotate so text is always upright
    ctx.fillText('W', 0, 0);

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ═══════════════════════════════════════════════════════════
  // TERRAIN
  // ═══════════════════════════════════════════════════════════

  drawGroundTile(ctx, x, y, w, h) {
    // Base fill
    ctx.fillStyle = COLOR.GROUND;
    ctx.fillRect(x, y, w, h);

    // Stone texture blocks
    ctx.fillStyle = COLOR.GROUND_STONE;
    const bw = 16, bh = 12;
    for (let bx = x; bx < x + w; bx += bw) {
      for (let by = y + 4; by < y + h; by += bh) {
        const offset = Math.floor((by - y) / bh) % 2 === 0 ? 0 : bw / 2;
        ctx.fillRect(bx + offset + 1, by + 1, bw - 2, bh - 2);
      }
    }

    // Moss patches
    ctx.fillStyle = COLOR.GROUND_MOSS;
    for (let mx = x + 4; mx < x + w - 4; mx += 18) {
      ctx.beginPath();
      ctx.ellipse(mx, y + 3, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grass top edge
    ctx.fillStyle = COLOR.GRASS;
    ctx.fillRect(x, y, w, 3);
    // Grass tufts
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth   = 1.5;
    for (let gx = x + 5; gx < x + w - 2; gx += 8) {
      ctx.beginPath();
      ctx.moveTo(gx,     y);
      ctx.lineTo(gx - 2, y - 4);
      ctx.moveTo(gx + 2, y);
      ctx.lineTo(gx + 2, y - 5);
      ctx.moveTo(gx + 4, y);
      ctx.lineTo(gx + 5, y - 3);
      ctx.stroke();
    }
  },

  drawPlatform(ctx, x, y, w, h = 12) {
    // Bamboo log platform
    const logH = h;

    // Base logs
    for (let lx = x; lx < x + w; lx += 16) {
      const lw = Math.min(16, x + w - lx);
      // Log body
      ctx.fillStyle = COLOR.BAMBOO;
      ctx.fillRect(lx, y, lw, logH);
      // Node ring
      ctx.fillStyle = COLOR.BAMBOO_NODE;
      ctx.fillRect(lx, y + logH * 0.4, lw, 2);
    }

    // Top surface with leaf detail
    ctx.fillStyle = COLOR.BAMBOO_NODE;
    ctx.fillRect(x, y, w, 3);

    // Small leaf hints on top
    ctx.fillStyle = '#558B2F';
    for (let lx2 = x + 3; lx2 < x + w - 3; lx2 += 10) {
      ctx.beginPath();
      ctx.ellipse(lx2, y - 2, 4, 2, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow underside
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, y + logH - 2, w, 2);
  },

  drawSpike(ctx, x, y, w) {
    const tipH  = 14;
    const tipW  = 10;
    const count = Math.floor(w / tipW);

    ctx.fillStyle   = COLOR.SPIKE;
    ctx.strokeStyle = COLOR.SPIKE_DARK;
    ctx.lineWidth   = 0.8;

    for (let i = 0; i < count; i++) {
      const sx = x + i * tipW;
      ctx.beginPath();
      ctx.moveTo(sx,          y);
      ctx.lineTo(sx + tipW / 2, y - tipH);
      ctx.lineTo(sx + tipW,   y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Highlight
      ctx.fillStyle = '#EF9A9A';
      ctx.beginPath();
      ctx.moveTo(sx + tipW / 2, y - tipH);
      ctx.lineTo(sx + tipW / 2 + 1, y - tipH + 5);
      ctx.lineTo(sx + tipW / 2 - 1, y - tipH + 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLOR.SPIKE;
    }
  },

  drawGoalGate(ctx, x, y, h, time) {
    const w = 60;
    const cx = x + w / 2;

    // Pillars
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x,          y,     10, h);
    ctx.fillRect(x + w - 10, y,     10, h);

    // Pillar details
    ctx.fillStyle = '#757575';
    for (let py = y + 10; py < y + h - 5; py += 20) {
      ctx.fillRect(x + 1,          py, 8,  3);
      ctx.fillRect(x + w - 9, py, 8,  3);
    }

    // Arch
    ctx.fillStyle   = COLOR.GOLD;
    ctx.strokeStyle = '#F9A825';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(cx, y, w * 0.45, Math.PI, 0, false);
    ctx.stroke();

    // Inner glow rings
    const ringAlpha = (Math.sin(time * 3) * 0.5 + 0.5) * 0.5;
    for (let r = 10; r < 40; r += 10) {
      ctx.globalAlpha = ringAlpha * (1 - r / 40);
      ctx.strokeStyle = COLOR.GOLD;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(cx, y + 20, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Torii top bar
    ctx.fillStyle = COLOR.ARMOR_RED;
    ctx.fillRect(x - 5,  y - 6,  w + 10, 6);
    ctx.fillRect(x - 2,  y - 12, w + 4,  6);

    // Particle sparkles
    for (let i = 0; i < 5; i++) {
      const a     = time * 2 + (i / 5) * Math.PI * 2;
      const pr    = 15 + i * 4;
      const px    = cx + Math.cos(a) * pr;
      const py    = y + 20 + Math.sin(a) * pr * 0.4;
      const pAlpha = (Math.sin(time * 4 + i) * 0.5 + 0.5) * 0.8;
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle   = '#FFEE58';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  // ═══════════════════════════════════════════════════════════
  // VFX
  // ═══════════════════════════════════════════════════════════

  drawHitEffect(ctx, x, y, progress) {
    // progress: 0..1 as effect fades
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    const r = progress * 20;
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    // Impact lines
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
      ctx.lineTo(x + Math.cos(a) * r,       y + Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawDeathPop(ctx, x, y, progress) {
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    const r = progress * 18;
    ctx.fillStyle   = COLOR.SLIME_GREEN;
    for (let i = 0; i < 8; i++) {
      const a  = (i / 8) * Math.PI * 2;
      const pr = r * (0.5 + Math.random() * 0.5);
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * pr, y + Math.sin(a) * pr, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};
