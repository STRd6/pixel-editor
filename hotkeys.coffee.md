Hotkeys
=======

Hotkeys for the pixel editor.

    module.exports = (I={}, self)->
      self.extend
        addHotkey: (key, method) ->
          $(document).bind "keydown", key, ->
            self[method]()

      hotkeys =
        "ctrl+z": "undo"
        "ctrl+y": "redo"
        "ctrl+s": "download"

      Object.keys(hotkeys).forEach (key) ->
        self.addHotkey(key, hotkeys[key])

      return self
