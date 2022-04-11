const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const MAX_OBJECTS = 50

function getContext() {
  const canvas = document.getElementById('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  return { ctx }
}

const genRanHex = (size) => {
  const randomNumbers = [
    '#',
    ...[...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)),
  ]
  return randomNumbers.join('')
}

function createObject(index) {
  return {
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    radius: Math.random() * 50 + 10,
    directionX: Math.floor(Math.random() * 2) > 0 ? 1 : -1,
    directionY: Math.floor(Math.random() * 2) > 0 ? 1 : -1,
    velocity: Math.random() * 3 + 0.15,
    color: genRanHex(6),
  }
}

function renderObject({ ctx, x, y, radius, text, color }) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function calculatePosition(_objects, ctx) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  for (const _object of _objects) {
    if (_object.x >= WIDTH - _object.radius || _object.x <= _object.radius) {
      _object.directionX = -_object.directionX
    }
    if (_object.y >= HEIGHT - _object.radius || _object.y <= _object.radius) {
      _object.directionY = -_object.directionY
    }
    _object.x += _object.velocity * _object.directionX
    _object.y += _object.velocity * _object.directionY
    renderObject({ ctx, ..._object })
  }
}

function main() {
  const { ctx } = getContext()
  const OBJECTS = []
  for (let index = 0; index < MAX_OBJECTS; index++) {
    OBJECTS.push(createObject(index))
  }
  setInterval(() => calculatePosition(OBJECTS, ctx), 5)
}

main()
