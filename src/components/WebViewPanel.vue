<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

export interface Platform {
  id: string
  name: string
  url: string
  color: string
}

const props = defineProps<{
  platform: Platform
  slotIndex: number
  isMaximized?: boolean
}>()

const emit = defineEmits<{
  (e: 'change-platform', slotIndex: number): void
  (e: 'toggle-maximize', slotIndex: number): void
}>()

const loading = ref(true)
const webviewId = ref(`webview-${props.platform.id}-${props.slotIndex}`)

onMounted(() => {
  setupWebviewListeners()
})

watch(() => props.platform.id, () => {
  loading.value = true
  webviewId.value = `webview-${props.platform.id}-${props.slotIndex}`
  setTimeout(setupWebviewListeners, 100)
})

// 同时监听 slotIndex 变化
watch(() => props.slotIndex, () => {
  webviewId.value = `webview-${props.platform.id}-${props.slotIndex}`
})

function setupWebviewListeners() {
  const webview = document.getElementById(webviewId.value) as any
  if (webview) {
    webview.addEventListener('did-finish-load', () => {
      loading.value = false
    })
    webview.addEventListener('did-fail-load', () => {
      loading.value = false
    })
  }
}

function handleChangePlatform() {
  emit('change-platform', props.slotIndex)
}

// 刷新 WebView
function handleRefresh() {
  const webview = document.getElementById(webviewId.value) as any
  if (webview) {
    loading.value = true
    webview.reload()
  }
}

// 双击标题栏切换最大化
function handleHeaderDoubleClick() {
  emit('toggle-maximize', props.slotIndex)
}
</script>

<template>
  <div :class="['panel-container', { maximized: isMaximized }]">
    <!-- 标题栏 -->
    <div 
      class="panel-header" 
      :style="{ borderColor: platform.color }"
      @dblclick="handleHeaderDoubleClick"
    >
      <span class="platform-name">{{ platform.name }}</span>
      <div class="header-actions">
        <span v-if="loading" class="loading-indicator">加载中...</span>
        <button class="action-btn" @click="handleRefresh" title="刷新">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
        <!-- 最大化/还原按钮 -->
        <button 
          class="action-btn" 
          @click="handleHeaderDoubleClick" 
          :title="isMaximized ? '还原' : '最大化'"
        >
          <svg v-if="!isMaximized" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
        <button class="action-btn" @click="handleChangePlatform" title="切换AI">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- WebView -->
    <webview
      :id="webviewId"
      :key="`${platform.id}-${slotIndex}`"
      :src="platform.url"
      :partition="`persist:${platform.id}`"
      class="webview"
      allowpopups
    ></webview>
  </div>
</template>

<style scoped>
.panel-container {
  display: flex;
  flex-direction: column;
  background-color: #242424;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
}

.panel-container.maximized {
  border-radius: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #2a2a2a;
  border-left: 3px solid;
  min-height: 20px;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.panel-header:hover {
  background-color: #333;
}

.platform-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-indicator {
  font-size: 12px;
  color: #888;
  margin-right: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
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

.webview {
  flex: 1;
  width: 100%;
  border: none;
}
</style>