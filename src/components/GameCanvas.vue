<template>
  <canvas
    ref="canvasRef"
    :width="CANVAS_WIDTH"
    :height="CANVAS_HEIGHT"
    class="game-canvas"
    @click="handleClick"
    @contextmenu.prevent="handleRightClick"
    @mousemove="handleMouseMove"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '../composables/useGame';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GRID_COLS, GRID_ROWS, CELL_SIZE,
  GRID_OFFSET_X, GRID_OFFSET_Y,
  PATH_WIDTH, ENEMY_CONFIGS, TOWER_CONFIGS
} from '../types/game';
import { pixelToGrid, gridToPixel } from '../utils/pathUtils';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let lastTime = 0;

const {
  gameState, enemies, towers, projectiles, explosions,
  placeTower, selectTower, selectTowerType, canPlaceTower, update
} = useGame();

const mousePos = ref({ x: 0, y: 0 });
const hoverGrid = ref({ gridX: -1, gridY: -1 });

interface DecoLine {
  points: { x: number; y: number }[];
}
let decoLines: DecoLine[] = [];

function generateDecoLines() {
  decoLines = [];
  for (let i = 0; i < 12; i++) {
    const points: { x: number; y: number }[] = [];
    let x = Math.random() * CANVAS_WIDTH;
    let y = Math.random() * CANVAS_HEIGHT;
    points.push({ x, y });
    for (let j = 0; j < 3; j++) {
      x += (Math.random() - 0.5) * 180;
      y += (Math.random() - 0.5) * 180;
      points.push({ x, y });
    }
    decoLines.push({ points });
  }
}

onMounted(() => {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  
  generateDecoLines();
  lastTime = performance.now();
  gameLoop();
});

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});

function gameLoop() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  update(deltaTime);
  render();
  
  animationId = requestAnimationFrame(gameLoop);
}

function render() {
  if (!ctx) return;
  
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  drawBackground();
  drawGrid();
  drawPath();
  drawTowers();
  drawEnemies();
  drawProjectiles();
  drawExplosions();
  drawPlacementPreview();
}

function drawBackground() {
  if (!ctx) return;
  
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
  
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.08)';
  ctx.lineWidth = 1.5;
  for (const line of decoLines) {
    ctx.beginPath();
    ctx.moveTo(line.points[0].x, line.points[0].y);
    for (let i = 1; i < line.points.length; i++) {
      ctx.lineTo(line.points[i].x, line.points[i].y);
    }
    ctx.stroke();
  }
}

function drawGrid() {
  if (!ctx) return;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= GRID_COLS; x++) {
    const px = GRID_OFFSET_X + x * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(px, GRID_OFFSET_Y);
    ctx.lineTo(px, GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE);
    ctx.stroke();
  }
  
  for (let y = 0; y <= GRID_ROWS; y++) {
    const py = GRID_OFFSET_Y + y * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(GRID_OFFSET_X, py);
    ctx.lineTo(GRID_OFFSET_X + GRID_COLS * CELL_SIZE, py);
    ctx.stroke();
  }
}

