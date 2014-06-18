Size = require "../lib/size"

describe "Size", ->
  it "should iterate", ->
    size = Size(4, 5)
    total = 0
    
    size.each (x, y) ->
      total += 1

    assert.equal total, 20
