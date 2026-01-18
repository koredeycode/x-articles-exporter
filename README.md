# X Articles Exporter

**Export X (Twitter) Articles to professionally formatted PDFs with one click.**

X Articles Exporter is a privacy-focused browser extension that allows you to save your favorite long-form content from X.com as clean, readable, and printable PDF documents.

## ✨ Features

- **Professional Formatting**: Generates a clean layout with a dedicated Title Page and Table of Contents.
- **Rich Text Support**: Preserves bold, italic, and embedded links.
- **Image Handling**: Automatically includes the cover image and inline images from the article.
- **Theme Support**: Choose between **Light** and **Dark** PDF themes to match your reading preference.
- **Page Size Options**: Supports standard **A4** and **Letter** page sizes.
- **Smart Metadata**: Captures author details, publication date, and original URL.
- **Privacy First**: All processing happens locally in your browser. No data is sent to external servers.

## 🚀 How to Use

1. **Install the Extension** (load the unpacked extension in Chrome/Edge/Brave).
2. **Navigate to an Article**: Go to any X Article page (e.g., `https://x.com/username/article/...`).
3. **Click Export**: Look for the **"Export to PDF"** button injected into the bottom-right corner of the page.
   - *Shortcut*: You can also press `Alt + P` to trigger the export.
4. **Customize**: Click the extension icon in your browser toolbar to change settings:
   - **Theme**: Toggle between Light and Dark mode.
   - **Page Size**: Select A4 or Letter.

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

## 📄 output Format

The generated PDF includes:
1.  **Title Page**: Large typographic title, author name, cover image, and metadata.
2.  **Table of Contents**: Clickable links to section headers.
3.  **Content Pages**: The article body with numbering and a consistent sidebar layout.

## 👤 Author

Built by [@korecodes](https://x.com/korecodes).

## 📄 License

MIT
