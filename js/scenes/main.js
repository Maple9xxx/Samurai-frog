// ============================================================
// main.js — Entry point: canvas setup, game loop, scene router
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { InputHandler } from './input.js';
import { AudioManager } from './audio.js';
import { PlayScene }    from './scenes/playScene.js';
import { GameOverScene } from './scenes/gameOverScene.js';
import { HUD }          from './hud.js';

// ── Canvas setup ─────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Render at 2× logical resolution for crisp pixel art
const SCALE = 2;

function resizeCanvas() {
  const fitScale = Math.min(
    window.innerWidth  / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );
  canvas.style.width  = `${GAME_WIDTH  * fitScale}px`;
  canvas.style.height = `${GAME_HEIGHT * fitScale}px`;

  canvas.width  = GAME_WIDTH  * SCALE;
  canvas.height = GAME_HEIGHT * SCALE;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  // Re-apply pixel-perfect settings after resize
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Core systems ─────────────────────────────────────────────

const input = new InputHandler(canvas);
const audio = new AudioManager();
const hud   = new HUD();

// ── Scene state machine ───────────────────────────────────────

// Possible top-level states: 'start' | 'play' | 'gameover' | 'win'
let appState    = 'start';
let currentScene = null;

function startGame() {
  audio.init();
  audio.startBGM();
  currentScene = new PlayScene(
    input, audio,
    onGameOver,
    onWin
  );
  appState = 'play';
}

function onGameOver(score) {
  appState      = 'gameover';
  currentScene  = new GameOverScene(input, audio, score, () => startGame());
}

function onWin(score) {
  // Win is handled inside PlayScene (drawWinScreen), then transitions to start
  // After win delay the PlayScene calls onWin → go to GameOver-style restart
  appState      = 'gameover';
  currentScene  = new GameOverScene(input, audio, score, () => startGame());
}

// ── Game loop ─────────────────────────────────────────────────

let lastTime = 0;

function gameLoop(timestamp) {
  // Cap deltaTime to 50ms (handles tab becoming inactive etc.)
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime  = timestamp;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (appState === 'start') {
    // Draw a static preview behind the start overlay
    _drawStartBackground(ctx);
    hud.update(dt);
    hud.drawStartScreen(ctx);

    // Any input starts the game
    if (input.jumpPressed || input.attackPressed) {
      startGame();
    }
    // Also listen for any touch/click on the canvas itself
  } else {
    currentScene.update(dt);
    currentScene.draw(ctx);
  }

  requestAnimationFrame(gameLoop);
}

// Simple animated background for the start screen
let _startTime = 0;
function _drawStartBackground(ctx) {
  _startTime += 0.016;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  grad.addColorStop(0, '#0D47A1');
  grad.addColorStop(1, '#1B5E20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Scrolling stars
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 37 + _startTime * 8) % GAME_WIDTH);
    const sy = (i * 17) % (GAME_HEIGHT * 0.55);
    const a  = (Math.sin(_startTime * 2 + i) * 0.5 + 0.5) * 0.8;
    ctx.globalAlpha = a;
    ctx.fillStyle   = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ground silhouette
  ctx.fillStyle = '#1B5E20';
  ctx.fillRect(0, GAME_HEIGHT * 0.78, GAME_WIDTH, GAME_HEIGHT * 0.22);
  ctx.fillStyle = '#33691E';
  ctx.fillRect(0, GAME_HEIGHT * 0.75, GAME_WIDTH, 6);
}

// ── Canvas click → start game ─────────────────────────────────

canvas.addEventListener('click', () => {
  if (appState === 'start') startGame();
});
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (appState === 'start') startGame();
}, { passive: false });

// ── Kick off ──────────────────────────────────────────────────

requestAnimationFrame(gameLoop);
