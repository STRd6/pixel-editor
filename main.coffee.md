Pixel Editor
============

Welcome to this cool pixel editor. Eventually you'll be able to read this for
help, but right now it's mostly code.

Editing pixels in your browser.

    # For debug purposes
    global.PACKAGE = PACKAGE
    global.require = require

    require "appcache"
    require "jquery-utils"

    require "./lib/canvas-to-blob"

    runtime = require("runtime")(PACKAGE)
    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    Editor = require "./editor"

    # For debugging
    global.editor = Editor()

    editor.notify("Welcome to PixiPaint!")
