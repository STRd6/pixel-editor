Pixel Editor
============

Welcome to this cool pixel editor. Eventually you'll be able to read this for
help, but right now it's mostly code.

Editing pixels in your browser.

    # For debug purposes
    global.PACKAGE = PACKAGE
    global.require = require

    require "appcache"
    require "jquery-utils"

    require "./lib/canvas-to-blob"
    saveAs = require "./lib/file_saver"

    runtime = require("runtime")(PACKAGE)
    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    console.log "starting..."

    require("facebook").init "391109411021092", null, (FB) ->
      console.log FB

    TouchCanvas = require "touch-canvas"
    GridGen = require "grid-gen"

    Drop = require "./drop"

    Command = require "./command"
    Undo = require "undo"
    Hotkeys = require "hotkeys"
    Tools = require "./tools"
    Actions = require "./actions"
    Layer = require "./layer"
    Notifications = require "./notifications"

    Palette = require("./palette")

    template = require "./templates/editor"
    debugTemplate = require "./templates/debug"

    {Size} = require "./util"

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
      self.include Notifications

      activeTool = self.activeTool

      updateActiveLayer = ->
        # TODO: This may need to have consideration for undo-ability.
        if self.layers.indexOf(self.activeLayer()) is -1
          self.activeLayer self.layers().last()

      drawPixel = (canvas, x, y, color, size) ->
        # HACK for previewCanvas
        if canvas is previewCanvas and color is "transparent"
          # TODO: Background color for the canvas area
          color = "white"

        if color is "transparent"
          canvas.clear
            x: x * size
            y: y * size
            width: size
            height: size
        else
          canvas.drawRect
            x: x * size
            y: y * size
            width: size
            height: size
            color: color

      self.extend
        activeIndex: activeIndex
        activeLayer: Observable()
        activeLayerIndex: ->
          self.layers.indexOf(self.activeLayer())

        backgroundIndex: Observable 0

        pixelSize: pixelSize
        pixelExtent: pixelExtent

        handlePaste: (data) ->
          command = self.Command.Composite()
          self.execute command

          if data.width > pixelExtent().width or data.height > pixelExtent().height
            command.push self.Command.Resize pixelExtent().max(data)

          command.push self.Command.NewLayer(data)

        newLayer: (data) ->
          makeLayer(data?.data)

          self.repaint()

        removeLayer: ->
          self.layers.pop()
          updateActiveLayer()

          self.repaint()

        outputCanvas: (scale=1)->
          outputCanvas = TouchCanvas pixelExtent().scale(scale)

          self.layers.forEach (layer) ->
            # TODO: Only paint once per pixel, rather than once per pixel per layer
            # by being smarter about transparency
            layer.each (index, x, y) ->
              outputCanvas.drawRect
                x: x * scale
                y: y * scale
                width: scale
                height: scale
                color: self.palette()[index]

          outputCanvas.element()

        resize: (size) ->
          pixelExtent Size(size)

        repaint: ->
          self.layers().first().each (_, x, y) ->
            self.repaintPixel {x, y}

          return self

        restoreState: (state) ->
          self.palette state.palette
          self.restoreLayerState(state.layers)

          self.activeLayer self.layers()[state.activeLayerIndex]

          self.history state.history?.map self.Command.parse

        saveState: ->
          palette: self.palette()
          layers: self.layerState()
          activeLayerIndex: self.activeLayerIndex()
          history: self.history().invoke "toJSON"

        layerState: ->
          self.layers().invoke "toJSON"

        restoreLayerState: (layerData) ->
          self.pixelExtent Size layerData.first()

          index = self.activeLayerIndex()

          self.layers []

          layerData.forEach (layerData) ->
            makeLayer layerData.data

          self.activeLayer self.layer(index)

          self.repaint()

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

        repaintPixel: ({x, y, index:colorIndex, layer:layerIndex}) ->
          if canvas is previewCanvas
            # Need to get clever to handle the layers and transparancy, so it gets a little nuts

            index = self.layers.map (layer, i) ->
              if i is layerIndex # Replace the layer's pixel with our preview pixel
                if colorIndex is 0
                  self.layers.map (layer, i) ->
                    layer.get(x, y)
                  .filter (index, i) ->
                    (index != 0) and !self.layers()[i].hidden() and (i < layerIndex)
                  .last() or self.backgroundIndex()
                else
                  colorIndex
              else
                layer.get(x, y)
            .filter (index, i) ->
              # HACK: Transparent is assumed to be index zero
              (index != 0) and !self.layers()[i].hidden()
            .last() or self.backgroundIndex()
          else
            index = self.layers.map (layer) ->
              layer.get(x, y)
            .filter (index, i) ->
              # HACK: Transparent is assumed to be index zero
              (index != 0) and !self.layers()[i].hidden()
            .last() or self.backgroundIndex()

          color = self.palette()[index]

          drawPixel(canvas, x, y, color, pixelSize())
          drawPixel(thumbnailCanvas, x, y, color, 1) unless canvas is previewCanvas

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

        layer.hidden.observe self.repaint

        self.layers.push layer
        self.activeLayer layer

      makeLayer()

      $('body').append template self

      canvas = TouchCanvas canvasSize()
      previewCanvas = TouchCanvas canvasSize()
      thumbnailCanvas = TouchCanvas pixelExtent()

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

      $(".thumbnail").append thumbnailCanvas.element()

      updateViewportCentering = (->
        size = canvasSize()
        $(".viewport").toggleClass "vertical-center", size.height < $(".main").height()
      ).debounce(15)
      $(window).resize updateViewportCentering

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

        $(".overlay").css
          backgroundImage: gridImage

        updateViewportCentering()

        self.repaint()

      updateCanvasSize(canvasSize())
      canvasSize.observe updateCanvasSize

      updatePixelExtent = (size) ->
        self.layers.forEach (layer) ->
          layer.resize size

        element = thumbnailCanvas.element()
        element.width = size.width
        element.height = size.height

        thumbnailCanvas.clear()

        self.repaint()

      pixelExtent.observe updatePixelExtent

      self.palette.observe ->
        self.repaint()

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

      return self

    # For debugging
    global.editor = Editor()

    if global.parent? and global.parent != global
      console.log "postin ready"
      parent.postMessage
        status: "ready"
      , "*"

    editor.notify("Welcome to PixiPaint!")
