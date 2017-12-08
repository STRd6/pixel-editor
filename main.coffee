# Setup
require "./lib/canvas-to-blob"

Editor = require "./editor"

SystemClient = require "sys"

launch = ->
  # For debugging
  global.editor = Editor()

  Template = require "./templates/editor"
  editorElement = Template editor
  document.body.appendChild editorElement

  {postmaster} = client = SystemClient()

  # We have a parent window, maybe it's our good friend ZineOS :)
  if postmaster.remoteTarget()
    require("./zineos-adapter")(editor, client)

  updateViewportCentering = ->
    {height: mainHeight, width: mainWidth} = editorElement.querySelector(".main").getBoundingClientRect()
    editor.mainHeight mainHeight
    editor.mainWidth mainWidth
  window.addEventListener "resize", updateViewportCentering
  updateViewportCentering()

if PACKAGE.name is "ROOT"
  # Google Analytics
  require("analytics").init("UA-3464282-15")

  # For debug purposes
  global.PACKAGE = PACKAGE
  global.require = require

  metaTag = document.createElement('meta')
  metaTag.name = "viewport"
  metaTag.content = "width=device-width, initial-scale=1.0"
  document.getElementsByTagName('head')[0].appendChild(metaTag)

  launch()
  
  # Need to add our styles last to take priority over base sys-UI styles
  style = document.createElement "style"
  style.innerHTML = require "./style"
  document.head.appendChild style

module.exports = Editor
