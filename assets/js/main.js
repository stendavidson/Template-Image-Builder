import * as CC from './configController.js'
import * as DC from './canvas.js'
import * as MSC from './misc.js'

const menuIcon = Array.from(document.getElementsByClassName("menuIcon"))[0]
const menu = Array.from(document.getElementsByClassName("menu"))[0]
const closeButton = document.getElementById("closeWindow")
const maximizeButton = document.getElementById("maximizeWindow")
const minimizeButton = document.getElementById("minimizeWindow")
const openButton = document.getElementById("openFile")
const saveButton = document.getElementById("saveFile")
const saveAsButton = document.getElementById("saveAsFile")
const importTextButton = document.getElementById("importText")
const buildImages = document.getElementById("buildImages")
const primaryCanvas = document.getElementById("primaryCanvas")
const previewCanvas = Array.from(document.getElementsByClassName("previewCanvas"))[0];


/**
 * The text alignment toggles
 */
const toggles = document.getElementsByName("align-group")

/**
 * The up "number" buttons
 */
const upButtons = Array.from(document.getElementsByClassName("up"))

/**
 * The down "number" buttons
 */
const downButtons = Array.from(document.getElementsByClassName("down"))

/**
 * The image text block
 */
const imgTextBlock = document.getElementById("image-text-block")

/**
 * The font input block
 */
const fontBlock = document.getElementById("font-block")

/**
 * Minus color set button
 */
const minusColorSetButton = document.getElementById("minus-color-set")

/**
 * Add color set button
 */
const addColorSetButton = document.getElementById("add-color-set")

/**
 * The color block
 */
const colorBlock = document.getElementById("color-block")

/**
 * All the non-dynamic html input elements
 */
const fontSize = document.getElementById("font-size")
const marginTop = document.getElementById("margin-top")
const marginLeft = document.getElementById("margin-left")
const marginRight = document.getElementById("margin-right")
const lineSpacing = document.getElementById("line-spacing")

/**
 * All number inputs
 */
const numberInputs = Array.from(document.getElementsByTagName("input")).filter((element) => {
    if(element.type == "number"){
        return element
    }
})

/**
 * The loading screen element
 */
const loadingDiv = document.getElementById("loading-display")

/**
 * Thie loading message element
 */
const msgBlock = document.getElementById("loading-note")


///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Titlebar Bindings ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////


// The file name - if one is open
let fileName = null

menuIcon.addEventListener("mouseover", () => {
    // Display the menu
    menu.classList.add("active")
    menu.classList.remove("inactive")
})

menuIcon.addEventListener("mouseout", () => {
    // Hide the menu
    menu.classList.remove("active")
})

/**
 * These control the status of the program
 */
closeButton.addEventListener("click", () => {
    window.electronAPI.close()
})

maximizeButton.addEventListener("click", () => {
    window.electronAPI.maximizeRestore()
})

minimizeButton.addEventListener("click", () => {
    window.electronAPI.minimize()
})

openButton.addEventListener("click", async () => {

    // Hide the menu
    menu.classList.add("inactive")

    let success = true

    const fileData = await window.electronAPI.openFile("bit", "Bulk Image Template File")
    
    let jsonData

    // Parse file data
    if(!fileData.canceled && !fileData.error){

        try{

            jsonData = JSON.parse(fileData.data)

        }catch(error){

            success = false

        }
    }
    
    // load config
    if(!fileData.canceled && success){

        if(!fileData.error){

            success = true
            fileName = fileData.fileName

            loadConfig(jsonData)
            DC.drawPreview(previewCanvas, CC.saveData)
            
        }else{

            success = false

        }
    }

    // handle error
    if(!success){
        MSC.displayError("Sorry, this file could not be opened...")
    }

})

/**
 * This functionality retrieves the user's input (the file location) only when an 
 * existing fileName is not already recorded and then saves the file
 */
saveButton.addEventListener("click", async () => {

    // Hide the menu
    menu.classList.add("inactive")

    let success = true

    if(fileName != null){
        success = await window.electronAPI.saveFile(fileName, JSON.stringify(CC.saveData))
    }else{
        const fileData = await window.electronAPI.saveAsFile()
    
        if(!fileData.canceled){
            fileName = fileData.fileName
            success = await window.electronAPI.saveFile(fileName, JSON.stringify(CC.saveData))
        }
    }    

    // handle error
    if(!success){
        MSC.displayError("Sorry, this configuration could not be saved...")
    }
})

