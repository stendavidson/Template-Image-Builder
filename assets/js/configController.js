import * as DC from './canvas.js'
import * as MSC from './misc.js'

/**
 * This variable will hold all of the save data
 */
export let saveData = {
    "text" : [""],
    "font-size" : 0,
    "text-alignment" : "align-left",
    "margin-top" : 0,
    "margin-left" : 0,
    "margin-right" : 0,
    "line-spacing" : 0,
    "fonts" : [""],
    "colors" : [["#FFFFFF"]]
}

/**
 * Global containing html of all the fonts
 */
let fontWrapper

/**
 * Global containing a list of all html font options
 */
let fontOptions = []

/**
 * Global font intersection observer
 */
let observer


/**
 * This function retrieves and stores all fonts and creates corresponding
 * HTML dropdown.
 * 
 * @param {HTMLElement} parentElement The parent element
 * 
 * @param {HTMLCanvasElement} previewCanvas The preview canvas
 */
async function retrieveFonts(parentElement, previewCanvas){
    
    // Re-assignable variable for font-face
    let fontFace

    // Re-assignable variable for font file
    let fontFile

    fontWrapper = createHTMLElement("div", "font-wrapper")
    parentElement.appendChild(fontWrapper)

    observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.fontFamily = entry.target.innerText;
                }else{
                    entry.target.style.fontFamily = "";
                }
            });
        },
        {
            root : fontWrapper,
            threshold : 0.01
        }
    )

    // This block retrievs all the google fonts and adds them as 
    // fonts available to the configurator.
    const response = await window.electronAPI.safeFetch("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAmj41u9TC_on8VFIsj6hpPa-myxYKXxJ4")

    let success = response["success"]

    if(response["success"]){

        const jsonData = JSON.parse(response["text"])["items"]
        
        try{

            // The loop adds each option
            for(let i=0; i<jsonData.length; i++){
                
                // Create font option list HTML
                let fontOption = createHTMLElement("div", "font-option")
                fontOption.innerText = jsonData[i].family
                fontOption.className = "font-option"
                fontFile = jsonData[i].files["regular"] != undefined ? jsonData[i].files["regular"] : jsonData[i].files[Object.keys(jsonData[i].files)[0]]

                // Load all fonts
                fontFace = new FontFace(
                    fontOption.innerText,
                    `url(${fontFile}) format(truetype)`
                )

                await fontFace.load()

                document.fonts.add(fontFace)

                fontWrapper.appendChild(fontOption)

                fontOption.addEventListener("mousedown", (event) => {
                    
                    document.activeElement.value = fontOption.innerText
                    fontWrapper.style.visibility = "hidden"
                    updateConfig(parentElement, "input", "fonts")
                    DC.drawPreview(previewCanvas, saveData)

                })

                fontOptions.push(fontOption)

                observer.observe(fontOption)
            }        

        }catch(err){

            success = false

        }

    }

    // Handle error
    if(!success){
        MSC.displayError("Some or all of the assets were unable to load...", () => {
            window.electronAPI.close()
        })
    }
}


/**
 * This function builds HTML elements in a simple manner
 * 
 * @param {*} tag 
 * @param {*} classNames 
 * @param {*} id 
 * @param {*} type 
 * @param {*} src 
 * @param {*} value 
 * @returns 
 */
export function createHTMLElement(tag, classNames=undefined, id=undefined, type=undefined, src=undefined, value=undefined){
    
    let element = document.createElement(tag)
    
    if(typeof(classNames) == "string" && classNames !== ""){
        element.className = classNames
    }

    if(typeof(id) == "string" && id !== ""){
        element.id = id;
    }

    if(tag == "input" && typeof(type) == "string" && type !== ""){
        element.type = type;
    }

    if(typeof(src) == "string" && src !== ""){
        element.src = src;
    }

    if(typeof(value) == "string" && value !== ""){
        element.value = value;
    }

    return element
}


