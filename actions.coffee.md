Actions
=======

    Palette = require("./palette")
    saveAs = require "./lib/file_saver"
    {compressToUTF16:compress, decompressFromUTF16:decompress} = global.Compressor = require "compression"

    module.exports = Actions = (I={}, self=Core(I)) ->
      self.extend
        addAction: (action) ->
          self.actions.push action

        actions: Observable []

      Object.keys(Actions.defaults).forEach (hotkey) ->
        {method, icon} = Actions.defaults[hotkey]

        self.addAction
          perform: ->
            if typeof method is "function"
              method
                editor: self
            else
              self[method]()
          iconUrl: icon

        self.addHotkey hotkey, method

      return self

    state = null

    namespace = "/pixel-editor/saves/"
    store = (name, data) ->
      localStorage["#{namespace}#{name}"] = compress JSON.stringify(data)

    retrieve = (name) ->
      try
        JSON.parse decompress localStorage["#{namespace}#{name}"]
      catch
        return

    Actions.defaults =
      "ctrl+z":
        method: "undo"
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVQ4T6VTXUhTYRh+p47sbhcR2zmMDGXUTVBBiyBdJUjU6EJ2K4R0ESm6CyEo6qKZWcGkoC6KFt2GxKhwi4JKbcg2khmonVW6RbmGnnI1z873c3rPjp6aQQw88PJ834H3+b73eZ7PAhv8LBvsB5PAP3pK45wDZxyYXpQZSBjHWiSUJTmlUaVQGg6feZZdO9gk6HnZqXnEw6BpAFxjWBowRGwHhSgg/5RhQc6B9FkKq0ppMOJ/FdNJTIKuFye1Q84jwLGBAzbrqOENyiQciuQX1NVYIbOQgcR0IqwUV7pfn49nTYLT0Q7NuDYDShBxTfU9rgWbCA32BrDWWZGQQ2o2Be8/Sv7RCxNDVYnovdUaJCptb9njcTILhe/yDxiPxyKxS4mjVRHos7ZeOxh0bXP1ig4RiKrCk+eRfGJgcmsFgc8HteD1nn3Y8bh/vb3Nl93BHdt39oqCAKpK4Gl0JD95/d06ggfeECV076POkV1/EzQH3EHUpL3lgMdJawgsLxVgfOxNZOrGzJ8RfPeP3XTYxC5duLmvn8pCIpkhoh1FdKKIm6zoEoqYmgJpVvJP304bIvpCx6/abY6+JrHJtFB3Y81CHQulZaiv3QzzmSwk44mwulLs/hD6Yth44k5bQLAJ5xqdjeg9GBnAouUsYJAUBRblJcjlvkF6RgqjI4Ppe/OVQWoLeoaELY4eivGdy6yOsJoDHCWPoyUZoVFKlGH95H+irP/wBPbfpYztG7sYrxDxfw+uMgdoo9u1u2+i/+2Val/pb35FXyDc5lZBAAAAAElFTkSuQmCC"
      "ctrl+y":
        method: "redo"
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUUlEQVQ4T6WTUUhTURjHv+scNheypmOy7RY0H7IHC6Rgo/ItB0GXWIgSBUOJMIRFkEUlBEWBDzOsXnoQpIdqTUlrQ6k9NPBhUeCaFO0udxuB7bVc5D3n3L5zYNZSiNG9nHu+C+f/4/v+33ck+M9HqkXf9/DYRRKbHo1GgVZ0NQF6Jo9miE7SU/3xgU0Bg3Mh2TBIkBpGNyWkkxHmIIQC1Snw3WVzA8Nd/ZK/HR9KhjlkPYOzL075KDWGPVZZ2dZoB6vZCvV19UANBDAGjCEEY50SeJfLgFpQbyQvLVwRgMG5XpkZ5vH2lt2K09oKP0gZTJIZmMFQzAEUYwRwCK7FD4ugaupo6mr6ggCcjp8Iy03bI157mxCtrpVBXcnB8sqySF2UoBNwtbiBUgr5Qv5OaiQ9tF7CwLO+REfr3kCj2YIHGCSzySIejD0JPT/3Z5e6bvoyTCdvUiOvQ1UmhqZ7Sv6dBx11aIlW0iD7OTs21Z+oEnOB/9r+ywvZ9C34u40nHwdL/rYDDklCwFcNlgpLYzNn5jcANpsZ4UHvAyXRIe8JWCxbsFYs4e3LIl2jsfnzr/4JEYDjE0fCbrsn4nV5sW1oYnkVchqaWEQT0cDKHFA0VPyjke/v5YRWfJS7h2Xs9PiuHe2Ko9kJ339+gwZTg2gZbx/DORAxvnwmZqKz8PH+p98ADglEunw6YcMep0exNdlgq9UKkskEBp8FXByEEwoGgp4+moX8hFYN4JBD1/fJlBhBTLWbENZJCGlmOqvjqfP2VnaGcWGyuBFQy82snP0Ffg5KIO/aNV0AAAAASUVORK5CYII="
      "ctrl+o":
        method: ({editor}) ->
          if name = prompt("Name", "my_file")
            editor.restoreState retrieve name

        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACsklEQVQ4T6WTW0iTYRjH/3Nu002JrOmQliRTWoZFhHRR0RzbhZA3gSzJBibYRQTeRlC3RgXVTSBCBJINE0zxQJsHMC2RglirdVBnM9e3tYM7+p3W+37h6Ouim56bD97v/f/4P//nfRT4z1L8qR8fH9cUFxe35vP584IgHCT/6sTf5SVnX8i3n+M4T1tbm7CjKwCI+JBSqXxSVVXVaDAYoNPpoNVqQYRIJBJIJpMIBAJgGGaenDkIZINCCoDJyckZs9l8xmg0QqGQGSuY5HkeXq8Xfr//scPhcMoAExMTjMVi0avV6n8CYrEY3G53uL29vVIGIC1IgHg8jpKSEmg0GqhUKqmFTCaDaDSKYDAIk8kEj8cT7ujokAPGxsaY5uZmfTqdlvrN5XKSmNqmGWxvb4MEjPr6esmB0+mUA0ZHRyUAvUjFVEgFJHVEIhE88l1FlkvjmvUZZj1z4c7OTjlgZGSEsVqtemo3m81KAJoHBYTDYfT7rqB6jwm+jTewqnoi3V2X9bIMhoeHGZvNpk+lUlLP9xadyIscWJEHS2DVFXVoNJ7E0uo03gVf4/vWj/L3N5EqzGtoaIix2+1SiBRwf+kibIedEPIiBFGAiDxC8SB2l1Vi8asby4E5MbbFVhQALpdLAtC0KeDu0gW0HLmEQOQzOOKCJ244gUNRkRqV5fswvzKFVysvhQJgcHCQaWpq0pNCKBTCjZmzaD3aTYQCeEGQnGwm1lFRZsDbbwt48WEqnGZhLwAGBgZayFt3NTQ06GpqatD19DhyLEsyYJHjOdTuNeNErR3L6wuY9nt+JnPi6egd+GRvtq+v7wAZ3XUCOkf2YhfdBToN2tbDaE/+2P5TitlP05sZHpbILfhlU/h7q3t7e8tLS0tNZIzi2trax+e7HkRFUandYoXaxG2s7tz/BeoVfR66j3EiAAAAAElFTkSuQmCC"
      "ctrl+s":
        method: ({editor}) ->
          if name = prompt("Name", "my_file")
            store name, editor.saveState()

        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC"
      "ctrl+shift+s":
        method: ({editor}) ->
          editor.outputCanvas().toBlob (blob) ->
            saveAs blob, prompt("File name", "image.png")
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACs0lEQVQ4T42SS0hUURjH/2fGO2MPTC3p6VQudBEt1Bm1UWgXCEW0LNpIlk5WYoq2UYseFAmaYaRNAy2KApMkq5lRepChjJqaiUJp4cKyRTgzPsZp7jl954xEK+teDt/HPff/+57MWuwpE2DbDQx5AFLIXwuIGMbAIOgLPUa6NNARgkPnmDVp+BwKLV3rbz7QymwO7x1nVV4h6P+0rWalEVwgHKHziyvxKrMBBMTcIsdcSBcT03P6PfeEf+zrTBWzOjrH71bmprX5gqg6lCTlOH2jD9eLMxHhQKzGYNIMWCKYf0EnKzA5swAjOC64BpYkYNZZmbvucW8AFQc3qJTPNvXjyokMaEaKbjJQ6kBgUcd8iINTdq6uH8jPjENZY4+QgPDtCrvW7gugJH+9AlQ7B3GpMB2rY43QqITFMBU+r1NGEgACzCB9hxl1D96DAF7eVG5nT6mE4/sSFYA0WGM2UnSGiE7RKfWFsK7Egl6X9zt2W0xoeDQIZjvpFY2ldjzrD+Db9BQ1izpOAC2GGkewCKUcoWYsD0QFiI9PxC6LGU2twwRweEV9aQ6e9/lVrVKl5qcUAqSnyASgSy4P+QYKkrqJoeXJSBRQdyoH7gG/ov8ZPoFkw6RQzl+lT1ZIh8ApSQyujo9RwFVHFrqGAtGtoUu5Q9LqEiCjy0zI51xXO0IeLIkC991jEuARl4uy8Go4iNoj25YhK5uKllEkJwg87BwHy6Ymni+04c1IALWHk9Hw7tiK6lK7E+XNH7AlXqDt5ScClHhFTYEV3aNB1BDAN/V6RYAteS/Kbg1hc5xA+1sCUAm8usDKesYkwPJfGZy5OYCNBOjonpCb6Jk8dzRjp5zh/uzoKv/ruejyqQa/6P3yk1mL3PXU11QwsYcJJNDw1Oio3Wpsf1sZJDpWIRh4UDDjyG82p2waquUVyAAAAABJRU5ErkJggg=="
      "ctrl+e":
        method: ({editor}) ->
          paletteData = Palette.export editor.palette()
          blob = new Blob [paletteData],
            type: "text/plain"
          saveAs blob, "palette.pal"
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC/UlEQVQ4T4WTW0gUYRTH/98s4+66umYGdjHSXLesyMi18qEg7EHKsB6kIunBHoJuFBj4YNBDBEFBUUmUQS1FpaRlCEEldiEybdcSzLVMLc3bquvsdcaZ+Tq70eXBapgzhxm+8/v+3/+cYfjPdbhobVZ6WsqBOckJBeCaNioFnnweGrtWVe/6EC1l/6o/sWdjWVZa6nH7Ult66nwOcCu8I2H09XqGOvqGTje0N1f9DSBcPFLsXLYoaeeKhUbD7EwNhhQPdMWEqa+l0ONEfOpq1eqaWnfOCDh3cHP1Bkf+3uVzfWCyGxoXIGYbEJzWUT3AYTaYsU0vRFPri0czAmorS4JbwsnxPCCBFcrgphTIYj4GfR14au1A3DRDiboJ7n7PF+Z5uLrdaF2+jDHhlx3vngligV+EHg4hWFyArs4WyWoxipibbT78LQkWTcHtWR64vcOTrLvBEbEVtRgZIzHkU/TRcGovVq1bjwRRx4RPQpurUY8XBBafU8IqxtJgUQO4P9sN99iIn3Xfy/XZil8mKcNV0BQDIFjR3PgWSkCBqEewMicXfp8XokGASYng9aAX6fPSkJpowKN3rjvMczdPsm1/khgZcILrHLo8gfBoL4Kj41BHh//a5TYp403N444dBMhVFm9tFCddlyCP9FCrQjAYkzCv6AwNCcPAx3aYtBDMogmqNg1ZsEB6Wo6K+mB6XdOHfua5mafYd7eQYwrtppMFnJT4oUqvoEd6IctBjA/5ACrmLIRk+zF4a0thP9QW6yDzXHfIWaXP4/TQe5pUH4WfCvsIpNMdIWaYcoC+R4OUZJxHz9WtvwHdlx2RzLImo+ZvBlenaBGFSjtylYJmQAv+gKpSLFvsTvRcKfoDcMERtu17bJqefBArjEUM8hPmp/doMYFIkWXJLfTe2B+hI5hjR+g6u/rb4rKaeGWiJZG0C5xHZVNQ5ppMWSFbKEc94hqMC3bxfudRaUm5a1YM0Hky+wgThDWMs01gPPGff3d00BgUarczu7LzUHTtd5jOkNp6KQ05AAAAAElFTkSuQmCC"
      "ctrl+l":
        method: ({editor}) ->
          editor.execute editor.Command.NewLayer()
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB60lEQVQ4T2NkgAAZIBYHYmYoHxf1CijxCIj/wRQwQhnGP3782MvMzMzLyMjIhE33nz9/GGbNmjUpLy+vH9kQmAFmv3//Pv7z508moAFw/SBN//79Y/j16xeDsLAww+vXrxnWrl07KScnB24ISDUImwIVnwQawsDExATWBAIgA/7+/Qs2QEhICEyD5BYvXjwpMzMTZMgDFANAimEApPD///9gQ4AuYxAUFETxGQsLizlQ4DSKASANMC+A2CADQRhkCMh1IENBbDExMQasBqAHHrIhMMNAhvDz8xNnAMhAmCEgjSBDQHwuLi7iDQAZAgsPWBixsbGRZgDI1l1n1zPsv7CV4ePX9wy///xmuH39zsyjC25nogQichiANMHA1hMrGS4838NgrGXCICukyrDvygaGE1cOM9y/86aXoAEgg9In+DP4e7oBEzoTg79mHkPPnlRgmmdiWLFu0w+cBsACEEQH1JsyZEVlM3hpp8BdtenyVIbWGS3gVAhLiSegbIys4FSiyuDj6cAATNgMlW4LGNp3JjBwMLPDXQDSYAJMbQeBmYkDyMbITDO3dDLsvb2IwUrPhkFV0pDh9vPzDMcuHWF4fP8jOAxAQBaIQdkZa04EKdCJFM7m4GcNAWYVLmCS+Pbn+5+FFxa+yQIAB8Ulv4JKPAEAAAAASUVORK5CYII="
      "ctrl+r":
        method: ({editor}) ->
          if newSize = prompt("New Size (WxH)", "32x32")
            [width, height] = newSize.split("x").map (v) -> parseInt v, 10

          editor.execute editor.Command.Resize({width, height})
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACLElEQVQ4T91Tz2sTQRR+05hmTTeB0iS7h8ZjLyEKgoVehCLWFG0g0ahrMEpp6rH++EMUFH8UUbRIq7ZZ21qoh14UjfQiQkXpQWKSJmlcyzZmY3fj7DhjGklK+g/4YBjmzX7fvve9+dC15CUCNIhJgBC66H7j8H3EcjsjvhAlJr03TRNMXNsRIzjU2UcPGJaV5K5gRibNSoKjzVrwu/cDQgiSqXeArr4dJQc7e6FS1UDRFchpWflW/8Pwzr8zsI2QVS/vdXIWDuxWHpYz7wFdeRMnFmQFgRNBtImQKqcg/zMr3x543ERyQT6reB3dXZ4OAVIb3yC3uVZrYez1CNEMTeQQt9rN73Pqhg758tqru4MTgcYqzk9H5oUO8YSJTciVcvLUOTl86tEQ+SfWCC3Rutf6iYqUvBeYGGolojQVXqQiVxi4ft9S7Vbg3XL/G0FsJpLA2LQ/OT3TNIF6/8HxwXmCcV9Fx76ly0vrLI+G5yTyIDiJGNjFeUJstvlS/uXT6IumSQTHA4tu3nPMgiyQVjKlKiY9FiAFdFE+8/d9uzg3CHYRiloR0hvpH89js65G5Y/fGUi4HZ6Q6KTfbBZhXS2AXjUAxaYjxNflB/WXCjrWIatmSltbWs9cvFZiYwRuHknQKkLt7XuAtzlhJbUCKPrsJPG7DoDx24Av3z9DuaKKrcB1oqPX+4nP64M2aqYPXz8CkibDtAVmT7q2rSoPL7R8HwzM7G5u257Z/w969A/vqEbP0wAAAABJRU5ErkJggg=="
      "ctrl+b":
        method: ({editor}) ->
          # Hacky write to localStorage
          try
            images = JSON.parse localStorage.images
          catch
            images = {}

          if name = prompt("Store image in local storage", "image_name")
            images[name] = editor.outputCanvas().toDataURL("image/png")
            localStorage.images = JSON.stringify images

        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC0ElEQVQ4T6WSaUhUURTH/29cMlzGbUbScZkKTNDUPqjlAhEkmZCZJYgVSvnBDxGlpEJGJBIpBhUarS6VSQVK0IKDC+rkEqiYjpNbYqONjtu4zDi+92533lTalyg6cPnfc+49v3vuuZfBfxpjzq9sms8nhJzlQGQ8z4PjAdasdMLxBCzVjcGBY2mM57qun/IPEwDljXMzSRGO7v9STH718FpJeoCdAHjYoCPJe8WoHS2nZJaexmKd6jq3blGWKo39XMvdV4i8KjVuZQQyAuCeYoakRDrD3s76r4pYMbLIfjyAssxgC6DsvZacjHFFXdfcHwGuphbIv72AlUMQVnTNYFa/nhYAt99MkbT97gIgJVqKmlYtkqM8fsFetmsR59sOvUqJrZJoiOV7sDCmxOC7+1oBUPJaQ84ckOBt9zxE5oCIAQMChjpm38mgQIhkCA5OoZgbVkPsvgO2jlKoGiqMAqCodoJkHPSAom8BiWES1HbOIIGq2Yy01FWtAs7bY7E29RyGWQbTg6vQr1L0yqS/ACh8NU4yY7ehWbUAS1cs5mBoQ4hzB8Q7j8CoKYPIlr7Isi90HQMonkpFad5xy/arNWPkXJwnPgwt4lCoBPW9OgTZttETlJAGHqXJpRDZsDAtyTHb1gtT+BUUKnhUZkVYAJerR8iFeBk6R/T07gA/WQ9vUTd2xcTDpK0AY2WCcVGG6ZYejO4uhp+PDNeq+/H0UqQFkFulJtkJfuge00Omrwe72AeWkcLNrQ0uUlua7I2Fj2p4J92BjdgL6olFFNb0ozL7ByCrXEVyE+XCv2+8exgnMh9BXX0Rmi9KbPEJBr/MQxJ7A4yz36/+FDz7xD/JibISKjj/oL+VY7kQE0fsPXtSkZOeQd+PQ099LYbHJ9AoK8CsyGuju3Q2rzfUNRXFJmzquWU9KcrFECqXWocH+IG3MSmXJjVpx25+Hv0te5PzHS7ETRuBCPcLAAAAAElFTkSuQmCC"

      "+":
        method: ({editor}) ->
          currentSize = editor.pixelSize()
          if currentSize < 32
            editor.pixelSize(currentSize*2)
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbklEQVQ4T6WTbWhSURjH/15fptPltJm2pJkGLRdUNAZBY/TycZ8EI6LojWAUYxBBtL74KSKCYDSEiCihDBcEvdArgy2C1WRbc6GN3jaXIpMcvl7vvefa8YarMT8IXe45l8u9z+/8zvM8R4b/vGSVeI/Hw3Qe6R8UiNhNiNhMn+AFISYIwtPwsxtn6Xex2loSQAo+3D/cqC51GeplUDAlgN6sUMJ8ksVcIj8SHb25rxpEArye5bwGtdhj1jHIFAlYvgRCAUoGaKiTY2C6Dzk2Da7Asz73kOZfEwnwPJyPbmmSW1lBRJ4rQSzRQYWpAOoUMng/nsQBy1Y8CgcxdOzJ8rbLsdLL41CWbG9WMotZAiKWATSYToFv55HJpWBW6mBf04TJhR/4Go+jyHKp0UtjxmXAw4klsmujhklkBAoA1f9jcHv6BDrNDroljo4izUkRBa6IN+MhfLg8JS0uTffHktGdLVprjurnOFEyKJvcm+zFr3QcRpUGVqMen+YWMP9zEcUCx4YGIlIuJMCdkbh3nV7V47BokcoTZMsQalCnlMGgkaP37l7scGzA2+AsJq6FVuegXEZTx/Fhy1p1l83SAJWCQbnoBVZA6EsSvndHkcmmoOaJeE6jcx68GvxcqcSKRtJsOzTI8aSbF2gj8QScQOImdobbrw9tsjo7EIuMIxJ8lSxw6T2nvN8lyAqdap0WcLeplPZGv6ml1WVz7kY08h4zwRfJ07eippoAUqdSyGaz6Dfb2lz21na8DFzHGV/ibxVqOU8eN1QW7Xq/QqV25TJLV/r8qYs1G1QWcLshb5fXmy88yMdWJbEWi2r//AZSUiAguj/HUQAAAABJRU5ErkJggg=="

      "-":
        method: ({editor}) ->
          currentSize = editor.pixelSize()
          if currentSize > 1
            editor.pixelSize(currentSize/2)
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACVElEQVQ4T6WTS2gTURSG/0zejaVNbUws0aZVamgFFUtUiBQUF2JXgYiIC0GEqovufBTELNWFblpSxIUPMFK6EsVaMVBXPoIuUkwqbUXHJA0GE5vMdDKZO+OdkaQqkQYc5twLdzjf+bjnjA7/+eiq+aFQiNl/YmRMIvIgIXIH3VGRpLQkSY8TT0bP0e9yvVoaQEs+PhJttSgD9iYdDIwC0FeQFHzJCfic5WfYl7cO1INogOcfxbDdIg851zEolgmEigJCAUYGaDbrkUgVsZAujg8f6Trzt4UGeJrg2W3tercgyeBFBbJCgwpTAZgNOhh1CqZjqa/nAz2b6gIexUtkR4eR+VYiILIKoMl08d2/Bn0+D7nEgfwo0VgGKahRyrfNx9tUmGYw+a5Adm+2MtmiRAGg+r8M/KMXwe/1QhbpOQ1ZEEHKFRhu3EV7ZlHL1ZYHr3Lsrk6bm6P6nChrBqrJnvErMLDsamVqodkIZcGZT1lrgDszmfCGFtPQFpcNeZ6gpEKogdmog92qx5sPS+DmXgg9hcmdhy9Pzf1+D7U2Onwno671lgGPqxkmAwO16SuChPh8Dtz3JRwyRbH4fjq3InL+o9djNcgfg2TdfmxMrJDBikQHqUIgSiTjEGbFgy3xLnevD+nkWyRjKmTZfyr8SYPUAP+a6Ilgn8nY3RpxdHoDnt59YJOvMRubyp2+zToaAmiTSiFbnXLE6ekLdHv78WziJs7ey652oZH/KRSEyWXbGDGYLAGuWLg6HMlfatigWiAYhL5f3+S88JBPV8/WvIO17H4CfCMpIEZZGWYAAAAASUVORK5CYII="

      ";":
        method: ({editor}) ->
          blob = new Blob [localStorage.images],
            type: "text/plain"
          saveAs blob, "images.json"

      "?":
        method: ({editor}) ->
          window.open("./docs")
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC7klEQVQ4T6WTW0hUQRjH/+7q6mpkbLK663ZX28pExDJLKRRKKypZiNouVoTggy+RDxEoCSEp0UNJPkSloYTdoxtYdNE2a7vRmou4mWjppuUF3T3n7Dkz03Rku9JDNPMwM8z8f3zf9/8mBP85Qn7X3+sS52kJszOGnZSxOEoJCGNeSli9pIiNBemx737W/AJodvttYPT4nOlhphDGhYSobzUaDQJ8+/aDb0AmSol9hflSEPIdcKd93MYIrbOadFFjEwI6en3o/eIDoQzGaB2SLVNhmBaBxx2jPkUhhUV5s1WICrjhHJ1LNLQl2RJh9o740ewagik6DGvTzGB8Oj0jeNE9jJXWGFhiotD86lO/oIjZB2wp3SqgqW2obGG8/pAkybjq7IckyijfuijI5ytD9ZUOBBSKvLR48Prg4Zv+8jJ7aoUKqL//sSsjaWpC69vPcH8c5WFT7NtgxeueEURFaLEsMQZtXYO42NqNJMt05CyOQ8Pdbs+RvemJKuDk7R5/bopBf+7Be4wLMmQi81oSrFsyE5nzjQjIFHde9uGJ2wt9uBZFecmoudYu1JRkRaqAo5c7/euXmvRnOWBsYpyLeeY8zKrdGRiZkFDd9BJiQOGJAHqdBsUbU1F1/pVQV5ozCahocHUVZFkSHroG4e4b5vbJoDwN7orqFpEVXgZ+5jNhRgzWLJ2FIw0vPBfK8ydTKD31rCw31XxoSqQOFx+9g08QVGHlnkzwZsL+2gfqORQUW1anYGhYQOM9d/nNyk2TRSw+1jIXGtaya43VPOqTcM3hgSAGkJZgVIXOzgFoqIz8zAUwGiJx+NzTfpGI2a3Htk3a+G1sr2y2UUbrijemRMk8dIfrA3q9w6DcuvjYaCxPtiA0VIuKMw6fTEih44T9RyMFIZsOXrcpjB3fvCrJZJ1tQLhOq14JogKXZwinb70ZkCkteV67489WDkJySs7PI9oQ9TMRhcZ9qwGhxMt7o16SWGN73a6/f6Yg5F/WrzeMbiDawgJJAAAAAElFTkSuQmCC"
