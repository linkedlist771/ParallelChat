<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import WebViewPanel from './components/WebViewPanel.vue'
import LayoutSelector, { type LayoutType, type PresetLayoutType } from './components/LayoutSelector.vue'
import PlatformSelector from './components/PlatformSelector.vue'
import ResizableLayout, { type CustomLayoutConfig } from './components/ResizableLayout.vue'
import SessionHistory, { type SessionRecord } from './components/SessionHistory.vue'
import { SITE_CONFIGS, getSiteConfigById } from './utils/siteConfigs'
import { InputManager } from './utils/inputManager'

// 从配置中提取平台信息用于UI展示
const allPlatforms = SITE_CONFIGS.map(config => ({
  id: config.id,
  name: config.name,
  url: config.url,
  color: config.color
}))

// 布局配置
const currentLayout = ref<LayoutType>('four-grid')

// 自定义布局列表
const customLayouts = ref<CustomLayoutConfig[]>([])

// 当前自定义布局配置（如果选中的是自定义布局）
const currentCustomConfig = computed(() => {
  return customLayouts.value.find(l => l.id === currentLayout.value)
})

// 是否使用自定义布局
const isCustomLayout = computed(() => !!currentCustomConfig.value)

// 每个槽位对应的平台ID
const slotPlatforms = ref<string[]>(['chatgpt', 'gemini', 'claude', 'grok'])

// 平台选择器状态
const showPlatformSelector = ref(false)
const editingSlotIndex = ref<number | null>(null)

// 输入框状态
const inputMessage = ref('')
const isInputFocused = ref(false)
const isSending = ref(false)
const sendResults = ref<{ platformId: string; success: boolean; message: string }[]>([])

// 图片附件状态
interface ImageAttachment {
  id: string
  dataUrl: string
  file: File
}
const attachedImages = ref<ImageAttachment[]>([])

// 最大化状态
const maximizedPanelIndex = ref<number | null>(null)
const isMaximized = computed(() => maximizedPanelIndex.value !== null)

// 会话历史状态
const showSessionHistory = ref(false)
const savedSessions = ref<SessionRecord[]>([])

// 根据布局类型计算需要的槽位数量
const slotCount = computed(() => {
  if (currentCustomConfig.value) {
    return currentCustomConfig.value.panels
  }
  
  switch (currentLayout.value) {
    case 'two-horizontal':
    case 'two-vertical':
      return 2
    case 'three-top2-bottom1':
    case 'three-top1-bottom2':
    case 'three-vertical':
      return 3
    case 'four-grid':
      return 4
    default:
      return 4
  }
})

// 当前显示的平台列表
const visiblePlatforms = computed(() => {
  return slotPlatforms.value.slice(0, slotCount.value).map(id => {
    return allPlatforms.find(p => p.id === id) || allPlatforms[0]
  })
})

// 布局的 CSS 类名（仅用于预设布局）
const layoutClass = computed(() => {
  if (isCustomLayout.value) return ''
  return `layout-${currentLayout.value}`
})

// 加载保存的配置
onMounted(() => {
  loadConfig()
  loadSessions()
})

// 监听配置变化并保存
watch([currentLayout, slotPlatforms, customLayouts], () => {
  saveConfig()
}, { deep: true })

// 处理布局切换
function handleLayoutChange(layout: LayoutType) {
  currentLayout.value = layout
}

// 处理添加自定义布局
function handleAddCustomLayout() {
  const id = `custom-${Date.now()}`
  const newLayout: CustomLayoutConfig = {
    id,
    name: `自定义 ${customLayouts.value.length + 1}`,
    panels: 4,
    direction: 'grid',
    sizes: [
      { width: 50, height: 50 },
      { width: 50, height: 50 },
      { width: 50, height: 50 },
      { width: 50, height: 50 }
    ]
  }
  customLayouts.value.push(newLayout)
  currentLayout.value = id
}

// 处理删除自定义布局
function handleDeleteCustomLayout(id: string) {
  const index = customLayouts.value.findIndex(l => l.id === id)
  if (index !== -1) {
    customLayouts.value.splice(index, 1)
    // 如果删除的是当前布局，切换到默认
    if (currentLayout.value === id) {
      currentLayout.value = 'four-grid'
    }
  }
}

