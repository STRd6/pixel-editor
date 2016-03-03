Drop and Paste Events
=====================

    Loader = require "./loader"

    loader = Loader()

    Drop = (I={}, self=Core(I)) ->
      stopFn = (event) ->
        event.stopPropagation()
        event.preventDefault()
        return false

      html = document.documentElement
      html.addEventListener "dragenter", stopFn
      html.addEventListener "dragover", stopFn
      html.addEventListener "dragleave", stopFn
      html.addEventListener "drop", (event) ->
        stopFn(event)
        Array::forEach.call event.dataTransfer.files, (file) ->
          url = URL.createObjectURL(file)
          self.fromDataURL(url)

      document.addEventListener "paste", (event) ->
        Array::some.call event.clipboardData.items, (item) ->
          if item.type.match /^image\//
            file = item.getAsFile()
            url = URL.createObjectURL(file)
            self.fromDataURL(url)
            return true
          else
            return false

    module.exports = Drop

Helpers
-------

    logError = (message) ->
      console.error message
