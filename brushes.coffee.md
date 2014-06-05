Brushes
=======

A brush takes a point and returns a list of points.

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
