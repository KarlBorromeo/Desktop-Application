const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("axios", {
  openAI: (text) => ipcRenderer.invoke('axios.openAI',text),
  // supaBase:()=> ipcRenderer.invoke('supaBase')
});