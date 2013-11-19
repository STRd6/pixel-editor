Modal
=====

Messing around with some modal BS

    module.exports =
      show: (element) ->
        $("#modal").empty().append(element).addClass("active")

      hide: ->
        $("#modal").removeClass("active")
