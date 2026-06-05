<template>
  <div class="game-container">
    <h1 class="game-title">🔒 网络安全塔防 🔒</h1>
    
    <TopBar />
    
    <div class="game-main">
      <TowerPanel />
      
      <div class="canvas-wrapper">
        <GameCanvas />
        <GameOverlay />
      </div>
      
      <TowerInfo />
    </div>
    
    <div class="enemy-legend">
      <div class="legend-item">
        <span class="legend-dot worm"></span>
        <span>蠕虫 - 速度快、血量低</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot trojan"></span>
        <span>木马 - 会隐身、中等属性</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot ddos"></span>
        <span>DDoS - 速度慢、血量高</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from './components/TopBar.vue';
import TowerPanel from './components/TowerPanel.vue';
import GameCanvas from './components/GameCanvas.vue';
import TowerInfo from './components/TowerInfo.vue';
import GameOverlay from './components/GameOverlay.vue';
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.game-title {
  font-size: 28px;
  color: #38bdf8;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
  letter-spacing: 4px;
  margin-bottom: 4px;
}

.game-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.canvas-wrapper {
  position: relative;
}

.enemy-legend {
  display: flex;
  gap: 24px;
  padding: 12px 24px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border: 1px solid #334155;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.legend-dot.worm {
  background: #22c55e;
}

.legend-dot.trojan {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 14px solid #a855f7;
  border-radius: 0;
  background: transparent;
}

.legend-dot.ddos {
  background: #ef4444;
  border-radius: 2px;
}
</style>
