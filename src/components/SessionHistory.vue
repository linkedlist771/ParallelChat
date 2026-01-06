<script setup lang="ts">
import { ref, onMounted } from 'vue'

export interface SessionRecord {
  id: string
  name: string
  timestamp: number
  layout: string
  platforms: string[]
  urls: string[]  // 每个面板的当前 URL
}

const props = defineProps<{
  visible: boolean
  sessions: SessionRecord[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-current'): void
  (e: 'restore', session: SessionRecord): void
  (e: 'delete', id: string): void
  (e: 'rename', id: string, name: string): void
}>()

const editingId = ref<string | null>(null)
const editingName = ref('')

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

function startRename(session: SessionRecord) {
  editingId.value = session.id
  editingName.value = session.name
}

function confirmRename() {
  if (editingId.value && editingName.value.trim()) {
    emit('rename', editingId.value, editingName.value.trim())
  }
  editingId.value = null
  editingName.value = ''
}

function cancelRename() {
  editingId.value = null
  editingName.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    confirmRename()
  } else if (event.key === 'Escape') {
    cancelRename()
  }
}
</script>

<template>
  <Transition name="slide">
    <div v-if="visible" class="session-panel">
      <div class="panel-header">
        <h3>会话历史</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="panel-actions">
        <button class="save-btn" @click="$emit('save-current')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          保存当前会话
        </button>
      </div>
      
      <div class="session-list">
        <div v-if="sessions.length === 0" class="empty-state">
          <p>暂无保存的会话</p>
          <p class="hint">点击上方按钮保存当前状态</p>
        </div>
        
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
        >
          <div class="session-info" @click="$emit('restore', session)">
            <div class="session-name">
              <template v-if="editingId === session.id">
                <input
                  v-model="editingName"
                  class="name-input"
                  @keydown="handleKeydown"
                  @blur="confirmRename"
                  autofocus
                  @click.stop
                />
              </template>
              <template v-else>
                {{ session.name }}
              </template>
            </div>
            <div class="session-meta">
              <span class="session-time">{{ formatTime(session.timestamp) }}</span>
              <span class="session-platforms">{{ session.platforms.join(' · ') }}</span>
            </div>
          </div>
          <div class="session-actions">
            <button 
              class="action-btn" 
              title="重命名"
              @click.stop="startRename(session)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button 
              class="action-btn delete" 
              title="删除"
              @click.stop="$emit('delete', session.id)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- 遮罩层 -->
  <Transition name="fade">
    <div v-if="visible" class="overlay" @click="$emit('close')"></div>
  </Transition>
</template>

<style scoped>
.session-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
}

.panel-header h3 {
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
  background-color: #333;
  color: #fff;
}

.panel-actions {
  padding: 16px;
  border-bottom: 1px solid #333;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: 1px dashed #555;
  border-radius: 8px;
  background-color: transparent;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  border-color: #646cff;
  color: #646cff;
  background-color: rgba(100, 108, 255, 0.1);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 8px;
  color: #555;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  background-color: #2a2a2a;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.name-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #646cff;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.session-platforms {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #3a3a3a;
  color: #fff;
}

.action-btn.delete:hover {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>




