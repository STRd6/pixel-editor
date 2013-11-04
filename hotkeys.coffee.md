Hotkeys
=======

Hotkeys for the pixel editor.

    module.exports = (I={}, self) ->
      self.extend
        addHotkey: (key, method) ->
          $(document).bind "keydown", key, ->
            if typeof method is "function"
              method()
            else
              self[method]
                editor: self

      return self