/**
 * This function removes the element corresponding to the button
 * 
 * @param {HTMLElement} currentElement The element to delete
 * 
 * @param {number} minElements The minimum number of elements to allow deletion
 */
function removeElement(currentElement, minElements=2){
        
    const parentElement = currentElement.parentElement;

    // Only delete element if there is more than one text element
    if(parentElement.children.length > minElements){
        currentElement.remove()
    }
}


/**
 * This function calculates the top offset for the fonts dropdown
 */
function calcTop(parentElement, currentElement){

    // Get the bounding rectangles
    const parentRect = parentElement.getBoundingClientRect();
    const targetRect = currentElement.getBoundingClientRect();

    // Calculate the position relative to the parent
    const top = targetRect.bottom - parentRect.top + 2;

    return top
}


/**
 * This function updates the global value containing the current config
 * info.
 * 
 * @param {HTMLElement} parentElement The absolute parent element
 * 
 * @param {string} selector The element type
 * 
 * @param {string} key The save key
 * 
 * @param {number} withDepth Whether the element is a single set or a set of sets
 * 
 * @param {string} subSelector This defines what parent element is selected
 */
export function updateConfig(parentElement, selector, key, withDepth=false, subSelector=undefined){

    /**
     * This function updates the global value containing the current config
     * info.
     * 
     * @param {HTMLElement} parentElement The absolute parent element
     * 
     * @param {string} selector The element type
     * 
     * @param {string} key The save key
     * 
     * @param {number} index The position in the array to save things at
     */
    function update(parentElement, selector, key, index){
        
        const dataArray = Array.from(parentElement.querySelectorAll(selector)).map((element) => (element.type == "number" ? parseInt(element.value) : element.value))

        // TODO - save the data
        if(key == "colors"){
            
            saveData[key][index] = dataArray
            
        }else if(key == "fonts" || key == "text"){
            
            saveData[key] = dataArray
            
        }else{

            saveData[key] = dataArray[0]

        }
    }


    let upperElements

    // This function block determines whether the element is a set or a set of sets
    if(withDepth){
        upperElements = parentElement.querySelectorAll(subSelector)
    }else{
        upperElements = [parentElement]
    }

    // Clear pre-existing array(s)
    if(saveData[key] instanceof Array){
        saveData[key] = []
    }

    // The update function is called for all elements
    upperElements.forEach((element, index) => {
        update(element, selector, key, index)
    })

}


/**
 * This function adds a text field to the application interface
 * 
 * @param {HTMLElement} parentElement The absolute parent element
 * 
 * @param {HTMLCanvasElement} previewCanvas The preview canvas
 * 
 * @param {string} value The value given to the element - defaults to ""
 */
export function addTextElement(parentElement, previewCanvas, value=""){

    const newElement = createHTMLElement("div",  "center-row")

    newElement.appendChild(createHTMLElement("div",  "button-wrap"))

    const inputElement = createHTMLElement("textarea", undefined, undefined, undefined, undefined, value)
    newElement.appendChild(inputElement)
    inputElement.addEventListener("input", () => {
        updateConfig(parentElement, "textarea", "text")
        DC.drawPreview(previewCanvas, saveData)
    })

    // Add Button
    const addButton = createHTMLElement("button", "img-button add-img-text", undefined, "button")
    newElement.children[0].appendChild(addButton)
    addButton.appendChild(createHTMLElement("img", "add-button", undefined, undefined, "../images/add.png"))
    addButton.addEventListener("click", () => {
        addTextElement(parentElement, previewCanvas, "")
    })

    // Vertical Seperator
    newElement.children[0].appendChild(createHTMLElement("div",  "vbar"))

    // Minus Button
    const minusButton = createHTMLElement("button", "img-button minus-img-text", undefined, "button")
    newElement.children[0].appendChild(minusButton)
    minusButton.appendChild(createHTMLElement("img", "add-button", undefined, undefined, "../images/minus.png"))
    minusButton.addEventListener("click", () => {
        removeElement(newElement)
        updateConfig(parentElement, "textarea", "text")
        DC.drawPreview(previewCanvas, saveData)
    })


    // Add child to the absolute parent
    parentElement.appendChild(newElement)
    updateConfig(parentElement, "textarea", "text")
    DC.drawPreview(previewCanvas, saveData)
}


