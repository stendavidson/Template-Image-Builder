/**
 * This function displays an error message
 * 
 * @param {HTMLDivElement} errorBackground The background that prevents the user from interacting with the application while an error is displayed.
 * 
 * @param {HTMLParagraphElement} messageP The error message element
 * 
 * @param {HTMLButtonElement} okButton The button that closes the error message
 * 
 * @param {string} msg The message to be displayed
 *  
 * @param {*} callback The function called when the "ok" button is selected
 */
export function displayError(errorBackground, messageP, okButton, msg, callback = undefined){

    errorBackground.style.display = "flex"

    messageP.textContent = msg
    
    if(callback != undefined){
        okButton.addEventListener("click", () => {
            
            errorBackground.style.display = "none"

            callback()
            
        })
    }else{
        okButton.addEventListener("click", () => {
            
            errorBackground.style.display = "none"
            
        })
    }
}