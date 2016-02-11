Brushes
=======

A brush takes a point and returns a list of points.

    big = """
      01110
      11111
      11111
      11111
      01110
    """

    bigger = """
      0011100
      0111110
      1111111
      1111111
      1111111
      0111110
      0011100
    """

    module.exports =
      pencil: (point) ->
        [point]

      brush: ({x, y}) ->
        [
          Point x, y - 1
          Point x - 1, y
          Point x, y
          Point x + 1, y
          Point x, y + 1
        ]
