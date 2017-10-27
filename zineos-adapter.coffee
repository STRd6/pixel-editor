{Observable} = require "sys"

module.exports = (editor, client) ->
  {system, postmaster, application} = client

  editor.removeActionByName "Download"

  editor.addHotkey
    name: "Save As"
    hotkey: "ctrl+shift+s"
    method: ->
      editor.saveAs()

  editor.addAction
    hotkey: "ctrl+s"
    name: "Save"
    description: """
      Save to your gallery
    """
    method: ({editor}) ->
      editor.save()

    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC"

  # Add fileIO
  # Provides
  # - save
  # - saveAs
  # - saved
  # - open
  # - currentPath
  client.util.FileIO(editor)

  # We need to provide
  # - loadFile
  # - newFile
  # - saveData
  Object.assign editor,
    # Implement ZineOS FileIO compatible `loadFile`
    loadFile: (blob, path) ->
      url = URL.createObjectURL(blob)

      editor.fromDataURL(url)
      .then ->
        editor.currentPath path
        URL.revokeObjectURL url
        editor.history []
        return

    newFile: ->
      editor.clear()
      editor.history []
      return

    # Alias getBlob as `saveData` for ZineOS compatibility
    saveData: ->
      editor.getBlob()

  # TODO: Maybe consolidate these into the same thing
  editor.saved.observe (newValue) ->
    if newValue
      editor.markClean()

  title = Observable ->
    path = editor.currentPath()
    if editor.saved()
      savedIndicator = ""
    else
      savedIndicator = "*"

    if path
      path = " - #{path}"

    "Pixie Paint#{path}#{savedIndicator}"

  title.observe application.title

  postmaster.delegate = editor

  system.ready()
