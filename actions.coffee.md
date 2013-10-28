Actions
=======

    module.exports = Actions = (I={}, self=Core(I)) ->
      self.extend
        addAction: (action) ->
          self.actions.push action

        actions: Observable []

      Object.keys(Actions.defaults).forEach (hotkey) ->
        {method, icon} = Actions.defaults[hotkey]

        self.addAction
          perform: ->
            self[method]()
          iconUrl: icon

        self.addHotkey hotkey, method

      return self

TODO: Consolidate actions with hotkeys

    Actions.defaults =
      "ctrl+z":
        method: "undo"
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVElEQVQ4T2NkoBAwYtH/HyiGTRyrVegKQZpBgCwDYJrJMgBZM7GhAnYliCBHM9yVML+SYwjcBTAnUxQG6IaQFQvIhlBkALGxQFqCwWUq0U4dxgYAANYwCRFfEnUSAAAAAElFTkSuQmCC"
      "ctrl+y":
        method: "redo"
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAT0lEQVQ4T2NkoBAwUqifga4G/Ae6FsNCUlwAMgAEUPSQYwCKITADYKaTEqZgvZQYANZPiQEoLiDG6cjehIcdOYFIUSxQlA6wepMULwxSAwCX5QkR5l98xQAAAABJRU5ErkJggg=="
      "ctrl+s":
        method: "download"
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAw4tH/H0kOp7pRAxgYRsMAMwyQEw+uNIYSbtgCEZ8hGOpxxQI2Q7CqpWk0gsIA5BJ8luCXJCanAwDqbA4RGpEOnAAAAABJRU5ErkJggg=="
      "ctrl+b":
        method: "toDataURL"
        icon: null
