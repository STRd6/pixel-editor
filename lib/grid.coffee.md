A 2d grid of values.

      module.exports = Grid = (width, height, defaultValue) ->
        generateValue = (x, y) ->
          if typeof defaultValue is "function"
            defaultValue(x, y)
          else
            defaultValue

        grid =
          [0...height].map (y) ->
            [0...width].map (x) ->
              generateValue(x, y)

        self =
          contract: (x, y) ->
            height -= y
            width -= x

            grid.length = height

            grid.forEach (row) ->
              row.length = width

            return self

          copy: ->
            Grid(width, height, self.get)

          get: (x, y) ->
            return if x < 0 or x >= width
            return if y < 0 or y >= height

            grid[y][x]

          set: (x, y, value) ->
            return if x < 0 or x >= width
            return if y < 0 or y >= height

            grid[y][x] = value

          each: (iterator) ->
            grid.forEach (row, y) ->
              row.forEach (value, x) ->
                iterator(value, x, y)

            return self

Expand the grid using the given `defaultValue` value or function to fill any
positions that need to be filled.

          expand: (x, y, defaultValue) ->
            newRows = [0...y].map (y) ->
              [0...width].map (x) ->
                if typeof defaultValue is "function"
                  defaultValue(x, y + height)
                else
                  defaultValue

            grid = grid.concat newRows

            grid = grid.map (row, y) ->
              row.concat [0...x].map (x) ->
                if typeof defaultValue is "function"
                  defaultValue(width + x, y)
                else
                  defaultValue

            height = y + height
            width = x + width

            return self

Return a 1-dimensional array of the data within the grid.

          toArray: ->
            grid.reduce (a, b) ->
              a.concat(b)
            , []

        return self
