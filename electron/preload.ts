import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 系统锁屏
  onSystemLockScreen(callback: () => void) {
    return ipcRenderer.on('lock-screen', callback)
  },
  // 系统解锁屏幕
  onSystemUnlockScreen(callback: () => void) {
    return ipcRenderer.on('unlock-screen', callback)
  }
})