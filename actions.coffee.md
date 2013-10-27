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

        self.addHotkey hotkey, method

      return self

TODO: Consolidate actions with hotkeys

    Actions.defaults =
      "ctrl+z":
        method: "undo"
        icon: null
      "ctrl+y":
        method: "redo"
        icon: null
      "ctrl+s":
        method: "download"
        icon: null
      "ctrl+b":
        method: "toDataURL"
        icon: null
