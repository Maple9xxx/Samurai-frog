// ============================================================
// constants.js — Global game constants
// ============================================================

export const GAME_WIDTH  = 480;
export const GAME_HEIGHT = 270;

export const GRAVITY          = 1200; // px/s²
export const MAX_FALL_SPEED   = 500;  // px/s
export const PLAYER_SPEED     = 140;  // px/s
export const JUMP_FORCE       = -380; // px/s
export const DOUBLE_JUMP_FORCE = -320; // slightly weaker second jump

export const PLAYER_W = 20;
export const PLAYER_H = 36;

export const INVINCIBILITY_TIME = 1.5; // seconds
export const ATTACK_DURATION    = 0.24; // seconds (4 frames × 60ms)
export const ATTACK_HITBOX_W    = 40;
export const ATTACK_HITBOX_H    = 28;

export const LEVEL_WIDTH  = 6000;
export const LEVEL_HEIGHT = 270;
export const GROUND_Y     = 220; // top of ground

export const TILE_SIZE = 32;

// Player states
export const STATE = {
  IDLE:        'IDLE',
  RUNNING:     'RUNNING',
  JUMPING:     'JUMPING',
  FALLING:     'FALLING',
  DOUBLE_JUMP: 'DOUBLE_JUMP',
  ATTACKING:   'ATTACKING',
  HURT:        'HURT',
  DEAD:        'DEAD',
};

// Scores
export const SCORE = {
  BAT:       200,
  SLIME_EGG: 100,
  BABY_SLIME: 50,
  JADE_ORB:  100,
  GOLDFISH:   50,
};

// Colors
export const COLOR = {
  FROG_GREEN:   '#2E7D32',
  FROG_DARK:    '#1B5E20',
  ARMOR_RED:    '#C62828',
  GOLD:         '#FFD600',
  CLOTH_GRAY:   '#757575',
  CLOTH_DARK:   '#424242',
  BELT_BLACK:   '#212121',
  BLADE_SILVER: '#E0E0E0',
  BLADE_DARK:   '#BDBDBD',
  EYE_WHITE:    '#FFFFFF',
  PUPIL_BLACK:  '#000000',
  MOUTH_PINK:   '#FFCDD2',
  MOUTH_DARK:   '#E57373',

  BAT_BODY:     '#4A148C',
  BAT_BELLY:    '#7B1FA2',
  BAT_WING:     '#6A1B9A',
  BAT_WING_RIM: '#311B92',
  BAT_EYE:      '#FF1744',

  SLIME_GREEN:  '#76FF03',
  SLIME_BORDER: '#33691E',
  BABY_GREEN:   '#B2FF59',
  BABY_BORDER:  '#558B2F',

  GOLD_FISH:    '#FFD600',
  FISH_FIN:     '#FF6D00',
  FISH_BELLY:   '#FFAB00',

  JADE:         '#00E676',
  JADE_BORDER:  '#00C853',

  POWER:        '#FF6D00',
  POWER_BORDER: '#E65100',

  GROUND:       '#5D4037',
  GROUND_STONE: '#795548',
  GROUND_MOSS:  '#558B2F',
  GRASS:        '#33691E',

  BAMBOO:       '#827717',
  BAMBOO_NODE:  '#9E9D24',

  SPIKE:        '#B71C1C',
  SPIKE_DARK:   '#7F0000',

  SKY_NEAR:     '#B2DFDB',
  SKY_FAR:      '#E0F2F1',
  MOUNTAIN:     '#81C784',
  CLOUD:        '#FFFFFF',
  TREE_DARK:    '#2E7D32',
  TREE_MID:     '#388E3C',
  BUSH:         '#388E3C',
  GRASS_NEAR:   '#558B2F',
};
