Pixel Editor
============

Editing pixels in your browser.

    require "jquery-utils"

    require "./lib/canvas-to-blob"
    saveAs = require "./lib/file_saver"

    runtime = require("runtime")(PACKAGE)
    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    TouchCanvas = require "touch-canvas"

    Command = require "./command"
    Undo = require "./undo"
    Hotkeys = require "./hotkeys"
    Tools = require "./tools"

    Palette = require("./palette")

    template = require "./templates/editor"
    debugTemplate = require "./templates/debug"

    {Grid, Size, download} = require "./util"

    Editor = (I={}, self) ->
      activeIndex = Observable(1)

      pixelExtent = Size(16, 16)
      pixelSize = 20
      canvasSize = pixelExtent.scale(pixelSize)
      palette = Palette.defaults

      canvas = null
      lastCommand = null

      self ?= Model(I)

      self.include Undo
      self.include Hotkeys
      self.include Tools

      activeTool = self.activeTool

      pixels = Grid(pixelExtent.width, pixelExtent.height, 0)

      self.extend
        activeIndex: activeIndex

        outputCanvas: ->
          outputCanvas = TouchCanvas pixelExtent

          pixels.each (index, x, y) ->
            outputCanvas.drawRect
              x: x
              y: y
              width: 1
              height: 1
              color: palette[index]

          outputCanvas.element()

        download: ->
          self.outputCanvas().toBlob (blob) ->
            saveAs blob, prompt("File name", "image.png")

        toDataURL: ->
          console.log self.outputCanvas().toDataURL("image/png")

        draw: ({x, y}) ->
          lastCommand.push Command.ChangePixel
            x: x
            y: y
            index: activeIndex()
          , self

        changePixel: ({x, y, index})->
          pixels.set(x, y, index) unless canvas is previewCanvas

          color = palette[index]

          if color is "transparent"
            canvas.clear
              x: x * pixelSize
              y: y * pixelSize
              width: pixelSize
              height: pixelSize
          else
            canvas.drawRect
              x: x * pixelSize
              y: y * pixelSize
              width: pixelSize
              height: pixelSize
              color: color

        getPixel: ({x, y}) ->
          x: x
          y: y
          index: pixels.get(x, y)

        palette: Observable(palette)

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

      $('body').append template self

      canvas = TouchCanvas canvasSize
      previewCanvas = TouchCanvas canvasSize

      # TODO: Tempest should have an easier way to do this
      updateActiveColor = (newIndex) ->
        color = palette[newIndex]

        $(".palette .current").css
          backgroundColor: color

      updateActiveColor(activeIndex())
      activeIndex.observe updateActiveColor

      $('.viewport').append canvas.element()
      $(".viewport").append $(previewCanvas.element()).addClass("preview")

      previewCanvas.on "touch", (position) ->
        lastCommand = Command.Composite()
        self.execute lastCommand

        activeTool().touch
          position: position.scale(pixelExtent).floor()
          editor: self

      previewCanvas.on "move", (position) ->
        activeTool().move
          position: position.scale(pixelExtent).floor()
          editor: self

      previewCanvas.on "release", (position) ->
        activeTool().release
          position: position.scale(pixelExtent).floor()
          editor: self

        previewCanvas.clear()

      return self

    Editor()