function drawPath() {
  if (!ctx) return;
  
  const pathPoints = [
    { x: 0, y: 150 },
    { x: 200, y: 150 },
    { x: 200, y: 350 },
    { x: 400, y: 350 },
    { x: 400, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 450 },
    { x: 800, y: 450 }
  ];
  
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = PATH_WIDTH + 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'destination-over';
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = PATH_WIDTH;
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  }
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(pathPoints[0].x + 2, pathPoints[0].y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('入', pathPoints[0].x + 2, pathPoints[0].y);
  
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(pathPoints[pathPoints.length - 1].x - 2, pathPoints[pathPoints.length - 1].y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('出', pathPoints[pathPoints.length - 1].x - 2, pathPoints[pathPoints.length - 1].y);
}

function drawTowers() {
  if (!ctx) return;
  
  for (const tower of towers) {
    const config = TOWER_CONFIGS[tower.type];
    const size = 40;
    
    if (gameState.selectedTower?.id === tower.id) {
      ctx.strokeStyle = config.color + '80';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = config.color + '10';
      ctx.fill();
    }
    
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    roundRect(ctx, tower.x - size / 2, tower.y - size / 2, size, size, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = config.color;
    
    if (tower.type === 'firewall') {
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (tower.type === 'antivirus') {
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y - 12);
      ctx.lineTo(tower.x + 10, tower.y + 8);
      ctx.lineTo(tower.x - 10, tower.y + 8);
      ctx.closePath();
      ctx.fill();
    } else if (tower.type === 'honeypot') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = tower.x + Math.cos(angle) * 12;
        const py = tower.y + Math.sin(angle) * 12;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (tower.type === 'patch') {
      ctx.fillRect(tower.x - 10, tower.y - 10, 20, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tower.x - 2, tower.y - 10, 4, 20);
      ctx.fillRect(tower.x - 10, tower.y - 2, 20, 4);
    }
    
    if (tower.cooldown > 0 && tower.type !== 'honeypot') {
      const progress = 1 - tower.cooldown / tower.fireRate;
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, size / 2 + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }
  }
}

function drawEnemies() {
  if (!ctx) return;
  
  for (const enemy of enemies) {
    const config = ENEMY_CONFIGS[enemy.type];
    
    ctx.save();
    
    if (enemy.isInvisible) {
      ctx.globalAlpha = 0.35;
    }
    
    if (enemy.slowFactor < 1) {
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
    }
    
    ctx.fillStyle = config.color;
    
    if (enemy.type === 'worm') {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, config.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(enemy.x - 4, enemy.y - 2, 3, 0, Math.PI * 2);
      ctx.arc(enemy.x + 4, enemy.y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'trojan') {
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y - config.size);
      ctx.lineTo(enemy.x - config.size, enemy.y + config.size);
      ctx.lineTo(enemy.x + config.size, enemy.y + config.size);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y + 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.type === 'ddos') {
      ctx.fillRect(enemy.x - config.size, enemy.y - config.size, config.size * 2, config.size * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(enemy.x - 8, enemy.y - 6, 5, 5);
      ctx.fillRect(enemy.x + 3, enemy.y - 6, 5, 5);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x - 8, enemy.y + 6);
      ctx.lineTo(enemy.x + 8, enemy.y + 6);
      ctx.stroke();
    }
    
    ctx.restore();
    
    const hpPercent = enemy.hp / enemy.maxHp;
    const barWidth = config.size * 2;
    const barHeight = 4;
    const barY = enemy.y - config.size - 10;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
    
    ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * hpPercent, barHeight);
  }
}

function drawProjectiles() {
  if (!ctx) return;
  
  for (const proj of projectiles) {
    if (proj.isBeam && proj.beamX !== undefined && proj.beamY !== undefined) {
      ctx.strokeStyle = TOWER_CONFIGS[proj.type].color;
      ctx.lineWidth = 3;
      ctx.shadowColor = TOWER_CONFIGS[proj.type].color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(proj.x, proj.y);
      ctx.lineTo(proj.beamX, proj.beamY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = TOWER_CONFIGS[proj.type].color;
      ctx.shadowColor = TOWER_CONFIGS[proj.type].color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.type === 'patch' ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

function drawExplosions() {
  if (!ctx) return;
  
  for (const exp of explosions) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${exp.alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = `rgba(255, 255, 255, ${exp.alpha * 0.15})`;
    ctx.fill();
  }
}

function drawPlacementPreview() {
  if (!ctx) return;
  if (!gameState.selectedTowerType) return;
  if (hoverGrid.value.gridX < 0 || hoverGrid.value.gridY < 0) return;
  if (hoverGrid.value.gridX >= GRID_COLS || hoverGrid.value.gridY >= GRID_ROWS) return;
  
  const pos = gridToPixel(hoverGrid.value.gridX, hoverGrid.value.gridY);
  const canPlace = canPlaceTower(hoverGrid.value.gridX, hoverGrid.value.gridY);
  const config = TOWER_CONFIGS[gameState.selectedTowerType];
  const canAfford = gameState.gold >= config.cost;
  const isValid = canPlace && canAfford;
  
  const color = isValid ? '#22c55e' : '#ef4444';
  
  ctx.strokeStyle = color + '60';
  ctx.fillStyle = color + '15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, config.range, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  const size = 40;
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = isValid ? config.color : '#ef4444';
  roundRect(ctx, pos.x - size / 2, pos.y - size / 2, size, size, 6);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function handleClick(e: MouseEvent) {
  if (!canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (gameState.selectedTowerType) {
    const { gridX, gridY } = pixelToGrid(x, y);
    if (canPlaceTower(gridX, gridY)) {
      const config = TOWER_CONFIGS[gameState.selectedTowerType];
      if (gameState.gold >= config.cost) {
        placeTower(gridX, gridY);
      }
    }
    return;
  }
  
  for (const tower of towers) {
    const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
    if (dist <= 25) {
      selectTower(tower);
      return;
    }
  }
  
  selectTower(null);
}

function handleRightClick() {
  selectTowerType(null);
  selectTower(null);
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  mousePos.value = { x, y };
  hoverGrid.value = pixelToGrid(x, y);
}
</script>

<style scoped>
.game-canvas {
  display: block;
  cursor: crosshair;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.2);
}
</style>
