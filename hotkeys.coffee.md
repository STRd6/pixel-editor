Hotkeys
=======

Hotkeys for the pixel editor.

TODO: Add methods that can be functions rather than names of editor methods.

    module.exports = (I={}, self)->
      self.extend
        addHotkey: (key, method) ->
          $(document).bind "keydown", key, ->
            self[method]()

      return self
