Drop and Paste Events
=====================

    Loader = require "./loader"

    callback = ({dataURL}) ->
      console.log "event"
      Loader().load(dataURL)
      .then (data) ->
        console.log data

    $("html").dropImageReader callback
    $(document).pasteImageReader callback
