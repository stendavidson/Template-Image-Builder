const { app, BrowserWindow, screen, ipcMain, dialog } = require("electron")
const path = require("node:path")
const { readFileSync, writeFileSync, writeFile, mkdirSync, existsSync } = require("fs")
const os = require("os")


// This allows additional application callbacks to utilize the window
let win = null;

// This global tracks the maximized state of the window (the electron win.maximized() method didn"t behave as expected)
let maximized = true;

/**
 * This function creates a window
 */
function createWindow(){

    const displays = screen.getAllDisplays()

    let savedDisplay = null

    let savedID = null

    let folderPath = `${os.homedir()}/AppData/Local/TIB`

    // The default/previous device ID is retrieved
    try{
        let data = JSON.parse(readFileSync(`${folderPath}/config.json`))
        savedID = data.deviceID
    }catch(error){
        // pass - the alternative scenario os already handled below
    }

    // Block identifies/retrievedthe previous/default display if it is connected
    if(savedID >= 0 && displays.length > 1){
        for(let i=0; i<displays.length; i++){
            if(displays[i].id === savedID){
                savedDisplay = displays[i]
            }
        }
    }

    // Conditional re-displays application to previous/default display
    if(savedDisplay){

        win = new BrowserWindow({
            x: savedDisplay.bounds.x + 50,
            y: savedDisplay.bounds.y + 50,
            frame: false,
            width: 1060,
            height: 700,
            fullscreen: false,
            icon: "./assets/images/icon.ico",
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: false,
                enableRemoteModule: false,
                contextIsolation: true,
                devTools: true
            }
        })

    }else{

        win = new BrowserWindow({
            frame: false,
            width: 1060,
            height: 700,
            fullscreen: false,
            icon: "./assets/images/icon.ico",
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: false,
                enableRemoteModule: false,
                contextIsolation: true,
                devTools: true
            }
        })

    }

    win.loadFile("./assets/html/index.html")
    win.maximize()
}




/**
 * This function minimizes the window when called
 * 
 * @param {*} event The event object
 */
function minimize(event){

    // The BrowserWindow is determined from the event
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)

    // If the window is minimizable then minimize
    if(win.minimizable){
        win.minimize()
    }
}


/**
 * This function maximizes or restores the window when called depending
 * on the windows prior state.
 * 
 * @param {*} event the event object
 */
function maximizeRestore(event){

    // Conditional controls whether the window is maximized or "restored"
    if(maximized){
        win.restore()
        maximized = false;
    }else{
        win.maximize()
        maximized = true;
    }
}


/**
 * This function exits the program after saving the display data.
 * 
 * @param {*} event the event object
 */
function close(event){

    // The display device data is retrieved and saved for when the application is re-opened
    const windowBounds = win.getBounds()

    let folderPath = `${os.homedir()}/AppData/Local/TIB`

    // The display device data is safely stored - if possible
    try{

        // Create the necesary folder
        if(!existsSync(folderPath)){
            mkdirSync(folderPath, {recursive : true})
        }

        // Create the config file
        writeFileSync(`${folderPath}/config.json`, JSON.stringify({
            "deviceID" : screen.getDisplayMatching(windowBounds).id
        }))

    }catch(error){
        // pass - the alternative scenario doesn"t matter because the application is exiting
    }

    // Close the application
    win.close()
}



/**
 * This function opens a file and retrieves its name in order to use
 * later.
 * 
 * @param {*} event the event object 
 */
async function openFile(event, fileType, description){

    // The main window is disabled with the dialog box open
    win.setEnabled(false)
    
    // The user"s input is awaited
    let dialogResult = await dialog.showOpenDialog(
        options = {
            parent: win,
            modal: true,
            filters : [
                {
                    name : description, 
                    extensions : [fileType]
                }
            ]
        }
    )

    win.setEnabled(true)
    win.focus()

    let fileData = {
        data : null,
        fileName : dialogResult.filePaths[0],
        canceled : dialogResult.canceled,
        error : false
    }

    // Pending user selection the file is read and converted to JSON
    if(!dialogResult.canceled){
        
        try{

            fileData.data = readFileSync(dialogResult.filePaths[0], options =
                {
                    encoding : "utf-8",
                    flag : "r"
                }
            )

            fileData.fileName = dialogResult.filePaths[0]
            fileData.error = false

        }catch(error){

            fileData.error = true

        }
    }

    return fileData
}

