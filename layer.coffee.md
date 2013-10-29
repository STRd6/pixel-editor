Layer
=====

A layer is a 2d set of pixels.

    {Grid} = require "./util"

    Layer = ({width, height}) ->
      Grid(width, height, 0)

    module.exports = Layer