// 处理自定义布局更新
function handleCustomConfigUpdate(config: CustomLayoutConfig) {
  const index = customLayouts.value.findIndex(l => l.id === config.id)
  if (index !== -1) {
    customLayouts.value[index] = config
  }
}

// 处理切换平台按钮点击
function handleChangePlatform(slotIndex: number) {
  editingSlotIndex.value = slotIndex
  showPlatformSelector.value = true
}

// 处理面板最大化切换
function handleToggleMaximize(slotIndex: number) {
  if (maximizedPanelIndex.value === slotIndex) {
    // 已经最大化，则还原
    maximizedPanelIndex.value = null
  } else {
    // 最大化指定面板
    maximizedPanelIndex.value = slotIndex
  }
}

// 处理平台选择
function handlePlatformSelect(platform: { id: string; name: string; url: string; color: string }) {
  if (editingSlotIndex.value !== null) {
    const newSlots = [...slotPlatforms.value]
    newSlots[editingSlotIndex.value] = platform.id
    slotPlatforms.value = newSlots
  }
  showPlatformSelector.value = false
  editingSlotIndex.value = null
}

// 关闭平台选择器
function closePlatformSelector() {
  showPlatformSelector.value = false
  editingSlotIndex.value = null
}

// 保存配置到 localStorage
function saveConfig() {
  const config = {
    layout: currentLayout.value,
    slots: slotPlatforms.value,
    customLayouts: customLayouts.value
  }
  localStorage.setItem('parallelchat-config', JSON.stringify(config))
}

// 从 localStorage 加载配置
function loadConfig() {
  try {
    const saved = localStorage.getItem('parallelchat-config')
    if (saved) {
      const config = JSON.parse(saved)
      if (config.customLayouts && Array.isArray(config.customLayouts)) {
        customLayouts.value = config.customLayouts
      }
      if (config.layout) {
        currentLayout.value = config.layout
      }
      if (config.slots && Array.isArray(config.slots)) {
        slotPlatforms.value = config.slots
      }
    }
  } catch (e) {
    console.error('Failed to load config:', e)
  }
}

