# Research Hub - Setup Guide

## 🚀 Quick Start

Research Hub is a desktop application for managing academic research papers with citation generation capabilities.

---

## 📦 Installation Options

### **Option A: Run from Source** (Developers)

#### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/) (optional)

#### Steps

1. **Clone or Download**
   ```bash
   git clone https://github.com/anubhavaanand/research-hub.git
   cd research-hub
   ```
   
   *Or download ZIP from GitHub and extract*

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the App**
   ```bash
   npm run start:electron
   ```

That's it! The app will open in a desktop window.

---

### **Option B: Install Desktop App** (Coming Soon)

Pre-built installers for Windows, macOS, and Linux will be available soon.

Download the appropriate installer for your platform:
- **Windows**: `Research-Hub-Setup-1.0.0.exe`
- **macOS**: `Research-Hub-1.0.0.dmg`
- **Linux**: `Research-Hub-1.0.0.AppImage`

Double-click to install and run like any other application!

---

## 🎯 First-Time Setup

### 1. **Upload Your First Document**
- Click **Upload** in the navigation
- Drag & drop a PDF or click **Browse Files**
- Add tags and notes (optional)

### 2. **Organize with Folders**
- Click **Create Folder** on the home page
- Move documents into folders for organization

### 3. **Generate Citations** (For Academic Papers)
When uploading:
- Select "Journal Paper" or "Conference Paper"
- Fill in authors, year, publication name
- Click the **Cite** button to generate APA & IEEE citations

### 4. **Search & Filter**
- Use the **Search** tab to find documents
- Filter by file type, date, folder, or tags

### 5. **Backup Your Data**
- Go to **Profile** tab
- Click **Export Data** to download a backup JSON file
- Use **Import Data** to restore from backup

---

## ⚙️ System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.13+, or modern Linux
- **RAM**: 2 GB
- **Disk Space**: 100 MB + storage for your documents
- **Display**: 1024x768 or higher

### Recommended
- **RAM**: 4 GB or more
- **Display**: 1920x1080 or higher

---

## 🔧 Development Setup

### Run in Development Mode
```bash
npm run dev
```
This starts a local server on `http://localhost:3000` and opens the app with live reload.

### Build for Production
```bash
npm run dist
```
Creates installers in the `dist/` folder.

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

---

## 🗂️ Project Structure

```
research-hub/
├── index.html              # Main HTML file
├── electron-main.js        # Electron entry point
├── package.json            # Dependencies & scripts
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application logic
│   ├── document-manager.js # Document CRUD operations
│   ├── ui-manager.js       # UI interactions & modals
│   ├── storage-manager.js  # localStorage abstraction
│   └── citation-generator.js # APA & IEEE citations
└── assets/                 # Icons & images
```

---

## 🎨 Features Overview

### Core Features
- 📤 **Upload Documents**: PDF, DOCX, images, text files
- 📁 **Folder Organization**: Create folders and organize documents
- 🔍 **Search & Filter**: Find documents by name, tags, type, date
- 👁️ **Preview**: View PDFs and images in-app
- 📥 **Download**: Save documents to your computer

### Academic Features
- 📚 **Citation Generation**: APA 7th Edition & IEEE formats
- 📊 **Citation Analytics**: Track citation usage over time
- 🏷️ **Metadata**: Authors, year, publication, volume, pages

### Productivity
- 🌙 **Dark Mode**: Toggle between light and dark themes
- ⌨️ **Keyboard Shortcuts**: Ctrl+H/U/D/F/K for quick navigation
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- 💾 **Auto-save**: All changes saved automatically

---

## 🔐 Data Storage

All your data is stored **locally** on your computer using browser localStorage:
- No cloud servers involved
- Your data never leaves your device
- Privacy-focused design

### Backup Recommendations
- Use **Export Data** regularly to create backups
- Save the JSON file to cloud storage (Dropbox, Google Drive, etc.)
- Use **Import Data** to restore from backup if needed

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+H` | Go to Home |
| `Ctrl+U` | Go to Upload |
| `Ctrl+D` | Go to Documents |
| `Ctrl+F` | Go to Search |
| `Ctrl+K` | Toggle Theme |
| `Ctrl+N` | New Document |
| `Ctrl+O` | Open Documents |
| `Escape` | Close Modal |

*(Use `Cmd` instead of `Ctrl` on macOS)*

---

## 🐛 Troubleshooting

### App Won't Start
1. Make sure Node.js is installed: `node --version`
2. Delete `node_modules` and run `npm install` again
3. Check console for errors: `npm run start:electron`

### Documents Not Saving
- Check browser localStorage isn't full (50MB limit)
- Try clearing some old documents
- Export data and re-import after clearing

### Preview Not Working
- PDF preview requires a PDF viewer in your browser
- For DOC/DOCX files, use the Download button
- Images should preview normally

### Cache Errors on Windows
```
ERROR:cache_util_win.cc Unable to move the cache
```
This is a harmless warning and doesn't affect functionality. You can ignore it.

---

## 📖 Usage Tips

### Best Practices
1. **Regular Backups**: Export data weekly to avoid loss
2. **Folder Structure**: Create folders by project or topic
3. **Tags**: Use consistent tags (e.g., "machine-learning", "2024")
4. **Academic Papers**: Fill in all citation fields for best results
5. **Notes**: Add context in notes for future reference

### Citation Tips
- Enter authors as: "Last, First"
- Separate multiple authors with commas
- Include publication name for accurate citations
- Use volume/issue/pages for journal papers

---

## 🤝 Contributing

Want to contribute? Great!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

- **Issues**: https://github.com/anubhavaanand/research-hub/issues
- **Discussions**: https://github.com/anubhavaanand/research-hub/discussions
- **Documentation**: See README.md

---

## 🎉 Credits

Built with:
- [Electron](https://www.electronjs.org/) - Desktop app framework
- HTML5, CSS3, JavaScript - Core web technologies
- localStorage - Data persistence

---

**Version**: 1.0.0  
**Last Updated**: October 14, 2025  
**Status**: ✅ Production Ready

---

## Quick Reference Card

```
┌─────────────────────────────────────┐
│     Research Hub Quick Start        │
├─────────────────────────────────────┤
│                                     │
│  1. npm install                     │
│  2. npm run start:electron          │
│  3. Upload documents                │
│  4. Create folders                  │
│  5. Generate citations              │
│  6. Export backups regularly        │
│                                     │
└─────────────────────────────────────┘
```

Happy researching! 📚✨
