const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CENTER_X = WIDTH / 2
const SOIL_HEIGHT = 100
const GRAVITY = 10
const OBSTACLES = 50
let LEFT = false
let RIGHT = false
let STOPPED = false
let BULLET_LEFT = false
let BULLET_RIGHT = false
let BULLET_UP = false
let IS_ON_TOP_OF_OBSTACLE = false
let IS_UNDER_OBSTACLE = false
const points = []
const bullets = []
const obstacles = []
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH
canvas.height = HEIGHT

const sun = {
  x: WIDTH / 1.2,
  y: HEIGHT / 6,
  radius: 70,
  color: '#ffd700',
  draw: function () {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.closePath()
  },
  move: function () {
    const { length } = obstacles
    if (LEFT) this.x += person.speed / (length * 0.75)
    if (RIGHT) this.x -= person.speed / (length * 0.75)
  },
}

const person = {
  x: 10,
  y: 0,
  size: 50,
  speed: 8,
  score: 0,
  jumping: false,
  color: '#0095DD',
  jump_speed: 0,
  jump_time: 0,
  current_jump_speed: 0,
  init: function () {
    this.jumping = true
    this.jump_speed = 0
  },
  draw: function () {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.size, this.size)
    ctx.closePath()
  },
  update: function () {
    if (this.jumping && !IS_ON_TOP_OF_OBSTACLE && !IS_UNDER_OBSTACLE) {
      const velocity = getVelocity(this.jump_speed, this.jump_time)
      this.current_jump_speed = velocity
      this.y -= velocity
      this.jump_time += 0.15
    }
    if (IS_UNDER_OBSTACLE) {
      const velocity = getVelocity(0, this.jump_time)
      this.current_jump_speed = velocity
      this.y -= velocity
      this.jump_time += 0.15
    }
    if (this.y + this.size >= HEIGHT - SOIL_HEIGHT) {
      this.y = HEIGHT - SOIL_HEIGHT - this.size
      IS_UNDER_OBSTACLE = false
      this.jumping = false
    }
    if (LEFT) {
      if (this.x <= 0) return
      this.x -= this.speed
    } else if (RIGHT) {
      if (this.x + this.size >= CENTER_X * 0.8 || this.x + this.size >= WIDTH)
        return
      this.x += this.speed
    }
  },
  jump: function () {
    if (IS_ON_TOP_OF_OBSTACLE) {
      this.jumping = false
      IS_ON_TOP_OF_OBSTACLE = false
    }
    if (this.jumping === false) {
      this.jump_time = 0
      this.jump_speed = 25
      this.jumping = true
    }
  },
}

function getVelocity(v0, t) {
  return v0 - GRAVITY * t
}

function renderSoil() {
  ctx.beginPath()
  ctx.fillStyle = '#04d361'
  ctx.rect(0, HEIGHT - SOIL_HEIGHT, WIDTH, SOIL_HEIGHT)
  ctx.fill()
  ctx.closePath()
}

/**
 *
 * @param {number} width
 * @returns {number}
 */
function getRandomX(width) {
  return CENTER_X / 2 + Math.random() * CENTER_X + width
}

const createObstacle = () => {
  const width = Math.random() * 400 + 50
  const height = Math.random() * 120 + 40
  const lastObstacle = obstacles[obstacles.length - 1] || {
    x: getRandomX(width),
  }
  const obstacle = {
    width,
    height: Math.random() > 0.5 ? height / 2 : height,
    x: getRandomX(width) + lastObstacle.x,
    y: HEIGHT - SOIL_HEIGHT - height,
    color: '#04d361',
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.rect(this.x, this.y, this.width, this.height)
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      if (LEFT) this.x += person.speed
      if (RIGHT) this.x -= person.speed
    },
  }
  return obstacle
}

