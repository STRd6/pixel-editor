module.exports = (color, editor) ->
  showPicker = false

  color: color

  click: (e) ->
    e.target.blur()
    unless showPicker
      showPicker = true
      e.preventDefault()

    setTimeout ->
      showPicker = false
    , 500

    editor.activeColor color()
    return

  input: (e) ->
    editor.activeColor e.target.value

  style: ->
    c = color()
    "background-color: #{c}; color: #{c};"
