# Samurai Frog v2.0 🐸⚔️

2D Side-scrolling Action Platformer — Mobile Web, 100% Offline

## Quick Start

### Option A — Single file (no server needed)
Open `samurai-frog-v2-bundle.html` directly in any browser.

### Option B — ES6 Modules (GitHub Pages / local server)
```bash
npx serve .          # or: python3 -m http.server 8080
# then open http://localhost:8080
```

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move   | ← →      | D-pad (HTML buttons, portrait) |
| Jump   | Space / ↑ | Button A |
| Attack | Z / J / X | Button B |
| Double Jump | Space (in air, after pickup) | A (in air) |

## v2 Changes

### Bug Fixes
- **Portrait layout**: Canvas now fills full screen width via CSS flexbox + `aspect-ratio: 16/9`. No more black bars.
- **Touch zones**: Controls are now HTML `<button>` elements — each button knows exactly what it does. No more coordinate-based zone mapping bugs.
- **Touch target size**: Buttons are 60–84px (responsive), meeting the 44px minimum standard.

### New Features
- **Screen Shake**: Trauma-based camera shake on damage (0.55 trauma) and kills (0.20 trauma). Decays naturally, HUD stays stable.
- **Combo System**: Chain up to 3 attacks within 0.55s for bonus score (+50 on 2-hit, +150 on 3-hit). Combo 3 extends the attack hitbox.
- **Floating Score Text**: Kill and collect events spawn floating "+200", "♥ +1", "DOUBLE JUMP!" text that drifts upward and fades.
- **Particle Bursts**: Coloured particle explosions on kills and power-up collection.
- **Hit-Stop**: 60ms freeze-frame on kills for impactful feel.

## Deploy to GitHub Pages

1. Push the `samurai-frog-v2/` folder contents to a public GitHub repo.
2. Settings → Pages → Source: `main` branch, `/ (root)`.
3. Game live at `https://<username>.github.io/<repo>/`

## Tech Stack

| Item | Details |
|------|---------|
| Renderer | HTML5 Canvas 2D |
| Language | Vanilla JS ES6 Modules |
| Assets | 100% procedural (Canvas API drawing) |
| Audio | Web Audio API synthesis |
| Dependencies | None |
| Build tool | None |
