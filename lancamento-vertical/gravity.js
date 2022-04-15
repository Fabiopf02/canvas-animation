const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
const MARGIN = 5
const GRAVITY = 9.8
const TIME = 1000

function getContext() {
  const canvas = document.getElementById('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  return { ctx }
}

const updateObject = (_object) => {
  const time_counter = _object.time_counter + TIME / 100
  const v = getVelocity(_object.v0, time_counter)
  const y = _object.y - v / 100
  const center_y = y + _object.size / 2
  Object.assign(_object, {
    y,
    v,
    center_y,
    time_counter,
  })
}

const getVelocity = (v0, t) => v0 - (GRAVITY / 100) * t

const createObject = () => {
  const max = 50
  const min = 20
  const size = Math.random() * max + min
  const x = WIDTH / 2 - size / 2
  const y = HEIGHT - MARGIN - size
  const center_x = x + size / 2
  const center_y = y + size / 2
  const m = size * size
  const v = 300
  const t = v / GRAVITY
  const time_counter = 0
  return {
    size,
    x,
    y,
    t,
    time_counter,
    center_x,
    center_y,
    v,
    v0: v,
    m,
    color: '#ffffff',
  }
}

const renderVector = (_object, ctx) => {
  ctx.beginPath()
  ctx.moveTo(_object.center_x, _object.center_y)
  ctx.strokeStyle = 'blue'
  ctx.lineTo(_object.center_x, _object.center_y - _object.v)
  ctx.stroke()
  ctx.closePath()
}

const renderObject = (_object, ctx) => {
  ctx.beginPath()
  ctx.fillStyle = _object.color
  ctx.fillRect(_object.x, _object.y, _object.size, _object.size)
  ctx.lineWidth = 1
  ctx.closePath()
  renderVector(_object, ctx)
  writeText(_object, ctx)
}

const writeText = (_object, ctx) => {
  const { x, y, size } = _object
  ctx.beginPath()
  ctx.font = '10px Arial'
  ctx.fillStyle = '#eeeeee88'
  ctx.fillText(`size=${_object.size.toFixed(2)}`, x + size + MARGIN, y - 10)
  ctx.fillText(`m=${_object.m.toFixed(2)}`, x + size + MARGIN, y)
  ctx.fillText(`x=${_object.x.toFixed(2)}`, x + size + MARGIN, y + 10)
  ctx.fillText(`y=${_object.y.toFixed(2)}`, x + size + MARGIN, y + 20)
  ctx.fillText(`v=${_object.v.toFixed(2)}`, x + size + MARGIN, y + 30)
  ctx.closePath()
}

function main() {
  const newObject = createObject()
  const { ctx } = getContext()
  function loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    renderObject(newObject, ctx)
    updateObject(newObject)
  }
  let counter = 0
  const interval = setInterval(() => {
    counter = newObject.time_counter
    if (newObject.time_counter >= newObject.t * 200) {
      console.log(counter)
      return clearInterval(interval)
    }
    if (newObject.v >= 0 && newObject.v <= 1) console.log(counter)
    loop()
  }, TIME / 100)
}
main()
