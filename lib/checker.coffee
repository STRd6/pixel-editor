module.exports = ({colors, size}={}) ->
  colors ?= ["white", "#CCCCCC"]
  size ?= 8

  canvasWidth = 2 * size
  canvasHeight = 2 * size

  canvas = document.createElement("canvas")
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  context = canvas.getContext("2d")

  context.fillStyle = colors[0]
  context.fillRect(0, 0, size, size)
  context.fillRect(size, size, size, size)
  
  context.fillStyle = colors[1]
  context.fillRect(0, size, size, size)
  context.fillRect(size, 0, size, size)

  pattern: (repeat="repeat") ->
    context.createPattern(canvas, repeat)

  backgroundImage: ->
    "url(#{this.toDataURL()})"

  toDataURL: ->
    canvas.toDataURL("image/png")