function move(key, value) {
  const _value = value ? key : null
  if (key === 'w') return person.jump()
  if (key === 'a') return (LEFT = _value)
  if (key === 'd') return (RIGHT = _value)
  if (key === 'ArrowLeft') BULLET_LEFT = _value
  if (key === 'ArrowRight') BULLET_RIGHT = _value
  if (key === 'ArrowUp') BULLET_UP = _value
  if (BULLET_LEFT || BULLET_RIGHT || BULLET_UP) createBullet()
}

document.onkeydown = function (e) {
  move(e.key, true)
}
document.onkeyup = function (e) {
  move(e.key, false)
}

function renderInfo() {
  const direction = RIGHT ? 'right' : LEFT ? 'left' : 'none'
  ctx.font = '14px Arial'
  ctx.fillStyle = '#000'
  ctx.fillText(`direction: ${direction}`, 10, 20)
  ctx.fillText(`size: ${person.size}`, 10, 35)
  ctx.fillText(`x: ${person.x}`, 10, 50)
  ctx.fillText(`y: ${person.y}`, 10, 65)
  ctx.fillText(`jumping: ${person.jumping}`, 10, 80)
  ctx.fillText(`jump time: ${person.jump_time.toFixed(2)}`, 10, 95)
  ctx.fillText(`jump speed (0): ${person.jump_speed}`, 10, 110)
  ctx.fillText(
    `current speed jump: ${
      person.jumping > 0 ? person.current_jump_speed.toFixed(2) : 0
    }`,
    10,
    125
  )
  ctx.fillText(`gravity: ${GRAVITY}`, 10, 140)
  ctx.fillText(`obstacles: ${OBSTACLES}`, 10, 155)
  ctx.fillText(`score: ${person.score}`, 10, 170)
}

function isOnTopObstacle(person, obstacle) {
  const posY = person.y + person.size
  const posX = person.x + person.size
  return (
    posY >= obstacle.y &&
    posX > obstacle.x &&
    person.x < obstacle.x + obstacle.width &&
    person.jumping === true &&
    !IS_UNDER_OBSTACLE &&
    person.current_jump_speed <= 0
  )
}
function leftCollision(person, obstacle) {
  return (
    person.x + person.size >= obstacle.x &&
    person.x + person.size <= obstacle.x + person.size &&
    person.y + person.size > obstacle.y &&
    person.y < obstacle.y + obstacle.height
  )
}
function rightCollision(person, obstacle) {
  return (
    person.x <= obstacle.x + obstacle.width &&
    person.x >= obstacle.x + obstacle.width - person.size &&
    person.y + person.size > obstacle.y &&
    person.y < obstacle.y + obstacle.height
  )
}

function isUnderObstacle(obstacle) {
  return (
    person.y >= obstacle.y + obstacle.height - person.size / 2 &&
    person.y <= obstacle.y + obstacle.height &&
    person.x + person.size > obstacle.x &&
    person.x < obstacle.x + obstacle.width &&
    HEIGHT - SOIL_HEIGHT - (obstacle.y + obstacle.height) > person.size
  )
}

function checkObstacleCollision() {
  for (
    let obstacleIndex = 0;
    obstacleIndex < obstacles.length;
    obstacleIndex++
  ) {
    const obstacle = obstacles[obstacleIndex]
    if (isUnderObstacle(obstacle)) {
      IS_UNDER_OBSTACLE = true
      person.jumping = false
      this.jump_time = 0
      break
    }
    if (isOnTopObstacle(person, obstacle)) {
      IS_ON_TOP_OF_OBSTACLE = true
      person.y = obstacle.y - person.size
    } else {
      IS_ON_TOP_OF_OBSTACLE = false
    }
    if (leftCollision(person, obstacle)) {
      person.x = obstacle.x - person.size
      break
    }
    if (rightCollision(person, obstacle)) {
      person.x = obstacle.x + obstacle.width
      break
    }
    if (IS_ON_TOP_OF_OBSTACLE) {
      break
    }
  }
}

