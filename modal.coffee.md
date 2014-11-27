Modal
=====

Messing around with some modal BS

    $("body").append $ "<div>",
      id: "modal"

    # HACK: Dismiss modal by clicking on overlay
    $ ->
      $("#modal").click (e) ->
        if e.target is this
          Modal.hide()

    module.exports = Modal =
      show: (element) ->
        $("#modal").empty().append(element).addClass("active")

      hide: ->
        $("#modal").removeClass("active")
