# Setup
require "./lib/canvas-to-blob"

Editor = require "./editor"

SystemClient = require "sys"

launch = ->
  # For debugging
  global.editor = Editor()

  Template = require "./templates/editor"
  editorElement = Template editor
  document.body.appendChild editorElement

  {postmaster, system, application} = SystemClient()

  if postmaster.remoteTarget()
    editor.addAction
      hotkey: "ctrl+s"
      name: "Save"
      description: """
        Save to your gallery
      """
      method: ({editor}) ->
        editor.getBlob()
        .then (blob) ->
          postmaster.invokeRemote "application", "save"
        .then ->
          editor.markClean()
  
      icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC"

    postmaster.delegate = editor

    # Install FileIO module in system host
    application.loadModule "FileIO"
    system.ready()

  updateViewportCentering = ->
    {height: mainHeight, width: mainWidth} = editorElement.querySelector(".main").getBoundingClientRect()
    editor.mainHeight mainHeight
    editor.mainWidth mainWidth
  window.addEventListener "resize", updateViewportCentering
  updateViewportCentering()

if PACKAGE.name is "ROOT"
  # Google Analytics
  require("analytics").init("UA-3464282-15")

  # For debug purposes
  global.PACKAGE = PACKAGE
  global.require = require

  metaTag = document.createElement('meta')
  metaTag.name = "viewport"
  metaTag.content = "width=device-width, initial-scale=1.0"
  document.getElementsByTagName('head')[0].appendChild(metaTag)

  launch()
  
  # Need to add our styles last to take priority over base sys-UI styles
  style = document.createElement "style"
  style.innerHTML = require "./style"
  document.head.appendChild style

module.exports = Editor
