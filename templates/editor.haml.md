Editor template

    - activeIndex = @activeIndex
    - activeTool = @activeTool
    - previousTool = @previousTool
    - editor = this
    - Symmetry = require "../symmetry"

    .editor

The toolbar holds our tools.

      .toolbar
        .tools
          - each @tools, (tool) ->
            - activeClass = -> "active" if tool is activeTool()
            - activate = -> activeTool(tool)
            .tool(style="background-image: url(#{tool.iconUrl})" class=activeClass click=activate)
        %h2 Symmetry
        .tools
          - symmetryMode = @symmetryMode
          - each ["normal", "flip", "flop", "quad"], (mode) ->
            - activeClass = -> "active" if mode is symmetryMode()
            - activate = -> symmetryMode(mode)
            .tool(style="background-image: url(#{Symmetry.icon[mode]})" class=activeClass click=activate)

Our layers and preview canvases are placed in the viewport.

      .main
        .viewport
          .overlay
        - swap = (e) -> if ($t = $(e.currentTarget)).css("left") is "auto" then $t.css(left: 0, right: "auto") else $t.css(left: "auto", right: 0)
        .thumbnail(click=swap)

      .position
        = @positionDisplay

      .notifications
        - each @notifications, (notification) ->
          %p
            = notification

The palette holds our colors.

      .palette
        .color.current
        - each @palette, (color, index) ->
          - activeClass = -> "active" if index is activeIndex()
          - activate = -> activeIndex index
          .color(class=activeClass click=activate touchstart=activate style="background-color: #{color}")

      .actions
        - each @actions, (action) ->
          .action(click=@perform touchstart=@perform style="background-image: url(#{@iconUrl})")
            .text= @name
            .text= @hotkey

Modal junk

    #modal
