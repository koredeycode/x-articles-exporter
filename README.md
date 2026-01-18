# 📰 X Articles Exporter

**Export X (Twitter) Articles to professionally formatted PDFs with one click.**

A privacy-focused browser extension that allows you to save your favorite long-form content from X.com as clean, readable, and printable PDF documents.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Plasmo](https://img.shields.io/badge/Made%20With-Plasmo-purple.svg)](https://docs.plasmo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

- **Professional Formatting**: Generates a clean layout with a dedicated Title Page and Table of Contents.
- **Rich Text Support**: Preserves bold, italic, and embedded links.
- **Image Handling**: Automatically includes the cover image and inline images from the article.
- **Customization Options**:
  - **Theme**: Light and Dark modes.
  - **Page Size**: **A4** and **Letter** support with dynamic resizing (no clipping).
  - **Font Style**: Toggle between **Serif** (Times) and **Sans-Serif** (Helvetica) for a personalized reading experience.
- **Smart Metadata**: Captures author details, publication date, and original URL.
- **Privacy First**: All processing happens locally in your browser. No data is sent to external servers.

## 🚀 How to Use

1. **Install the Extension** (load the unpacked extension in Chrome/Edge/Brave).
2. **Navigate to an Article**: Go to any X Article page (e.g., `https://x.com/username/article/...`).
3. **Click Export**: Look for the **"Export to PDF"** button injected into the bottom-right corner of the page.
   - *Shortcut*: You can also press `Alt + P` to trigger the export.
4. **Customize**: Click the extension icon in your browser toolbar to change settings:
   - **Theme**: Light / Dark
   - **Page Size**: A4 / Letter
   - **Font Style**: Serif / Sans

## 🛠️ Development

This project is built with [Plasmo](https://docs.plasmo.com/), a modern framework for browser extensions.

### Prerequisites
- Node.js
- pnpm (recommended) or npm

### Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open your browser's extension management page (e.g., `chrome://extensions`).
   - Enable "Developer Mode".
   - Click "Load unpacked" and select the `build/chrome-mv3-dev` folder from this project.

### Building for Production

To create a production-ready bundle:

```bash
pnpm build
```

The output will be in the `build/chrome-mv3-prod` directory, ready to be zipped and published.

## 📄 Output Format

The generated PDF includes:
1.  **Title Page**: Large typographic title, smart-fitted cover image, author name, and metadata.
2.  **Table of Contents**: Clickable links to section headers, including the Notes page.
3.  **Content Pages**: The article body with numbering and a consistent sidebar layout.
4.  **Notes Page**: A clean, ruled section at the end for your annotations and thoughts.

## 👤 Author

**Yusuf Akorede**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/koredeycode)
[![Twitter/X](https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white)](https://x.com/korecodes)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://ng.linkedin.com/in/koredeycode)
[![Website](https://img.shields.io/badge/Website-000000?style=flat&logo=vercel&logoColor=white)](https://korecodes.is-a.dev)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:koredey4u@gmail.com)

## 📄 License

MIT
