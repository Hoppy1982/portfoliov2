const CAROUSEL_DATA = [
  {text: 'ZERO', bgColor: 'red', navItems: [
    {text: 'zero a', bgColor: 'red'},
    {text: 'zero b', bgColor: 'green'},
    {text: 'zero c', bgColor: 'blue'},
    {text: 'zero d', bgColor: 'orange'},
    {text: 'zero e', bgColor: 'purple'}
  ]},
  {text: 'ONE', bgColor: 'green', navItems: [
    {text: 'one a', bgColor: 'red'},
    {text: 'one b', bgColor: 'green'},
    {text: 'one c', bgColor: 'blue'},
    {text: 'one d', bgColor: 'orange'},
    {text: 'one e', bgColor: 'purple'}
  ]},
  {text: 'TWO', bgColor: 'blue', navItems: [
    {text: 'two a', bgColor: 'red'},
    {text: 'two b', bgColor: 'green'},
    {text: 'two c', bgColor: 'blue'},
    {text: 'two d', bgColor: 'orange'},
    {text: 'two e', bgColor: 'purple'}
  ]},
  {text: 'THREE', bgColor: 'orange', navItems: [
    {text: 'three a', bgColor: 'red'},
    {text: 'three b', bgColor: 'green'},
    {text: 'three c', bgColor: 'blue'},
    {text: 'three d', bgColor: 'orange'},
    {text: 'three e', bgColor: 'purple'}
  ]},
  {text: 'FOUR', bgColor: 'purple', navItems: [
    {text: 'four a', bgColor: 'red'},
    {text: 'four b', bgColor: 'green'},
    {text: 'four c', bgColor: 'blue'},
    {text: 'four d', bgColor: 'orange'},
    {text: 'four e', bgColor: 'purple'}
  ]},
  {text: 'FIVE', bgColor: 'white', navItems: [
    {text: 'five a', bgColor: 'black'},
    {text: 'five b', bgColor: 'white'},
    {text: 'five c', bgColor: 'black'},
    {text: 'five d', bgColor: 'white'},
    {text: 'five e', bgColor: 'black'},
    {text: 'five f', bgColor: 'red'}
  ]}
]
const CAROUSEL_COLS = 5
const CAROUSEL_ROWS = 5
const CENTER_COL = 2
const CENTER_ROW = 2

let carouselContainer = document.getElementById('navigatorNavItems')//must be matched to carousel container element
let carouselVisibleItems
let selectedCol = 0
let selectedRowInCols = []
let carouselElements = []


//----------------------------------------------------------------------MANAGERS
//initialize
document.addEventListener('DOMContentLoaded', function(event) {
  for(let i = 0; i < CAROUSEL_DATA.length; i++) {
    selectedRowInCols.push(0)
  }

  for(let i = 0; i < CAROUSEL_COLS; i++) {
    carouselElements.push([])
    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      carouselElements[i].push(document.querySelectorAll(`.carouselItem:nth-of-type(${1 + i}n) .navItem`)[j])
    }
  }

  render()
})


function render() {
  updateCarouselState()
  removeCarouselCells()
  removeCarouselColumns()
  makeCarouselColumns()
  makeCarouselCells()
  updateCarouselState()
  populateCarouselColumns()
  populateCarouselCells()
  updateCarouselState()
}


function left() {
  for(let i = 0; i < carouselVisibleItems.length; i++) {
    carouselVisibleItems[i].classList.add('movedLeft')
  }

  decHoriz()
  updateCarouselState()
}


function right() {
  for(let i = 0; i < carouselVisibleItems.length; i++) {
    carouselVisibleItems[i].classList.add('movedRight')
  }

  incHoriz()
  updateCarouselState()
}


function up() {
  for(let i = 0; i < carouselElements[CENTER_COL].length; i++) {
    carouselElements[CENTER_COL][i].classList.add('movedUp')
  }

  incVert()
  updateCarouselState()
}


function down() {
  for(let i = 0; i < carouselElements[CENTER_COL].length; i++) {
    carouselElements[CENTER_COL][i].classList.add('movedDown')
  }

  decVert()
  updateCarouselState()
}


//-----------------------------------------------------------------------HELPERS
function removeCarouselColumns() {
  while(carouselContainer.firstChild) {
    carouselContainer.removeChild(carouselContainer.firstChild)
  }
}


function removeCarouselCells() {
  for(let i = 0; i < carouselVisibleItems.length; i++) {
    while(carouselVisibleItems[i].firstChild) {
      carouselVisibleItems[i].removeChild(carouselVisibleItems[i].firstChild)
    }
  }
}


function makeCarouselColumns() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let newElement = document.createElement('div')
    newElement.classList.add('carouselItem')
    newElement.addEventListener('transitionend', render)
    carouselContainer.appendChild(newElement)
  }
}


function makeCarouselCells() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      let newElement = document.createElement('div')
      newElement.classList.add('navItem')
      newElement.addEventListener('transitionend', render)
      carouselVisibleItems[j].appendChild(newElement)
    }
  }
}


function updateCarouselState() {
  carouselVisibleItems = document.getElementsByClassName('carouselItem')

  for(let i = 0; i < CAROUSEL_COLS; i++) {
    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      carouselElements[i][j] = document.querySelectorAll(`.carouselItem:nth-of-type(${1 + i}n) .navItem`)[j]
    }
  }
}


function incHoriz() {
  selectedCol = selectedCol === CAROUSEL_DATA.length - 1 ? 0 : selectedCol + 1
}


function decHoriz() {
  selectedCol = selectedCol === 0 ? CAROUSEL_DATA.length - 1 : selectedCol - 1
}


function incVert() {
  selectedRowInCols[selectedCol] = selectedRowInCols[selectedCol] === CAROUSEL_DATA[selectedCol].navItems.length - 1 ? 0 : selectedRowInCols[selectedCol] + 1
}


function decVert() {
  selectedRowInCols[selectedCol] = selectedRowInCols[selectedCol] === 0 ? CAROUSEL_DATA[selectedCol].navItems.length - 1 : selectedRowInCols[selectedCol] - 1
}


function populateCarouselColumns() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    carouselVisibleItems[CAROUSEL_COLS - 1 - i].style.backgroundColor = CAROUSEL_DATA[x].bgColor
  }
}

function populateCarouselCells() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      let y = selectedRowInCols[x] + j
      while(y >= CAROUSEL_DATA[x].navItems.length) {y = y - CAROUSEL_DATA[x].navItems.length}

      carouselElements[CAROUSEL_COLS - 1 - i][j].style.backgroundColor = CAROUSEL_DATA[x].navItems[y].bgColor
    }
  }
}


function getNavTopicText() {
  return CAROUSEL_DATA[selectedCol].text
}


function getNavItemText() {
  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  return CAROUSEL_DATA[selectedCol].navItems[y].text.toUpperCase()
}

//-----------------------------------------------------------------------EXPORTS
module.exports = {
  up,
  down,
  left,
  right,
  getNavTopicText,
  getNavItemText
}
