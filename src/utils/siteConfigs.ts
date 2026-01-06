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
  },
  {
    id: 'deepseek',
    domains: ['chat.deepseek.com'],
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    color: '#4d6bfe',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      '[data-testid="send-button"]',
      '.send-button'
    ],
    textInputMethod: 'simulate'
  },
  {
    id: 'doubao',
    domains: ['doubao.com', 'www.doubao.com'],
    name: '豆包',
    url: 'https://www.doubao.com',
    color: '#ff6b35',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="发送"]',
      'button[aria-label*="Send"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  },
  {
    id: 'qianwen',
    domains: ['tongyi.aliyun.com', 'qianwen.aliyun.com'],
    name: '通义千问',
    url: 'https://tongyi.aliyun.com/qianwen',
    color: '#6366f1',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="发送"]',
      'button[aria-label*="Send"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  },
  {
    id: 'hunyuan',
    domains: ['hunyuan.tencent.com'],
    name: '腾讯混元',
    url: 'https://hunyuan.tencent.com',
    color: '#00a4ff',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="发送"]',
      'button[aria-label*="Send"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  },
  {
    id: 'yuanbao',
    domains: ['yuanbao.tencent.com'],
    name: '腾讯元宝',
    url: 'https://yuanbao.tencent.com',
    color: '#fa541c',
    textareaSelectors: [
      'div[contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea'
    ],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="发送"]',
      'button[aria-label*="Send"]',
      '.send-button'
    ],
    textInputMethod: 'contenteditable_safe'
  },
  {
    id: 'yiyan',
    domains: ['yiyan.baidu.com'],
    name: '文心一言',
    url: 'https://yiyan.baidu.com',
    color: '#2932e1',
    textareaSelectors: [
      'div[contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea'
    ],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="发送"]',
      'button[aria-label*="Send"]',
      '.send-button'
    ],
    textInputMethod: 'contenteditable_safe'
  },
  {
    id: 'perplexity',
    domains: ['www.perplexity.ai', 'perplexity.ai'],
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    color: '#20b2aa',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="Submit"]',
      'button[aria-label*="Send"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  },
  {
    id: 'poe',
    domains: ['poe.com'],
    name: 'Poe',
    url: 'https://poe.com',
    color: '#7c3aed',
    textareaSelectors: ['textarea'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="Send"]',
      'button[aria-label*="Submit"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  },
  {
    id: 'kimi',
    domains: ['kimi.moonshot.cn'],
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    color: '#6366f1',
    textareaSelectors: ['textarea', 'div[contenteditable="true"]'],
    sendButtonSelectors: [
      'button[type="submit"]',
      'button:has(svg)',
      'button[aria-label*="发送"]',
      '.send-button'
    ],
    textInputMethod: 'direct'
  },

]

// 根据ID获取配置
export function getSiteConfigById(id: string): SiteConfig | undefined {
  return SITE_CONFIGS.find(config => config.id === id)
}