// 加载会话历史
function loadSessions() {
  try {
    const saved = localStorage.getItem('parallelchat-sessions')
    if (saved) {
      savedSessions.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load sessions:', e)
  }
}

// 保存会话历史
function saveSessions() {
  localStorage.setItem('parallelchat-sessions', JSON.stringify(savedSessions.value))
}

// 获取所有 WebView 的当前 URL
async function getCurrentUrls(): Promise<string[]> {
  const urls: string[] = []
  const visiblePlatformIds = slotPlatforms.value.slice(0, slotCount.value)
  
  for (let i = 0; i < visiblePlatformIds.length; i++) {
    const platformId = visiblePlatformIds[i]
    const webviewId = `webview-${platformId}-${i}`
    const webview = document.getElementById(webviewId) as any
    
    if (webview && webview.getURL) {
      try {
        urls.push(webview.getURL())
      } catch {
        urls.push('')
      }
    } else {
      urls.push('')
    }
  }
  
  return urls
}

// 保存当前会话
async function handleSaveSession() {
  const urls = await getCurrentUrls()
  const visiblePlatformIds = slotPlatforms.value.slice(0, slotCount.value)
  const platformNames = visiblePlatformIds.map(id => {
    const config = getSiteConfigById(id)
    return config?.name || id
  })
  
  const session: SessionRecord = {
    id: `session-${Date.now()}`,
    name: `会话 ${savedSessions.value.length + 1}`,
    timestamp: Date.now(),
    layout: currentLayout.value,
    platforms: platformNames,
    urls
  }
  
  savedSessions.value.unshift(session)
  saveSessions()
}

// 恢复会话
async function handleRestoreSession(session: SessionRecord) {
  // 先关闭面板
  showSessionHistory.value = false
  
  // 恢复布局
  currentLayout.value = session.layout as LayoutType
  
  // 等待 DOM 更新
  await nextTick()
  
  // 恢复每个 WebView 的 URL
  const visiblePlatformIds = slotPlatforms.value.slice(0, slotCount.value)
  
  for (let i = 0; i < session.urls.length && i < visiblePlatformIds.length; i++) {
    const url = session.urls[i]
    if (url) {
      const platformId = visiblePlatformIds[i]
      const webviewId = `webview-${platformId}-${i}`
      const webview = document.getElementById(webviewId) as any
      
      if (webview && webview.loadURL) {
        try {
          webview.loadURL(url)
        } catch (e) {
          console.error('Failed to restore URL:', e)
        }
      }
    }
  }
}

// 删除会话
function handleDeleteSession(id: string) {
  const index = savedSessions.value.findIndex(s => s.id === id)
  if (index !== -1) {
    savedSessions.value.splice(index, 1)
    saveSessions()
  }
}

// 重命名会话
function handleRenameSession(id: string, name: string) {
  const session = savedSessions.value.find(s => s.id === id)
  if (session) {
    session.name = name
    saveSessions()
  }
}

// 发送消息到所有可见的 WebView
async function handleSend() {
  const message = inputMessage.value.trim()
  const hasImages = attachedImages.value.length > 0
  
  if ((!message && !hasImages) || isSending.value) return
  
  isSending.value = true
  sendResults.value = []
  
  // 获取当前可见的平台ID列表
  const visiblePlatformIds = slotPlatforms.value.slice(0, slotCount.value)
  
  console.log('Sending to platforms:', visiblePlatformIds, 'with images:', hasImages)
  
  // 图片已经在粘贴时同步了，现在只需要输入文字并发送
  const promises = visiblePlatformIds.map(async (platformId, index) => {
    const siteConfig = getSiteConfigById(platformId)
    if (!siteConfig) {
      return { platformId, success: false, message: '配置未找到' }
    }
    
    const webviewId = `webview-${platformId}-${index}`
    const webview = document.getElementById(webviewId) as any
    
    if (!webview) {
      return { platformId, success: false, message: 'WebView未找到' }
    }
    
    try {
      const inputManager = new InputManager(siteConfig)
      
      // 如果有文字，先输入文字（追加到已有内容后面）
      if (message) {
        const appendTextScript = generateAppendTextScript(message, siteConfig.textareaSelectors)
        await webview.executeJavaScript(appendTextScript)
        await new Promise(r => setTimeout(r, 100))
      }
      
      // 点击发送按钮
      await new Promise(r => setTimeout(r, 100))
      const sendScript = inputManager.getClickSendButtonScript()
      const sendResult = await webview.executeJavaScript(sendScript)
      
      return {
        platformId,
        success: sendResult?.success ?? false,
        message: sendResult?.message || sendResult?.error || '已发送'
      }
    } catch (error: any) {
      console.error(`${platformId} error:`, error)
      return { platformId, success: false, message: error.message || '执行失败' }
    }
  })
  
  const results = await Promise.all(promises)
  sendResults.value = results
  
  // 如果有成功的，清空输入框和图片
  const hasSuccess = results.some(r => r.success)
  if (hasSuccess) {
    inputMessage.value = ''
    attachedImages.value = []
  }
  
  // 3秒后清除结果提示
  setTimeout(() => {
    sendResults.value = []
  }, 3000)
  
  isSending.value = false
}

// 生成追加文字的脚本（不清空已有内容）
function generateAppendTextScript(text: string, textareaSelectors: string[]): string {
  const selectors = JSON.stringify(textareaSelectors)
  const escapedText = JSON.stringify(text)
  
  return `
    (function() {
      const text = ${escapedText};
      const selectors = ${selectors};
      
      function isElementVisible(element) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               rect.width > 0 && 
               rect.height > 0;
      }
      
      function isValidTextInput(element) {
        if (!element) return false;
        const isEditable = element.contentEditable === 'true' || 
                          element.tagName.toLowerCase() === 'textarea';
        const isNotReadonly = !element.readOnly && !element.disabled;
        return isEditable && isNotReadonly;
      }
      
      function isInChatHistory(element) {
        let parent = element.parentElement;
        while (parent) {
          const className = parent.className || '';
          const role = parent.getAttribute('role') || '';
          if (className.includes('conversation') || className.includes('message') ||
              role === 'article' || role === 'group') {
            return true;
          }
          parent = parent.parentElement;
        }
        return false;
      }
      
      function findTextarea() {
        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              if (isValidTextInput(element) && isElementVisible(element) && !isInChatHistory(element)) {
                return element;
              }
            }
          } catch (e) {}
        }
        return null;
      }
      
      function safeDispatchEvent(element, eventType) {
        try {
          const event = new Event(eventType, { bubbles: true, cancelable: true });
          element.dispatchEvent(event);
        } catch (e) {}
      }
      
      const textarea = findTextarea();
      if (!textarea) {
        return { success: false, error: '未找到输入框' };
      }
      
      textarea.focus();
      
      // 追加文字（不清空）
      if (textarea.tagName.toLowerCase() === 'textarea') {
        const currentValue = textarea.value || '';
        textarea.value = currentValue + (currentValue ? ' ' : '') + text;
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      } else {
        const currentText = textarea.textContent || '';
        textarea.textContent = currentText + (currentText ? ' ' : '') + text;
      }
      
      safeDispatchEvent(textarea, 'input');
      safeDispatchEvent(textarea, 'change');
      
      return { success: true, message: '已追加文字' };
    })()
  `
}

// 生成在 WebView 中粘贴图片的脚本
function generatePasteImageScript(imageDataUrl: string, textareaSelectors: string[], platformId: string): string {
  const selectors = JSON.stringify(textareaSelectors)
  const escapedDataUrl = JSON.stringify(imageDataUrl)
  
  return `
    (async function() {
      const selectors = ${selectors};
      const imageDataUrl = ${escapedDataUrl};
      const platformId = '${platformId}';
      
      function isElementVisible(element) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               rect.width > 0 && 
               rect.height > 0;
      }
      
      function isValidTextInput(element) {
        if (!element) return false;
        const isEditable = element.contentEditable === 'true' || 
                          element.tagName.toLowerCase() === 'textarea';
        const isNotReadonly = !element.readOnly && !element.disabled;
        return isEditable && isNotReadonly;
      }
      
      function isInChatHistory(element) {
        let parent = element.parentElement;
        while (parent) {
          const className = parent.className || '';
          const role = parent.getAttribute('role') || '';
          if (className.includes('conversation') || 
              className.includes('message') ||
              role === 'article' ||
              role === 'group') {
            return true;
          }
          parent = parent.parentElement;
        }
        return false;
      }
      
      function findTextarea() {
        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              if (isValidTextInput(element) && isElementVisible(element) && !isInChatHistory(element)) {
                return element;
              }
            }
          } catch (e) {}
        }
        return null;
      }
      
      // 查找文件上传 input
      function findFileInput() {
        // 查找隐藏的 file input
        const fileInputs = document.querySelectorAll('input[type="file"]');
        for (const input of fileInputs) {
          if (input.accept && (input.accept.includes('image') || input.accept.includes('*'))) {
            return input;
          }
        }
        // 如果没找到带 accept 的，返回第一个
        return fileInputs[0] || null;
      }
      
      // 将 dataUrl 转换为 Blob
      async function dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return await response.blob();
      }
      
      // 方法1: 通过 ClipboardEvent 粘贴（Gemini 等平台）
      async function pasteViaClipboardEvent(textarea, blob, file) {
        textarea.focus();
        await new Promise(r => setTimeout(r, 50));
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer
        });
        
        textarea.dispatchEvent(pasteEvent);
        
        // 也在 document 上派发一次
        if (!pasteEvent.defaultPrevented) {
          document.dispatchEvent(new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dataTransfer
          }));
        }
        
        return { success: true, message: '已通过粘贴事件发送图片' };
      }
      
      // 方法2: 通过 drop 事件（一些平台支持拖拽）
      async function pasteViaDrop(textarea, blob, file) {
        textarea.focus();
        await new Promise(r => setTimeout(r, 50));
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // 模拟拖拽事件序列
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer
        });
        
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer
        });
        
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer
        });
        
        textarea.dispatchEvent(dragEnterEvent);
        textarea.dispatchEvent(dragOverEvent);
        textarea.dispatchEvent(dropEvent);
        
        return { success: true, message: '已通过拖拽事件发送图片' };
      }
      
      // 方法3: 通过 file input（ChatGPT、Claude 等平台）
      async function pasteViaFileInput(file) {
        const fileInput = findFileInput();
        if (!fileInput) {
          return { success: false, error: '未找到文件上传入口' };
        }
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // 触发 change 事件
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
        
        // 也触发 input 事件
        const inputEvent = new Event('input', { bubbles: true });
        fileInput.dispatchEvent(inputEvent);
        
        return { success: true, message: '已通过文件上传发送图片' };
      }
      
      // 方法4: 点击上传按钮后注入文件（备用方案）
      async function findAndClickUploadButton() {
        // 常见的上传按钮选择器
        const uploadSelectors = [
          'button[aria-label*="Attach"]',
          'button[aria-label*="attach"]',
          'button[aria-label*="Upload"]',
          'button[aria-label*="upload"]',
          'button[aria-label*="Image"]',
          'button[aria-label*="image"]',
          'button[aria-label*="File"]',
          'button[aria-label*="file"]',
          'button[aria-label*="添加"]',
          'button[aria-label*="上传"]',
          'button[data-testid*="attach"]',
          'button[data-testid*="upload"]',
          '[data-testid="attachment-button"]',
          '.upload-button',
          '.attach-button'
        ];
        
        for (const selector of uploadSelectors) {
          try {
            const btn = document.querySelector(selector);
            if (btn && btn.offsetParent !== null) {
              return btn;
            }
          } catch (e) {}
        }
        
        // 查找包含上传图标的按钮
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.offsetParent !== null) {
            const svg = btn.querySelector('svg');
            if (svg) {
              const svgContent = svg.innerHTML.toLowerCase();
              if (svgContent.includes('path') && 
                  (svgContent.includes('attach') || svgContent.includes('clip') || svgContent.includes('upload'))) {
                return btn;
              }
            }
          }
        }
        
        return null;
      }
      
      try {
        const textarea = findTextarea();
        if (!textarea) {
          return { success: false, error: '未找到输入框' };
        }
        
        // 转换图片数据
        const blob = await dataUrlToBlob(imageDataUrl);
        const file = new File([blob], 'pasted-image.png', { type: blob.type || 'image/png' });
        
        let result;
        
        // 根据不同平台选择不同的策略
        if (platformId === 'chatgpt') {
          // ChatGPT: 优先尝试 file input，然后是 paste 事件
          result = await pasteViaFileInput(file);
          if (!result.success) {
            result = await pasteViaClipboardEvent(textarea, blob, file);
          }
          if (!result.success) {
            result = await pasteViaDrop(textarea, blob, file);
          }
        } else if (platformId === 'claude') {
          // Claude: 优先尝试 file input，然后是 drop 事件
          result = await pasteViaFileInput(file);
          if (!result.success) {
            result = await pasteViaDrop(textarea, blob, file);
          }
          if (!result.success) {
            result = await pasteViaClipboardEvent(textarea, blob, file);
          }
        } else if (platformId === 'gemini') {
          // Gemini: 优先使用 paste 事件（已经工作）
          result = await pasteViaClipboardEvent(textarea, blob, file);
        } else {
          // 其他平台: 依次尝试所有方法
          result = await pasteViaClipboardEvent(textarea, blob, file);
          if (!result.success) {
            result = await pasteViaFileInput(file);
          }
          if (!result.success) {
            result = await pasteViaDrop(textarea, blob, file);
          }
        }
        
        return result;
      } catch (e) {
        return { success: false, error: e.message || '粘贴图片失败' };
      }
    })()
  `
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

// 处理粘贴事件 - 检测图片
function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        addImageAttachment(file)
      }
      break
    }
  }
}

