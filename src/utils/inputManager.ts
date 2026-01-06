import type { SiteConfig } from './siteConfigs'

/**
 * 输入管理器 - 负责向WebView注入文本并触发发送
 * 基于Chrome Extension的实现方案，适配Electron WebView
 */
export class InputManager {
  private siteConfig: SiteConfig

  constructor(siteConfig: SiteConfig) {
    this.siteConfig = siteConfig
  }

  /**
   * 生成查找输入框的脚本
   */
  getFindTextareaScript(): string {
    const selectors = JSON.stringify(this.siteConfig.textareaSelectors)
    
    return `
      (function() {
        const selectors = ${selectors};
        
        // 检查元素是否可见
        function isElementVisible(element) {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0' &&
                 rect.width > 0 && 
                 rect.height > 0;
        }
        
        // 检查是否是有效的文本输入元素
        function isValidTextInput(element) {
          if (!element) return false;
          const isEditable = element.contentEditable === 'true' || 
                            element.tagName.toLowerCase() === 'textarea';
          const isNotReadonly = !element.readOnly && !element.disabled;
          return isEditable && isNotReadonly;
        }
        
        // 检查元素是否在聊天历史中（避免选错）
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
        
        // 优先查找聚焦的输入框
        for (const selector of selectors) {
          try {
            const focused = document.querySelector(selector + ':focus');
            if (focused && isValidTextInput(focused) && isElementVisible(focused)) {
              return { found: true, selector: selector };
            }
          } catch (e) {}
        }
        
        // 查找可见的输入框
        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              if (isValidTextInput(element) && isElementVisible(element) && !isInChatHistory(element)) {
                return { found: true, selector: selector };
              }
            }
          } catch (e) {}
        }
        
        return { found: false, error: '未找到输入框' };
      })()
    `
  }

  /**
   * 生成设置文本并发送的脚本
   */
  getSetTextAndSendScript(text: string): string {
    const escapedText = JSON.stringify(text)
    const selectors = JSON.stringify(this.siteConfig.textareaSelectors)
    const buttonSelectors = JSON.stringify(this.siteConfig.sendButtonSelectors)
    const inputMethod = this.siteConfig.textInputMethod

    return `
      (function() {
        const text = ${escapedText};
        const selectors = ${selectors};
        const buttonSelectors = ${buttonSelectors};
        const inputMethod = '${inputMethod}';
        
        // 工具函数
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
        
        // 查找输入框
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
        
        // 查找发送按钮
        function findSendButton() {
          for (const selector of buttonSelectors) {
            try {
              const button = document.querySelector(selector);
              if (button && button.offsetParent !== null) {
                return button;
              }
            } catch (e) {}
          }
          
          // 备用：按文本查找
          const buttons = document.querySelectorAll('button');
          for (const button of buttons) {
            const btnText = button.textContent || button.innerText || '';
            if ((btnText.includes('发送') || btnText.includes('Send') || btnText.includes('提交')) && 
                button.offsetParent !== null) {
              return button;
            }
          }
          return null;
        }
        
        // 安全地触发事件
        function safeDispatchEvent(element, eventType) {
          try {
            const event = new Event(eventType, { bubbles: true, cancelable: true });
            element.dispatchEvent(event);
          } catch (e) {}
        }
        
        // 触发React事件
        function triggerReactEvents(element, text) {
          ['focus', 'input', 'change'].forEach(eventType => {
            try {
              const event = new Event(eventType, { bubbles: true, cancelable: true });
              if (eventType === 'input') {
                Object.defineProperty(event, 'inputType', { value: 'insertText' });
                Object.defineProperty(event, 'data', { value: text });
              }
              element.dispatchEvent(event);
            } catch (e) {}
          });
          
          if (element._valueTracker) {
            element._valueTracker.setValue('');
          }
        }
        
        // 直接设置文本
        function directSetText(element, text) {
          element.focus();
          if (element.tagName.toLowerCase() === 'textarea') {
            element.value = text;
            element.selectionStart = element.selectionEnd = element.value.length;
          } else {
            element.textContent = text;
          }
          safeDispatchEvent(element, 'input');
          safeDispatchEvent(element, 'change');
        }
        
        // ChatGPT安全输入
        async function chatgptSafeInput(element, text) {
          element.focus();
          await new Promise(r => setTimeout(r, 50));
          
          // 清空现有内容
          try {
            document.execCommand('selectAll');
            await new Promise(r => setTimeout(r, 30));
            document.execCommand('delete');
          } catch (e) {
            if (element.tagName.toLowerCase() === 'textarea') {
              element.value = '';
            } else {
              element.textContent = '';
            }
          }
          
          // 设置新内容
          if (element.tagName.toLowerCase() === 'textarea') {
            element.value = text;
          } else {
            element.textContent = text;
          }
          
          triggerReactEvents(element, text);
        }
        
        // Gemini安全输入
        async function geminiSafeInput(element, text) {
          element.focus();
          await new Promise(r => setTimeout(r, 50));
          
          // 清空
          try {
            document.execCommand('selectAll');
            await new Promise(r => setTimeout(r, 30));
            document.execCommand('delete');
          } catch (e) {
            element.textContent = '';
          }
          
          // 逐字符输入（避免CSP问题）
          for (let i = 0; i < text.length; i++) {
            if (element.tagName.toLowerCase() === 'textarea') {
              element.value = text.substring(0, i + 1);
            } else {
              element.textContent = text.substring(0, i + 1);
            }
            safeDispatchEvent(element, 'input');
            if (i % 10 === 0) {
              await new Promise(r => setTimeout(r, 10));
            }
          }
        }
        
        // ContentEditable安全输入
        async function contenteditableSafeInput(element, text) {
          element.focus();
          await new Promise(r => setTimeout(r, 50));
          
          // 清空
          try {
            document.execCommand('selectAll');
            await new Promise(r => setTimeout(r, 30));
            document.execCommand('delete');
          } catch (e) {
            element.textContent = '';
          }
          
          element.textContent = text;
          safeDispatchEvent(element, 'input');
          safeDispatchEvent(element, 'change');
        }
        
        // 主逻辑
        async function main() {
          const textarea = findTextarea();
          if (!textarea) {
            return { success: false, error: '未找到输入框' };
          }
          
          try {
            // 根据输入方法设置文本
            switch (inputMethod) {
              case 'chatgpt_safe':
                await chatgptSafeInput(textarea, text);
                break;
              case 'gemini_safe':
                await geminiSafeInput(textarea, text);
                break;
              case 'contenteditable_safe':
                await contenteditableSafeInput(textarea, text);
                break;
              case 'direct':
              default:
                directSetText(textarea, text);
                break;
            }
            
            // 等待UI更新
            await new Promise(r => setTimeout(r, 200));
            
            // 查找并点击发送按钮
            const sendButton = findSendButton();
            if (sendButton && !sendButton.disabled) {
              sendButton.click();
              return { success: true, message: '已发送' };
            } else {
              return { success: true, message: '已输入文本，但未找到可用的发送按钮' };
            }
          } catch (e) {
            return { success: false, error: e.message || '发送失败' };
          }
        }
        
        return main();
      })()
    `
  }

