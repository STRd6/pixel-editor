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

    $('body').append template
      colors: Palette.defaults
      pickColor: (color) ->
        activeColor = color

    canvas = TouchCanvas
      width: 320
      height: 320
    
    $('.viewport').append canvas.element()

    canvas.on "touch", ->
    
    canvas.on "move", (position, previousPosition) ->
      console.log position

      if previousPosition
        canvas.drawLine
          start: previousPosition.scale(320)
          end: position.scale(320)
          color: activeColor
