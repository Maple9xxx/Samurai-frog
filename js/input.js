export class InputHandler {
  constructor(canvas) {
    this.keys = { left: false, right: false, jump: false, attack: false };
    this.justPressed = { jump: false, attack: false };
    this.canvas = canvas;
    this.touchPointers = new Map();
    this._bindKeyboard();
    this._bindTouch();
  }

  _setKey(action, isDown) {
    if (action === 'jump' || action === 'attack') {
      if (isDown && !this.keys[action]) {
        this.justPressed[action] = true;
      }
    }
    this.keys[action] = isDown;
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (['ArrowLeft', 'ArrowRight', 'Space', 'KeyZ', 'KeyJ'].includes(code)) e.preventDefault();
      if (code === 'ArrowLeft') this._setKey('left', true);
      if (code === 'ArrowRight') this._setKey('right', true);
      if (code === 'Space') this._setKey('jump', true);
      if (code === 'KeyZ' || code === 'KeyJ') this._setKey('attack', true);
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'ArrowLeft') this._setKey('left', false);
      if (code === 'ArrowRight') this._setKey('right', false);
      if (code === 'Space') this._setKey('jump', false);
      if (code === 'KeyZ' || code === 'KeyJ') this._setKey('attack', false);
    });
  }

  _regionFromPoint(x, y) {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    const leftZone = x < w * 0.42;
    const topHalf = y < h * 0.6;
    if (leftZone) {
      return x < w * 0.2 ? 'left' : 'right';
    }
    if (topHalf) return 'jump';
    return 'attack';
  }

  _bindTouch() {
    const handleStart = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        const x = (t.clientX - rect.left) * (this.canvas.width / rect.width) / (window.devicePixelRatio || 1);
        const y = (t.clientY - rect.top) * (this.canvas.height / rect.height) / (window.devicePixelRatio || 1);
        const region = this._regionFromPoint(x, y);
        this.touchPointers.set(t.identifier, region);
        if (region === 'left') this._setKey('left', true);
        if (region === 'right') this._setKey('right', true);
        if (region === 'jump') this._setKey('jump', true);
        if (region === 'attack') this._setKey('attack', true);
      }
    };

    const handleMove = (e) => {
      e.preventDefault();
    };

    const handleEnd = (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const region = this.touchPointers.get(t.identifier);
        if (!region) continue;
        if (region === 'left') this._setKey('left', false);
        if (region === 'right') this._setKey('right', false);
        if (region === 'jump') this._setKey('jump', false);
        if (region === 'attack') this._setKey('attack', false);
        this.touchPointers.delete(t.identifier);
      }
    };

    this.canvas.addEventListener('touchstart', handleStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleMove, { passive: false });
    this.canvas.addEventListener('touchend', handleEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleEnd, { passive: false });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width) / (window.devicePixelRatio || 1);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height) / (window.devicePixelRatio || 1);
      const region = this._regionFromPoint(x, y);
      this.touchPointers.set(e.pointerId, region);
      if (region === 'left') this._setKey('left', true);
      if (region === 'right') this._setKey('right', true);
      if (region === 'jump') this._setKey('jump', true);
      if (region === 'attack') this._setKey('attack', true);
    }, { passive: false });

    this.canvas.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return;
      const region = this.touchPointers.get(e.pointerId);
      if (region === 'left') this._setKey('left', false);
      if (region === 'right') this._setKey('right', false);
      if (region === 'jump') this._setKey('jump', false);
      if (region === 'attack') this._setKey('attack', false);
      this.touchPointers.delete(e.pointerId);
    });
    this.canvas.addEventListener('pointercancel', (e) => {
      if (e.pointerType !== 'touch') return;
      const region = this.touchPointers.get(e.pointerId);
      if (region === 'left') this._setKey('left', false);
      if (region === 'right') this._setKey('right', false);
      if (region === 'jump') this._setKey('jump', false);
      if (region === 'attack') this._setKey('attack', false);
      this.touchPointers.delete(e.pointerId);
    });
  }

  consumePressed(action) {
    const pressed = this.justPressed[action];
    this.justPressed[action] = false;
    return pressed;
  }

  resetTransient() {
    this.justPressed.jump = false;
    this.justPressed.attack = false;
  }
}
