import { LEVEL } from './constants.js';

export class Level {
  constructor() {
    this.width = LEVEL.width;
    this.height = LEVEL.height;
    this.groundY = LEVEL.groundY;
    this.tileSize = 32;
    this.platforms = [
      { x: 600, y: 160, w: 200, h: 16 },
      { x: 1200, y: 130, w: 150, h: 16 },
      { x: 1900, y: 140, w: 180, h: 16 },
      { x: 2600, y: 120, w: 200, h: 16 },
      { x: 3200, y: 150, w: 160, h: 16 },
      { x: 4000, y: 140, w: 200, h: 16 },
      { x: 4700, y: 160, w: 180, h: 16 },
      { x: 5400, y: 130, w: 200, h: 16 }
    ];
    this.spikes = [
      { x: 1800, w: 50, y: this.groundY, h: 16 },
      { x: 3400, w: 50, y: this.groundY, h: 16 },
      { x: 4400, w: 50, y: this.groundY, h: 16 }
    ];
    this.goal = { x: 5800, y: this.groundY, w: 100, h: 100 };
    this.enemyData = [
      { type: 'Bat', x: 700, y: 150 },
      { type: 'SlimeEgg', x: 900, y: 205 },
      { type: 'Bat', x: 1400, y: 140 },
      { type: 'SlimeEgg', x: 1700, y: 200 },
      { type: 'Bat', x: 2300, y: 120 },
      { type: 'Bat', x: 2800, y: 110 },
      { type: 'SlimeEgg', x: 3100, y: 200 },
      { type: 'Bat', x: 3600, y: 150 },
      { type: 'SlimeEgg', x: 4100, y: 205 },
      { type: 'Bat', x: 4500, y: 160 },
      { type: 'Bat', x: 5000, y: 140 },
      { type: 'SlimeEgg', x: 5200, y: 210 }
    ];
    this.itemData = [
      { type: 'JadeOrb', x: 500, y: 200 },
      { type: 'JadeOrb', x: 800, y: 190 },
      { type: 'Goldfish', x: 1100, y: 210 },
      { type: 'JadeOrb', x: 1300, y: 200 },
      { type: 'JadeOrb', x: 1600, y: 190 },
      { type: 'Goldfish', x: 2000, y: 210 },
      { type: 'HiddenPower', x: 2500, y: 110 },
      { type: 'JadeOrb', x: 2900, y: 190 },
      { type: 'Goldfish', x: 3300, y: 210 },
      { type: 'JadeOrb', x: 3700, y: 200 },
      { type: 'JadeOrb', x: 4300, y: 190 },
      { type: 'Goldfish', x: 4800, y: 210 },
      { type: 'JadeOrb', x: 5100, y: 200 },
      { type: 'JadeOrb', x: 5500, y: 190 }
    ];
  }

  getSolidRects() {
    return [
      { x: 0, y: this.groundY, w: this.width, h: this.height - this.groundY },
      ...this.platforms.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }))
    ];
  }
}
