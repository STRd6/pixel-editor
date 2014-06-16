Selection Tool
==============

    Rectangle = require "../lib/rectangle"

    endDeltoid = (start, end) ->
      if end.x < start.x
        x = 0
      else
        x = 1
      
      if end.y < start.y
        y = 0
      else
        y = 1
      
      end.add(Point(x, y))

Select a region, then move it.

    module.exports = ->
      selecting = true
      selection = selectionStart = selectionEnd = undefined

      touch: ({position, editor}) ->
        if selecting
          selectionStart = position
          selectionEnd = position.add(Point(1, 1))
        else
          # if clicked in selection
          # else 
          #   clear selection

      move: ({position, editor}) ->
        selectionEnd = endDeltoid(selectionStart, position)

        selection = Rectangle.fromPoints(selectionStart, selectionEnd)

        editor.previewCanvas.clear()
        scale = editor.pixelSize()

        debugger

        editor.previewCanvas.drawRect
          x: selection.position.x * scale
          y: selection.position.y * scale
          width: selection.size.width * scale
          height: selection.size.height * scale
          color: "transparent"
          stroke:
            width: 2
            color: "green"

      release: ->
        if selecting
        else
