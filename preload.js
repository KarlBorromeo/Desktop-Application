const { contextBridge, ipcRenderer } = require("electron");
const Toastify = require("toastify-js");

contextBridge.exposeInMainWorld("axios", {
  openAI: (text) => ipcRenderer.invoke('axios.openAI',text),
  supaBase: (method,data) => ipcRenderer.invoke('axios.supaBase',method,data)
});

contextBridge.exposeInMainWorld("Toastify", {
  showToast: (option) => Toastify(option).showToast()
});