Drop and Paste Events
=====================

    require "jquery-utils"

    Loader = require "./loader"

    loader = Loader()

    Drop = (I={}, self=Core(I)) ->
      callback = ({dataURL}) ->
        loader.load(dataURL)
        .then self.insertImageData

      $("html").dropImageReader callback
      $(document).pasteImageReader callback

    module.exports = Drop

Helpers
-------

    logError = (message) ->
      console.error message
