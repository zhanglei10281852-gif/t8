<template>
  <div v-if="gameState.selectedTower" class="tower-info">
    <h3 class="panel-title">塔信息</h3>
    
    <div class="tower-header">
      <div class="tower-icon" :style="{ backgroundColor: config.color }">
        <span>{{ icon }}</span>
      </div>
      <div class="tower-name">{{ config.name }}</div>
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">攻击力</span>
        <span class="info-value">{{ gameState.selectedTower.damage }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">射速</span>
        <span class="info-value">{{ gameState.selectedTower.fireRate }}s</span>
      </div>
      <div class="info-item">
        <span class="info-label">射程</span>
        <span class="info-value">{{ gameState.selectedTower.range }}px</span>
      </div>
    </div>
    
    <p class="desc">{{ config.description }}</p>
    
    <div class="close-hint">点击空白处关闭</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '../composables/useGame';
import { TOWER_CONFIGS } from '../types/game';

const { gameState } = useGame();

const config = computed(() => {
  if (!gameState.selectedTower) return TOWER_CONFIGS.firewall;
  return TOWER_CONFIGS[gameState.selectedTower.type];
});

const icon = computed(() => {
  if (!gameState.selectedTower) return '🛡️';
  const icons: Record<string, string> = {
    firewall: '🛡️',
    antivirus: '⚡',
    honeypot: '🍯',
    patch: '💊'
  };
  return icons[gameState.selectedTower.type] || '🛡️';
});
</script>

<style scoped>
.tower-info {
  width: 200px;
  padding: 16px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 8px;
  border: 1px solid #334155;
}

.panel-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #e2e8f0;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #334155;
}

.tower-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.tower-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.tower-name {
  font-size: 16px;
  font-weight: bold;
  color: #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 11px;
  color: #64748b;
}

.info-value {
  font-size: 14px;
  font-weight: bold;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
}

.desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.close-hint {
  font-size: 10px;
  color: #475569;
  text-align: center;
  font-style: italic;
}
</style>
