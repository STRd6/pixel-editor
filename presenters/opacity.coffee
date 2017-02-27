module.exports = (editor) ->
  focus: ->
    editor.detailTool("opacity")

  value: editor.alpha

  detailClass: ->
    "panelOpen" if "opacity" is editor.detailTool()

  min: 0
  max: 100
  step: 1
