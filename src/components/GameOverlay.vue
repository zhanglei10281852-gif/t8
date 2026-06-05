<template>
  <div v-if="gameState.gameOver || gameState.victory" class="overlay">
    <div class="modal" :class="{ victory: gameState.victory, defeat: gameState.gameOver }">
      <div class="title">
        <span v-if="gameState.victory">🎉 网络安全！</span>
        <span v-else>💀 网络沦陷</span>
      </div>
      
      <div class="stats">
        <div class="stat-row">
          <span class="stat-label">坚持波次</span>
          <span class="stat-value">{{ gameState.currentWave }}/{{ gameState.totalWaves }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">击杀总数</span>
          <span class="stat-value">{{ gameState.totalKills }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">剩余生命</span>
          <span class="stat-value">{{ gameState.lives }}</span>
        </div>
        <div class="stat-row total">
          <span class="stat-label">最终得分</span>
          <span class="stat-value">{{ score }}</span>
        </div>
      </div>
      
      <button class="restart-btn" @click="handleRestart">
        🔄 重新开始
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGame } from '../composables/useGame';

const { gameState, score, resetGame } = useGame();

function handleRestart() {
  resetGame();
}
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
}

.modal {
  padding: 40px 50px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  border: 2px solid;
  text-align: center;
  animation: modalIn 0.4s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal.victory {
  border-color: #22c55e;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.4);
}

.modal.defeat {
  border-color: #ef4444;
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
}

.title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 30px;
}

.victory .title {
  color: #22c55e;
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.defeat .title {
  color: #ef4444;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  font-size: 16px;
}

.stat-label {
  color: #94a3b8;
}

.stat-value {
  color: #e2e8f0;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.stat-row.total {
  padding-top: 12px;
  border-top: 1px solid #334155;
  font-size: 20px;
}

.stat-row.total .stat-value {
  color: #fbbf24;
  font-size: 24px;
}

.restart-btn {
  padding: 14px 40px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.restart-btn:active {
  transform: translateY(0);
}
</style>
