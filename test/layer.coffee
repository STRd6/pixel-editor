Layer = require "../layer"

describe "Layer", ->
  it "should resize", ->
    layer = Layer
      width: 32
      height: 32
      palette: ->
        ["#000000"]

    layer.resize({
      width: 128
      height: 72
    })

    called = 0
    layer.each (value, x, y) ->
      called += 1
      assert.equal value, 0, "(#{x}, #{y}) is 0"

    assert.equal called, 128 * 72, "Called: #{called}, Expected: #{128 * 72}"
