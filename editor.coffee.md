Pixel Editor
============

Editing pixels in your browser.

    require "hotkeys"

    Palette = require("./palette")
    runtime = require("runtime")(PACKAGE)

    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    template = require "./templates/editor"
    
    $('body').append template
      colors: Palette.defaults
