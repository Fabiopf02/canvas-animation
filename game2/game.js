const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CENTER_X = WIDTH / 2
const SOIL_HEIGHT = 100
const GRAVITY = 12
const OBSTACLES = 50
const TREES = 200
let GAME_SPEED = 10
let LEFT = false
let RIGHT = true
let STOPPED = false
let BULLET_LEFT = false
let BULLET_RIGHT = false
let BULLET_UP = false
let IS_ON_TOP_OF_OBSTACLE = false
let IS_UNDER_OBSTACLE = false
let GAME_OVER = false
let PERSON_COLLISION = true
const points = []
const bullets = []
const obstacles = []
const enemies = []
const obstaclesWithRotation = []
const trees = []
const colors = {
  person: '#0095DD',
  sun: '#ffd700',
  obstacle: '#7159c1',
  enemie: '#ff4444',
  point: '#ff6666',
  bullet: '#000000',
  night: '#000000',
  day: 'rgb(163, 204, 238)',
  moom: '#ffffff',
  tree: '#069647',
  obstacleWithRotation: '#9b49c1',
}
const tSky = (30 * WIDTH) / GAME_SPEED
const sky = {
  r: { t: 163 / tSky, v: 163 },
  g: { t: 204 / tSky, v: 204 },
  b: { t: 238 / tSky, v: 238 },
}
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH
canvas.height = HEIGHT
function getColor() {
  if (sun.state === 'day') {
    sky.r.v -= sky.r.t
    sky.g.v -= sky.g.t
    sky.b.v -= sky.b.t
  } else {
    sky.r.v += sky.r.t
    sky.g.v += sky.g.t
    sky.b.v += sky.b.t
  }
  return `rgb(${sky.r.v}, ${sky.g.v}, ${sky.b.v})`
}

const sun = {
  x: WIDTH / 1.2,
  y: HEIGHT / 6,
  radius: 70,
  state: 'day',
  color: colors.sun,
  draw: function () {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.closePath()
  },
  move: function () {
    const { length } = obstacles
    if (LEFT) this.x += GAME_SPEED / (length * 0.6)
    if (RIGHT) this.x -= GAME_SPEED / (length * 0.6)
  },
}

const person = {
  x: 10,
  y: 0,
  size: 50,
  score: 0,
  jumping: false,
  color: colors.person,
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
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 10
    ctx.fillRect(this.x, this.y, this.size, this.size)
    ctx.arc(
      this.x + this.size / 2,
      this.y + this.size / 2,
      this.size / 5,
      0,
      Math.PI * 2,
      false
    )
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
  },
  update: function () {
    if (this.jumping && !IS_ON_TOP_OF_OBSTACLE && !IS_UNDER_OBSTACLE) {
      const velocity = getVelocity(this.jump_speed, this.jump_time)
      this.current_jump_speed = velocity
      this.jump_time += 0.15
    }
    if (IS_UNDER_OBSTACLE) {
      const velocity = getVelocity(0, this.jump_time)
      this.current_jump_speed = velocity
      this.jump_time += 0.15
    }
    this.y -= this.current_jump_speed
    if (this.y + this.size >= HEIGHT - SOIL_HEIGHT && !IS_ON_TOP_OF_OBSTACLE) {
      this.y = HEIGHT - SOIL_HEIGHT - this.size
      IS_UNDER_OBSTACLE = false
      this.jumping = false
    }
    if (LEFT) {
      if (this.x <= 0) return
      this.x -= GAME_SPEED
    } else if (RIGHT) {
      if (this.x + this.size >= CENTER_X * 0.8 || this.x + this.size >= WIDTH)
        return
      this.x += GAME_SPEED
    }
  },
  jump: function () {
    if (IS_ON_TOP_OF_OBSTACLE) {
      this.jumping = false
      IS_ON_TOP_OF_OBSTACLE = false
    }
    if (this.jumping === false) {
      this.jump_time = 0
      this.jump_speed = 30
      this.jumping = true
    }
  },
}

function getVelocity(v0, t) {
  return v0 - GRAVITY * t
}

function renderSoil() {
  ctx.beginPath()
  ctx.fillStyle = colors.tree
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
  const initialX = getRandomX(width) + lastObstacle.x
  const initialY = HEIGHT - SOIL_HEIGHT - height
  const obstacle = {
    width,
    height: Math.random() > 0.5 ? height / 2 : height,
    initialX,
    initialY,
    x: initialX,
    y: initialY,
    color: colors.obstacle,
    fixed: Math.random() < 0.6,
    dY: -1,
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.rect(this.x, this.y, this.width, this.height)
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      if (!this.fixed) {
        if (this.y < this.initialY - 1.8 * this.height) this.dY += 2
        else if (this.y + this.height >= HEIGHT - SOIL_HEIGHT) this.dY -= 2
        this.y += this.dY * 1
      }
      if (LEFT) this.x += GAME_SPEED
      if (RIGHT) this.x -= GAME_SPEED
    },
  }
  return obstacle
}

