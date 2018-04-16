let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')

const RIGHT = window.innerWidth - 80
const BOTTOM = window.innerHeight - 80

canvas1.width  = window.innerWidth
canvas1.height = window.innerHeight

ctx1.strokeStyle = '#ffffff'
ctx1.strokeRect(40, 40, RIGHT, BOTTOM)
