Loader
======

TODO: Quantize Palette

    Loader = (I={}, self=Core(I)) ->
      self.extend
        load: (dataURL) ->
          deferred = Deferred()

          context = document.createElement('canvas').getContext('2d')
          image = document.createElement("image")

          image.onload = ->
            console.log "onload"
            {width, height} = image

            context.drawImage(image, 0, 0)
            imageData = context.getImageData(0, 0, width, height)

            deferred.resolve imageData

          image.src = dataURL

          return deferred.promise()

        fromImageData: (imageData) ->
          {width, height} = imageData
    
          getColor = (x, y) ->
            index = (x + y * width) * 4
      
            pieces = [0..3].map (n) ->
              imageData.data[index + n]
      
            pieces[3] /= 255
      
            rgba = "rgba(#{pieces.join(",")})"
      
            return rgba
      
          colorFrequency = {}
      
          colors = [0...height].map (y) ->
            [0...width].map (x) ->
              color = getColor(x, y)
      
              colorFrequency[color] ?= 0
              colorFrequency[color] += 1
      
              color
      
          table = Object.keys(colorFrequency).sort (a, b) ->
            colorFrequency[b] - colorFrequency[a]
          .reduce (table, color, index) ->
            table[color] = index
      
            table
          , {}
      
          palette = Object.keys(table)
      
          data = [0...height].map (y) ->
            [0...width].map (x) ->
              table[colors[y][x]]
    
          palette: palette
          width: width
          height: height
          data: data

    module.exports = Loader

Helpers
-------

    intToRGBA = (number) ->
      bitmask = 0xff

      numbers = [0..3].map (n) ->
        bitshift = n * 8
        (number & (bitmask << bitshift)) >> bitshift

      numbers[3] /= 255

      "rgba(#{numbers.join(",")})"
