Loader
======

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

Load the imageData and return the data with a palette representing the colors 
found in the imageData.

        fromImageData: (imageData) ->
          {width, height} = imageData

          colorFrequency = {}

          colors = [0...(width * height)].map (n) ->
            pieces = getColor(imageData, n)

            color = arrayToHex(pieces)
            
            console.log color

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

          data = [0...(width * height)].map (n) ->
            table[colors[n]]

          palette: palette
          width: width
          height: height
          data: data

Load the image data and quantize it to the given palette using nearest color, no
fancy error diffusion or anything.

        fromImageDataWithPalette: (imageData, palette) ->
          {width, height} = imageData
          paletteData = palette.map colorToRGBA

          width: width
          height: height
          data: [0...(width * height)].map (n) ->
            nearestColorIndex(getColor(imageData, n), paletteData)

    module.exports = Loader

Helpers
-------

    arrayToHex = (parts) ->
      if parts[3] < 128
        "transparent"
      else
        "##{parts.slice(0, 3).map(numberToHex).join('')}"

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
      stride = 4

      if y?
        index = (x + y * imageData.width) * stride
      else
        index = x * stride

      Array::slice.call imageData.data, index, index + stride

    numberToHex = (n) ->
      "0#{n.toString(0x10)}".slice(-2).toUpperCase()
