const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const AREA = HEIGHT * 0.8
const MARGIN_VERTICAL = HEIGHT * 0.1
const MAX_PLANET_SIZE = 20
const MIN_PLANET_SIZE = 5
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
const G = 0.1
const SUN_SIZE = 55
const PLANETS = 2
const CIRCUMFERENCE = 2 * Math.PI * (AREA / 2)
const ANGLE = CIRCUMFERENCE / 360

const SUN = {
  x: CENTER_X,
  y: CENTER_Y,
  circumference: 2 * Math.PI * SUN_SIZE,
  m: Math.PI * Math.pow(SUN_SIZE, 2),
  radius: SUN_SIZE,
  color: '#ffa600',
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
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
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
  const circumference = 2 * Math.PI * radius
  const d = getDistance(x, y, SUN.x, SUN.y)
  const m = Math.PI * Math.pow(radius, 2)
  const speed = Math.sqrt((G * SUN.m) / d) * 1
  return {
    x: x < radius ? radius : x,
    y: y < radius ? radius : y,
    radius,
    circumference,
    d,
    m,
    angle: 0,
    speed: Math.random() > 0.5 ? speed : -speed,
    color: genRanHex(6),
  }
}

function renderSun(ctx) {
  renderPlanet(SUN, ctx)
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
  ctx.closePath()
  drawTexts(ctx, planet)
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

function getForce(planet, sun) {
  const distance = getDistance(planet.x, planet.y, sun.x, sun.y)
  const force = (G * planet.m * sun.m) / Math.pow(distance, 2)
  return force
}

function drawTexts(ctx, planet) {
  ctx.beginPath()
  ctx.font = '11px Arial'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`x=${Number(planet.x).toFixed(2)}`, planet.x, planet.y + 20)
  ctx.fillText(`y=${Number(planet.x).toFixed(2)}`, planet.x, planet.y + 30)
  ctx.fillText(`m=${Number(planet.m).toFixed(2)}`, planet.x, planet.y + 40)
  if (planet.force) {
    ctx.fillText(
      `f=${Number(planet.force).toFixed(2)}`,
      planet.x,
      planet.y + 50
    )
  }
  ctx.closePath()
}
function simulateOrbit(planets, ctx) {
  for (const planet of planets) {
    const force = getForce(planet, SUN)
    const newX = planet.d * Math.cos(planet.angle * (Math.PI / 180))
    const newY = planet.d * Math.sin(planet.angle * (Math.PI / 180))
    Object.assign(planet, { force })
    planet.x =
      CENTER_X + newX + Math.cos(planet.angle * (Math.PI / 180)) * force + force
    planet.y =
      CENTER_Y + newY + Math.sin(planet.angle * (Math.PI / 180)) * force + force
    planet.angle += planet.speed
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
  function loop(timestamp) {
    requestAnimationFrame(loop)
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    drawLines(ctx)
    separateQuadrants(ctx)
    renderSun(ctx)
    drawCircle(ctx)
    simulateOrbit(planets, ctx, timestamp)
  }
  loop()
}

main()
