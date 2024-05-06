import { app, BrowserWindow, nativeImage, Tray, Menu, Event } from 'electron'
import path from 'node:path'
import { registerSystemEvent } from './system-event'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../electron-dist/preload.js')
    }
  })
  
  if (process.env.ENV === 'dev') {
    win.loadURL("http://localhost:5173")
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

/**
 * 创建系统托盘
 * @param {BrowserWindow} mainWin 主窗口
 */
const createTray = (mainWin: BrowserWindow) => {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../public/logo.png'))
  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      id: 'showMainWin',
      enabled: false, // 是否可以操作
      click() {
        mainWin.show()
      }
    },
    {
      label: '退出',
      role: 'quit'
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.setToolTip('提醒起来活动一下')

  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    mainWin.show()
  })

  // 最小化的时候隐藏窗口
  mainWin.on('minimize', (e: Event) => {
    e.preventDefault()
    mainWin.hide()
  })

  const setShowMainWinMenuEnable = (enable: boolean) => {
    const menuItem = contextMenu.getMenuItemById('showMainWin')
    if (menuItem) {
      menuItem.enabled = enable
    }

    tray.setContextMenu(contextMenu)
  }

  // 窗口隐藏时，显示主窗口菜单可以操作
  mainWin.on('hide', () => {
    setShowMainWinMenuEnable(true)
  })

  // 窗口显示时，显示主窗口菜单不可以操作
  mainWin.on('show', () => {
    setShowMainWinMenuEnable(false)
  })

  return tray
}
 
app.whenReady().then(() => {
  const mainWindow = createWindow()

  createTray(mainWindow)

  registerSystemEvent(mainWindow)
})