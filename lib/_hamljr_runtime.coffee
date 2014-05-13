Observable = require "observable"

eventNames = """
  abort
  blur
  change
  click
  dblclick
  drag
  dragend
  dragenter
  dragleave
  dragover
  dragstart
  drop
  error
  focus
  input
  keydown
  keypress
  keyup
  load
  mousedown
  mousemove
  mouseout
  mouseover
  mouseup
  reset
  resize
  scroll
  select
  submit
  touchstart
  touchend
  touchmove
  touchenter
  touchleave
  touchcancel
  unload
""".split("\n")

isEvent = (name) ->
  eventNames.indexOf(name) != -1

isFragment = (node) ->
  node.nodeType is 11

valueBind = (element, value) ->
  element.value = value()

  # Because firing twice with the same value is idempotent just binding both
  # oninput and onchange handles the widest range of inputs and browser
  # inconsistencies.
  element.oninput = ->
    value(element.value)
  element.onchange = ->
    value(element.value)

  value.observe? (newValue) ->
    element.value = newValue

  switch element.nodeName
    when "SELECT"
      # HACK: Need to set the value, but probably don't have the option contents yet
      # so let's just do it after our execution suspends and we probably have them
      setTimeout ->
        element.value = value()
      , 0

  return

Runtime = (context) ->
  stack = []

  # HAX: A document fragment is not your real dad
  lastParent = ->
    i = stack.length - 1
    while (element = stack[i]) and isFragment(element)
      i -= 1

    element

  top = ->
    stack[stack.length-1]

  append = (child) ->
    parent = top()

    # TODO: This seems a little gross
    # The problem is that in each blocks our fragments are being emptied
    # because they are appended to the parent before we return
    # By appending and returning the child instead we should be able to
    # keep a reference to the actual elements
    if parent and isFragment(child) and child.childNodes.length is 1
      child = child.childNodes[0]

    top()?.appendChild(child)

    return child

  push = (child) ->
    stack.push(child)

  pop = ->
    append(stack.pop())

  render = (child) ->
    push(child)
    pop()

  bindObservable = (element, value, update) ->
    observable = Observable(value)
    update observable()

    observe = ->
      observable.observe update
      update observable()

    unobserve = ->
      observable.stopObserving update

    element.addEventListener("DOMNodeInserted", observe, true)
    element.addEventListener("DOMNodeRemoved", unobserve, true)

    return element

  id = (sources...) ->
    element = top()

    update = (newValue) ->
      if typeof newValue is "function"
        newValue = newValue()

      element.id = newValue

    value = ->
      possibleValues = sources.map (source) ->
        if typeof source is "function"
          source()
        else
          source
      .filter (idValue) ->
        idValue?

      possibleValues[possibleValues.length-1]

    bindObservable(element, value, update)

  classes = (sources...) ->
    element = top()

    update = (newValue) ->
      if typeof newValue is "function"
        newValue = newValue()

      element.className = newValue

    value = ->
      possibleValues = sources.map (source) ->
        if typeof source is "function"
          source()
        else
          source
      .filter (sourceValue) ->
        sourceValue?

      possibleValues.join(" ")

    bindObservable(element, value, update)

  observeAttribute = (name, value) ->
    element = top()

    update = (newValue) ->
      if newValue? and newValue != false
        element.setAttribute name, newValue
      else
        element.removeAttribute name

    if (name is "value") and (typeof value is "function")
      valueBind(element, value)
    else if (name is "checked") and (typeof value is "function")
      element.onchange = ->
        value element.checked
      bindObservable(element, value, update)
    # Straight up onclicks, etc.
    else if name.match(/^on/) and isEvent(name.substr(2))
      element[name] = value
    # Handle click=@method
    else if isEvent(name)
      element["on#{name}"] = value
    else
      bindObservable(element, value, update)

    return element

  observeText = (value) ->
    # Kind of a hack for handling sub renders
    # or adding explicit html nodes to the output
    # TODO: May want to make more sure that it's a real dom node
    #       and not some other object with a nodeType property
    # TODO: This shouldn't be inside of the observeText method
    switch value?.nodeType
      when 1, 3, 11
        return render(value)

    # HACK: We don't really want to know about the document inside here.
    # Creating our text nodes in here cleans up the external call
    # so it may be worth it.
    element = document.createTextNode('')

    update = (newValue) ->
      element.nodeValue = newValue

    bindObservable element, value, update

    render element

  self =
    # Pushing and popping creates the node tree
    push: push
    pop: pop

    id: id
    classes: classes
    attribute: observeAttribute
    text: observeText

    filter: (name, content) ->
      ; # TODO self.filters[name](content)

    each: (items, fn) ->
      items = Observable(items)
      elements = null
      parent = lastParent()

      # TODO: Work when rendering many sibling elements
      items.observe (newItems) ->
        replace elements, newItems

      replace = (oldElements, items) ->
        elements = []
        items.forEach (item, index, array) ->
          element = fn.call(item, item, index, array)

          if isFragment(element)
            elements.push element.childNodes...
          else
            elements.push element

          parent.appendChild element

          return element

        oldElements?.forEach (element) ->
          element.remove()

      replace(null, items)

  return self

module.exports = Runtime
