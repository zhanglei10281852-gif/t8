<template>
  <div class="top-bar">
    <div class="stat-item">
      <span class="label">波次</span>
      <span class="value wave">{{ gameState.currentWave }}/{{ gameState.totalWaves }}</span>
    </div>
    
    <div class="stat-item">
      <span class="label">金币</span>
      <span class="value gold">💰 {{ gameState.gold }}</span>
    </div>
    
    <div class="stat-item">
      <span class="label">生命</span>
      <span class="value lives">❤️ {{ gameState.lives }}</span>
    </div>
    
    <div class="stat-item prepare" v-if="gameState.isPreparing && !gameState.gameOver && !gameState.victory">
      <span class="label">准备时间</span>
      <span class="value countdown">{{ Math.ceil(gameState.prepareTime) }}s</span>
      <button class="start-btn" @click="startNow">立即开始</button>
    </div>

    <div class="stat-item wave-info" v-if="nextWaveConfig && gameState.isPreparing">
      <span class="label">下一波</span>
      <span class="value">
        <span v-if="nextWaveConfig.worms > 0" class="worm-count">蠕虫×{{ nextWaveConfig.worms }}</span>
        <span v-if="nextWaveConfig.trojans > 0" class="trojan-count">木马×{{ nextWaveConfig.trojans }}</span>
        <span v-if="nextWaveConfig.ddos > 0" class="ddos-count">DDoS×{{ nextWaveConfig.ddos }}</span>
      </span>
    </div>
    
    <div class="speed-controls">
      <span class="label">速度</span>
      <button 
        v-for="speed in [1, 2]" 
        :key="speed"
        :class="['speed-btn', { active: gameState.gameSpeed === speed }]"
        @click="setGameSpeed(speed)"
      >
        {{ speed }}x
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGame } from '../composables/useGame';

const { gameState, nextWaveConfig, setGameSpeed, startNextWave } = useGame();

function startNow() {
  startNextWave();
}
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 8px;
  border: 1px solid #334155;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  font-size: 20px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.wave {
  color: #38bdf8;
}

.gold {
  color: #fbbf24;
}

.lives {
  color: #f87171;
}

.countdown {
  color: #22c55e;
}

.prepare {
  align-items: center;
  flex-direction: row;
  gap: 12px;
}

.start-btn {
  padding: 6px 14px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s;
}

.start-btn:hover {
  background: #16a34a;
  transform: translateY(-1px);
}

.wave-info .value {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.worm-count {
  color: #22c55e;
}

.trojan-count {
  color: #a855f7;
}

.ddos-count {
  color: #ef4444;
}

.speed-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.speed-btn {
  padding: 6px 12px;
  background: #334155;
  color: #94a3b8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s;
}

.speed-btn:hover {
  background: #475569;
}

.speed-btn.active {
  background: #3b82f6;
  color: white;
}
</style>
