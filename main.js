const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path")
const axios = require('axios')
const isDev = true;


const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })
 
  if(isDev){
    win.webContents.openDevTools();
  }

  win.loadFile('./renderer/index.html')
}

app.whenReady().then(() => {
  
  ipcMain.handle('axios.openAI', openAI)
  // ipcMain.handle('axios.supaBase',supaBase)

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

//function for API openAI request
async function openAI(event,text){
  let res = null;
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
      'Authorization': 'Bearer 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',
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
// async function supaBase(){
//   return "supaBase is here!";
// }

