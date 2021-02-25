const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    const StartUrl =
        process.env.url ||
        `file://${path.join(__dirname, "../../build/index.html")}`;
    mainWindow.loadURL(StartUrl);
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
    mainWindow.once("ready-to-show", () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update_downloaded");
});
ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
});
app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on("app_version", (event) => {
    event.sender.send("app_version", { version: app.getVersion() });
});
