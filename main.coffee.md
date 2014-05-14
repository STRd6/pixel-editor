Pixel Editor
============

Welcome to this cool pixel editor. Eventually you'll be able to read this for
help, but right now it's mostly code.

Editing pixels in your browser.

    # For debug purposes
    global.PACKAGE = PACKAGE
    global.require = require

    # Setup
    global.Observable = require "observable"
    global.Model = require "model"
    global.Bindable = require "bindable"
    require "cornerstone"

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
