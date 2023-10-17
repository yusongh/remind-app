import { app, BrowserWindow } from 'electron'
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

app.whenReady().then(() => {
  const mainWindow = createWindow()

  registerSystemEvent(mainWindow)
})