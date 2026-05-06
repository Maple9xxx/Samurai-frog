export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

export const COLORS = {
  frog: '#2E7D32',
  frogOutline: '#1B5E20',
  armor: '#C62828',
  gold: '#FFD600',
  cloth: '#757575',
  belt: '#212121',
  blade: '#E0E0E0',
  bladeEdge: '#BDBDBD',
  batBody: '#4A148C',
  batBelly: '#7B1FA2',
  batWing: '#6A1B9A',
  batFrame: '#311B92',
  batEye: '#FF1744',
  slime: '#76FF03',
  slimeBorder: '#33691E',
  babySlime: '#B2FF59',
  babyBorder: '#558B2F',
  fish: '#FFD600',
  fishFin: '#FF6D00',
  jade: '#00E676',
  jadeBorder: '#00C853',
  ground: '#5D4037',
  moss: '#558B2F',
  bamboo: '#827717',
  spike: '#B71C1C',
  spikeEdge: '#7F0000',
  sky: '#A7D8FF',
  cloud: '#FFFFFF',
  mountain: '#81C784',
  mountainSnow: '#FFFFFF'
};

export const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  JUMP: 'Space',
  ATTACK_1: 'KeyZ',
  ATTACK_2: 'KeyJ'
};

export const PLAYER = {
  width: 20,
  height: 36,
  moveSpeed: 140,
  jumpSpeed: 380,
  gravity: 1200,
  maxFallSpeed: 500,
  maxHP: 3,
  invincibleTime: 1.5
};

export const LEVEL = {
  width: 6000,
  height: 270,
  groundY: 220
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
