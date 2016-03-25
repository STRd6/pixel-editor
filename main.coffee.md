Pixel Editor
============

Welcome to this cool pixel editor. Eventually you'll be able to read this for
help, but right now it's mostly code.

Editing pixels in your browser.

    # Setup
    require "./lib/canvas-to-blob"

    Editor = require "./editor"

    launch = ->

      # For debugging
      global.editor = Editor()

      Template = require "./templates/editor"
      editorElement = Template editor
      document.body.appendChild editorElement

      updateViewportCentering = ->
        {height: mainHeight} = editorElement.querySelector(".main").getBoundingClientRect()
        editor.mainHeight mainHeight
      window.addEventListener "resize", updateViewportCentering
      updateViewportCentering()

    if PACKAGE.name is "ROOT"
      # Google Analytics
      require("analytics").init("UA-3464282-15")

      # For debug purposes
      global.PACKAGE = PACKAGE
      global.require = require

      runtime = require("runtime")(PACKAGE)
      runtime.boot()
      runtime.applyStyleSheet(require('./style'))
  
      metaTag = document.createElement('meta')
      metaTag.name = "viewport"
      metaTag.content = "width=device-width, initial-scale=1.0"
      document.getElementsByTagName('head')[0].appendChild(metaTag)

      launch()

    module.exports = Editor
