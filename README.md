# ParallelChat

<p align="center">
  <img src="public/logo.png" alt="ParallelChat Logo" width="128" height="128">
</p>

<p align="center">
  <strong>多 AI 并行对话客户端 - 在一个窗口中同时与 ChatGPT、Claude、Gemini、Grok 对话</strong>
</p>

<p align="center">
  <a href="https://github.com/linkedlist771/ParallelChat/releases">
    <img src="https://img.shields.io/github/v/release/linkedlist771/ParallelChat" alt="GitHub Release">
  </a>
  <a href="https://github.com/linkedlist771/ParallelChat/actions/workflows/release.yml">
    <img src="https://github.com/linkedlist771/ParallelChat/actions/workflows/release.yml/badge.svg" alt="Build Status">
  </a>
  <a href="https://github.com/linkedlist771/ParallelChat/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/linkedlist771/ParallelChat" alt="License">
  </a>
</p>

---



https://github.com/user-attachments/assets/d16f9320-1974-4518-9442-4683176bb9d3



## ✨ 功能特点

- 🖥️ **多平台并行** - 同时显示 ChatGPT、Claude、Gemini、Grok 等多个 AI 平台
- 📐 **灵活布局** - 5 种预设布局（左右分屏、上下分屏、四分格等）
- 🎨 **自定义布局** - 可创建自定义布局，拖动调整每个面板大小
- 📤 **统一发送** - 一键将消息同时发送给所有 AI
- 🔍 **面板最大化** - 双击标题栏全屏查看单个 AI
- 💾 **会话保存** - 保存当前会话状态，随时恢复
- 🔐 **登录持久化** - 各平台登录状态独立保存，无需重复登录



## 📥 下载安装

前往 [Releases 页面](https://github.com/linkedlist771/ParallelChat/releases) 下载最新版本：



### macOS 用户注意

首次打开时可能会提示 **"ParallelChat 已损坏，无法打开"** 或 **"无法验证开发者"**，这是因为应用没有 Apple 签名。

**解决方法：**

打开终端，运行以下命令移除隔离属性：

```bash
xattr -cr /Applications/ParallelChat.app
```

或者如果是在 Downloads 文件夹：

```bash
xattr -cr ~/Downloads/ParallelChat.app
```

然后就可以正常打开了。


## 🚀 使用方法

### 1. 登录各 AI 平台

首次使用时，需要在各个面板中分别登录你的 AI 账号：
- 点击对应面板，正常进行登录操作
- 登录状态会自动保存，下次打开无需重新登录

### 2. 切换布局

点击顶部工具栏的布局按钮，选择合适的布局：
- **左右二分** - 两个面板左右排列
- **上下二分** - 两个面板上下排列
- **上二下一 / 上一下二** - 三面板布局
- **四分格** - 四个面板 2×2 排列
- **自定义** - 点击 `+` 创建可调整大小的自定义布局

### 3. 并行发送消息

在底部输入框输入消息，按 `Enter` 或点击发送按钮，消息会同时发送到所有可见的 AI 平台。

### 4. 单独查看

双击某个面板的标题栏，可以最大化该面板，方便详细查看回复。再次双击恢复多面板视图。

### 5. 保存会话

点击左上角的按钮，可以：
- **保存当前会话** - 保存当前布局和各面板的对话位置
- **恢复历史会话** - 点击列表中的记录恢复到之前的状态

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送消息 |
| `Shift + Enter` | 输入换行 |
| `双击标题栏` | 最大化/还原面板 |

## 🛠️ 技术栈

- **框架**: Electron + Vue 3 + Vite
- **语言**: TypeScript
- **构建**: electron-builder

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新内容。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

---

<p align="center">
  如果这个项目对你有帮助，欢迎给个 ⭐️ Star！
</p>
