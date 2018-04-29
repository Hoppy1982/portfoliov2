//array for nav target lettering particles
let letterACoords = [
  {x: 0.125, y: 0.875},//0
  {x: 0.25, y: 0.5},   //1
  {x: 0.375, y: 0.125},//2
  {x: 0.625, y: 0.125},//3
  {x: 0.75, y: 0.5},   //4
  {x: 0.875, y: 0.875} //5
]
let letterAVectors = [
  {from: 0, to: 2},
  {from: 1, to: 4},
  {from: 2, to: 3},
  {from: 3, to: 5}
]

module.exports = {
  letterACoords,
  letterAVectors
}

//have an init function that precalcs nParticles per letter & stores in obj {a: 6, b:5...}
//have a function that takes in a string and returns total nParticles using above obj