/**
 * This functionality retrieves the user's input (the file location) and then saves the file
 */
saveAsButton.addEventListener("click", async () => {

    // Hide the menu
    menu.classList.add("inactive")

    let success = true
    
    const fileData = await window.electronAPI.saveAsFile()
    
    if(!fileData.canceled){
        fileName = fileData.fileName
        success = await window.electronAPI.saveFile(fileName, JSON.stringify(CC.saveData))
    }

    // handle error
    if(!success){
        MSC.displayError("Sorry, this configuration could not be saved...")
    }
})


/**
 * This functionality retrieves the user's input (a text file to open) and then reads the content
 * into the current config
 */
importTextButton.addEventListener("click", async () => {

    // Hide the menu
    menu.classList.add("inactive")

    let success = true

    const fileData = await window.electronAPI.openFile("txt", "Text File")
    
    // load config
    if(!fileData.canceled){

        if(!fileData.error){

            success = true
            
            CC.saveData["text"] = fileData.data.split(/\r\n|\n|\r/)

            loadConfig(CC.saveData)

            DC.drawPreview(previewCanvas, CC.saveData)
            
        }else{

            success = false

        }
    }

    if(!success){
        MSC.displayError("Sorry, this text file could not be imported...")
    }
})


/**
 * This functionality builds and saves all the images to a folder designated
 * by the user.
 */
buildImages.addEventListener("click", async () => {

    // Hide the menu
    menu.classList.add("inactive")

    let success = true

    let fileData

    fileData = await window.electronAPI.saveAsDirectory()
     
    // If the directory has been created
    if(!fileData.canceled){

        if(!fileData.error){

            // Before the UI freezed due to the build process, display a loading screen
            CC.displayLoadingScreen(loadingDiv, msgBlock, "Building Images...")

            setTimeout(async () => {

                let configs = DC.getAllDrawConfigs(CC.saveData)

                let slicedConfig = []

                let slicedImages = []

                let promises = []

                let i=0

                // Loop over the the configs
                do{

                    slicedConfig = configs.slice(i, i + 30)

                    // Generate each individual image
                    for(let j=0; j<slicedConfig.length; j++){

                        DC.drawCanvas(primaryCanvas, ...slicedConfig[j])

                        slicedImages.push(primaryCanvas.toDataURL("image/png"))
                    }
                    
                    // Save batches of images
                    promises.push(window.electronAPI.bulkSave(fileData.folderPath, slicedImages, i+1))

                    slicedImages = []

                    i += 30

                }while(i < configs.length)
                
                // Allow backend to continue IO tasks while canvas continues generating images
                await Promise.all(promises).then((results) => {

                    // All the results are accounted for
                    for(let i=0; i<results.length; i++){
                        
                        success = success && results[i]

                    }
                })

            }, 100)

            setTimeout(() => {
                // Once everything is loaded hide the loading screen
                CC.hideLoadingScreen(loadingDiv)
            }, 100)
        
        }else{

            success = false

        }
    }

    // handle error
    if(!success){
        MSC.displayError("Sorry, something went wrong while building or saving the images...")
    }
})


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Canvs Bindings //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////


// Create a ResizeObserver instance
const resizeObserver = new ResizeObserver(entries => {
    
    previewCanvas.width = entries[0].contentRect.width
    previewCanvas.height = entries[0].contentRect.height

    DC.drawPreview(previewCanvas, CC.saveData)

});


// Start observing the element
resizeObserver.observe(previewCanvas);



///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Config Bindings //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////


/**
 * This function loads the config
 */
