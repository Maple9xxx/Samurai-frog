// ============================================================
// vfx.js — Floating score popups + particle burst system
// v2 new file: FloatingText, ParticleBurst
// ============================================================

// ── Floating score / status text ─────────────────────────────

export class FloatingText {
  /**
   * @param {number} worldX  World-space X
   * @param {number} worldY  World-space Y (starts here, drifts up)
   * @param {string} text    Display string
   * @param {string} color   CSS color
   */
  constructor(worldX, worldY, text, color = '#FFD600') {
    this.worldX  = worldX;
    this.worldY  = worldY;
    this.text    = text;
    this.color   = color;
    this._timer  = 0;
    this.dead    = false;
    this._life   = 0.9; // seconds
  }

  update(dt) {
    this._timer   += dt;
    this.worldY   -= 28 * dt; // drift upward in world space
    if (this._timer >= this._life) this.dead = true;
  }

  draw(ctx, cameraX) {
    const progress = this._timer / this._life;
    const alpha    = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4;
    const scale    = progress < 0.1 ? (progress / 0.1) * 1.2 : 1;

    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.fillStyle    = this.color;
    ctx.strokeStyle  = 'rgba(0,0,0,0.6)';
    ctx.lineWidth    = 2;
    ctx.font         = `bold ${Math.round(10 * scale)}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const sx = this.worldX - cameraX;
    const sy = this.worldY;
    ctx.strokeText(this.text, sx, sy);
    ctx.fillText(this.text, sx, sy);
    ctx.restore();
  }
}

// ── Particle burst ────────────────────────────────────────────

export class ParticleBurst {
  /**
   * @param {number} worldX
   * @param {number} worldY
   * @param {string[]} colors  Array of CSS color strings
   * @param {number}   count   Particle count
   */
  constructor(worldX, worldY, colors = ['#FFD600', '#FF6D00'], count = 10) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.dead   = false;

    this._particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const speed = 40 + Math.random() * 60;
      this._particles.push({
        x:     worldX,
        y:     worldY,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size:  2 + Math.random() * 2.5,
        life:  0.4 + Math.random() * 0.3,
        timer: 0,
      });
    }
  }

  update(dt) {
    let allDead = true;
    for (const p of this._particles) {
      if (p.timer >= p.life) continue;
      allDead = false;
      p.timer += dt;
      p.x     += p.vx * dt;
      p.y     += p.vy * dt;
      p.vy    += 200 * dt; // gravity
    }
    if (allDead) this.dead = true;
  }

  draw(ctx, cameraX) {
    for (const p of this._particles) {
      if (p.timer >= p.life) continue;
      const alpha = 1 - p.timer / p.life;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