/**
 * This function adds a font dropdown field to the application interface
 * 
 * @param {HTMLElement} parentElement The absolute parent element
 * 
 * @param {HTMLCanvasElement} previewCanvas The preview canvas
 * 
 * @param {string} value The value given to the element - defaults to ""
 */
export async function addFontElement(parentElement, previewCanvas, value=""){

    const newElement = createHTMLElement("div",  "center-row")

    newElement.appendChild(createHTMLElement("div",  "button-wrap"))
    newElement.appendChild(createHTMLElement("div", "select-wrap"))
    const inputElement = createHTMLElement("input", "font-select", undefined, "text", undefined, value)
    newElement.children[1].appendChild(inputElement)

    // Add Button
    const addButton = createHTMLElement("button", "img-button add-font", undefined, "button")
    newElement.children[0].appendChild(addButton)
    addButton.appendChild(createHTMLElement("img", "add-button", undefined, undefined, "../images/add.png"))
    addButton.addEventListener("click", () => {
        addFontElement(parentElement, previewCanvas, "")
    })

    // Vertical Seperator
    newElement.children[0].appendChild(createHTMLElement("div",  "vbar"))

    // Minus Button
    const minusButton = createHTMLElement("button", "img-button minus-font", undefined, "button")
    newElement.children[0].appendChild(minusButton)
    minusButton.appendChild(createHTMLElement("img", "add-button", undefined, undefined, "../images/minus.png"))
    minusButton.addEventListener("click", () => {
        removeElement(newElement, 3)
        updateConfig(parentElement, "input", "fonts")
        DC.drawPreview(previewCanvas, saveData)
    })

    parentElement.appendChild(newElement)

    // Load fonts if necessary
    if(fontWrapper == undefined){
        inputElement.placeholder = "Loading..."
        await retrieveFonts(parentElement, previewCanvas)
        inputElement.placeholder = ""
    }

    if(fontOptions.length > 0 && value == ""){
        inputElement.value = fontOptions[0].textContent
    }
    
    
    // Display the font options
    inputElement.addEventListener("focus", () => {
        fontWrapper.style.visibility = "visible"
        fontWrapper.style.top = `${calcTop(parentElement, newElement)}px`
    })

    // Hide the font options
    inputElement.addEventListener("focusout", () => {
        fontWrapper.style.visibility = "hidden"
        fontWrapper.classList.remove("focused")
    })

    // Filter the font options
    inputElement.addEventListener("input", () => {

        fontOptions.forEach((element) => {
            if(inputElement.value == "" || element.innerText.toLowerCase().startsWith(inputElement.value.toLowerCase())){
                element.classList.remove("filtered")
            }else{
                element.classList.add("filtered")
            }
        })

    })

    updateConfig(parentElement, "input", "fonts")
    DC.drawPreview(previewCanvas, saveData)
}


/**
 * This function adds a color input field to the application interface
 * 
 * @param {HTMLElement} parentElement The parent element
 * 
 * @param {HTMLElement} updateElement The update element
 * 
 * @param {HTMLCanvasElement} previewCanvas The preview canvas
 * 
 * @param {string} value The value given to the element - defaults to ""
 */
function addColorElement(parentElement, updateElement, previewCanvas, value="#FFFFFF"){

    const inputElement = createHTMLElement("input", undefined, undefined, "color", undefined, value)
    parentElement.appendChild(inputElement)
    inputElement.addEventListener("input", () => {
        updateConfig(updateElement, "input", "colors", true, ".color-row")
        DC.drawPreview(previewCanvas, saveData)
    })

}

