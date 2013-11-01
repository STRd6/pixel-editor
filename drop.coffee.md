Drop and Paste Events
=====================

    Loader = require "./loader"

    loader = Loader()

    Drop = (I={}, self=Core(I)) ->
      callback = ({dataURL}) ->
        loader.load(dataURL)
        .then (imageData) ->
          # TODO This coupling seems a little too tight
          self.handlePaste loader.fromImageDataWithPalette(imageData, self.palette())

      # TODO: Scope these events to the editor, not the entire page
      $("html").dropImageReader callback
      $(document).pasteImageReader callback

    module.exports = Drop

Helpers
-------

    logError = (message) ->
      console.error message
