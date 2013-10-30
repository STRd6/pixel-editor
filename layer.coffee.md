Layer
=====

A layer is a 2d set of pixels.

    {Grid} = require "./util"

    Layer = ({width, height, data}) ->
      Grid width, height, (x, y) ->
        if data
          data[y][x]
        else
          0

    module.exports = Layer
