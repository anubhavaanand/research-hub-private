# Research Hub - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm v6 or higher
- A modern web browser

---

## 📦 Installation

### 1. Clone Repository
```bash
git clone https://github.com/anubhavaanand/research-hub-private.git
cd research-hub-private
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key (Optional)
```bash
cp .env.example .env
# Edit .env and add your Google Gemini API key
```

### 4. Start Development
```bash
npm run dev
# Visit http://localhost:3000
```

---

## 🏗️ Build for Production

```bash
npm run build    # Creates dist/ folder
npm run preview  # Preview production build
```

---

## 🌐 Deployment

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### Netlify / Vercel
- Build command: `npm run build`
- Publish directory: `dist`

---

## ⚙️ Environment Variables

Create `.env` file:
```env
API_KEY=your_google_gemini_api_key
```

Get API key: https://aistudio.google.com/app/apikey

---

## 🐛 Troubleshooting

**Port in use:** `npm run dev -- --port 3001`

**Module errors:** `rm -rf node_modules && npm install`

**Build errors:** `rm -rf node_modules/.vite && npm run dev`

---

**Happy researching! 📚**
