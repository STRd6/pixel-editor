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

    {rgb2Hex} = require "./util"

    Symmetry = require "./symmetry"

    module.exports = (I={}, self) ->
      defaults I,
        selector: "body"

      activeIndex = Observable 1

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

      self.extend
        alpha: Observable 100
        activeIndex: activeIndex

        pixelSize: pixelSize
        pixelExtent: pixelExtent
        positionDisplay: positionDisplay

        grid: Observable false

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

        insertImageData: (imageData) ->
          size = pixelExtent()

          self.execute self.Command.Resize
            size:
              width: imageData.width
              height: imageData.height
            sizePrevious: size
            imageData: imageData
            imageDataPrevious: editor.getSnapshot()

        fromDataURL: (dataURL) ->
          loader.load(dataURL)
          .then self.insertImageData

        vintageReplay: (data) ->
          unless replaying
            replaying = true

            steps = data

            delay = (5000 / steps.length).clamp(1, 250)
            i = 0

            runStep = ->
              if step = steps[i]
                console.log step
                i += 1

                setTimeout runStep, delay
              else
                # Replay will be done and history will have been automatically rebuilt
                replaying = false

            setTimeout runStep, delay

        replay: (data) ->
          # TODO: Check for vintage data
          # TODO: Generate steps from data
          # TODO: May want to prevent adding new commands while replaying!
          unless replaying
            replaying = true

            # Copy and clear history
            steps = self.history()
            self.history([])

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
          self.palette state.palette.map Observable

          commands = state.history.map self.Command.parse
          commands.forEach (command) -> command.execute()
          self.history commands

          self.repaint()

        saveState: ->
          palette: self.palette().map (o) -> o()
          history: self.history().invoke "toJSON"

        withCanvasMods: (cb) ->
          canvas.context().globalAlpha = self.alpha() / 100

          try
            Symmetry[symmetryMode()](pixelExtent(), [Matrix.IDENTITY]).forEach (transform) ->
              canvas.withTransform transform, (canvas) ->
                cb(canvas)
          finally
            canvas.context().globalAlpha = 1

        draw: (point, options={}) ->
          {index, color, size} = options
          index ?= activeIndex()
          color ?= self.color(index)
          size ?= 1

          {x, y} = point

          self.withCanvasMods (canvas) ->
            if color is "transparent"
              canvas.clear
                x: x * size
                y: y * size
                width: size
                height: size
              thumbnailCanvas.clear
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
              thumbnailCanvas.drawRect
                x: x * size
                y: y * size
                width: size
                height: size
                color: color

        color: (index) ->
          self.palette()[index]()

        setColor: (color) ->
          colors =  self.palette().map (o) -> o().toLowerCase()
          index = colors.indexOf(color.toLowerCase())

          if index != -1
            activeIndex(index)
          else
            self.palette.push Observable(color)
            self.activeIndex self.palette().length - 1

        getColor: (position) ->
          {x, y} = position
          data = canvas.context().getImageData(x, y, 1, 1).data

          rgb2Hex data[0], data[1], data[2]

        colorAsInt: ->
          color = self.color self.activeIndex()

          color = color.substring(color.indexOf("#") + 1)

          if color is "transparent"
            0
          else
            if LITTLE_ENDIAN
              parseInt("ff#{color[4..5]}#{color[2..3]}#{color[0..1]}", 16)
            else
              parseInt("#{color}ff")

        palette: Observable(Palette.dawnBringer32.map Observable)

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
        return unless previous and current
        xMin = Infinity
        xMax = -Infinity
        yMin = Infinity
        yMax = -Infinity

        previousData = new Uint32Array(previous.data.buffer)
        currentData = new Uint32Array(current.data.buffer)
        length = currentData.length
        width = current.width

        i = 0

        while i < length
          x = i % width
          y = (i / width)|0
          if previousData[i] != currentData[i]
            xMin = x if x < xMin
            xMax = x if x > xMax
            yMin = y if y < yMin
            yMax = y if y > yMax

          i += 1

        if xMin != Infinity
          return [xMin, yMin, xMax - xMin + 1, yMax - yMin + 1]
        else
          return null

      diffSnapshot = (previous, current) ->
        region = compareImageData(previous, current)

        if region
          [x, y, width, height] = region

          spareCanvas = document.createElement("canvas")
          spareCanvas.width = width
          spareCanvas.height = height
          spareContext = spareCanvas.getContext("2d")

          spareContext.putImageData(previous, -x, -y)
          previous = spareContext.getImageData(0, 0, width, height)

          spareContext.putImageData(current, -x, -y)
          current = spareContext.getImageData(0, 0, width, height)

          self.execute self.Command.PutImageData
            imageData: current
            imageDataPrevious: previous
            x: x
            y: y

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

      # Initial resize command so we start off with the right size for replays
      self.execute self.Command.Resize
        size: initialSize
        previousSize: initialSize
        imageData: self.getSnapshot()

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
