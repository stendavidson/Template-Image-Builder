

/**
 * This function splits the word into parts to fit on each line
 * 
 * @param {string} word The word to break
 * 
 * @param {number} remainingLength The remaining length (in pixels)
 * 
 * @param {number} maxLineWidth The max line width (in pixels)
 * 
 * @param {HTMLCanvasElement} ctx The canvas context
 * 
 * @returns {Array<string>} An array of partial words
 */
function splitWords(word, remainingLength, maxLineWidth, ctx){

    let brokenWords = []

    let remaining = remainingLength

    let wordLength = 0

    let startIndex = 0

    const hyphenWidth = Math.round(ctx.measureText('-').width)
    
    let i = 0

    while(i<word.length){

        // If the current broken word is the exact length
        if(wordLength + Math.round(ctx.measureText(word[i]).width) == remaining){
            
            // If there are no letters left
            if(i == word.length - 1){

                brokenWords.push(word.slice(startIndex))
                
            // If there are letters left
            }else{

                // If the current word plus a hypen isn't too long
                if(wordLength + hyphenWidth <= remaining){
                    brokenWords.push(word.slice(startIndex, Math.max(i,1)) + "-")
                    startIndex = i
                    i -= 1
                // If the current word is too long
                }else{
                    brokenWords.push(word.slice(startIndex, Math.max(i - 1,1)) + "-")
                    startIndex = i - 1
                    i -= 2
                }
            }

            wordLength = 0

        // If the current broken word is too long
        }else if(wordLength + Math.round(ctx.measureText(word[i]).width) > remaining){

            brokenWords.push(word.slice(startIndex, Math.max(i - 1,1)) + "-")
            startIndex = i - 1
            i -= 2
            wordLength = 0

        }else{

            wordLength += Math.round(ctx.measureText(word[i]).width)

        }

        remaining = maxLineWidth   
        
        i++
    }

    // Handle final word
    if(wordLength > 0){
        brokenWords.push(word.slice(startIndex))
    }
    
    return brokenWords
}



/**
 * This function creates the preview canvas in order that an image template
 * may be created prior to the automatic templatised generation of images.
 * 
 * @param {HTMLCanvasElement} canvasElement 
 * 
 * @param {string} text 
 * 
 * @param {number} fontSize 
 * 
 * @param {string} textAlignment 
 * 
 * @param {number} marginTop 
 * 
 * @param {number} marginLeft 
 * 
 * @param {number} marginRight 
 * 
 * @param {number} lineSpacing 
 * 
 * @param {string} font 
 * 
 * @param {Array} colors 
 * 
 * @param {number} scale 
 */
