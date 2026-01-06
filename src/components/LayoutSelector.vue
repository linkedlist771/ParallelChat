<script setup lang="ts">
import { ref } from 'vue'
import type { CustomLayoutConfig } from './ResizableLayout.vue'

// 预设布局类型
export type PresetLayoutType = 'two-horizontal' | 'two-vertical' | 'three-top2-bottom1' | 'three-top1-bottom2' | 'four-grid'

// 布局类型可以是预设或自定义ID
export type LayoutType = PresetLayoutType | string

const props = defineProps<{
  currentLayout: LayoutType
  customLayouts: CustomLayoutConfig[]
}>()

const emit = defineEmits<{
  (e: 'select', layout: LayoutType): void
  (e: 'add-custom'): void
  (e: 'delete-custom', id: string): void
}>()

// 预设布局
const presetLayouts: { type: PresetLayoutType; name: string }[] = [
  { type: 'two-horizontal', name: '左右二分' },
  { type: 'two-vertical', name: '上下二分' },
  { type: 'three-top2-bottom1', name: '上二下一' },
  { type: 'three-top1-bottom2', name: '上一下二' },
  { type: 'four-grid', name: '四分格' },
]

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuTargetId = ref<string | null>(null)

function selectLayout(type: LayoutType) {
  emit('select', type)
}

function handleAddCustom() {
  emit('add-custom')
}

function handleContextMenu(event: MouseEvent, layoutId: string) {
  event.preventDefault()
  contextMenuVisible.value = true
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuTargetId.value = layoutId
}

function handleDeleteCustom() {
  if (contextMenuTargetId.value) {
    emit('delete-custom', contextMenuTargetId.value)
  }
  closeContextMenu()
}

function closeContextMenu() {
  contextMenuVisible.value = false
  contextMenuTargetId.value = null
}

// 点击其他地方关闭菜单
function handleClickOutside() {
  closeContextMenu()
}

// 检查是否是自定义布局
function isCustomLayout(type: LayoutType): boolean {
  return !presetLayouts.some(p => p.type === type)
}

// 为自定义布局生成 SVG 图标
function getCustomLayoutIcon(config: CustomLayoutConfig) {
  const { panels, direction } = config
  // 返回一个简单的表示
  return { panels, direction }
}
</script>

