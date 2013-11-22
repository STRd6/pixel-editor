Setup
=====

For debug purposes we expose the whole package and the require function.

    global.PACKAGE = PACKAGE
    global.require = require

Requiring `appcache` prompts the person to reload the page when a newer version
of the application is available.

    require "appcache"

The runtime applies our stylesheet.

    runtime = require("runtime")(PACKAGE)
    runtime.boot()
    runtime.applyStyleSheet(require('./style'))

Additional libraries in use that have global effects.

    require "jquery-utils"

    require "./lib/canvas-to-blob"