function loadConfig(data){

    // Asign values
    CC.saveData["text"] = data["text"]
    CC.saveData["font-size"] = data["font-size"]
    CC.saveData["text-alignment"] = data["text-alignment"]
    CC.saveData["margin-top"] = data["margin-top"]
    CC.saveData["margin-left"] = data["margin-left"]
    CC.saveData["margin-right"] = data["margin-right"]
    CC.saveData["line-spacing"] = data["line-spacing"]
    CC.saveData["fonts"] = data["fonts"]
    CC.saveData["colors"] = data["colors"]
    
    // Delete all dynamic html
    CC.deleteAllDynamicHTML(imgTextBlock, fontBlock, colorBlock)

    // Create text elements
    CC.saveData["text"].forEach((text) => {
        CC.addTextElement(imgTextBlock, previewCanvas, text)
    })

    // Set font size
    fontSize.value = CC.saveData["font-size"]

    // Set text alignment
    toggles.forEach((element) => {
        
        if(element.value == CC.saveData["text-alignment"]){
            element.checked = true;
        }else{
            element.checked = false;
        }

    })

    // Set margin top
    marginTop.value = CC.saveData["margin-top"]

    // Set margin left
    marginLeft.value = CC.saveData["margin-left"]

    // Set margin right
    marginRight.value = CC.saveData["margin-right"]

    // Set line spacing
    lineSpacing.value = CC.saveData["line-spacing"]

    // Create font elements
    CC.saveData["fonts"].forEach((font) => {
        CC.addFontElement(fontBlock, previewCanvas, font)
    })

    // Create color elements
    CC.saveData["colors"].forEach((colors) => {
        CC.addColorSet(colorBlock, previewCanvas, colors)
    })

}


/**
 * The text alignment toggles have an event listener bound
 */
toggles.forEach((element) => {

    element.parentElement.addEventListener("click", () => {
        
        element.checked = true;

        CC.updateConfig(element.parentElement, "input", "text-alignment")
        DC.drawPreview(previewCanvas, CC.saveData)

    });
});

/**
 * The up buttons for number inputs are bound
 */
upButtons.forEach((element) => {

    const numberInput = element.parentElement.parentElement.children[0]
    
    element.addEventListener("click", () => {
        
        numberInput.value = parseInt(numberInput.value) + 1

        CC.updateConfig(numberInput.parentElement, "input", numberInput.id)

        DC.drawPreview(previewCanvas, CC.saveData)
    })
})

/**
 * The up buttons for number inputs are bound
 */
downButtons.forEach((element) => {

    const numberInput = element.parentElement.parentElement.children[0]
    
    element.addEventListener("click", () => {

        if(parseInt(numberInput.value) > 0){
            
            numberInput.value = parseInt(numberInput.value) - 1

            CC.updateConfig(numberInput.parentElement, "input", numberInput.id)

            DC.drawPreview(previewCanvas, CC.saveData)
        }  
    })
})


/**
 * This block creates the default img text inputs
 */
CC.addTextElement(imgTextBlock, previewCanvas)

/**
 * This block creates the default color input set
 */
CC.addColorSet(colorBlock, previewCanvas)


/**
 * This block binds the "add color set" button
 */
addColorSetButton.addEventListener("click", () => {
    
    CC.addColorSet(colorBlock, previewCanvas)

})

/**
 * This block binds the "minus color set" button
 */
minusColorSetButton.addEventListener("click", () => {
    
    const targetColorSet = colorBlock.children[colorBlock.children.length - 2]

    removeElement(targetColorSet, 3)

    CC.updateConfig(colorBlock, "input", "colors", true, ".color-row")

    DC.drawPreview(previewCanvas, CC.saveData)

})

/**
 * This block prevents all number inputs from holding a value less than 0
 */
numberInputs.forEach((element) => {

    element.addEventListener("input", () => {

        requestAnimationFrame(() => {
            if (element.value === "" || element.value < 0) {
                element.value = 0;
            } else if (element.value.length > 1 && element.value.startsWith("0")) {
                element.value = element.value.replace(/^[0]+/, "");
            }
        });

    })
})


fontSize.addEventListener("input", () => {
    
    CC.updateConfig(fontSize.parentElement, "input", "font-size")

    DC.drawPreview(previewCanvas, CC.saveData)

})

marginTop.addEventListener("input", () => {
    
    CC.updateConfig(marginTop.parentElement, "input", "margin-top")

    DC.drawPreview(previewCanvas, CC.saveData)

})

marginLeft.addEventListener("input", () => {
    
    CC.updateConfig(marginLeft.parentElement, "input", "margin-left")

    DC.drawPreview(previewCanvas, CC.saveData)

})

marginRight.addEventListener("input", () => {
    
    CC.updateConfig(marginRight.parentElement, "input", "margin-right")

    DC.drawPreview(previewCanvas, CC.saveData)

})

lineSpacing.addEventListener("input", () => {
    
    CC.updateConfig(lineSpacing.parentElement, "input", "line-spacing")

    DC.drawPreview(previewCanvas, CC.saveData)

})

/**
 * This block creates the default font inputs
 */
CC.addFontElement(fontBlock, previewCanvas)
