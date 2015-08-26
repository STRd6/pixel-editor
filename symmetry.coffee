
mirror = (size, flip) ->
  midpoint = Point size.width/2, size.height/2

  console.log midpoint

  Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y))

module.exports = Symmetry =
  normal: (size, transforms) ->
    transforms

  flip: (size, transforms) ->
    transforms.concat transforms.map (transform) ->
      transform.concat(mirror(size, Matrix.HORIZONTAL_FLIP))

  flop: (size, transforms) ->
    transforms.concat transforms.map (transform) ->
      transform.concat(mirror(size, Matrix.VERTICAL_FLIP))

  quad: (size, transforms) ->
    Symmetry.flop(size, Symmetry.flip(size, transforms))

  icon:
    normal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWKB2CjDpo7keEc3ZNQApGgkNyYoDkQAREwcEdrwnzgAAAAASUVORK5CYIIA"
    flip: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPUlEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3VigZKkQFS847Ng1AAGhoEPAwCRtTgRC7T+1AAAAABJRU5ErkJgggAA"
    flop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWIBFhOkxgBI32gsUCsMKI4FYnMeNnUAmxI4EQ3tXkkAAAAASUVORK5CYIIA"
    quad: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3ViARYThGIAW5SPxgI0FihOyhTHAiU5GgBvBXARCEfBgAAAAABJRU5ErkJgggAA"
