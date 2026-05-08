// ============================================================
// main.js — Entry point: canvas setup, game loop, scene router
// v2: Portrait-first responsive layout, HTML controls
// ============================================================

import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { InputHandler }  from './input.js';
import { AudioManager }  from './audio.js';
import { PlayScene }     from './scenes/playScene.js';
import { GameOverScene } from './scenes/gameOverScene.js';
import { HUD }           from './hud.js';

// ── Canvas setup ─────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const SCALE  = 2; // render 2× for crispness

function resizeCanvas() {
  // Logical game resolution stays 480×270
  canvas.width  = GAME_WIDTH  * SCALE;
  canvas.height = GAME_HEIGHT * SCALE;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // CSS sizing is handled entirely by style.css flex rules
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
  setTimeout(resizeCanvas, 100); // slight delay for browser reflow
});
resizeCanvas();

// ── Core systems ──────────────────────────────────────────────

const input = new InputHandler(canvas);
const audio = new AudioManager();
const hud   = new HUD();

// ── Scene state machine ───────────────────────────────────────

let appState     = 'start';
let currentScene = null;
let _startTime   = 0;

function startGame() {
  audio.init();
  audio.startBGM();
  currentScene = new PlayScene(input, audio, onGameOver, onWin);
  appState = 'play';
}

function onGameOver(score) {
  appState     = 'gameover';
  currentScene = new GameOverScene(input, audio, score, () => startGame());
}

function onWin(score) {
  appState     = 'gameover';
  currentScene = new GameOverScene(input, audio, score, () => startGame());
}

// ── Start-screen background ───────────────────────────────────

function drawStartBackground(dt) {
  _startTime += dt;

  const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  grad.addColorStop(0, '#0D47A1');
  grad.addColorStop(1, '#1B5E20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Drifting stars
  for (let i = 0; i < 35; i++) {
    const sx = ((i * 37 + _startTime * 10) % GAME_WIDTH);
    const sy = (i * 19) % (GAME_HEIGHT * 0.6);
    const a  = (Math.sin(_startTime * 2 + i) * 0.5 + 0.5) * 0.9;
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
  ctx.fillRect(0, GAME_HEIGHT * 0.75, GAME_WIDTH, 5);
}

// ── Game loop ─────────────────────────────────────────────────

let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime  = timestamp;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (appState === 'start') {
    drawStartBackground(dt);
    hud.update(dt);
    hud.drawStartScreen(ctx);

    if (input.jumpPressed || input.attackPressed) startGame();

  } else if (currentScene) {
    currentScene.update(dt);
    currentScene.draw(ctx);
  }

  requestAnimationFrame(gameLoop);
}

// ── One-shot start triggers ───────────────────────────────────

// Canvas click (PC)
canvas.addEventListener('click', () => {
  if (appState === 'start') startGame();
});

// Any HTML button tap also starts the game
document.getElementById('controls')?.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (appState === 'start') startGame();
}, { passive: false });

requestAnimationFrame(gameLoop);
