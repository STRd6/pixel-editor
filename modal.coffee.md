Modal
=====

Messing around with some modal BS

    modal = $ "<div>",
      id: "modal"

    modal.click (e) ->
      if e.target is this
        Modal.hide()

    $("body").append modal

    module.exports = Modal =
      show: (element) ->
        modal.empty().append(element).addClass("active")

      hide: ->
        modal.removeClass("active")
