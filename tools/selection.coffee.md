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
        x: (rectangle.position.x - 0.5) * scale
        y: (rectangle.position.y - 0.5) * scale
        width: rectangle.size.width * scale
        height: rectangle.size.height * scale
        color: "transparent"
        stroke:
          width: 1
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

      iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABlUlEQVQ4T6WTz0sCQRTHnyvpNYsuGSQbpQgiiAiC/0L/RIcuHbwkQocOQRAFXTpEB4M8dOgQ1L8hiAjiam5gpn+B6MWZ13uzzrblEoSPnZmdH+/znTdvJgBLWmBJf1CAq9cRapBABBQAgkakkCAkgqCOpLHZTMDlgflD1AVsRkKA5EzrAamSkiBUcSvnEHs0hevDnUXAxcsQo6sh5cyLvwtBaBcKQKX3OYGbo71FwPnzELciK76q2llSGG8EuC3GFwFnTwOMrtEO9NY9quxIXZqT0BlMobxvqH8uyWQyoGinj33cWg+7sXpV3X+CdPpjqJQS6qza7TakUikHcFJlAIfgxOpV1YfIc1Z/AvelXTAMA1qtFqTTaQdwXHnH7Y2w6+xV5VQqCKlaH2N4KCcUoNlsQiaTcQDFux7KmQT61KkLyjnHqPOv7gb1+bJUy3EIBoPQaDQgm806gN9m2zbGYjECEGluHLc2BtTrdcjlcv6AbreLpmn+ectrtRrk83l/gGVZyOo6XX4tzxcKBX/Afx7Y0q/xCyxxSSDAf7z0AAAAAElFTkSuQmCC"
      iconOffset:
        x: 1
        y: 2

      move: ({position, editor}) ->
        scale = 1
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
          editor.previewCanvas.drawImage editor.canvas.element(),
            selection.position.x,
            selection.position.y,
            selection.size.width,
            selection.size.height,
            selection.position.x + delta.x,
            selection.position.y + delta.y,
            selection.size.width,
            selection.size.height

          # Draw selection area
          outlineRect = Rectangle(selection)
          outlineRect.position.x += delta.x
          outlineRect.position.y += delta.y
          drawOutline(editor.previewCanvas, scale, outlineRect)

      release: ({editor}) ->
        if selecting
          selecting = !selecting
          # HACK: Painting the ui on the preview canvas after it get's auto
          # cleared from the release event
          setTimeout ->
            canvas = editor.previewCanvas
            scale = 1
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
