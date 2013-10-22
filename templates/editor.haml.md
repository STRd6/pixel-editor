Editor template

    .editor
      .toolbar
      .viewport
      .palette
        - each @colors, (color) ->
          .color(style="background-color: #{color}")
            - on "click", ->
              - console.log color
