const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const AREA = HEIGHT * 0.8
const MARGIN_VERTICAL = HEIGHT * 0.1
const MAX_PLANET_SIZE = 12
const MIN_PLANET_SIZE = 5
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
const SUN_SIZE = 55
const PLANETS = 3
const CIRCUMFERENCE = 2 * Math.PI * (AREA / 2)
const ANGLE = CIRCUMFERENCE / 360

const quadrants = {
  1: (planet) => {
    planet.x -= planet.velocity
    planet.y -= planet.velocity
  },
  2: (planet) => {
    planet.x -= planet.velocity
    planet.y += planet.velocity
  },
  3: (planet) => {
    planet.x += planet.velocity
    planet.y += planet.velocity
  },
  4: (planet) => {
    planet.x += planet.velocity
    planet.y -= planet.velocity
  },
}

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

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function createPlanet() {
  const radius =
    Math.random() * (MAX_PLANET_SIZE - MIN_PLANET_SIZE) + MIN_PLANET_SIZE
  let x = Math.random() * (AREA - radius) + (WIDTH - AREA) / 2
  let y = Math.random() * (AREA - radius) + MARGIN_VERTICAL
  if (x >= WIDTH / 2 - SUN_SIZE && x <= WIDTH / 2 + SUN_SIZE)
    x += SUN_SIZE * 1.2
  if (y >= HEIGHT / 2 - SUN_SIZE && y <= HEIGHT / 2 + SUN_SIZE)
    y += SUN_SIZE * 1.2
  return {
    x: x < radius ? radius : x,
    y: y < radius ? radius : y,
    radius,
    color: genRanHex(6),
    velocity: (AREA - getDistance(CENTER_X, CENTER_Y, x, y)) * 0.002,
  }
}

function renderSun(ctx) {
  const x = WIDTH / 2
  const y = HEIGHT / 2
  renderPlanet({ x, y, radius: SUN_SIZE, color: '#ffa600' }, ctx)
}

function renderPlanet(planet, ctx) {
  ctx.beginPath()
  ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2)
  ctx.fillStyle = planet.color
  ctx.moveTo(WIDTH / 2, HEIGHT / 2)
  ctx.lineTo(planet.x, planet.y)
  ctx.lineWidth = 0.5
  ctx.strokeStyle = planet.color
  ctx.stroke()
  ctx.fill()
}

function drawLines(ctx) {
  ctx.beginPath()
  ctx.moveTo(WIDTH / 2, 0)
  ctx.lineTo(WIDTH / 2, HEIGHT)
  ctx.moveTo(0, HEIGHT / 2)
  ctx.lineTo(WIDTH, HEIGHT / 2)
  ctx.lineWidth = 0.3
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
}

function drawCircle(ctx) {
  ctx.beginPath()
  ctx.arc(WIDTH / 2, HEIGHT / 2, AREA / 2, 0, Math.PI * 2)
  ctx.lineWidth = 0.3
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
}

function separateQuadrants(ctx) {
  ctx.beginPath()
  ctx.moveTo(WIDTH / 2, HEIGHT / 2)
  ctx.lineTo(WIDTH / 2, MARGIN_VERTICAL)
  ctx.moveTo(WIDTH / 2, HEIGHT / 2)
  ctx.lineTo(WIDTH / 2, HEIGHT - MARGIN_VERTICAL)
  ctx.moveTo(WIDTH / 2, HEIGHT / 2)
  ctx.lineTo(WIDTH / 2 - AREA / 2, HEIGHT / 2)
  ctx.moveTo(WIDTH / 2, HEIGHT / 2)
  ctx.lineTo(WIDTH / 2 + AREA / 2, HEIGHT / 2)
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
}

function getQuadrant(planet) {
  if (planet.x > WIDTH / 2 && planet.y < HEIGHT / 2) return 1
  if (planet.x < WIDTH / 2 && planet.y < HEIGHT / 2) return 2
  if (planet.x < WIDTH / 2 && planet.y > HEIGHT / 2) return 3
  if (planet.x > WIDTH / 2 && planet.y > HEIGHT / 2) return 4
}

function simulateOrbit(planets, ctx) {
  for (const planet of planets) {
    const quadrant = getQuadrant(planet)
    const fn = quadrants[quadrant]
    fn(planet)
    renderPlanet(planet, ctx)
  }
}

function main() {
  const { ctx } = getContext()
  const planets = []
  for (let index = 0; index < PLANETS; index++) {
    const planet = createPlanet()
    planets.push(planet)
  }
  setInterval(() => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    drawLines(ctx)
    separateQuadrants(ctx)
    renderSun(ctx)
    drawCircle(ctx)
    simulateOrbit(planets, ctx)
  }, 25)
}

main()
