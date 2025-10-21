const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configure writable userData and cache directories early to avoid Windows cache permission errors
// See errors like: Unable to move the cache: Access is denied. (0x5)
try {
    const isDev = process.env.NODE_ENV === 'development';
    const userDataRoot = path.join(os.homedir(), isDev ? '.research-hub-dev' : '.research-hub');
    fs.mkdirSync(userDataRoot, { recursive: true });
    app.setPath('userData', userDataRoot);

    const cacheDir = path.join(userDataRoot, 'Cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    // Point Chromium disk cache to a guaranteed-writable folder
    app.commandLine.appendSwitch('disk-cache-dir', cacheDir);

    // Optional: if GPU cache errors persist on specific systems, uncomment below
    // app.disableHardwareAcceleration();
} catch (e) {
    console.warn('Cache/userData path configuration failed:', e && e.message ? e.message : e);
}

// Keep a global reference of the window object
let mainWindow;

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
    try {
        // Avoid letting the reload watcher try to treat HTML files as JS modules
        const electronExecutable = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
        require('electron-reload')(__dirname, {
            electron: electronExecutable,
            hardResetMethod: 'exit',
            // Ignore HTML files to prevent ESM loader from attempting to parse them
            ignored: ["**/*.html", path.join(__dirname, 'index.html')]
        });
    } catch (err) {
        // If electron-reload isn't available or fails, continue without live reload
        console.warn('electron-reload not enabled:', err && err.message ? err.message : err);
    }
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            sandbox: false
        },
        show: false,
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load from localhost in development for faster iteration, otherwise load the index.html file
    if (process.env.NODE_ENV === 'development') {
        const devUrl = 'http://localhost:3000';
        mainWindow.loadURL(devUrl).catch(err => {
            console.error('Failed to load dev URL', err);
            // Fallback to file if serve isn't running
            mainWindow.loadFile(path.join(__dirname, 'index.html'));
        });
    } else {
        // Use absolute path to avoid unknown extension errors
        mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        // Focus on window
        if (process.platform === 'darwin') {
            app.dock.show();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Prevent navigation away from the app
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });

    // Set up menu
    createMenu();

    // Development tools
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Document',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.showView('upload');
                            }
                        `);
                    }
                },
                {
                    label: 'Open Documents',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.showView('documents');
                            }
                        `);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export Data',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.exportData();
                            }
                        `);
                    }
                },
                {
                    label: 'Import Data',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [{ name: 'JSON Files', extensions: ['json'] }]
                        });

                        if (!result.canceled && result.filePaths.length > 0) {
                            const filePath = result.filePaths[0];
                            try {
                                const data = fs.readFileSync(filePath, 'utf8');
                                mainWindow.webContents.executeJavaScript(`
                                    if (window.app) {
                                        const data = ${data};
                                        window.app.importData(new Blob([JSON.stringify(data)], { type: 'application/json' }));
                                    }
                                `);
                            } catch (error) {
                                dialog.showErrorBox('Import Error', 'Failed to import data: ' + error.message);
                            }
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Home',
                    accelerator: 'CmdOrCtrl+H',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.showView('home');
                            }
                        `);
                    }
                },
                {
                    label: 'Upload',
                    accelerator: 'CmdOrCtrl+U',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.showView('upload');
                            }
                        `);
                    }
                },
                {
                    label: 'Documents',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.showView('documents');
                            }
                        `);
                    }
                },
                {
                    label: 'Search',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.showView('search');
                            }
                        `);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Toggle Theme',
                    accelerator: 'CmdOrCtrl+K',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.app) {
                                window.app.toggleTheme();
                            }
                        `);
                    }
                },
                { type: 'separator' },
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [{ role: 'minimize' }, { role: 'close' }]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Research Hub',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: 'Research Hub',
                            detail: `Version: ${require('./package.json').version}\n\nA comprehensive academic research papers management system with citation generation capabilities.\n\nBuilt with Electron, HTML5, CSS3, and JavaScript.`
                        });
                    }
                },
                {
                    label: 'Documentation',
                    click: () => {
                        shell.openExternal('https://github.com/anubhavaanand/research-hub#readme');
                    }
                },
                {
                    label: 'Report Issue',
                    click: () => {
                        shell.openExternal('https://github.com/anubhavaanand/research-hub/issues');
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Window menu
        template[4].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Handle protocol for deep linking (optional)
app.setAsDefaultProtocolClient('research-hub');

// Handle deep links on Windows/Linux
app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}
