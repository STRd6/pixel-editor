Pixel Editor
============

Editing pixels in your browser.

    require "hotkeys"

    runtime = require("runtime")(PACKAGE)

    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

    template = require "./templates/editor"
    
    $('body').append template
      colors: [
        "F00"
        "0F0"
        "00F"
        "FFF"
        "000"
      ]
