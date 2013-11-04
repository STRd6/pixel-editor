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
            {width, height} = image

            context.drawImage(image, 0, 0)
            imageData = context.getImageData(0, 0, width, height)

            deferred.resolve imageData

          image.onerror = ->
            deferred.reject "Error loading image data"

          image.src = dataURL

          return deferred.promise()

        fromImageData: (imageData) ->
          {width, height} = imageData

          colorFrequency = {}

          colors = [0...height].map (y) ->
            console.log y
            [0...width].map (x) ->
              pieces = getColor(imageData, x, y)

              pieces[3] /= 255

              color = arrayToHex(pieces)

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

        fromImageDataWithPalette: (imageData, palette) ->
          {width, height} = imageData
          paletteData = palette.map colorToRGB

          width: width
          height: height
          data: [0...height].map (y) ->
            [0...width].map (x) ->
              nearestColorIndex(getColor(imageData, x, y), paletteData)

    module.exports = Loader

Helpers
-------

    arrayToHex = (parts) ->
      "##{parts.map numberToHex}"

    intToRGBA = (number) ->
      bitmask = 0xff

      numbers = [0..3].map (n) ->
        bitshift = n * 8
        (number & (bitmask << bitshift)) >> bitshift

      numbers[3] /= 255

      "rgba(#{numbers.join(",")})"

    colorToRGB = (colorString) ->
      colorString.match(/([0-9A-F]{2})/g).map (part) ->
        parseInt part, 0x10

    distanceSquared = (a, b) ->
      a.map (n, index) ->
        delta = n - b[index]

        delta * delta
      .sum()

    nearestColorIndex = (colorData, paletteData) ->
      paletteColor = paletteData.minimum (paletteEntry) ->
        distanceSquared(paletteEntry, colorData)

      paletteData.indexOf(paletteColor)

    getColor = (imageData, x, y) ->
      index = (x + y * imageData.width) * 4

      Array::slice.call imageData.data, index, index + 4

    numberToHex = (n) ->
      "0#{n.toString(0x10)}".slice(-2).toUpperCase()
