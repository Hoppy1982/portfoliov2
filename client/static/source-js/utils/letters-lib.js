//------------------------------------------COORDS AS RATIO AND VECTOR POINT ATS
let lettersCoords = {
  A: [
    {x: 0.125, y: 0.875},//0
    {x: 0.25, y: 0.5},   //1
    {x: 0.375, y: 0.125},//2
    {x: 0.625, y: 0.125},//3
    {x: 0.75, y: 0.5},   //4
    {x: 0.875, y: 0.875} //5
  ],
  B: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.25}, //3
    {x: 0.75, y: 0.75}  //4
  ],
  C: [
    {x: 0.75, y: 0.875},//0
    {x: 0.25, y: 0.625},//1
    {x: 0.25, y: 0.375},//2
    {x: 0.75, y: 0.125} //3
  ],
  D: [
    {x: 0.25, y: 0.875}, //0
    {x: 0.25, y: 0.125 },//1
    {x: 0.75, y: 0.375}, //2
    {x: 0.75, y: 0.625}  //3
  ],
  E: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.75, y: 0.5},  //4
    {x: 0.75, y: 0.875} //5
  ],
  F: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.75, y: 0.5}   //4
  ],
  G: [
    {x: 0.75, y: 0.875},//0
    {x: 0.25, y: 0.625},//1
    {x: 0.25, y: 0.375},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.625, y: 0.5}, //4
    {x: 0.875, y: 0.5}  //5
  ],
  H: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.75, y: 0.5},  //4
    {x: 0.75, y: 0.875} //5
  ],
  I: [
    {x: 0.75, y: 0.875},//0
    {x: 0.5, y: 0.875}, //1
    {x: 0.25, y: 0.875},//2
    {x: 0.25, y: 0.125},//3
    {x: 0.5, y: 0.125}, //4
    {x: 0.75, y: 0.125} //5
  ],
  J: [
    {x: 0.25, y: 0.75},
    {x: 0.375, y: 0.875},
    {x: 0.5, y: 0.75},
    {x: 0.5, y: 0.125},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.125}
  ],
  K: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.5},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.875},
    {x: 0.75, y: 0.25}
  ],
  L: [
    {x: 0.75, y: 0.875},
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.125}
  ],
  M: [
    {x: 0.125, y: 0.875},
    {x: 0.25, y: 0.125},
    {x: 0.5, y: 0.75},
    {x: 0.75, y: 0.125},
    {x: 0.875, y: 0.875}
  ],
  N: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.875},
    {x: 0.75, y: 0.125}
  ],
  O: [
    {x: 0.375, y: 0.875},
    {x: 0.125, y: 0.625},
    {x: 0.125, y: 0.375},
    {x: 0.375, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.875, y: 0.375},
    {x: 0.875, y: 0.625},
    {x: 0.625, y: 0.875}
  ],
  P: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.5},
    {x: 0.25, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.75, y: 0.25},
    {x: 0.75, y: 0.375},
    {x: 0.625, y: 0.5}
  ],
  Q: [
    {x: 0.375, y: 0.875},
    {x: 0.125, y: 0.625},
    {x: 0.125, y: 0.375},
    {x: 0.375, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.875, y: 0.375},
    {x: 0.875, y: 0.625},
    {x: 0.625, y: 0.875},
    {x: 0.625, y: 0.625},
    {x: 0.875, y: 0.875}
  ],
  " ": []//enables having spaces between letters
}


let lettersVectors = {
  A: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false}
  ],
  B: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -2},
    {hasVector: true, indexOffset: -4}
  ],
  C: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  D: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -3}
  ],
  E: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: false},
    {hasVector: true, indexOffset: -5}
  ],
  F: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: false}
  ],
  G: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -5}
  ],
  H: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: false},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false}
  ],
  I: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: false},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false}
  ],
  J: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  K: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false},
    {hasVector: true, indexOffset: -3}
  ],
  L: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  M: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  N: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  O: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -7}
  ],
  P: [
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -5}
  ],
  Q: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -7},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ]
}


//------------------------------------------------------------EXPORTED FUNCTIONS
function totalRequiredParticles(str) {
  let requiredParticles = 0

  for(i in str) {
    requiredParticles += lettersCoords[str.charAt(i)].length
  }

  console.log("total requiredParticles: " + requiredParticles)
  return requiredParticles
}


function placeWordsInRows(str, maxCharsInRow) {
  let words = str.split(" ")
  let rows = [""]
  let rowsIndex = 0

  words.forEach((word, index) => {
    if(rows[rowsIndex].length + word.length + 1 <= maxCharsInRow) {
      rows[rowsIndex] = index === 0 ? rows[rowsIndex] + word : rows[rowsIndex] + " " + word
    } else {
      rows.push(word)
      rowsIndex++
    }
  })

  return rows
}


function calcLetterParticlesDestAndTargets(wordsInRows, canvasWidth, canvasHeight) {
  let charWidth = Math.round( canvasWidth / (longestElementLength(wordsInRows) + 2) )
  let charHeight = Math.round(charWidth * 1.2)
  let totalRowsHeight = charHeight * (wordsInRows.length + 1)
  let finalCoordsAndPointsAts = []

  for(let row in wordsInRows) {
    let rowStartX = (canvasWidth / 2) - (wordsInRows[row].length * charWidth / 2)
    let rowStartY = (canvasHeight / 2) - (totalRowsHeight / 2) + (row * charHeight)

    for(let letterPos = 0; letterPos < wordsInRows[row].length; letterPos++) {
      let charHere = wordsInRows[row].charAt(letterPos)
      let nCharParticles = lettersCoords[charHere].length

      for(let posInChar = 0; posInChar < nCharParticles; posInChar++) {
        let x1 = rowStartX + (letterPos * charWidth) + (charWidth * lettersCoords[charHere][posInChar].x)
        let y1 = rowStartY + (charHeight * lettersCoords[charHere][posInChar].y)
        let pointsAt = false

        if(lettersVectors[charHere][posInChar].hasVector === true) {
          pointsAt = lettersVectors[charHere][posInChar].indexOffset
        }

        finalCoordsAndPointsAts.push({x1: x1, y1: y1, pointsAt: pointsAt})
      }
    }
  }

  return finalCoordsAndPointsAts
}


//------------------------------------------------------------INTERNAL FUNCTIONS
function longestElementLength(arr) {
  let length = 0
  arr.forEach(el => {
    length = el.length >= length ? el.length : length
  })
  return length
}


//-----------------------------------------------------------------------EXPORTS
module.exports = {
  placeWordsInRows,
  totalRequiredParticles,
  calcLetterParticlesDestAndTargets
}
