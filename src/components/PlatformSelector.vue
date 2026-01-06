<script setup lang="ts">
// Platform 接口定义
export interface Platform {
  id: string
  name: string
  url: string
  color: string
}

const props = defineProps<{
  platforms: Platform[]
  visible: boolean
  currentPlatformId?: string
}>()

const emit = defineEmits<{
  (e: 'select', platform: Platform): void
  (e: 'close'): void
}>()

function selectPlatform(platform: Platform) {
  emit('select', platform)
}

function handleOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content">
        <div class="modal-header">
          <h3>选择 AI 平台</h3>
          <button class="close-btn" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="platform-list">
          <button
            v-for="platform in platforms"
            :key="platform.id"
            :class="['platform-item', { active: platform.id === currentPlatformId }]"
            :style="{ '--platform-color': platform.color }"
            @click="selectPlatform(platform)"
          >
            <span class="platform-indicator" :style="{ backgroundColor: platform.color }"></span>
            <span class="platform-name">{{ platform.name }}</span>
            <span class="platform-url">{{ platform.url }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2a2a2a;
  border-radius: 12px;
  width: 360px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #3a3a3a;
  color: #fff;
}

.platform-list {
  padding: 8px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.platform-item:hover {
  background-color: #3a3a3a;
}

.platform-item.active {
  background-color: #3a3a4a;
  border-color: var(--platform-color);
}

.platform-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
}

.platform-url {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

