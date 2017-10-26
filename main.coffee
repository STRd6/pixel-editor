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

  {postmaster, system, application} = SystemClient()

  if postmaster.remoteTarget()
    postmaster.delegate = editor
    # Install FileIO module in system host
    application.loadModule "FileIO"
    system.ready()

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

  style = document.createElement "style"
  style.innerHTML = require "./style"
  document.head.appendChild style

  metaTag = document.createElement('meta')
  metaTag.name = "viewport"
  metaTag.content = "width=device-width, initial-scale=1.0"
  document.getElementsByTagName('head')[0].appendChild(metaTag)

  launch()

module.exports = Editor
