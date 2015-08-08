Editor
======

    require "cornerstone"

    loader = require("./loader")()

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

    module.exports = (I={}, self) ->
      defaults I,
        selector: "body"

      activeIndex = Observable(1)

      pixelExtent = Observable Size(256, 256)
      pixelSize = Observable 2
      viewSize = Observable ->
        pixelExtent().scale pixelSize()

      positionDisplay = Observable("")

      symmetryMode = Observable("normal")

      canvas = null
      lastCommand = null

      replaying = false
      initialSize = pixelExtent()

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

      isTransparent = (index) ->
        (self.palette()[index] is "transparent") or
        (self.paletteZeroTransparent() and index is 0)

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

        paletteZeroTransparent: Observable(true)

        applyPalette: (text) ->
          self.execute self.Command.ChangePalette
            palette: text.split("\n")

        handlePaste: (data) ->
          command = self.Command.Composite()
          self.execute command

          # TODO: Currently paste replaces entire image
          {width, height} = data
          command.push self.Command.Resize({width, height})
          command.push self.Command.RemoveLayer()
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

        outputCanvas: ()->
          outputCanvas = TouchCanvas pixelExtent()

          self.layers.forEach (layer) ->
            outputCanvas.context().drawImage(layer.element(), 0, 0)

          outputCanvas.element()

        resize: (size) ->
          pixelExtent Size(size)

        repaint: ->
          thumbnailCanvas.clear()
          
          self.layers.forEach (layer) ->
            thumbnailCanvas.context().drawImage(layer.element(), 0, 0)

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
            
            # TODO: The initial size should come from commands
            self.resize initialSize
            makeLayer()
            
            # TODO: Should never need to call repaint!
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
          color = self.color(index)

          Symmetry[symmetryMode()]([point], pixelExtent()).forEach ({x, y}) ->
            # TODO: Be sure to draw to "preview/work" layer
            canvas.drawRect
              x: x
              y: y
              width: 1
              height: 1
              color: color

        layers: Observable []

        layer: (index) ->
          if index?
            self.layers()[index]
          else
            self.activeLayer()

        getPixel: ({x, y, layer}) ->
          x: x
          y: y
          index: self.layer(layer).get(x, y)
          layer: layer ? self.activeLayerIndex()

        getIndex: (x, y) ->
          self.layer().get(x, y)

        color: (index) ->
          if isTransparent(index)
            "transparent"
          else
            self.palette()[index]

        palette: Observable(Palette.dawnBringer16)

        putImageData: (imageData, x, y) ->
          canvas.context().putImageData(imageData, x, y)

        selection: (rectangle) ->
          each: (iterator) ->
            rectangle.each (x, y) ->
              index = self.getIndex(x, y)
              iterator(index, x, y)

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

        thumbnailClick: (e) -> 
          $(e.currentTarget).toggleClass("right")

      self.activeColor = Observable ->
        self.color(self.activeIndex())

      self.activeColorStyle = Observable ->
        "background-color: #{self.activeColor()}"

      makeLayer = (data) ->
        layer = Layer
          width: pixelExtent().width
          height: pixelExtent().height
          data: data
          palette: self.palette

        self.layers.push layer
        self.activeLayer layer

      makeLayer()

      $selector = $(I.selector)
      $(I.selector).append template self

      self.canvas = canvas = TouchCanvas pixelExtent()
      self.previewCanvas = previewCanvas = TouchCanvas pixelExtent()
      thumbnailCanvas = TouchCanvas pixelExtent()

      $selector.find(".viewport")
      .append(canvas.element())
      .append($(previewCanvas.element()).addClass("preview"))
      .css
        backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkIADOnDnzH58SxlEDGIZDGBCKZxMTE7zeZBw1gGEYhAEAJQ47KemVQJ8AAAAASUVORK5CYII=)"

      $selector.find(".thumbnail").append thumbnailCanvas.element()

      self.TRANSPARENT_FILL = require("./lib/checker")().pattern()

      updateViewportCentering = (->
        size = viewSize()
        $selector.find(".viewport").toggleClass "vertical-center", size.height < $selector.find(".main").height()
      ).debounce(15)
      $(window).resize updateViewportCentering

      updateViewSize = (size) ->
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

      # TODO: Use auto-dependencies
      updateViewSize(viewSize())
      viewSize.observe updateViewSize
      self.grid.observe ->
        updateViewSize viewSize()

      updatePixelExtent = (size) ->
        self.layers.forEach (layer) ->
          layer.resize size

        element = thumbnailCanvas.element()
        element.width = size.width
        element.height = size.height

        self.repaint()

      pixelExtent.observe updatePixelExtent

      self.paletteZeroTransparent.observe ->
        self.repaint()

      self.palette.observe ->
        self.repaint()

      canvasPosition = (position) ->
        Point(position).scale(pixelExtent()).floor()

      snapshot = null
      previewCanvas.on "touch", (position) ->
        # Snapshot canvas/current layer
        size = pixelExtent()
        snapshot = canvas.context().getImageData(0, 0, size.width, size.height)

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

        size = pixelExtent()
        diffSnapshot(snapshot, canvas.context().getImageData(0, 0, size.width, size.height))

        self.trigger "release"

      diffSnapshot = (previous, current) ->
        # TODO: Diff snapshot, only create command if changed
        # TODO: Optimize to not store unchanged chunks
        self.execute self.Command.PutImageData
          imageData: current
          imageDataPrevious: previous
          x: 0
          y: 0

      $(previewCanvas.element()).on "mousemove", ({currentTarget, pageX, pageY}) ->
        {left, top} = currentTarget.getBoundingClientRect()
        {x, y} = Point(pageX - left, pageY - top).scale(1/pixelSize()).floor()

        positionDisplay("#{x},#{y}")

      # TODO: Move this into template?
      $viewport = $selector.find(".viewport")
      setCursor = ({iconUrl, iconOffset}) ->
        {x, y} = Point(iconOffset)

        $viewport.css
          cursor: "url(#{iconUrl}) #{x} #{y}, default"
      self.activeTool.observe setCursor
      setCursor self.activeTool()

      self.on "release", ->
        previewCanvas.clear()

        # TODO: Think more about triggering change events
        self.trigger "change"

      # Decorate `execute` to soak empty last commands
      # TODO: This seems a little gross
      do ->
        oldExecute = self.execute
        self.execute = (command) ->
          if self.history().last()?.empty?()
            lastCommand = command
            self.undo()

          oldExecute command

      # TODO: Extract this decorator pattern
      ["undo", "execute", "redo"].forEach (method) ->
        oldMethod = self[method]

        self[method] = ->
          oldMethod.apply(self, arguments)
          self.trigger "change"

      self.include require "./dirty"

      self.include require("./plugins/save_to_s3")

      return self
