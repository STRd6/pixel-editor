The layers sidebar

      .layers
        .thumbnail
        Layers
        - layers = -> editor.layers().copy().reverse()
        - each layers, (layer, index) ->
          - activeClass = -> "active" if layer is editor.activeLayer()
          - hiddenClass = -> "hidden" if layer.hidden()
          .layer(class=activeClass class=hiddenClass)
            - on "click", ->
              - editor.activeLayer layer
            = layer.previewCanvas
            .eye
              - on "click", ->
                - layer.hidden !layer.hidden()
