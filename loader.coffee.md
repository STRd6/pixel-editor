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
          paletteData = palette.map colorToRGBA

          width: width
          height: height
          data: [0...height].map (y) ->
            [0...width].map (x) ->
              nearestColorIndex(getColor(imageData, x, y), paletteData)

    module.exports = Loader

Helpers
-------

    arrayToHex = (parts) ->
      if parts[3]
        "transparent"
      else
        "##{parts.map numberToHex}"

    # HACK: Infinity keeps the transparent color from being closer than any other
    # color in the palette
    TRANSPARENT_RGBA = [Infinity, 0, 0, 0xff]

    colorToRGBA = (colorString) ->
      if colorString is "transparent"
        TRANSPARENT_RGBA
      else
        colorString.match(/([0-9A-F]{2})/g).map (part) ->
          parseInt part, 0x10
        .concat [0]

    distanceSquared = (a, b) ->
      a.slice(0, 3).map (n, index) ->
        delta = n - b[index]

        delta * delta
      .sum()

    nearestColorIndex = (colorData, paletteData) ->
      # TODO: Hack for transparent pixels
      # Assumes 0 index is transparent
      # 50% or more transparent then it is 100% transparent
      # less than 50% it is fully opaque
      if colorData[3] < 128
        return 0

      paletteColor = paletteData.minimum (paletteEntry) ->
        distanceSquared(paletteEntry, colorData)

      paletteData.indexOf(paletteColor)

    getColor = (imageData, x, y) ->
      index = (x + y * imageData.width) * 4

      Array::slice.call imageData.data, index, index + 4

    numberToHex = (n) ->
      "0#{n.toString(0x10)}".slice(-2).toUpperCase()