// 添加图片附件
function addImageAttachment(file: File) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      const imgId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      attachedImages.value.push({
        id: imgId,
        dataUrl,
        file
      })
      
      // 立即同步粘贴图片到所有平台
      await syncImageToAllPlatforms(dataUrl)
    }
  }
  reader.readAsDataURL(file)
}

// 同步图片到所有可见平台
async function syncImageToAllPlatforms(imageDataUrl: string) {
  const visiblePlatformIds = slotPlatforms.value.slice(0, slotCount.value)
  
  console.log('Syncing image to platforms:', visiblePlatformIds)
  
  // 并行粘贴到所有平台
  const promises = visiblePlatformIds.map(async (platformId, index) => {
    const siteConfig = getSiteConfigById(platformId)
    if (!siteConfig) return
    
    const webviewId = `webview-${platformId}-${index}`
    const webview = document.getElementById(webviewId) as any
    
    if (!webview) return
    
    try {
      const inputManager = new InputManager(siteConfig)
      
      // 先聚焦输入框
      const focusScript = inputManager.getSimulatePasteScript()
      await webview.executeJavaScript(focusScript)
      await new Promise(r => setTimeout(r, 100))
      
      // 粘贴图片
      const pasteImageScript = generatePasteImageScript(imageDataUrl, siteConfig.textareaSelectors, platformId)
      const result = await webview.executeJavaScript(pasteImageScript)
      console.log(`${platformId} paste result:`, result)
    } catch (error) {
      console.error(`${platformId} paste error:`, error)
    }
  })
  
  await Promise.all(promises)
}

