const canvasHelpers = require('../client/static/source-js/utils/canvas-helpers.js')

const TEST_REPEAT_AMOUNT = 10

//---------------------------------------------randPointBetweenTwoPoints() tests
test('randPointBetweenTwoPoints: return object has x and y properties', () => {
  let p1 = {x: 0, y: 0}
  let p2 = {x: 0, y: 0}

  expect(canvasHelpers.randPointBetweenTwoPoints(p1, p2)).toHaveProperty('x')
  expect(canvasHelpers.randPointBetweenTwoPoints(p1, p2)).toHaveProperty('y')
})


function testRandPointBetweenTwoPointsCoordRange() {
  test('randPointBetweenTwoPoints: x & y properties are within expected range', () => {
    const MIN_DIST = 40
    const DIST_MOD = 0.5
    let p1 = {x: 0, y: 0}
    let p2 = {x: 4, y: 3}

    expect(canvasHelpers.randPointBetweenTwoPoints(p1, p2).x).toBeGreaterThanOrEqual(-MIN_DIST - (5 * DIST_MOD))
    expect(canvasHelpers.randPointBetweenTwoPoints(p1, p2).x).toBeLessThanOrEqual(MIN_DIST + (5 * DIST_MOD))
    expect(canvasHelpers.randPointBetweenTwoPoints(p1, p2).x).toBeGreaterThanOrEqual(3 - MIN_DIST - (5 * DIST_MOD))
    expect(canvasHelpers.randPointBetweenTwoPoints(p1, p2).x).toBeLessThanOrEqual(3 + MIN_DIST + (5 * DIST_MOD))
  })
}

for(let i = 0; i < TEST_REPEAT_AMOUNT; i++) {
  testRandPointBetweenTwoPointsCoordRange()
}


//----------------------------------------------------randPointNearPoint() tests
test('randPointNearPoint: return object has x and y properties', () => {
  let p1 = {x: 0, y: 0}
  let p2 = {x: 0, y: 0}

  expect(canvasHelpers.randPointNearPoint(p1, p2)).toHaveProperty('x')
  expect(canvasHelpers.randPointNearPoint(p1, p2)).toHaveProperty('y')
})


function testRandPointNearPointCoordRange() {
  test('randPointNearPoint: x & y properties are within expected range', () => {
    const MAX_FROM = 40
    let pt = {x: 0, y: 0}

    expect(canvasHelpers.randPointNearPoint(pt).x).toBeGreaterThanOrEqual(-MAX_FROM)
    expect(canvasHelpers.randPointNearPoint(pt).x).toBeLessThanOrEqual(MAX_FROM)
    expect(canvasHelpers.randPointNearPoint(pt).y).toBeGreaterThanOrEqual(-MAX_FROM)
    expect(canvasHelpers.randPointNearPoint(pt).y).toBeLessThanOrEqual(MAX_FROM)
  })
}

for(let i = 0; i < TEST_REPEAT_AMOUNT; i++) {
  testRandPointNearPointCoordRange()
}


//--------------------------------------------------coordsOnStraightLine() tests
test('coordsOnStraightLine: correct at 50% from 0,0 to 10,10', () => {
  expect(canvasHelpers.coordsOnStraightLine(0.5, {x: 0, y: 0}, {x: 10, y: 10}).x).toBe(5)
  expect(canvasHelpers.coordsOnStraightLine(0.5, {x: 0, y: 0}, {x: 10, y: 10}).y).toBe(5)
})


test('coordsOnStraightLine: correct at 50% from 0,0 to 10,-10', () => {
  expect(canvasHelpers.coordsOnStraightLine(0.5, {x: 0, y: 0}, {x: 10, y: -10}).x).toBe(5)
  expect(canvasHelpers.coordsOnStraightLine(0.5, {x: 0, y: 0}, {x: 10, y: -10}).y).toBe(-5)
})


//---------------------------------------------------coordsOnCubicBezier() tests


//-------------------------------------------------colorBetweenTwoColors() tests