  /**
   * 生成仅设置文本的脚本（不发送）
   */
  getSetTextOnlyScript(text: string): string {
    const escapedText = JSON.stringify(text)
    const selectors = JSON.stringify(this.siteConfig.textareaSelectors)
    const inputMethod = this.siteConfig.textInputMethod

    return `
      (function() {
        const text = ${escapedText};
        const selectors = ${selectors};
        const inputMethod = '${inputMethod}';
        
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
        if (textarea.tagName.toLowerCase() === 'textarea') {
          textarea.value = text;
        } else {
          textarea.textContent = text;
        }
        safeDispatchEvent(textarea, 'input');
        safeDispatchEvent(textarea, 'change');
        
        return { success: true, message: '已输入文本' };
      })()
    `
  }

  /**
   * 生成模拟粘贴事件的脚本（用于粘贴图片）
   * 这个脚本会聚焦输入框，准备接收粘贴事件
   */
  getSimulatePasteScript(): string {
    const selectors = JSON.stringify(this.siteConfig.textareaSelectors)

    return `
      (function() {
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
        
        const textarea = findTextarea();
        if (!textarea) {
          return { success: false, error: '未找到输入框' };
        }
        
        // 聚焦输入框
        textarea.focus();
        
        return { success: true, message: '已聚焦输入框，等待粘贴' };
      })()
    `
  }

  /**
   * 生成点击发送按钮的脚本
   */
  getClickSendButtonScript(): string {
    const buttonSelectors = JSON.stringify(this.siteConfig.sendButtonSelectors)

    return `
      (function() {
        const buttonSelectors = ${buttonSelectors};
        
        function findSendButton() {
          for (const selector of buttonSelectors) {
            try {
              const button = document.querySelector(selector);
              if (button && button.offsetParent !== null) {
                return button;
              }
            } catch (e) {}
          }
          
          // 备用：按文本查找
          const buttons = document.querySelectorAll('button');
          for (const button of buttons) {
            const btnText = button.textContent || button.innerText || '';
            if ((btnText.includes('发送') || btnText.includes('Send') || btnText.includes('提交')) && 
                button.offsetParent !== null) {
              return button;
            }
          }
          return null;
        }
        
        const sendButton = findSendButton();
        if (sendButton && !sendButton.disabled) {
          sendButton.click();
          return { success: true, message: '已点击发送按钮' };
        } else {
          return { success: false, error: '未找到可用的发送按钮' };
        }
      })()
    `
  }
}

