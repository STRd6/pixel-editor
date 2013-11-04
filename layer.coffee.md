Layer
=====

TouchCanvas, for previews.

    TouchCanvas = require "touch-canvas"

A layer is a 2d set of pixels.

    {Grid} = require "./util"

    Layer = (I={}, self=Core(I)) ->
      {width, height, palette, data} = I

      pixelSize = 1

      grid = Grid width, height, (x, y) ->
        if data
          data[y][x]
        else
          0

      previewCanvas = TouchCanvas
        width: width
        height: height

      self.previewCanvas = previewCanvas.element()

      self.each = grid.each
      self.get = grid.get

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

      self.set = (x, y, index) ->
        paint(x, y, index)

        return grid.set x, y, index

      self.repaint = ->
        grid.each (index, x, y) ->
          paint(x, y, index)

      if data
        self.repaint()

      return self

    module.exports = Layer

Helpers
-------

    previewCanvas = (width, height) ->
      canvas = document.createElement("canvas")
