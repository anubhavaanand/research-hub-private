# Research Hub 📚

A modern, AI-powered academic research papers management system with intelligent citation generation. Built with React, TypeScript, and Google Gemini AI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)]()
[![React](https://img.shields.io/badge/React-19.0-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)]()
[![Status](https://img.shields.io/badge/status-Production%20Ready-success)]()

---

## ✨ Features

### 🤖 AI-Powered Citation Generation
- **Google Gemini Integration**: Intelligent citation generation using cutting-edge AI
- **Multiple Formats**: APA 7th, IEEE, Harvard, MLA 9
- **One-Click Generation**: Instantly create professional citations
- **Copy to Clipboard**: Easy citation copying

### 📚 Research Paper Management
- **Smart Organization**: Organize papers by type, status, and tags
- **Advanced Search**: Filter by authors, title, tags, and more
- **Reading Status**: Track "To Read", "Reading", and "Read" papers
- **Favorites System**: Star important papers for quick access

### 🎨 Modern UI/UX
- **Glass Morphism Design**: Beautiful, modern interface
- **Animated Background**: Dotted glow effects
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark mode

### 📊 Analytics & Insights
- **Year Distribution**: Visualize papers by publication year
- **Citation Tracking**: Track total citations across papers
- **Status Overview**: See reading progress at a glance
- **Smart Sorting**: Sort by date, year, or citations

---

## 🚀 Quick Start

### 🌐 Live Demo

**[Launch Web App →](https://anubhavaanand.github.io/research-hub-private/)**

### � Run Locally

```bash
# Clone repository
git clone https://github.com/anubhavaanand/research-hub-private.git
cd research-hub-private

# Install dependencies
npm install

# Set up API key (optional, for AI citations)
cp .env.example .env
# Edit .env and add your Google Gemini API key

# Start development server
npm run dev
# Visit http://localhost:3000
```

### 📦 Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

---

## 🔧 Configuration

### Google Gemini API Key

To enable AI-powered citation generation:

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env` file in the project root
3. Add your key: `API_KEY=your_api_key_here`

---

## 📚 Technology Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini AI (@google/genai)
- **Styling**: CSS3 with Glass Morphism
- **Icons**: Custom SVG components
- **Fonts**: Inter, JetBrains Mono

---

## 🎯 Usage

### Adding Papers

1. Click the **"+"** button in the sidebar
2. Upload a PDF or manually enter paper details
3. Select paper type (Journal, Conference, etc.)
4. Add authors, publication details, and tags
5. Click **"Add Paper"**

### Generating Citations

1. Select a paper from your library
2. Click the **"Generate Citation"** button in the details panel
3. Choose your preferred citation style (APA, IEEE, Harvard, MLA)
4. Click **"Generate"** to create citation using AI
5. Copy to clipboard with one click

### Organizing Papers

- **Filter by Type**: Journal, Conference, Book, Thesis, or Other
- **Filter by Status**: All, To Read, Reading, Read, Favorites
- **Search**: Type in the search box to filter by title, authors, or tags
- **Sort**: Choose from Date Added, Year, or Citations

---

## 🏗️ Project Structure

```
research-hub-private/
├── components/              # React components
│   ├── ArtifactCard.tsx    # Paper display card
│   ├── CitationGenerator.tsx # AI citation generator
│   ├── DottedGlowBackground.tsx # Animated background
│   ├── Icons.tsx           # SVG icon components
│   └── SideDrawer.tsx      # Side panel component
├── dist/                   # Production build output
├── index.html              # Entry HTML file
├── index.tsx               # Main React application
├── index.css               # Global styles
├── types.ts                # TypeScript type definitions
├── utils.ts                # Utility functions
├── constants.ts            # Application constants
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

---

## 🌟 Key Features Explained

### AI Citation Generation
Uses Google's Gemini AI to generate accurate, properly formatted citations in multiple academic styles. Simply provide paper metadata and let AI handle the formatting.

### Smart Paper Management
Organize your research with a flexible system that tracks reading status, allows tagging, and supports favorites for quick access to important papers.

### Modern Interface
Glass morphism design with smooth animations creates a professional, eye-friendly research environment.

### Responsive Design
Works seamlessly across devices - from large desktop monitors to tablets and smartphones.

---

## 🔒 Privacy & Data

- **Local Storage**: All paper data stored in browser localStorage
- **No Server**: No backend server, completely client-side
- **API Usage**: Google Gemini API only called when generating citations
- **Your Control**: Complete control over your research data

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI**: For intelligent citation generation
- **React Team**: For the amazing React library
- **Vite Team**: For the blazing-fast build tool
- **Inter Font**: For beautiful typography

---

**Made with ❤️ for better academic research management**

_Version 2.0.0 - Last updated: January 2026_

### 📚 **Academic Paper Management**

- **Paper Type Classification**: Distinguish between Journal Papers and Conference Papers
- **Rich Academic Metadata**: Authors, publication year, journal/conference name, volume, issue, pages
- **Citation Generation**: Professional APA 7th Edition and IEEE format citations
- **Academic Search**: Search by authors, publication names, and academic metadata
- **Research Organization**: Specialized folder structures for research topics

### 📝 **Citation Engine**

- **Multiple Formats**: APA 7th Edition and IEEE citations
- **Smart Author Handling**: Proper formatting for single, multiple, and extensive author lists
- **Copy to Clipboard**: One-click citation copying
- **Export Citations**: Save citations in JSON format for reference managers
- **Validation**: Ensures complete academic metadata for accurate citations

<!-- TODO: Add feature screenshot
![Document Management System](assets/banner.png)
-->

## ✨ Features

### 📁 Document Management

- **Upload Multiple File Types**: PDF, DOCX, TXT, images (JPG, PNG, GIF)
- **Drag & Drop Support**: Intuitive file upload experience
- **Document Preview**: View documents directly in the browser
- **File Operations**: Rename, move, download, and delete documents
- **Bulk Actions**: Select multiple documents for batch operations

### 🗂️ Organization

- **Folder System**: Create and manage folder hierarchies
- **Tagging**: Add multiple tags to documents for easy categorization
- **Notes**: Add personal notes to any document
- **Smart Sorting**: Sort by name, date, size, or type
- **Advanced Filtering**: Filter by type, folder, tags, and date range

### 🔍 Search & Discovery

- **Full-Text Search**: Search through document names, tags, and notes
- **Advanced Filters**: Combine multiple criteria for precise results
- **Recent Documents**: Quick access to recently viewed files
- **Activity Log**: Track all document activities and changes

### 🎨 User Experience

- **Clean, Modern UI**: Intuitive and professional interface
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation and screen reader support
- **Visual Feedback**: Toast notifications and loading indicators

### ⚙️ Settings & Data

- **Profile Management**: Customize user preferences
- **Data Export/Import**: Backup and restore your document library
- **Storage Management**: Monitor and optimize local storage usage
- **Activity Logging**: Detailed history of all actions

## 🚀 Quick Start

### Option 1: Simple Setup

1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Start uploading and managing your documents!

### Option 2: Local Server (Recommended)

1. Clone the repository:

  ```bash
  git clone https://github.com/anubhavaanand/research-hub-private.git
  cd research-hub-private
  ```

2. Start a local web server:

    ```bash
    # Using Python 3
    python -m http.server 8000

    # Using Node.js
    npx serve .

    # Using PHP
    php -S localhost:8000
    ```

3. Open your browser and navigate to `http://localhost:8000`

## 📱 Usage Guide

### Getting Started

1. **Upload Documents**: Click "Upload" in the navigation or use the quick
   action button
2. **Organize**: Create folders and add tags to keep documents organized
3. **Search**: Use the search feature to quickly find specific documents
4. **Preview**: Click the eye icon to preview documents without downloading

### Keyboard Shortcuts

- `Ctrl/Cmd + U`: Switch to Upload view
- `Ctrl/Cmd + D`: Switch to Documents view
- `Ctrl/Cmd + F`: Switch to Search view (focuses search input)
- `Ctrl/Cmd + H`: Switch to Home view
- `Ctrl/Cmd + K`: Toggle dark/light theme
- `Escape`: Close modals and mobile menu
- `Delete`: Delete selected documents (in bulk mode)

### Document Upload

1. **Single Upload**: Click "Browse Files" or drag files to the upload area
2. **Bulk Upload**: Select multiple files at once
3. **Organization**: Choose folder and add tags during upload
4. **Notes**: Add descriptive notes to documents

### Search and Filter

- **Quick Search**: Type in the search bar for instant results
- **Advanced Filters**: Use file type, date range, and folder filters
- **Tag Search**: Click on tags to filter documents
- **Combine Filters**: Mix and match criteria for precise results

### Bulk Operations

1. Click "Bulk Actions" in the Documents view
2. Select documents using checkboxes
3. Choose action: Download, Move, Add Tags, or Delete
4. Confirm the action

## 🏗️ Architecture

### File Structure

```
research-hub/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All CSS styles and themes
├── js/
│   ├── app.js             # Main application logic
│   ├── document-manager.js # Document management operations
│   ├── ui-manager.js      # User interface handling
│   └── storage-manager.js # Data persistence and storage
├── assets/                # Images and other assets
└── README.md             # This file
```

### Component Overview

#### App (`app.js`)

- Main application controller
- Navigation and view management
- Theme handling
- Global event coordination
- Keyboard shortcuts

#### DocumentManager (`document-manager.js`)

- Document CRUD operations
- Folder management
- Search and filtering logic
- Data validation
- Statistics generation

#### UIManager (`ui-manager.js`)

- User interface updates
- Modal dialogs
- Form handling
- File upload processing
- Toast notifications

#### StorageManager (`storage-manager.js`)

- localStorage operations
- Data import/export
- Activity logging
- Storage optimization
- Settings management

### Data Storage

The application uses browser localStorage to persist data:

- **Documents**: File metadata and base64-encoded content
- **Folders**: Folder structure and hierarchy
- **Settings**: User preferences and configuration
- **Activities**: Action history and logs

## 🔧 Customization

### Themes

The application supports light and dark themes. To add a new theme:

1. Add theme variables in `css/styles.css`:

```css
[data-theme='custom'] {
    --primary-color: #your-color;
    --bg-primary: #your-bg;
    /* ... other variables */
}
```

2. Update the theme toggle logic in `app.js`

### File Type Support

To add support for new file types:

1. Update the `getFileType()` method in `document-manager.js`
2. Add appropriate icons in the `getFileIcon()` method
3. Update file validation in `ui-manager.js`
4. Add preview support if needed

### Styling

The CSS uses CSS custom properties (variables) for easy customization:

- Colors: Modify color variables in `:root`
- Spacing: Adjust spacing variables
- Typography: Change font family and sizes
- Responsive: Modify breakpoints in media queries

## 🔒 Security & Privacy

### Data Security

- **Local Storage Only**: All data is stored locally in your browser
- **No Server Communication**: No data is sent to external servers
- **Client-Side Processing**: All operations happen in your browser
- **Data Control**: You have complete control over your data

### Privacy Features

- **No Tracking**: No analytics or tracking scripts
- **No External Dependencies**: All resources are self-contained
- **Offline Capable**: Works without internet connection
- **Data Export**: Easy backup and migration

### Limitations

- **Storage Limit**: Browser localStorage has size limitations (~50MB)
- **Single Device**: Data is tied to one browser/device
- **No Sync**: No automatic synchronization across devices
- **Basic Security**: No encryption (data is stored in plain text)

## 🛠️ Technical Requirements

### Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript**: ES6+ features required
- **LocalStorage**: Must be enabled and functional
- **File API**: For file reading and processing

### Recommended Specifications

- **RAM**: 4GB+ for handling large documents
- **Storage**: 1GB+ available space for document storage
- **Screen**: 1024x768+ resolution (responsive design adapts)

## 🐛 Troubleshooting

### Common Issues

#### Storage Quota Exceeded

- **Symptoms**: Error messages when uploading files
- **Solution**: Export data, clear storage, and re-import essential documents
- **Prevention**: Monitor storage usage in Profile settings

#### Files Not Uploading

- **Check**: File size (max 50MB) and supported formats
- **Solution**: Compress large files or convert to supported formats
- **Browser**: Ensure JavaScript is enabled

#### Search Not Working

- **Clear Cache**: Browser cache might be interfering
- **Refresh**: Reload the page to reset search index
- **Check**: Ensure documents have searchable content (names, tags, notes)

#### Preview Not Loading

- **File Format**: Ensure file type supports preview
- **Browser**: Some browsers have restrictions on data URLs
- **Size**: Very large files might not preview properly

### Debug Information

Access debug information in the browser console:

```javascript
// Get debug info
console.log(app.storageManager.getDebugInfo());

// Check storage health
console.log(app.storageManager.checkStorageHealth());

// View application state
console.log({
    currentView: app.currentView,
    documentsCount: app.documentManager.documents.size,
    foldersCount: app.documentManager.folders.size
});
```

## 🚀 Performance Tips

### Optimize Storage

- Regular cleanup of old activities
- Export and remove old documents
- Use appropriate file formats (PDF vs images)
- Compress images before upload

### Improve Speed

- Limit simultaneous uploads
- Use folder organization for better navigation
- Regular browser cache clearing
- Close unused browser tabs

### Best Practices

- Use descriptive names and tags
- Organize with folder structure
- Regular data exports for backup
- Monitor storage usage

## 🎯 Future Enhancements

### Planned Features

- **Cloud Sync**: Integration with cloud storage services
- **Collaboration**: Sharing and collaborative features
- **OCR Support**: Text extraction from images and PDFs
- **Advanced Preview**: More file type support
- **Encryption**: Client-side data encryption
- **Mobile App**: Progressive Web App capabilities

### Potential Integrations

- **Cloud Services**: Google Drive, Dropbox, OneDrive
- **Document Processing**: PDF manipulation tools
- **Search Enhancement**: Full-text search within documents
- **Workflow**: Automated organization rules

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure accessibility compliance
- Update documentation as needed

### Bug Reports

Please include:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console error messages
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

### Open Source

- Free to use, modify, and distribute
- No warranty or liability
- Attribution appreciated but not required

## 🙏 Acknowledgments

### Technologies Used

- **HTML5**: Semantic markup and modern features
- **CSS3**: Grid, Flexbox, custom properties, animations
- **JavaScript ES6+**: Modern language features
- **Web APIs**: File API, localStorage, drag and drop

### Inspiration

- Modern document management systems

---

**Made with ❤️ by [Anubhav Anand](https://github.com/anubhavaanand)**
- Google Drive and Dropbox interfaces
- Material Design principles
- Accessibility best practices

### Resources

- [MDN Web Docs](https://developer.mozilla.org/) - Web standards reference
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) -
  Accessibility guidelines
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/) -
  Layout reference

## 📞 Support

### Getting Help

- **Documentation**: Check this README first
- **Issues**: Create a GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions
- **Community**: Join our community forums

### Contact

- **GitHub**: [@anubhavaanand](https://github.com/anubhavaanand)

---

**Made with ❤️ for better document management**

_Version 1.0.0 - Last updated: October 2024_
