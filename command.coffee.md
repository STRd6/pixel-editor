Command
=======

Commands that can be done/undone in the editor.

    module.exports = (I={}, self) ->
      self.Command = {}

This is a weird DSL for each command to inherit a toJSON method and to register
to be de-serialized by name.

*IMPORTANT:* If the names change then old command data may fail to load in newer
versions.

      C = (name, constructor) ->
        self.Command[name] = (data={}) ->
          data = Object.extend {}, data
          data.name = name

          command = constructor(data)

          command.toJSON ?= ->
            # TODO: May want to return a copy of the data to be super-duper safe
            data

          return command

      C "ChangePixel", (data) ->
        data.previous ?= self.getPixel(data).index

        execute: ->
          self.changePixel(data)

        undo: ->
          self.changePixel Object.extend {}, data, index: data.previous

      C "Resize", (data) ->
        {width, height, state} = data

        data.previous ?= self.pixelExtent()

        state ?= self.layerState()

        execute: ->
          self.resize(data)

        undo: ->
          self.restoreLayerState state

      C "NewLayer", (data) ->
        execute: ->
          self.newLayer(data)

        undo: ->
          # TODO: May need to know layer index and previously active layer
          # index
          self.removeLayer()

      C "Composite", (data) ->
        if data.commands
          # We came from JSON so rehydrate the commands.
          data.commands = data.commands.map self.Command.parse
        else
          data.commands = []

        commands = data.commands

        execute: ->
          commands.invoke "execute"

        undo: ->
          # Undo last command first because the order matters
          commands.copy().reverse().invoke "undo"

        push: (command, noExecute) ->
          # We execute commands immediately when pushed in the compound
          # so that the effects of events during mousemove appear
          # immediately but they are all revoked together on undo/redo
          # Passing noExecute as true will skip executing if we are
          # adding commands that have already executed.
          commands.push command
          command.execute() unless noExecute

        toJSON: ->
          Object.extend {}, data,
            commands: commands.invoke "toJSON"

      self.Command.parse = (commandData) ->
        self.Command[commandData.name](commandData)
