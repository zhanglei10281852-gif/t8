import { reactive, computed } from "vue";
import type {
  GameState,
  Enemy,
  Tower,
  Projectile,
  Explosion,
  EnemyType,
  TowerType,
  WaveConfig,
} from "../types/game";
import {
  INITIAL_GOLD,
  INITIAL_LIVES,
  PREPARE_TIME,
  TOTAL_WAVES,
  ENEMY_CONFIGS,
  TOWER_CONFIGS,
  WAVE_CONFIGS,
  GRID_COLS,
  GRID_ROWS,
  EXPLOSION_RADIUS,
} from "../types/game";
import {
  getPositionOnPath,
  gridToPixel,
  isGridCellOnPath,
  distance,
} from "../utils/pathUtils";

let enemyIdCounter = 0;
let towerIdCounter = 0;
let projectileIdCounter = 0;
let explosionIdCounter = 0;

const gameState = reactive<GameState>({
  gold: INITIAL_GOLD,
  lives: INITIAL_LIVES,
  currentWave: 0,
  totalWaves: WAVE_CONFIGS.length,
  isWaveActive: false,
  isPreparing: true,
  prepareTime: PREPARE_TIME,
  gameOver: false,
  victory: false,
  gameSpeed: 1,
  totalKills: 0,
  selectedTowerType: null,
  selectedTower: null,
});

const enemies: Enemy[] = reactive([]);
const towers: Tower[] = reactive([]);
const projectiles: Projectile[] = reactive([]);
const explosions: Explosion[] = reactive([]);

let spawnQueue: { type: EnemyType; delay: number }[] = [];
let spawnTimer = 0;

