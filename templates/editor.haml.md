Editor template

    - pickColor = @pickColor
    .editor
      .toolbar
      .viewport
      .palette
        - each @colors, (color) ->
          .color(style="background-color: #{color}")
            - on "click", ->
              - pickColor color
