Brushes
=======

A brush takes a point and returns a list of points.

    tiny = """
      1
    """
    
    small = """
      010
      111
      010
    """

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
    
    sizes = [tiny, small, big, bigger].map (data) ->
      rows = data.split('\n')

      offset = Math.floor rows[0].length / 2

      points = rows.reduce (array, row, y) ->
        y -= offset
        row.split('').forEach (c, x) ->
          x -= offset
          if c is '1'
            array.push Point(x, y)

        return array
      , []

      (point) ->
        points.map (brushPoint) ->
          brushPoint.add(point)

    # TODO: use these arrays as sizes

    module.exports =
      pencil: sizes[0]

      brush: sizes[1]

      sizes: sizes
