export type EnemyType = "worm" | "trojan" | "ddos";

export type TowerType = "firewall" | "antivirus" | "honeypot" | "patch";

export interface Point {
  x: number;
  y: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  pathProgress: number;
  isInvisible: boolean;
  invisibleTimer: number;
  invisibleCooldown: number;
  slowTimer: number;
  slowFactor: number;
  reachedEnd: boolean;
}

export interface Tower {
  id: number;
  type: TowerType;
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  range: number;
  damage: number;
  fireRate: number;
  cooldown: number;
  lastTrigger: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  speed: number;
  damage: number;
  type: TowerType;
  isBeam?: boolean;
  beamTimer?: number;
  beamX?: number;
  beamY?: number;
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export interface WaveConfig {
  wave: number;
  worms: number;
  trojans: number;
  ddos: number;
}

export interface GameState {
  gold: number;
  lives: number;
  currentWave: number;
  totalWaves: number;
  isWaveActive: boolean;
  isPreparing: boolean;
  prepareTime: number;
  gameOver: boolean;
  victory: boolean;
  gameSpeed: number;
  totalKills: number;
  selectedTowerType: TowerType | null;
  selectedTower: Tower | null;
}

export const GRID_COLS = 12;
export const GRID_ROWS = 9;
export const CELL_SIZE = 60;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRID_OFFSET_X = 40;
export const GRID_OFFSET_Y = 30;

export const PATH_WIDTH = 30;

export const ENEMY_CONFIGS: Record<
  EnemyType,
  {
    hp: number;
    speed: number;
    color: string;
    size: number;
    gold: number;
    lifeDamage: number;
  }
> = {
  worm: {
    hp: 50,
    speed: 3,
    color: "#22c55e",
    size: 12,
    gold: 10,
    lifeDamage: 1,
  },
  trojan: {
    hp: 120,
    speed: 2,
    color: "#a855f7",
    size: 14,
    gold: 20,
    lifeDamage: 2,
  },
  ddos: {
    hp: 300,
    speed: 1,
    color: "#ef4444",
    size: 22,
    gold: 50,
    lifeDamage: 5,
  },
};

export const TOWER_CONFIGS: Record<
  TowerType,
  {
    name: string;
    cost: number;
    range: number;
    damage: number;
    fireRate: number;
    color: string;
    description: string;
  }
> = {
  firewall: {
    name: "防火墙塔",
    cost: 50,
    range: 150,
    damage: 10,
    fireRate: 0.5,
    color: "#3b82f6",
    description: "射速快，单体攻击",
  },
  antivirus: {
    name: "杀毒塔",
    cost: 80,
    range: 200,
    damage: 25,
    fireRate: 1,
    color: "#10b981",
    description: "激光束，高伤害",
  },
  honeypot: {
    name: "蜜罐塔",
    cost: 60,
    range: 120,
    damage: 0,
    fireRate: 5,
    color: "#eab308",
    description: "减速敌人50%，持续3秒",
  },
  patch: {
    name: "补丁塔",
    cost: 120,
    range: 250,
    damage: 50,
    fireRate: 2,
    color: "#f8fafc",
    description: "范围爆炸伤害",
  },
};

export const WAVE_CONFIGS: WaveConfig[] = [
  { wave: 1, worms: 8, trojans: 0, ddos: 0 },
  { wave: 2, worms: 12, trojans: 0, ddos: 0 },
  { wave: 3, worms: 16, trojans: 0, ddos: 0 },
  { wave: 4, worms: 10, trojans: 4, ddos: 0 },
  { wave: 5, worms: 12, trojans: 6, ddos: 0 },
  { wave: 6, worms: 10, trojans: 8, ddos: 0 },
  { wave: 7, worms: 8, trojans: 6, ddos: 2 },
  { wave: 8, worms: 10, trojans: 8, ddos: 3 },
  { wave: 9, worms: 12, trojans: 10, ddos: 4 },
  { wave: 10, worms: 15, trojans: 12, ddos: 6 },
];

export const INITIAL_GOLD = 200;
export const INITIAL_LIVES = 20;
export const PREPARE_TIME = 15;
export const EXPLOSION_RADIUS = 80;
export const TOTAL_WAVES = WAVE_CONFIGS.length;
