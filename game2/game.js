const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CENTER_X = WIDTH / 2
const SOIL_HEIGHT = 100
const GRAVITY = 10
const OBSTACLES = 50
let LEFT = false
let RIGHT = false
let STOPPED = false
let IS_ON_TOP_OF_OBSTACLE = false
let POINT = null
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
    if (LEFT) this.x += person.speed / 20
    if (RIGHT) this.x -= person.speed / 20
  },
}

const person = {
  x: 10,
  y: 0,
  size: 50,
  speed: 8,
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
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.size, this.size)
  },
  update: function () {
    if (this.jumping && !IS_ON_TOP_OF_OBSTACLE) {
      const velocity = getVelocity(this.jump_speed, this.jump_time)
      this.current_jump_speed = velocity
      this.y -= velocity
      this.jump_time += 0.15
    }
    if (this.y + this.size >= HEIGHT - SOIL_HEIGHT) {
      this.y = HEIGHT - SOIL_HEIGHT - this.size
      this.jumping = false
    }
    if (LEFT) {
      if (this.x <= 0) return
      this.x -= this.speed
    } else if (RIGHT) {
      if (this.x + this.size >= CENTER_X || this.x + this.size >= WIDTH) return
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

const createObstacle = () => {
  const width = Math.random() * 400 + 50
  const height = Math.random() * 120 + 40
  function getRandomX() {
    return CENTER_X + Math.random() * CENTER_X + width
  }
  const lastObstacle = obstacles[obstacles.length - 1] || { x: getRandomX() }
  const obstacle = {
    width,
    height: Math.random() > 0.5 ? height / 2 : height,
    x: getRandomX() + lastObstacle.x,
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
  if (key === 'ArrowUp') return person.jump()
  if (key === 'ArrowLeft') return (LEFT = _value)
  if (key === 'ArrowRight') return (RIGHT = _value)
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
}

function isOnTopObstacle(person, obstacle) {
  const posY = person.y + person.size
  const posX = person.x + person.size
  return (
    posY >= obstacle.y &&
    posX > obstacle.x &&
    person.x < obstacle.x + obstacle.width &&
    person.jumping === true &&
    person.current_jump_speed <= 0
  )
}
function leftCollision(person, obstacle) {
  const posX = person.x + person.size
  return (
    posX >= obstacle.x &&
    posX < obstacle.x + obstacle.width &&
    person.y >= obstacle.y &&
    person.y <= obstacle.y + obstacle.height
  )
}
function rightCollision(person, obstacle) {
  return (
    person.x <= obstacle.x + obstacle.width &&
    person.x + person.size > obstacle.x &&
    person.y >= obstacle.y &&
    person.y <= obstacle.y + obstacle.height
  )
}

function checkObstacleCollision() {
  for (
    let obstacleIndex = 0;
    obstacleIndex < obstacles.length;
    obstacleIndex++
  ) {
    const obstacle = obstacles[obstacleIndex]
    if (isOnTopObstacle(person, obstacle)) {
      IS_ON_TOP_OF_OBSTACLE = true
      person.y = obstacle.y - person.size
    } else {
      IS_ON_TOP_OF_OBSTACLE = false
    }
    if (leftCollision(person, obstacle)) {
      person.x = obstacle.x - person.size
    }
    if (rightCollision(person, obstacle)) {
      person.x = obstacle.x + obstacle.width
    }
    if (IS_ON_TOP_OF_OBSTACLE) {
      break
    }
  }
}

function createPoint() {
  const minY = HEIGHT * 0.45
  const value = minY - SOIL_HEIGHT - 50
  const randomValue = Math.random() * value
  const point = {
    size: 10,
    x: WIDTH,
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

function main() {
  person.init()
  createObstacles(OBSTACLES)
  function loop() {
    person.update()
    checkObstacleCollision()
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    renderObstacles()
    renderSoil()
    sun.draw()
    if (!STOPPED) sun.move()
    person.draw()
    if (POINT) {
      POINT.draw()
      POINT.move()
    }
    renderInfo()
    requestAnimationFrame(loop)
  }
  setInterval(() => {
    POINT = createPoint()
  }, [2000])
  loop()
}

main()
