Notifications
=======

Notifications for editors.

    module.exports = (I={}, self) ->
      duration = 5000

      self.extend
        notifications: Observable []
        notify: (message) ->
          self.notifications.push message

          setTimeout ->
            self.notifications.remove message
          , duration

      return self
