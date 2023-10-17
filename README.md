## 搭建流程

### 1. 搭建vite项目

### 2. 搭建electron

```json
// package.json
{
   "scripts": {
      // 同时启动 vite 项目 与 electron 项目
      "start": "concurrently -k \"pnpm run dev\" \"pnpm run electron:dev\"",
      // 将 electron 的相关ts文件编译成js文件，然后再启动 electron
      "electron:dev": "tsc --project tsconfig.electron.json && cross-env ENV=dev electron electron-dist/main.js --inspect=5858"
   },
}
```


## 进程间通讯

### 1. 主进程 -> 渲染进程

[官方文档](https://www.electronjs.org/zh/docs/latest/tutorial/ipc#%E6%A8%A1%E5%BC%8F-3%E4%B8%BB%E8%BF%9B%E7%A8%8B%E5%88%B0%E6%B8%B2%E6%9F%93%E5%99%A8%E8%BF%9B%E7%A8%8B)

主进程

```js
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send('update-counter', 1),
          label: 'Increment'
        },
        {
          click: () => mainWindow.webContents.send('update-counter', -1),
          label: 'Decrement'
        }
      ]
    }

  ])

  Menu.setApplicationMenu(menu)
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
```


preload.js

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  handleCounter: (callback) => ipcRenderer.on('update-counter', callback)
})
```


index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <title>Menu Counter</title>
  </head>
  <body>
    Current value: <strong id="counter">0</strong>
    <script src="./renderer.js"></script>
  </body>
</html>
```


renderer.js

```js
const counter = document.getElementById('counter')

window.electronAPI.handleCounter((event, value) => {
  const oldValue = Number(counter.innerText)
  const newValue = oldValue + value
  counter.innerText = newValue
  event.sender.send('counter-value', newValue)
})
```

## 问题

### 1. preload.js 最终是需要在渲染进程中执行的

因此如果在 preload.js 中引用了 `/electron` 的文件，就会报找不到模块错误

![preloadjs找不到模块错误](./preloadjs找不到模块错误.png)
