const CAROUSEL_DATA = [
  {text: 'Free Code Camp Projects', navItems: [
    {text: 'FCC Projects Page', desc: 'A possibly redundant page with links to each FCC project', link: '/fcc-projects'},
    {text: 'Calculator', desc: 'Tesco Calculator lookalikey, for this I mainly concentrated on seeing how close I could it looking to someone elses design.', link: '/fcc-projects-calculator'},
    {text: 'Pomodoro Timer', desc: 'Pretty sure this used to sort of work', link: '/fcc-projects-pomodoro'},
    {text: 'Simon Game', desc: 'Works....ish', link: '/fcc-projects-simon'},
    {text: 'Noughts And Crosses', desc: '...meh', link: '/fcc-projects-tictactoe'}
  ]},
  {text: 'Misc', navItems: [
    {text: 'Widgetrons', desc: 'Half finished gubbins and ideasa', link: '/widgetrons'},
    {text: 'Van', desc: 'Why I am poor', link: '/campervan'},
    {text: 'nav link one c', desc: 'Description of the thing nav link one c points at', link: '/404'},
    {text: 'nav link one d', desc: 'Description of the thing nav link one d points at', link: '/404'},
    {text: 'nav link one e', desc: 'Description of the thing nav link one e points at', link: '/404'}
  ]},
  {text: 'TOPIC TWO', navItems: [
    {text: 'nav link two a', desc: 'Description of the thing nav link two a points at', link: '/404'},
    {text: 'nav link two b', desc: 'Description of the thing nav link two b points at', link: '/404'},
    {text: 'nav link two c', desc: 'Description of the thing nav link two c points at', link: '/404'},
    {text: 'nav link two d', desc: 'Description of the thing nav link two d points at', link: '/404'},
    {text: 'nav link two e', desc: 'Description of the thing nav link two e points at', link: '/404'}
  ]},
  {text: 'TOPIC THREE', navItems: [
    {text: 'nav link three a', desc: 'Description of the thing nav link three a points at', link: '/404'},
    {text: 'nav link three b', desc: 'Description of the thing nav link three b points at', link: '/404'},
    {text: 'nav link three c', desc: 'Description of the thing nav link three c points at', link: '/404'},
    {text: 'nav link three d', desc: 'Description of the thing nav link three d points at', link: '/404'},
    {text: 'nav link three e', desc: 'Description of the thing nav link three e points at', link: '/404'}
  ]},
  {text: 'TOPIC FOUR', navItems: [
    {text: 'nav link four a', desc: 'Description of the thing nav link four a points at', link: '/404'},
    {text: 'nav link four b', desc: 'Description of the thing nav link four b points at', link: '/404'},
    {text: 'nav link four c', desc: 'Description of the thing nav link four c points at', link: '/404'},
    {text: 'nav link four d', desc: 'Description of the thing nav link four d points at', link: '/404'},
    {text: 'nav link four e', desc: 'Description of the thing nav link four e points at', link: '/404'}
  ]},
  {text: 'TOPIC FIVE', navItems: [
    {text: 'nav link five a', desc: 'Description of the thing nav link five a points at', link: '/404'},
    {text: 'nav link five b', desc: 'Description of the thing nav link five b points at', link: '/404'},
    {text: 'nav link five c', desc: 'Description of the thing nav link five c points at', link: '/404'},
    {text: 'nav link five d', desc: 'Description of the thing nav link five d points at', link: '/404'},
    {text: 'nav link five e', desc: 'Description of the thing nav link five e points at', link: '/404'},
    {text: 'nav link five f', desc: 'Description of the thing nav link five f points at', link: '/404'}
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
  addClickableNav()
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
      newElement.classList.add('centered')
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


function populateCarouselColumns() {//doesn't do anything at present but leave in for later
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    //carouselVisibleItems[CAROUSEL_COLS - 1 - i].style.backgroundColor = CAROUSEL_DATA[x].bgColor
  }
}

function populateCarouselCells() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      let y = selectedRowInCols[x] + j
      while(y >= CAROUSEL_DATA[x].navItems.length) {y = y - CAROUSEL_DATA[x].navItems.length}

      carouselElements[CAROUSEL_COLS - 1 - i][j].innerHTML = CAROUSEL_DATA[x].navItems[y].text
    }
  }
}


function addClickableNav() {
  carouselElements[CENTER_COL][CENTER_ROW].classList.add('centerClickableCell')

  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  carouselElements[CENTER_COL][CENTER_ROW].addEventListener('click', function(){
    location.href = CAROUSEL_DATA[selectedCol].navItems[y].link
  }, false)
}


function getNavTopicText() {
  return CAROUSEL_DATA[selectedCol].text
}


function getNavItemText() {
  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  return CAROUSEL_DATA[selectedCol].navItems[y].text.toUpperCase()
}


function getNavItemDesc() {
  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  return CAROUSEL_DATA[selectedCol].navItems[y].desc
}
//-----------------------------------------------------------------------EXPORTS
module.exports = {
  up,
  down,
  left,
  right,
  getNavTopicText,
  getNavItemText,
  getNavItemDesc
}
