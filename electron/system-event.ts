import { powerMonitor, BrowserWindow } from 'electron'

export enum SystemEventName {
  LOCK_SCREEN = 'lock-screen',
  UNLOCK_SCREEN = 'unlock-screen'
}

export const registerSystemEvent = (mainWindow: BrowserWindow) => {
  // 系统锁屏
  powerMonitor.on(SystemEventName.LOCK_SCREEN, () => {
    console.log('锁屏')
    mainWindow.webContents.send(SystemEventName.LOCK_SCREEN)
  })

  // 系统解锁屏幕
  powerMonitor.on(SystemEventName.UNLOCK_SCREEN, () => {
    console.log('解锁屏幕')
    mainWindow.webContents.send(SystemEventName.UNLOCK_SCREEN)
  })
}

