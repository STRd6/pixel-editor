Editor template

    - activeIndex = @activeIndex
    - activeTool = @activeTool

    .editor

The toolbar holds our tools.

      .toolbar
        - each @tools, (tool) ->
          .tool(style="background-image: url(#{tool.iconUrl})")
            -on "click", (e) ->
              - activeTool(tool)

TODO: This whole activation and tracking should be made easier in Tempest.

              - $(e.currentTarget).takeClass("active")

Our layers and preview canvases are placed in the viewport.

      .viewport

The palette holds our colors.

      .palette
        .color.current
        - each @palette, (color, index) ->
          .color(style="background-color: #{color}")
            - on "click", ->
              - activeIndex index
