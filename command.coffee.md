Command
=======

Commands that can be undone in the editor.

    module.exports =
      ChangePixel: (data, editor) ->
        previous = editor.getPixel(data)

        execute: ->
          editor.changePixel(data)

        undo: ->
          editor.changePixel(previous)

      Composite: ->
        commands = []

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
