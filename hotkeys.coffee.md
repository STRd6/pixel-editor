Hotkeys
=======

Hotkeys for the pixel editor.

    module.exports = (I={}, self) ->
      self.extend
        addHotkey: (key, method) ->
          $(document).bind "keydown", key, (event) ->
            if typeof method is "function"
              method
                editor: self
            else
              self[method]()

            event.preventDefault()

      return self
