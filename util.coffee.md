Util
====

Helpers
-------

    isObject = (object) ->
      Object::toString.call(object) is "[object Object]"

Size
----

A 2d extent.

    Size = (width, height) ->
      width: width
      height: height
      __proto__: Size.prototype

    Size.prototype =
      scale: (scalar) ->
        Size(@width * scalar, @height * scalar)

      toString: ->
        "Size(#{@width}, #{@height})"

      each: (iterator) ->
        [0...@height].forEach (y) ->
          [0...@width].forEach (x) ->
            iterator(x, y)

Point Extensions
----------------

    Point.prototype.scale = (scalar) ->
      if isObject(scalar)
        Point(@x * scalar.width, @y * scalar.height)
      else
        Point(@x * scalar, @y * scalar)

Extra utilities that may be broken out into separate libraries.

    module.exports =

      Size: Size

A 2d grid of values.

      Grid: (width, height, defaultValue) ->
        grid =
          [0...height].map ->
            [0...width].map ->
              defaultValue

        self =
          get: (x, y) ->
            grid[y]?[x]

          set: (x, y, value) ->
            return if x < 0 or x >= width
            return if y < 0 or y >= height

            grid[y][x] = value

          each: (iterator) ->
            grid.forEach (row, y) ->
              row.forEach (value, x) ->
                iterator(value, x, y)

            return self

        return self

Call an iterator for each integer point on a line between two integer points.

      line: (p0, p1, iterator) ->
        {x:x0, y:y0} = p0
        {x:x1, y:y1} = p1

        dx = (x1 - x0).abs()
        dy = (y1 - y0).abs()
        sx = (x1 - x0).sign()
        sy = (y1 - y0).sign()
        err = dx - dy

        while !(x0 is x1 and y0 is y1)
          e2 = 2 * err

          if e2 > -dy
            err -= dy
            x0 += sx

          if e2 < dx
            err += dx
            y0 += sy

          iterator
            x: x0
            y: y0

gross code courtesy of http://en.wikipedia.org/wiki/Midpoint_circle_algorithm

      circle: (center, endPoint, iterator) ->
        {x:x0, y:y0} = center
        {x:x1, y:y1} = endPoint

        radius = endPoint.subtract(center).magnitude().floor()

        f = 1 - radius
        ddFx = 1
        ddFy = -2 * radius

        x = 0
        y = radius

        iterator Point(x0, y0 + radius)
        iterator Point(x0, y0 - radius)
        iterator Point(x0 + radius, y0)
        iterator Point(x0 - radius, y0)

        while x < y
          if f > 0
            y--
            ddFy += 2
            f += ddFy

          x++
          ddFx += 2
          f += ddFx

          iterator Point(x0 + x, y0 + y)
          iterator Point(x0 - x, y0 + y)
          iterator Point(x0 + x, y0 - y)
          iterator Point(x0 - x, y0 - y)
          iterator Point(x0 + y, y0 + x)
          iterator Point(x0 - y, y0 + x)
          iterator Point(x0 + y, y0 - x)
          iterator Point(x0 - y, y0 - x)

A download utility using the webkit file system.

      download: (extension="png", type="image/png") ->
        return unless webkitRequestFileSystem?

        name = prompt("File name", "#{name}.#{extension}")

        webkitRequestFileSystem TEMPORARY, 5 * 1024 * 1024, (fs) ->
          fs.root.getFile name, {create: true}, (fileEntry) ->
            fileEntry.createWriter (fileWriter) ->
              arr = new Uint8Array(3)
  
              arr[0] = 97
              arr[1] = 98
              arr[2] = 99
  
              blob = new Blob [arr],
                type: type
  
              fileWriter.addEventListener "writeend", ->
                # Download by navigating to url
                location.href = fileEntry.toURL()
              , false

              fileWriter.write(blob)
