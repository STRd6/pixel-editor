Tools
=====

    Brushes = require "./brushes"
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

    shapeTool = (fn, hotkey, icon) ->
      start = null

      hotkeys: hotkey
      iconUrl: icon
      touch: ({position}) ->
        start = position

      move: ({editor, position})->
        editor.preview ->
          fn start, position, editor.draw

      release: ({position, editor}) ->
        fn start, position, editor.draw

    brushTool = (brushName, hotkey, icon, options) ->
      previousPosition = null
      brush = Brushes[brushName]

      OP = (out) ->
        (p) ->
          out(p, options)

      paint = (out) ->
        (point) ->
          brush(point).forEach OP out

      hotkeys: hotkey
      iconUrl: icon
      touch: ({position, editor})->
        paint(editor.draw) position
        previousPosition = position
      move: ({editor, position})->
        line previousPosition, position, paint(editor.draw)
        previousPosition = position
      release: ->
        previousPosition = null

Default tools.

    TOOLS =

Draw a line when moving while touching.

      pencil: brushTool "pencil", "p",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVQ4T5VTuw2DMBB9LmkZg54ZGCDpHYkJYBBYATcUSKnSwAy0iDFoKR0fDgiMDc5JLvy59969OzPchzSesP3+sLFgySoMweMYou/xmWe81VKx5d0CyCQBoghoGgiV/JombwDNzjkwjsAw/A8gswwgBWm6VPdU7L4laPa6BsrSyX6oxTBQ7munO1v9LgCv2ldCWxcWgDV4EDjZbQq0dDKv65ytuxokKdtWO08AagkhTr2/BiD2otBv8hyMurCbPHNaTQ8OBjJScZFs9eChTKMwB8byT5ajkwIC8E22AvyY7j7ZJugLVIZ5EV8R1SQAAAAASUVORK5CYII="

      brush: brushTool "brush", "b",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAKBJREFUeJytkrsRgzAQRFeME6UXXwVUogKoRB2JmAagEEqBcB0ge/Dw0cm2ZpTd7tuTFqg/zBcA0NSKkwg6719G1WJSlUnkI4XZgCGQql+tQKoCbYt+WWrB2SDGA92aYKMD/6dbEjCJAPP8A73wbe5OnAuDYV1LsyfkEMgYi4W5ciW56Zxzt/THBR2YJmAcbXn34s77d+dh6Ps+2tlw8eGedfBU8rnbDOMAAAAASUVORK5CYII="

      eraser: brushTool "pencil", "e",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==",
        index: 0

      dropper:
        hotkeys: "i"
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAH1JREFUeJztjrsNhDAUBIfLTOiYsiClCHdEDUT0Q0rscElY3QkJOD4hI1nye/aOFm5S/Ny1sd/l43AdAqoq6hDWsr8aqIsRgLYsKcbRbzpq4wb0OQPQTJNXh+E18ulilFLyfBopJZmzEn+WhuGy5NvklWxKrgpYgrclFj3DDPqoerGlCYunAAAAAElFTkSuQmCC"
        touch: ({position, editor}) ->
          {x, y} = position
          index = editor.layer().get(x, y)
          editor.activeIndex index
        move: ({position, editor}) ->
          {x, y} = position
          index = editor.layer().get(x, y)
          editor.activeIndex index
        release: ->
          # Return to the previous tool
          editor.activeTool editor.previousTool()

Fill a connected area.

      fill:
        hotkeys: "f"
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4T52TPRKCMBCFX0pbj+HY0tJKY+UB8AqchCuYXofCRs9gy3ADW1rKmLeQTIBEZ0wTwu779idZhfQygUml3FIGikPb8ux5MUDM+S9AWAIjRrNNZYDLdov7MEiqx80G576PQqIAJ75NgJMFXPMc6vlcQZYAI842unq/YQ4HoKrGho1iqLqeQWadZuSyLKG1FmeWwMjY7QDCJlAIcQAj4iyDfr1kp4gggVgb9nsPUkXhs1gBJBpX1wFtC20BrpmSjS0pDbD1h8uJeQu+pKaJAmgfy5icQzH/sani9HgkAWLnLTAi0+YeiFmu+QXwEH5EHpAx7EFwld+GybVjOVTJdzBrYOKwGqoP9IV4EbRDWfEAAAAASUVORK5CYII="
        touch: ({position, editor}) ->
          index = editor.activeIndex()
          targetIndex = editor.getPixel(position).index

          return unless targetIndex?
          return if index is targetIndex

          queue = [position]
          editor.draw position

          # TODO: Allow for interrupts if it takes too long
          {width, height} = editor.pixelExtent()
          safetyHatch = width * height

          while(queue.length and safetyHatch > 0)
            position = queue.pop()

            neighbors(position).forEach (position) ->
              if editor.getPixel(position)?.index is targetIndex
                # This is here because I HAVE been burned
                # Later I should fix the underlying cause, but it seems handy to keep
                # a hatch on any while loops.
                safetyHatch -= 1

                editor.draw position
                queue.push(position)

          return

        move: ->
        release: ->

Shapes
------

      circle: shapeTool circle, "c",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVQ4T2NkwA7+YxFmxKYUXRCmEZtirHLICkEKsNqCZjOKOpgGYjXDzIKrp4oBpNqO4gqQC0YNgAQJqeFA3WjESBw48gdWdVTNC8gWk50bCbgeUxoAvXwcEQnwKSYAAAAASUVORK5CYII="

      rect: shapeTool rect, "r",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVQ4T2NkoBAwUqifYfAY8J9MrzDCvDBqAAPDMAgDMpMBwyBKymR7AQAp1wgR44q8HgAAAABJRU5ErkJggg=="

      rectOutline: shapeTool rectOutline, "shift+r",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4T2NkoBAwUqifgWoG/CfTJYwwF4AMINU1YD2jBgy7MCAnLcHTATmawXpITX0YFlFsAADRBBIRAZEL0wAAAABJRU5ErkJggg=="

      line2: shapeTool line2, "l",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAV0lEQVQ4T6XSyQ0AIAgEQOm/aIWHxoNzJTG+GASk9hnE+Z2P3FDMRBjZK0PI/fQyovVeQqzhpRFv+ikkWl+IRID8DRfJAC6SBUykAqhIFXgQBDgQFFjIAMAADxGQlO+iAAAAAElFTkSuQmCC"

    module.exports = (I={}, self=Core(I)) ->
      self.extend
        addTool: (tool) ->
          [].concat(tool.hotkeys or []).forEach (hotkey) ->
            self.addHotkey hotkey, ->
              self.activeTool tool

          self.tools.push tool

        activeTool: Observable()
        previousTool: Observable()

        tools: Observable []

      # TODO: Probably want to let the editor add its own tools so this is more
      # reusable
      Object.keys(TOOLS).forEach (name) ->
        self.addTool TOOLS[name]

      setNthTool = (n) ->
        ->
          if tool = self.tools.get(n)
            self.activeTool tool

      [1..9].forEach (n) ->
        self.addHotkey n.toString(), setNthTool(n-1)

      self.addHotkey "0", setNthTool(9)

      prevTool = null
      self.activeTool.observe (newTool) ->
        self.previousTool prevTool
        prevTool = newTool

      self.activeTool(self.tools()[0])

      return self
