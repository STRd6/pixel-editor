Editor = require "../editor"
#
#describe "editor", ->
  #it "should have eval", ->
    #editor = Editor
      #selector: "#not_present"
#
    #assert.equal editor.eval("5"), 5


describe "plugins", ->
  it "should be able to load via JSON package", ->
    result = require
      distribution:
        main:
          content: "module.exports = 'the test'"

    assert.equal result, "the test"

describe "Editor", ->
  editor = Editor()

  it "should exist", ->
    assert editor

  it "should be able to be drawn upon", ->
    p1 = x: 0, y: 0, identifier: 0
    p2 = x: 5, y: 5, identifier: 0

    editor.previewCanvas.trigger "touch", p1

    editor.previewCanvas.trigger "move", p2
