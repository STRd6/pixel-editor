Undo
====

Command Stack
-------------

TODO: Re-extract this later

TODO: Integrate Observables?

A simple stack based implementation of executable and undoable commands.

    CommandStack = (stack=[]) ->
      index = stack.length

      execute: (command) ->
        stack[index] = command
        command.execute()

        index += 1

        # Be sure to blast obsolete redos
        stack.length = index

        return this

      undo: ->
        if @canUndo()
          index -= 1

          command = stack[index]
          command.undo()

          return command

      redo: ->
        if @canRedo()
          command = stack[index]
          command.execute()

          index += 1

          return command

      current: ->
        stack[index-1]

      canUndo: ->
        index > 0

      canRedo: ->
        stack[index]?

      stack: ->
        stack.slice(0, index)

    module.exports = CommandStack

An editor module for editors that support undo/redo

    module.exports = (I={}, self=Core(I)) ->
      # TODO: Module include should be idempotent
      self.include Bindable unless self.on

      commandStack = CommandStack()
      lastClean = undefined

      # TODO: Make this an observable rather than an event emitter
      dirty = (newDirty) ->
        if newDirty is false
          lastClean = commandStack.current()
          self.trigger('clean')

          return self
        else
          return lastClean != commandStack.current()

      updateDirtyState = ->
        if dirty()
          self.trigger('dirty')
        else
          self.trigger('clean')

      # Set dirty state on save event
      self.on 'save', ->
        dirty(false)

      self.extend
        history: (newHistory) ->
          if arguments.length > 0
            commandStack = CommandStack newHistory.map self.Command.parse
          else
            commandStack.stack()

        execute: (command) ->
          commandStack.execute command
          updateDirtyState()

          return self

        undo: ->
          commandStack.undo()
          updateDirtyState()

          return self

        redo: ->
          commandStack.redo()
          updateDirtyState()

          return self

      return self
