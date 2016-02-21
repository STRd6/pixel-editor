Loader
======

    Loader = ->
      load: (url) ->
        new Promise (resolve, reject) ->

          canvas = document.createElement('canvas')
          context = canvas.getContext('2d')
          image = document.createElement("img")
          image.crossOrigin = true

          image.onload = ->
            {width, height} = image

            canvas.width = width
            canvas.height = height
            context.drawImage(image, 0, 0)
            imageData = context.getImageData(0, 0, width, height)

            resolve imageData

          image.onerror = ->
            reject new Error "Error loading image data"

          image.src = url

    module.exports = Loader