export function useGame() {
  const score = computed(() => {
    return gameState.totalKills * 10 + gameState.lives * 50;
  });

  const currentWaveConfig = computed((): WaveConfig | null => {
    if (gameState.currentWave === 0) return null;
    return WAVE_CONFIGS[gameState.currentWave - 1] || null;
  });

  const nextWaveConfig = computed((): WaveConfig | null => {
    const nextWave = gameState.currentWave + 1;
    if (nextWave > WAVE_CONFIGS.length) return null;
    return WAVE_CONFIGS[nextWave - 1];
  });

  function canPlaceTower(gridX: number, gridY: number): boolean {
    if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS)
      return false;
    if (isGridCellOnPath(gridX, gridY)) return false;
    return !towers.some((t) => t.gridX === gridX && t.gridY === gridY);
  }

  function selectTowerType(type: TowerType | null) {
    gameState.selectedTowerType = type;
    gameState.selectedTower = null;
  }

  function selectTower(tower: Tower | null) {
    gameState.selectedTower = tower;
    gameState.selectedTowerType = null;
  }

  function placeTower(gridX: number, gridY: number): boolean {
    if (!gameState.selectedTowerType) return false;
    if (!canPlaceTower(gridX, gridY)) return false;

    const config = TOWER_CONFIGS[gameState.selectedTowerType];
    if (gameState.gold < config.cost) return false;

    const pos = gridToPixel(gridX, gridY);
    const tower: Tower = {
      id: ++towerIdCounter,
      type: gameState.selectedTowerType,
      gridX,
      gridY,
      x: pos.x,
      y: pos.y,
      range: config.range,
      damage: config.damage,
      fireRate: config.fireRate,
      cooldown: 0,
      lastTrigger: 0,
    };

    towers.push(tower);
    gameState.gold -= config.cost;
    return true;
  }

  function startNextWave() {
    if (gameState.isWaveActive || gameState.gameOver || gameState.victory)
      return;
    if (gameState.currentWave >= WAVE_CONFIGS.length) return;

    gameState.currentWave++;
    gameState.isWaveActive = true;
    gameState.isPreparing = false;

    const waveConfig = WAVE_CONFIGS[gameState.currentWave - 1];
    spawnQueue = [];
    spawnTimer = 0;

    let delay = 0;
    for (let i = 0; i < waveConfig.worms; i++) {
      spawnQueue.push({ type: "worm", delay });
      delay += 0.8;
    }
    for (let i = 0; i < waveConfig.trojans; i++) {
      spawnQueue.push({ type: "trojan", delay });
      delay += 1.2;
    }
    for (let i = 0; i < waveConfig.ddos; i++) {
      spawnQueue.push({ type: "ddos", delay });
      delay += 2;
    }
  }

  function spawnEnemy(type: EnemyType) {
    const config = ENEMY_CONFIGS[type];
    const startPos = getPositionOnPath(0);

    const enemy: Enemy = {
      id: ++enemyIdCounter,
      type,
      x: startPos.x,
      y: startPos.y,
      hp: config.hp,
      maxHp: config.hp,
      speed: config.speed,
      pathIndex: 0,
      pathProgress: 0,
      isInvisible: false,
      invisibleTimer: 0,
      invisibleCooldown: type === "trojan" ? 3 : 0,
      slowTimer: 0,
      slowFactor: 1,
      reachedEnd: false,
    };

    enemies.push(enemy);
  }

  function update(deltaTime: number) {
    if (gameState.gameOver || gameState.victory) return;

    const dt = deltaTime * gameState.gameSpeed;

    if (gameState.isPreparing) {
      gameState.prepareTime -= dt;
      if (gameState.prepareTime <= 0) {
        startNextWave();
      }
      return;
    }

    if (gameState.isWaveActive && spawnQueue.length > 0) {
      spawnTimer += dt;
      while (spawnQueue.length > 0 && spawnTimer >= spawnQueue[0].delay) {
        const spawn = spawnQueue.shift()!;
        spawnEnemy(spawn.type);
      }
    }

    updateEnemies(dt);
    updateTowers(dt);
    updateProjectiles(dt);
    updateExplosions(dt);

    if (
      gameState.isWaveActive &&
      spawnQueue.length === 0 &&
      enemies.length === 0
    ) {
      gameState.isWaveActive = false;

      if (gameState.currentWave >= WAVE_CONFIGS.length) {
        gameState.victory = true;
      } else {
        gameState.isPreparing = true;
        gameState.prepareTime = PREPARE_TIME;
      }
    }

    if (gameState.lives <= 0) {
      gameState.gameOver = true;
      gameState.lives = 0;
    }
  }

  function updateEnemies(dt: number) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const config = ENEMY_CONFIGS[enemy.type];

      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= dt;
        if (enemy.slowTimer <= 0) {
          enemy.slowFactor = 1;
        }
      }

      if (enemy.type === "trojan") {
        if (enemy.isInvisible) {
          enemy.invisibleTimer -= dt;
          if (enemy.invisibleTimer <= 0) {
            enemy.isInvisible = false;
            enemy.invisibleCooldown = 3;
          }
        } else {
          enemy.invisibleCooldown -= dt;
          if (enemy.invisibleCooldown <= 0) {
            enemy.isInvisible = true;
            enemy.invisibleTimer = 2;
          }
        }
      }

      const speed = config.speed * enemy.slowFactor;
      const pathLength = getPathLengthEstimate();
      enemy.pathProgress += (speed * dt * 60) / pathLength;

      if (enemy.pathProgress >= 1) {
        gameState.lives -= config.lifeDamage;
        enemies.splice(i, 1);
        continue;
      }

      const pos = getPositionOnPath(enemy.pathProgress);
      enemy.x = pos.x;
      enemy.y = pos.y;

      if (enemy.hp <= 0) {
        gameState.gold += config.gold;
        gameState.totalKills++;
        enemies.splice(i, 1);
      }
    }
  }

  function getPathLengthEstimate(): number {
    let length = 0;
    const points = [
      { x: 0, y: 150 },
      { x: 200, y: 150 },
      { x: 200, y: 350 },
      { x: 400, y: 350 },
      { x: 400, y: 100 },
      { x: 600, y: 100 },
      { x: 600, y: 450 },
      { x: 800, y: 450 },
    ];
    for (let i = 0; i < points.length - 1; i++) {
      length += Math.sqrt(
        (points[i + 1].x - points[i].x) ** 2 +
          (points[i + 1].y - points[i].y) ** 2,
      );
    }
    return length;
  }

  function updateTowers(dt: number) {
    for (const tower of towers) {
      tower.cooldown -= dt;

      if (tower.type === "honeypot") {
        if (tower.cooldown <= 0) {
          const enemiesInRange = enemies.filter(
            (e) =>
              !e.reachedEnd &&
              distance({ x: tower.x, y: tower.y }, { x: e.x, y: e.y }) <=
                tower.range,
          );

          if (enemiesInRange.length > 0) {
            for (const enemy of enemiesInRange) {
              enemy.slowFactor = 0.5;
              enemy.slowTimer = 3;
            }
            tower.cooldown = tower.fireRate;
          }
        }
        continue;
      }

      if (tower.cooldown > 0) continue;

      const target = findTarget(tower);
      if (!target) continue;

      tower.cooldown = tower.fireRate;

      if (tower.type === "antivirus") {
        target.hp -= tower.damage;
        projectiles.push({
          id: ++projectileIdCounter,
          x: tower.x,
          y: tower.y,
          targetId: target.id,
          speed: 0,
          damage: tower.damage,
          type: tower.type,
          isBeam: true,
          beamTimer: 0.15,
          beamX: target.x,
          beamY: target.y,
        });
      } else if (tower.type === "patch") {
        projectiles.push({
          id: ++projectileIdCounter,
          x: tower.x,
          y: tower.y,
          targetId: target.id,
          speed: 400,
          damage: tower.damage,
          type: tower.type,
        });
      } else {
        projectiles.push({
          id: ++projectileIdCounter,
          x: tower.x,
          y: tower.y,
          targetId: target.id,
          speed: 300,
          damage: tower.damage,
          type: tower.type,
        });
      }
    }
  }

  function findTarget(tower: Tower): Enemy | null {
    let bestTarget: Enemy | null = null;
    let bestProgress = -1;

    for (const enemy of enemies) {
      if (enemy.reachedEnd) continue;
      if (enemy.isInvisible && tower.type !== "antivirus") continue;

      const dist = distance(
        { x: tower.x, y: tower.y },
        { x: enemy.x, y: enemy.y },
      );
      if (dist <= tower.range) {
        if (enemy.pathProgress > bestProgress) {
          bestProgress = enemy.pathProgress;
          bestTarget = enemy;
        }
      }
    }

    return bestTarget;
  }

  function updateProjectiles(dt: number) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];

      if (proj.isBeam) {
        proj.beamTimer! -= dt;
        if (proj.beamTimer! <= 0) {
          projectiles.splice(i, 1);
        }
        continue;
      }

      const target = enemies.find((e) => e.id === proj.targetId);

      if (!target || target.reachedEnd) {
        projectiles.splice(i, 1);
        continue;
      }

      const dx = target.x - proj.x;
      const dy = target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10) {
        if (proj.type === "patch") {
          createExplosion(target.x, target.y);
          for (const enemy of enemies) {
            if (enemy.reachedEnd) continue;
            const d = distance(
              { x: target.x, y: target.y },
              { x: enemy.x, y: enemy.y },
            );
            if (d <= EXPLOSION_RADIUS) {
              enemy.hp -= proj.damage;
            }
          }
        } else {
          target.hp -= proj.damage;
        }
        projectiles.splice(i, 1);
        continue;
      }

      const moveSpeed = proj.speed * dt;
      proj.x += (dx / dist) * moveSpeed;
      proj.y += (dy / dist) * moveSpeed;
    }
  }

  function createExplosion(x: number, y: number) {
    explosions.push({
      id: ++explosionIdCounter,
      x,
      y,
      radius: 0,
      maxRadius: EXPLOSION_RADIUS,
      alpha: 1,
    });
  }

  function updateExplosions(dt: number) {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.radius += 200 * dt;
      exp.alpha -= dt * 2;

      if (exp.alpha <= 0 || exp.radius >= exp.maxRadius) {
        explosions.splice(i, 1);
      }
    }
  }

  function setGameSpeed(speed: number) {
    gameState.gameSpeed = speed;
  }

  function resetGame() {
    gameState.gold = INITIAL_GOLD;
    gameState.lives = INITIAL_LIVES;
    gameState.currentWave = 0;
    gameState.isWaveActive = false;
    gameState.isPreparing = true;
    gameState.prepareTime = PREPARE_TIME;
    gameState.gameOver = false;
    gameState.victory = false;
    gameState.gameSpeed = 1;
    gameState.totalKills = 0;
    gameState.selectedTowerType = null;
    gameState.selectedTower = null;

    enemies.length = 0;
    towers.length = 0;
    projectiles.length = 0;
    explosions.length = 0;
    spawnQueue = [];
    spawnTimer = 0;

    enemyIdCounter = 0;
    towerIdCounter = 0;
    projectileIdCounter = 0;
    explosionIdCounter = 0;
  }

  return {
    gameState,
    enemies,
    towers,
    projectiles,
    explosions,
    score,
    currentWaveConfig,
    nextWaveConfig,
    canPlaceTower,
    selectTowerType,
    selectTower,
    placeTower,
    startNextWave,
    update,
    setGameSpeed,
    resetGame,
  };
}
