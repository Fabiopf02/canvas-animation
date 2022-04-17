const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
let UP = false
let DOWN = false
let GAME_OVER = false
const GAME = {
  difficulty: 0,
  bestScore: '',
  bestDefeated: '',
}
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH
canvas.height = HEIGHT

const enemies = []
const person = {
  x: 0,
  score: 0,
  defeated_enemies: 0,
  y: HEIGHT / 2,
  size: WIDTH / 30,
  speed: 15,
  bullets: [],
  draw: function () {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(this.x, this.y, this.size, this.size)
  },
  updateScore: function (enemie) {
    this.score += parseInt(enemie.maxSize - enemie.size)
    this.defeated_enemies++
  },
  update: function () {
    if (UP) {
      if (person.y <= 0) return
      this.y -= person.speed
    }
    if (DOWN) {
      if (person.y + person.size >= HEIGHT) return
      this.y += person.speed
    }
  },
}

function getTheBestScore() {
  const saved = localStorage.getItem('best-game')
  if (!saved) return 0
  const { score, defeated } = JSON.parse(saved)
  GAME.bestScore = score
  GAME.bestDefeated = defeated
}

function saveTheBest() {
  const saved = localStorage.getItem('best-game')
  if (!saved)
    return localStorage.setItem(
      'best-game',
      JSON.stringify({ score: person.score, defeated: person.defeated_enemies })
    )
  const savedGame = JSON.parse(saved)
  if (!savedGame.score) savedGame.score = person.score
  if (savedGame.score < person.score) {
    savedGame.score = person.score
  }
  if (!savedGame.defeated) savedGame.defeated = person.defeated_enemies
  if (savedGame.defeated < person.defeated_enemies) {
    savedGame.defeated = person.defeated_enemies
  }
  localStorage.setItem('best-game', JSON.stringify(savedGame))
}

const addBullet = () => {
  const bullet = {
    x: person.x + person.size,
    y: person.y + person.size / 2,
    size: person.size / 4,
    speed: person.speed * 2,
    draw: function () {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(this.x, this.y, this.size, this.size)
    },
    update: function () {
      this.x += this.speed
    },
  }
  person.bullets.push(bullet)
}

window.onkeydown = function (e) {
  if (e.code === 'ArrowUp') UP = true
  if (e.code === 'ArrowDown') DOWN = true
  if (e.code === 'Space') addBullet()
}
window.onkeyup = function (e) {
  if (e.code === 'ArrowUp') UP = false
  if (e.code === 'ArrowDown') DOWN = false
}

function createEnemie() {
  const size = Math.random() * 30 + 15
  const enemie = {
    size,
    minSize: size * 0.2,
    maxSize: size * 4,
    dVariation: 1,
    variation: Math.random() > 0.5,
    x: WIDTH,
    y: Math.random() * (HEIGHT - 30),
    speed: -(Math.random() * 8 + 3),
    dY: Math.random() > 0.5 ? 1 : -1,
    draw: function () {
      ctx.fillStyle = '#ff5555'
      ctx.fillRect(this.x, this.y, this.size, this.size)
    },
    update: function () {
      if (this.variation) {
        if (this.size >= this.maxSize) {
          this.dVariation = -1
        }
        if (this.size <= this.minSize) {
          this.dVariation = 1
        }
        this.size += this.dVariation > 0 ? 0.3 : -0.3
      }
      this.x += this.speed
      if (this.y <= 0) this.dY *= -1
      if (this.y + this.size >= HEIGHT) this.dY *= -1
      this.y += this.dY * this.speed
    },
  }
  return enemie
}

function checkGameOver() {
  for (let enemieIndex = 0; enemieIndex < enemies.length; enemieIndex++) {
    const enemie = enemies[enemieIndex]
    if (
      enemie.x + enemie.size > person.x &&
      enemie.x < person.x + person.size &&
      enemie.y + enemie.size > person.y &&
      enemie.y < person.y + person.size
    ) {
      alert('Game Over')
      saveTheBest()
      return true
    }
  }
}

function renderBullets() {
  for (bullet of person.bullets) {
    bullet.update()
    bullet.draw()
    if (bullet.x > WIDTH) {
      person.bullets.splice(enemies.indexOf(bullet), 1)
    }
  }
}

function renderEnemies() {
  for (const enemie of enemies) {
    enemie.draw()
    enemie.update()
    if (enemie.x + enemie.size < 0) {
      enemies.splice(enemies.indexOf(enemie), 1)
    }
  }
}

function checkBulletEnemieCollision() {
  for (
    let bulletIndex = 0;
    bulletIndex < person.bullets.length;
    bulletIndex++
  ) {
    const bullet = person.bullets[bulletIndex]
    for (let enemieIndex = 0; enemieIndex < enemies.length; enemieIndex++) {
      const enemie = enemies[enemieIndex]
      if (
        bullet.x + bullet.size > enemie.x &&
        bullet.x < enemie.x + enemie.size &&
        bullet.y + bullet.size > enemie.y &&
        bullet.y < enemie.y + enemie.size
      ) {
        person.updateScore(enemie)
        person.bullets.splice(bulletIndex, 1)
        enemies.splice(enemieIndex, 1)
      }
    }
  }
}

function renderScore() {
  const difficultyText = {
    1: 'easy',
    2: 'medium',
    3: 'hard',
  }
  ctx.fillStyle = '#ffffff'
  ctx.font = '18px Arial'
  ctx.fillText(`Score: ${person.score} | ${GAME.bestScore}`, 10, 30)
  ctx.fillText(
    `Defeated: ${person.defeated_enemies} | ${GAME.bestDefeated}`,
    10,
    55
  )
  ctx.fillText(`Difficulty: ${difficultyText[GAME.difficulty]}`, 10, 80)
}

function askDifficulty() {
  const difficulty = prompt('Choose difficulty (1-3)')
  if (difficulty) {
    if (difficulty > 3 || difficulty < 1 || !Number(difficulty)) {
      alert('Difficulty must be between 1 and 10')
      askDifficulty()
    } else {
      GAME.difficulty = Number(difficulty)
    }
  } else {
    askDifficulty()
  }
}

function main() {
  getTheBestScore()
  askDifficulty()
  function loop() {
    if (checkGameOver()) return (GAME_OVER = true)
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    person.update()
    person.draw()
    renderBullets()
    renderEnemies()
    checkBulletEnemieCollision()
    renderScore()
    requestAnimationFrame(loop)
  }
  console.log(GAME.difficulty)
  const interval = setInterval(() => {
    if (GAME_OVER) return clearInterval(interval)
    const enemie = createEnemie()
    enemies.push(enemie)
  }, 1200 / GAME.difficulty)
  loop()
}

main()
