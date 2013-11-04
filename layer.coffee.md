Layer
=====

TouchCanvas, for previews.

    TouchCanvas = require "touch-canvas"

A layer is a 2d set of pixels.

    {Grid} = require "./util"

    Layer = (I={}, self=Core(I)) ->
      {width, height, data} = I

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

      self.set = (x, y, value, color) ->
        previewCanvas.drawRect
          x: x * pixelSize
          y: y * pixelSize
          width: pixelSize
          height: pixelSize
          color: color

        return grid.set x, y, value

      return self

    module.exports = Layer

Helpers
-------

    previewCanvas = (width, height) ->
      canvas = document.createElement("canvas")
      