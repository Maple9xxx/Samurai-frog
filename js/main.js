import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { InputHandler } from './input.js';
import { AudioManager } from './audio.js';
import { PlayScene } from './scenes/playScene.js';
import { GameOverScene } from './scenes/gameOverScene.js';
import { HUD } from './hud.js';
import { Sprite } from './sprite.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('startOverlay');

const sprite = new Sprite();
const hud = new HUD(sprite);

function resizeCanvas() {
  const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
  canvas.width = Math.floor(GAME_WIDTH * dpr);
  canvas.height = Math.floor(GAME_HEIGHT * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);

resizeCanvas();

const input = new InputHandler(canvas);
const audio = new AudioManager();

let scene = null;
let started = false;
let lastTime = 0;

function startGame() {
  overlay.classList.add('hidden');
  started = true;
  const playScene = new PlayScene(input, audio, (score) => {
    scene = new GameOverScene(input, audio, restartGame, score, false);
  }, (score) => {
    scene = new GameOverScene(input, audio, restartGame, score, true);
  });
  scene = playScene;
}

function restartGame() {
  const playScene = new PlayScene(input, audio, (score) => {
    scene = new GameOverScene(input, audio, restartGame, score, false);
  }, (score) => {
    scene = new GameOverScene(input, audio, restartGame, score, true);
  });
  scene = playScene;
}

async function handleFirstInteraction(e) {
  if (!started) {
    await audio.init();
    startGame();
  } else if (scene instanceof GameOverScene) {
    await audio.init();
    restartGame();
  }
}

window.addEventListener('pointerdown', handleFirstInteraction, { once: false });
window.addEventListener('touchstart', handleFirstInteraction, { once: false, passive: true });

function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - lastTime) / 1000 || 0, 0.05);
  lastTime = timestamp;
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (!started) {
    hud.drawStart(ctx);
  } else if (scene) {
    scene.update(deltaTime);
    scene.draw(ctx);
  } else {
    hud.drawStart(ctx);
  }

  input.resetTransient();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
