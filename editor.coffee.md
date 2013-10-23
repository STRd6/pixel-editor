Pixel Editor
============

Editing pixels in your browser.

    require "hotkeys"
    TouchCanvas = require "touch-canvas"

    Command = require "./command"
    Undo = require "./undo"
    Hotkeys = require "./hotkeys"

    Palette = require("./palette")
    runtime = require("runtime")(PACKAGE)

    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    template = require "./templates/editor"

    {line, Grid} = require "./util"

    Editor = (I={}, self) ->
      activeIndex = Observable(0)

      pixelSize = 20
      canvasSize = 320
      palette = Palette.defaults

      lastCommand = null

      self ?= Model(I)

      self.include Undo
      self.include Hotkeys

      pixels = Grid(16, 16, 0)

      self.extend
        changePixel: ({x, y, index})->
          pixels.set(x, y, index)

          canvas.drawRect
            x: x * pixelSize
            y: y * pixelSize
            width: pixelSize
            height: pixelSize
            color: palette[index]

        getPixel: ({x, y}) ->
          x: x
          y: y
          index: pixels.get(x, y)

      $('body').append template
        colors: palette
        pickColor: (color, index) ->
          activeIndex(index)

      canvas = TouchCanvas
        width: 320
        height: 320

      $('.viewport').append canvas.element()

      draw = ({x, y}) ->
        lastCommand.push Command.ChangePixel
          x: x
          y: y
          index: activeIndex()
        , self

      canvas.on "touch", (position) ->
        lastCommand = Command.Composite()
        self.execute lastCommand

        draw(position.scale(canvasSize / pixelSize).floor())

      canvas.on "move", (position, previousPosition) ->
        start = previousPosition.scale(canvasSize / pixelSize).floor()
        end = position.scale(canvasSize / pixelSize).floor()

        line start, end, draw

      canvas.on "release", (position) ->

      return self

    Editor()
