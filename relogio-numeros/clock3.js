const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
const SCALE = 20
const LINE_WIDTH = WIDTH / (5 * SCALE)
const NUMBER_WIDTH = WIDTH / SCALE
const numbers = {
  0: [1, 2, 3, 5, 6, 7],
  1: [3, 6],
  2: [2, 3, 4, 5, 7],
  3: [2, 3, 4, 6, 7],
  4: [1, 3, 4, 6],
  5: [1, 2, 4, 6, 7],
  6: [1, 2, 4, 5, 6, 7],
  7: [2, 3, 6],
  8: [1, 2, 3, 4, 5, 6, 7],
  9: [1, 2, 3, 4, 6, 7],
}
const parts = {
  1: (ctx, posX, posY, margin) => {
    ctx.moveTo(posX - margin, posY - NUMBER_WIDTH)
    ctx.lineTo(posX - margin, posY - margin)
  },
  2: (ctx, posX, posY, margin) => {
    ctx.moveTo(posX + NUMBER_WIDTH, posY - NUMBER_WIDTH - margin)
    ctx.lineTo(posX, posY - NUMBER_WIDTH - margin)
  },
  3: (ctx, posX, posY, margin) => {
    ctx.moveTo(posX + NUMBER_WIDTH + margin, posY - margin)
    ctx.lineTo(posX + NUMBER_WIDTH + margin, posY - NUMBER_WIDTH)
  },
  4: (ctx, posX, posY) => {
    ctx.moveTo(posX, posY)
    ctx.lineTo(posX + NUMBER_WIDTH, posY)
  },
  5: (ctx, posX, posY, margin) => {
    ctx.moveTo(posX - margin, posY + NUMBER_WIDTH)
    ctx.lineTo(posX - margin, posY + margin)
  },
  6: (ctx, posX, posY, margin) => {
    ctx.moveTo(posX + NUMBER_WIDTH + margin, posY + NUMBER_WIDTH)
    ctx.lineTo(posX + NUMBER_WIDTH + margin, posY + margin)
  },
  7: (ctx, posX, posY) => {
    ctx.moveTo(posX, posY + NUMBER_WIDTH + 5)
    ctx.lineTo(posX + NUMBER_WIDTH, posY + NUMBER_WIDTH + 5)
  },
}

function getContext() {
  const canvas = document.getElementById('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  return { ctx }
}

function renderDivisor(ctx, x, y) {
  ctx.beginPath()
  ctx.fillStyle = '#04d361'
  ctx.rect(x - LINE_WIDTH, y - NUMBER_WIDTH / 2, LINE_WIDTH, LINE_WIDTH)
  ctx.rect(
    x - LINE_WIDTH,
    y + NUMBER_WIDTH / 2 - LINE_WIDTH,
    LINE_WIDTH,
    LINE_WIDTH
  )
  ctx.fill()
  ctx.closePath()
}

function renderNumber(ctx, x, y, numberArray) {
  const MARGIN = LINE_WIDTH * 0.7
  let posX = x
  let posY = y
  ctx.beginPath()
  ctx.strokeStyle = '#04d361'
  ctx.lineWidth = LINE_WIDTH
  for (const number of numberArray) {
    const part = parts[number]
    if (part) part(ctx, posX, posY, MARGIN)
  }
  ctx.stroke()
  ctx.closePath()
}

function clock() {
  const { ctx } = getContext()
  const space = NUMBER_WIDTH + LINE_WIDTH * 3
  const posX = CENTER_X / 2
  function loop() {
    const { format } = Intl.DateTimeFormat('pt-br', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const [hour, minutes, seconds] = format(new Date()).split(' ')[0].split(':')
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    const [hChar1, hChar2] = hour.split('')
    renderNumber(ctx, posX, CENTER_Y, numbers[hChar1])
    renderNumber(ctx, posX + space, CENTER_Y, numbers[hChar2])
    renderDivisor(ctx, posX + space * 2, CENTER_Y)
    const [mChar1, mChar2] = minutes.split('')
    renderNumber(
      ctx,
      posX + space * 2 + LINE_WIDTH * 2,
      CENTER_Y,
      numbers[mChar1]
    )
    renderNumber(
      ctx,
      posX + space * 3 + LINE_WIDTH * 2,
      CENTER_Y,
      numbers[mChar2]
    )
    renderDivisor(ctx, posX + space * 4 + LINE_WIDTH * 2, CENTER_Y)
    const [sChar1, sChar2] = seconds.split('')
    renderNumber(
      ctx,
      posX + space * 4 + LINE_WIDTH * 4,
      CENTER_Y,
      numbers[sChar1]
    )
    renderNumber(
      ctx,
      posX + space * 5 + LINE_WIDTH * 4,
      CENTER_Y,
      numbers[sChar2]
    )
  }
  setInterval(loop, 1000)
}

clock()
