Observable = require "observable"

module.exports = (editor, tool) ->
  self =
    activate: ->
      editor.activeTool(tool)
    activeClass: ->
      "active" if tool is editor.activeTool()
    detail: ->
      editor.detailTool(tool)
    detailClass: ->
      "panelOpen" if tool is editor.detailTool()

    style: ->
      "background-image: url(#{tool.iconUrl})"

    title: ->
      tool.hotkeys

    settings: tool.settings
