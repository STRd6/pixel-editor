Pixel Editor
============

Editing pixels in your browser.


    require "hotkeys"

    require "./lib/canvas-to-blob"
    saveAs = require "./lib/file_saver"

    TouchCanvas = require "touch-canvas"

    Command = require "./command"
    Undo = require "./undo"
    Hotkeys = require "./hotkeys"
    Tools = require "./tools"

    Palette = require("./palette")
    runtime = require("runtime")(PACKAGE)

    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    template = require "./templates/editor"

    {Grid, download} = require "./util"

    Editor = (I={}, self) ->
      tools = Tools()

      activeIndex = Observable(0)
      activeTool = Observable tools.line

      pixelSize = 20
      canvasSize = 320
      palette = Palette.defaults

      canvas = null
      lastCommand = null

      self ?= Model(I)

      self.include Undo
      self.include Hotkeys

      pixels = Grid(16, 16, 1)

      self.extend
        activeIndex: activeIndex

        download: ->
          # TODO: Save in correct pixel scale
          canvas.element().toBlob (blob) ->
            saveAs blob, prompt("File name", "image.png")

        draw: ({x, y}) ->
          lastCommand.push Command.ChangePixel
            x: x
            y: y
            index: activeIndex()
          , self

        changePixel: ({x, y, index})->
          pixels.set(x, y, index) unless canvas is previewCanvas

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

This preview function is a little nuts, but I'm not sure how to clean it up.

It makes a copy of the current command chunk for undoing, sets the canvas
equal to the preview canvas, then executes the passed in function.

We'll probably want to use a whole preview layer, so we don't need to worry about
accidentally setting the pixel values during the preview.

        preview: (fn) ->
          realCommand = lastCommand
          lastCommand = Command.Composite()
          realCanvas = canvas
          canvas = previewCanvas

          canvas.clear()

          fn()

          canvas = realCanvas
          lastCommand = realCommand

      $('body').append template
        colors: palette
        pickColor: activeIndex

      canvas = TouchCanvas
        width: canvasSize
        height: canvasSize

      previewCanvas = TouchCanvas
        width: canvasSize
        height: canvasSize

      # TODO: Tempest should have an easier way to do this
      updateActiveColor = (newIndex) ->
        color = palette[newIndex]

        $(".palette .current").css
          backgroundColor: color

      updateActiveColor(activeIndex())
      activeIndex.observe updateActiveColor

      $('.viewport').append canvas.element()
      $(".viewport").append $(previewCanvas.element()).addClass("preview")

      canvas.on "touch", (position) ->
        lastCommand = Command.Composite()
        self.execute lastCommand

        activeTool().touch
          position: position.scale(canvasSize / pixelSize).floor()
          editor: self

      canvas.on "move", (position, previousPosition) ->
        activeTool().move
          position: position.scale(canvasSize / pixelSize).floor()
          previousPosition: previousPosition.scale(canvasSize / pixelSize).floor()
          editor: self

      canvas.on "release", (position) ->
        activeTool().release
          position: position.scale(canvasSize / pixelSize).floor()
          editor: self

        previewCanvas.clear()

      return self

    Editor()
