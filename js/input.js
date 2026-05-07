// ============================================================
// input.js — Keyboard + Touch input handler
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

    // Edge-triggered flags (consumed once per press)
    this._jumpPressed   = false;
    this._attackPressed = false;

    this._bindKeyboard();
    this._bindTouch();
  }

  // ── Public API ────────────────────────────────────────────

  /** True only on the frame the button was first pressed. */
  get jumpPressed()   { const v = this._jumpPressed;   this._jumpPressed   = false; return v; }
  get attackPressed() { const v = this._attackPressed; this._attackPressed = false; return v; }

  // ── Keyboard ──────────────────────────────────────────────

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowLeft':  this.keys.left   = true; break;
        case 'ArrowRight': this.keys.right  = true; break;
        case 'Space':
        case 'ArrowUp':
          if (!this.keys.jump) this._jumpPressed = true;
          this.keys.jump = true;
          break;
        case 'KeyZ':
        case 'KeyJ':
          if (!this.keys.attack) this._attackPressed = true;
          this.keys.attack = true;
          break;
      }
      // Prevent scroll / zoom
      if (['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft':  this.keys.left   = false; break;
        case 'ArrowRight': this.keys.right  = false; break;
        case 'Space':
        case 'ArrowUp':    this.keys.jump   = false; break;
        case 'KeyZ':
        case 'KeyJ':       this.keys.attack = false; break;
      }
    });
  }

  // ── Touch ─────────────────────────────────────────────────

  _bindTouch() {
    // Track active touches so multi-finger works simultaneously
    this._activeTouches = new Map();

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) this._handleTouchStart(t);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) this._handleTouchEnd(t);
    }, { passive: false });

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) this._handleTouchEnd(t);
    }, { passive: false });
  }

  _getTouchZone(clientX, clientY) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    // Convert to logical canvas coords (before the 2x ctx transform)
    const lx = (clientX - rect.left)  * scaleX / 2;
    const ly = (clientY - rect.top)   * scaleY / 2;

    const canvasW = 480;
    const canvasH = 270;

    // Right-side buttons
    if (lx > canvasW * 0.55) {
      if (ly < canvasH * 0.65) return 'jump';
      return 'attack';
    }
    // Left D-pad
    if (lx < canvasW * 0.45) {
      const mid = canvasW * 0.22;
      if (lx < mid) return 'left';
      return 'right';
    }
    return null;
  }

  _handleTouchStart(touch) {
    const zone = this._getTouchZone(touch.clientX, touch.clientY);
    if (!zone) return;
    this._activeTouches.set(touch.identifier, zone);

    if (zone === 'left')   this.keys.left   = true;
    if (zone === 'right')  this.keys.right  = true;
    if (zone === 'jump')   { if (!this.keys.jump)   this._jumpPressed   = true; this.keys.jump   = true; }
    if (zone === 'attack') { if (!this.keys.attack) this._attackPressed = true; this.keys.attack = true; }
  }

  _handleTouchEnd(touch) {
    const zone = this._activeTouches.get(touch.identifier);
    if (!zone) return;
    this._activeTouches.delete(touch.identifier);

    if (zone === 'left')   this.keys.left   = false;
    if (zone === 'right')  this.keys.right  = false;
    if (zone === 'jump')   this.keys.jump   = false;
    if (zone === 'attack') this.keys.attack = false;
  }
}
