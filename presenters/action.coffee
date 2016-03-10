module.exports = (action, editor) ->
  {hotkey, icon, method, name} = action

  perform: (e) ->
    e.preventDefault()

    if typeof method is "function"
      method
        editor: editor
    else
      editor[method]()
  title: ->
    "#{name} [#{hotkey}]"
  name: name
  style: ->
    "background-image: url(#{icon})"