function move(key, value) {
  const _value = value ? key : null
  if (key === 'w') return person.jump()
  // if (key === 'a') return (LEFT = _value)
  // if (key === 'd') return (RIGHT = _value)
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
  ctx.fillText(`game speed: ${GAME_SPEED}`, 10, 185)
}

function isOnTopObstacle(person, obstacle) {
  const posY = person.y + person.size
  const posX = person.x + person.size
  return (
    posY - GAME_SPEED >= obstacle.y &&
    posY < obstacle.y + person.size / 1.8 &&
    posX > obstacle.x &&
    person.x < obstacle.x + obstacle.width &&
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
    color: colors.point,
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.rect(this.x, this.y, this.size, this.size)
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      if (LEFT) this.x += GAME_SPEED
      if (RIGHT) this.x -= GAME_SPEED
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
  const speed = GAME_SPEED * 1.1
  const vX = BULLET_LEFT || BULLET_RIGHT ? (BULLET_LEFT ? -speed : speed) : 0
  const vY = BULLET_UP ? -speed : 0
  const bullet = {
    x,
    y,
    size,
    color: colors.bullet,
    speed,
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

function createEnemie() {
  const size = Math.random() * 15 + 25
  const x = getRandomX(size) * (enemies.length + 1)
  const y = HEIGHT - SOIL_HEIGHT - size
  const speed = Math.random() * 2 + 1
  const enemie = {
    x,
    y,
    size,
    color: colors.enemie,
    speed,
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.rect(this.x, this.y, this.size, this.size)
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      if (person.x + person.size < this.x) this.x -= Math.pow(this.speed, 3)
      if (person.x > this.x + this.size) this.x += speed / 2
      // this.x += this.speed
    },
  }
  enemies.push(enemie)
}

function createEnemies(n) {
  for (let i = 0; i < n; i++) {
    createEnemie()
  }
}

function renderEnemies() {
  for (let enemieIndex = 0; enemieIndex < enemies.length; enemieIndex++) {
    const enemie = enemies[enemieIndex]
    enemie.move()
    enemie.draw()
  }
}

function checkEnemieObstacleCollision() {
  for (let enemieIndex = 0; enemieIndex < enemies.length; enemieIndex++) {
    const enemie = enemies[enemieIndex]
    for (
      let obstacleIndex = 0;
      obstacleIndex < obstacles.length;
      obstacleIndex++
    ) {
      const obstacle = obstacles[obstacleIndex]
      if (
        enemie.x + enemie.size >= obstacle.x &&
        enemie.x <= obstacle.x + obstacle.width &&
        enemie.y + enemie.size >= obstacle.y &&
        enemie.y <= obstacle.y + obstacle.height
      ) {
        // enemie.speed *= -2
      }
    }
  }
}

function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

function createObstacleWithRotation() {
  const radius = Math.random() * 15 + 20
  const lastObstacleWithRotation = obstaclesWithRotation[
    obstaclesWithRotation.length - 1
  ] || { x: getRandomX(radius) }
  const AREA = HEIGHT - SOIL_HEIGHT
  const centerY = Math.random() * (AREA / 2) + AREA / 2 - radius
  const centerX = lastObstacleWithRotation.x + getRandomX(radius)
  const d = getDistance(centerX, centerY, centerX, AREA - radius)
  let y = centerY + d
  let x = centerX + d + radius
  const obstacle = {
    x,
    y,
    centerX,
    centerY,
    speed: Math.random() * 3 + 1.5,
    angle: 0,
    color: colors.obstacleWithRotation,
    radius,
    d,
    draw: function () {
      ctx.beginPath()
      // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.rect(this.x, this.y, this.radius, this.radius)
      ctx.fillStyle = this.color
      ctx.moveTo(this.centerX, this.centerY)
      ctx.lineTo(this.x + this.radius / 2, this.y + this.radius / 2)
      ctx.lineWidth = 1
      ctx.strokeStyle = this.color
      ctx.rect(this.centerX - 5, this.centerY - 5, 10, this.d + radius + 5)
      ctx.stroke()
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      const newX = this.d * Math.cos(this.angle * (Math.PI / 180))
      const newY = this.d * Math.sin(this.angle * (Math.PI / 180))
      this.x = this.centerX + newX + Math.cos(this.angle * (Math.PI / 180))
      this.y = this.centerY + newY + Math.sin(this.angle * (Math.PI / 180))
      this.angle += this.speed
      if (LEFT) this.centerX += GAME_SPEED
      if (RIGHT) this.centerX -= GAME_SPEED
    },
  }
  obstaclesWithRotation.push(obstacle)
  return obstacle
}

function createObstaclesWithRotation(n) {
  for (let i = 0; i < n; i++) {
    createObstacleWithRotation()
  }
}

function renderObstaclesWithRotation() {
  for (
    let obstacleWithRotationIndex = 0;
    obstacleWithRotationIndex < obstaclesWithRotation.length;
    obstacleWithRotationIndex++
  ) {
    const obstacleWithRotation =
      obstaclesWithRotation[obstacleWithRotationIndex]
    obstacleWithRotation.move()
    obstacleWithRotation.draw()
  }
}

function changeTheme() {
  document.querySelector('body').style.background =
    sun.state === 'night' ? colors.night : colors.day
  sun.color = sun.state === 'night' ? colors.moom : colors.sun
  sun.x = WIDTH + sun.radius
}

function checkObstacleWithRotationCollisionWithPerson() {
  for (
    let obstacleWithRotationIndex = 0;
    obstacleWithRotationIndex < obstaclesWithRotation.length;
    obstacleWithRotationIndex++
  ) {
    const obstacleWithRotation =
      obstaclesWithRotation[obstacleWithRotationIndex]
    if (
      person.x + person.size >= obstacleWithRotation.x &&
      person.x <= obstacleWithRotation.x + obstacleWithRotation.radius &&
      person.y + person.size >= obstacleWithRotation.y &&
      person.y <= obstacleWithRotation.y + obstacleWithRotation.radius
    ) {
      GAME_OVER = true
    }
  }
}

function createTree() {
  const width = Math.random() * 200 + 50
  const lastTree = trees[trees.length - 1] || { x: getRandomX(width) / 3 }
  const x = lastTree.x + getRandomX(width) / 5
  const bodyWidth = Math.random() * (width * 0.2) + width * 0.2
  const y = Math.random() * ((HEIGHT - SOIL_HEIGHT) / 2) + 80
  const height = Math.random() * (HEIGHT - y - SOIL_HEIGHT - 150) + 150
  const tree = {
    x,
    y,
    width,
    height,
    bodyWidth,
    draw: function () {
      ctx.beginPath()
      ctx.fillStyle = colors.tree
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x - this.width / 2, this.y + this.height)
      ctx.lineTo(this.x + this.width / 2, this.y + this.height)
      ctx.fill()
      ctx.closePath()
      ctx.beginPath()
      ctx.fillStyle = '#4f3b12'
      ctx.rect(
        this.x - this.bodyWidth / 2,
        this.y + this.height,
        this.bodyWidth,
        HEIGHT - this.y - this.height - SOIL_HEIGHT
      )
      ctx.fill()
      ctx.closePath()
    },
    move: function () {
      if (LEFT) this.x += GAME_SPEED * 0.3
      if (RIGHT) this.x -= GAME_SPEED * 0.3
    },
  }
  trees.push(tree)
}

function createTrees(n) {
  for (let i = 0; i < n; i++) {
    createTree()
  }
}

function renderTrees() {
  for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
    const tree = trees[treeIndex]
    tree.move()
    tree.draw()
  }
}

