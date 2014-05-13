

Editor = require "../editor"

describe "editor", ->
  it "should have eval", ->
    editor = Editor
      selector: "#not_present"

    assert.equal editor.eval("5"), 5
