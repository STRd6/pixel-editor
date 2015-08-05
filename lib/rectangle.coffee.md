Rectangle
=========

    {abs, min} = Math

    module.exports = Rectangle = (position, size) ->
      if position?.size?
        {position, size} = position

      position: Point(position)
      size: Size(size)
      __proto__: Rectangle.prototype

    Rectangle.prototype =
      each: (iterator) ->
        p = @position

        @size.each (x, y) ->
          iterator(p.x + x, p.y + y)

    Rectangle.fromPoints = (start, end) ->
      Rectangle Point(min(start.x, end.x), min(start.y, end.y)), Size(abs(end.x - start.x), abs(end.y - start.y))
