Size
----

A 2d extent.

    module.exports = Size = (width, height) ->
      if isObject(width)
        {width, height} = width

      width: width
      height: height
      __proto__: Size.prototype

    Size.prototype =
      scale: (scalar) ->
        Size(@width * scalar, @height * scalar)

      toString: ->
        "Size(#{@width}, #{@height})"

      max: (otherSize) ->
        Size(
          Math.max(@width, otherSize.width)
          Math.max(@height, otherSize.height)
        )

      each: (iterator) ->
        {width, height} = this

        [0...height].forEach (y) ->
          [0...width].forEach (x) ->
            iterator(x, y)
            return
          return

        return this

      inverse: ->
        Size(1/@width, 1/@height)

Helpers
-------

    isObject = (object) ->
      Object::toString.call(object) is "[object Object]"
