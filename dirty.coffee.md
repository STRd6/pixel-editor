Dirty
=====

Handle dirty tracking and onbeforeunload event for editors.

    module.exports = (I, self) ->
      # TODO: May want to not stash this on I, possibly have a volatileAccessor?
      self.attrAccessor "savedCommand"

      self.extend
        dirty: ->
          self.savedCommand() != self.lastCommand()
        lastCommand: ->
          self.history().last()
        markClean: ->
          self.savedCommand self.lastCommand()

      self.markClean()

      # HACK: This assumes we're the only app in the page
      window.onbeforeunload = ->
        return "Your changes haven't yet been saved. If you leave now you will lose your work." if self.dirty()

      return self
