//------ex1
class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  listProps() {
    for (let key in this) {
      console.log(`${key}: ${this[key]}`)
    }
  }
}

class HoldingPatternParticle extends Particle {
  constructor(props) {
    super(props.x, props.y)
    Object.assign(this, props)
  }
}

class StaticParticle extends Particle {
  constructor(props) {
    super(props.x, props.y)
  }
}

//-------ex2
class Particle {
  listProps() {
    for (let key in this) {
      console.log(`${key}: ${this[key]}`)
    }
  }
}

class HoldingPatternParticle extends Particle {
  constructor(props) {
    super()
    Object.assign(this, props)
  }
}

class StaticParticle extends {
  constructor(props) {
    super()
    Object.assign(this, props)
  }
}

//-------test
let p1 = new HoldingPatternParticle({x: 1, y: 2, cp1x: 3, cp1y: 4, cp2x: 5, cp2y: 6, endX: 7, endY: 8})
p1.listProps()

let p2 = new StaticParticle({x: 10, y: 20})
p2.listProps()

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class MovingParticle extends Particle {
  constructor(x, y, destinationX, destinationY) {
    super(x, y)
    this.destinationX = destinationX
    this.destinationY = destinationY
  }
}
