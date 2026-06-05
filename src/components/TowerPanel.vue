<template>
  <div class="tower-panel">
    <h3 class="panel-title">防御塔</h3>
    <div class="tower-list">
      <div
        v-for="type in towerTypes"
        :key="type"
        :class="[
          'tower-card',
          { selected: gameState.selectedTowerType === type },
          { disabled: gameState.gold < configs[type].cost }
        ]"
        @click="selectTower(type)"
      >
        <div class="tower-icon" :style="{ backgroundColor: configs[type].color }">
          <div class="icon-inner">
            <span v-if="type === 'firewall'">🛡️</span>
            <span v-else-if="type === 'antivirus'">⚡</span>
            <span v-else-if="type === 'honeypot'">🍯</span>
            <span v-else-if="type === 'patch'">💊</span>
          </div>
        </div>
        <div class="tower-info">
          <div class="tower-name">{{ configs[type].name }}</div>
          <div class="tower-cost">💰 {{ configs[type].cost }}</div>
        </div>
        <div class="tower-desc">{{ configs[type].description }}</div>
        <div class="tower-stats">
          <span v-if="configs[type].damage > 0">攻击: {{ configs[type].damage }}</span>
          <span v-if="configs[type].damage > 0">射速: {{ configs[type].fireRate }}s</span>
          <span>射程: {{ configs[type].range }}</span>
        </div>
      </div>
    </div>
    
    <div class="tips">
      <p>💡 左键放置塔</p>
      <p>💡 右键取消选择</p>
      <p>💡 点击塔查看详情</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGame } from '../composables/useGame';
import { TOWER_CONFIGS, type TowerType } from '../types/game';

const { gameState, selectTowerType } = useGame();

const configs = TOWER_CONFIGS;
const towerTypes: TowerType[] = ['firewall', 'antivirus', 'honeypot', 'patch'];

function selectTower(type: TowerType) {
  if (gameState.gold < configs[type].cost) return;
  if (gameState.selectedTowerType === type) {
    selectTowerType(null);
  } else {
    selectTowerType(type);
  }
}
</script>

<style scoped>
.tower-panel {
  width: 220px;
  padding: 16px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 8px;
  border: 1px solid #334155;
}

.panel-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #e2e8f0;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #334155;
}

.tower-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tower-card {
  padding: 10px;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tower-card:hover:not(.disabled) {
  border-color: #3b82f6;
  transform: translateX(2px);
}

.tower-card.selected {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.tower-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tower-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.icon-inner {
  font-size: 18px;
}

.tower-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tower-name {
  font-size: 13px;
  font-weight: bold;
  color: #e2e8f0;
}

.tower-cost {
  font-size: 12px;
  color: #fbbf24;
  font-weight: bold;
}

.tower-desc {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
}

.tower-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
  color: #94a3b8;
}

.tower-stats span {
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 3px;
}

.tips {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #334155;
  font-size: 11px;
  color: #64748b;
  line-height: 1.8;
}

.tips p {
  margin: 0;
}
</style>
