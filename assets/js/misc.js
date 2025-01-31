import * as CC from "./configController.js"

const errorScreen = CC.createHTMLElement("div", "error-screen")
const errorBox = CC.createHTMLElement("div", "error-box")
const errorBar = CC.createHTMLElement("div", "error-bar")
const errorMsg = CC.createHTMLElement("p", "error-msg")
const closeButton = CC.createHTMLElement("button", "error-button", undefined, "button")

document.body.appendChild(errorScreen)
errorScreen.appendChild(errorBox)
errorBox.appendChild(errorBar)
errorBox.appendChild(errorMsg)
errorBox.appendChild(closeButton)


/**
 * This function displays an error message
 * 
 * @param {*} msg
 * 
 * @param {*} callback The callback to be excuted on exit
 */
export function displayError(msg, callback = undefined){

    errorScreen.style.display = "flex"

    errorMsg.innerText = msg
    
    if(callback != undefined){
        closeButton.addEventListener("click", () => {
            
            errorScreen.style.display = "none"

            callback()
            
        })
    }else{
        closeButton.addEventListener("click", () => {
            
            errorScreen.style.display = "none"
            
        })
    }
}