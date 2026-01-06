<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface PanelSize {
  width: number  // 百分比
  height: number // 百分比
}

export interface CustomLayoutConfig {
  id: string
  name: string
  panels: number  // 面板数量 2-4
  sizes: PanelSize[]  // 每个面板的大小
  direction: 'horizontal' | 'vertical' | 'grid'
}

const props = defineProps<{
  config: CustomLayoutConfig
}>()

const emit = defineEmits<{
  (e: 'update:config', config: CustomLayoutConfig): void
}>()

// 拖动状态
const isDragging = ref(false)
const dragIndex = ref(-1)
const dragDirection = ref<'horizontal' | 'vertical'>('horizontal')
const startPos = ref({ x: 0, y: 0 })
const startSizes = ref<PanelSize[]>([])

// 容器引用
const containerRef = ref<HTMLElement | null>(null)

// 计算面板样式
const panelStyles = computed(() => {
  const { panels, sizes, direction } = props.config
  
  if (direction === 'horizontal') {
    // 左右布局
    return sizes.slice(0, panels).map((size, index) => ({
      width: `${size.width}%`,
      height: '100%',
      gridColumn: `${index + 1}`,
      gridRow: '1'
    }))
  } else if (direction === 'vertical') {
    // 上下布局
    return sizes.slice(0, panels).map((size, index) => ({
      width: '100%',
      height: `${size.height}%`,
      gridColumn: '1',
      gridRow: `${index + 1}`
    }))
  } else {
    // 网格布局 (2x2)
    return sizes.slice(0, panels).map((size, index) => ({
      width: `${size.width}%`,
      height: `${size.height}%`,
      gridColumn: `${(index % 2) + 1}`,
      gridRow: `${Math.floor(index / 2) + 1}`
    }))
  }
})

// 计算容器样式
const containerStyle = computed(() => {
  const { panels, direction, sizes } = props.config
  
  if (direction === 'horizontal') {
    const cols = sizes.slice(0, panels).map(s => `${s.width}%`).join(' ')
    return {
      display: 'grid',
      gridTemplateColumns: cols,
      gridTemplateRows: '1fr'
    }
  } else if (direction === 'vertical') {
    const rows = sizes.slice(0, panels).map(s => `${s.height}%`).join(' ')
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridTemplateRows: rows
    }
  } else {
    // 网格布局
    const col1 = sizes[0]?.width || 50
    const row1 = sizes[0]?.height || 50
    return {
      display: 'grid',
      gridTemplateColumns: `${col1}% ${100 - col1}%`,
      gridTemplateRows: `${row1}% ${100 - row1}%`
    }
  }
})

// 计算分隔条位置
const separators = computed(() => {
  const { panels, direction, sizes } = props.config
  const result: { index: number; direction: 'horizontal' | 'vertical'; position: number }[] = []
  
  if (direction === 'horizontal' && panels > 1) {
    let pos = 0
    for (let i = 0; i < panels - 1; i++) {
      pos += sizes[i]?.width || (100 / panels)
      result.push({ index: i, direction: 'vertical', position: pos })
    }
  } else if (direction === 'vertical' && panels > 1) {
    let pos = 0
    for (let i = 0; i < panels - 1; i++) {
      pos += sizes[i]?.height || (100 / panels)
      result.push({ index: i, direction: 'horizontal', position: pos })
    }
  } else if (direction === 'grid' && panels >= 2) {
    // 垂直分隔线
    result.push({ 
      index: 0, 
      direction: 'vertical', 
      position: sizes[0]?.width || 50 
    })
    // 水平分隔线
    if (panels > 2) {
      result.push({ 
        index: 1, 
        direction: 'horizontal', 
        position: sizes[0]?.height || 50 
      })
    }
  }
  
  return result
})

