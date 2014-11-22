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
          - @tools.each (tool) ->
            - console.log tool
            - activeClass = -> "active" if tool is activeTool()
            - activate = -> activeTool(tool)
            .tool(style="background-image: url(#{tool.iconUrl})" title=tool.hotkeys class=activeClass click=activate)
        %h2 Symmetry
        .tools
          - symmetryMode = @symmetryMode
          - ["normal", "flip", "flop", "quad"].forEach (mode) ->
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
        - @notifications.forEach (notification) ->
          %p
            = notification

The palette holds our colors.

      .palette
        .color.current(style=@activeColorStyle)
        - @palette.forEach (color, index) ->
          - activeClass = -> "active" if index is activeIndex()
          - activate = -> activeIndex index
          - style = -> if editor.paletteZeroTransparent() and index is 0 then "background-color: transparent" else "background-color: #{color}"
          .color(class=activeClass click=activate touchstart=activate style=style)

      .palette-editor.hide
        - close = -> $(".palette-editor").addClass("hide")
        - applyPalette = -> editor.applyPalette $(".palette-editor textarea").val(); close()
        %textarea
        %button(click=applyPalette) Apply
        %button(click=close) Close

      .actions
        - @actions.each (action) ->
          .action(click=action.perform touchstart=action.perform title=action.hotkey style="background-image: url(#{action.iconUrl})")
            .text= action.name

Modal junk

    #modal
