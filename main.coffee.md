Pixel Editor
============

Welcome to this cool pixel editor. Eventually you'll be able to read this for
help, but right now it's mostly code.

Editing pixels in your browser.

    # For debug purposes
    global.PACKAGE = PACKAGE
    global.require = require

    # Google Analytics
    require("analytics").init("UA-3464282-15")

    # Setup
    require "./lib/canvas-to-blob"

    runtime = require("runtime")(PACKAGE)
    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    Editor = require "./editor"

    # For debugging
    global.editor = Editor()

    editor.notify("Welcome to PixiPaint!")

    Template = require "./templates/editor"

    document.body.appendChild Template editor

    do ->
      $selector = $('body')

      updateViewportCentering = (->
        size = editor.viewSize()
        $selector.find(".viewport").toggleClass "vertical-center", size.height < $selector.find(".main").height()
      ).debounce(15)
      $(window).resize updateViewportCentering

      updateViewSize = (size) ->
        $selector.find(".viewport").css
          width: size.width
          height: size.height

        updateViewportCentering()

      # TODO: Use auto-dependencies
      updateViewSize(editor.viewSize())
      editor.viewSize.observe updateViewSize
      editor.grid.observe ->
        updateViewSize editor.viewSize()

      # TODO: Move this into template?
      $viewport = $selector.find(".viewport")

      setCursor = ({iconUrl, iconOffset}) ->
        {x, y} = Point(iconOffset)

        $viewport.css
          cursor: "url(#{iconUrl}) #{x} #{y}, default"
      editor.activeTool.observe setCursor
      setCursor editor.activeTool()
