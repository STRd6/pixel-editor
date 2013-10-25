Tools
=====

    {line, circle} = require "./util"

Default tools.

    TOOLS =

Draw a line when moving while touching.

      line:
        touch: ({position, editor})->
          editor.draw position
        move: ({editor, position, previousPosition})->
          line previousPosition, position, editor.draw
        release: ->

A circle drawing tool.

      circle: do ->
        start = null

        touch: ({editor, position}) ->
          start = position

          editor.preview ->
            circle start, position, editor.draw

        move: ({editor, position}) ->
          editor.preview ->
            circle start, position, editor.draw

        release: ({editor, position}) ->
          circle start, position, editor.draw
      
Draw a straight line on release.

      line2: do ->
        start = null

        touch: ({position, editor})->
          start = position

        move: ({editor, position, previousPosition})->
          editor.preview ->
            editor.draw start
            line start, position, editor.draw

        release: ({position, editor}) ->
          editor.draw start
          line start, position, editor.draw

    module.exports = (I={}, self=Core(I)) ->
      self.extend
        addTool: (tool) ->
          self.tools.push tool

        activeTool: Observable()

        tools: Observable []

      Object.keys(TOOLS).forEach (name) ->
        self.addTool TOOLS[name]

      self.activeTool(self.tools()[0])

      return self
