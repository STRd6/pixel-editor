Undo
====

    CommandStack = require "command-stack"

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
        history: (newHistory=[]) ->
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