/**
 * IPCMain callbacks
 */

// Callback minimizes the window
ipcMain.on("minimize", minimize)

// Callback maximizes or restores the window
ipcMain.on("maximizeRestore", maximizeRestore)

// Callback minimizes the window
ipcMain.on("close", close)

// Callback opens file
ipcMain.handle("openFile", openFile)

// Callback saves file
ipcMain.handle("saveFile", async (event, fileName, data) => {

    let success

    try{

        writeFileSync(fileName, data)
        success = true

    }catch(error){

        success = false

    }

    return success
})


// Callback saves file
ipcMain.handle("saveAsFile", async (event) => {

    win.setEnabled(false)
    
    let dialogResult = await dialog.showSaveDialog(
        options = {
            parent: win,
            modal: true,
            filters : [
                {
                    name : "Bulk Image Template", 
                    extensions : ["bit"]
                }
            ]
        }
    )

    win.setEnabled(true)
    win.focus()

    let fileData = {
        canceled : dialogResult.canceled,
        fileName : dialogResult.filePath
    };

    return fileData
})


/**
 * This function creates a file path that doesn"t already exist
 * 
 * @param {*} path The initial file path
 * 
 * @returns The fixed file path
 */
function incrementFilePath(path){

    let newPath = path;

    // Check if the path exists
    if (existsSync(newPath)) {

        const match = newPath.match(/-(\d+)$/);

        if (match) {

            const number = parseInt(match[1], 10) + 1;
            newPath = newPath.replace(/-\d+$/, `-${number}`);

        } else {

            newPath = newPath + "-1";
        }

        // Recursively call incrementFilePath if the path still exists
        return incrementFilePath(newPath);
    }

    // Return the path if it doesn"t exist
    return newPath;
}


// Callback selects the save location for the images folder
ipcMain.handle("saveAsDirectory", async (event) => {

    win.setEnabled(false)
    
    let dialogResult = await dialog.showOpenDialog(
        options = {
            parent : win,
            modal : true,
            title : "Save All Images",
            properties : [
                "openDirectory"
            ]
        }
    )

    win.setEnabled(true)
    win.focus()

    let fileData = {
        canceled : dialogResult.canceled,
    };
    
    // Create new directory
    try{

        fileData.folderPath = incrementFilePath(dialogResult.filePaths[0] + "\\bulk-image-export")

        mkdirSync(fileData.folderPath, {recursive : true})

        fileData.error = false

    }catch(error){

        fileData.error = true

    }

    return fileData
})


// Callback saves file
ipcMain.handle("bulkSave", async (event, folderPath, fileDataArray, startNumber) => {

    let success = true

    let base64Data

    let promises = []

    try{

        // Save all images
        for(let i=0; i<fileDataArray.length; i++){

            base64Data = fileDataArray[i].replace(/^data:image\/png;base64,/, "");

            promises.push(new Promise((resolve, reject) => {
                
                writeFile(folderPath + `\\image-${startNumber+i}.png`, Buffer.from(base64Data, "base64"), (err) => {
                
                    if(err){
                        reject(false)
                    }else{
                        resolve(true)
                    }

                })

            }))
        }

        // Allow IO tasks to complete simultaneously
        await Promise.all(promises).then((results) => {

            for(let i=0; i<results.length; i++){

                success = success && results[i]

            }

        })
            
    }catch(error){

        success = false

    }

    return success
})


// Callback performs a fetch inside the Node environment to protect the "browser"
ipcMain.handle("safeFetch", async (event, url) => {

    let response
    let data = {}

    try{

        response = await fetch(url)
        data["text"] = await response.text();
        data["success"] = true

    }catch(error){

        data["success"] = false

    }


    return data
})


// Creating the application window
app.whenReady().then(createWindow);
