const { contextBridge, ipcRenderer } = require("electron")


/**
 * functions from Node.js/electron context to expose to titlebar.js
 */
contextBridge.exposeInMainWorld("electronAPI", {

    // mimimize function
    minimize: () => {
        ipcRenderer.send("minimize")
    },

    // maximize and restore function
    maximizeRestore: () => {
        ipcRenderer.send("maximizeRestore")
    },

    // close function
    close: () => {
        ipcRenderer.send("close")
    },

    // open file function
    openFile: async (fileType, description) => {
        return ipcRenderer.invoke("openFile", fileType, description)
    },

    // save file function
    saveFile: async (fileName, data) => {
        return ipcRenderer.invoke("saveFile", fileName, data)
    },

    // save as file function
    saveAsFile: async () => {
        return ipcRenderer.invoke("saveAsFile")
    },

    // perform a safe fetch operation
    safeFetch: async (url) => {
        return ipcRenderer.invoke("safeFetch", url)
    },

    // save as directory function
    saveAsDirectory: async () => {
        return ipcRenderer.invoke("saveAsDirectory")
    },

    // save as directory function
    bulkSave: async (folderPath, fileDataArray, startNumber) => {
        return ipcRenderer.invoke("bulkSave", folderPath, fileDataArray, startNumber)
    }
})