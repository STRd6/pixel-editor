
mirror = (size, flip) ->
  midpoint = Point (size.width - 1)/2, (size.height - 1)/2
  matrix = Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y))

  (point) ->
    matrix.transformPoint(point)

append = (list, transform) ->
  # TODO: Uniq?
  list.concat list.map(transform)

module.exports =
  flip: (points, size) ->
    t = mirror(size, Matrix.HORIZONTAL_FLIP)
    
    append(points, t)

  flop: (points, size) ->
    t = mirror(size, Matrix.VERTICAL_FLIP)
    
    append(points, t)
