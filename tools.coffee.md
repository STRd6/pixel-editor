Tools
=====

    {line, circle, rect, rectOutline} = require "./util"

    line2 = (start, end, fn) ->
      fn start
      line start, end, fn

    neighbors = (point) ->
      [
        Point(point.x, point.y-1)
        Point(point.x-1, point.y)
        Point(point.x+1, point.y)
        Point(point.x, point.y+1)
      ]

    shapeTool = (fn, icon) ->
      start = null

      iconUrl: icon
      touch: ({position})->
        start = position

      move: ({editor, position})->
        editor.preview ->
          fn start, position, editor.draw

      release: ({position, editor}) ->
        fn start, position, editor.draw

Default tools.

    TOOLS =

Draw a line when moving while touching.

      pencil: do ->
        previousPosition = null

        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVQ4T5VTuw2DMBB9LmkZg54ZGCDpHYkJYBBYATcUSKnSwAy0iDFoKR0fDgiMDc5JLvy59969OzPchzSesP3+sLFgySoMweMYou/xmWe81VKx5d0CyCQBoghoGgiV/JombwDNzjkwjsAw/A8gswwgBWm6VPdU7L4laPa6BsrSyX6oxTBQ7munO1v9LgCv2ldCWxcWgDV4EDjZbQq0dDKv65ytuxokKdtWO08AagkhTr2/BiD2otBv8hyMurCbPHNaTQ8OBjJScZFs9eChTKMwB8byT5ajkwIC8E22AvyY7j7ZJugLVIZ5EV8R1SQAAAAASUVORK5CYII="
        touch: ({position, editor})->
          editor.draw position
          previousPosition = position
        move: ({editor, position})->
          line previousPosition, position, editor.draw
          previousPosition = position
        release: ->

      fill:
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4T52TPRKCMBCFX0pbj+HY0tJKY+UB8AqchCuYXofCRs9gy3ADW1rKmLeQTIBEZ0wTwu779idZhfQygUml3FIGikPb8ux5MUDM+S9AWAIjRrNNZYDLdov7MEiqx80G576PQqIAJ75NgJMFXPMc6vlcQZYAI842unq/YQ4HoKrGho1iqLqeQWadZuSyLKG1FmeWwMjY7QDCJlAIcQAj4iyDfr1kp4gggVgb9nsPUkXhs1gBJBpX1wFtC20BrpmSjS0pDbD1h8uJeQu+pKaJAmgfy5icQzH/sani9HgkAWLnLTAi0+YeiFmu+QXwEH5EHpAx7EFwld+GybVjOVTJdzBrYOKwGqoP9IV4EbRDWfEAAAAASUVORK5CYII="
        touch: ({position, editor}) ->
          index = editor.activeIndex()
          targetIndex = editor.getPixel(position).index

          return if index is targetIndex

          queue = [position]
          editor.draw position

          while(queue.length)
            position = queue.pop()

            neighbors(position).forEach (position) ->
              if editor.getPixel(position)?.index is targetIndex
                editor.draw position
                queue.push(position)

          return

        move: ->
        release: ->

Shapes
------

      circle: shapeTool circle,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVQ4T2NkwA7+YxFmxKYUXRCmEZtirHLICkEKsNqCZjOKOpgGYjXDzIKrp4oBpNqO4gqQC0YNgAQJqeFA3WjESBw48gdWdVTNC8gWk50bCbgeUxoAvXwcEQnwKSYAAAAASUVORK5CYII="

      rect: shapeTool rect,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVQ4T2NkoBAwUqifYfAY8J9MrzDCvDBqAAPDMAgDMpMBwyBKymR7AQAp1wgR44q8HgAAAABJRU5ErkJggg=="

      rectOutline: shapeTool rectOutline,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4T2NkoBAwUqifgWoG/CfTJYwwF4AMINU1YD2jBgy7MCAnLcHTATmawXpITX0YFlFsAADRBBIRAZEL0wAAAABJRU5ErkJggg=="

      line2: shapeTool line2,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAV0lEQVQ4T6XSyQ0AIAgEQOm/aIWHxoNzJTG+GASk9hnE+Z2P3FDMRBjZK0PI/fQyovVeQqzhpRFv+ikkWl+IRID8DRfJAC6SBUykAqhIFXgQBDgQFFjIAMAADxGQlO+iAAAAAElFTkSuQmCC"

    module.exports = (I={}, self=Core(I)) ->
      self.extend
        addTool: (tool) ->
          self.tools.push tool

        activeTool: Observable()

        tools: Observable []

      # TODO: Probably want to let the editor add its own tools so this is more
      # reusable
      Object.keys(TOOLS).forEach (name) ->
        self.addTool TOOLS[name]

      self.activeTool(self.tools()[0])

      return self
