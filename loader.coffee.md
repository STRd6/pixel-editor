Loader
======

    Loader = (I={}, self=Core(I)) ->
      self.extend
        load: (url) ->
          deferred = Deferred()

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

            deferred.resolve imageData

          image.onerror = ->
            deferred.reject "Error loading image data"

          image.src = url

          return deferred.promise()

    module.exports = Loader
