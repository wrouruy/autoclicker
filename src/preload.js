const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    moveMouse: (x, y) => ipcRenderer.send('moveMouse', { x, y }),
    getMousePos: () => ipcRenderer.invoke('getMousePos'),
    mouseClick: () => ipcRenderer.send('mouseClick'),
    writeFile: (key, data) => ipcRenderer.send('writeFile', key, data),
    readFile: () => ipcRenderer.invoke('readFile')
});