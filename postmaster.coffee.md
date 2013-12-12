Postmaster
==========

Bind editor events to postMessage events.

    module.exports = (I={}, self=Core(I)) ->
      # Only listening to messages from `opener`
      addEventListener "message", (event) ->
        if event.source is opener
          {method, params, id} = event.data

          try
            result = self[method](params...)

            send
              success:
                id: id
                result: result
          catch error
            send
              error:
                id: id
                result: error

      addEventListener "unload", ->
        send
          status: "unload"

      # Tell our opener that we're ready
      send
        status: "ready"

      self.sendToParent = send

      return self

    send = (data) ->
      opener?.postMessage data, "*"
