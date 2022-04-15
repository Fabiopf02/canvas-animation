const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
const RADIUS = 260
const MARGIN_NUMBER = (RADIUS * 2) / 6
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const T = CIRCUMFERENCE / 60
const RAD = 2 / CIRCUMFERENCE

function getContext() {
  const canvas = document.getElementById('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  return { ctx }
}

function renderCircle(ctx) {
  ctx.beginPath()
  ctx.strokeStyle = '#715c91'
  ctx.lineWidth = 4
  ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.closePath()
  ctx.beginPath()
  ctx.arc(CENTER_X, CENTER_Y, 2, 0, 2 * Math.PI)
  ctx.strokeStyle = '#715c91'
  ctx.lineWidth = 6
  ctx.stroke()
}

function renderClockHand(ctx, angle, length, width, color) {
  ctx.beginPath()
  ctx.moveTo(CENTER_X, CENTER_Y)
  ctx.lineTo(
    CENTER_X + length * Math.cos(angle),
    CENTER_Y + length * Math.sin(angle)
  )
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
  ctx.closePath()
}

/**
 *
 * @param {number} pos
 */
function getXPosNumber(pos) {
  const posX = CENTER_X - RADIUS + pos * MARGIN_NUMBER - 12
  return posX
}
/**
 *
 * @param {number} pos
 */
function getYPosNumber(pos) {
  const posY = CENTER_Y - RADIUS + pos * MARGIN_NUMBER - 12
  return posY
}

function renderNumbers(ctx) {
  ctx.font = 'bold 24px sans-serif'
  ctx.fillStyle = '#715c91'
  ctx.fillText('12', getXPosNumber(3), CENTER_Y - RADIUS + 30)
  ctx.fillText('11', getXPosNumber(2) - 30, getYPosNumber(1) - 14)
  ctx.fillText('10', getXPosNumber(1) - 35, getYPosNumber(2) - 10)
  ctx.fillText('9', getXPosNumber(0) + 22, CENTER_Y + 7)
  ctx.fillText('8', getXPosNumber(1) - 32, getYPosNumber(4) + 55)
  ctx.fillText('7', getXPosNumber(2) - 32, getYPosNumber(5) + 55)
  ctx.fillText('6', getXPosNumber(3) + 7, getYPosNumber(6))
  ctx.fillText('5', getXPosNumber(4) + 44, getYPosNumber(5) + 55)
  ctx.fillText('4', getXPosNumber(5) + 44, getYPosNumber(4) + 55)
  ctx.fillText('3', getXPosNumber(6) - 12, CENTER_Y + 7)
  ctx.fillText('2', getXPosNumber(5) + 35, getYPosNumber(1) + 62)
  ctx.fillText('1', getXPosNumber(4) + 35, getYPosNumber(0) + 72)
}

function clock() {
  const { ctx } = getContext()
  function loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, RADIUS - MARGIN_NUMBER / 2, 0, 2 * Math.PI)
    ctx.lineWidth = 0.3
    ctx.fillStyle = '#eeeeee08'
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
    renderNumbers(ctx)
    const { format } = Intl.DateTimeFormat('pt-br', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const [hour, minutes, seconds] = format(new Date()).split(' ')[0].split(':')
    const hourAngle = (hour - 6) * T * RAD
    const minutesAngle = (minutes - 15) * T * RAD
    const secondsAngle = (seconds - 15) * T * RAD
    renderClockHand(ctx, Math.PI * secondsAngle, RADIUS * 0.8, 2, '#715c91')
    renderClockHand(ctx, Math.PI * minutesAngle, RADIUS * 0.65, 4, '#9b49c1')
    renderClockHand(ctx, Math.PI * hourAngle, RADIUS * 0.45, 6, 'purple')
    renderCircle(ctx)
  }
  setInterval(loop, 1000)
}

clock()
