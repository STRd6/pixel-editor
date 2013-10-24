Util
====

Extra utilities that may be broken out into separate libraries.

    module.exports =

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
