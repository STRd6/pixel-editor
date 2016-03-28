module.exports = (action, editor) ->
  {hotkey, icon, name} = action

  perform: (e) ->
    e.preventDefault()

    editor.dispatchAction(action)

  title: ->
    "#{name} [#{hotkey}]"
  name: ->
    name
  style: ->
    "background-image: url(#{icon})"
