Editor template

    - activeIndex = @activeIndex
    - activeTool = @activeTool
    - previousTool = @previousTool
    - editor = this
    - Symmetry = require "../symmetry"

    - Action = require "./action"
    - ActionPresenter = require "../presenters/action"
    - Palette = require "./palette"
    - Tool = require "./tool"
    - ToolPresenter = require "../presenters/tool"

    .editor(class=@loadingClass)

The toolbar holds our tools.

      .toolbar
        .tools
          - @tools.each (tool) ->
            = Tool ToolPresenter(editor, tool)
        %h2 Symmetry
        .tools
          - symmetryMode = @symmetryMode
          - ["normal", "flip", "flop", "quad"].forEach (mode) ->
            - activeClass = -> "active" if mode is symmetryMode()
            - activate = -> symmetryMode(mode)
            .tool(style="background-image: url(#{Symmetry.icon[mode]})" class=activeClass click=activate)

Our layers and preview canvases are placed in the viewport.

      .main
        .viewport(style=@viewportStyle class=@viewportCenter class=@viewportChecker)
          .overlay(style=@gridStyle)
          = @canvas.element()
          = @previewCanvas.element()
        .thumbnail(click=@thumbnailClick)
          = @thumbnailCanvas.element()

      .position
        = @positionDisplay

      .notifications
        - @notifications.forEach (notification) ->
          %p
            = notification

The palette holds our colors.

      = Palette(this)

      .actions
        - @actions.forEach (action) ->
          = Action ActionPresenter action, editor

      #loader
        %progress.vertical-center(value=@loadingProgress)