<template>
  <div class="layout-selector" @click="handleClickOutside">
    <div class="selector-label">布局:</div>
    <div class="layout-options">
      <!-- 预设布局 -->
      <button
        v-for="layout in presetLayouts"
        :key="layout.type"
        :class="['layout-btn', 'preset', { active: currentLayout === layout.type }]"
        :title="layout.name"
        @click.stop="selectLayout(layout.type)"
      >
        <!-- 左右二分 -->
        <svg v-if="layout.type === 'two-horizontal'" width="24" height="18" viewBox="0 0 24 18">
          <rect x="1" y="1" width="10" height="16" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="13" y="1" width="10" height="16" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
        
        <!-- 上下二分 -->
        <svg v-else-if="layout.type === 'two-vertical'" width="24" height="18" viewBox="0 0 24 18">
          <rect x="1" y="1" width="22" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="1" y="10" width="22" height="7" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
        
        <!-- 上二下一 -->
        <svg v-else-if="layout.type === 'three-top2-bottom1'" width="24" height="18" viewBox="0 0 24 18">
          <rect x="1" y="1" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="13" y="1" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="1" y="10" width="22" height="7" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
        
        <!-- 上一下二 -->
        <svg v-else-if="layout.type === 'three-top1-bottom2'" width="24" height="18" viewBox="0 0 24 18">
          <rect x="1" y="1" width="22" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="1" y="10" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="13" y="10" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
        
        <!-- 四分格 -->
        <svg v-else-if="layout.type === 'four-grid'" width="24" height="18" viewBox="0 0 24 18">
          <rect x="1" y="1" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="13" y="1" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="1" y="10" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="13" y="10" width="10" height="7" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
      </button>

      <!-- 分隔线 -->
      <div v-if="customLayouts.length > 0" class="separator"></div>

      <!-- 自定义布局 -->
      <button
        v-for="custom in customLayouts"
        :key="custom.id"
        :class="['layout-btn', 'custom', { active: currentLayout === custom.id }]"
        :title="`${custom.name} (右键删除)`"
        @click.stop="selectLayout(custom.id)"
        @contextmenu="handleContextMenu($event, custom.id)"
      >
        <!-- 根据配置动态生成图标 -->
        <svg width="24" height="18" viewBox="0 0 24 18">
          <!-- 水平布局 -->
          <template v-if="custom.direction === 'horizontal'">
            <rect 
              v-for="(size, i) in custom.sizes.slice(0, custom.panels)" 
              :key="i"
              :x="custom.sizes.slice(0, i).reduce((a, s) => a + s.width * 0.22, 1)"
              y="1"
              :width="size.width * 0.22 - 2"
              height="16"
              rx="1"
              fill="currentColor"
              opacity="0.8"
            />
          </template>
          <!-- 垂直布局 -->
          <template v-else-if="custom.direction === 'vertical'">
            <rect 
              v-for="(size, i) in custom.sizes.slice(0, custom.panels)" 
              :key="i"
              x="1"
              :y="custom.sizes.slice(0, i).reduce((a, s) => a + s.height * 0.16, 1)"
              width="22"
              :height="size.height * 0.16 - 2"
              rx="1"
              fill="currentColor"
              opacity="0.8"
            />
          </template>
          <!-- 网格布局 -->
          <template v-else>
            <rect 
              v-for="(size, i) in custom.sizes.slice(0, custom.panels)" 
              :key="i"
              :x="(i % 2) === 0 ? 1 : 13"
              :y="Math.floor(i / 2) === 0 ? 1 : 10"
              :width="(i % 2) === 0 ? size.width * 0.22 - 1 : (100 - size.width) * 0.22 - 1"
              :height="Math.floor(i / 2) === 0 ? size.height * 0.16 - 1 : (100 - size.height) * 0.16 - 1"
              rx="1"
              fill="currentColor"
              opacity="0.8"
            />
          </template>
        </svg>
      </button>

      <!-- 添加按钮 -->
      <button
        class="layout-btn add-btn"
        title="添加自定义布局"
        @click.stop="handleAddCustom"
      >
        <svg width="24" height="18" viewBox="0 0 24 18">
          <line x1="12" y1="4" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div 
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      >
        <button class="context-menu-item delete" @click="handleDeleteCustom">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          删除此布局
        </button>
      </div>
      <div v-if="contextMenuVisible" class="context-menu-overlay" @click="closeContextMenu"></div>
    </Teleport>
  </div>
</template>

<style scoped>
.layout-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
}

.selector-label {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
}

.layout-options {
  display: flex;
  gap: 4px;
  align-items: center;
}

.separator {
  width: 1px;
  height: 20px;
  background-color: #444;
  margin: 0 4px;
}

.layout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 28px;
  padding: 4px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-btn:hover {
  border-color: #555;
  color: #999;
  background-color: #333;
}

.layout-btn.preset.active {
  border-color: #646cff;
  color: #646cff;
  background-color: #2a2a3a;
}

/* 自定义布局使用不同颜色 */
.layout-btn.custom {
  border-color: #4a4a3a;
  color: #d4a574;
}

.layout-btn.custom:hover {
  border-color: #6a6a4a;
  color: #e4b584;
  background-color: #3a3a2a;
}

.layout-btn.custom.active {
  border-color: #d4a574;
  color: #d4a574;
  background-color: #3a3a2a;
  box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.2);
}

/* 添加按钮 */
.layout-btn.add-btn {
  border-style: dashed;
  border-color: #555;
  color: #666;
}

.layout-btn.add-btn:hover {
  border-color: #888;
  color: #aaa;
  background-color: #333;
}

/* 右键菜单 */
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 4px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 120px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: none;
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.context-menu-item:hover {
  background-color: #3a3a3a;
}

.context-menu-item.delete {
  color: #ef4444;
}

.context-menu-item.delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}
</style>
