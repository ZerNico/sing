import { join } from 'path'
import url from 'url'
import { BrowserWindow, app, protocol, screen, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { createIPCHandler } from 'electron-trpc/main'
import Store from 'electron-store'
import icon from '../../resources/icon.png?asset'
import { ipcRouter } from './trpc/routes'

interface Config {
  windowBounds: {
    width: number
    height: number
    x: number
    y: number
  }
  windowMaximized: boolean
}

const store = new Store<Config>()

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'atom',
    privileges: { supportFetchAPI: true },
  },
])

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  createIPCHandler({ router: ipcRouter, windows: [mainWindow] })

  // Restore window position and maximized state
  const bounds = store.get('windowBounds')

  if (bounds) {
    const displays = screen.getAllDisplays()
    // check if the window is visible with stored bounds
    // this is to prevent the window from being offscreen if the display is changed
    const visible = displays.some((display) => {
      return (
        bounds.x + bounds.width >= display.bounds.x
        && bounds.x <= display.bounds.x + display.bounds.width
        && bounds.y + bounds.height >= display.bounds.y
        && bounds.y <= display.bounds.y + display.bounds.height
      )
    })

    if (visible) {
      mainWindow.setBounds(bounds)
    }
  }

  const maximized = store.get('windowMaximized')
  if (maximized) {
    mainWindow.maximize()
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', () => {
    // Save window bounds and maximized state on close
    const bounds = mainWindow.getNormalBounds()
    const maximized = mainWindow.isMaximized()
    store.set({ windowMaximized: maximized, windowBounds: bounds })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  protocol.registerFileProtocol('atom', (request, callback) => {
    const filePath = url.fileURLToPath(`file://${request.url.slice('atom://'.length)}`)
    callback(filePath)
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