function createPoint() {
  const minY = HEIGHT * 0.45
  const size = 14
  const value = minY - SOIL_HEIGHT - 50
  const lastPoint = points[points.length - 1] || { x: getRandomX(size) }
  const randomValue = Math.random() * value
  const point = {
    size,
    x: lastPoint.x + getRandomX(size),
    y: minY + randomValue,
    color: '#ff5555',
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.rect(this.x, this.y, this.size, this.size)
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      if (LEFT) this.x += person.speed
      if (RIGHT) this.x -= person.speed
    },
  }
  return point
}

function renderObstacles() {
  for (
    let obstacleIndex = 0;
    obstacleIndex < obstacles.length;
    obstacleIndex++
  ) {
    const obstacle = obstacles[obstacleIndex]
    if (!STOPPED) obstacle.move()
    obstacle.draw()
  }
}

function createObstacles(n) {
  for (let i = 0; i < n; i++) {
    obstacles.push(createObstacle())
  }
}

function createPoints(n) {
  for (let i = 0; i < n; i++) {
    points.push(createPoint())
  }
}

function checkPointCollision() {
  for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
    const point = points[pointIndex]
    if (
      point.x + point.size >= person.x &&
      point.x <= person.x + person.size &&
      point.y + point.size >= person.y &&
      point.y <= person.y + person.size
    ) {
      points.splice(pointIndex, 1)
      person.score += 1
    }
  }
}

function renderPoints() {
  for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
    const point = points[pointIndex]
    point.move()
    point.draw()
  }
}

function checkBulletObstacleCollision() {
  for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
    const bullet = bullets[bulletIndex]
    for (
      let obstacleIndex = 0;
      obstacleIndex < obstacles.length;
      obstacleIndex++
    ) {
      const obstacle = obstacles[obstacleIndex]
      if (
        bullet.x + bullet.size >= obstacle.x &&
        bullet.x <= obstacle.x + obstacle.width &&
        bullet.y + bullet.size >= obstacle.y &&
        bullet.y <= obstacle.y + obstacle.height
      ) {
        bullets.splice(bulletIndex, 1)
      }
    }
  }
}

function createBullet() {
  const size = 10
  const x =
    BULLET_LEFT || BULLET_RIGHT
      ? BULLET_LEFT
        ? person.x
        : person.x + person.size - size
      : person.x + person.size / 2 - size / 2
  const y = BULLET_UP ? person.y : person.y + person.size / 2 - size / 2
  const speed = 10
  const vX = BULLET_LEFT || BULLET_RIGHT ? (BULLET_LEFT ? -speed : speed) : 0
  const vY = BULLET_UP ? -speed : 0
  const bullet = {
    x,
    y,
    size,
    color: '#000000',
    speed: 10,
    vX,
    vY,
    time: 0,
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.rect(this.x, this.y, this.size, this.size)
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      this.y += this.vY
      this.vY += GRAVITY * this.time
      this.x += this.vX
      this.time += 0.00002
    },
  }
  bullets.push(bullet)
}

function renderBullets() {
  for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
    const bullet = bullets[bulletIndex]
    if (
      bullet.x < 0 ||
      bullet.x > WIDTH ||
      bullet.y + bullet.size < 0 ||
      bullet.y > HEIGHT
    ) {
      bullets.splice(bulletIndex, 1)
    } else {
      bullet.move()
      bullet.draw()
    }
  }
}

function main() {
  person.init()
  createObstacles(OBSTACLES)
  createPoints(OBSTACLES)
  function loop() {
    person.update()
    checkPointCollision()
    checkObstacleCollision()
    checkBulletObstacleCollision()
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    renderObstacles()
    renderSoil()
    sun.draw()
    if (!STOPPED) sun.move()
    person.draw()
    renderPoints()
    renderBullets()
    renderInfo()
    requestAnimationFrame(loop)
  }
  loop()
}

main()
