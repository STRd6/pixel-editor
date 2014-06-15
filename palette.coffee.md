Palette
=======

    require "cornerstone"

Helpers
-------

    JASC_HEADER = """
      JASC-PAL
      0100
      256
    """

A liberal regex for matching the header in a JASC PAL file.

    JASC_REGEX = ///
      JASC-PAL\n
      \d+\n
      \d+\n
    ///

    fromStrings = (lines) ->
      lines.split("\n").map (line) ->
        "#" + line.split(" ").map (string) ->
          numberToHex parseInt(string, 10)
        .join("")

    numberToHex = (n) ->
      "0#{n.toString(0x10)}".slice(-2).toUpperCase()

    TRANSPARENT = [0xff, 0, 0xff]
    colorToRGB = (colorString) ->
      # HACK: Use crazy magenta for transparent in palette export.
      if colorString is "transparent"
        TRANSPARENT
      else
        colorString.match(/([0-9A-F]{2})/g).map (part) ->
          parseInt part, 0x10

    loadJASC = (lines) ->
      if lines.match JASC_REGEX
        colors = fromStrings(lines.replace(JASC_REGEX, "")).unique()

        if colors.length > 32
          # TODO: Notify on screen
          console.warn "Dropped excess colors (#{colors.length - 32}), kept first 32"
          colors[0...32]
        else
          colors
      else
        alert "unknown file format, currently only support JASC PAL"

Export to Formats
-----------------

    exportJASC = (array) ->
      entries = array
      .map (entry) ->
        colorToRGB(entry).join(" ")
      .join("\n")

      padding = Math.max(0, 256 - array.length)

      zeroes = [0...padding].map ->
        "0 0 0"
      .join("\n")

      """
        #{JASC_HEADER}
        #{entries}
        #{zeroes}
      """

Palettes
--------

    Palette =

      defaults:
        [
          "transparent"
          "#05050D"
          "#666666"
          "#DCDCDC"
          "#FFFFFF"
          "#EB070E"
          "#F69508"
          "#FFDE49"
          "#388326"
          "#0246E3"
          "#563495"
          "#58C4F5"
          "#F82481"
          "#E5AC99"
          "#5B4635"
          "#FFFEE9"
        ]

http://www.pixeljoint.com/forum/forum_posts.asp?TID=12795

      dawnBringer16: fromStrings """
        20 12 28
        68 36 52
        48 52 109
        78 74 78
        133 76 48
        52 101 36
        208 70 72
        117 113 97
        89 125 206
        210 125 44
        133 149 161
        109 170 44
        210 170 153
        109 194 202
        218 212 94
        222 238 214
      """

http://www.pixeljoint.com/forum/forum_posts.asp?TID=16247

      dawnBringer32: fromStrings """
        0 0 0
        34 32 52
        69 40 60
        102 57 49
        143 86 59
        223 113 38
        217 160 102
        238 195 154
        251 242 54
        153 229 80
        106 190 48
        55 148 110
        75 105 47
        82 75 36
        50 60 57
        63 63 116
        48 96 130
        91 110 225
        99 155 255
        95 205 228
        203 219 252
        255 255 255
        155 173 183
        132 126 135
        105 106 106
        89 86 82
        118 66 138
        172 50 50
        217 87 99
        215 123 186
        143 151 74
        138 111 48
      """

      load: loadJASC
      export: exportJASC
      fromStrings: fromStrings

    module.exports = Palette