// 移除图片附件
function removeImageAttachment(id: string) {
  const index = attachedImages.value.findIndex(img => img.id === id)
  if (index !== -1) {
    attachedImages.value.splice(index, 1)
  }
}

// 检查是否可以发送（有文字或图片）
const canSend = computed(() => {
  return (inputMessage.value.trim() || attachedImages.value.length > 0) && !isSending.value
})

// 计算自定义布局的面板样式
function getCustomPanelStyle(index: number) {
  if (!currentCustomConfig.value) return {}
  
  const config = currentCustomConfig.value
  const size = config.sizes[index]
  
  if (!size) return {}
  
  if (config.direction === 'horizontal') {
    return { flex: `0 0 ${size.width}%` }
  } else if (config.direction === 'vertical') {
    return { flex: `0 0 ${size.height}%` }
  } else {
    // grid 布局样式在 ResizableLayout 组件中处理
    return {}
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 会话历史面板 -->
    <SessionHistory
      :visible="showSessionHistory"
      :sessions="savedSessions"
      @close="showSessionHistory = false"
      @save-current="handleSaveSession"
      @restore="handleRestoreSession"
      @delete="handleDeleteSession"
      @rename="handleRenameSession"
    />

    <!-- 顶部工具栏 -->
    <div v-if="!isMaximized" class="toolbar">
      <div class="toolbar-left">
        <!-- 会话历史按钮 -->
        <button 
          class="history-btn" 
          :class="{ active: showSessionHistory }"
          @click="showSessionHistory = !showSessionHistory"
          title="会话历史"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </button>
        <span class="app-title">ParallelChat</span>
      </div>
      <LayoutSelector
        :current-layout="currentLayout"
        :custom-layouts="customLayouts"
        @select="handleLayoutChange"
        @add-custom="handleAddCustomLayout"
        @delete-custom="handleDeleteCustomLayout"
      />
    </div>

    <!-- 最大化面板 -->
    <div v-if="isMaximized && maximizedPanelIndex !== null" class="maximized-container">
      <WebViewPanel
        :platform="visiblePlatforms[maximizedPanelIndex]"
        :slot-index="maximizedPanelIndex"
        :is-maximized="true"
        @change-platform="handleChangePlatform"
        @toggle-maximize="handleToggleMaximize"
      />
    </div>

    <!-- 自定义布局容器 -->
    <ResizableLayout
      v-else-if="isCustomLayout && currentCustomConfig"
      :config="currentCustomConfig"
      @update:config="handleCustomConfigUpdate"
      class="resizable-container"
    >
      <div
        v-for="(platform, index) in visiblePlatforms"
        :key="`${platform.id}-${index}`"
        class="grid-item"
      >
        <WebViewPanel
          :platform="platform"
          :slot-index="index"
          @change-platform="handleChangePlatform"
          @toggle-maximize="handleToggleMaximize"
        />
      </div>
    </ResizableLayout>

    <!-- 预设布局容器 -->
    <div v-else :class="['grid-container', layoutClass]">
      <div
        v-for="(platform, index) in visiblePlatforms"
        :key="`${platform.id}-${index}`"
        class="grid-item"
      >
        <WebViewPanel
          :platform="platform"
          :slot-index="index"
          @change-platform="handleChangePlatform"
          @toggle-maximize="handleToggleMaximize"
        />
      </div>
    </div>

    <!-- 平台选择弹窗 -->
    <PlatformSelector
      :platforms="allPlatforms"
      :visible="showPlatformSelector"
      :current-platform-id="editingSlotIndex !== null ? slotPlatforms[editingSlotIndex] : undefined"
      @select="handlePlatformSelect"
      @close="closePlatformSelector"
    />

    <!-- 底部输入框 -->
    <div class="input-container">
      <!-- 发送结果提示 -->
      <div v-if="sendResults.length > 0" class="send-results">
        <div 
          v-for="result in sendResults" 
          :key="result.platformId"
          :class="['result-item', { success: result.success, error: !result.success }]"
        >
          <span class="result-platform">{{ result.platformId }}</span>
          <span class="result-message">{{ result.message }}</span>
        </div>
      </div>

      <!-- 图片预览区 -->
      <div v-if="attachedImages.length > 0" class="image-preview-container">
        <div 
          v-for="img in attachedImages" 
          :key="img.id" 
          class="image-preview-item"
        >
          <img :src="img.dataUrl" alt="附件图片" class="preview-image" />
          <button 
            class="remove-image-btn" 
            @click="removeImageAttachment(img.id)"
            title="移除图片"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div :class="['input-wrapper', { focused: isInputFocused, sending: isSending }]">
        <textarea
          v-model="inputMessage"
          class="message-input"
          placeholder="输入消息，可粘贴图片，同时发送给所有 AI..."
          rows="1"
          :disabled="isSending"
          @focus="isInputFocused = true"
          @blur="isInputFocused = false"
          @keydown="handleKeyDown"
          @paste="handlePaste"
        ></textarea>
        <button 
          :class="['send-btn', { active: canSend }]"
          :disabled="!canSend"
          @click="handleSend"
        >
          <svg v-if="!isSending" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>
      <div class="input-hint">
        按 Enter 发送，Shift + Enter 换行 | 支持粘贴图片 (Ctrl/Cmd + V)
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  height: 44px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.history-btn:hover {
  background-color: #333;
  color: #fff;
}

.history-btn.active {
  background-color: #646cff;
  color: #fff;
}

.app-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.grid-container {
  flex: 1;
  display: grid;
  gap: 4px;
  padding: 4px;
  background-color: #333;
  overflow: hidden;
}

.resizable-container {
  flex: 1;
  padding: 4px;
  background-color: #333;
  overflow: hidden;
}

/* 最大化容器 */
.maximized-container {
  flex: 1;
  background-color: #333;
  overflow: hidden;
}

/* 左右二分布局 */
.layout-two-horizontal {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

/* 上下二分布局 */
.layout-two-vertical {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
}

/* 上二下一布局 */
.layout-three-top2-bottom1 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.layout-three-top2-bottom1 .grid-item:nth-child(3) {
  grid-column: 1 / -1;
}

/* 上一下二布局 */
.layout-three-top1-bottom2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.layout-three-top1-bottom2 .grid-item:nth-child(1) {
  grid-column: 1 / -1;
}

/* 四分格布局 */
.layout-four-grid {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

/* 竖三排布局 */
.layout-three-vertical {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
}

.grid-item {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* 底部输入框样式 */
.input-container {
  padding: 12px 16px 16px;
  background-color: #1a1a1a;
  border-top: 1px solid #333;
  flex-shrink: 0;
}

/* 图片预览区 */
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background-color: #2a2a2a;
  border-radius: 12px;
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #3a3a3a;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background-color: #ef4444;
  transform: scale(1.1);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.input-wrapper.focused {
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.message-input {
  flex: 1;
  min-height: 24px;
  max-height: 120px;
  padding: 0;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
}

.message-input::placeholder {
  color: #666;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background-color: #3a3a3a;
  color: #666;
  cursor: not-allowed;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn.active {
  background-color: #646cff;
  color: #fff;
  cursor: pointer;
}

.send-btn.active:hover {
  background-color: #5558e3;
  transform: scale(1.05);
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #555;
  text-align: center;
}

/* 发送结果提示 */
.send-results {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.result-item.success {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.result-item.error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.result-platform {
  font-weight: 600;
}

.result-message {
  opacity: 0.8;
}

/* 发送中状态 */
.input-wrapper.sending {
  opacity: 0.7;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #666;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
