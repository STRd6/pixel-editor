File Reading
============

Read files from a file input triggering an event when a person chooses a file.

Currently we only care about json, image, and text files, though we may care
about others later.

    detectType = (file) ->
      if file.type.match /^image\//
        return "image"

      if file.name.match /\.json$/
        return "json"

      return "text"

    module.exports =
      readerInput: ({chose, encoding, image, json, text, accept}) ->
        accept ?= "image/gif,image/png"
        encoding ?= "UTF-8"

        input = document.createElement('input')
        input.type = "file"
        input.setAttribute "accept", accept

        input.onchange = ->
          reader = new FileReader()

          file = input.files[0]

          switch detectType(file)
            when "image"
              reader.onload = (evt) ->
                image? evt.target.result

              reader.readAsDataURL(file)
            when "json"
              reader.onload = (evt) ->
                json? JSON.parse evt.target.result

              reader.readAsText(file, encoding)
            when "text"
              reader.onload = (evt) ->
                text? evt.target.result

              reader.readAsText(file, encoding)

          chose(file)

        return input
