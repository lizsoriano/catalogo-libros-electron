const { app, BrowserWindow, ipcMain, net } = require("electron");
const path = require("node:path");

function createWindow() {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 980,
    minHeight: 650,
    title: "Catálogo de libros",
    backgroundColor: "#f7f8fc",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.loadFile("index.html");
}

app.whenReady().then(() => {
  ipcMain.handle("catalog:load-xml", async (_event, endpoint) => {
    let url;
    try {
      url = new URL(endpoint);
      if (!/^https?:$/.test(url.protocol)) throw new Error();
    } catch {
      throw new Error("La URL debe usar HTTP o HTTPS.");
    }

    const response = await net.fetch(url.toString(), {
      headers: { Accept: "application/xml, text/xml;q=0.9" }
    });
    if (!response.ok) {
      throw new Error(`El servidor respondió HTTP ${response.status}.`);
    }
    const contentType = response.headers.get("content-type") || "";
    const xml = await response.text();
    if (!contentType.includes("xml") && !xml.trimStart().startsWith("<")) {
      throw new Error("El endpoint no devolvió XML.");
    }
    return xml;
  });

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
