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

    drawOutline = (canvas, scale, rectangle) ->
      canvas.drawRect
        x: rectangle.position.x * scale
        y: rectangle.position.y * scale
        width: rectangle.size.width * scale
        height: rectangle.size.height * scale
        color: "transparent"
        stroke:
          width: 2
          color: "green"

Select a region, then move it.

    module.exports = ->
      selecting = true
      moving = false
      selection = delta = selectionStart = startPosition = selectionEnd = undefined

      touch: ({position, editor}) ->
        if selecting
          selectionStart = position
          selectionEnd = position.add(Point(1, 1))
        else
          # if clicked in selection
          moving = true
          startPosition = position
          delta = Point(0, 0)
          # else
          #   clear selection

      move: ({position, editor}) ->
        scale = editor.pixelSize()

        canvas = editor.previewCanvas
        canvas.clear()

        if selecting
          selectionEnd = endDeltoid(selectionStart, position)

          selection = Rectangle.fromPoints(selectionStart, selectionEnd)

          drawOutline(canvas, scale, selection)

        else
          # Update selection position
          delta = position.subtract(startPosition)

          # Draw background area
          color = editor.activeColor()
          
          # TODO: Is it possible to avoid this transparent hack?
          if color is "transparent"
            editor.previewCanvas.drawRect
              x: (selection.position.x) * scale
              y: (selection.position.y) * scale
              width: selection.size.width * scale
              height: selection.size.height * scale
              color: editor.TRANSPARENT_FILL
          else
            editor.previewCanvas.drawRect
              x: (selection.position.x) * scale
              y: (selection.position.y) * scale
              width: selection.size.width * scale
              height: selection.size.height * scale
              color: color

          # Draw Floating pixels
          editor.selection(selection).each (index, x, y) ->
            editor.previewCanvas.drawRect
              x: (x + delta.x) * scale
              y: (y + delta.y) * scale
              width: scale
              height: scale
              color: editor.color(index)

          # Draw selection area
          editor.previewCanvas.drawRect
            x: (selection.position.x + delta.x) * scale
            y: (selection.position.y + delta.y) * scale
            width: selection.size.width * scale
            height: selection.size.height * scale
            color: "transparent"
            stroke:
              width: 2
              color: "green"

      release: ({editor}) ->
        if selecting
          selecting = !selecting
          # HACK: Painting the ui on the preview canvas after it get's auto
          # cleared from the release event
          setTimeout ->
            canvas = editor.previewCanvas
            scale = editor.pixelSize()
            drawOutline(canvas, scale, selection)
        else if moving
          {Command} = editor

          command = Command.Composite()

          # Paint the source region
          selection.each (x, y) ->
            data = editor.getPixel({x, y})
            data.index = editor.activeIndex()

            command.push Command.ChangePixel(data), true

          # Paint the target region
          editor.selection(selection).each (index, x, y) ->
            
            # TODO: This depends on current transparancy mode of editor
            # not sure if there is a way to make it independent easily
            unless editor.color(index) is "transparent"
              data =
                x: x + delta.x
                y: y + delta.y
                index: index
                layer: editor.activeLayerIndex()

              command.push Command.ChangePixel(data), true

          editor.execute command

          moving = false
          selecting = true
