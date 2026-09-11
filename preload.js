const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("catalogApi", {
  loadXml: (endpoint) => ipcRenderer.invoke("catalog:load-xml", endpoint)
});
