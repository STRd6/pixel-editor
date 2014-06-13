Editor
======

    loader = require("./loader")()
    {defaults} = require "util"

    TouchCanvas = require "touch-canvas"
    GridGen = require "grid-gen"

    Actions = require "./actions"
    Command = require "./command"
    Drop = require "./drop"
    Eval = require "eval"
    Layer = require "./layer"
    Notifications = require "./notifications"
    Postmaster = require "postmaster"
    Tools = require "./tools"
    Undo = require "undo"

    Palette = require("./palette")

    template = require "./templates/editor"
    debugTemplate = require "./templates/debug"

    Symmetry = require "./symmetry"

    {Size} = require "./util"

    module.exports = (I={}, self) ->
      defaults I,
        selector: "body"

      activeIndex = Observable(1)

      pixelExtent = Observable Size(32, 32)
      pixelSize = Observable 16
      canvasSize = Observable ->
        pixelExtent().scale(pixelSize())

      positionDisplay = Observable("")

      symmetryMode = Observable("normal")

      canvas = null
      lastCommand = null

      replaying = false

      self ?= Model(I)

      self.include Actions
      self.include Bindable
      self.include Command
      self.include Drop
      self.include Eval
      self.include Notifications
      self.include Postmaster
      self.include Undo
      self.include Tools

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
        positionDisplay: positionDisplay

        grid: Observable false

        handlePaste: (data) ->
          command = self.Command.Composite()
          self.execute command

          if data.width > pixelExtent().width or data.height > pixelExtent().height
            command.push self.Command.Resize pixelExtent().max(data)

          command.push self.Command.NewLayer(data)

          self.trigger "change"

        newLayer: (data) ->
          makeLayer(data?.data)

          self.repaint()

        removeLayer: ->
          self.layers.pop()
          updateActiveLayer()

          self.repaint()

        symmetryMode: symmetryMode

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
          self.layers().first()?.each (_, x, y) ->
            self.repaintPixel {x, y}

          return self

        fromDataURL: (dataURL) ->
          loader.load(dataURL)
          .then (imageData) ->
            editor.handlePaste loader.fromImageDataWithPalette(imageData, editor.palette())

        replay: ->
          # TODO: May want to prevent adding new commands while replaying!
          unless replaying
            replaying = true

            # Copy and clear history
            steps = self.history()
            self.history([])

            # TODO: initial state if not blank
            self.layers []
            makeLayer()
            self.repaint()

            delay = (5000 / steps.length).clamp(1, 250)
            i = 0

            runStep = ->
              if step = steps[i]
                self.execute step
                i += 1

                setTimeout runStep, delay
              else
                # Replay will be done and history will have been automatically rebuilt
                replaying = false

            setTimeout runStep, delay

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

        draw: (point, options={}) ->
          {index, layer} = options
          index ?= activeIndex()
          layer ?= self.activeLayerIndex()

          Symmetry[symmetryMode()]([point], pixelExtent()).forEach ({x, y}) ->
            lastCommand.push self.Command.ChangePixel
              x: x
              y: y
              index: index
              layer: layer

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

      $selector = $(I.selector)
      $(I.selector).append template self

      canvas = TouchCanvas canvasSize()
      previewCanvas = TouchCanvas canvasSize()
      thumbnailCanvas = TouchCanvas pixelExtent()

      # TODO: Tempest should have an easier way to do this
      updateActiveColor = (newIndex) ->
        color = self.palette()[newIndex]

        $selector.find(".palette .current").css
          backgroundColor: color

      updateActiveColor(activeIndex())
      activeIndex.observe updateActiveColor

      $selector.find(".viewport")
        .append(canvas.element())
        .append($(previewCanvas.element()).addClass("preview"))

      $selector.find(".thumbnail").append thumbnailCanvas.element()

      updateViewportCentering = (->
        size = canvasSize()
        $selector.find(".viewport").toggleClass "vertical-center", size.height < $selector.find(".main").height()
      ).debounce(15)
      $(window).resize updateViewportCentering

      updateCanvasSize = (size) ->

        [canvas, previewCanvas].forEach (canvas) ->
          element = canvas.element()
          element.width = size.width
          element.height = size.height

          canvas.clear()

        $selector.find(".viewport, .overlay").css
          width: size.width
          height: size.height

        # TODO: Should be bound directly to the template's overlay backgrond image attribute
        if self.grid()
          gridImage = GridGen(
            # TODO: Grid size options and matching pixel size/extent
          ).backgroundImage()

          $selector.find(".overlay").css
            backgroundImage: gridImage
        else
          $selector.find(".overlay").css
            backgroundImage: "none"

        updateViewportCentering()

        self.repaint()

      # TODO: Use auto-dependencies
      updateCanvasSize(canvasSize())
      canvasSize.observe updateCanvasSize
      self.grid.observe ->
        updateCanvasSize canvasSize()

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

        self.trigger "release"

      $(previewCanvas.element()).on "mousemove", ({currentTarget, pageX, pageY}) ->
        {left, top} = currentTarget.getBoundingClientRect()
        {x, y} = Point(pageX - left, pageY - top).scale(1/pixelSize()).floor()

        positionDisplay("#{x},#{y}")

      # TODO: Move this into template?
      $viewport = $selector.find(".viewport")
      self.activeTool.observe ({iconUrl, iconOffset}) ->
        {x, y} = Point(iconOffset)

        $viewport.css
          cursor: "url(#{iconUrl}) #{x} #{y}, default"

      self.on "release", ->
        previewCanvas.clear()

        # TODO: Think more about triggering change events
        self.trigger "change"

      # TODO: Extract this decorator pattern
      ["undo", "execute", "redo"].forEach (method) ->
        oldMethod = self[method]

        self[method] = ->
          oldMethod.apply(self, arguments)
          self.trigger "change"

      return self
