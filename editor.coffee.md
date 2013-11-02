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
    GridGen = require "grid-gen"

    Drop = require "./drop"

    Command = require "./command"
    Undo = require "./undo"
    Hotkeys = require "./hotkeys"
    Tools = require "./tools"
    Actions = require "./actions"
    Layer = require "./layer"

    Palette = require("./palette")

    template = require "./templates/editor"
    debugTemplate = require "./templates/debug"

    {Size, download} = require "./util"

    Editor = (I={}, self) ->
      activeIndex = Observable(1)

      pixelExtent = Size(32, 32)
      pixelSize = 8
      canvasSize = pixelExtent.scale(pixelSize)

      canvas = null
      lastCommand = null

      self ?= Model(I)

      self.include Undo
      self.include Hotkeys
      self.include Tools
      self.include Actions
      self.include Drop

      activeTool = self.activeTool

      layers = [
        Layer pixelExtent
      ]

      self.extend
        activeIndex: activeIndex

        handlePaste: (data) ->
          {palette} = data

          self.execute Command.NewLayer(data, self)

        newLayer: (data) ->
          layers.push Layer data

          self.repaint()

        removeLayer: ->
          layers.pop()

          self.repaint()

        outputCanvas: ->
          outputCanvas = TouchCanvas pixelExtent

          layers.forEach (layer) ->
            # TODO: Only paint once per pixel, rather than once per pixel per layer.
            # By being smarter about transparency
            layer.each (index, x, y) ->
              outputCanvas.drawRect
                x: x
                y: y
                width: 1
                height: 1
                color: self.palette()[index]

          outputCanvas.element()

        download: ->
          self.outputCanvas().toBlob (blob) ->
            saveAs blob, prompt("File name", "image.png")

        toDataURL: ->
          console.log self.outputCanvas().toDataURL("image/png")

        repaint: ->
          # TODO: Only paint once per pixel, rather than once per pixel per layer.
          # By being smarter about transparency
          layers.forEach (layer) ->
            layer.each (index, x, y) ->
              self.colorPixel {x, y, index}

        draw: ({x, y}) ->
          lastCommand.push Command.ChangePixel
            x: x
            y: y
            index: activeIndex()
          , self

        changePixel: (params)->
          {x, y, index, layer} = params

          self.layer(layer).set(x, y, index) unless canvas is previewCanvas

          self.colorPixel(params)

        layer: (index) ->
          if index?
            layers[index]
          else
            layers.last()

        colorPixel: ({x, y, index}) ->
          color = self.palette()[index]

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

        getPixel: ({x, y, layer}) ->
          x: x
          y: y
          index: self.layer(layer).get(x, y)

        palette: Observable(Palette.dawnBringer32)

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
        color = self.palette()[newIndex]

        $(".palette .current").css
          backgroundColor: color

      updateActiveColor(activeIndex())
      activeIndex.observe updateActiveColor

      $(".viewport")
        .css
          width: canvasSize.width
          height: canvasSize.height
        .append(canvas.element())
        .append($(previewCanvas.element()).addClass("preview"))

      $(".overlay").css
        width: canvasSize.width
        height: canvasSize.height
        backgroundImage: GridGen(
          # TODO: Grid size options and matching pixel size/extent
        ).backgroundImage()

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
