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

      pixelExtent = Observable Size(32, 32)
      pixelSize = Observable 8
      canvasSize = Observable ->
        pixelExtent().scale(pixelSize())

      canvas = null
      lastCommand = null

      self ?= Model(I)

      self.include Command
      self.include Undo
      self.include Hotkeys
      self.include Tools
      self.include Actions
      self.include Drop

      activeTool = self.activeTool

      updateActiveLayer = ->
        # TODO: This may need to have consideration for undo-ability.
        if self.layers.indexOf(self.activeLayer()) is -1
          self.activeLayer self.layers().last()

      self.extend
        activeIndex: activeIndex
        activeLayer: Observable()
        activeLayerIndex: ->
          self.layers.indexOf(self.activeLayer())

        pixelSize: pixelSize

        handlePaste: (data) ->
          {palette} = data

          # TODO: Changing palette should be undoable
          if palette?
            self.palette(palette)

          self.execute self.Command.NewLayer(data)

        newLayer: (data) ->
          # TODO: Check layer width and height against canvas width and height.
          makeLayer(data?.data)

          self.repaint()

        removeLayer: ->
          self.layers.pop()
          updateActiveLayer()

          self.repaint()

        outputCanvas: ->
          outputCanvas = TouchCanvas pixelExtent()

          self.layers.forEach (layer) ->
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

        resize: (newWidth, newHeight) ->
          console.log "TODO: Editor#resize"

        repaint: ->
          self.layers().first().each (_, x, y) ->
            self.repaintPixel {x, y}

          return self

        restoreState: (state) ->
          self.palette state.palette
          self.layers state.layers.map (data) ->
            data.palette = self.palette

            Layer data

          self.activeLayer self.layers()[state.activeLayerIndex]

          self.history state.history

          self.repaint()

        saveState: ->
          palette: self.palette()
          layers: self.layers().invoke "toJSON"
          activeLayerIndex: self.activeLayerIndex()
          history: self.history().invoke "toJSON"

        draw: ({x, y}) ->
          lastCommand.push self.Command.ChangePixel
            x: x
            y: y
            index: activeIndex()
            layer: self.activeLayerIndex()

        changePixel: (params) ->
          {x, y, index, layer} = params

          self.layer(layer).set(x, y, index) unless canvas is previewCanvas

          self.repaintPixel(params)

        layers: Observable []

        layer: (index) ->
          if index?
            self.layers()[index]
          else
            self.activeLayer()

        repaintPixel: ({x, y, index}) ->
          if canvas is previewCanvas
            # Use given index for previews
          else
            index = self.layers.map (layer) ->
              layer.get(x, y)
            .filter (index) ->
              # HACK: Transparent is assumed to be index zero
              index != 0
            .last() or 0

          color = self.palette()[index]

          if color is "transparent"
            canvas.clear
              x: x * pixelSize()
              y: y * pixelSize()
              width: pixelSize()
              height: pixelSize()
          else
            canvas.drawRect
              x: x * pixelSize()
              y: y * pixelSize()
              width: pixelSize()
              height: pixelSize()
              color: color

        getPixel: ({x, y, layer}) ->
          x: x
          y: y
          index: self.layer(layer).get(x, y)
          layer: layer ? self.activeLayerIndex()

        # HACK: Adding in transparent to palette
        palette: Observable(["transparent"].concat Palette.dawnBringer32)

This preview function is a little nuts, but I'm not sure how to clean it up.

It makes a copy of the current command chunk for undoing, sets the canvas
equal to the preview canvas, then executes the passed in function.

We'll probably want to use a whole preview layer, so we don't need to worry about
accidentally setting the pixel values during the preview.

        preview: (fn) ->
          realCommand = lastCommand
          lastCommand = self.Command.Composite()
          realCanvas = canvas
          canvas = previewCanvas

          canvas.clear()

          fn()

          canvas = realCanvas
          lastCommand = realCommand

      makeLayer = (data) ->
        layer = Layer
          width: pixelExtent().width
          height: pixelExtent().height
          data: data
          palette: self.palette

        self.layers.push layer
        self.activeLayer layer

      makeLayer()

      $('body').append template self

      canvas = TouchCanvas canvasSize()
      previewCanvas = TouchCanvas canvasSize()

      # TODO: Tempest should have an easier way to do this
      updateActiveColor = (newIndex) ->
        color = self.palette()[newIndex]

        $(".palette .current").css
          backgroundColor: color

      updateActiveColor(activeIndex())
      activeIndex.observe updateActiveColor

      $(".viewport")
        .append(canvas.element())
        .append($(previewCanvas.element()).addClass("preview"))

      updateCanvasSize = (size) ->
        gridImage = GridGen(
          # TODO: Grid size options and matching pixel size/extent
        ).backgroundImage()

        [canvas, previewCanvas].forEach (canvas) ->
          element = canvas.element()
          element.width = size.width
          element.height = size.height

          canvas.clear()

        $(".viewport, .overlay").css
          width: size.width
          height: size.height

        $(".viewport").toggleClass "vertical-center", size.height < $(".main").height()

        $(".overlay").css
          backgroundImage: gridImage

        self.repaint()

      updateCanvasSize(canvasSize())
      canvasSize.observe updateCanvasSize

      canvasPosition = (position) ->
        position.scale(pixelExtent()).floor()

      previewCanvas.on "touch", (position) ->
        lastCommand = self.Command.Composite()
        self.execute lastCommand

        activeTool().touch
          position: canvasPosition position
          editor: self

      previewCanvas.on "move", (position) ->
        activeTool().move
          position: canvasPosition position
          editor: self

      previewCanvas.on "release", (position) ->
        activeTool().release
          position: canvasPosition position
          editor: self

        previewCanvas.clear()

      self.repaint()

      return self

    Editor()
