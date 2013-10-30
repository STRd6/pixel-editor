Drop and Paste Events
=====================

    Loader = require "./loader"

    Drop = (I={}, self=Core(I)) ->
      callback = ({dataURL}) ->
        Loader().load(dataURL)
        .then self.handlePaste # TODO This coupling seems a little too tight

      # TODO: Scope these events to the editor, not the entire page
      $("html").dropImageReader callback
      $(document).pasteImageReader callback

    module.exports = Drop
