
    module.exports =

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
