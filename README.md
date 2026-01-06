# ParallelChat

> Chat with multiple AI platforms simultaneously in one window.

[![GitHub Release](https://img.shields.io/github/v/release/dingli/ParallelChat)](https://github.com/dingli/ParallelChat/releases)
[![GitHub Build](https://github.com/dingli/ParallelChat/actions/workflows/release.yml/badge.svg)](https://github.com/dingli/ParallelChat/actions/workflows/release.yml)
[![GitHub License](https://img.shields.io/github/license/dingli/ParallelChat)](https://github.com/dingli/ParallelChat/blob/main/LICENSE)

## Features

- **Multi-Platform Support**: ChatGPT, Claude, Gemini, Grok and more AI platforms in one window
- **Flexible Layouts**: Multiple preset layouts (2x2 grid, horizontal split, vertical split, etc.)
- **Custom Layouts**: Create your own layout with resizable panels
- **Unified Input**: Send the same message to all AI platforms at once
- **Panel Maximize**: Double-click to maximize any panel for detailed viewing

## Screenshots

<!-- Add your screenshots here -->

## Download

Download the latest version from [Releases](https://github.com/dingli/ParallelChat/releases):

| Platform | Download |
|----------|----------|
| Windows | `.exe` installer |
| macOS | `.dmg` file |
| Linux | `.AppImage` file |

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/dingli/ParallelChat.git

# Enter the project directory
cd ParallelChat

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for current platform
npm run build
```

## Tech Stack

- **Framework**: Electron + Vue 3 + Vite
- **Language**: TypeScript
- **UI**: Custom components with CSS

## Project Structure

```
├── electron/
│   ├── main/         # Electron main process
│   └── preload/      # Preload scripts
├── src/
│   ├── components/   # Vue components
│   ├── utils/        # Utility functions
│   └── App.vue       # Main application
├── public/           # Static assets
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
