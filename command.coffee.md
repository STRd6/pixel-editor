Command
=======

    LZString = require "./lib/lz-string"
    {extend} = require "util"

Commands that can be done/undone in the editor.

    module.exports = (I={}, self) ->
      self.imageDataToJSON = imageDataToJSON
      self.imageDataFromJSON = imageDataFromJSON

      self.Command = {}

This is a weird DSL for each command to inherit a toJSON method and to register
to be de-serialized by name.

*IMPORTANT:* If the names change then old command data may fail to load in newer
versions.

      C = (name, constructor) ->
        self.Command[name] = (data={}) ->
          data = extend {}, data
          data.name = name

          command = constructor(data)

          command.toJSON ?= ->
            # TODO: May want to return a copy of the data to be super-duper safe
            data

          return command

      C "Resize", (data) ->
        if typeof data.imageData?.data is "string"
          data.imageData = imageDataFromJSON(data.imageData)

        if typeof data.imageDataPrevious?.data is "string"
          data.imageDataPrevious = imageDataFromJSON(data.imageDataPrevious)

        execute: ->
          self.resize(data.size, data.imageData)

        undo: ->
          self.resize(data.sizePrevious, data.imageDataPrevious)

        toJSON: ->
          {imageData, imageDataPrevious, size, sizePrevious} = data

          name: "Resize"
          size: size
          sizePrevious: sizePrevious
          imageData: imageDataToJSON(imageData)
          imageDataPrevious: imageDataToJSON(imageDataPrevious)

      C "PutImageData", (data) ->
        if typeof data.imageData.data is "string"
          data.imageData = imageDataFromJSON(data.imageData)

        if typeof data.imageDataPrevious.data is "string"
          data.imageDataPrevious = imageDataFromJSON(data.imageDataPrevious)

        execute: ->
          self.putImageData(data.imageData, data.x, data.y)
        undo: ->
          self.putImageData(data.imageDataPrevious, data.x, data.y)
        toJSON: ->
          {x, y, imageData, imageDataPrevious} = data

          name: "PutImageData"
          x: x
          y: y
          imageData: imageDataToJSON(imageData)
          imageDataPrevious: imageDataToJSON(imageDataPrevious)

      C "Composite", (data) ->
        if data.commands
          # We came from JSON so rehydrate the commands.
          data.commands = data.commands.map self.Command.parse
        else
          data.commands = []

        commands = data.commands

        execute: ->
          commands.invoke "execute"

        undo: ->
          # Undo last command first because the order matters
          commands.copy().reverse().invoke "undo"

        push: (command, noExecute) ->
          # We execute commands immediately when pushed in the compound
          # so that the effects of events during mousemove appear
          # immediately but they are all revoked together on undo/redo
          # Passing noExecute as true will skip executing if we are
          # adding commands that have already executed.
          commands.push command
          command.execute() unless noExecute

        empty: ->
          commands.length is 0

        toJSON: ->
          extend {}, data,
            commands: commands.invoke "toJSON"

      self.Command.parse = (commandData) ->
        self.Command[commandData.name](commandData)

Helpers
-------

    imageDataToJSON = (imageData) ->
      return unless imageData

      data: serialize(imageData.data)
      width: imageData.width
      height: imageData.height

    imageDataFromJSON = ({data, width, height}) ->
      new ImageData deserialize(data), width, height

    deserialize = (dataURL) ->
      dataString = dataURL.substring(dataURL.indexOf(';') + 1)

      binaryString = atob(LZString.decompressFromBase64 dataString)
      length =  binaryString.length
      buffer = new ArrayBuffer length
      view = new Uint8ClampedArray(buffer)

      i = 0
      while i < length
        view[i] = binaryString.charCodeAt(i)
        i += 1

      return view

    serialize = (bytes) ->
      binary = ''
      length = bytes.byteLength

      i = 0
      while i < length
        binary += String.fromCharCode(bytes[i])
        i += 1

      LZString.compressToBase64 btoa(binary)
