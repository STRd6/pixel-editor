Util
====

Deferred
--------

Use jQuery deferred

    global.Deferred = jQuery.Deferred

Helpers
-------

    isObject = (object) ->
      Object::toString.call(object) is "[object Object]"

Point Extensions
----------------

    Point.prototype.scale = (scalar) ->
      if isObject(scalar)
        Point(@x * scalar.width, @y * scalar.height)
      else
        Point(@x * scalar, @y * scalar)

Extra utilities that may be broken out into separate libraries.

    module.exports =
      Grid: require "grid"

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

      rect: (start, end, iterator) ->
        [start.y..end.y].forEach (y) ->
          [start.x..end.x].forEach (x) ->
            iterator
              x: x
              y: y

      rectOutline: (start, end, iterator) ->
        [start.y..end.y].forEach (y) ->
          if y is start.y or y is end.y
            [start.x..end.x].forEach (x) ->
              iterator
                x: x
                y: y
          else
            iterator
              x: start.x
              y: y

            iterator
              x: end.x
              y: y

gross code courtesy of http://en.wikipedia.org/wiki/Midpoint_circle_algorithm

      circle: (start, endPoint, iterator) ->
        center = Point.interpolate(start, endPoint, 0.5).floor()
        {x:x0, y:y0} = center
        {x:x1, y:y1} = endPoint

        extent = endPoint.subtract(start).scale(0.5).abs().floor()

        radius = Math.min(
          extent.x
          extent.y
        )

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
