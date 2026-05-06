import { COLORS } from './constants.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function diamondPath(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w / 2, y + h);
  ctx.lineTo(x, y + h / 2);
  ctx.closePath();
}

export class Sprite {
  drawPlayer(ctx, x, y, w, h, frame = 0, options = {}) {
    const scaleX = w / 32;
    const scaleY = h / 44;
    const sx = x;
    const sy = y;
    const attack = !!options.attack;
    const hurt = !!options.hurt;
    const facing = options.facing ?? 1;
    const blink = options.blink ?? 1;
    ctx.save();
    ctx.globalAlpha = blink;
    if (facing < 0) {
      ctx.translate(sx + w, sy);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(sx, sy);
    }

    const bounce = frame % 2 === 1 ? 1 : 0;
    const legLift = frame === 1 ? 2 : 0;
    const headBob = frame === 2 ? -1 : 0;
    const yOff = hurt ? 2 : 0;

    // Legs
    ctx.fillStyle = COLORS.frogOutline;
    ctx.fillRect(6 * scaleX, 27 * scaleY + yOff, 20 * scaleX, 10 * scaleY);
    ctx.fillStyle = COLORS.frog;
    ctx.fillRect(7 * scaleX, 26 * scaleY + yOff, 18 * scaleX, 9 * scaleY);
    ctx.fillStyle = '#1F5D2A';
    ctx.fillRect(7 * scaleX, 32 * scaleY + yOff, 6 * scaleX, 7 * scaleY);
    ctx.fillRect(19 * scaleX, 32 * scaleY + yOff, 6 * scaleX, 7 * scaleY);

    // Feet
    ctx.fillStyle = COLORS.frogOutline;
    ctx.beginPath();
    ctx.ellipse(9 * scaleX, 39 * scaleY + yOff, 4.5 * scaleX, 2.5 * scaleY, 0, 0, Math.PI * 2);
    ctx.ellipse(23 * scaleX, 39 * scaleY + yOff, 4.5 * scaleX, 2.5 * scaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.frog;
    ctx.beginPath();
    ctx.ellipse(9 * scaleX, 38.2 * scaleY + yOff, 3.5 * scaleX, 2 * scaleY, 0, 0, Math.PI * 2);
    ctx.ellipse(23 * scaleX, 38.2 * scaleY + yOff, 3.5 * scaleX, 2 * scaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso armor
    ctx.fillStyle = COLORS.armor;
    ctx.fillRect(8 * scaleX, 12 * scaleY + yOff, 16 * scaleX, 14 * scaleY);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(8 * scaleX, 12 * scaleY + yOff, 16 * scaleX, 14 * scaleY);

    // Belt
    ctx.fillStyle = COLORS.belt;
    ctx.fillRect(7 * scaleX, 23 * scaleY + yOff, 18 * scaleX, 3 * scaleY);
    ctx.fillRect(4 * scaleX, 24 * scaleY + yOff, 5 * scaleX, 2 * scaleY);
    ctx.fillRect(24 * scaleX, 24 * scaleY + yOff, 4 * scaleX, 2 * scaleY);

    // Arms / sleeves
    ctx.fillStyle = COLORS.cloth;
    ctx.fillRect(2 * scaleX, 15 * scaleY + yOff + bounce, 6 * scaleX, 8 * scaleY);
    ctx.fillRect(24 * scaleX, 15 * scaleY + yOff - bounce, 6 * scaleX, 8 * scaleY);
    ctx.fillStyle = COLORS.frog;
    ctx.beginPath();
    ctx.arc(5 * scaleX, 23 * scaleY + yOff + bounce, 2.4 * scaleX, 0, Math.PI * 2);
    ctx.arc(27 * scaleX, 23 * scaleY + yOff - bounce, 2.4 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = COLORS.frog;
    ctx.beginPath();
    ctx.ellipse(16 * scaleX, 11 * scaleY + yOff + headBob, 11 * scaleX, 10 * scaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.frogOutline;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Headband
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(7 * scaleX, 5 * scaleY + yOff + headBob, 18 * scaleX, 4 * scaleY);
    ctx.fillRect(12 * scaleX, 3 * scaleY + yOff + headBob, 6 * scaleX, 4 * scaleY);
    ctx.fillRect(18 * scaleX, 4 * scaleY + yOff + headBob, 5 * scaleX, 2 * scaleY);

    // Eyes
    const eyeY = 9 * scaleY + yOff + headBob;
    const eyeX1 = 10 * scaleX;
    const eyeX2 = 22 * scaleX;
    ctx.fillStyle = COLORS.cloud;
    circle(ctx, eyeX1, eyeY, 3.8 * scaleX);
    circle(ctx, eyeX2, eyeY, 3.8 * scaleX);
    ctx.strokeStyle = COLORS.frogOutline;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = COLORS.frogOutline;
    circle(ctx, eyeX1, eyeY, 1.9 * scaleX);
    circle(ctx, eyeX2, eyeY, 1.9 * scaleX);
    ctx.fillStyle = COLORS.cloud;
    circle(ctx, eyeX1 + 0.8 * scaleX, eyeY - 0.8 * scaleY, 0.6 * scaleX);
    circle(ctx, eyeX2 + 0.8 * scaleX, eyeY - 0.8 * scaleY, 0.6 * scaleX);

    // Mouth
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath();
    ctx.ellipse(16 * scaleX, 16.5 * scaleY + yOff, 5.2 * scaleX, 2.3 * scaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E57373';
    ctx.stroke();

    // Sword sheath
    ctx.fillStyle = COLORS.belt;
    ctx.fillRect(2 * scaleX, 20 * scaleY + yOff, 10 * scaleX, 3 * scaleY);
    ctx.fillRect(0.5 * scaleX, 18.8 * scaleY + yOff, 2 * scaleX, 5 * scaleY);

    if (attack) {
      ctx.save();
      ctx.translate(25 * scaleX, 18 * scaleY + yOff);
      ctx.rotate(-0.35);
      ctx.strokeStyle = COLORS.bladeEdge;
      ctx.lineWidth = 3 * Math.min(scaleX, scaleY);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18 * scaleX, -3 * scaleY);
      ctx.stroke();
      ctx.strokeStyle = COLORS.blade;
      ctx.lineWidth = 1.6 * Math.min(scaleX, scaleY);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18 * scaleX, -3 * scaleY);
      ctx.stroke();
      ctx.restore();
    }

    if (hurt) {
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.beginPath();
      ctx.arc(16 * scaleX, 4 * scaleY + yOff, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawBat(ctx, x, y, w, h, frame = 0, options = {}) {
    const flap = frame % 2;
    ctx.save();
    ctx.translate(x, y);
    if (options.facing === -1) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = COLORS.batWing;
    ctx.beginPath();
    ctx.moveTo(2, h / 2);
    ctx.quadraticCurveTo(2, 2 + flap * 3, w * 0.35, h * 0.15);
    ctx.quadraticCurveTo(w * 0.42, h * 0.42, w * 0.5, h * 0.5);
    ctx.quadraticCurveTo(w * 0.58, h * 0.42, w * 0.65, h * 0.15);
    ctx.quadraticCurveTo(w - 2, 2 + flap * 3, w - 2, h / 2);
    ctx.quadraticCurveTo(w - 8, h * 0.8, w * 0.65, h * 0.72);
    ctx.quadraticCurveTo(w * 0.5, h * 0.9, w * 0.35, h * 0.72);
    ctx.quadraticCurveTo(8, h * 0.8, 2, h / 2);
    ctx.fill();

    ctx.fillStyle = COLORS.batBody;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.18, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.batBelly;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 1, w * 0.1, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.batEye;
    ctx.beginPath();
    ctx.arc(w / 2 - 4, h / 2 - 2, 1.6, 0, Math.PI * 2);
    ctx.arc(w / 2 + 4, h / 2 - 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w / 2 - 4.5, h / 2 - 2.5, 0.5, 0, Math.PI * 2);
    ctx.arc(w / 2 + 3.5, h / 2 - 2.5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 2, h / 2 + 3);
    ctx.lineTo(w / 2 - 0.5, h / 2 + 5);
    ctx.lineTo(w / 2 + 1, h / 2 + 3);
    ctx.lineTo(w / 2 + 2.5, h / 2 + 5);
    ctx.lineTo(w / 2 + 4, h / 2 + 3);
    ctx.fill();

    ctx.restore();
  }

  drawSlimeEgg(ctx, x, y, w, h, frame = 0, options = {}) {
    const t = options.time ?? 0;
    const sx = 0.98 + Math.sin(t * 12) * 0.04;
    const sy = 1.02 + Math.cos(t * 14) * 0.03;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(sx, sy);
    if (options.facing === -1) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-w / 2, -h / 2);

    ctx.fillStyle = COLORS.slime;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.45, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.slimeBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w / 2 - 4, h / 2 - 3, 2.2, 0, Math.PI * 2);
    ctx.arc(w / 2 + 4, h / 2 - 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w / 2 - 3.6, h / 2 - 2.7, 0.9, 0, Math.PI * 2);
    ctx.arc(w / 2 + 4.4, h / 2 - 2.7, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#E91E63';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 + 3.5, 3.5, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  drawBabySlime(ctx, x, y, w, h, frame = 0, options = {}) {
    const squash = frame % 2 === 0 ? [1.1, 0.85] : [0.85, 1.1];
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(squash[0], squash[1]);
    if (options.facing === -1) ctx.scale(-1, 1);
    ctx.translate(-w / 2, -h / 2);

    ctx.fillStyle = COLORS.babySlime;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.46, h * 0.43, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.babyBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w / 2 - 2.8, h / 2 - 1, 1.1, 0, Math.PI * 2);
    ctx.arc(w / 2 + 2.8, h / 2 - 1, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w / 2 - 2.4, h / 2 - 0.8, 0.5, 0, Math.PI * 2);
    ctx.arc(w / 2 + 3.2, h / 2 - 0.8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGoldfish(ctx, x, y, w, h, time = 0) {
    const bob = Math.sin(time * 8) * 1.2;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = COLORS.fish;
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h / 2, w * 0.3, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.fishFin;
    ctx.beginPath();
    ctx.moveTo(w * 0.72, h / 2);
    ctx.lineTo(w, h * 0.1);
    ctx.lineTo(w, h * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.48);
    ctx.lineTo(w * 0.18, h * 0.08);
    ctx.lineTo(w * 0.24, h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w * 0.22, h * 0.42, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w * 0.15, h * 0.33, 0.5, 0, Math.PI * 2);
    ctx.fill();

    if (Math.sin(time * 24) > 0.4) {
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.2, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawJadeOrb(ctx, x, y, w, h, time = 0) {
    const pulse = 1 + Math.sin(time * 5) * 0.08;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-w / 2, -h / 2);
    ctx.shadowColor = COLORS.jade;
    ctx.shadowBlur = 10;
    ctx.fillStyle = COLORS.jade;
    diamondPath(ctx, 0, 0, w, h);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = COLORS.jadeBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.18);
    ctx.lineTo(w * 0.58, h * 0.42);
    ctx.lineTo(w * 0.44, h * 0.48);
    ctx.lineTo(w * 0.22, h * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawHiddenPower(ctx, x, y, w, h, time = 0) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(time * 0.8);
    ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = '#FF6D00';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.floor(h * 0.95)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', w / 2, h / 2 + 1);
    ctx.restore();
  }

  drawGroundTile(ctx, x, y, size = 32) {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#795548';
    ctx.fillRect(x + 4, y + 4, 8, 10);
    ctx.fillRect(x + 16, y + 6, 10, 7);
    ctx.fillRect(x + 8, y + 18, 10, 8);
    ctx.fillStyle = COLORS.moss;
    ctx.fillRect(x, y, size, 4);
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    ctx.fillRect(x + 2, y + 2, 6, 6);
  }

  drawPlatformBamboo(ctx, x, y, w, h = 16) {
    ctx.fillStyle = COLORS.bamboo;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#9E9D24';
    for (let i = 0; i < w; i += 24) ctx.fillRect(x + i, y + 7, 16, 2);
    ctx.fillStyle = COLORS.moss;
    for (let i = 0; i < w; i += 14) ctx.fillRect(x + i, y - 2, 10, 4);
  }

  drawSpike(ctx, x, y, w, h = 16) {
    ctx.fillStyle = COLORS.spike;
    for (let i = 0; i < w; i += 16) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + 8, y);
      ctx.lineTo(x + i + 16, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = COLORS.spikeEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  drawGate(ctx, x, y, w, h, time = 0) {
    ctx.save();
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x, y - h, 12, h);
    ctx.fillRect(x + w - 12, y - h, 12, h);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x + 8, y - h, w - 16, 10);
    ctx.beginPath();
    ctx.arc(x + w / 2, y - h + 10, Math.min(w / 2 - 10, h * 0.35), Math.PI, 0);
    ctx.lineWidth = 10;
    ctx.strokeStyle = COLORS.gold;
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(255,214,0,${0.25 - i * 0.04})`;
      ctx.lineWidth = 4 + i * 4;
      ctx.beginPath();
      ctx.arc(x + w / 2, y - h + 10, 18 + i * 8 + Math.sin(time * 4) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawHeart(ctx, x, y, size = 12, filled = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 12, size / 12);
    ctx.beginPath();
    ctx.moveTo(6, 11);
    ctx.bezierCurveTo(6, 11, 0, 7, 0, 4);
    ctx.bezierCurveTo(0, 1, 3, 0, 6, 3);
    ctx.bezierCurveTo(9, 0, 12, 1, 12, 4);
    ctx.bezierCurveTo(12, 7, 6, 11, 6, 11);
    ctx.closePath();
    ctx.fillStyle = filled ? '#E53935' : 'rgba(255,255,255,.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.stroke();
    ctx.restore();
  }

  drawDpadButton(ctx, x, y, r, label, active = false) {
    ctx.save();
    ctx.fillStyle = active ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.floor(r * 0.9)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 1);
    ctx.restore();
  }

  drawActionButton(ctx, x, y, r, label, accent = false, active = false) {
    ctx.save();
    ctx.fillStyle = active
      ? (accent ? 'rgba(255,200,0,.65)' : 'rgba(255,255,255,.6)')
      : (accent ? 'rgba(255,200,0,.4)' : 'rgba(255,255,255,.4)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.floor(r * 0.95)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 1);
    ctx.restore();
  }
}
