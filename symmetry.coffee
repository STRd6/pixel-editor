
mirror = (size, flip) ->
  midpoint = Point (size.width - 1)/2, (size.height - 1)/2
  matrix = Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y))

  (point) ->
    matrix.transformPoint(point)

append = (list, transform) ->
  # TODO: Uniq?
  list.concat list.map(transform)

module.exports =
  normal: (points) ->
    points

  flip: (points, size) ->
    t = mirror(size, Matrix.HORIZONTAL_FLIP)

    append(points, t)

  flop: (points, size) ->
    t = mirror(size, Matrix.VERTICAL_FLIP)

    append(points, t)

  quad: (points, size) ->
    t1 = mirror(size, Matrix.HORIZONTAL_FLIP)
    t2 = mirror(size, Matrix.VERTICAL_FLIP)

    append(append(points, t1), t2)

  icon:
    normal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWKB2CjDpo7keEc3ZNQApGgkNyYoDkQAREwcEdrwnzgAAAAASUVORK5CYIIA"
    flip: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPUlEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3VigZKkQFS847Ng1AAGhoEPAwCRtTgRC7T+1AAAAABJRU5ErkJgggAA"
    flop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWIBFhOkxgBI32gsUCsMKI4FYnMeNnUAmxI4EQ3tXkkAAAAASUVORK5CYIIA"
    quad: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3ViARYThGIAW5SPxgI0FihOyhTHAiU5GgBvBXARCEfBgAAAAABJRU5ErkJgggAA"
