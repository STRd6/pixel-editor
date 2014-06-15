Palette = require "../palette"

describe "palette", ->
  it "should parse strings into colors", ->
    colors = Palette.fromStrings """
      0 0 0
      255 0 251
      255 255 255
    """

    assert.equal colors[0], "#000000"
    assert.equal colors[1], "#FF00FB"
    assert.equal colors[2], "#FFFFFF"

    assert.equal colors.length, 3

  it "should load JASC files", ->
    colors = Palette.load """
      JASC-PAL
      0100
      256
      0 0 0
      255 0 251
      255 255 255
    """

    assert.equal colors[0], "#000000"
    assert.equal colors[1], "#FF00FB"
    assert.equal colors[2], "#FFFFFF"

    assert.equal colors.length, 3