function checkBulletEnemiesCollision() {
  for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++) {
    const bullet = bullets[bulletIndex]
    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
      const enemy = enemies[enemyIndex]
      if (
        bullet.x + bullet.size >= enemy.x &&
        bullet.x <= enemy.x + enemy.size &&
        bullet.y + bullet.size >= enemy.y &&
        bullet.y <= enemy.y + enemy.size
      ) {
        enemies.splice(enemyIndex, 1)
        bullets.splice(bulletIndex, 1)
        person.score += 1
      }
    }
  }
}

function checkTheme() {
  if (sun.x + sun.radius < 0) {
    sun.state = sun.state === 'day' ? 'night' : 'day'
    changeTheme()
  }
  const color = getColor()
  document.querySelector('body').style.background = color
}

function checkPersonEnemiesCollision() {
  for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
    const enemy = enemies[enemyIndex]
    if (
      person.x + person.size >= enemy.x &&
      person.x <= enemy.x + enemy.size &&
      person.y + person.size >= enemy.y &&
      person.y <= enemy.y + enemy.size
    ) {
      GAME_OVER = true
    }
  }
}

function main() {
  person.init()
  createObstacles(OBSTACLES)
  createPoints(OBSTACLES)
  createEnemies(OBSTACLES)
  createObstaclesWithRotation(OBSTACLES)
  createTrees(TREES)
  function loop() {
    if (GAME_OVER) return alert('GAME OVER')
    GAME_SPEED += 0.001
    checkTheme()
    person.update()
    checkPointCollision()
    if (PERSON_COLLISION) {
      checkObstacleCollision()
      checkObstacleWithRotationCollisionWithPerson()
      checkPersonEnemiesCollision()
    }
    checkBulletEnemiesCollision()
    checkBulletObstacleCollision()
    // checkEnemieObstacleCollision()
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    sun.draw()
    if (!STOPPED) sun.move()
    renderTrees()
    renderSoil()
    renderObstacles()
    person.draw()
    renderEnemies()
    renderPoints()
    renderBullets()
    renderObstaclesWithRotation()
    renderInfo()
    requestAnimationFrame(loop)
  }
  loop()
}

main()
