const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const robot = require('robotjs');
const fs = require('fs');

app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        width: 480,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false
        },
        autoHideMenuBar: true,
        resizable: false,
        fullscreenable: false,
        icon: path.join(__dirname, 'img', 'favicon.ico')
    });
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // mainWindow.webContents.openDevTools();

    ipcMain.on('moveMouse', (event, coords) => {
        robot.moveMouse(coords.x, coords.y);
    });
    ipcMain.handle('getMousePos', () => {
      return robot.getMousePos();
    });
    ipcMain.on('mouseClick', () => {
        robot.mouseClick();
    });
    ipcMain.on('writeFile', (event, key, data) => {
        const filePath = path.join(__dirname, 'data.json');
    
        fs.readFile(filePath, 'utf-8', (err, fileData) => {
            if(err) return console.log(err);
            const jsonData = JSON.parse(fileData);
            jsonData[key] = typeof data === 'string' ? JSON.parse(data) : data;
    
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4));
        });
    });
    ipcMain.handle('readFile', () => {
        return fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8')
    });
});