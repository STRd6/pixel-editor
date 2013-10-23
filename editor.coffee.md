Pixel Editor
============

Editing pixels in your browser.

    require "hotkeys"
    TouchCanvas = require "touch-canvas"

    Palette = require("./palette")
    runtime = require("runtime")(PACKAGE)

    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    template = require "./templates/editor"

    activeColor = "red"
    pixelSize = 20
    canvasSize = 320

    $('body').append template
      colors: Palette.defaults
      pickColor: (color) ->
        activeColor = color

    canvas = TouchCanvas
      width: 320
      height: 320

    $('.viewport').append canvas.element()

    canvas.on "touch", (position) ->
      canvas.drawRect
        position: position.scale(canvasSize).snap(pixelSize)
        width: pixelSize
        height: pixelSize
        color: activeColor

    canvas.on "move", (position, previousPosition) ->
      if previousPosition
        canvas.drawLine
          start: previousPosition.scale(canvasSize)
          end: position.scale(canvasSize)
          color: activeColor

    canvas.on "release", (position) ->
      canvas.drawRect
        position: position.scale(canvasSize).snap(pixelSize)
        width: pixelSize
        height: pixelSize
        color: activeColor
