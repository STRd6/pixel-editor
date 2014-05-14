Editor template

    - activeIndex = @activeIndex
    - activeTool = @activeTool
    - editor = this
    - Observable = require "observable"

    .editor

The toolbar holds our tools.

      .toolbar
        - each @tools, (tool) ->
          - activeClass = -> "active" if tool is activeTool()
          - activate = -> activeTool(tool)
          .tool(style="background-image: url(#{tool.iconUrl})" class=activeClass click=activate)

Our layers and preview canvases are placed in the viewport.

      .main
        .viewport
          .overlay
        - swap = (e) -> if ($t = $(e.currentTarget)).css("left") is "auto" then $t.css(left: 0, right: "auto") else $t.css(left: "auto", right: 0) 
        .thumbnail(click=swap)

      .notifications
        - each @notifications, (notification) ->
          %p
            = notification

The palette holds our colors.

      .palette
        .color.current
        - each @palette, (color, index) ->
          - activate = -> activeIndex index
          .color(click=activate touchstart=activate style="background-color: #{color}")

      .actions
        - each @actions, (action) ->
          - perform = -> action.perform()
          .action(click=perform touchstart=perform style="background-image: url(#{action.iconUrl})")

Modal junk

    #modal