export function drawCanvas(canvasElement, text, fontSize, textAlignment,
    marginTop, marginLeft, marginRight, lineSpacing, font, colors, scale = 1){


    const ctx = canvasElement.getContext("2d")
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)


    ///////////////////////////////////////////////////////////////////////
    /////////////////////////// Font size and family //////////////////////
    ///////////////////////////////////////////////////////////////////////
    ctx.font = `${Math.round(fontSize * scale)}px ${font}`


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////// Line Spacing ////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    const metrics = ctx.measureText("abcdefghijklmnopqrstuvwxyz0123456789{}[]|()\\|/?><~!@#$%^&*=+_-/.,'\"")
    const fontHeight = Math.round(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
    const spacing = Math.round(fontHeight + (lineSpacing * scale))


    ///////////////////////////////////////////////////////////////////////
    /////////////////////////////// Margins ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    const leftMargin = Math.round(marginLeft * scale)
    const rightMargin = Math.round(marginRight * scale)
    const topMargin = Math.round(marginTop * scale) + fontHeight


    ///////////////////////////////////////////////////////////////////////
    /////////////////////////// Singular Error Check //////////////////////
    ///////////////////////////////////////////////////////////////////////

    // Maximum line width in pixels
    const maxLineWidth = canvasElement.width - leftMargin - rightMargin

    if(Math.round(ctx.measureText("m").width) <= maxLineWidth){
        
        ///////////////////////////////////////////////////////////////////////
        /////////////////////////////// Image Text ////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        // Text per line
        const lines = []

        // The words
        const words = text.split(/(\s+)/)

        // The words mapped by lenght
        const wordsLengthMap = {}

        // This block maps word lengths
        for(const word of words){

            if(wordsLengthMap[word] == undefined){
                wordsLengthMap[word] = Math.round(ctx.measureText(word).width)
            }
            
        }

        let maxLineLength = 0
        let lineLengths = 0
        let line = ""
        let i = 0;

        while (i < words.length){

            // If the line length is exactly the same as the max width 
            if(lineLengths + wordsLengthMap[words[i]] == maxLineWidth){

                maxLineLength = Math.max(lineLengths + wordsLengthMap[words[i]], maxLineLength)
                lineLengths = 0
                line += words[i]
                lines.push(line)
                line = ""
            
            // If the line length is exceeding the maximum width
            }else if(lineLengths + wordsLengthMap[words[i]] > maxLineWidth){

                // If the word itself exceeds the maximum line length
                if(wordsLengthMap[words[i]] > maxLineWidth){

                    // The word is too long and so is broken down into parts
                    let wordsToAdd = splitWords(words[i], maxLineWidth - lineLengths, maxLineWidth, ctx)

                    // This block maps word lengths
                    for(const word of wordsToAdd){
                        
                        if(wordsLengthMap[word] == undefined){
                            wordsLengthMap[word] = Math.round(ctx.measureText(word).width)
                        }

                    }            
                    
                    // The new words are added to the existing array
                    words.splice(i, 1, ...wordsToAdd)
                    i-- // This word still needs to be addressed on the next line
                
                // If the word can fit on a single line
                }else{

                    maxLineLength = Math.max(lineLengths, maxLineLength)
                    lineLengths = 0
                    lines.push(line)
                    line = ""
                    i-- // This word still needs to be addressed on the next line

                }
            
            // If the line length is still in range continue
            }else if(lineLengths + wordsLengthMap[words[i]] < maxLineWidth){

                if(!(words[i] == " " && lineLengths == 0)){
                    lineLengths += wordsLengthMap[words[i]]
                    line += words[i]
                }
            
            }

            i++
        }

        // Add the final line
        if(line != ""){
            maxLineLength = Math.max(lineLengths, maxLineLength)
            lines.push(line)
        }


        ///////////////////////////////////////////////////////////////////////
        /////////////////////////////// Alignment /////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        let startPositionX
        let gradientPositionX
            
        if(textAlignment == "align-left"){
            ctx.textAlign = "start"
            startPositionX = leftMargin
            gradientPositionX = leftMargin
        }else if(textAlignment == "align-right"){
            ctx.textAlign = "end"
            startPositionX = leftMargin + maxLineWidth
            gradientPositionX = startPositionX - maxLineLength
        }else{
            ctx.textAlign = "center"
            startPositionX = Math.round(leftMargin + (maxLineWidth / 2))
            gradientPositionX = Math.floor(startPositionX - (maxLineLength / 2))
        }


        ///////////////////////////////////////////////////////////////////////
        //////////////////////////////// Colors ///////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        const gradient = ctx.createLinearGradient(gradientPositionX, 0, gradientPositionX + maxLineLength, 0);
        
        colors.forEach((color, index) => {
            gradient.addColorStop(index / Math.max(colors.length-1, 1), color);
        });

        ctx.fillStyle = gradient;


        ///////////////////////////////////////////////////////////////////////
        //////////////////////////// Draw Canvas //////////////////////////////
        ///////////////////////////////////////////////////////////////////////

        for(let i=0; i<lines.length; i++){
            ctx.fillText(lines[i], startPositionX, topMargin + i * spacing)
        }

    }
}

/**
 * This function draws the preview canvas
 * 
 * @param {HTMLCanvasElement} canvas 
 * 
 * @param {object} saveData 
 */
export function drawPreview(canvas, saveData){

    // Setting a default font allows the user to start working prior to loading all the fonts
    if(saveData["fonts"][saveData["fonts"].length - 1] == ""){
        saveData["fonts"][saveData["fonts"].length - 1] = "Arial"
    }

    drawCanvas(
        canvas, saveData["text"][saveData["text"].length - 1], saveData["font-size"],
        saveData["text-alignment"], saveData["margin-top"], saveData["margin-left"], 
        saveData["margin-right"], saveData["line-spacing"], saveData["fonts"][saveData["fonts"].length - 1], 
        saveData["colors"][saveData["colors"].length - 1], (canvas.width / 6000)
    )
}


/**
 * This function draws all possible images
 * 
 * @param {HTMLCanvasElement} canvas 
 * 
 * @param {object} saveData 
 */
export function getAllDrawConfigs(saveData){

    const dataArray = []

    // Loop over text
    for(let text of saveData["text"]){

        // Loop over fonts
        for(let font of saveData["fonts"]){

            // Loop over color sets
            for(let colors of saveData["colors"]){

                dataArray.push([
                    text, saveData["font-size"], saveData["text-alignment"], 
                    saveData["margin-top"], saveData["margin-left"], 
                    saveData["margin-right"], saveData["line-spacing"], 
                    font, colors, 1
                ])
            }
        }   
    }

    return dataArray
}


