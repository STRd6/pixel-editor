Layer
=====

    require "cornerstone"

    Observable = require "observable"

TouchCanvas, for previews.

    TouchCanvas = require "touch-canvas"

A layer is a 2d set of pixels.

    {Grid} = require "./util"

    Layer = (I={}, self=Core(I)) ->
      # TODO: width and height as an extent
      {width, height, palette, data} = I

      pixelSize = 1

      grid = Grid width, height, (x, y) ->
        if data
          data[x + y * width]
        else
          0

      previewCanvas = TouchCanvas
        width: width
        height: height

      self.extend
        grid: grid
        previewCanvas: previewCanvas.element()

        each: grid.each
        get: grid.get
        hidden: Observable(false)

        set: (x, y, index) ->
          paint(x, y, index)

          return grid.set x, y, index

        repaint: ->
          grid.each (index, x, y) ->
            paint(x, y, index)

        resize: (size) ->
          {width:newWidth, height:newHeight} = size

          if newHeight > height
            grid.expand(0, newHeight - height, 0)
          else if newHeight < height
            grid.contract(0, height - newHeight)

          I.height = height = newHeight

          if newWidth > width
            grid.expand(newWidth - width, 0, 0)
          else if newWidth < width
            grid.contract(width - newWidth, 0)

          I.width = width = newWidth

          # TODO: Move this into an observable?
          element = previewCanvas.element()
          element.width = width
          element.height = height

          self.repaint()

        toJSON: ->
          width: width
          height: height
          data: grid.toArray()

      paint = (x, y, index) ->
        color = palette()[index]

        if color is "transparent"
          previewCanvas.clear
            x: x * pixelSize
            y: y * pixelSize
            width: pixelSize
            height: pixelSize
        else
          previewCanvas.drawRect
            x: x * pixelSize
            y: y * pixelSize
            width: pixelSize
            height: pixelSize
            color: color

      if data
        self.repaint()

      return self

    module.exports = Layer

Helpers
-------

    previewCanvas = (width, height) ->
      canvas = document.createElement("canvas")
