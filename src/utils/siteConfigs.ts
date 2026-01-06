// 网站配置 - 定义每个AI网站的输入框和发送按钮选择器
export interface SiteConfig {
  id: string
  domains: string[]
  name: string
  url: string
  color: string
  textareaSelectors: string[]
  sendButtonSelectors: string[]
  textInputMethod: 'direct' | 'simulate' | 'chatgpt_safe' | 'gemini_safe' | 'contenteditable_safe'
}

export const SITE_CONFIGS: SiteConfig[] = [
  {
    id: 'chatgpt',
    domains: ['chatgpt.com', 'chat.openai.com'],
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    color: '#10a37f',
    textareaSelectors: [
      'div[contenteditable="true"]',
      'textarea',
      '[contenteditable="true"]'
    ],
    sendButtonSelectors: [
      'button[data-testid="send-button"]',
      'button[aria-label*="Send"]',
      'button:has(svg)',
      'button[type="submit"]'
    ],
    textInputMethod: 'chatgpt_safe'
  },
  {
    id: 'gemini',
    domains: ['gemini.google.com'],
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: '#4285f4',
    textareaSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea',
      '[contenteditable="true"]'
    ],
    sendButtonSelectors: [
      'button[aria-label*="Send"]',
      'button[aria-label*="发送"]',
      'button:has(svg)',
      'button[type="submit"]',
      'button[data-testid="send-button"]'
    ],
    textInputMethod: 'gemini_safe'
  },
  {
    id: 'claude',
    domains: ['claude.ai'],
    name: 'Claude',
    url: 'https://claude.ai',
    color: '#d97706',
    textareaSelectors: [
      'div[contenteditable="true"]',
      'textarea',
      '[contenteditable="true"]'
    ],
    sendButtonSelectors: [
      'button[aria-label*="Send"]',
      'button:has(svg)',
      'button[type="submit"]'
    ],
    textInputMethod: 'contenteditable_safe'
  },
  {
    id: 'grok',
    domains: ['grok.com', 'x.com'],
    name: 'Grok',
    url: 'https://grok.com',
    color: '#1da1f2',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="Send"]',
      'button[data-testid="send-button"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  }
]

// 根据ID获取配置
export function getSiteConfigById(id: string): SiteConfig | undefined {
  return SITE_CONFIGS.find(config => config.id === id)
}

