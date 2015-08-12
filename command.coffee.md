Command
=======

    {extend} = require "util"

Commands that can be done/undone in the editor.

    module.exports = (I={}, self) ->
      self.Command = {}

This is a weird DSL for each command to inherit a toJSON method and to register
to be de-serialized by name.

*IMPORTANT:* If the names change then old command data may fail to load in newer
versions.

      C = (name, constructor) ->
        self.Command[name] = (data={}) ->
          data = extend {}, data
          data.name = name

          command = constructor(data)

          command.toJSON ?= ->
            # TODO: May want to return a copy of the data to be super-duper safe
            data

          return command

      C "Resize", (data) ->
        execute: ->
          self.resize(data.size, data.imageData)

        undo: ->
          self.resize(data.sizePrevious, data.imageDataPrevious)

      C "PutImageData", (data) ->
        # TODO: Layers?
        execute: ->
          self.putImageData(data.imageData, data.x, data.y)
        undo: ->
          self.putImageData(data.imageDataPrevious, data.x, data.y)

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

        empty: ->
          commands.length is 0

        toJSON: ->
          extend {}, data,
            commands: commands.invoke "toJSON"

      self.Command.parse = (commandData) ->
        self.Command[commandData.name](commandData)
