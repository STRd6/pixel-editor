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
    
    {line} = require "./util"

    Editor = (I={}, self) ->
      activeColor = "red"
      pixelSize = 20
      canvasSize = 320

      lastCommand = null

      self ?= Model(I)

      self.include Undo
      self.include Hotkeys

      self.extend
        changePixel: ({x, y, color})->
          canvas.drawRect
            x: x * pixelSize
            y: y * pixelSize
            width: pixelSize
            height: pixelSize
            color: color

        getPixel: ({x, y}) ->
          x: x
          y: y
          color: "white" #TODO real color

      $('body').append template
        colors: Palette.defaults
        pickColor: (color) ->
          activeColor = color

      canvas = TouchCanvas
        width: 320
        height: 320

      $('.viewport').append canvas.element()

      draw = ({x, y}) ->
        lastCommand.push Command.ChangePixel
          x: x
          y: y
          color: activeColor
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
