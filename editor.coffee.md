Editor
======

    LITTLE_ENDIAN = require "./endianness"

    require "cornerstone"

    loader = require("./loader")()

    TouchCanvas = require "touch-canvas"
    GridGen = require "grid-gen"

    Actions = require "./actions"
    Command = require "./command"
    Drop = require "./drop"
    Eval = require "eval"
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

      pixelExtent = Observable Size(128, 128)
      pixelSize = Observable 4
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

      drawPixel = (canvas, x, y, color, size=1) ->
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

          self.trigger "change"

        symmetryMode: symmetryMode

        outputCanvas: () ->
          outputCanvas = TouchCanvas pixelExtent()
          outputCanvas.context().drawImage(canvas.element(), 0, 0)
          outputCanvas.element()

        resize: (size, data) ->
          data ?= self.getSnapshot()

          pixelExtent(Size(size))
          {width, height} = pixelExtent()

          canvasElement = canvas.element()
          thumbnailCanvasElement = thumbnailCanvas.element()

          thumbnailCanvasElement.width = canvasElement.width = width
          thumbnailCanvasElement.height = canvasElement.height = height

          self.putImageData(data)

          self.repaint()

        repaint: ->
          {width, height} = pixelExtent()
          thumbnailCanvas.clear()
          thumbnailCanvas.context().drawImage(canvas.element(), 0, 0)

          return self

        getSnapshot: ->
          size = pixelExtent()
          canvas.context().getImageData(0, 0, size.width, size.height)

        fromDataURL: (dataURL) ->
          loader.load(dataURL)
          .then (imageData) ->
            {width, height} = size = pixelExtent()

            if (width != imageData.width) or (height != imageData.height)
              self.execute self.Command.Resize
                size:
                  width: imageData.width
                  height: imageData.height
                sizePrevious: size
                imageData: imageData
                imageDataPrevious: editor.getSnapshot()
            else
              self.execute self.Command.PutImageData
                imageData: imageData
                imageDataPrevious: self.getSnapshot()
                x: 0
                y: 0

        replay: ->
          # TODO: May want to prevent adding new commands while replaying!
          unless replaying
            replaying = true

            # Copy and clear history
            steps = self.history()
            self.history([])

            # TODO: The initial size should come from commands
            self.resize initialSize

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

          self.history state.history?.map self.Command.parse

        saveState: ->
          palette: self.palette()
          history: self.history().invoke "toJSON"

        draw: (point, options={}) ->
          {index} = options
          index ?= activeIndex()
          color = self.color(index)

          Symmetry[symmetryMode()]([point], pixelExtent()).forEach ({x, y}) ->
            drawPixel(canvas, x, y, color)
            drawPixel(thumbnailCanvas, x, y, color)

        color: (index) ->
          if isTransparent(index)
            "transparent"
          else
            self.palette()[index]

        colorAsInt: ->
          color = self.color self.activeIndex()

          console.log color

          color = color.substring(color.indexOf("#") + 1)

          if color is "transparent"
            0
          else
            if LITTLE_ENDIAN
              parseInt("ff#{color[4..5]}#{color[2..3]}#{color[0..1]}", 16)
            else
              parseInt("#{color}ff")

        palette: Observable(Palette.dawnBringer16)

        putImageData: (imageData, x=0, y=0) ->
          canvas.context().putImageData(imageData, x, y)

        selection: (rectangle) ->
          each: (iterator) ->
            rectangle.each (x, y) ->
              index = self.getIndex(x, y)
              iterator(index, x, y)

        thumbnailClick: (e) ->
          $(e.currentTarget).toggleClass("right")

      self.activeColor = Observable ->
        self.color(self.activeIndex())

      self.activeColorStyle = Observable ->
        "background-color: #{self.activeColor()}"

      $selector = $(I.selector)
      $(I.selector).append template self

      self.canvas = canvas = TouchCanvas pixelExtent()
      self.previewCanvas = previewCanvas = TouchCanvas pixelExtent()
      thumbnailCanvas = TouchCanvas pixelExtent()

      do (ctx=self.canvas.context()) ->
        ctx.imageSmoothingEnabled = false
        ctx.webkitImageSmoothingEnabled = false
        ctx.mozImageSmoothingEnabled = false

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

      self.paletteZeroTransparent.observe ->
        self.repaint()

      self.palette.observe ->
        self.repaint()

      canvasPosition = (position) ->
        Point(position).scale(pixelExtent()).floor()

      snapshot = null

      self.restore = ->
        if snapshot
          self.putImageData(snapshot)
          self.repaint()

      previewCanvas.on "touch", (position) ->
        # Snapshot canvas
        snapshot = self.getSnapshot()

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

      compareImageData = (previous, current) ->
        # TODO: store a dirty region

        previousData = new Uint32Array(previous.data.buffer)
        currentData = new Uint32Array(current.data.buffer)
        length = currentData.length
        i = 0
        different = false

        while i < length
          if previousData[i] != currentData[i]
            different = true
            break

          i += 1

        return different

      diffSnapshot = (previous, current) ->
        if compareImageData(previous, current)
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
          self.repaint()
          self.trigger "change"

      self.include require "./dirty"

      # self.include require("./plugins/save_to_s3")

      return self