// 开始拖动
function startDrag(event: MouseEvent, index: number, direction: 'horizontal' | 'vertical') {
  event.preventDefault()
  isDragging.value = true
  dragIndex.value = index
  dragDirection.value = direction
  startPos.value = { x: event.clientX, y: event.clientY }
  startSizes.value = JSON.parse(JSON.stringify(props.config.sizes))
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 拖动中
function onDrag(event: MouseEvent) {
  if (!isDragging.value || !containerRef.value) return
  
  const container = containerRef.value
  const rect = container.getBoundingClientRect()
  
  const deltaX = event.clientX - startPos.value.x
  const deltaY = event.clientY - startPos.value.y
  
  const deltaXPercent = (deltaX / rect.width) * 100
  const deltaYPercent = (deltaY / rect.height) * 100
  
  const newSizes = JSON.parse(JSON.stringify(startSizes.value)) as PanelSize[]
  const { direction, panels } = props.config
  
  if (direction === 'horizontal' && dragDirection.value === 'vertical') {
    // 调整左右大小
    const idx = dragIndex.value
    const minSize = 15 // 最小15%
    
    let newWidth1 = startSizes.value[idx].width + deltaXPercent
    let newWidth2 = startSizes.value[idx + 1].width - deltaXPercent
    
    if (newWidth1 >= minSize && newWidth2 >= minSize) {
      newSizes[idx].width = newWidth1
      newSizes[idx + 1].width = newWidth2
    }
  } else if (direction === 'vertical' && dragDirection.value === 'horizontal') {
    // 调整上下大小
    const idx = dragIndex.value
    const minSize = 15
    
    let newHeight1 = startSizes.value[idx].height + deltaYPercent
    let newHeight2 = startSizes.value[idx + 1].height - deltaYPercent
    
    if (newHeight1 >= minSize && newHeight2 >= minSize) {
      newSizes[idx].height = newHeight1
      newSizes[idx + 1].height = newHeight2
    }
  } else if (direction === 'grid') {
    const minSize = 15
    
    if (dragDirection.value === 'vertical') {
      // 调整左右列宽
      let newWidth = startSizes.value[0].width + deltaXPercent
      if (newWidth >= minSize && newWidth <= (100 - minSize)) {
        // 更新所有面板的宽度
        newSizes[0].width = newWidth
        newSizes[1].width = 100 - newWidth
        if (panels > 2) {
          newSizes[2].width = newWidth
          if (panels > 3) {
            newSizes[3].width = 100 - newWidth
          }
        }
      }
    } else {
      // 调整上下行高
      let newHeight = startSizes.value[0].height + deltaYPercent
      if (newHeight >= minSize && newHeight <= (100 - minSize)) {
        // 更新所有面板的高度
        newSizes[0].height = newHeight
        newSizes[1].height = newHeight
        if (panels > 2) {
          newSizes[2].height = 100 - newHeight
          if (panels > 3) {
            newSizes[3].height = 100 - newHeight
          }
        }
      }
    }
  }
  
  emit('update:config', { ...props.config, sizes: newSizes })
}

// 停止拖动
function stopDrag() {
  isDragging.value = false
  dragIndex.value = -1
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<template>
  <div 
    ref="containerRef"
    class="resizable-layout"
    :style="containerStyle"
    :class="{ dragging: isDragging }"
  >
    <!-- 面板插槽 -->
    <slot></slot>
    
    <!-- 分隔条 -->
    <div
      v-for="sep in separators"
      :key="`sep-${sep.index}-${sep.direction}`"
      :class="['separator', sep.direction]"
      :style="{
        [sep.direction === 'vertical' ? 'left' : 'top']: `${sep.position}%`
      }"
      @mousedown="startDrag($event, sep.index, sep.direction)"
    >
      <div class="separator-handle"></div>
    </div>
  </div>
</template>

<style scoped>
.resizable-layout {
  position: relative;
  width: 100%;
  height: 100%;
  gap: 4px;
}

.resizable-layout.dragging {
  user-select: none;
}

.separator {
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.separator.vertical {
  top: 0;
  bottom: 0;
  width: 12px;
  margin-left: -6px;
  cursor: col-resize;
}

.separator.horizontal {
  left: 0;
  right: 0;
  height: 12px;
  margin-top: -6px;
  cursor: row-resize;
}

.separator-handle {
  background-color: transparent;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.separator.vertical .separator-handle {
  width: 4px;
  height: 40px;
}

.separator.horizontal .separator-handle {
  width: 40px;
  height: 4px;
}

.separator:hover .separator-handle,
.resizable-layout.dragging .separator-handle {
  background-color: #646cff;
}
</style>

