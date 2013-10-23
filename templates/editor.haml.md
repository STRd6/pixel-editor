Editor template

    - pickColor = @pickColor
    .editor
      .toolbar
      .viewport
      .palette
        - each @colors, (color, index) ->
          .color(style="background-color: #{color}")
            - on "click", ->
              - pickColor index
