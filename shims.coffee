
# Event#path polyfill
# NOTE: In Chrome this includes `window` but here we only get up to `document`
unless "path" of Event.prototype
  Object.defineProperty Event.prototype, "path",
    get: ->
      path = []
      node = @target
      while node
         path.push node
         node = node.parentNode

      return path
