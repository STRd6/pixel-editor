Editor template

    - activeIndex = @activeIndex
    - activeTool = @activeTool
    - editor = this

    .editor

The toolbar holds our tools.

      .toolbar
        - each @tools, (tool) ->
          - activeClass = -> "active" if tool is activeTool()
          .tool(style="background-image: url(#{tool.iconUrl})" class=activeClass)
            -on "click", (e) ->
              - activeTool(tool)

Our layers and preview canvases are placed in the viewport.

      .main
        .viewport
          .overlay

      .notifications
        - each @notifications, (notification) ->
          %p
            = notification

The palette holds our colors.

      .palette
        .color.current
        - each @palette, (color, index) ->
          .color(style="background-color: #{color}")
            - on "click", ->
              - activeIndex index
            - on "touchstart", ->
              - activeIndex index

      .actions
        - each @actions, (action) ->
          .action(style="background-image: url(#{action.iconUrl})")
            - on "click", ->
              - action.perform()
            - on "touchstart", ->
              - action.perform()

Modal junk

    #modal
