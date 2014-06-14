Grid = require "../lib/grid"

describe "Grid", ->
  it "should resize", ->
    grid = Grid(32, 32, 0)

    grid.expand(128 - 32, 72 - 32, 0)
    
    called = 0
    grid.each (value, x, y) ->
      called += 1
      assert.equal value, 0, "(#{x}, #{y}) is 0"

    assert.equal called, 128 * 72, "Called: #{called}, Expected: #{128 * 72}"