/**
 * This function adds a color set to the application interface
 * 
 * @param {HTMLElement} parentElement The parent element
 * 
 * @param {HTMLCanvasElement} previewCanvas The preview canvas
 * 
 * @param {Array} value The color values
 */
export function addColorSet(parentElement, previewCanvas, value=undefined){

    const newElement = createHTMLElement("div",  "color-row")

    newElement.appendChild(createHTMLElement("div", "button-wrap"))

    newElement.appendChild(createHTMLElement("div", "row-wrap"))
    
    if(value instanceof Array && value != []){

        // Add all elements
        value.forEach((val) => {

            addColorElement(newElement.children[1], parentElement, previewCanvas, val)

        })
        
    }else{

        // Add default elements
        addColorElement(newElement.children[1], parentElement, previewCanvas)

    }

    // Add Button
    const addButton = createHTMLElement("button", "img-button add-color", undefined, "button")
    newElement.children[0].appendChild(addButton)
    addButton.appendChild(createHTMLElement("img", "add-button", undefined, undefined, "../images/add.png"))
    addButton.addEventListener("click", () => {
        
        addColorElement(newElement.children[1], parentElement, previewCanvas)
        updateConfig(parentElement, "input", "colors", true, ".color-row")
        DC.drawPreview(previewCanvas, saveData)

    })

    // Vertical Seperator
    newElement.children[0].appendChild(createHTMLElement("div",  "vbar"))

    // Minus Button
    const minusButton = createHTMLElement("button", "img-button minus-color", undefined, "button")
    newElement.children[0].appendChild(minusButton)
    minusButton.appendChild(createHTMLElement("img", "add-button", undefined, undefined, "../images/minus.png"))
    minusButton.addEventListener("click", () => {
        
        const lastColorElement = newElement.children[1].children[newElement.children[1].children.length - 1]
        removeElement(lastColorElement, 1)
        updateConfig(parentElement, "input", "colors", true, ".color-row")
        DC.drawPreview(previewCanvas, saveData)
    
    })

    // Add child to the absolute parent
    parentElement.insertBefore(newElement, parentElement.children[parentElement.children.length - 1])
    updateConfig(parentElement, "input", "colors", true, ".color-row")
    DC.drawPreview(previewCanvas, saveData)
}



/**
 * The function deletes all fully dynamic components
 * 
 * @param {HTMLElement} imgTextBlock 
 * 
 * @param {HTMLElement} fontBlock 
 * 
 * @param {HTMLElement} colorBlock 
 */
export function deleteAllDynamicHTML(imgTextBlock, fontBlock, colorBlock){
    
    // All elements to delete are selected
    let elementsToDelete = Array.from(imgTextBlock.querySelectorAll(".center-row"))
    .concat(Array.from(fontBlock.querySelectorAll(".center-row")))
    .concat(Array.from(colorBlock.querySelectorAll(".color-row")))

    elementsToDelete.forEach((element) => {

        if("color-row" in element.classList){
            removeElement(element, 2)
        }else{
            removeElement(element, 1)
        }
        
    })

}


/**
 * This function displays a loading screen and message.
 * 
 * @param {HTMLDivElement} loadingDiv The parent div element
 * 
 * @param {HTMLParagraphElement} msgBlock The child paragraph element
 * 
 * @param {string} msg The written message to be displayed
 */
export function displayLoadingScreen(loadingDiv, msgBlock, msg){

    loadingDiv.style.display = "flex"
    msgBlock.textContent = msg
    document.body.offsetHeight    
}


/**
 * This function hides the loading screen
 * 
 * @param {HTMLDivElement} loadingDiv The parent div element
 */
export function hideLoadingScreen(loadingDiv){

    loadingDiv.style.display = "none"
    document.body.offsetHeight
}