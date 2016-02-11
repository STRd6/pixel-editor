Editor template

    - activeIndex = @activeIndex
    - activeTool = @activeTool
    - previousTool = @previousTool
    - editor = this
    - Symmetry = require "../symmetry"
    - Palette = require "./palette"

    .editor

The toolbar holds our tools.

      .toolbar
        .tools
          - @tools.each (tool) ->
            - activeClass = -> "active" if tool is activeTool()
            - activate = -> activeTool(tool)
            .tool(style="background-image: url(#{tool.iconUrl})" title=tool.hotkeys class=activeClass click=activate)
              - if setting = tool.settings?.size
                %input(type=setting.type min=setting.min max=setting.max value=setting.value)
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
        .thumbnail(click=@thumbnailClick)

      .position
        = @positionDisplay

      .notifications
        - @notifications.forEach (notification) ->
          %p
            = notification

The palette holds our colors.

      = Palette(this)

      .opacity
        %h2 Opacity
        %input.alphaValue(value=@alpha)
        %input.alphaSlider(type="range" value=@alpha step="1" min="0" max="100")

      .actions
        - @actions.each (action) ->
          .action(click=action.perform touchstart=action.perform title=action.hotkey style="background-image: url(#{action.iconUrl})")
            .text= action.name
