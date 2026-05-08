// ============================================================
// input.js — Keyboard + HTML button touch + canvas fallback
// Architecture: HTML buttons (portrait) + keyboard always on
//               Canvas touch kept for landscape (in-canvas controls)
// ============================================================

export class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {
      left:   false,
      right:  false,
      jump:   false,
      attack: false,
    };

    // Edge-triggered: consumed once per press
    this._jumpPressed   = false;
    this._attackPressed = false;

    this._bindKeyboard();
    this._bindHTMLButtons();
    this._bindCanvasTouch();
  }

  // ── Public edge-trigger API ───────────────────────────────

  get jumpPressed() {
    const v = this._jumpPressed; this._jumpPressed = false; return v;
  }
  get attackPressed() {
    const v = this._attackPressed; this._attackPressed = false; return v;
  }

  // ── Keyboard ──────────────────────────────────────────────

  _bindKeyboard() {
    const DOWN = new Set();
    window.addEventListener('keydown', (e) => {
      if (DOWN.has(e.code)) return;
      DOWN.add(e.code);
      switch (e.code) {
        case 'ArrowLeft':  this.keys.left   = true; break;
        case 'ArrowRight': this.keys.right  = true; break;
        case 'Space': case 'ArrowUp': case 'KeyW':
          this._jumpPressed = true;
          this.keys.jump    = true;
          break;
        case 'KeyZ': case 'KeyJ': case 'KeyX':
          this._attackPressed = true;
          this.keys.attack    = true;
          break;
      }
      if (['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))
        e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      DOWN.delete(e.code);
      switch (e.code) {
        case 'ArrowLeft':  this.keys.left   = false; break;
        case 'ArrowRight': this.keys.right  = false; break;
        case 'Space': case 'ArrowUp': case 'KeyW': this.keys.jump   = false; break;
        case 'KeyZ': case 'KeyJ': case 'KeyX':     this.keys.attack = false; break;
      }
    });
  }

  // ── HTML Button binding (portrait mode) ───────────────────

  _bindHTMLButtons() {
    const map = [
      { id: 'btn-left',
        down: () => { this.keys.left = true; },
        up:   () => { this.keys.left = false; } },
      { id: 'btn-right',
        down: () => { this.keys.right = true; },
        up:   () => { this.keys.right = false; } },
      { id: 'btn-jump',
        down: () => { this._jumpPressed = true; this.keys.jump = true; },
        up:   () => { this.keys.jump = false; } },
      { id: 'btn-attack',
        down: () => { this._attackPressed = true; this.keys.attack = true; },
        up:   () => { this.keys.attack = false; } },
    ];

    for (const { id, down, up } of map) {
      const el = document.getElementById(id);
      if (!el) continue;
      const activeTouches = new Set();

      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          if (activeTouches.size === 0) down();
          activeTouches.add(t.identifier);
        }
        // Visual feedback
        el.classList.add('pressed');
      }, { passive: false });

      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) activeTouches.delete(t.identifier);
        if (activeTouches.size === 0) { up(); el.classList.remove('pressed'); }
      }, { passive: false });

      el.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        activeTouches.clear();
        up();
        el.classList.remove('pressed');
      }, { passive: false });

      // Mouse fallback
      el.addEventListener('mousedown', (e) => { e.preventDefault(); down(); el.classList.add('pressed'); });
      el.addEventListener('mouseup',   (e) => { e.preventDefault(); up();   el.classList.remove('pressed'); });
      el.addEventListener('mouseleave',() => { up(); el.classList.remove('pressed'); });
    }
  }

  // ── Canvas touch (landscape fallback) ─────────────────────

  _bindCanvasTouch() {
    this._activeTouches = new Map();

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this._htmlControlsVisible()) return;
      for (const t of e.changedTouches) this._handleCanvasTouchStart(t);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this._htmlControlsVisible()) return;
      for (const t of e.changedTouches) this._handleCanvasTouchEnd(t);
    }, { passive: false });

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) this._handleCanvasTouchEnd(t);
    }, { passive: false });
  }

  _htmlControlsVisible() {
    const el = document.getElementById('controls');
    if (!el) return false;
    return window.getComputedStyle(el).display !== 'none';
  }

  _getCanvasZone(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const lx   = (clientX - rect.left) / rect.width  * 480;
    const ly   = (clientY - rect.top)  / rect.height * 270;

    if (lx > 480 * 0.58) return ly < 270 * 0.70 ? 'jump' : 'attack';
    if (lx < 480 * 0.42) return lx < 480 * 0.21  ? 'left' : 'right';
    return null;
  }

  _handleCanvasTouchStart(touch) {
    const zone = this._getCanvasZone(touch.clientX, touch.clientY);
    if (!zone) return;
    this._activeTouches.set(touch.identifier, zone);
    if (zone === 'left')   this.keys.left   = true;
    if (zone === 'right')  this.keys.right  = true;
    if (zone === 'jump')   { this._jumpPressed   = true; this.keys.jump   = true; }
    if (zone === 'attack') { this._attackPressed = true; this.keys.attack = true; }
  }

  _handleCanvasTouchEnd(touch) {
    const zone = this._activeTouches.get(touch.identifier);
    if (!zone) return;
    this._activeTouches.delete(touch.identifier);
    if (zone === 'left')   this.keys.left   = false;
    if (zone === 'right')  this.keys.right  = false;
    if (zone === 'jump')   this.keys.jump   = false;
    if (zone === 'attack') this.keys.attack = false;
  }
}
