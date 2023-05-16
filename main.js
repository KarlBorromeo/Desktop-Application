const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require("path")
const axios = require('axios')
const dotenv = require('dotenv').config()
const isDev = true;
const isMac = process.platform === 'darwin'


const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { label: "Logs", click: showLogs}
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Authors', click: function(){
      console.log("Iz a prank!")
    }
  }
]


const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if(isDev){
    win.webContents.openDevTools();
  }

  win.loadFile('./renderer/index.html')
}

app.whenReady().then(() => {
  
  ipcMain.handle('axios.openAI', openAI)
  ipcMain.handle('axios.supaBase',supaBase)
  // create Main Window
  createWindow()

  // start Window
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//create and run new page
function showLogs(){
  const logs = new BrowserWindow({
    width: 1000,
    height: 400,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if(isDev){
    logs.webContents.openDevTools();
  }

  logs.setMenuBarVisibility(false)
  logs.loadFile('./renderer/log.html')
}

//function for API openAI request
async function openAI(event,text){
  let res = null;
  let key = dotenv.parsed;

  await axios({
    method: 'post',
    url: 'https://api.openai.com/v1/completions',
    data: {
      "model": "text-davinci-003",
      "prompt": "Extract keywords from this text:\n\n" + text,
      "temperature": 0.5,
      "max_tokens": 60,
      "top_p": 1.0,
      "frequency_penalty": 0.8,
      "presence_penalty": 0.0
    },
    headers:{
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key.OPENAI_KEY,
    }
  }).then(function (response) {
    res = response.data;
  })
  .catch(function (error) {
    res = error;
  });

  return res;
}

//function for API supabase request
async function supaBase(event,method,data){
  let supaBaseResult = null;
  const key = dotenv.parsed;

  if (method == "get"){
    //insert
    await axios({
      method: method,
      url: 'https://rjfhonwqkubdvwexisri.supabase.co/rest/v1/openAIKeyword?select=*',
      headers:{
        'apikey': key.SUPABASE_KEY,
        'Authorization': 'Bearer ' + key.SUPABASE_KEY,
      }
    }).then(function (response) {
      supaBaseResult = response.data;
    })
    .catch(function (error) {
      supaBaseResult = error.response.data;
    }) 
  }else if (method == "post"){
    //display
    await axios({
      method: method,
      url: 'https://rjfhonwqkubdvwexisri.supabase.co/rest/v1/openAIKeyword',
      headers:{
        'apikey': key.SUPABASE_KEY,
        'Authorization': 'Bearer ' + key.SUPABASE_KEY,
        'Content-Type' : 'application/json',
        'Prefer' : 'return=minimal'
      },
      data:{
        'input': data.input,
        'output': data.output
      }
    }).then(function (response) {
      supaBaseResult = response.data;
    })
    .catch(function (error) {
      supaBaseResult = error.response.data;
    }) 
  } else{
    //delete
    let id = data.id
    await axios({
      method: method,
      url: 'https://rjfhonwqkubdvwexisri.supabase.co/rest/v1/openAIKeyword?id=eq.'+ id,
      headers:{
        'apikey': key.SUPABASE_KEY,
        'Authorization': 'Bearer ' + key.SUPABASE_KEY,
      },
    }).then(function (response) {
      supaBaseResult = response.data;
    })
    .catch(function (error) {
      supaBaseResult = error.response.data;
    }) 
  }
  
  return supaBaseResult;
}

