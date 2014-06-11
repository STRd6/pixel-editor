(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "pixel-editor\n============\n\nIt edits pixels\n",
      "mode": "100644",
      "type": "blob"
    },
    "TODO.md": {
      "path": "TODO.md",
      "content": "TODO\n====\nReplay\n\nTool cursors\n\nPalette\n  Load Palette\n  Modify Palette\n\nDocumentation\n\nAutosave\n\nBugs\n----\nPreview and layers get cut off for larger images\n\nOpening an image that is smaller than the canvas grid spacing issues\n\nV2\n----\nLayers\n  Reorder Layers\n  Delete Layers\n\nSync to server?\n\nAnimation Frames\n  New Frame\n  Delete Frame\n  Onion Skin\n\nSelections\n\nCopy/Paste\n\nReplays\n\nGrid\n  Modify Grid Size\n\nCommand Console\n\nScripts\n\nPlugins\n\nDone\n====\nComposite Preview\n\nZoom In/Out\n\nResize Image\n\nExport Image\n\nLoad Image\nSave Image\n\nSave Files to desktop\n  .json\n\nExport to desktop\n  .png\n\nOpen files from a file picker\n  .json\n  .png or .jpeg\n\nBugs\n----\n\nExpand canvas when dropping an larger image\n\nPreview Erase/Transparent\n\nPreview Layer in canvas always shows at top\n",
      "mode": "100644",
      "type": "blob"
    },
    "actions.coffee.md": {
      "path": "actions.coffee.md",
      "content": "Actions\n=======\n\n    ByteArray = require \"byte_array\"\n    Facebook = require \"facebook\"\n    FileReading = require(\"./file_reading\")\n    Hotkeys = require \"hotkeys\"\n    Modal = require(\"./modal\")\n    Palette = require(\"./palette\")\n    saveAs = require \"./lib/file_saver\"\n\n    module.exports = Actions = (I={}, self=Core(I)) ->\n      self.include Hotkeys\n\n      self.extend\n        addAction: (action) ->\n          self.actions.push action\n\n        actions: Observable []\n\n      Object.keys(Actions.defaults).forEach (hotkey) ->\n        {method, icon, name} = Actions.defaults[hotkey]\n\n        self.addAction\n          perform: ->\n            if typeof method is \"function\"\n              method\n                editor: self\n            else\n              self[method]()\n          name: name\n          iconUrl: icon\n          hotkey: hotkey\n\n        self.addHotkey hotkey, method\n\n      return self\n\n    state = null\n\n    Actions.defaults =\n      \"ctrl+z\":\n        name: \"Undo\"\n        method: \"undo\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVQ4T6VTXUhTYRh+p47sbhcR2zmMDGXUTVBBiyBdJUjU6EJ2K4R0ESm6CyEo6qKZWcGkoC6KFt2GxKhwi4JKbcg2khmonVW6RbmGnnI1z873c3rPjp6aQQw88PJ834H3+b73eZ7PAhv8LBvsB5PAP3pK45wDZxyYXpQZSBjHWiSUJTmlUaVQGg6feZZdO9gk6HnZqXnEw6BpAFxjWBowRGwHhSgg/5RhQc6B9FkKq0ppMOJ/FdNJTIKuFye1Q84jwLGBAzbrqOENyiQciuQX1NVYIbOQgcR0IqwUV7pfn49nTYLT0Q7NuDYDShBxTfU9rgWbCA32BrDWWZGQQ2o2Be8/Sv7RCxNDVYnovdUaJCptb9njcTILhe/yDxiPxyKxS4mjVRHos7ZeOxh0bXP1ig4RiKrCk+eRfGJgcmsFgc8HteD1nn3Y8bh/vb3Nl93BHdt39oqCAKpK4Gl0JD95/d06ggfeECV076POkV1/EzQH3EHUpL3lgMdJawgsLxVgfOxNZOrGzJ8RfPeP3XTYxC5duLmvn8pCIpkhoh1FdKKIm6zoEoqYmgJpVvJP304bIvpCx6/abY6+JrHJtFB3Y81CHQulZaiv3QzzmSwk44mwulLs/hD6Yth44k5bQLAJ5xqdjeg9GBnAouUsYJAUBRblJcjlvkF6RgqjI4Ppe/OVQWoLeoaELY4eivGdy6yOsJoDHCWPoyUZoVFKlGH95H+irP/wBPbfpYztG7sYrxDxfw+uMgdoo9u1u2+i/+2Val/pb35FXyDc5lZBAAAAAElFTkSuQmCC\"\n\n      \"ctrl+y\":\n        name: \"Redo\"\n        method: \"redo\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUUlEQVQ4T6WTUUhTURjHv+scNheypmOy7RY0H7IHC6Rgo/ItB0GXWIgSBUOJMIRFkEUlBEWBDzOsXnoQpIdqTUlrQ6k9NPBhUeCaFO0udxuB7bVc5D3n3L5zYNZSiNG9nHu+C+f/4/v+33ck+M9HqkXf9/DYRRKbHo1GgVZ0NQF6Jo9miE7SU/3xgU0Bg3Mh2TBIkBpGNyWkkxHmIIQC1Snw3WVzA8Nd/ZK/HR9KhjlkPYOzL075KDWGPVZZ2dZoB6vZCvV19UANBDAGjCEEY50SeJfLgFpQbyQvLVwRgMG5XpkZ5vH2lt2K09oKP0gZTJIZmMFQzAEUYwRwCK7FD4ugaupo6mr6ggCcjp8Iy03bI157mxCtrpVBXcnB8sqySF2UoBNwtbiBUgr5Qv5OaiQ9tF7CwLO+REfr3kCj2YIHGCSzySIejD0JPT/3Z5e6bvoyTCdvUiOvQ1UmhqZ7Sv6dBx11aIlW0iD7OTs21Z+oEnOB/9r+ywvZ9C34u40nHwdL/rYDDklCwFcNlgpLYzNn5jcANpsZ4UHvAyXRIe8JWCxbsFYs4e3LIl2jsfnzr/4JEYDjE0fCbrsn4nV5sW1oYnkVchqaWEQT0cDKHFA0VPyjke/v5YRWfJS7h2Xs9PiuHe2Ko9kJ339+gwZTg2gZbx/DORAxvnwmZqKz8PH+p98ADglEunw6YcMep0exNdlgq9UKkskEBp8FXByEEwoGgp4+moX8hFYN4JBD1/fJlBhBTLWbENZJCGlmOqvjqfP2VnaGcWGyuBFQy82snP0Ffg5KIO/aNV0AAAAASUVORK5CYII=\"\n\n      \"ctrl+o\":\n        name: \"Open\"\n        description: \"\"\"\n          Open an image file from your local filesystem.\n        \"\"\"\n        method: ({editor}) ->\n          Modal.show FileReading.readerInput\n            image: (dataURL) ->\n              editor.fromDataURL(dataURL)\n            json: (data) ->\n              editor.restoreState data\n            text: ->\n              # TODO: Currently we don't handle this format\n            chose: ->\n              Modal.hide()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACwklEQVQ4T31TXUgUURT+7mzr5taaL9ofgdm6YtZDuvqg0UOED2lGYUQkhathCoblT1KSBlJhuyksZj0EKflQtlaaT1pKtIIQUZmiPqhpmBn4s7o6zjpzO7OumqAd+OYcZs75zjnfncuwgWWU1p/mnFUxxnZwMICrid7HqnFeTV/Wt4wSh7vo4iF9cFAQGNvkLfUoDIo3nUNelHCjslWlXt/SSxz8QV4Csmw1MIaFrSRpBIbh3i7czctGobX5/wSVBcdhbXiHA3FHoBE0EDRaCIKA7x3tsCTEE8HbjQnSbr3klYWJqGp24uDhozT16v5dzjakJcQhv5wI+pqivugCIvczJvyrDkpakrW2gkRk3ndgT2Tc0ubykgIjPR2wX0vB1fJGsP5Gs2hM6tSR2qtKU3yh2IGKwiRkVzQRQfwaoUa6najIScKVO6+JwBE9ZTz5cZs09hCypAGEAFLdgPRqBfaiZKTk3kNwSOQagvGhbtRZryOrrIFWeB7jMp5qNYg/a8EVDmVhAh73b4wOjSMwIBAKV8cmeDVQoEgyJL12fmvUY/9Lt+tVgmgp9ESzdnagHlyahcf1B4aIsxiZ24m9uwJpGvWkqdhLQNAYMNyaJhli7ZrUm6+mWd+zGMl0vlNL1CudaA78GhvA9LiTfhg3FHkW3ENQ5uG33YKRtlLJ+vWMS1bkFNb31LwQlvrBT5n7RipPEWbAF6egeCYpngYoVj2XXQQ3/ENsGKjPEE2WT/6qMKz/kVncZ3mvk2faqVBNJKhF3phIFtXCZbihNz7BYN1l0ZS1TGA3zxszWzZ7Jt/4Cn0dV8hoIl93rojYEl6HwZps0ZTjI+i1RY2GWl7opYlOAxRR4FwksQnkubxAXiL9yKsacRm63ef4j9qrrvD8z4HeFXrKInKZIMQyzo6BccNGl8t3CakCEh13bURxT4767i/ium6v2KS7zgAAAABJRU5ErkJggg==\"\n\n      \"ctrl+s\":\n        name: \"Save\"\n        description: \"\"\"\n          Download image to your local filesystem.\n        \"\"\"\n        method: ({editor}) ->\n          if name = prompt(\"File name\", \"image\")\n            editor.outputCanvas().toBlob (blob) ->\n              saveAs blob, \"#{name}.png\"\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACs0lEQVQ4T42SS0hUURjH/2fGO2MPTC3p6VQudBEt1Bm1UWgXCEW0LNpIlk5WYoq2UYseFAmaYaRNAy2KApMkq5lRepChjJqaiUJp4cKyRTgzPsZp7jl954xEK+teDt/HPff/+57MWuwpE2DbDQx5AFLIXwuIGMbAIOgLPUa6NNARgkPnmDVp+BwKLV3rbz7QymwO7x1nVV4h6P+0rWalEVwgHKHziyvxKrMBBMTcIsdcSBcT03P6PfeEf+zrTBWzOjrH71bmprX5gqg6lCTlOH2jD9eLMxHhQKzGYNIMWCKYf0EnKzA5swAjOC64BpYkYNZZmbvucW8AFQc3qJTPNvXjyokMaEaKbjJQ6kBgUcd8iINTdq6uH8jPjENZY4+QgPDtCrvW7gugJH+9AlQ7B3GpMB2rY43QqITFMBU+r1NGEgACzCB9hxl1D96DAF7eVG5nT6mE4/sSFYA0WGM2UnSGiE7RKfWFsK7Egl6X9zt2W0xoeDQIZjvpFY2ldjzrD+Db9BQ1izpOAC2GGkewCKUcoWYsD0QFiI9PxC6LGU2twwRweEV9aQ6e9/lVrVKl5qcUAqSnyASgSy4P+QYKkrqJoeXJSBRQdyoH7gG/ov8ZPoFkw6RQzl+lT1ZIh8ApSQyujo9RwFVHFrqGAtGtoUu5Q9LqEiCjy0zI51xXO0IeLIkC991jEuARl4uy8Go4iNoj25YhK5uKllEkJwg87BwHy6Ymni+04c1IALWHk9Hw7tiK6lK7E+XNH7AlXqDt5ScClHhFTYEV3aNB1BDAN/V6RYAteS/Kbg1hc5xA+1sCUAm8usDKesYkwPJfGZy5OYCNBOjonpCb6Jk8dzRjp5zh/uzoKv/ruejyqQa/6P3yk1mL3PXU11QwsYcJJNDw1Oio3Wpsf1sZJDpWIRh4UDDjyG82p2waquUVyAAAAABJRU5ErkJggg==\"\n\n      \"ctrl+r\":\n        name: \"Resize\"\n        description: \"\"\"\n          Resize\n        \"\"\"\n        method: ({editor}) ->\n          {width, height} = editor.pixelExtent()\n\n          if newSize = prompt(\"New Size (WxH)\", \"#{width}x#{height}\")\n            [width, height] = newSize.split(\"x\").map (v) -> parseInt v, 10\n\n            editor.execute editor.Command.Resize({width, height})\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACLElEQVQ4T91Tz2sTQRR+05hmTTeB0iS7h8ZjLyEKgoVehCLWFG0g0ahrMEpp6rH++EMUFH8UUbRIq7ZZ21qoh14UjfQiQkXpQWKSJmlcyzZmY3fj7DhjGklK+g/4YBjmzX7fvve9+dC15CUCNIhJgBC66H7j8H3EcjsjvhAlJr03TRNMXNsRIzjU2UcPGJaV5K5gRibNSoKjzVrwu/cDQgiSqXeArr4dJQc7e6FS1UDRFchpWflW/8Pwzr8zsI2QVS/vdXIWDuxWHpYz7wFdeRMnFmQFgRNBtImQKqcg/zMr3x543ERyQT6reB3dXZ4OAVIb3yC3uVZrYez1CNEMTeQQt9rN73Pqhg758tqru4MTgcYqzk9H5oUO8YSJTciVcvLUOTl86tEQ+SfWCC3Rutf6iYqUvBeYGGolojQVXqQiVxi4ft9S7Vbg3XL/G0FsJpLA2LQ/OT3TNIF6/8HxwXmCcV9Fx76ly0vrLI+G5yTyIDiJGNjFeUJstvlS/uXT6IumSQTHA4tu3nPMgiyQVjKlKiY9FiAFdFE+8/d9uzg3CHYRiloR0hvpH89js65G5Y/fGUi4HZ6Q6KTfbBZhXS2AXjUAxaYjxNflB/WXCjrWIatmSltbWs9cvFZiYwRuHknQKkLt7XuAtzlhJbUCKPrsJPG7DoDx24Av3z9DuaKKrcB1oqPX+4nP64M2aqYPXz8CkibDtAVmT7q2rSoPL7R8HwzM7G5u257Z/w969A/vqEbP0wAAAABJRU5ErkJggg==\"\n\n      \"ctrl+shift+c\":\n        name: \"Clear\"\n        description: \"\"\"\n          Clear image\n        \"\"\"\n        method: ({editor}) ->\n          command = editor.Command.Composite()\n          editor.execute command\n\n          # Kind of a hack, just removing the top layer and adding a new one\n          command.push editor.Command.RemoveLayer(editor.layer().toJSON())\n          command.push editor.Command.NewLayer()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAC4SURBVCjPdZFbDsIgEEWnrsMm7oGGfZrohxvU+Iq1TyjU60Bf1pac4Yc5YS4ZAtGWBMk/drQBOVwJlZrWYkLhsB8UV9K0BUrPGy9cWbng2CtEEUmLGppPjRwpbixUKHBiZRS0p+ZGhvs4irNEvWD8heHpbsyDXznPhYFOyTjJc13olIqzZCHBouE0FRMUjA+s1gTjaRgVFpqRwC8mfoXPPEVPS7LbRaJL2y7bOifRCTEli3U7BMWgLzKlW/CuebZPAAAAAElFTkSuQmCC\"\n\n      \"+\":\n        name: \"Zoom In\"\n        description: \"\"\"\n          Zoom in\n        \"\"\"\n        method: ({editor}) ->\n          currentSize = editor.pixelSize()\n          if currentSize < 32\n            editor.pixelSize(currentSize*2)\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbklEQVQ4T6WTbWhSURjH/15fptPltJm2pJkGLRdUNAZBY/TycZ8EI6LojWAUYxBBtL74KSKCYDSEiCihDBcEvdArgy2C1WRbc6GN3jaXIpMcvl7vvefa8YarMT8IXe45l8u9z+/8zvM8R4b/vGSVeI/Hw3Qe6R8UiNhNiNhMn+AFISYIwtPwsxtn6Xex2loSQAo+3D/cqC51GeplUDAlgN6sUMJ8ksVcIj8SHb25rxpEArye5bwGtdhj1jHIFAlYvgRCAUoGaKiTY2C6Dzk2Da7Asz73kOZfEwnwPJyPbmmSW1lBRJ4rQSzRQYWpAOoUMng/nsQBy1Y8CgcxdOzJ8rbLsdLL41CWbG9WMotZAiKWATSYToFv55HJpWBW6mBf04TJhR/4Go+jyHKp0UtjxmXAw4klsmujhklkBAoA1f9jcHv6BDrNDroljo4izUkRBa6IN+MhfLg8JS0uTffHktGdLVprjurnOFEyKJvcm+zFr3QcRpUGVqMen+YWMP9zEcUCx4YGIlIuJMCdkbh3nV7V47BokcoTZMsQalCnlMGgkaP37l7scGzA2+AsJq6FVuegXEZTx/Fhy1p1l83SAJWCQbnoBVZA6EsSvndHkcmmoOaJeE6jcx68GvxcqcSKRtJsOzTI8aSbF2gj8QScQOImdobbrw9tsjo7EIuMIxJ8lSxw6T2nvN8lyAqdap0WcLeplPZGv6ml1WVz7kY08h4zwRfJ07eippoAUqdSyGaz6Dfb2lz21na8DFzHGV/ibxVqOU8eN1QW7Xq/QqV25TJLV/r8qYs1G1QWcLshb5fXmy88yMdWJbEWi2r//AZSUiAguj/HUQAAAABJRU5ErkJggg==\"\n\n      \"-\":\n        name: \"Zoom Out\"\n        description: \"\"\"\n          Zoom out\n        \"\"\"\n        method: ({editor}) ->\n          currentSize = editor.pixelSize()\n          if currentSize > 1\n            editor.pixelSize(currentSize/2)\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACVElEQVQ4T6WTS2gTURSG/0zejaVNbUws0aZVamgFFUtUiBQUF2JXgYiIC0GEqovufBTELNWFblpSxIUPMFK6EsVaMVBXPoIuUkwqbUXHJA0GE5vMdDKZO+OdkaQqkQYc5twLdzjf+bjnjA7/+eiq+aFQiNl/YmRMIvIgIXIH3VGRpLQkSY8TT0bP0e9yvVoaQEs+PhJttSgD9iYdDIwC0FeQFHzJCfic5WfYl7cO1INogOcfxbDdIg851zEolgmEigJCAUYGaDbrkUgVsZAujg8f6Trzt4UGeJrg2W3tercgyeBFBbJCgwpTAZgNOhh1CqZjqa/nAz2b6gIexUtkR4eR+VYiILIKoMl08d2/Bn0+D7nEgfwo0VgGKahRyrfNx9tUmGYw+a5Adm+2MtmiRAGg+r8M/KMXwe/1QhbpOQ1ZEEHKFRhu3EV7ZlHL1ZYHr3Lsrk6bm6P6nChrBqrJnvErMLDsamVqodkIZcGZT1lrgDszmfCGFtPQFpcNeZ6gpEKogdmog92qx5sPS+DmXgg9hcmdhy9Pzf1+D7U2Onwno671lgGPqxkmAwO16SuChPh8Dtz3JRwyRbH4fjq3InL+o9djNcgfg2TdfmxMrJDBikQHqUIgSiTjEGbFgy3xLnevD+nkWyRjKmTZfyr8SYPUAP+a6Ilgn8nY3RpxdHoDnt59YJOvMRubyp2+zToaAmiTSiFbnXLE6ekLdHv78WziJs7ey652oZH/KRSEyWXbGDGYLAGuWLg6HMlfatigWiAYhL5f3+S88JBPV8/WvIO17H4CfCMpIEZZGWYAAAAASUVORK5CYII=\"\n\n      \"g\":\n        name: \"Toggle Grid\"\n        description: \"\"\"\n          Toggle Grid\n        \"\"\"\n        method: ({editor}) ->\n          editor.grid.toggle()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVQ4T2NkoBAwUqifAZsB/4GGIovj5VPVAJBNpAJGqroAZvtoGDAwjIYBFcKApOQMANUmIRHQ0q3yAAAAAElFTkSuQmCC\"\n\n      \"?\":\n        name: \"Help\"\n        method: ({editor}) ->\n          window.open(\"./docs\")\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC7klEQVQ4T6WTW0hUQRjH/+7q6mpkbLK663ZX28pExDJLKRRKKypZiNouVoTggy+RDxEoCSEp0UNJPkSloYTdoxtYdNE2a7vRmou4mWjppuUF3T3n7Dkz03Rku9JDNPMwM8z8f3zf9/8mBP85Qn7X3+sS52kJszOGnZSxOEoJCGNeSli9pIiNBemx737W/AJodvttYPT4nOlhphDGhYSobzUaDQJ8+/aDb0AmSol9hflSEPIdcKd93MYIrbOadFFjEwI6en3o/eIDoQzGaB2SLVNhmBaBxx2jPkUhhUV5s1WICrjhHJ1LNLQl2RJh9o740ewagik6DGvTzGB8Oj0jeNE9jJXWGFhiotD86lO/oIjZB2wp3SqgqW2obGG8/pAkybjq7IckyijfuijI5ytD9ZUOBBSKvLR48Prg4Zv+8jJ7aoUKqL//sSsjaWpC69vPcH8c5WFT7NtgxeueEURFaLEsMQZtXYO42NqNJMt05CyOQ8Pdbs+RvemJKuDk7R5/bopBf+7Be4wLMmQi81oSrFsyE5nzjQjIFHde9uGJ2wt9uBZFecmoudYu1JRkRaqAo5c7/euXmvRnOWBsYpyLeeY8zKrdGRiZkFDd9BJiQOGJAHqdBsUbU1F1/pVQV5ozCahocHUVZFkSHroG4e4b5vbJoDwN7orqFpEVXgZ+5jNhRgzWLJ2FIw0vPBfK8ydTKD31rCw31XxoSqQOFx+9g08QVGHlnkzwZsL+2gfqORQUW1anYGhYQOM9d/nNyk2TRSw+1jIXGtaya43VPOqTcM3hgSAGkJZgVIXOzgFoqIz8zAUwGiJx+NzTfpGI2a3Htk3a+G1sr2y2UUbrijemRMk8dIfrA3q9w6DcuvjYaCxPtiA0VIuKMw6fTEih44T9RyMFIZsOXrcpjB3fvCrJZJ1tQLhOq14JogKXZwinb70ZkCkteV67489WDkJySs7PI9oQ9TMRhcZ9qwGhxMt7o16SWGN73a6/f6Yg5F/WrzeMbiDawgJJAAAAAElFTkSuQmCC\"\n\n    Actions.extras =\n      \"ctrl+b\":\n        name: \"To LocalStorage\"\n        description: \"\"\"\n          Save image base64 encodeded dataURL to localStorage.\n        \"\"\"\n        method: ({editor}) ->\n          # Hacky write to localStorage\n          try\n            images = JSON.parse localStorage.images\n          catch\n            images = {}\n\n          if name = prompt(\"Store image in local storage\", \"image_name\")\n            images[name] = editor.outputCanvas().toDataURL(\"image/png\")\n            localStorage.images = JSON.stringify images\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC0ElEQVQ4T6WSaUhUURTH/29cMlzGbUbScZkKTNDUPqjlAhEkmZCZJYgVSvnBDxGlpEJGJBIpBhUarS6VSQVK0IKDC+rkEqiYjpNbYqONjtu4zDi+92533lTalyg6cPnfc+49v3vuuZfBfxpjzq9sms8nhJzlQGQ8z4PjAdasdMLxBCzVjcGBY2mM57qun/IPEwDljXMzSRGO7v9STH718FpJeoCdAHjYoCPJe8WoHS2nZJaexmKd6jq3blGWKo39XMvdV4i8KjVuZQQyAuCeYoakRDrD3s76r4pYMbLIfjyAssxgC6DsvZacjHFFXdfcHwGuphbIv72AlUMQVnTNYFa/nhYAt99MkbT97gIgJVqKmlYtkqM8fsFetmsR59sOvUqJrZJoiOV7sDCmxOC7+1oBUPJaQ84ckOBt9zxE5oCIAQMChjpm38mgQIhkCA5OoZgbVkPsvgO2jlKoGiqMAqCodoJkHPSAom8BiWES1HbOIIGq2Yy01FWtAs7bY7E29RyGWQbTg6vQr1L0yqS/ACh8NU4yY7ehWbUAS1cs5mBoQ4hzB8Q7j8CoKYPIlr7Isi90HQMonkpFad5xy/arNWPkXJwnPgwt4lCoBPW9OgTZttETlJAGHqXJpRDZsDAtyTHb1gtT+BUUKnhUZkVYAJerR8iFeBk6R/T07gA/WQ9vUTd2xcTDpK0AY2WCcVGG6ZYejO4uhp+PDNeq+/H0UqQFkFulJtkJfuge00Omrwe72AeWkcLNrQ0uUlua7I2Fj2p4J92BjdgL6olFFNb0ozL7ByCrXEVyE+XCv2+8exgnMh9BXX0Rmi9KbPEJBr/MQxJ7A4yz36/+FDz7xD/JibISKjj/oL+VY7kQE0fsPXtSkZOeQd+PQ099LYbHJ9AoK8CsyGuju3Q2rzfUNRXFJmzquWU9KcrFECqXWocH+IG3MSmXJjVpx25+Hv0te5PzHS7ETRuBCPcLAAAAAElFTkSuQmCC\"\n\n      \"ctrl+p\":\n        name: \"Share\"\n        description: \"\"\"\n          Publish picture to Facebook.\n        \"\"\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAALoElEQVRYRzVXeXBV9Rk9d31rEpJA9p1VCKBQJoEIYooOKgmKA3XBLSqiEnQcWzsSa4vOyHTRVgVG3P6onamt7bS26NRWrGwBxQpIEhCSSAiSBEjy8rb73r33/Xp+9+lL7rzlLr/zne985/t+yrZjT4m9/96DxFAMebm5iNgWXMVGwO9H2kpBz5hQdIG4mIDhV+CkMzAUH3QRhp12oQLQfQqiNs9rAjlmDgq0Emxc/WM0zlwOJaVA1RXIC12+ObAheI8QBlR+V5Y9N1u4CQdmUuWCLoRPh9D4ORFHwBcEbBWKImAbaahGBq6dgZbRoCHAp+hwnDTMkAFHsZARFtSMgM8Ko/32Dtx09RoYwgQy/OchASi6w+X5Dt0DrzQ9XSsCwo/rG27E1MpZSLoONMOEsF0EjRBU24DrunANYhcEkXEJgKAyBnTdhObTMBodRdqII5xn4pvebvzr73uw/oaHcO8tDwJpjQwQLAF4K6r84LjIOGSGIJSVW+eK0QsR/HRDB1ZceQPGwCj452OMDByawwgEFzR1pPnnI3aVT3McJ/tJ0eGqDhlIweDv+3s+xs6XtuO2lvtxV8sDfArvZYAgaO8lAQhJic53MtD8zFyRHEuTsiewdNEKRBMJmAYpTUTh15knl3SrJpJCgeWm4NNdL9ci48BQg3xegM9WMWpdRmiSjgOff4o3dr2O+25/BLetvMMjWiE0lwvqCuEoTIHgykwlw4OydMssKkxDW+vDWDhnMZKWQ2pVuFYMOQE/MhaRa0EMR1zo/iB0zeYDbOrFIgDTO28GgrAyaYQKwuj8Yh/+8t5fsablR7i5ZQ00RmtoTBUDkGlQXK7rZGAqKkLMjNL83EyRvOTgoVs2o2nBCly8FKHoiFleyRsCRgFOnBzGu3/7DIk002CnIFyJHgj7fXDsJCPUkHAE9eDns21EYwlMypkM3dDIVJIAFAiHn3mNIFCqB5NyC1FUOIUMPFslRExH202PYsn8azEWScDnY5mpLqx4GrnhUuw92Icdb35CiquQEybtpDydckD9QVFZtukUND0XaSlOgvcHQkjEU1CZKqhxMk7RuTpMitZghSUTFpJxh7/x/uU/rxZOBNjQshmNc5dhIkZqJXKXkVF8wWAR9h7ow8639mFG/dWYWlfJkmKl8E+IFAJ6mopmKWq5XJQiJXhV1cgUGSGAjJYgVxStTRYYuTw/PhHFkc+PedpSrvnF9wA2YXG9BECKCADfAQgECrFvPwG8fQgzZzegpq4kS6NqeFpQVQKw0yxNEznBEFmbgG3TyEL5SFhxai0OfygITQkzNUkE83IwEU1if+cRlidrqum5auGOk4FWApizHLEoy8nwUShpMqAgFCzAfpmC1w9i6syrUFWZA9eJUyM6jYdiZbRywdyAD6nYZS5kIT8/D7oZgkt12PSQi2MRCq6IC1swCTJOB/3f8W4aE1PW+HyNcCOCKZAMEMCEzVxJAIyOC4RDZOBgL3bsOoCaqfNQXkb3S03QDyhAUir8OUgmGaVcOBe47tpFmDGjjq4JBgJ8vK8Puz/cg5xQCQVqIEWjY2joPTcEizpSGp6flgXQutFLQRYAa5tupQoNvkAOOg8NkIFOAqhHRZkKkY7RiBkh/TzFw88eYU0M4s5112PhvDLP6xOsVmm9x7ou4b33/omgfwqVwOsZWJxl2D9IANSJ0vSLK4Q94WQBzF2CaFRqgPXPkpEO6A/k4sDhAex8/bPvANDBJACRx/MGy488aKwIjKPjJ3fCx6jJLL46OYIYG9HxnjM4eaqf5ZyLFBc0WboxK43j3f1QuI7S3DFf2Mz7htYH0TivwROKZvqYZ9asVG0ozwOwnQCqa+ejopS5Z8f0uwRAlxR0xnRyFLUlITz26CqZOUgJbfvtn9F1ahDFlZVe1zR1P7XiIkCtJFMZfNnVzyoJZAG4pH3D6vvRMHexB0CK0GGRZmijZpDu9tk5bN91GDW1VxKA7JA2izDksSS7mybiKC808dC9rVwApBl4652P8O3lGO1bRYoApBsKWnCGbdFxVHSfGfTsWVm2dQ414KLtxgfQVL8UyZidBeCkoNA0pP0ePT6EF1/8CDOnN6CiJB+plAWHTcX0G4hOjGHVyqVYsrAKYdLvZ4YYKCIWWzct/aP/nsa+A0foJwGWZIby47OZ2hNdp2hSCpRFW+qEbulZDcxeilRcqpdiSbOGWUI5tMsDB0/jzV17UV50BaZXV/NGgQk3wbmBbhmN4dbVK9DcUEqJsW1I6VB8zATVDvz+3S9wtKsX/qBkVc4BflhkrufkSS9ApXlrvbBGLbSxdS5bsBzRCFurbAN0O3+YNU+3OnS4F3945xCqS+eioqjIG0JSBKHQ40kHZk8tx7wZxWi4spq55r0EceTYNxgZT+NY9xAujEQ4NbFk5UDC1hxnjk6e6WUg7IbXPDNLuFEX97W2YfH8qxFPsFjMbFNR2I6DeYX45NMevPLSB5gzvQllBVO8XCqUu0snUNMcsawIJoddPPn4XRxiGDnDf/m1P+Hs+TGE82uQpPrZPghANg8diaSNr/sGWMZMQdOWacKwTdzT+gAWzFpIAMw9c3dh5CyGLo4gkDsZPT0R7PnwAqZWNaI8vwg2I8hQA4KHwUO1YyjMzeCpx9dxUspOPq/seB8DwzGmKczD54lPNiqFSCxWQU/voMe00vz8bDE2NI4Nazfi+mU34tzAEA4f7sTBzn24NDbGhQKkvIjzwTSUTZ6HaaXVXEQgzT7gC5jsikmWZQSVRX5s2riGOfa0xarZjW9HkqxU+j1tUY51sosKzgeca9Fz6rw3kyiNW6uFQrWsX3UHith6d/9jD/pOD6KqpAZNS5rJRghDQw7+83E/igvqUFtcxAUERSpnRCAYDtG8LqJ8ig+bH7mVPcKbtPDSq7txfiTmDSvS03Q5sFE3NueHDAF1dZ9lmbMbLnq2gl6iob6iHue/HkJ03MH6tW24oXkVJpmlzDIv7r+E9s2/Rv3sH6CAE7BCDRg+kwDIBGtO4Rhfku/Dpkdv9lZnBvGblz/A5XHOBIacnLkUdSXbctKK8gIDX3UNkBk6YePTNSKo5cAadjCzbA7a7n4YV9Uu8KjSFfYE1u3howPY+sIfUVQyHRXF+SzPGH9nCzY5vnLsTkUnUFzox5NPrPGGDIob2371PqJxoiElEoCcgmT1+AM6okkLp88MsTFRE/e+uk5cHLyI6xqu4yR7B8LaJLqczmrVPZo1ttXPvxrG5qd2oLK2HtPrKuiWoyxRA/F4nEMqBxA+uKosH/esv4aNiQ7NWF974xDOfcv2LGcLuVegFbu8TuPXSCKGvv5hMkgA5zJjnC9SKOCk4vcGa1LK5BpayNt4uAziRO842rdsR0FpHUqLJ3vzoMtzl0dH6YSjFKWcjICaqmLSys2NpuN03zDi3OhIU5Nt3VRMjhhydGOZkqZRWr7pYy+wWNRSNCbLRJUzu0yiZ2VMJMcoNnp0HhtCe8fvMK1+IYqn5FN0UXSfOO2pOp+bEfYXTrsOx7gUfSnBLmfACIS5QIi0ExAp0dk5XZudU3ZL6iLDR8vpSBEZIWy536MtejsX+ZKIsoOvt5/oPD6Cjl++jUlFFfBxAzJ0gQLigretXY2WlYs4HWctWLogq43uyRu/6wkyOjq2/Mo9htfhvfNyg8YKheLQpjR5p6SVOeemwMuTB4A3s0Bw8OgFdGx7A75gDmKXz2JGbTmefKydndHHvYPcXvAlzf/7+/hus7ZpVbKhZ/eA2S1h9sUfMqrNZDPdkgGXQ4UmOwlvkA1EtgypWhkN96E48GUffvbCTg4eJta1NOPutT8E96rshtmIaHAezfLdG7X5LIdbPDkHK3ITy2A0KSbvwixQodKkiFphT6dFy3DlV4mabsXDkG1TbuO4wIUI54VNHWhvb0fzwgqE5KIyInmb3Dp646fHg1cC1CefFPNcUUPQG+/lrlkG5rEq2EOMlAfy/zaifUZYoqDwAAAAAElFTkSuQmCC\"\n        method: ({editor}) ->\n          Facebook.requiringPermissions [\"publish_stream\"], ({accessToken, userID}) ->\n            editor.notify \"Publishing image to Facebook\"\n\n            editor.outputCanvas(8).toBlob (blob) ->\n              formData = new FormData\n              formData.append \"access_token\", accessToken\n              formData.append(\"source\", blob)\n\n              $.ajax\n                url:\"https://graph.facebook.com/\" + userID + \"/photos?access_token=\" + accessToken,\n                type:\"POST\"\n                data:formData,\n                processData:false,\n                contentType:false,\n                cache:false,\n                success: (data) ->\n                  editor.notify \"Successfully published!\"\n                error: (shr, status, data) ->\n                  editor.notify \"Error publishing image\"\n                complete: ->\n\n      \"ctrl+shift+s\":\n        description: \"\"\"\n          Download project file to your local filesystem.\n        \"\"\"\n        method: ({editor}) ->\n          if name = prompt(\"Name\", \"file\")\n            data = editor.saveState()\n\n            # TODO: We may want to save history later\n            delete data.history\n\n            blob = new Blob [JSON.stringify(data)],\n              type: \"application/json\"\n\n            saveAs blob, \"#{name}.json\"\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC\"\n\n      \"ctrl+l\":\n        description: \"\"\"\n          New layer\n        \"\"\"\n        method: ({editor}) ->\n          editor.execute editor.Command.NewLayer()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB60lEQVQ4T2NkgAAZIBYHYmYoHxf1CijxCIj/wRQwQhnGP3782MvMzMzLyMjIhE33nz9/GGbNmjUpLy+vH9kQmAFmv3//Pv7z508moAFw/SBN//79Y/j16xeDsLAww+vXrxnWrl07KScnB24ISDUImwIVnwQawsDExATWBAIgA/7+/Qs2QEhICEyD5BYvXjwpMzMTZMgDFANAimEApPD///9gQ4AuYxAUFETxGQsLizlQ4DSKASANMC+A2CADQRhkCMh1IENBbDExMQasBqAHHrIhMMNAhvDz8xNnAMhAmCEgjSBDQHwuLi7iDQAZAgsPWBixsbGRZgDI1l1n1zPsv7CV4ePX9wy///xmuH39zsyjC25nogQichiANMHA1hMrGS4838NgrGXCICukyrDvygaGE1cOM9y/86aXoAEgg9In+DP4e7oBEzoTg79mHkPPnlRgmmdiWLFu0w+cBsACEEQH1JsyZEVlM3hpp8BdtenyVIbWGS3gVAhLiSegbIys4FSiyuDj6cAATNgMlW4LGNp3JjBwMLPDXQDSYAJMbQeBmYkDyMbITDO3dDLsvb2IwUrPhkFV0pDh9vPzDMcuHWF4fP8jOAxAQBaIQdkZa04EKdCJFM7m4GcNAWYVLmCS+Pbn+5+FFxa+yQIAB8Ulv4JKPAEAAAAASUVORK5CYII=\"\n\n      \";\":\n        description: \"\"\"\n          Download localStorage images as json.\n        \"\"\"\n        method: ({editor}) ->\n          blob = new Blob [localStorage.images],\n            type: \"text/plain\"\n          saveAs blob, \"images.json\"\n\n      \".\":\n        name: \"Download\"\n        description: \"\"\"\n          Download image as base64-encoded byte array.\n        \"\"\"\n        method: ({editor}) ->\n          {width, height} = size = editor.pixelExtent()\n\n          byteArray = ByteArray(width * height)\n\n          [0...height].forEach (y) ->\n            [0...width].forEach (x) ->\n\n              # TODO: Assumes only one layer\n              {index} = editor.getPixel\n                x: x\n                y: y\n\n              byteArray.set(x + y * width, index)\n\n          blob = new Blob [JSON.stringify(byteArray)],\n            type: \"text/plain\"\n          saveAs blob, \"array.dat\"\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADh0lEQVQ4T12TbWxTVRjH/+f2dr3t+kbTdVtKGQtmyliNdhKYG5MhOkJ40YkoBjYMZhACiSTG+MGEGL9A9Isx4ktEMJlLdCEGhE1exqo1Q+KAVTokDB3UdW23dV3v1u729px7vMxIFp9vJ8/z/M/v/M/zEPwvDgZ3ruEG8SDhfKWeKgGIyAnPEJCrjNJjx5o6flzYQv47rO1bK/oNFSf1hm2bK9abXOYSZHLFyKkAZQookugd66aMsovTGba9a3vX7IPeeYH2z2uNRctr+lZ6auqbfesgKybkoWJYJijiJqRyGjhVYUYW8XwIA6MDv+cn5cauvZd0Mj0OhHZ/U+uueu0Zbx0USODMDlUt4JZshNFgQizNUShQGBQZlSUziMq9+OnOYM/3bT0byf6+1gZBFC6//USbMUyzUHTJYmYFcm7EskbkCwS3788AmorS8hQ87hE8JXlx+IdPWUGlLxH99lMbvKtaymw+3BEpBF6OSiohFBOhURHDiVkQaQoW718QpAQ0TUFgthREmcNX/WcvkAM/7462V7f4buQSmJAEVBtWYxGj6LzOoSgMjnIO2fUdxrRpnYLDSU2ojJuwvjKAd7s+jj8gyL7p32XpTIQwbsjBb9kAm2pH968aHCVzqFiSw5A2hZF8GCY+A8tEGovTFux5eiv2H39/TidozR3yt5lPRM8hDR8CjhoE+3UPzFZkkzK8ywCrJ4kZ3VA5VtBNHoBTHcG+plfQ/sVhhezr3TW6t6bFG5y4CVVqgJIWEbllQZHNDg4B0xMpKJNZHV+BwyPAWfwn3OQGmmvX4K2vP0ySN87vOLNxyerNRpMdl+KjesEjuBvxoSBYwQ1OFPT/z8spsNkMnA4Gu/gbVixVYOUSPrl4Kkjazmx7nlJ27p2GPeLJ8FkwYgTNv4CplP4MyQPGNOTG/4al9C7s0jBILIodzZtw6MsjXEfcOT9IL3duOr2qfPmWqrJluJa4B014FpNxC7jkAqUc+akYrK4OaON5PFn9GKKJMXQPXgkOHrnZNC+w5Xi9TWPmX+oWr3h8XaARt8dduH9PJyFF+gQK0E2Ar+oKHrUvxeVr/egJXx0uMNY49MFQ4uEy1R+tt5mM+Jaq2nOtDa+LYGXg3AIiELidMpKp6/js/Gmmc4foHH818lEk+XCZFq5n3XuBF6nG2xnV/Fzji/7N8Qw4+UPj2onw0UjHwvp/AEX+mWg8VyxBAAAAAElFTkSuQmCC\"\n\n      \"ctrl+e\":\n        description: \"\"\"\n          Export palette.\n        \"\"\"\n        method: ({editor}) ->\n          paletteData = Palette.export editor.palette()\n          blob = new Blob [paletteData],\n            type: \"text/plain\"\n          saveAs blob, \"palette.pal\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC/UlEQVQ4T4WTW0gUYRTH/98s4+66umYGdjHSXLesyMi18qEg7EHKsB6kIunBHoJuFBj4YNBDBEFBUUmUQS1FpaRlCEEldiEybdcSzLVMLc3bquvsdcaZ+Tq70eXBapgzhxm+8/v+3/+cYfjPdbhobVZ6WsqBOckJBeCaNioFnnweGrtWVe/6EC1l/6o/sWdjWVZa6nH7Ult66nwOcCu8I2H09XqGOvqGTje0N1f9DSBcPFLsXLYoaeeKhUbD7EwNhhQPdMWEqa+l0ONEfOpq1eqaWnfOCDh3cHP1Bkf+3uVzfWCyGxoXIGYbEJzWUT3AYTaYsU0vRFPri0czAmorS4JbwsnxPCCBFcrgphTIYj4GfR14au1A3DRDiboJ7n7PF+Z5uLrdaF2+jDHhlx3vngligV+EHg4hWFyArs4WyWoxipibbT78LQkWTcHtWR64vcOTrLvBEbEVtRgZIzHkU/TRcGovVq1bjwRRx4RPQpurUY8XBBafU8IqxtJgUQO4P9sN99iIn3Xfy/XZil8mKcNV0BQDIFjR3PgWSkCBqEewMicXfp8XokGASYng9aAX6fPSkJpowKN3rjvMczdPsm1/khgZcILrHLo8gfBoL4Kj41BHh//a5TYp403N444dBMhVFm9tFCddlyCP9FCrQjAYkzCv6AwNCcPAx3aYtBDMogmqNg1ZsEB6Wo6K+mB6XdOHfua5mafYd7eQYwrtppMFnJT4oUqvoEd6IctBjA/5ACrmLIRk+zF4a0thP9QW6yDzXHfIWaXP4/TQe5pUH4WfCvsIpNMdIWaYcoC+R4OUZJxHz9WtvwHdlx2RzLImo+ZvBlenaBGFSjtylYJmQAv+gKpSLFvsTvRcKfoDcMERtu17bJqefBArjEUM8hPmp/doMYFIkWXJLfTe2B+hI5hjR+g6u/rb4rKaeGWiJZG0C5xHZVNQ5ppMWSFbKEc94hqMC3bxfudRaUm5a1YM0Hky+wgThDWMs01gPPGff3d00BgUarczu7LzUHTtd5jOkNp6KQ05AAAAAElFTkSuQmCC\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "brushes.coffee.md": {
      "path": "brushes.coffee.md",
      "content": "Brushes\n=======\n\nA brush takes a point and returns a list of points.\n\n    module.exports =\n      pencil: (point) ->\n        [point]\n\n      brush: ({x, y}) ->\n        [\n          Point x, y - 1\n          Point x - 1, y\n          Point x, y\n          Point x + 1, y\n          Point x, y + 1\n        ]\n",
      "mode": "100644",
      "type": "blob"
    },
    "command.coffee.md": {
      "path": "command.coffee.md",
      "content": "Command\n=======\n\n    {extend} = require \"util\"\n\nCommands that can be done/undone in the editor.\n\n    module.exports = (I={}, self) ->\n      self.Command = {}\n\nThis is a weird DSL for each command to inherit a toJSON method and to register\nto be de-serialized by name.\n\n*IMPORTANT:* If the names change then old command data may fail to load in newer\nversions.\n\n      C = (name, constructor) ->\n        self.Command[name] = (data={}) ->\n          data = extend {}, data\n          data.name = name\n\n          command = constructor(data)\n\n          command.toJSON ?= ->\n            # TODO: May want to return a copy of the data to be super-duper safe\n            data\n\n          return command\n\n      C \"ChangePalette\", (data) ->\n        data.previous ?= self.palette()\n\n        execute: ->\n          self.palette data.palette\n\n        undo: ->\n          self.palette data.previous\n\n      C \"ChangePixel\", (data) ->\n        data.previous ?= self.getPixel(data).index\n\n        execute: ->\n          self.changePixel(data)\n\n        undo: ->\n          self.changePixel extend {}, data, index: data.previous\n\n      C \"Resize\", (data) ->\n        {width, height, state} = data\n\n        data.previous ?= self.pixelExtent()\n\n        state ?= self.layerState()\n\n        execute: ->\n          self.resize(data)\n\n        undo: ->\n          self.restoreLayerState state\n\n      C \"NewLayer\", (data) ->\n        execute: ->\n          self.newLayer(data)\n\n        undo: ->\n          # TODO: May need to know layer index and previously active layer\n          # index\n          self.removeLayer(data)\n\n      C \"RemoveLayer\", (data) ->\n        execute: ->\n          self.removeLayer(data)\n        undo: ->\n          self.newLayer(data)\n\n      C \"Composite\", (data) ->\n        if data.commands\n          # We came from JSON so rehydrate the commands.\n          data.commands = data.commands.map self.Command.parse\n        else\n          data.commands = []\n\n        commands = data.commands\n\n        execute: ->\n          commands.invoke \"execute\"\n\n        undo: ->\n          # Undo last command first because the order matters\n          commands.copy().reverse().invoke \"undo\"\n\n        push: (command, noExecute) ->\n          # We execute commands immediately when pushed in the compound\n          # so that the effects of events during mousemove appear\n          # immediately but they are all revoked together on undo/redo\n          # Passing noExecute as true will skip executing if we are\n          # adding commands that have already executed.\n          commands.push command\n          command.execute() unless noExecute\n\n        toJSON: ->\n          extend {}, data,\n            commands: commands.invoke \"toJSON\"\n\n      self.Command.parse = (commandData) ->\n        self.Command[commandData.name](commandData)\n",
      "mode": "100644",
      "type": "blob"
    },
    "drop.coffee.md": {
      "path": "drop.coffee.md",
      "content": "Drop and Paste Events\n=====================\n\n    require \"jquery-utils\"\n\n    Loader = require \"./loader\"\n\n    loader = Loader()\n\n    Drop = (I={}, self=Core(I)) ->\n      callback = ({dataURL}) ->\n        loader.load(dataURL)\n        .then (imageData) ->\n          # TODO This coupling seems a little too tight\n          self.handlePaste loader.fromImageDataWithPalette(imageData, self.palette())\n\n      # TODO: Scope these events to the editor, not the entire page\n      $(\"html\").dropImageReader callback\n      $(document).pasteImageReader callback\n\n    module.exports = Drop\n\nHelpers\n-------\n\n    logError = (message) ->\n      console.error message\n",
      "mode": "100644",
      "type": "blob"
    },
    "editor.coffee.md": {
      "path": "editor.coffee.md",
      "content": "Editor\n======\n\n    loader = require(\"./loader\")()\n    {defaults} = require \"util\"\n\n    TouchCanvas = require \"touch-canvas\"\n    GridGen = require \"grid-gen\"\n\n    Actions = require \"./actions\"\n    Command = require \"./command\"\n    Drop = require \"./drop\"\n    Eval = require \"eval\"\n    Layer = require \"./layer\"\n    Notifications = require \"./notifications\"\n    Postmaster = require \"postmaster\"\n    Tools = require \"./tools\"\n    Undo = require \"undo\"\n\n    Palette = require(\"./palette\")\n\n    template = require \"./templates/editor\"\n    debugTemplate = require \"./templates/debug\"\n\n    Symmetry = require \"./symmetry\"\n\n    {Size} = require \"./util\"\n\n    module.exports = (I={}, self) ->\n      defaults I,\n        selector: \"body\"\n\n      activeIndex = Observable(1)\n\n      pixelExtent = Observable Size(32, 32)\n      pixelSize = Observable 16\n      canvasSize = Observable ->\n        pixelExtent().scale(pixelSize())\n\n      symmetryMode = Observable(\"normal\")\n\n      canvas = null\n      lastCommand = null\n\n      self ?= Model(I)\n\n      self.include Actions\n      self.include Bindable\n      self.include Command\n      self.include Drop\n      self.include Eval\n      self.include Notifications\n      self.include Postmaster\n      self.include Undo\n      self.include Tools\n\n      activeTool = self.activeTool\n\n      updateActiveLayer = ->\n        # TODO: This may need to have consideration for undo-ability.\n        if self.layers.indexOf(self.activeLayer()) is -1\n          self.activeLayer self.layers().last()\n\n      drawPixel = (canvas, x, y, color, size) ->\n        # HACK for previewCanvas\n        if canvas is previewCanvas and color is \"transparent\"\n          # TODO: Background color for the canvas area\n          color = \"white\"\n\n        if color is \"transparent\"\n          canvas.clear\n            x: x * size\n            y: y * size\n            width: size\n            height: size\n        else\n          canvas.drawRect\n            x: x * size\n            y: y * size\n            width: size\n            height: size\n            color: color\n\n      self.extend\n        activeIndex: activeIndex\n        activeLayer: Observable()\n        activeLayerIndex: ->\n          self.layers.indexOf(self.activeLayer())\n\n        backgroundIndex: Observable 0\n\n        pixelSize: pixelSize\n        pixelExtent: pixelExtent\n\n        grid: Observable false\n\n        handlePaste: (data) ->\n          command = self.Command.Composite()\n          self.execute command\n\n          if data.width > pixelExtent().width or data.height > pixelExtent().height\n            command.push self.Command.Resize pixelExtent().max(data)\n\n          command.push self.Command.NewLayer(data)\n\n          self.trigger \"change\"\n\n        newLayer: (data) ->\n          makeLayer(data?.data)\n\n          self.repaint()\n\n        removeLayer: ->\n          self.layers.pop()\n          updateActiveLayer()\n\n          self.repaint()\n\n        symmetryMode: symmetryMode\n\n        outputCanvas: (scale=1)->\n          outputCanvas = TouchCanvas pixelExtent().scale(scale)\n\n          self.layers.forEach (layer) ->\n            # TODO: Only paint once per pixel, rather than once per pixel per layer\n            # by being smarter about transparency\n            layer.each (index, x, y) ->\n              outputCanvas.drawRect\n                x: x * scale\n                y: y * scale\n                width: scale\n                height: scale\n                color: self.palette()[index]\n\n          outputCanvas.element()\n\n        resize: (size) ->\n          pixelExtent Size(size)\n\n        repaint: ->\n          self.layers().first()?.each (_, x, y) ->\n            self.repaintPixel {x, y}\n\n          return self\n\n        fromDataURL: (dataURL) ->\n          loader.load(dataURL)\n          .then (imageData) ->\n            editor.handlePaste loader.fromImageDataWithPalette(imageData, editor.palette())\n\n        restoreState: (state) ->\n          self.palette state.palette\n          self.restoreLayerState(state.layers)\n\n          self.activeLayer self.layers()[state.activeLayerIndex]\n\n          self.history state.history?.map self.Command.parse\n\n        saveState: ->\n          palette: self.palette()\n          layers: self.layerState()\n          activeLayerIndex: self.activeLayerIndex()\n          history: self.history().invoke \"toJSON\"\n\n        layerState: ->\n          self.layers().invoke \"toJSON\"\n\n        restoreLayerState: (layerData) ->\n          self.pixelExtent Size layerData.first()\n\n          index = self.activeLayerIndex()\n\n          self.layers []\n\n          layerData.forEach (layerData) ->\n            makeLayer layerData.data\n\n          self.activeLayer self.layer(index)\n\n          self.repaint()\n\n        draw: (point, options={}) ->\n          {index, layer} = options\n          index ?= activeIndex()\n          layer ?= self.activeLayerIndex()\n\n          Symmetry[symmetryMode()]([point], pixelExtent()).forEach ({x, y}) ->\n            lastCommand.push self.Command.ChangePixel\n              x: x\n              y: y\n              index: index\n              layer: layer\n\n        changePixel: (params) ->\n          {x, y, index, layer} = params\n\n          self.layer(layer).set(x, y, index) unless canvas is previewCanvas\n\n          self.repaintPixel(params)\n\n        layers: Observable []\n\n        layer: (index) ->\n          if index?\n            self.layers()[index]\n          else\n            self.activeLayer()\n\n        repaintPixel: ({x, y, index:colorIndex, layer:layerIndex}) ->\n          if canvas is previewCanvas\n            # Need to get clever to handle the layers and transparancy, so it gets a little nuts\n\n            index = self.layers.map (layer, i) ->\n              if i is layerIndex # Replace the layer's pixel with our preview pixel\n                if colorIndex is 0\n                  self.layers.map (layer, i) ->\n                    layer.get(x, y)\n                  .filter (index, i) ->\n                    (index != 0) and !self.layers()[i].hidden() and (i < layerIndex)\n                  .last() or self.backgroundIndex()\n                else\n                  colorIndex\n              else\n                layer.get(x, y)\n            .filter (index, i) ->\n              # HACK: Transparent is assumed to be index zero\n              (index != 0) and !self.layers()[i].hidden()\n            .last() or self.backgroundIndex()\n          else\n            index = self.layers.map (layer) ->\n              layer.get(x, y)\n            .filter (index, i) ->\n              # HACK: Transparent is assumed to be index zero\n              (index != 0) and !self.layers()[i].hidden()\n            .last() or self.backgroundIndex()\n\n          color = self.palette()[index]\n\n          drawPixel(canvas, x, y, color, pixelSize())\n          drawPixel(thumbnailCanvas, x, y, color, 1) unless canvas is previewCanvas\n\n        getPixel: ({x, y, layer}) ->\n          x: x\n          y: y\n          index: self.layer(layer).get(x, y)\n          layer: layer ? self.activeLayerIndex()\n\n        # HACK: Adding in transparent to palette\n        palette: Observable([\"transparent\"].concat Palette.dawnBringer32)\n\nThis preview function is a little nuts, but I'm not sure how to clean it up.\n\nIt makes a copy of the current command chunk for undoing, sets the canvas\nequal to the preview canvas, then executes the passed in function.\n\nWe'll probably want to use a whole preview layer, so we don't need to worry about\naccidentally setting the pixel values during the preview.\n\n        preview: (fn) ->\n          realCommand = lastCommand\n          lastCommand = self.Command.Composite()\n          realCanvas = canvas\n          canvas = previewCanvas\n\n          canvas.clear()\n\n          fn()\n\n          canvas = realCanvas\n          lastCommand = realCommand\n\n      makeLayer = (data) ->\n        layer = Layer\n          width: pixelExtent().width\n          height: pixelExtent().height\n          data: data\n          palette: self.palette\n\n        layer.hidden.observe self.repaint\n\n        self.layers.push layer\n        self.activeLayer layer\n\n      makeLayer()\n\n      $selector = $(I.selector)\n      $(I.selector).append template self\n\n      canvas = TouchCanvas canvasSize()\n      previewCanvas = TouchCanvas canvasSize()\n      thumbnailCanvas = TouchCanvas pixelExtent()\n\n      # TODO: Tempest should have an easier way to do this\n      updateActiveColor = (newIndex) ->\n        color = self.palette()[newIndex]\n\n        $selector.find(\".palette .current\").css\n          backgroundColor: color\n\n      updateActiveColor(activeIndex())\n      activeIndex.observe updateActiveColor\n\n      $selector.find(\".viewport\")\n        .append(canvas.element())\n        .append($(previewCanvas.element()).addClass(\"preview\"))\n\n      $selector.find(\".thumbnail\").append thumbnailCanvas.element()\n\n      updateViewportCentering = (->\n        size = canvasSize()\n        $selector.find(\".viewport\").toggleClass \"vertical-center\", size.height < $selector.find(\".main\").height()\n      ).debounce(15)\n      $(window).resize updateViewportCentering\n\n      updateCanvasSize = (size) ->\n\n        [canvas, previewCanvas].forEach (canvas) ->\n          element = canvas.element()\n          element.width = size.width\n          element.height = size.height\n\n          canvas.clear()\n\n        $selector.find(\".viewport, .overlay\").css\n          width: size.width\n          height: size.height\n\n        # TODO: Should be bound directly to the template's overlay backgrond image attribute\n        if self.grid()\n          gridImage = GridGen(\n            # TODO: Grid size options and matching pixel size/extent\n          ).backgroundImage()\n\n          $selector.find(\".overlay\").css\n            backgroundImage: gridImage\n        else\n          $selector.find(\".overlay\").css\n            backgroundImage: \"none\"\n\n        updateViewportCentering()\n\n        self.repaint()\n\n      # TODO: Use auto-dependencies\n      updateCanvasSize(canvasSize())\n      canvasSize.observe updateCanvasSize\n      self.grid.observe ->\n        updateCanvasSize canvasSize()\n\n      updatePixelExtent = (size) ->\n        self.layers.forEach (layer) ->\n          layer.resize size\n\n        element = thumbnailCanvas.element()\n        element.width = size.width\n        element.height = size.height\n\n        thumbnailCanvas.clear()\n\n        self.repaint()\n\n      pixelExtent.observe updatePixelExtent\n\n      self.palette.observe ->\n        self.repaint()\n\n      canvasPosition = (position) ->\n        position.scale(pixelExtent()).floor()\n\n      previewCanvas.on \"touch\", (position) ->\n        lastCommand = self.Command.Composite()\n        self.execute lastCommand\n\n        activeTool().touch\n          position: canvasPosition position\n          editor: self\n\n      previewCanvas.on \"move\", (position) ->\n        activeTool().move\n          position: canvasPosition position\n          editor: self\n\n      previewCanvas.on \"release\", (position) ->\n        activeTool().release\n          position: canvasPosition position\n          editor: self\n\n        self.trigger \"release\"\n\n      self.on \"release\", ->\n        previewCanvas.clear()\n\n        # TODO: Think more about triggering change events\n        self.trigger \"change\"\n\n      # TODO: Extract this decorator pattern\n      [\"undo\", \"execute\", \"redo\"].forEach (method) ->\n        oldMethod = self[method]\n\n        self[method] = ->\n          oldMethod.apply(self, arguments)\n          self.trigger \"change\"\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "facebook.coffee.md": {
      "path": "facebook.coffee.md",
      "content": "Facebook\n========\n\nIntegrate with our Facebook app.\n\n    require(\"facebook\").init \"391109411021092\", null, (FB) ->\n      console.log FB\n",
      "mode": "100644",
      "type": "blob"
    },
    "file_reading.coffee.md": {
      "path": "file_reading.coffee.md",
      "content": "File Reading\n============\n\nRead files from a file input triggering an event when a person chooses a file.\n\nCurrently we only care about json, image, and text files, though we may care\nabout others later.\n\n    detectType = (file) ->\n      if file.type.match /^image\\//\n        return \"image\"\n\n      if file.name.match /\\.json$/\n        return \"json\"\n\n      return \"text\"\n\n    module.exports =\n      readerInput: ({chose, encoding, image, json, text, accept}) ->\n        accept ?= \"image/gif,image/png\"\n        encoding ?= \"UTF-8\"\n\n        input = document.createElement('input')\n        input.type = \"file\"\n        input.setAttribute \"accept\", accept\n\n        input.onchange = ->\n          reader = new FileReader()\n\n          file = input.files[0]\n\n          switch detectType(file)\n            when \"image\"\n              reader.onload = (evt) ->\n                image? evt.target.result\n\n              reader.readAsDataURL(file)\n            when \"json\"\n              reader.onload = (evt) ->\n                json? JSON.parse evt.target.result\n\n              reader.readAsText(file, encoding)\n            when \"text\"\n              reader.onload = (evt) ->\n                text? evt.target.result\n\n              reader.readAsText(file, encoding)\n\n          chose(file)\n\n        return input\n",
      "mode": "100644",
      "type": "blob"
    },
    "layer.coffee.md": {
      "path": "layer.coffee.md",
      "content": "Layer\n=====\n\nTouchCanvas, for previews.\n\n    TouchCanvas = require \"touch-canvas\"\n\nA layer is a 2d set of pixels.\n\n    {Grid} = require \"./util\"\n\n    Layer = (I={}, self=Core(I)) ->\n      # TODO: width and height as an extent\n      {width, height, palette, data} = I\n\n      pixelSize = 1\n\n      grid = Grid width, height, (x, y) ->\n        if data\n          data[x + y * width]\n        else\n          0\n\n      previewCanvas = TouchCanvas\n        width: width\n        height: height\n\n      self.extend\n        previewCanvas: previewCanvas.element()\n\n        each: grid.each\n        get: grid.get\n        hidden: Observable(false)\n\n        set: (x, y, index) ->\n          paint(x, y, index)\n\n          return grid.set x, y, index\n\n        repaint: ->\n          grid.each (index, x, y) ->\n            paint(x, y, index)\n\n        resize: (size) ->\n          {width:newWidth, height:newHeight} = size\n\n          if newHeight > height\n            grid.expand(0, newHeight - height, 0)\n          else if newHeight < height\n            grid.contract(0, height - newHeight)\n\n          height = newHeight\n\n          if newWidth > width\n            grid.expand(newHeight - width, 0, 0)\n          else if newWidth < width\n            grid.contract(width - newWidth, 0)\n\n          width = newWidth\n\n          # TODO: Move this into an observable?\n          element = previewCanvas.element()\n          element.width = width\n          element.height = height\n\n          self.repaint()\n\n        toJSON: ->\n          width: width\n          height: height\n          data: grid.toArray()\n\n      paint = (x, y, index) ->\n        color = palette()[index]\n\n        if color is \"transparent\"\n          previewCanvas.clear\n            x: x * pixelSize\n            y: y * pixelSize\n            width: pixelSize\n            height: pixelSize\n        else\n          previewCanvas.drawRect\n            x: x * pixelSize\n            y: y * pixelSize\n            width: pixelSize\n            height: pixelSize\n            color: color\n\n      if data\n        self.repaint()\n\n      return self\n\n    module.exports = Layer\n\nHelpers\n-------\n\n    previewCanvas = (width, height) ->\n      canvas = document.createElement(\"canvas\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/_hamljr_runtime.coffee": {
      "path": "lib/_hamljr_runtime.coffee",
      "content": "Observable = require \"observable\"\n\neventNames = \"\"\"\n  abort\n  blur\n  change\n  click\n  dblclick\n  drag\n  dragend\n  dragenter\n  dragleave\n  dragover\n  dragstart\n  drop\n  error\n  focus\n  input\n  keydown\n  keypress\n  keyup\n  load\n  mousedown\n  mousemove\n  mouseout\n  mouseover\n  mouseup\n  reset\n  resize\n  scroll\n  select\n  submit\n  touchstart\n  touchend\n  touchmove\n  touchenter\n  touchleave\n  touchcancel\n  unload\n\"\"\".split(\"\\n\")\n\nisEvent = (name) ->\n  eventNames.indexOf(name) != -1\n\nisFragment = (node) ->\n  node.nodeType is 11\n\nvalueBind = (element, value) ->\n  element.value = value()\n\n  # Because firing twice with the same value is idempotent just binding both\n  # oninput and onchange handles the widest range of inputs and browser\n  # inconsistencies.\n  element.oninput = ->\n    value(element.value)\n  element.onchange = ->\n    value(element.value)\n\n  value.observe? (newValue) ->\n    element.value = newValue\n\n  switch element.nodeName\n    when \"SELECT\"\n      # HACK: Need to set the value, but probably don't have the option contents yet\n      # so let's just do it after our execution suspends and we probably have them\n      setTimeout ->\n        element.value = value()\n      , 0\n\n  return\n\nRuntime = (context) ->\n  stack = []\n\n  # HAX: A document fragment is not your real dad\n  lastParent = ->\n    i = stack.length - 1\n    while (element = stack[i]) and isFragment(element)\n      i -= 1\n\n    element\n\n  top = ->\n    stack[stack.length-1]\n\n  append = (child) ->\n    parent = top()\n\n    # TODO: This seems a little gross\n    # The problem is that in each blocks our fragments are being emptied\n    # because they are appended to the parent before we return\n    # By appending and returning the child instead we should be able to\n    # keep a reference to the actual elements\n    if parent and isFragment(child) and child.childNodes.length is 1\n      child = child.childNodes[0]\n\n    top()?.appendChild(child)\n\n    return child\n\n  push = (child) ->\n    stack.push(child)\n\n  pop = ->\n    append(stack.pop())\n\n  render = (child) ->\n    push(child)\n    pop()\n\n  bindObservable = (element, value, update) ->\n    observable = Observable(value)\n    update observable()\n\n    observe = ->\n      observable.observe update\n      update observable()\n\n    unobserve = ->\n      observable.stopObserving update\n\n    element.addEventListener(\"DOMNodeInserted\", observe, true)\n    element.addEventListener(\"DOMNodeRemoved\", unobserve, true)\n\n    return element\n\n  id = (sources...) ->\n    element = top()\n\n    update = (newValue) ->\n      if typeof newValue is \"function\"\n        newValue = newValue()\n\n      element.id = newValue\n\n    value = ->\n      possibleValues = sources.map (source) ->\n        if typeof source is \"function\"\n          source()\n        else\n          source\n      .filter (idValue) ->\n        idValue?\n\n      possibleValues[possibleValues.length-1]\n\n    bindObservable(element, value, update)\n\n  classes = (sources...) ->\n    element = top()\n\n    update = (newValue) ->\n      if typeof newValue is \"function\"\n        newValue = newValue()\n\n      element.className = newValue\n\n    value = ->\n      possibleValues = sources.map (source) ->\n        if typeof source is \"function\"\n          source()\n        else\n          source\n      .filter (sourceValue) ->\n        sourceValue?\n\n      possibleValues.join(\" \")\n\n    bindObservable(element, value, update)\n\n  observeAttribute = (name, value) ->\n    element = top()\n\n    update = (newValue) ->\n      if newValue? and newValue != false\n        element.setAttribute name, newValue\n      else\n        element.removeAttribute name\n\n    if (name is \"value\") and (typeof value is \"function\")\n      valueBind(element, value)\n    else if (name is \"checked\") and (typeof value is \"function\")\n      element.onchange = ->\n        value element.checked\n      bindObservable(element, value, update)\n    # Straight up onclicks, etc.\n    else if name.match(/^on/) and isEvent(name.substr(2))\n      element[name] = value\n    # Handle click=@method\n    else if isEvent(name)\n      element[\"on#{name}\"] = value\n    else\n      bindObservable(element, value, update)\n\n    return element\n\n  observeText = (value) ->\n    # Kind of a hack for handling sub renders\n    # or adding explicit html nodes to the output\n    # TODO: May want to make more sure that it's a real dom node\n    #       and not some other object with a nodeType property\n    # TODO: This shouldn't be inside of the observeText method\n    switch value?.nodeType\n      when 1, 3, 11\n        return render(value)\n\n    # HACK: We don't really want to know about the document inside here.\n    # Creating our text nodes in here cleans up the external call\n    # so it may be worth it.\n    element = document.createTextNode('')\n\n    update = (newValue) ->\n      element.nodeValue = newValue\n\n    bindObservable element, value, update\n\n    render element\n\n  self =\n    # Pushing and popping creates the node tree\n    push: push\n    pop: pop\n\n    id: id\n    classes: classes\n    attribute: observeAttribute\n    text: observeText\n\n    filter: (name, content) ->\n      ; # TODO self.filters[name](content)\n\n    each: (items, fn) ->\n      items = Observable(items)\n      elements = null\n      parent = lastParent()\n\n      # TODO: Work when rendering many sibling elements\n      items.observe (newItems) ->\n        replace elements, newItems\n\n      replace = (oldElements, items) ->\n        elements = []\n        items.forEach (item, index, array) ->\n          element = fn.call(item, item, index, array)\n\n          if isFragment(element)\n            elements.push element.childNodes...\n          else\n            elements.push element\n\n          parent.appendChild element\n\n          return element\n\n        oldElements?.forEach (element) ->\n          element.remove()\n\n      replace(null, items)\n\n  return self\n\nmodule.exports = Runtime\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/canvas-to-blob.js": {
      "path": "lib/canvas-to-blob.js",
      "content": "/* canvas-toBlob.js\n * A canvas.toBlob() implementation.\n * 2011-07-13\n *\n * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */\n\n(function(view) {\n\"use strict\";\nvar\n    Uint8Array = view.Uint8Array\n\t, HTMLCanvasElement = view.HTMLCanvasElement\n\t, is_base64_regex = /\\s*;\\s*base64\\s*(?:;|$)/i\n\t, base64_ranks\n\t, decode_base64 = function(base64) {\n\t\tvar\n\t\t\t  len = base64.length\n\t\t\t, buffer = new Uint8Array(len / 4 * 3 | 0)\n\t\t\t, i = 0\n\t\t\t, outptr = 0\n\t\t\t, last = [0, 0]\n\t\t\t, state = 0\n\t\t\t, save = 0\n\t\t\t, rank\n\t\t\t, code\n\t\t\t, undef\n\t\t;\n\t\twhile (len--) {\n\t\t\tcode = base64.charCodeAt(i++);\n\t\t\trank = base64_ranks[code-43];\n\t\t\tif (rank !== 255 && rank !== undef) {\n\t\t\t\tlast[1] = last[0];\n\t\t\t\tlast[0] = code;\n\t\t\t\tsave = (save << 6) | rank;\n\t\t\t\tstate++;\n\t\t\t\tif (state === 4) {\n\t\t\t\t\tbuffer[outptr++] = save >>> 16;\n\t\t\t\t\tif (last[1] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save >>> 8;\n\t\t\t\t\t}\n\t\t\t\t\tif (last[0] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save;\n\t\t\t\t\t}\n\t\t\t\t\tstate = 0;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t// 2/3 chance there's going to be some null bytes at the end, but that\n\t\t// doesn't really matter with most image formats.\n\t\t// If it somehow matters for you, truncate the buffer up outptr.\n\t\treturn buffer;\n\t}\n;\nif (Uint8Array) {\n\tbase64_ranks = new Uint8Array([\n\t\t  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1\n\t\t, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9\n\t\t, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25\n\t\t, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35\n\t\t, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51\n\t]);\n}\nif (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {\n\tHTMLCanvasElement.prototype.toBlob = function(callback, type /*, ...args*/) {\n\t\t  if (!type) {\n\t\t\ttype = \"image/png\";\n\t\t} if (this.mozGetAsFile) {\n\t\t\tcallback(this.mozGetAsFile(\"canvas\", type));\n\t\t\treturn;\n\t\t}\n\t\tvar\n\t\t\t  args = Array.prototype.slice.call(arguments, 1)\n\t\t\t, dataURI = this.toDataURL.apply(this, args)\n\t\t\t, header_end = dataURI.indexOf(\",\")\n\t\t\t, data = dataURI.substring(header_end + 1)\n\t\t\t, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))\n\t\t\t, blob\n\t\t;\n\t\tif (Blob.fake) {\n\t\t\t// no reason to decode a data: URI that's just going to become a data URI again\n\t\t\tblob = new Blob\n\t\t\tif (is_base64) {\n\t\t\t\tblob.encoding = \"base64\";\n\t\t\t} else {\n\t\t\t\tblob.encoding = \"URI\";\n\t\t\t}\n\t\t\tblob.data = data;\n\t\t\tblob.size = data.length;\n\t\t} else if (Uint8Array) {\n\t\t\tif (is_base64) {\n\t\t\t\tblob = new Blob([decode_base64(data)], {type: type});\n\t\t\t} else {\n\t\t\t\tblob = new Blob([decodeURIComponent(data)], {type: type});\n\t\t\t}\n\t\t}\n\t\tcallback(blob);\n\t};\n}\n}(self));\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/file_saver.js": {
      "path": "lib/file_saver.js",
      "content": "/* FileSaver.js\n * A saveAs() FileSaver implementation.\n * 2013-10-21\n *\n * By Eli Grey, http://eligrey.com\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */\n\nvar saveAs = saveAs\n  || (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))\n  || (function(view) {\n  \"use strict\";\n\tvar\n\t\t  doc = view.document\n\t\t  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet\n\t\t, get_URL = function() {\n\t\t\treturn view.URL || view.webkitURL || view;\n\t\t}\n\t\t, URL = view.URL || view.webkitURL || view\n\t\t, save_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\")\n\t\t, can_use_save_link =  !view.externalHost && \"download\" in save_link\n\t\t, click = function(node) {\n\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\tevent.initMouseEvent(\n\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t, false, false, false, false, 0, null\n\t\t\t);\n\t\t\tnode.dispatchEvent(event);\n\t\t}\n\t\t, webkit_req_fs = view.webkitRequestFileSystem\n\t\t, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem\n\t\t, throw_outside = function (ex) {\n\t\t\t(view.setImmediate || view.setTimeout)(function() {\n\t\t\t\tthrow ex;\n\t\t\t}, 0);\n\t\t}\n\t\t, force_saveable_type = \"application/octet-stream\"\n\t\t, fs_min_size = 0\n\t\t, deletion_queue = []\n\t\t, process_deletion_queue = function() {\n\t\t\tvar i = deletion_queue.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar file = deletion_queue[i];\n\t\t\t\tif (typeof file === \"string\") { // file is an object URL\n\t\t\t\t\tURL.revokeObjectURL(file);\n\t\t\t\t} else { // file is a File\n\t\t\t\t\tfile.remove();\n\t\t\t\t}\n\t\t\t}\n\t\t\tdeletion_queue.length = 0; // clear queue\n\t\t}\n\t\t, dispatch = function(filesaver, event_types, event) {\n\t\t\tevent_types = [].concat(event_types);\n\t\t\tvar i = event_types.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar listener = filesaver[\"on\" + event_types[i]];\n\t\t\t\tif (typeof listener === \"function\") {\n\t\t\t\t\ttry {\n\t\t\t\t\t\tlistener.call(filesaver, event || filesaver);\n\t\t\t\t\t} catch (ex) {\n\t\t\t\t\t\tthrow_outside(ex);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t, FileSaver = function(blob, name) {\n\t\t\t// First try a.download, then web filesystem, then object URLs\n\t\t\tvar\n\t\t\t\t  filesaver = this\n\t\t\t\t, type = blob.type\n\t\t\t\t, blob_changed = false\n\t\t\t\t, object_url\n\t\t\t\t, target_view\n\t\t\t\t, get_object_url = function() {\n\t\t\t\t\tvar object_url = get_URL().createObjectURL(blob);\n\t\t\t\t\tdeletion_queue.push(object_url);\n\t\t\t\t\treturn object_url;\n\t\t\t\t}\n\t\t\t\t, dispatch_all = function() {\n\t\t\t\t\tdispatch(filesaver, \"writestart progress write writeend\".split(\" \"));\n\t\t\t\t}\n\t\t\t\t// on any filesys errors revert to saving with object URLs\n\t\t\t\t, fs_error = function() {\n\t\t\t\t\t// don't create more object URLs than needed\n\t\t\t\t\tif (blob_changed || !object_url) {\n\t\t\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t\t}\n\t\t\t\t\tif (target_view) {\n\t\t\t\t\t\ttarget_view.location.href = object_url;\n\t\t\t\t\t} else {\n                        window.open(object_url, \"_blank\");\n                    }\n\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\tdispatch_all();\n\t\t\t\t}\n\t\t\t\t, abortable = function(func) {\n\t\t\t\t\treturn function() {\n\t\t\t\t\t\tif (filesaver.readyState !== filesaver.DONE) {\n\t\t\t\t\t\t\treturn func.apply(this, arguments);\n\t\t\t\t\t\t}\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t\t, create_if_not_found = {create: true, exclusive: false}\n\t\t\t\t, slice\n\t\t\t;\n\t\t\tfilesaver.readyState = filesaver.INIT;\n\t\t\tif (!name) {\n\t\t\t\tname = \"download\";\n\t\t\t}\n\t\t\tif (can_use_save_link) {\n\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t// FF for Android has a nasty garbage collection mechanism\n\t\t\t\t// that turns all objects that are not pure javascript into 'deadObject'\n\t\t\t\t// this means `doc` and `save_link` are unusable and need to be recreated\n\t\t\t\t// `view` is usable though:\n\t\t\t\tdoc = view.document;\n\t\t\t\tsave_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\");\n\t\t\t\tsave_link.href = object_url;\n\t\t\t\tsave_link.download = name;\n\t\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\t\tevent.initMouseEvent(\n\t\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t\t, false, false, false, false, 0, null\n\t\t\t\t);\n\t\t\t\tsave_link.dispatchEvent(event);\n\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\tdispatch_all();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\t// Object and web filesystem URLs have a problem saving in Google Chrome when\n\t\t\t// viewed in a tab, so I force save with application/octet-stream\n\t\t\t// http://code.google.com/p/chromium/issues/detail?id=91158\n\t\t\tif (view.chrome && type && type !== force_saveable_type) {\n\t\t\t\tslice = blob.slice || blob.webkitSlice;\n\t\t\t\tblob = slice.call(blob, 0, blob.size, force_saveable_type);\n\t\t\t\tblob_changed = true;\n\t\t\t}\n\t\t\t// Since I can't be sure that the guessed media type will trigger a download\n\t\t\t// in WebKit, I append .download to the filename.\n\t\t\t// https://bugs.webkit.org/show_bug.cgi?id=65440\n\t\t\tif (webkit_req_fs && name !== \"download\") {\n\t\t\t\tname += \".download\";\n\t\t\t}\n\t\t\tif (type === force_saveable_type || webkit_req_fs) {\n\t\t\t\ttarget_view = view;\n\t\t\t}\n\t\t\tif (!req_fs) {\n\t\t\t\tfs_error();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tfs_min_size += blob.size;\n\t\t\treq_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {\n\t\t\t\tfs.root.getDirectory(\"saved\", create_if_not_found, abortable(function(dir) {\n\t\t\t\t\tvar save = function() {\n\t\t\t\t\t\tdir.getFile(name, create_if_not_found, abortable(function(file) {\n\t\t\t\t\t\t\tfile.createWriter(abortable(function(writer) {\n\t\t\t\t\t\t\t\twriter.onwriteend = function(event) {\n\t\t\t\t\t\t\t\t\ttarget_view.location.href = file.toURL();\n\t\t\t\t\t\t\t\t\tdeletion_queue.push(file);\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t\tdispatch(filesaver, \"writeend\", event);\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\twriter.onerror = function() {\n\t\t\t\t\t\t\t\t\tvar error = writer.error;\n\t\t\t\t\t\t\t\t\tif (error.code !== error.ABORT_ERR) {\n\t\t\t\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\t\"writestart progress write abort\".split(\" \").forEach(function(event) {\n\t\t\t\t\t\t\t\t\twriter[\"on\" + event] = filesaver[\"on\" + event];\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t\twriter.write(blob);\n\t\t\t\t\t\t\t\tfilesaver.abort = function() {\n\t\t\t\t\t\t\t\t\twriter.abort();\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.WRITING;\n\t\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t};\n\t\t\t\t\tdir.getFile(name, {create: false}, abortable(function(file) {\n\t\t\t\t\t\t// delete file if it already exists\n\t\t\t\t\t\tfile.remove();\n\t\t\t\t\t\tsave();\n\t\t\t\t\t}), abortable(function(ex) {\n\t\t\t\t\t\tif (ex.code === ex.NOT_FOUND_ERR) {\n\t\t\t\t\t\t\tsave();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t}\n\t\t\t\t\t}));\n\t\t\t\t}), fs_error);\n\t\t\t}), fs_error);\n\t\t}\n\t\t, FS_proto = FileSaver.prototype\n\t\t, saveAs = function(blob, name) {\n\t\t\treturn new FileSaver(blob, name);\n\t\t}\n\t;\n\tFS_proto.abort = function() {\n\t\tvar filesaver = this;\n\t\tfilesaver.readyState = filesaver.DONE;\n\t\tdispatch(filesaver, \"abort\");\n\t};\n\tFS_proto.readyState = FS_proto.INIT = 0;\n\tFS_proto.WRITING = 1;\n\tFS_proto.DONE = 2;\n\n\tFS_proto.error =\n\tFS_proto.onwritestart =\n\tFS_proto.onprogress =\n\tFS_proto.onwrite =\n\tFS_proto.onabort =\n\tFS_proto.onerror =\n\tFS_proto.onwriteend =\n\t\tnull;\n\n\tview.addEventListener(\"unload\", process_deletion_queue, false);\n\treturn saveAs;\n}(window));\n\nif (typeof module !== 'undefined') module.exports = saveAs;\n",
      "mode": "100644",
      "type": "blob"
    },
    "loader.coffee.md": {
      "path": "loader.coffee.md",
      "content": "Loader\n======\n\n    Loader = (I={}, self=Core(I)) ->\n      self.extend\n        load: (dataURL) ->\n          deferred = Deferred()\n\n          context = document.createElement('canvas').getContext('2d')\n          image = document.createElement(\"img\")\n\n          image.onload = ->\n            {width, height} = image\n\n            context.drawImage(image, 0, 0)\n            imageData = context.getImageData(0, 0, width, height)\n\n            deferred.resolve imageData\n\n          image.onerror = ->\n            deferred.reject \"Error loading image data\"\n\n          image.src = dataURL\n\n          return deferred.promise()\n\nLoad the imageData and return the data with a palette representing the colors\nfound in the imageData.\n\n        fromImageData: (imageData) ->\n          {width, height} = imageData\n\n          colorFrequency = {}\n\n          colors = [0...(width * height)].map (n) ->\n            pieces = getColor(imageData, n)\n\n            color = arrayToHex(pieces)\n\n            console.log color\n\n            colorFrequency[color] ?= 0\n            colorFrequency[color] += 1\n\n            color\n\n          table = Object.keys(colorFrequency).sort (a, b) ->\n            colorFrequency[b] - colorFrequency[a]\n          .reduce (table, color, index) ->\n            table[color] = index\n\n            table\n          , {}\n\n          palette = Object.keys(table)\n\n          data = [0...(width * height)].map (n) ->\n            table[colors[n]]\n\n          palette: palette\n          width: width\n          height: height\n          data: data\n\nLoad the image data and quantize it to the given palette using nearest color, no\nfancy error diffusion or anything.\n\n        fromImageDataWithPalette: (imageData, palette) ->\n          {width, height} = imageData\n          paletteData = palette.map colorToRGBA\n\n          width: width\n          height: height\n          data: [0...(width * height)].map (n) ->\n            nearestColorIndex(getColor(imageData, n), paletteData)\n\n    module.exports = Loader\n\nHelpers\n-------\n\n    arrayToHex = (parts) ->\n      if parts[3] < 128\n        \"transparent\"\n      else\n        \"##{parts.slice(0, 3).map(numberToHex).join('')}\"\n\n    # HACK: Infinity keeps the transparent color from being closer than any other\n    # color in the palette\n    TRANSPARENT_RGBA = [Infinity, 0, 0, 0xff]\n\n    colorToRGBA = (colorString) ->\n      if colorString is \"transparent\"\n        TRANSPARENT_RGBA\n      else\n        colorString.match(/([0-9A-F]{2})/g).map (part) ->\n          parseInt part, 0x10\n        .concat [0]\n\n    distanceSquared = (a, b) ->\n      a.slice(0, 3).map (n, index) ->\n        delta = n - b[index]\n\n        delta * delta\n      .sum()\n\n    nearestColorIndex = (colorData, paletteData) ->\n      # TODO: Hack for transparent pixels\n      # Assumes 0 index is transparent\n      # 50% or more transparent then it is 100% transparent\n      # less than 50% it is fully opaque\n      if colorData[3] < 128\n        return 0\n\n      paletteColor = paletteData.minimum (paletteEntry) ->\n        distanceSquared(paletteEntry, colorData)\n\n      paletteData.indexOf(paletteColor)\n\n    getColor = (imageData, x, y) ->\n      stride = 4\n\n      if y?\n        index = (x + y * imageData.width) * stride\n      else\n        index = x * stride\n\n      Array::slice.call imageData.data, index, index + stride\n\n    numberToHex = (n) ->\n      \"0#{n.toString(0x10)}\".slice(-2).toUpperCase()\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "Pixel Editor\n============\n\nWelcome to this cool pixel editor. Eventually you'll be able to read this for\nhelp, but right now it's mostly code.\n\nEditing pixels in your browser.\n\n    # For debug purposes\n    global.PACKAGE = PACKAGE\n    global.require = require\n\n    # Setup\n    global.Observable = require \"observable\"\n    global.Model = require \"model\"\n    global.Bindable = require \"bindable\"\n    require \"cornerstone\"\n\n    require \"appcache\"\n    require \"jquery-utils\"\n\n    require \"./lib/canvas-to-blob\"\n\n    runtime = require(\"runtime\")(PACKAGE)\n    runtime.boot()\n    runtime.applyStyleSheet(require('./style'))\n\n    Editor = require \"./editor\"\n\n    # For debugging\n    global.editor = Editor()\n\n    editor.notify(\"Welcome to PixiPaint!\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "modal.coffee.md": {
      "path": "modal.coffee.md",
      "content": "Modal\n=====\n\nMessing around with some modal BS\n\n    # HACK: Dismiss modal by clicking on overlay\n    $ ->\n      $(\"#modal\").click (e) ->\n        if e.target is this\n          Modal.hide()\n\n    module.exports = Modal =\n      show: (element) ->\n        $(\"#modal\").empty().append(element).addClass(\"active\")\n\n      hide: ->\n        $(\"#modal\").removeClass(\"active\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "notifications.coffee.md": {
      "path": "notifications.coffee.md",
      "content": "Notifications\n=======\n\nNotifications for editors.\n\n    module.exports = (I={}, self) ->\n      duration = 5000\n\n      self.extend\n        notifications: Observable []\n        notify: (message) ->\n          self.notifications.push message\n\n          setTimeout ->\n            self.notifications.remove message\n          , duration\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "palette.coffee.md": {
      "path": "palette.coffee.md",
      "content": "Palette\n=======\n\nHelpers\n-------\n\n\n\n    fromStrings = (lines) ->\n      lines.split(\"\\n\").map (line) ->\n        \"#\" + line.split(\" \").map (string) ->\n          numberToHex parseInt(string, 10)\n        .join(\"\")\n\n    numberToHex = (n) ->\n      \"0#{n.toString(0x10)}\".slice(-2).toUpperCase()\n\n    TRANSPARENT = [0xff, 0, 0xff]\n    colorToRGB = (colorString) ->\n      # HACK: Use crazy magenta for transparent in palette export.\n      if colorString is \"transparent\"\n        TRANSPARENT\n      else\n        colorString.match(/([0-9A-F]{2})/g).map (part) ->\n          parseInt part, 0x10\n\nExport to Formats\n-----------------\n\n    exportJASC = (array) ->\n      entries = array\n      .map (entry) ->\n        colorToRGB(entry).join(\" \")\n      .join(\"\\n\")\n\n      padding = Math.max(0, 256 - array.length)\n\n      zeroes = [0...padding].map ->\n        \"0 0 0\"\n      .join(\"\\n\")\n\n      \"\"\"\n        JASC-PAL\n        0100\n        256\n        #{entries}\n        #{zeroes}\n      \"\"\"\n\nPalettes\n--------\n\n    Palette =\n\n      defaults:\n        [\n          \"transparent\"\n          \"#000000\"\n          \"#FFFFFF\"\n          \"#666666\"\n          \"#DCDCDC\"\n          \"#EB070E\"\n          \"#F69508\"\n          \"#FFDE49\"\n          \"#388326\"\n          \"#0246E3\"\n          \"#563495\"\n          \"#58C4F5\"\n          \"#E5AC99\"\n          \"#5B4635\"\n          \"#FFFEE9\"\n        ]\n\nhttp://www.pixeljoint.com/forum/forum_posts.asp?TID=12795\n\n      dawnBringer16: fromStrings \"\"\"\n        20 12 28\n        68 36 52\n        48 52 109\n        78 74 78\n        133 76 48\n        52 101 36\n        208 70 72\n        117 113 97\n        89 125 206\n        210 125 44\n        133 149 161\n        109 170 44\n        210 170 153\n        109 194 202\n        218 212 94\n        222 238 214\n      \"\"\"\n\nhttp://www.pixeljoint.com/forum/forum_posts.asp?TID=16247\n\n      dawnBringer32: fromStrings \"\"\"\n        0 0 0\n        34 32 52\n        69 40 60\n        102 57 49\n        143 86 59\n        223 113 38\n        217 160 102\n        238 195 154\n        251 242 54\n        153 229 80\n        106 190 48\n        55 148 110\n        75 105 47\n        82 75 36\n        50 60 57\n        63 63 116\n        48 96 130\n        91 110 225\n        99 155 255\n        95 205 228\n        203 219 252\n        255 255 255\n        155 173 183\n        132 126 135\n        105 106 106\n        89 86 82\n        118 66 138\n        172 50 50\n        217 87 99\n        215 123 186\n        143 151 74\n        138 111 48\n      \"\"\"\n\n      export: exportJASC\n\n    module.exports = Palette\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.1.0\"\nremoteDependencies: [\n  \"https://code.jquery.com/jquery-1.11.0.min.js\"\n]\ndependencies:\n  appcache: \"distri/appcache:v0.2.0\"\n  bindable: \"distri/bindable:v0.1.0\"\n  byte_array: \"distri/byte_array:v0.1.1\"\n  cornerstone: \"distri/cornerstone:v0.2.2-pre.0\"\n  model: \"distri/compositions:v0.1.1\"\n  eval: \"distri/eval:v0.1.0\"\n  facebook: \"distri/facebook:v0.1.1\"\n  \"grid-gen\": \"distri/grid-gen:v0.2.0\"\n  \"hotkeys\": \"distri/hotkeys:v0.2.0\"\n  \"jquery-utils\": \"distri/jquery-utils:v0.2.0\"\n  observable: \"distri/observable:v0.1.2\"\n  postmaster: \"distri/postmaster:v0.2.0\"\n  runtime: \"distri/runtime:v0.3.0\"\n  \"touch-canvas\": \"distri/touch-canvas:v0.3.0\"\n  \"undo\": \"distri/undo:v0.2.0\"\n  util: \"distri/util:v0.1.0\"\nwidth: 1280\nheight: 720\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html, body\n  margin: 0\n  height: 100%\n  font-family: helvetica\n\n.editor\n  background-color: lightgray\n  box-sizing: border-box\n  height: 100%\n  padding: 0px 40px 64px 40px\n  position: relative\n  user-select: none\n  overflow: hidden\n\n  .main\n    font-size: 0\n    height: 100%\n    position: relative\n    overflow: auto\n\n    .thumbnail\n      background-color: white\n      border: 1px solid rgba(0, 0, 0, 0.5)\n      position: absolute\n      top: 0\n      left: 0\n\n.notifications\n  background-color: rgba(0, 0, 0, 0.5)\n  border: 1px solid black\n  border-bottom-left-radius: 4px\n  border-bottom-right-radius: 4px\n  color: white\n  left: 40px\n  padding: 4px\n  position: absolute\n  top: 0\n\n  &:empty\n    padding: 0\n    border: none\n\n  p\n    margin: 0\n    margin-bottom: 0.25em\n\n    &:last-child\n      margin-bottom: 0\n\n.toolbar\n  box-sizing: border-box\n  height: 100%\n  width: 40px\n  position: absolute\n  top: 0\n  left: 0\n  \n  h2\n    font-size: 12px\n\n  .tool\n    background-color: #EEE\n    background-position: center\n    background-repeat: no-repeat\n    width: 36px\n    height: 36px\n    box-sizing: border-box\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    border-radius: 2px\n    margin: 2px\n\n    &.active\n      background-color: #FFF\n      border-color: green\n\n.layers\n  box-sizing: border-box\n  font-size: 14px\n  height: 100%\n  width: 40px\n  position: absolute\n  top: 0\n  right: 0\n\n  .layer\n    padding: 8px 0 2px\n    position: relative\n\n    &.active\n      canvas\n        border-color: green\n\n    &.hidden\n      opacity: 0.5\n\n    .eye\n      position: absolute\n      top: 0\n      right: 0\n      width: 16px\n      height: 16px\n      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnElEQVQ4T6WT30uTYRTHv8/27n33y/ljaptLzGpEoEZBQRKYBBFdREUXQhFddRNdRBF2ZX9BVJDQpRddRaQhWlBkISoqU2ammWtzzl85N51u757nffa8vZskSHd54Fye7/mcc76HYI9B9liPXQKhUOiMbNIeEXWtmbCMjQgO5IwUOYCYKezuUa3I11pTU9P/t/GOQDQa7TCrqy1mFpdlkwSNZbGeSIIzBsUMVLgcyDEKLnRd+E50e/z1l/IiBQGj+IO0ETovQ0NsYRHRpQSyxAlN8UDLETAu4OArqMIi6qvdMBlEoqp+ovzYuQYSDoefKOrCPVlLIfgjAvnAWcSoF5pBTjUdWSOpJqAygbpqGUdT3XCkwnBazEgdbO4gsdngMknO7NvQS+A/3oSeQAbraVEofni9AQYwHrSPG0ICVgtB69UyxKeGICZ6sbrJOQkPdwqbp44UV/ggSRLeDqWxtsVBDYK2W9sCd56NgVIBu2JCW0s5OOdIL/xE5N0LkFgkxO2uUrMsy7BYLOifVjEepsgayPmulOVHyI8icMpvx40mFzRNAzOWm/z6SifR4JeE4qosVUq8BYLldYFPwTTmfmvI8u3583vwFEu41lgEv9dSIFANAnXkDSNzM99eKonp2yaHG2Z3LUy2YkRXGcZ+ZfF9nhoX0HHYI+Ok34Yj+60QNAMtEgAd7UJU8g0WzjgdGBhwrE2etkkEelltUndUZom9lOmSLP4aRtd1IB6xitCgl81PYirrWLpw/6lvx0jDfe+76PLMxSqSkpx2K6C4ICx2Y4mGWQxH8q0ksDKLcHxT3yw5NDry+nPj474+vsvKPc/vKiylXmaMXjFgmmUQp5lwomtCZKgaUFXaqeu892b7x6l/rPy/T7Xnb/wDHedWhDseHEQAAAAASUVORK5CYII=)\n\n  canvas\n    box-sizing: border-box\n    border: 1px solid lightgray\n    display: block\n    margin: auto\n\n.palette\n  box-sizing: border-box\n  height: 100%\n  width: 40px\n  position: absolute\n  top: 0\n  right: 0\n  font-size: 0\n\n  .color\n    box-sizing: border-box\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    border-radius: 2px\n    float: left\n    width: 16px\n    height: 16px\n    margin: 2px\n\n    &.current\n      float: none\n      width: 36px\n      height: 36px\n\n.vertical-center\n  position: absolute\n  top: 0\n  bottom: 0\n  left: 0\n  right: 0\n  margin: auto\n\n.viewport\n  background-color: white\n  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkIADOnDnzH58SxlEDGIZDGBCKZxMTE7zeZBw1gGEYhAEAJQ47KemVQJ8AAAAASUVORK5CYII=)\n  border: 1px solid gray\n  margin: auto\n\n  canvas\n    background-color: transparent\n    position: absolute\n\n  .overlay\n    pointer-events: none\n    position: absolute\n    z-index: 1\n\n.debug\n  background-color: white\n  box-sizing: border-box\n  position: absolute\n  width: 100%\n  height: 100px\n  bottom: 0\n  margin: 0\n  padding: 1em\n\n.actions\n  box-sizing: border-box\n  width: 100%\n  height: 64px\n  padding: 0px 40px\n  position: absolute\n  bottom: 0\n  left: 0\n\n  .action\n    width: 64px\n    height: 64px\n\n    background-color: #EEE\n    background-position: center\n    background-repeat: no-repeat\n    box-sizing: border-box\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    border-radius: 2px\n    display: inline-block\n    font-size: 12px\n    margin: 2px\n    position: relative\n    vertical-align: top\n\n    .text\n      text-align: center\n      white-space: nowrap\n      overflow: hidden\n      position: absolute\n      width: 100%\n\n      top: 0\n\n      &:last-child\n        top: auto\n        bottom: 0\n\n#modal\n  background-color: rgba(0, 0, 0, 0.25)\n  display: none\n  position: absolute\n  z-index: 9000\n  top: 0\n\n  input[type=file]\n    box-sizing: border-box\n    padding: 5em 2em\n    width: 320px\n    height: 180px\n\n  & > *\n    background-color: white\n    border: 1px solid black\n    margin: auto\n    position: absolute\n    top: 0\n    bottom: 0\n    left: 0\n    right: 0\n\n  &.active\n    display: block\n    width: 100%\n    height: 100%\n",
      "mode": "100644",
      "type": "blob"
    },
    "symmetry.coffee": {
      "path": "symmetry.coffee",
      "content": "\nmirror = (size, flip) ->\n  midpoint = Point (size.width - 1)/2, (size.height - 1)/2\n  matrix = Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y))\n\n  (point) ->\n    matrix.transformPoint(point)\n\nappend = (list, transform) ->\n  # TODO: Uniq?\n  list.concat list.map(transform)\n\nmodule.exports =\n  normal: (points) ->\n    points\n\n  flip: (points, size) ->\n    t = mirror(size, Matrix.HORIZONTAL_FLIP)\n\n    append(points, t)\n\n  flop: (points, size) ->\n    t = mirror(size, Matrix.VERTICAL_FLIP)\n\n    append(points, t)\n\n  quad: (points, size) ->\n    t1 = mirror(size, Matrix.HORIZONTAL_FLIP)\n    t2 = mirror(size, Matrix.VERTICAL_FLIP)\n\n    append(append(points, t1), t2)\n\n  icon:\n    normal: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWKB2CjDpo7keEc3ZNQApGgkNyYoDkQAREwcEdrwnzgAAAAASUVORK5CYIIA\"\n    flip: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPUlEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3VigZKkQFS847Ng1AAGhoEPAwCRtTgRC7T+1AAAAABJRU5ErkJgggAA\"\n    flop: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWIBFhOkxgBI32gsUCsMKI4FYnMeNnUAmxI4EQ3tXkkAAAAASUVORK5CYIIA\"\n    quad: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3ViARYThGIAW5SPxgI0FihOyhTHAiU5GgBvBXARCEfBgAAAAABJRU5ErkJgggAA\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "templates/debug.haml.md": {
      "path": "templates/debug.haml.md",
      "content": "Debug Some junk\n\n    %pre.debug\n      - each @items, (item) ->\n        = item\n",
      "mode": "100644",
      "type": "blob"
    },
    "templates/editor.haml.md": {
      "path": "templates/editor.haml.md",
      "content": "Editor template\n\n    - activeIndex = @activeIndex\n    - activeTool = @activeTool\n    - previousTool = @previousTool\n    - editor = this\n    - Symmetry = require \"../symmetry\"\n\n    .editor\n\nThe toolbar holds our tools.\n\n      .toolbar\n        .tools\n          - each @tools, (tool) ->\n            - activeClass = -> \"active\" if tool is activeTool()\n            - activate = -> previousTool(activeTool()); activeTool(tool)\n            .tool(style=\"background-image: url(#{tool.iconUrl})\" class=activeClass click=activate)\n        %h2 Symmetry\n        .tools\n          - symmetryMode = @symmetryMode\n          - each [\"normal\", \"flip\", \"flop\", \"quad\"], (mode) ->\n            - activeClass = -> \"active\" if mode is symmetryMode()\n            - activate = -> symmetryMode(mode)\n            .tool(style=\"background-image: url(#{Symmetry.icon[mode]})\" class=activeClass click=activate)\n\nOur layers and preview canvases are placed in the viewport.\n\n      .main\n        .viewport\n          .overlay\n        - swap = (e) -> if ($t = $(e.currentTarget)).css(\"left\") is \"auto\" then $t.css(left: 0, right: \"auto\") else $t.css(left: \"auto\", right: 0)\n        .thumbnail(click=swap)\n\n      .notifications\n        - each @notifications, (notification) ->\n          %p\n            = notification\n\nThe palette holds our colors.\n\n      .palette\n        .color.current\n        - each @palette, (color, index) ->\n          - activate = -> activeIndex index\n          .color(click=activate touchstart=activate style=\"background-color: #{color}\")\n\n      .actions\n        - each @actions, (action) ->\n          .action(click=@perform touchstart=@perform style=\"background-image: url(#{@iconUrl})\")\n            .text= @name\n            .text= @hotkey\n\nModal junk\n\n    #modal\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/editor.coffee": {
      "path": "test/editor.coffee",
      "content": "\n\nEditor = require \"../editor\"\n\ndescribe \"editor\", ->\n  it \"should have eval\", ->\n    editor = Editor\n      selector: \"#not_present\"\n\n    assert.equal editor.eval(\"5\"), 5\n",
      "mode": "100644",
      "type": "blob"
    },
    "tools.coffee.md": {
      "path": "tools.coffee.md",
      "content": "Tools\n=====\n\n    Brushes = require \"./brushes\"\n    {line, circle, rect, rectOutline} = require \"./util\"\n\n    line2 = (start, end, fn) ->\n      fn start\n      line start, end, fn\n\n    neighbors = (point) ->\n      [\n        Point(point.x, point.y-1)\n        Point(point.x-1, point.y)\n        Point(point.x+1, point.y)\n        Point(point.x, point.y+1)\n      ]\n\n    shapeTool = (fn, icon) ->\n      start = null\n\n      iconUrl: icon\n      touch: ({position}) ->\n        start = position\n\n      move: ({editor, position})->\n        editor.preview ->\n          fn start, position, editor.draw\n\n      release: ({position, editor}) ->\n        fn start, position, editor.draw\n\n    brushTool = (brushName, icon, options) ->\n      previousPosition = null\n      brush = Brushes[brushName]\n\n      OP = (out) ->\n        (p) ->\n          out(p, options)\n\n      paint = (out) ->\n        (point) ->\n          brush(point).forEach OP out\n\n      iconUrl: icon\n      touch: ({position, editor})->\n        paint(editor.draw) position\n        previousPosition = position\n      move: ({editor, position})->\n        line previousPosition, position, paint(editor.draw)\n        previousPosition = position\n      release: ->\n        previousPosition = null\n\nDefault tools.\n\n    TOOLS =\n\nDraw a line when moving while touching.\n\n      pencil: brushTool \"pencil\",\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVQ4T5VTuw2DMBB9LmkZg54ZGCDpHYkJYBBYATcUSKnSwAy0iDFoKR0fDgiMDc5JLvy59969OzPchzSesP3+sLFgySoMweMYou/xmWe81VKx5d0CyCQBoghoGgiV/JombwDNzjkwjsAw/A8gswwgBWm6VPdU7L4laPa6BsrSyX6oxTBQ7munO1v9LgCv2ldCWxcWgDV4EDjZbQq0dDKv65ytuxokKdtWO08AagkhTr2/BiD2otBv8hyMurCbPHNaTQ8OBjJScZFs9eChTKMwB8byT5ajkwIC8E22AvyY7j7ZJugLVIZ5EV8R1SQAAAAASUVORK5CYII=\"\n\n      brush: brushTool \"brush\",\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAKBJREFUeJytkrsRgzAQRFeME6UXXwVUogKoRB2JmAagEEqBcB0ge/Dw0cm2ZpTd7tuTFqg/zBcA0NSKkwg6719G1WJSlUnkI4XZgCGQql+tQKoCbYt+WWrB2SDGA92aYKMD/6dbEjCJAPP8A73wbe5OnAuDYV1LsyfkEMgYi4W5ciW56Zxzt/THBR2YJmAcbXn34s77d+dh6Ps+2tlw8eGedfBU8rnbDOMAAAAASUVORK5CYII=\"\n\n      eraser: brushTool \"pencil\",\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==\",\n        index: 0\n\n      dropper:\n        iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAH1JREFUeJztjrsNhDAUBIfLTOiYsiClCHdEDUT0Q0rscElY3QkJOD4hI1nye/aOFm5S/Ny1sd/l43AdAqoq6hDWsr8aqIsRgLYsKcbRbzpq4wb0OQPQTJNXh+E18ulilFLyfBopJZmzEn+WhuGy5NvklWxKrgpYgrclFj3DDPqoerGlCYunAAAAAElFTkSuQmCC\"\n        touch: ({position, editor}) ->\n          {x, y} = position\n          index = editor.layer().get(x, y)\n          editor.activeIndex index\n        move: ({position, editor}) ->\n          {x, y} = position\n          index = editor.layer().get(x, y)\n          editor.activeIndex index\n        release: ->\n          # Return to the previous tool\n          editor.activeTool editor.previousTool()\n\nFill a connected area.\n\n      fill:\n        iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4T52TPRKCMBCFX0pbj+HY0tJKY+UB8AqchCuYXofCRs9gy3ADW1rKmLeQTIBEZ0wTwu779idZhfQygUml3FIGikPb8ux5MUDM+S9AWAIjRrNNZYDLdov7MEiqx80G576PQqIAJ75NgJMFXPMc6vlcQZYAI842unq/YQ4HoKrGho1iqLqeQWadZuSyLKG1FmeWwMjY7QDCJlAIcQAj4iyDfr1kp4gggVgb9nsPUkXhs1gBJBpX1wFtC20BrpmSjS0pDbD1h8uJeQu+pKaJAmgfy5icQzH/sani9HgkAWLnLTAi0+YeiFmu+QXwEH5EHpAx7EFwld+GybVjOVTJdzBrYOKwGqoP9IV4EbRDWfEAAAAASUVORK5CYII=\"\n        touch: ({position, editor}) ->\n          index = editor.activeIndex()\n          targetIndex = editor.getPixel(position).index\n\n          return unless targetIndex?\n          return if index is targetIndex\n\n          queue = [position]\n          editor.draw position\n\n          # TODO: Allow for interrupts if it takes too long\n          {width, height} = editor.pixelExtent()\n          safetyHatch = width * height\n\n          while(queue.length and safetyHatch > 0)\n            position = queue.pop()\n\n            neighbors(position).forEach (position) ->\n              if editor.getPixel(position)?.index is targetIndex\n                # This is here because I HAVE been burned\n                # Later I should fix the underlying cause, but it seems handy to keep\n                # a hatch on any while loops.\n                safetyHatch -= 1\n\n                editor.draw position\n                queue.push(position)\n\n          return\n\n        move: ->\n        release: ->\n\nShapes\n------\n\n      circle: shapeTool circle,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVQ4T2NkwA7+YxFmxKYUXRCmEZtirHLICkEKsNqCZjOKOpgGYjXDzIKrp4oBpNqO4gqQC0YNgAQJqeFA3WjESBw48gdWdVTNC8gWk50bCbgeUxoAvXwcEQnwKSYAAAAASUVORK5CYII=\"\n\n      rect: shapeTool rect,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVQ4T2NkoBAwUqifYfAY8J9MrzDCvDBqAAPDMAgDMpMBwyBKymR7AQAp1wgR44q8HgAAAABJRU5ErkJggg==\"\n\n      rectOutline: shapeTool rectOutline,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4T2NkoBAwUqifgWoG/CfTJYwwF4AMINU1YD2jBgy7MCAnLcHTATmawXpITX0YFlFsAADRBBIRAZEL0wAAAABJRU5ErkJggg==\"\n\n      line2: shapeTool line2,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAV0lEQVQ4T6XSyQ0AIAgEQOm/aIWHxoNzJTG+GASk9hnE+Z2P3FDMRBjZK0PI/fQyovVeQqzhpRFv+ikkWl+IRID8DRfJAC6SBUykAqhIFXgQBDgQFFjIAMAADxGQlO+iAAAAAElFTkSuQmCC\"\n\n    module.exports = (I={}, self=Core(I)) ->\n      self.extend\n        addTool: (tool) ->\n          self.tools.push tool\n\n        activeTool: Observable()\n        previousTool: Observable()\n\n        tools: Observable []\n\n      # TODO: Probably want to let the editor add its own tools so this is more\n      # reusable\n      Object.keys(TOOLS).forEach (name) ->\n        self.addTool TOOLS[name]\n\n      self.activeTool(self.tools()[0])\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "util.coffee.md": {
      "path": "util.coffee.md",
      "content": "Util\n====\n\nDeferred\n--------\n\nUse jQuery deferred\n\n    global.Deferred = jQuery.Deferred\n\nHelpers\n-------\n\n    isObject = (object) ->\n      Object::toString.call(object) is \"[object Object]\"\n\nSize\n----\n\nA 2d extent.\n\n    Size = (width, height) ->\n      if isObject(width)\n        {width, height} = width\n\n      width: width\n      height: height\n      __proto__: Size.prototype\n\n    Size.prototype =\n      scale: (scalar) ->\n        Size(@width * scalar, @height * scalar)\n\n      toString: ->\n        \"Size(#{@width}, #{@height})\"\n\n      max: (otherSize) ->\n        Size(\n          Math.max(@width, otherSize.width)\n          Math.max(@height, otherSize.height)\n        )\n\n      each: (iterator) ->\n        [0...@height].forEach (y) ->\n          [0...@width].forEach (x) ->\n            iterator(x, y)\n\nPoint Extensions\n----------------\n\n    Point.prototype.scale = (scalar) ->\n      if isObject(scalar)\n        Point(@x * scalar.width, @y * scalar.height)\n      else\n        Point(@x * scalar, @y * scalar)\n\nExtra utilities that may be broken out into separate libraries.\n\n    module.exports =\n\n      Size: Size\n\nA 2d grid of values.\n\n      Grid: (width, height, defaultValue) ->\n        generateValue = (x, y) ->\n          if typeof defaultValue is \"function\"\n            defaultValue(x, y)\n          else\n            defaultValue\n\n        grid =\n          [0...height].map (y) ->\n            [0...width].map (x) ->\n              generateValue(x, y)\n\n        self =\n          contract: (x, y) ->\n            height -= y\n            width -= x\n\n            grid.length = height\n\n            grid.forEach (row) ->\n              row.length = width\n\n            return self\n\n          copy: ->\n            Grid(width, height, self.get)\n\n          get: (x, y) ->\n            return if x < 0 or x >= width\n            return if y < 0 or y >= height\n\n            grid[y][x]\n\n          set: (x, y, value) ->\n            return if x < 0 or x >= width\n            return if y < 0 or y >= height\n\n            grid[y][x] = value\n\n          each: (iterator) ->\n            grid.forEach (row, y) ->\n              row.forEach (value, x) ->\n                iterator(value, x, y)\n\n            return self\n\nExpand the grid using the given `defaultValue` value or function to fill any\npositions that need to be filled.\n\n          expand: (x, y, defaultValue) ->\n            newRows = [0...y].map (y) ->\n              [0...width].map (x) ->\n                if typeof defaultValue is \"function\"\n                  defaultValue(x, y + height)\n                else\n                  defaultValue\n\n            grid = grid.concat newRows\n\n            grid = grid.map (row, y) ->\n              row.concat [0...x].map (x) ->\n                if typeof defaultValue is \"function\"\n                  defaultValue(width + x, y)\n                else\n                  defaultValue\n\n            height = y + height\n            width = x + width\n\n            return self\n\nReturn a 1-dimensional array of the data within the grid.\n\n          toArray: ->\n            grid.reduce (a, b) ->\n              a.concat(b)\n            , []\n\n        return self\n\nCall an iterator for each integer point on a line between two integer points.\n\n      line: (p0, p1, iterator) ->\n        {x:x0, y:y0} = p0\n        {x:x1, y:y1} = p1\n\n        dx = (x1 - x0).abs()\n        dy = (y1 - y0).abs()\n        sx = (x1 - x0).sign()\n        sy = (y1 - y0).sign()\n        err = dx - dy\n\n        while !(x0 is x1 and y0 is y1)\n          e2 = 2 * err\n\n          if e2 > -dy\n            err -= dy\n            x0 += sx\n\n          if e2 < dx\n            err += dx\n            y0 += sy\n\n          iterator\n            x: x0\n            y: y0\n\n      rect: (start, end, iterator) ->\n        [start.y..end.y].forEach (y) ->\n          [start.x..end.x].forEach (x) ->\n            iterator\n              x: x\n              y: y\n\n      rectOutline: (start, end, iterator) ->\n        [start.y..end.y].forEach (y) ->\n          if y is start.y or y is end.y\n            [start.x..end.x].forEach (x) ->\n              iterator\n                x: x\n                y: y\n          else\n            iterator\n              x: start.x\n              y: y\n\n            iterator\n              x: end.x\n              y: y\n\ngross code courtesy of http://en.wikipedia.org/wiki/Midpoint_circle_algorithm\n\n      circle: (start, endPoint, iterator) ->\n        center = Point.interpolate(start, endPoint, 0.5).floor()\n        {x:x0, y:y0} = center\n        {x:x1, y:y1} = endPoint\n\n        extent = endPoint.subtract(start).scale(0.5).abs().floor()\n\n        radius = Math.min(\n          extent.x\n          extent.y\n        )\n\n        f = 1 - radius\n        ddFx = 1\n        ddFy = -2 * radius\n\n        x = 0\n        y = radius\n\n        iterator Point(x0, y0 + radius)\n        iterator Point(x0, y0 - radius)\n        iterator Point(x0 + radius, y0)\n        iterator Point(x0 - radius, y0)\n\n        while x < y\n          if f > 0\n            y--\n            ddFy += 2\n            f += ddFy\n\n          x++\n          ddFx += 2\n          f += ddFx\n\n          iterator Point(x0 + x, y0 + y)\n          iterator Point(x0 - x, y0 + y)\n          iterator Point(x0 + x, y0 - y)\n          iterator Point(x0 - x, y0 - y)\n          iterator Point(x0 + y, y0 + x)\n          iterator Point(x0 - y, y0 + x)\n          iterator Point(x0 + y, y0 - x)\n          iterator Point(x0 - y, y0 - x)\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "actions": {
      "path": "actions",
      "content": "(function() {\n  var Actions, ByteArray, Facebook, FileReading, Hotkeys, Modal, Palette, saveAs, state;\n\n  ByteArray = require(\"byte_array\");\n\n  Facebook = require(\"facebook\");\n\n  FileReading = require(\"./file_reading\");\n\n  Hotkeys = require(\"hotkeys\");\n\n  Modal = require(\"./modal\");\n\n  Palette = require(\"./palette\");\n\n  saveAs = require(\"./lib/file_saver\");\n\n  module.exports = Actions = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.include(Hotkeys);\n    self.extend({\n      addAction: function(action) {\n        return self.actions.push(action);\n      },\n      actions: Observable([])\n    });\n    Object.keys(Actions.defaults).forEach(function(hotkey) {\n      var icon, method, name, _ref;\n      _ref = Actions.defaults[hotkey], method = _ref.method, icon = _ref.icon, name = _ref.name;\n      self.addAction({\n        perform: function() {\n          if (typeof method === \"function\") {\n            return method({\n              editor: self\n            });\n          } else {\n            return self[method]();\n          }\n        },\n        name: name,\n        iconUrl: icon,\n        hotkey: hotkey\n      });\n      return self.addHotkey(hotkey, method);\n    });\n    return self;\n  };\n\n  state = null;\n\n  Actions.defaults = {\n    \"ctrl+z\": {\n      name: \"Undo\",\n      method: \"undo\",\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVQ4T6VTXUhTYRh+p47sbhcR2zmMDGXUTVBBiyBdJUjU6EJ2K4R0ESm6CyEo6qKZWcGkoC6KFt2GxKhwi4JKbcg2khmonVW6RbmGnnI1z873c3rPjp6aQQw88PJ834H3+b73eZ7PAhv8LBvsB5PAP3pK45wDZxyYXpQZSBjHWiSUJTmlUaVQGg6feZZdO9gk6HnZqXnEw6BpAFxjWBowRGwHhSgg/5RhQc6B9FkKq0ppMOJ/FdNJTIKuFye1Q84jwLGBAzbrqOENyiQciuQX1NVYIbOQgcR0IqwUV7pfn49nTYLT0Q7NuDYDShBxTfU9rgWbCA32BrDWWZGQQ2o2Be8/Sv7RCxNDVYnovdUaJCptb9njcTILhe/yDxiPxyKxS4mjVRHos7ZeOxh0bXP1ig4RiKrCk+eRfGJgcmsFgc8HteD1nn3Y8bh/vb3Nl93BHdt39oqCAKpK4Gl0JD95/d06ggfeECV076POkV1/EzQH3EHUpL3lgMdJawgsLxVgfOxNZOrGzJ8RfPeP3XTYxC5duLmvn8pCIpkhoh1FdKKIm6zoEoqYmgJpVvJP304bIvpCx6/abY6+JrHJtFB3Y81CHQulZaiv3QzzmSwk44mwulLs/hD6Yth44k5bQLAJ5xqdjeg9GBnAouUsYJAUBRblJcjlvkF6RgqjI4Ppe/OVQWoLeoaELY4eivGdy6yOsJoDHCWPoyUZoVFKlGH95H+irP/wBPbfpYztG7sYrxDxfw+uMgdoo9u1u2+i/+2Val/pb35FXyDc5lZBAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+y\": {\n      name: \"Redo\",\n      method: \"redo\",\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUUlEQVQ4T6WTUUhTURjHv+scNheypmOy7RY0H7IHC6Rgo/ItB0GXWIgSBUOJMIRFkEUlBEWBDzOsXnoQpIdqTUlrQ6k9NPBhUeCaFO0udxuB7bVc5D3n3L5zYNZSiNG9nHu+C+f/4/v+33ck+M9HqkXf9/DYRRKbHo1GgVZ0NQF6Jo9miE7SU/3xgU0Bg3Mh2TBIkBpGNyWkkxHmIIQC1Snw3WVzA8Nd/ZK/HR9KhjlkPYOzL075KDWGPVZZ2dZoB6vZCvV19UANBDAGjCEEY50SeJfLgFpQbyQvLVwRgMG5XpkZ5vH2lt2K09oKP0gZTJIZmMFQzAEUYwRwCK7FD4ugaupo6mr6ggCcjp8Iy03bI157mxCtrpVBXcnB8sqySF2UoBNwtbiBUgr5Qv5OaiQ9tF7CwLO+REfr3kCj2YIHGCSzySIejD0JPT/3Z5e6bvoyTCdvUiOvQ1UmhqZ7Sv6dBx11aIlW0iD7OTs21Z+oEnOB/9r+ywvZ9C34u40nHwdL/rYDDklCwFcNlgpLYzNn5jcANpsZ4UHvAyXRIe8JWCxbsFYs4e3LIl2jsfnzr/4JEYDjE0fCbrsn4nV5sW1oYnkVchqaWEQT0cDKHFA0VPyjke/v5YRWfJS7h2Xs9PiuHe2Ko9kJ339+gwZTg2gZbx/DORAxvnwmZqKz8PH+p98ADglEunw6YcMep0exNdlgq9UKkskEBp8FXByEEwoGgp4+moX8hFYN4JBD1/fJlBhBTLWbENZJCGlmOqvjqfP2VnaGcWGyuBFQy82snP0Ffg5KIO/aNV0AAAAASUVORK5CYII=\"\n    },\n    \"ctrl+o\": {\n      name: \"Open\",\n      description: \"Open an image file from your local filesystem.\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return Modal.show(FileReading.readerInput({\n          image: function(dataURL) {\n            return editor.fromDataURL(dataURL);\n          },\n          json: function(data) {\n            return editor.restoreState(data);\n          },\n          text: function() {},\n          chose: function() {\n            return Modal.hide();\n          }\n        }));\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACwklEQVQ4T31TXUgUURT+7mzr5taaL9ofgdm6YtZDuvqg0UOED2lGYUQkhathCoblT1KSBlJhuyksZj0EKflQtlaaT1pKtIIQUZmiPqhpmBn4s7o6zjpzO7OumqAd+OYcZs75zjnfncuwgWWU1p/mnFUxxnZwMICrid7HqnFeTV/Wt4wSh7vo4iF9cFAQGNvkLfUoDIo3nUNelHCjslWlXt/SSxz8QV4Csmw1MIaFrSRpBIbh3i7czctGobX5/wSVBcdhbXiHA3FHoBE0EDRaCIKA7x3tsCTEE8HbjQnSbr3klYWJqGp24uDhozT16v5dzjakJcQhv5wI+pqivugCIvczJvyrDkpakrW2gkRk3ndgT2Tc0ubykgIjPR2wX0vB1fJGsP5Gs2hM6tSR2qtKU3yh2IGKwiRkVzQRQfwaoUa6najIScKVO6+JwBE9ZTz5cZs09hCypAGEAFLdgPRqBfaiZKTk3kNwSOQagvGhbtRZryOrrIFWeB7jMp5qNYg/a8EVDmVhAh73b4wOjSMwIBAKV8cmeDVQoEgyJL12fmvUY/9Lt+tVgmgp9ESzdnagHlyahcf1B4aIsxiZ24m9uwJpGvWkqdhLQNAYMNyaJhli7ZrUm6+mWd+zGMl0vlNL1CudaA78GhvA9LiTfhg3FHkW3ENQ5uG33YKRtlLJ+vWMS1bkFNb31LwQlvrBT5n7RipPEWbAF6egeCYpngYoVj2XXQQ3/ENsGKjPEE2WT/6qMKz/kVncZ3mvk2faqVBNJKhF3phIFtXCZbihNz7BYN1l0ZS1TGA3zxszWzZ7Jt/4Cn0dV8hoIl93rojYEl6HwZps0ZTjI+i1RY2GWl7opYlOAxRR4FwksQnkubxAXiL9yKsacRm63ef4j9qrrvD8z4HeFXrKInKZIMQyzo6BccNGl8t3CakCEh13bURxT4767i/ium6v2KS7zgAAAABJRU5ErkJggg==\"\n    },\n    \"ctrl+s\": {\n      name: \"Save\",\n      description: \"Download image to your local filesystem.\",\n      method: function(_arg) {\n        var editor, name;\n        editor = _arg.editor;\n        if (name = prompt(\"File name\", \"image\")) {\n          return editor.outputCanvas().toBlob(function(blob) {\n            return saveAs(blob, \"\" + name + \".png\");\n          });\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACs0lEQVQ4T42SS0hUURjH/2fGO2MPTC3p6VQudBEt1Bm1UWgXCEW0LNpIlk5WYoq2UYseFAmaYaRNAy2KApMkq5lRepChjJqaiUJp4cKyRTgzPsZp7jl954xEK+teDt/HPff/+57MWuwpE2DbDQx5AFLIXwuIGMbAIOgLPUa6NNARgkPnmDVp+BwKLV3rbz7QymwO7x1nVV4h6P+0rWalEVwgHKHziyvxKrMBBMTcIsdcSBcT03P6PfeEf+zrTBWzOjrH71bmprX5gqg6lCTlOH2jD9eLMxHhQKzGYNIMWCKYf0EnKzA5swAjOC64BpYkYNZZmbvucW8AFQc3qJTPNvXjyokMaEaKbjJQ6kBgUcd8iINTdq6uH8jPjENZY4+QgPDtCrvW7gugJH+9AlQ7B3GpMB2rY43QqITFMBU+r1NGEgACzCB9hxl1D96DAF7eVG5nT6mE4/sSFYA0WGM2UnSGiE7RKfWFsK7Egl6X9zt2W0xoeDQIZjvpFY2ldjzrD+Db9BQ1izpOAC2GGkewCKUcoWYsD0QFiI9PxC6LGU2twwRweEV9aQ6e9/lVrVKl5qcUAqSnyASgSy4P+QYKkrqJoeXJSBRQdyoH7gG/ov8ZPoFkw6RQzl+lT1ZIh8ApSQyujo9RwFVHFrqGAtGtoUu5Q9LqEiCjy0zI51xXO0IeLIkC991jEuARl4uy8Go4iNoj25YhK5uKllEkJwg87BwHy6Ymni+04c1IALWHk9Hw7tiK6lK7E+XNH7AlXqDt5ScClHhFTYEV3aNB1BDAN/V6RYAteS/Kbg1hc5xA+1sCUAm8usDKesYkwPJfGZy5OYCNBOjonpCb6Jk8dzRjp5zh/uzoKv/ruejyqQa/6P3yk1mL3PXU11QwsYcJJNDw1Oio3Wpsf1sZJDpWIRh4UDDjyG82p2waquUVyAAAAABJRU5ErkJggg==\"\n    },\n    \"ctrl+r\": {\n      name: \"Resize\",\n      description: \"Resize\",\n      method: function(_arg) {\n        var editor, height, newSize, width, _ref, _ref1;\n        editor = _arg.editor;\n        _ref = editor.pixelExtent(), width = _ref.width, height = _ref.height;\n        if (newSize = prompt(\"New Size (WxH)\", \"\" + width + \"x\" + height)) {\n          _ref1 = newSize.split(\"x\").map(function(v) {\n            return parseInt(v, 10);\n          }), width = _ref1[0], height = _ref1[1];\n          return editor.execute(editor.Command.Resize({\n            width: width,\n            height: height\n          }));\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACLElEQVQ4T91Tz2sTQRR+05hmTTeB0iS7h8ZjLyEKgoVehCLWFG0g0ahrMEpp6rH++EMUFH8UUbRIq7ZZ21qoh14UjfQiQkXpQWKSJmlcyzZmY3fj7DhjGklK+g/4YBjmzX7fvve9+dC15CUCNIhJgBC66H7j8H3EcjsjvhAlJr03TRNMXNsRIzjU2UcPGJaV5K5gRibNSoKjzVrwu/cDQgiSqXeArr4dJQc7e6FS1UDRFchpWflW/8Pwzr8zsI2QVS/vdXIWDuxWHpYz7wFdeRMnFmQFgRNBtImQKqcg/zMr3x543ERyQT6reB3dXZ4OAVIb3yC3uVZrYez1CNEMTeQQt9rN73Pqhg758tqru4MTgcYqzk9H5oUO8YSJTciVcvLUOTl86tEQ+SfWCC3Rutf6iYqUvBeYGGolojQVXqQiVxi4ft9S7Vbg3XL/G0FsJpLA2LQ/OT3TNIF6/8HxwXmCcV9Fx76ly0vrLI+G5yTyIDiJGNjFeUJstvlS/uXT6IumSQTHA4tu3nPMgiyQVjKlKiY9FiAFdFE+8/d9uzg3CHYRiloR0hvpH89js65G5Y/fGUi4HZ6Q6KTfbBZhXS2AXjUAxaYjxNflB/WXCjrWIatmSltbWs9cvFZiYwRuHknQKkLt7XuAtzlhJbUCKPrsJPG7DoDx24Av3z9DuaKKrcB1oqPX+4nP64M2aqYPXz8CkibDtAVmT7q2rSoPL7R8HwzM7G5u257Z/w969A/vqEbP0wAAAABJRU5ErkJggg==\"\n    },\n    \"ctrl+shift+c\": {\n      name: \"Clear\",\n      description: \"Clear image\",\n      method: function(_arg) {\n        var command, editor;\n        editor = _arg.editor;\n        command = editor.Command.Composite();\n        editor.execute(command);\n        command.push(editor.Command.RemoveLayer(editor.layer().toJSON()));\n        return command.push(editor.Command.NewLayer());\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAC4SURBVCjPdZFbDsIgEEWnrsMm7oGGfZrohxvU+Iq1TyjU60Bf1pac4Yc5YS4ZAtGWBMk/drQBOVwJlZrWYkLhsB8UV9K0BUrPGy9cWbng2CtEEUmLGppPjRwpbixUKHBiZRS0p+ZGhvs4irNEvWD8heHpbsyDXznPhYFOyTjJc13olIqzZCHBouE0FRMUjA+s1gTjaRgVFpqRwC8mfoXPPEVPS7LbRaJL2y7bOifRCTEli3U7BMWgLzKlW/CuebZPAAAAAElFTkSuQmCC\"\n    },\n    \"+\": {\n      name: \"Zoom In\",\n      description: \"Zoom in\",\n      method: function(_arg) {\n        var currentSize, editor;\n        editor = _arg.editor;\n        currentSize = editor.pixelSize();\n        if (currentSize < 32) {\n          return editor.pixelSize(currentSize * 2);\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbklEQVQ4T6WTbWhSURjH/15fptPltJm2pJkGLRdUNAZBY/TycZ8EI6LojWAUYxBBtL74KSKCYDSEiCihDBcEvdArgy2C1WRbc6GN3jaXIpMcvl7vvefa8YarMT8IXe45l8u9z+/8zvM8R4b/vGSVeI/Hw3Qe6R8UiNhNiNhMn+AFISYIwtPwsxtn6Xex2loSQAo+3D/cqC51GeplUDAlgN6sUMJ8ksVcIj8SHb25rxpEArye5bwGtdhj1jHIFAlYvgRCAUoGaKiTY2C6Dzk2Da7Asz73kOZfEwnwPJyPbmmSW1lBRJ4rQSzRQYWpAOoUMng/nsQBy1Y8CgcxdOzJ8rbLsdLL41CWbG9WMotZAiKWATSYToFv55HJpWBW6mBf04TJhR/4Go+jyHKp0UtjxmXAw4klsmujhklkBAoA1f9jcHv6BDrNDroljo4izUkRBa6IN+MhfLg8JS0uTffHktGdLVprjurnOFEyKJvcm+zFr3QcRpUGVqMen+YWMP9zEcUCx4YGIlIuJMCdkbh3nV7V47BokcoTZMsQalCnlMGgkaP37l7scGzA2+AsJq6FVuegXEZTx/Fhy1p1l83SAJWCQbnoBVZA6EsSvndHkcmmoOaJeE6jcx68GvxcqcSKRtJsOzTI8aSbF2gj8QScQOImdobbrw9tsjo7EIuMIxJ8lSxw6T2nvN8lyAqdap0WcLeplPZGv6ml1WVz7kY08h4zwRfJ07eippoAUqdSyGaz6Dfb2lz21na8DFzHGV/ibxVqOU8eN1QW7Xq/QqV25TJLV/r8qYs1G1QWcLshb5fXmy88yMdWJbEWi2r//AZSUiAguj/HUQAAAABJRU5ErkJggg==\"\n    },\n    \"-\": {\n      name: \"Zoom Out\",\n      description: \"Zoom out\",\n      method: function(_arg) {\n        var currentSize, editor;\n        editor = _arg.editor;\n        currentSize = editor.pixelSize();\n        if (currentSize > 1) {\n          return editor.pixelSize(currentSize / 2);\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACVElEQVQ4T6WTS2gTURSG/0zejaVNbUws0aZVamgFFUtUiBQUF2JXgYiIC0GEqovufBTELNWFblpSxIUPMFK6EsVaMVBXPoIuUkwqbUXHJA0GE5vMdDKZO+OdkaQqkQYc5twLdzjf+bjnjA7/+eiq+aFQiNl/YmRMIvIgIXIH3VGRpLQkSY8TT0bP0e9yvVoaQEs+PhJttSgD9iYdDIwC0FeQFHzJCfic5WfYl7cO1INogOcfxbDdIg851zEolgmEigJCAUYGaDbrkUgVsZAujg8f6Trzt4UGeJrg2W3tercgyeBFBbJCgwpTAZgNOhh1CqZjqa/nAz2b6gIexUtkR4eR+VYiILIKoMl08d2/Bn0+D7nEgfwo0VgGKahRyrfNx9tUmGYw+a5Adm+2MtmiRAGg+r8M/KMXwe/1QhbpOQ1ZEEHKFRhu3EV7ZlHL1ZYHr3Lsrk6bm6P6nChrBqrJnvErMLDsamVqodkIZcGZT1lrgDszmfCGFtPQFpcNeZ6gpEKogdmog92qx5sPS+DmXgg9hcmdhy9Pzf1+D7U2Onwno671lgGPqxkmAwO16SuChPh8Dtz3JRwyRbH4fjq3InL+o9djNcgfg2TdfmxMrJDBikQHqUIgSiTjEGbFgy3xLnevD+nkWyRjKmTZfyr8SYPUAP+a6Ilgn8nY3RpxdHoDnt59YJOvMRubyp2+zToaAmiTSiFbnXLE6ekLdHv78WziJs7ey652oZH/KRSEyWXbGDGYLAGuWLg6HMlfatigWiAYhL5f3+S88JBPV8/WvIO17H4CfCMpIEZZGWYAAAAASUVORK5CYII=\"\n    },\n    \"g\": {\n      name: \"Toggle Grid\",\n      description: \"Toggle Grid\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return editor.grid.toggle();\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVQ4T2NkoBAwUqifAZsB/4GGIovj5VPVAJBNpAJGqroAZvtoGDAwjIYBFcKApOQMANUmIRHQ0q3yAAAAAElFTkSuQmCC\"\n    },\n    \"?\": {\n      name: \"Help\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return window.open(\"./docs\");\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC7klEQVQ4T6WTW0hUQRjH/+7q6mpkbLK663ZX28pExDJLKRRKKypZiNouVoTggy+RDxEoCSEp0UNJPkSloYTdoxtYdNE2a7vRmou4mWjppuUF3T3n7Dkz03Rku9JDNPMwM8z8f3zf9/8mBP85Qn7X3+sS52kJszOGnZSxOEoJCGNeSli9pIiNBemx737W/AJodvttYPT4nOlhphDGhYSobzUaDQJ8+/aDb0AmSol9hflSEPIdcKd93MYIrbOadFFjEwI6en3o/eIDoQzGaB2SLVNhmBaBxx2jPkUhhUV5s1WICrjhHJ1LNLQl2RJh9o740ewagik6DGvTzGB8Oj0jeNE9jJXWGFhiotD86lO/oIjZB2wp3SqgqW2obGG8/pAkybjq7IckyijfuijI5ytD9ZUOBBSKvLR48Prg4Zv+8jJ7aoUKqL//sSsjaWpC69vPcH8c5WFT7NtgxeueEURFaLEsMQZtXYO42NqNJMt05CyOQ8Pdbs+RvemJKuDk7R5/bopBf+7Be4wLMmQi81oSrFsyE5nzjQjIFHde9uGJ2wt9uBZFecmoudYu1JRkRaqAo5c7/euXmvRnOWBsYpyLeeY8zKrdGRiZkFDd9BJiQOGJAHqdBsUbU1F1/pVQV5ozCahocHUVZFkSHroG4e4b5vbJoDwN7orqFpEVXgZ+5jNhRgzWLJ2FIw0vPBfK8ydTKD31rCw31XxoSqQOFx+9g08QVGHlnkzwZsL+2gfqORQUW1anYGhYQOM9d/nNyk2TRSw+1jIXGtaya43VPOqTcM3hgSAGkJZgVIXOzgFoqIz8zAUwGiJx+NzTfpGI2a3Htk3a+G1sr2y2UUbrijemRMk8dIfrA3q9w6DcuvjYaCxPtiA0VIuKMw6fTEih44T9RyMFIZsOXrcpjB3fvCrJZJ1tQLhOq14JogKXZwinb70ZkCkteV67489WDkJySs7PI9oQ9TMRhcZ9qwGhxMt7o16SWGN73a6/f6Yg5F/WrzeMbiDawgJJAAAAAElFTkSuQmCC\"\n    }\n  };\n\n  Actions.extras = {\n    \"ctrl+b\": {\n      name: \"To LocalStorage\",\n      description: \"Save image base64 encodeded dataURL to localStorage.\",\n      method: function(_arg) {\n        var editor, images, name;\n        editor = _arg.editor;\n        try {\n          images = JSON.parse(localStorage.images);\n        } catch (_error) {\n          images = {};\n        }\n        if (name = prompt(\"Store image in local storage\", \"image_name\")) {\n          images[name] = editor.outputCanvas().toDataURL(\"image/png\");\n          return localStorage.images = JSON.stringify(images);\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC0ElEQVQ4T6WSaUhUURTH/29cMlzGbUbScZkKTNDUPqjlAhEkmZCZJYgVSvnBDxGlpEJGJBIpBhUarS6VSQVK0IKDC+rkEqiYjpNbYqONjtu4zDi+92533lTalyg6cPnfc+49v3vuuZfBfxpjzq9sms8nhJzlQGQ8z4PjAdasdMLxBCzVjcGBY2mM57qun/IPEwDljXMzSRGO7v9STH718FpJeoCdAHjYoCPJe8WoHS2nZJaexmKd6jq3blGWKo39XMvdV4i8KjVuZQQyAuCeYoakRDrD3s76r4pYMbLIfjyAssxgC6DsvZacjHFFXdfcHwGuphbIv72AlUMQVnTNYFa/nhYAt99MkbT97gIgJVqKmlYtkqM8fsFetmsR59sOvUqJrZJoiOV7sDCmxOC7+1oBUPJaQ84ckOBt9zxE5oCIAQMChjpm38mgQIhkCA5OoZgbVkPsvgO2jlKoGiqMAqCodoJkHPSAom8BiWES1HbOIIGq2Yy01FWtAs7bY7E29RyGWQbTg6vQr1L0yqS/ACh8NU4yY7ehWbUAS1cs5mBoQ4hzB8Q7j8CoKYPIlr7Isi90HQMonkpFad5xy/arNWPkXJwnPgwt4lCoBPW9OgTZttETlJAGHqXJpRDZsDAtyTHb1gtT+BUUKnhUZkVYAJerR8iFeBk6R/T07gA/WQ9vUTd2xcTDpK0AY2WCcVGG6ZYejO4uhp+PDNeq+/H0UqQFkFulJtkJfuge00Omrwe72AeWkcLNrQ0uUlua7I2Fj2p4J92BjdgL6olFFNb0ozL7ByCrXEVyE+XCv2+8exgnMh9BXX0Rmi9KbPEJBr/MQxJ7A4yz36/+FDz7xD/JibISKjj/oL+VY7kQE0fsPXtSkZOeQd+PQ099LYbHJ9AoK8CsyGuju3Q2rzfUNRXFJmzquWU9KcrFECqXWocH+IG3MSmXJjVpx25+Hv0te5PzHS7ETRuBCPcLAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+p\": {\n      name: \"Share\",\n      description: \"Publish picture to Facebook.\",\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAALoElEQVRYRzVXeXBV9Rk9d31rEpJA9p1VCKBQJoEIYooOKgmKA3XBLSqiEnQcWzsSa4vOyHTRVgVG3P6onamt7bS26NRWrGwBxQpIEhCSSAiSBEjy8rb73r33/Xp+9+lL7rzlLr/zne985/t+yrZjT4m9/96DxFAMebm5iNgWXMVGwO9H2kpBz5hQdIG4mIDhV+CkMzAUH3QRhp12oQLQfQqiNs9rAjlmDgq0Emxc/WM0zlwOJaVA1RXIC12+ObAheI8QBlR+V5Y9N1u4CQdmUuWCLoRPh9D4ORFHwBcEbBWKImAbaahGBq6dgZbRoCHAp+hwnDTMkAFHsZARFtSMgM8Ko/32Dtx09RoYwgQy/OchASi6w+X5Dt0DrzQ9XSsCwo/rG27E1MpZSLoONMOEsF0EjRBU24DrunANYhcEkXEJgKAyBnTdhObTMBodRdqII5xn4pvebvzr73uw/oaHcO8tDwJpjQwQLAF4K6r84LjIOGSGIJSVW+eK0QsR/HRDB1ZceQPGwCj452OMDByawwgEFzR1pPnnI3aVT3McJ/tJ0eGqDhlIweDv+3s+xs6XtuO2lvtxV8sDfArvZYAgaO8lAQhJic53MtD8zFyRHEuTsiewdNEKRBMJmAYpTUTh15knl3SrJpJCgeWm4NNdL9ci48BQg3xegM9WMWpdRmiSjgOff4o3dr2O+25/BLetvMMjWiE0lwvqCuEoTIHgykwlw4OydMssKkxDW+vDWDhnMZKWQ2pVuFYMOQE/MhaRa0EMR1zo/iB0zeYDbOrFIgDTO28GgrAyaYQKwuj8Yh/+8t5fsablR7i5ZQ00RmtoTBUDkGlQXK7rZGAqKkLMjNL83EyRvOTgoVs2o2nBCly8FKHoiFleyRsCRgFOnBzGu3/7DIk002CnIFyJHgj7fXDsJCPUkHAE9eDns21EYwlMypkM3dDIVJIAFAiHn3mNIFCqB5NyC1FUOIUMPFslRExH202PYsn8azEWScDnY5mpLqx4GrnhUuw92Icdb35CiquQEybtpDydckD9QVFZtukUND0XaSlOgvcHQkjEU1CZKqhxMk7RuTpMitZghSUTFpJxh7/x/uU/rxZOBNjQshmNc5dhIkZqJXKXkVF8wWAR9h7ow8639mFG/dWYWlfJkmKl8E+IFAJ6mopmKWq5XJQiJXhV1cgUGSGAjJYgVxStTRYYuTw/PhHFkc+PedpSrvnF9wA2YXG9BECKCADfAQgECrFvPwG8fQgzZzegpq4kS6NqeFpQVQKw0yxNEznBEFmbgG3TyEL5SFhxai0OfygITQkzNUkE83IwEU1if+cRlidrqum5auGOk4FWApizHLEoy8nwUShpMqAgFCzAfpmC1w9i6syrUFWZA9eJUyM6jYdiZbRywdyAD6nYZS5kIT8/D7oZgkt12PSQi2MRCq6IC1swCTJOB/3f8W4aE1PW+HyNcCOCKZAMEMCEzVxJAIyOC4RDZOBgL3bsOoCaqfNQXkb3S03QDyhAUir8OUgmGaVcOBe47tpFmDGjjq4JBgJ8vK8Puz/cg5xQCQVqIEWjY2joPTcEizpSGp6flgXQutFLQRYAa5tupQoNvkAOOg8NkIFOAqhHRZkKkY7RiBkh/TzFw88eYU0M4s5112PhvDLP6xOsVmm9x7ou4b33/omgfwqVwOsZWJxl2D9IANSJ0vSLK4Q94WQBzF2CaFRqgPXPkpEO6A/k4sDhAex8/bPvANDBJACRx/MGy488aKwIjKPjJ3fCx6jJLL46OYIYG9HxnjM4eaqf5ZyLFBc0WboxK43j3f1QuI7S3DFf2Mz7htYH0TivwROKZvqYZ9asVG0ozwOwnQCqa+ejopS5Z8f0uwRAlxR0xnRyFLUlITz26CqZOUgJbfvtn9F1ahDFlZVe1zR1P7XiIkCtJFMZfNnVzyoJZAG4pH3D6vvRMHexB0CK0GGRZmijZpDu9tk5bN91GDW1VxKA7JA2izDksSS7mybiKC808dC9rVwApBl4652P8O3lGO1bRYoApBsKWnCGbdFxVHSfGfTsWVm2dQ414KLtxgfQVL8UyZidBeCkoNA0pP0ePT6EF1/8CDOnN6CiJB+plAWHTcX0G4hOjGHVyqVYsrAKYdLvZ4YYKCIWWzct/aP/nsa+A0foJwGWZIby47OZ2hNdp2hSCpRFW+qEbulZDcxeilRcqpdiSbOGWUI5tMsDB0/jzV17UV50BaZXV/NGgQk3wbmBbhmN4dbVK9DcUEqJsW1I6VB8zATVDvz+3S9wtKsX/qBkVc4BflhkrufkSS9ApXlrvbBGLbSxdS5bsBzRCFurbAN0O3+YNU+3OnS4F3945xCqS+eioqjIG0JSBKHQ40kHZk8tx7wZxWi4spq55r0EceTYNxgZT+NY9xAujEQ4NbFk5UDC1hxnjk6e6WUg7IbXPDNLuFEX97W2YfH8qxFPsFjMbFNR2I6DeYX45NMevPLSB5gzvQllBVO8XCqUu0snUNMcsawIJoddPPn4XRxiGDnDf/m1P+Hs+TGE82uQpPrZPghANg8diaSNr/sGWMZMQdOWacKwTdzT+gAWzFpIAMw9c3dh5CyGLo4gkDsZPT0R7PnwAqZWNaI8vwg2I8hQA4KHwUO1YyjMzeCpx9dxUspOPq/seB8DwzGmKczD54lPNiqFSCxWQU/voMe00vz8bDE2NI4Nazfi+mU34tzAEA4f7sTBzn24NDbGhQKkvIjzwTSUTZ6HaaXVXEQgzT7gC5jsikmWZQSVRX5s2riGOfa0xarZjW9HkqxU+j1tUY51sosKzgeca9Fz6rw3kyiNW6uFQrWsX3UHith6d/9jD/pOD6KqpAZNS5rJRghDQw7+83E/igvqUFtcxAUERSpnRCAYDtG8LqJ8ig+bH7mVPcKbtPDSq7txfiTmDSvS03Q5sFE3NueHDAF1dZ9lmbMbLnq2gl6iob6iHue/HkJ03MH6tW24oXkVJpmlzDIv7r+E9s2/Rv3sH6CAE7BCDRg+kwDIBGtO4Rhfku/Dpkdv9lZnBvGblz/A5XHOBIacnLkUdSXbctKK8gIDX3UNkBk6YePTNSKo5cAadjCzbA7a7n4YV9Uu8KjSFfYE1u3howPY+sIfUVQyHRXF+SzPGH9nCzY5vnLsTkUnUFzox5NPrPGGDIob2371PqJxoiElEoCcgmT1+AM6okkLp88MsTFRE/e+uk5cHLyI6xqu4yR7B8LaJLqczmrVPZo1ttXPvxrG5qd2oLK2HtPrKuiWoyxRA/F4nEMqBxA+uKosH/esv4aNiQ7NWF974xDOfcv2LGcLuVegFbu8TuPXSCKGvv5hMkgA5zJjnC9SKOCk4vcGa1LK5BpayNt4uAziRO842rdsR0FpHUqLJ3vzoMtzl0dH6YSjFKWcjICaqmLSys2NpuN03zDi3OhIU5Nt3VRMjhhydGOZkqZRWr7pYy+wWNRSNCbLRJUzu0yiZ2VMJMcoNnp0HhtCe8fvMK1+IYqn5FN0UXSfOO2pOp+bEfYXTrsOx7gUfSnBLmfACIS5QIi0ExAp0dk5XZudU3ZL6iLDR8vpSBEZIWy536MtejsX+ZKIsoOvt5/oPD6Cjl++jUlFFfBxAzJ0gQLigretXY2WlYs4HWctWLogq43uyRu/6wkyOjq2/Mo9htfhvfNyg8YKheLQpjR5p6SVOeemwMuTB4A3s0Bw8OgFdGx7A75gDmKXz2JGbTmefKydndHHvYPcXvAlzf/7+/hus7ZpVbKhZ/eA2S1h9sUfMqrNZDPdkgGXQ4UmOwlvkA1EtgypWhkN96E48GUffvbCTg4eJta1NOPutT8E96rshtmIaHAezfLdG7X5LIdbPDkHK3ITy2A0KSbvwixQodKkiFphT6dFy3DlV4mabsXDkG1TbuO4wIUI54VNHWhvb0fzwgqE5KIyInmb3Dp646fHg1cC1CefFPNcUUPQG+/lrlkG5rEq2EOMlAfy/zaifUZYoqDwAAAAAElFTkSuQmCC\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return Facebook.requiringPermissions([\"publish_stream\"], function(_arg1) {\n          var accessToken, userID;\n          accessToken = _arg1.accessToken, userID = _arg1.userID;\n          editor.notify(\"Publishing image to Facebook\");\n          return editor.outputCanvas(8).toBlob(function(blob) {\n            var formData;\n            formData = new FormData;\n            formData.append(\"access_token\", accessToken);\n            formData.append(\"source\", blob);\n            return $.ajax({\n              url: \"https://graph.facebook.com/\" + userID + \"/photos?access_token=\" + accessToken,\n              type: \"POST\",\n              data: formData,\n              processData: false,\n              contentType: false,\n              cache: false,\n              success: function(data) {\n                return editor.notify(\"Successfully published!\");\n              },\n              error: function(shr, status, data) {\n                return editor.notify(\"Error publishing image\");\n              },\n              complete: function() {}\n            });\n          });\n        });\n      }\n    },\n    \"ctrl+shift+s\": {\n      description: \"Download project file to your local filesystem.\",\n      method: function(_arg) {\n        var blob, data, editor, name;\n        editor = _arg.editor;\n        if (name = prompt(\"Name\", \"file\")) {\n          data = editor.saveState();\n          delete data.history;\n          blob = new Blob([JSON.stringify(data)], {\n            type: \"application/json\"\n          });\n          return saveAs(blob, \"\" + name + \".json\");\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+l\": {\n      description: \"New layer\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return editor.execute(editor.Command.NewLayer());\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB60lEQVQ4T2NkgAAZIBYHYmYoHxf1CijxCIj/wRQwQhnGP3782MvMzMzLyMjIhE33nz9/GGbNmjUpLy+vH9kQmAFmv3//Pv7z508moAFw/SBN//79Y/j16xeDsLAww+vXrxnWrl07KScnB24ISDUImwIVnwQawsDExATWBAIgA/7+/Qs2QEhICEyD5BYvXjwpMzMTZMgDFANAimEApPD///9gQ4AuYxAUFETxGQsLizlQ4DSKASANMC+A2CADQRhkCMh1IENBbDExMQasBqAHHrIhMMNAhvDz8xNnAMhAmCEgjSBDQHwuLi7iDQAZAgsPWBixsbGRZgDI1l1n1zPsv7CV4ePX9wy///xmuH39zsyjC25nogQichiANMHA1hMrGS4838NgrGXCICukyrDvygaGE1cOM9y/86aXoAEgg9In+DP4e7oBEzoTg79mHkPPnlRgmmdiWLFu0w+cBsACEEQH1JsyZEVlM3hpp8BdtenyVIbWGS3gVAhLiSegbIys4FSiyuDj6cAATNgMlW4LGNp3JjBwMLPDXQDSYAJMbQeBmYkDyMbITDO3dDLsvb2IwUrPhkFV0pDh9vPzDMcuHWF4fP8jOAxAQBaIQdkZa04EKdCJFM7m4GcNAWYVLmCS+Pbn+5+FFxa+yQIAB8Ulv4JKPAEAAAAASUVORK5CYII=\"\n    },\n    \";\": {\n      description: \"Download localStorage images as json.\",\n      method: function(_arg) {\n        var blob, editor;\n        editor = _arg.editor;\n        blob = new Blob([localStorage.images], {\n          type: \"text/plain\"\n        });\n        return saveAs(blob, \"images.json\");\n      }\n    },\n    \".\": {\n      name: \"Download\",\n      description: \"Download image as base64-encoded byte array.\",\n      method: function(_arg) {\n        var blob, byteArray, editor, height, size, width, _i, _ref, _results;\n        editor = _arg.editor;\n        _ref = size = editor.pixelExtent(), width = _ref.width, height = _ref.height;\n        byteArray = ByteArray(width * height);\n        (function() {\n          _results = [];\n          for (var _i = 0; 0 <= height ? _i < height : _i > height; 0 <= height ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).forEach(function(y) {\n          var _i, _results;\n          return (function() {\n            _results = [];\n            for (var _i = 0; 0 <= width ? _i < width : _i > width; 0 <= width ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).forEach(function(x) {\n            var index;\n            index = editor.getPixel({\n              x: x,\n              y: y\n            }).index;\n            return byteArray.set(x + y * width, index);\n          });\n        });\n        blob = new Blob([JSON.stringify(byteArray)], {\n          type: \"text/plain\"\n        });\n        return saveAs(blob, \"array.dat\");\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADh0lEQVQ4T12TbWxTVRjH/+f2dr3t+kbTdVtKGQtmyliNdhKYG5MhOkJ40YkoBjYMZhACiSTG+MGEGL9A9Isx4ktEMJlLdCEGhE1exqo1Q+KAVTokDB3UdW23dV3v1u729px7vMxIFp9vJ8/z/M/v/M/zEPwvDgZ3ruEG8SDhfKWeKgGIyAnPEJCrjNJjx5o6flzYQv47rO1bK/oNFSf1hm2bK9abXOYSZHLFyKkAZQookugd66aMsovTGba9a3vX7IPeeYH2z2uNRctr+lZ6auqbfesgKybkoWJYJijiJqRyGjhVYUYW8XwIA6MDv+cn5cauvZd0Mj0OhHZ/U+uueu0Zbx0USODMDlUt4JZshNFgQizNUShQGBQZlSUziMq9+OnOYM/3bT0byf6+1gZBFC6//USbMUyzUHTJYmYFcm7EskbkCwS3788AmorS8hQ87hE8JXlx+IdPWUGlLxH99lMbvKtaymw+3BEpBF6OSiohFBOhURHDiVkQaQoW718QpAQ0TUFgthREmcNX/WcvkAM/7462V7f4buQSmJAEVBtWYxGj6LzOoSgMjnIO2fUdxrRpnYLDSU2ojJuwvjKAd7s+jj8gyL7p32XpTIQwbsjBb9kAm2pH968aHCVzqFiSw5A2hZF8GCY+A8tEGovTFux5eiv2H39/TidozR3yt5lPRM8hDR8CjhoE+3UPzFZkkzK8ywCrJ4kZ3VA5VtBNHoBTHcG+plfQ/sVhhezr3TW6t6bFG5y4CVVqgJIWEbllQZHNDg4B0xMpKJNZHV+BwyPAWfwn3OQGmmvX4K2vP0ySN87vOLNxyerNRpMdl+KjesEjuBvxoSBYwQ1OFPT/z8spsNkMnA4Gu/gbVixVYOUSPrl4Kkjazmx7nlJ27p2GPeLJ8FkwYgTNv4CplP4MyQPGNOTG/4al9C7s0jBILIodzZtw6MsjXEfcOT9IL3duOr2qfPmWqrJluJa4B014FpNxC7jkAqUc+akYrK4OaON5PFn9GKKJMXQPXgkOHrnZNC+w5Xi9TWPmX+oWr3h8XaARt8dduH9PJyFF+gQK0E2Ar+oKHrUvxeVr/egJXx0uMNY49MFQ4uEy1R+tt5mM+Jaq2nOtDa+LYGXg3AIiELidMpKp6/js/Gmmc4foHH818lEk+XCZFq5n3XuBF6nG2xnV/Fzji/7N8Qw4+UPj2onw0UjHwvp/AEX+mWg8VyxBAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+e\": {\n      description: \"Export palette.\",\n      method: function(_arg) {\n        var blob, editor, paletteData;\n        editor = _arg.editor;\n        paletteData = Palette[\"export\"](editor.palette());\n        blob = new Blob([paletteData], {\n          type: \"text/plain\"\n        });\n        return saveAs(blob, \"palette.pal\");\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC/UlEQVQ4T4WTW0gUYRTH/98s4+66umYGdjHSXLesyMi18qEg7EHKsB6kIunBHoJuFBj4YNBDBEFBUUmUQS1FpaRlCEEldiEybdcSzLVMLc3bquvsdcaZ+Tq70eXBapgzhxm+8/v+3/+cYfjPdbhobVZ6WsqBOckJBeCaNioFnnweGrtWVe/6EC1l/6o/sWdjWVZa6nH7Ult66nwOcCu8I2H09XqGOvqGTje0N1f9DSBcPFLsXLYoaeeKhUbD7EwNhhQPdMWEqa+l0ONEfOpq1eqaWnfOCDh3cHP1Bkf+3uVzfWCyGxoXIGYbEJzWUT3AYTaYsU0vRFPri0czAmorS4JbwsnxPCCBFcrgphTIYj4GfR14au1A3DRDiboJ7n7PF+Z5uLrdaF2+jDHhlx3vngligV+EHg4hWFyArs4WyWoxipibbT78LQkWTcHtWR64vcOTrLvBEbEVtRgZIzHkU/TRcGovVq1bjwRRx4RPQpurUY8XBBafU8IqxtJgUQO4P9sN99iIn3Xfy/XZil8mKcNV0BQDIFjR3PgWSkCBqEewMicXfp8XokGASYng9aAX6fPSkJpowKN3rjvMczdPsm1/khgZcILrHLo8gfBoL4Kj41BHh//a5TYp403N444dBMhVFm9tFCddlyCP9FCrQjAYkzCv6AwNCcPAx3aYtBDMogmqNg1ZsEB6Wo6K+mB6XdOHfua5mafYd7eQYwrtppMFnJT4oUqvoEd6IctBjA/5ACrmLIRk+zF4a0thP9QW6yDzXHfIWaXP4/TQe5pUH4WfCvsIpNMdIWaYcoC+R4OUZJxHz9WtvwHdlx2RzLImo+ZvBlenaBGFSjtylYJmQAv+gKpSLFvsTvRcKfoDcMERtu17bJqefBArjEUM8hPmp/doMYFIkWXJLfTe2B+hI5hjR+g6u/rb4rKaeGWiJZG0C5xHZVNQ5ppMWSFbKEc94hqMC3bxfudRaUm5a1YM0Hky+wgThDWMs01gPPGff3d00BgUarczu7LzUHTtd5jOkNp6KQ05AAAAAElFTkSuQmCC\"\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "brushes": {
      "path": "brushes",
      "content": "(function() {\n  module.exports = {\n    pencil: function(point) {\n      return [point];\n    },\n    brush: function(_arg) {\n      var x, y;\n      x = _arg.x, y = _arg.y;\n      return [Point(x, y - 1), Point(x - 1, y), Point(x, y), Point(x + 1, y), Point(x, y + 1)];\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "command": {
      "path": "command",
      "content": "(function() {\n  var extend;\n\n  extend = require(\"util\").extend;\n\n  module.exports = function(I, self) {\n    var C;\n    if (I == null) {\n      I = {};\n    }\n    self.Command = {};\n    C = function(name, constructor) {\n      return self.Command[name] = function(data) {\n        var command;\n        if (data == null) {\n          data = {};\n        }\n        data = extend({}, data);\n        data.name = name;\n        command = constructor(data);\n        if (command.toJSON == null) {\n          command.toJSON = function() {\n            return data;\n          };\n        }\n        return command;\n      };\n    };\n    C(\"ChangePalette\", function(data) {\n      if (data.previous == null) {\n        data.previous = self.palette();\n      }\n      return {\n        execute: function() {\n          return self.palette(data.palette);\n        },\n        undo: function() {\n          return self.palette(data.previous);\n        }\n      };\n    });\n    C(\"ChangePixel\", function(data) {\n      if (data.previous == null) {\n        data.previous = self.getPixel(data).index;\n      }\n      return {\n        execute: function() {\n          return self.changePixel(data);\n        },\n        undo: function() {\n          return self.changePixel(extend({}, data, {\n            index: data.previous\n          }));\n        }\n      };\n    });\n    C(\"Resize\", function(data) {\n      var height, state, width;\n      width = data.width, height = data.height, state = data.state;\n      if (data.previous == null) {\n        data.previous = self.pixelExtent();\n      }\n      if (state == null) {\n        state = self.layerState();\n      }\n      return {\n        execute: function() {\n          return self.resize(data);\n        },\n        undo: function() {\n          return self.restoreLayerState(state);\n        }\n      };\n    });\n    C(\"NewLayer\", function(data) {\n      return {\n        execute: function() {\n          return self.newLayer(data);\n        },\n        undo: function() {\n          return self.removeLayer(data);\n        }\n      };\n    });\n    C(\"RemoveLayer\", function(data) {\n      return {\n        execute: function() {\n          return self.removeLayer(data);\n        },\n        undo: function() {\n          return self.newLayer(data);\n        }\n      };\n    });\n    C(\"Composite\", function(data) {\n      var commands;\n      if (data.commands) {\n        data.commands = data.commands.map(self.Command.parse);\n      } else {\n        data.commands = [];\n      }\n      commands = data.commands;\n      return {\n        execute: function() {\n          return commands.invoke(\"execute\");\n        },\n        undo: function() {\n          return commands.copy().reverse().invoke(\"undo\");\n        },\n        push: function(command, noExecute) {\n          commands.push(command);\n          if (!noExecute) {\n            return command.execute();\n          }\n        },\n        toJSON: function() {\n          return extend({}, data, {\n            commands: commands.invoke(\"toJSON\")\n          });\n        }\n      };\n    });\n    return self.Command.parse = function(commandData) {\n      return self.Command[commandData.name](commandData);\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "drop": {
      "path": "drop",
      "content": "(function() {\n  var Drop, Loader, loader, logError;\n\n  require(\"jquery-utils\");\n\n  Loader = require(\"./loader\");\n\n  loader = Loader();\n\n  Drop = function(I, self) {\n    var callback;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    callback = function(_arg) {\n      var dataURL;\n      dataURL = _arg.dataURL;\n      return loader.load(dataURL).then(function(imageData) {\n        return self.handlePaste(loader.fromImageDataWithPalette(imageData, self.palette()));\n      });\n    };\n    $(\"html\").dropImageReader(callback);\n    return $(document).pasteImageReader(callback);\n  };\n\n  module.exports = Drop;\n\n  logError = function(message) {\n    return console.error(message);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "editor": {
      "path": "editor",
      "content": "(function() {\n  var Actions, Command, Drop, Eval, GridGen, Layer, Notifications, Palette, Postmaster, Size, Symmetry, Tools, TouchCanvas, Undo, debugTemplate, defaults, loader, template;\n\n  loader = require(\"./loader\")();\n\n  defaults = require(\"util\").defaults;\n\n  TouchCanvas = require(\"touch-canvas\");\n\n  GridGen = require(\"grid-gen\");\n\n  Actions = require(\"./actions\");\n\n  Command = require(\"./command\");\n\n  Drop = require(\"./drop\");\n\n  Eval = require(\"eval\");\n\n  Layer = require(\"./layer\");\n\n  Notifications = require(\"./notifications\");\n\n  Postmaster = require(\"postmaster\");\n\n  Tools = require(\"./tools\");\n\n  Undo = require(\"undo\");\n\n  Palette = require(\"./palette\");\n\n  template = require(\"./templates/editor\");\n\n  debugTemplate = require(\"./templates/debug\");\n\n  Symmetry = require(\"./symmetry\");\n\n  Size = require(\"./util\").Size;\n\n  module.exports = function(I, self) {\n    var $selector, activeIndex, activeTool, canvas, canvasPosition, canvasSize, drawPixel, lastCommand, makeLayer, pixelExtent, pixelSize, previewCanvas, symmetryMode, thumbnailCanvas, updateActiveColor, updateActiveLayer, updateCanvasSize, updatePixelExtent, updateViewportCentering;\n    if (I == null) {\n      I = {};\n    }\n    defaults(I, {\n      selector: \"body\"\n    });\n    activeIndex = Observable(1);\n    pixelExtent = Observable(Size(32, 32));\n    pixelSize = Observable(16);\n    canvasSize = Observable(function() {\n      return pixelExtent().scale(pixelSize());\n    });\n    symmetryMode = Observable(\"normal\");\n    canvas = null;\n    lastCommand = null;\n    if (self == null) {\n      self = Model(I);\n    }\n    self.include(Actions);\n    self.include(Bindable);\n    self.include(Command);\n    self.include(Drop);\n    self.include(Eval);\n    self.include(Notifications);\n    self.include(Postmaster);\n    self.include(Undo);\n    self.include(Tools);\n    activeTool = self.activeTool;\n    updateActiveLayer = function() {\n      if (self.layers.indexOf(self.activeLayer()) === -1) {\n        return self.activeLayer(self.layers().last());\n      }\n    };\n    drawPixel = function(canvas, x, y, color, size) {\n      if (canvas === previewCanvas && color === \"transparent\") {\n        color = \"white\";\n      }\n      if (color === \"transparent\") {\n        return canvas.clear({\n          x: x * size,\n          y: y * size,\n          width: size,\n          height: size\n        });\n      } else {\n        return canvas.drawRect({\n          x: x * size,\n          y: y * size,\n          width: size,\n          height: size,\n          color: color\n        });\n      }\n    };\n    self.extend({\n      activeIndex: activeIndex,\n      activeLayer: Observable(),\n      activeLayerIndex: function() {\n        return self.layers.indexOf(self.activeLayer());\n      },\n      backgroundIndex: Observable(0),\n      pixelSize: pixelSize,\n      pixelExtent: pixelExtent,\n      grid: Observable(false),\n      handlePaste: function(data) {\n        var command;\n        command = self.Command.Composite();\n        self.execute(command);\n        if (data.width > pixelExtent().width || data.height > pixelExtent().height) {\n          command.push(self.Command.Resize(pixelExtent().max(data)));\n        }\n        command.push(self.Command.NewLayer(data));\n        return self.trigger(\"change\");\n      },\n      newLayer: function(data) {\n        makeLayer(data != null ? data.data : void 0);\n        return self.repaint();\n      },\n      removeLayer: function() {\n        self.layers.pop();\n        updateActiveLayer();\n        return self.repaint();\n      },\n      symmetryMode: symmetryMode,\n      outputCanvas: function(scale) {\n        var outputCanvas;\n        if (scale == null) {\n          scale = 1;\n        }\n        outputCanvas = TouchCanvas(pixelExtent().scale(scale));\n        self.layers.forEach(function(layer) {\n          return layer.each(function(index, x, y) {\n            return outputCanvas.drawRect({\n              x: x * scale,\n              y: y * scale,\n              width: scale,\n              height: scale,\n              color: self.palette()[index]\n            });\n          });\n        });\n        return outputCanvas.element();\n      },\n      resize: function(size) {\n        return pixelExtent(Size(size));\n      },\n      repaint: function() {\n        var _ref;\n        if ((_ref = self.layers().first()) != null) {\n          _ref.each(function(_, x, y) {\n            return self.repaintPixel({\n              x: x,\n              y: y\n            });\n          });\n        }\n        return self;\n      },\n      fromDataURL: function(dataURL) {\n        return loader.load(dataURL).then(function(imageData) {\n          return editor.handlePaste(loader.fromImageDataWithPalette(imageData, editor.palette()));\n        });\n      },\n      restoreState: function(state) {\n        var _ref;\n        self.palette(state.palette);\n        self.restoreLayerState(state.layers);\n        self.activeLayer(self.layers()[state.activeLayerIndex]);\n        return self.history((_ref = state.history) != null ? _ref.map(self.Command.parse) : void 0);\n      },\n      saveState: function() {\n        return {\n          palette: self.palette(),\n          layers: self.layerState(),\n          activeLayerIndex: self.activeLayerIndex(),\n          history: self.history().invoke(\"toJSON\")\n        };\n      },\n      layerState: function() {\n        return self.layers().invoke(\"toJSON\");\n      },\n      restoreLayerState: function(layerData) {\n        var index;\n        self.pixelExtent(Size(layerData.first()));\n        index = self.activeLayerIndex();\n        self.layers([]);\n        layerData.forEach(function(layerData) {\n          return makeLayer(layerData.data);\n        });\n        self.activeLayer(self.layer(index));\n        return self.repaint();\n      },\n      draw: function(point, options) {\n        var index, layer;\n        if (options == null) {\n          options = {};\n        }\n        index = options.index, layer = options.layer;\n        if (index == null) {\n          index = activeIndex();\n        }\n        if (layer == null) {\n          layer = self.activeLayerIndex();\n        }\n        return Symmetry[symmetryMode()]([point], pixelExtent()).forEach(function(_arg) {\n          var x, y;\n          x = _arg.x, y = _arg.y;\n          return lastCommand.push(self.Command.ChangePixel({\n            x: x,\n            y: y,\n            index: index,\n            layer: layer\n          }));\n        });\n      },\n      changePixel: function(params) {\n        var index, layer, x, y;\n        x = params.x, y = params.y, index = params.index, layer = params.layer;\n        if (canvas !== previewCanvas) {\n          self.layer(layer).set(x, y, index);\n        }\n        return self.repaintPixel(params);\n      },\n      layers: Observable([]),\n      layer: function(index) {\n        if (index != null) {\n          return self.layers()[index];\n        } else {\n          return self.activeLayer();\n        }\n      },\n      repaintPixel: function(_arg) {\n        var color, colorIndex, index, layerIndex, x, y;\n        x = _arg.x, y = _arg.y, colorIndex = _arg.index, layerIndex = _arg.layer;\n        if (canvas === previewCanvas) {\n          index = self.layers.map(function(layer, i) {\n            if (i === layerIndex) {\n              if (colorIndex === 0) {\n                return self.layers.map(function(layer, i) {\n                  return layer.get(x, y);\n                }).filter(function(index, i) {\n                  return (index !== 0) && !self.layers()[i].hidden() && (i < layerIndex);\n                }).last() || self.backgroundIndex();\n              } else {\n                return colorIndex;\n              }\n            } else {\n              return layer.get(x, y);\n            }\n          }).filter(function(index, i) {\n            return (index !== 0) && !self.layers()[i].hidden();\n          }).last() || self.backgroundIndex();\n        } else {\n          index = self.layers.map(function(layer) {\n            return layer.get(x, y);\n          }).filter(function(index, i) {\n            return (index !== 0) && !self.layers()[i].hidden();\n          }).last() || self.backgroundIndex();\n        }\n        color = self.palette()[index];\n        drawPixel(canvas, x, y, color, pixelSize());\n        if (canvas !== previewCanvas) {\n          return drawPixel(thumbnailCanvas, x, y, color, 1);\n        }\n      },\n      getPixel: function(_arg) {\n        var layer, x, y;\n        x = _arg.x, y = _arg.y, layer = _arg.layer;\n        return {\n          x: x,\n          y: y,\n          index: self.layer(layer).get(x, y),\n          layer: layer != null ? layer : self.activeLayerIndex()\n        };\n      },\n      palette: Observable([\"transparent\"].concat(Palette.dawnBringer32)),\n      preview: function(fn) {\n        var realCanvas, realCommand;\n        realCommand = lastCommand;\n        lastCommand = self.Command.Composite();\n        realCanvas = canvas;\n        canvas = previewCanvas;\n        canvas.clear();\n        fn();\n        canvas = realCanvas;\n        return lastCommand = realCommand;\n      }\n    });\n    makeLayer = function(data) {\n      var layer;\n      layer = Layer({\n        width: pixelExtent().width,\n        height: pixelExtent().height,\n        data: data,\n        palette: self.palette\n      });\n      layer.hidden.observe(self.repaint);\n      self.layers.push(layer);\n      return self.activeLayer(layer);\n    };\n    makeLayer();\n    $selector = $(I.selector);\n    $(I.selector).append(template(self));\n    canvas = TouchCanvas(canvasSize());\n    previewCanvas = TouchCanvas(canvasSize());\n    thumbnailCanvas = TouchCanvas(pixelExtent());\n    updateActiveColor = function(newIndex) {\n      var color;\n      color = self.palette()[newIndex];\n      return $selector.find(\".palette .current\").css({\n        backgroundColor: color\n      });\n    };\n    updateActiveColor(activeIndex());\n    activeIndex.observe(updateActiveColor);\n    $selector.find(\".viewport\").append(canvas.element()).append($(previewCanvas.element()).addClass(\"preview\"));\n    $selector.find(\".thumbnail\").append(thumbnailCanvas.element());\n    updateViewportCentering = (function() {\n      var size;\n      size = canvasSize();\n      return $selector.find(\".viewport\").toggleClass(\"vertical-center\", size.height < $selector.find(\".main\").height());\n    }).debounce(15);\n    $(window).resize(updateViewportCentering);\n    updateCanvasSize = function(size) {\n      var gridImage;\n      [canvas, previewCanvas].forEach(function(canvas) {\n        var element;\n        element = canvas.element();\n        element.width = size.width;\n        element.height = size.height;\n        return canvas.clear();\n      });\n      $selector.find(\".viewport, .overlay\").css({\n        width: size.width,\n        height: size.height\n      });\n      if (self.grid()) {\n        gridImage = GridGen().backgroundImage();\n        $selector.find(\".overlay\").css({\n          backgroundImage: gridImage\n        });\n      } else {\n        $selector.find(\".overlay\").css({\n          backgroundImage: \"none\"\n        });\n      }\n      updateViewportCentering();\n      return self.repaint();\n    };\n    updateCanvasSize(canvasSize());\n    canvasSize.observe(updateCanvasSize);\n    self.grid.observe(function() {\n      return updateCanvasSize(canvasSize());\n    });\n    updatePixelExtent = function(size) {\n      var element;\n      self.layers.forEach(function(layer) {\n        return layer.resize(size);\n      });\n      element = thumbnailCanvas.element();\n      element.width = size.width;\n      element.height = size.height;\n      thumbnailCanvas.clear();\n      return self.repaint();\n    };\n    pixelExtent.observe(updatePixelExtent);\n    self.palette.observe(function() {\n      return self.repaint();\n    });\n    canvasPosition = function(position) {\n      return position.scale(pixelExtent()).floor();\n    };\n    previewCanvas.on(\"touch\", function(position) {\n      lastCommand = self.Command.Composite();\n      self.execute(lastCommand);\n      return activeTool().touch({\n        position: canvasPosition(position),\n        editor: self\n      });\n    });\n    previewCanvas.on(\"move\", function(position) {\n      return activeTool().move({\n        position: canvasPosition(position),\n        editor: self\n      });\n    });\n    previewCanvas.on(\"release\", function(position) {\n      activeTool().release({\n        position: canvasPosition(position),\n        editor: self\n      });\n      return self.trigger(\"release\");\n    });\n    self.on(\"release\", function() {\n      previewCanvas.clear();\n      return self.trigger(\"change\");\n    });\n    [\"undo\", \"execute\", \"redo\"].forEach(function(method) {\n      var oldMethod;\n      oldMethod = self[method];\n      return self[method] = function() {\n        oldMethod.apply(self, arguments);\n        return self.trigger(\"change\");\n      };\n    });\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "facebook": {
      "path": "facebook",
      "content": "(function() {\n  require(\"facebook\").init(\"391109411021092\", null, function(FB) {\n    return console.log(FB);\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "file_reading": {
      "path": "file_reading",
      "content": "(function() {\n  var detectType;\n\n  detectType = function(file) {\n    if (file.type.match(/^image\\//)) {\n      return \"image\";\n    }\n    if (file.name.match(/\\.json$/)) {\n      return \"json\";\n    }\n    return \"text\";\n  };\n\n  module.exports = {\n    readerInput: function(_arg) {\n      var accept, chose, encoding, image, input, json, text;\n      chose = _arg.chose, encoding = _arg.encoding, image = _arg.image, json = _arg.json, text = _arg.text, accept = _arg.accept;\n      if (accept == null) {\n        accept = \"image/gif,image/png\";\n      }\n      if (encoding == null) {\n        encoding = \"UTF-8\";\n      }\n      input = document.createElement('input');\n      input.type = \"file\";\n      input.setAttribute(\"accept\", accept);\n      input.onchange = function() {\n        var file, reader;\n        reader = new FileReader();\n        file = input.files[0];\n        switch (detectType(file)) {\n          case \"image\":\n            reader.onload = function(evt) {\n              return typeof image === \"function\" ? image(evt.target.result) : void 0;\n            };\n            reader.readAsDataURL(file);\n            break;\n          case \"json\":\n            reader.onload = function(evt) {\n              return typeof json === \"function\" ? json(JSON.parse(evt.target.result)) : void 0;\n            };\n            reader.readAsText(file, encoding);\n            break;\n          case \"text\":\n            reader.onload = function(evt) {\n              return typeof text === \"function\" ? text(evt.target.result) : void 0;\n            };\n            reader.readAsText(file, encoding);\n        }\n        return chose(file);\n      };\n      return input;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "layer": {
      "path": "layer",
      "content": "(function() {\n  var Grid, Layer, TouchCanvas, previewCanvas;\n\n  TouchCanvas = require(\"touch-canvas\");\n\n  Grid = require(\"./util\").Grid;\n\n  Layer = function(I, self) {\n    var data, grid, height, paint, palette, pixelSize, previewCanvas, width;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    width = I.width, height = I.height, palette = I.palette, data = I.data;\n    pixelSize = 1;\n    grid = Grid(width, height, function(x, y) {\n      if (data) {\n        return data[x + y * width];\n      } else {\n        return 0;\n      }\n    });\n    previewCanvas = TouchCanvas({\n      width: width,\n      height: height\n    });\n    self.extend({\n      previewCanvas: previewCanvas.element(),\n      each: grid.each,\n      get: grid.get,\n      hidden: Observable(false),\n      set: function(x, y, index) {\n        paint(x, y, index);\n        return grid.set(x, y, index);\n      },\n      repaint: function() {\n        return grid.each(function(index, x, y) {\n          return paint(x, y, index);\n        });\n      },\n      resize: function(size) {\n        var element, newHeight, newWidth;\n        newWidth = size.width, newHeight = size.height;\n        if (newHeight > height) {\n          grid.expand(0, newHeight - height, 0);\n        } else if (newHeight < height) {\n          grid.contract(0, height - newHeight);\n        }\n        height = newHeight;\n        if (newWidth > width) {\n          grid.expand(newHeight - width, 0, 0);\n        } else if (newWidth < width) {\n          grid.contract(width - newWidth, 0);\n        }\n        width = newWidth;\n        element = previewCanvas.element();\n        element.width = width;\n        element.height = height;\n        return self.repaint();\n      },\n      toJSON: function() {\n        return {\n          width: width,\n          height: height,\n          data: grid.toArray()\n        };\n      }\n    });\n    paint = function(x, y, index) {\n      var color;\n      color = palette()[index];\n      if (color === \"transparent\") {\n        return previewCanvas.clear({\n          x: x * pixelSize,\n          y: y * pixelSize,\n          width: pixelSize,\n          height: pixelSize\n        });\n      } else {\n        return previewCanvas.drawRect({\n          x: x * pixelSize,\n          y: y * pixelSize,\n          width: pixelSize,\n          height: pixelSize,\n          color: color\n        });\n      }\n    };\n    if (data) {\n      self.repaint();\n    }\n    return self;\n  };\n\n  module.exports = Layer;\n\n  previewCanvas = function(width, height) {\n    var canvas;\n    return canvas = document.createElement(\"canvas\");\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/_hamljr_runtime": {
      "path": "lib/_hamljr_runtime",
      "content": "(function() {\n  var Observable, Runtime, eventNames, isEvent, isFragment, valueBind,\n    __slice = [].slice;\n\n  Observable = require(\"observable\");\n\n  eventNames = \"abort\\nblur\\nchange\\nclick\\ndblclick\\ndrag\\ndragend\\ndragenter\\ndragleave\\ndragover\\ndragstart\\ndrop\\nerror\\nfocus\\ninput\\nkeydown\\nkeypress\\nkeyup\\nload\\nmousedown\\nmousemove\\nmouseout\\nmouseover\\nmouseup\\nreset\\nresize\\nscroll\\nselect\\nsubmit\\ntouchstart\\ntouchend\\ntouchmove\\ntouchenter\\ntouchleave\\ntouchcancel\\nunload\".split(\"\\n\");\n\n  isEvent = function(name) {\n    return eventNames.indexOf(name) !== -1;\n  };\n\n  isFragment = function(node) {\n    return node.nodeType === 11;\n  };\n\n  valueBind = function(element, value) {\n    element.value = value();\n    element.oninput = function() {\n      return value(element.value);\n    };\n    element.onchange = function() {\n      return value(element.value);\n    };\n    if (typeof value.observe === \"function\") {\n      value.observe(function(newValue) {\n        return element.value = newValue;\n      });\n    }\n    switch (element.nodeName) {\n      case \"SELECT\":\n        setTimeout(function() {\n          return element.value = value();\n        }, 0);\n    }\n  };\n\n  Runtime = function(context) {\n    var append, bindObservable, classes, id, lastParent, observeAttribute, observeText, pop, push, render, self, stack, top;\n    stack = [];\n    lastParent = function() {\n      var element, i;\n      i = stack.length - 1;\n      while ((element = stack[i]) && isFragment(element)) {\n        i -= 1;\n      }\n      return element;\n    };\n    top = function() {\n      return stack[stack.length - 1];\n    };\n    append = function(child) {\n      var parent, _ref;\n      parent = top();\n      if (parent && isFragment(child) && child.childNodes.length === 1) {\n        child = child.childNodes[0];\n      }\n      if ((_ref = top()) != null) {\n        _ref.appendChild(child);\n      }\n      return child;\n    };\n    push = function(child) {\n      return stack.push(child);\n    };\n    pop = function() {\n      return append(stack.pop());\n    };\n    render = function(child) {\n      push(child);\n      return pop();\n    };\n    bindObservable = function(element, value, update) {\n      var observable, observe, unobserve;\n      observable = Observable(value);\n      update(observable());\n      observe = function() {\n        observable.observe(update);\n        return update(observable());\n      };\n      unobserve = function() {\n        return observable.stopObserving(update);\n      };\n      element.addEventListener(\"DOMNodeInserted\", observe, true);\n      element.addEventListener(\"DOMNodeRemoved\", unobserve, true);\n      return element;\n    };\n    id = function() {\n      var element, sources, update, value;\n      sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      element = top();\n      update = function(newValue) {\n        if (typeof newValue === \"function\") {\n          newValue = newValue();\n        }\n        return element.id = newValue;\n      };\n      value = function() {\n        var possibleValues;\n        possibleValues = sources.map(function(source) {\n          if (typeof source === \"function\") {\n            return source();\n          } else {\n            return source;\n          }\n        }).filter(function(idValue) {\n          return idValue != null;\n        });\n        return possibleValues[possibleValues.length - 1];\n      };\n      return bindObservable(element, value, update);\n    };\n    classes = function() {\n      var element, sources, update, value;\n      sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      element = top();\n      update = function(newValue) {\n        if (typeof newValue === \"function\") {\n          newValue = newValue();\n        }\n        return element.className = newValue;\n      };\n      value = function() {\n        var possibleValues;\n        possibleValues = sources.map(function(source) {\n          if (typeof source === \"function\") {\n            return source();\n          } else {\n            return source;\n          }\n        }).filter(function(sourceValue) {\n          return sourceValue != null;\n        });\n        return possibleValues.join(\" \");\n      };\n      return bindObservable(element, value, update);\n    };\n    observeAttribute = function(name, value) {\n      var element, update;\n      element = top();\n      update = function(newValue) {\n        if ((newValue != null) && newValue !== false) {\n          return element.setAttribute(name, newValue);\n        } else {\n          return element.removeAttribute(name);\n        }\n      };\n      if ((name === \"value\") && (typeof value === \"function\")) {\n        valueBind(element, value);\n      } else if ((name === \"checked\") && (typeof value === \"function\")) {\n        element.onchange = function() {\n          return value(element.checked);\n        };\n        bindObservable(element, value, update);\n      } else if (name.match(/^on/) && isEvent(name.substr(2))) {\n        element[name] = value;\n      } else if (isEvent(name)) {\n        element[\"on\" + name] = value;\n      } else {\n        bindObservable(element, value, update);\n      }\n      return element;\n    };\n    observeText = function(value) {\n      var element, update;\n      switch (value != null ? value.nodeType : void 0) {\n        case 1:\n        case 3:\n        case 11:\n          return render(value);\n      }\n      element = document.createTextNode('');\n      update = function(newValue) {\n        return element.nodeValue = newValue;\n      };\n      bindObservable(element, value, update);\n      return render(element);\n    };\n    self = {\n      push: push,\n      pop: pop,\n      id: id,\n      classes: classes,\n      attribute: observeAttribute,\n      text: observeText,\n      filter: function(name, content) {},\n      each: function(items, fn) {\n        var elements, parent, replace;\n        items = Observable(items);\n        elements = null;\n        parent = lastParent();\n        items.observe(function(newItems) {\n          return replace(elements, newItems);\n        });\n        replace = function(oldElements, items) {\n          elements = [];\n          items.forEach(function(item, index, array) {\n            var element;\n            element = fn.call(item, item, index, array);\n            if (isFragment(element)) {\n              elements.push.apply(elements, element.childNodes);\n            } else {\n              elements.push(element);\n            }\n            parent.appendChild(element);\n            return element;\n          });\n          return oldElements != null ? oldElements.forEach(function(element) {\n            return element.remove();\n          }) : void 0;\n        };\n        return replace(null, items);\n      }\n    };\n    return self;\n  };\n\n  module.exports = Runtime;\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/canvas-to-blob": {
      "path": "lib/canvas-to-blob",
      "content": "/* canvas-toBlob.js\n * A canvas.toBlob() implementation.\n * 2011-07-13\n *\n * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */\n\n(function(view) {\n\"use strict\";\nvar\n    Uint8Array = view.Uint8Array\n\t, HTMLCanvasElement = view.HTMLCanvasElement\n\t, is_base64_regex = /\\s*;\\s*base64\\s*(?:;|$)/i\n\t, base64_ranks\n\t, decode_base64 = function(base64) {\n\t\tvar\n\t\t\t  len = base64.length\n\t\t\t, buffer = new Uint8Array(len / 4 * 3 | 0)\n\t\t\t, i = 0\n\t\t\t, outptr = 0\n\t\t\t, last = [0, 0]\n\t\t\t, state = 0\n\t\t\t, save = 0\n\t\t\t, rank\n\t\t\t, code\n\t\t\t, undef\n\t\t;\n\t\twhile (len--) {\n\t\t\tcode = base64.charCodeAt(i++);\n\t\t\trank = base64_ranks[code-43];\n\t\t\tif (rank !== 255 && rank !== undef) {\n\t\t\t\tlast[1] = last[0];\n\t\t\t\tlast[0] = code;\n\t\t\t\tsave = (save << 6) | rank;\n\t\t\t\tstate++;\n\t\t\t\tif (state === 4) {\n\t\t\t\t\tbuffer[outptr++] = save >>> 16;\n\t\t\t\t\tif (last[1] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save >>> 8;\n\t\t\t\t\t}\n\t\t\t\t\tif (last[0] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save;\n\t\t\t\t\t}\n\t\t\t\t\tstate = 0;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t// 2/3 chance there's going to be some null bytes at the end, but that\n\t\t// doesn't really matter with most image formats.\n\t\t// If it somehow matters for you, truncate the buffer up outptr.\n\t\treturn buffer;\n\t}\n;\nif (Uint8Array) {\n\tbase64_ranks = new Uint8Array([\n\t\t  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1\n\t\t, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9\n\t\t, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25\n\t\t, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35\n\t\t, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51\n\t]);\n}\nif (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {\n\tHTMLCanvasElement.prototype.toBlob = function(callback, type /*, ...args*/) {\n\t\t  if (!type) {\n\t\t\ttype = \"image/png\";\n\t\t} if (this.mozGetAsFile) {\n\t\t\tcallback(this.mozGetAsFile(\"canvas\", type));\n\t\t\treturn;\n\t\t}\n\t\tvar\n\t\t\t  args = Array.prototype.slice.call(arguments, 1)\n\t\t\t, dataURI = this.toDataURL.apply(this, args)\n\t\t\t, header_end = dataURI.indexOf(\",\")\n\t\t\t, data = dataURI.substring(header_end + 1)\n\t\t\t, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))\n\t\t\t, blob\n\t\t;\n\t\tif (Blob.fake) {\n\t\t\t// no reason to decode a data: URI that's just going to become a data URI again\n\t\t\tblob = new Blob\n\t\t\tif (is_base64) {\n\t\t\t\tblob.encoding = \"base64\";\n\t\t\t} else {\n\t\t\t\tblob.encoding = \"URI\";\n\t\t\t}\n\t\t\tblob.data = data;\n\t\t\tblob.size = data.length;\n\t\t} else if (Uint8Array) {\n\t\t\tif (is_base64) {\n\t\t\t\tblob = new Blob([decode_base64(data)], {type: type});\n\t\t\t} else {\n\t\t\t\tblob = new Blob([decodeURIComponent(data)], {type: type});\n\t\t\t}\n\t\t}\n\t\tcallback(blob);\n\t};\n}\n}(self));\n",
      "type": "blob"
    },
    "lib/file_saver": {
      "path": "lib/file_saver",
      "content": "/* FileSaver.js\n * A saveAs() FileSaver implementation.\n * 2013-10-21\n *\n * By Eli Grey, http://eligrey.com\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */\n\nvar saveAs = saveAs\n  || (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))\n  || (function(view) {\n  \"use strict\";\n\tvar\n\t\t  doc = view.document\n\t\t  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet\n\t\t, get_URL = function() {\n\t\t\treturn view.URL || view.webkitURL || view;\n\t\t}\n\t\t, URL = view.URL || view.webkitURL || view\n\t\t, save_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\")\n\t\t, can_use_save_link =  !view.externalHost && \"download\" in save_link\n\t\t, click = function(node) {\n\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\tevent.initMouseEvent(\n\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t, false, false, false, false, 0, null\n\t\t\t);\n\t\t\tnode.dispatchEvent(event);\n\t\t}\n\t\t, webkit_req_fs = view.webkitRequestFileSystem\n\t\t, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem\n\t\t, throw_outside = function (ex) {\n\t\t\t(view.setImmediate || view.setTimeout)(function() {\n\t\t\t\tthrow ex;\n\t\t\t}, 0);\n\t\t}\n\t\t, force_saveable_type = \"application/octet-stream\"\n\t\t, fs_min_size = 0\n\t\t, deletion_queue = []\n\t\t, process_deletion_queue = function() {\n\t\t\tvar i = deletion_queue.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar file = deletion_queue[i];\n\t\t\t\tif (typeof file === \"string\") { // file is an object URL\n\t\t\t\t\tURL.revokeObjectURL(file);\n\t\t\t\t} else { // file is a File\n\t\t\t\t\tfile.remove();\n\t\t\t\t}\n\t\t\t}\n\t\t\tdeletion_queue.length = 0; // clear queue\n\t\t}\n\t\t, dispatch = function(filesaver, event_types, event) {\n\t\t\tevent_types = [].concat(event_types);\n\t\t\tvar i = event_types.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar listener = filesaver[\"on\" + event_types[i]];\n\t\t\t\tif (typeof listener === \"function\") {\n\t\t\t\t\ttry {\n\t\t\t\t\t\tlistener.call(filesaver, event || filesaver);\n\t\t\t\t\t} catch (ex) {\n\t\t\t\t\t\tthrow_outside(ex);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t, FileSaver = function(blob, name) {\n\t\t\t// First try a.download, then web filesystem, then object URLs\n\t\t\tvar\n\t\t\t\t  filesaver = this\n\t\t\t\t, type = blob.type\n\t\t\t\t, blob_changed = false\n\t\t\t\t, object_url\n\t\t\t\t, target_view\n\t\t\t\t, get_object_url = function() {\n\t\t\t\t\tvar object_url = get_URL().createObjectURL(blob);\n\t\t\t\t\tdeletion_queue.push(object_url);\n\t\t\t\t\treturn object_url;\n\t\t\t\t}\n\t\t\t\t, dispatch_all = function() {\n\t\t\t\t\tdispatch(filesaver, \"writestart progress write writeend\".split(\" \"));\n\t\t\t\t}\n\t\t\t\t// on any filesys errors revert to saving with object URLs\n\t\t\t\t, fs_error = function() {\n\t\t\t\t\t// don't create more object URLs than needed\n\t\t\t\t\tif (blob_changed || !object_url) {\n\t\t\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t\t}\n\t\t\t\t\tif (target_view) {\n\t\t\t\t\t\ttarget_view.location.href = object_url;\n\t\t\t\t\t} else {\n                        window.open(object_url, \"_blank\");\n                    }\n\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\tdispatch_all();\n\t\t\t\t}\n\t\t\t\t, abortable = function(func) {\n\t\t\t\t\treturn function() {\n\t\t\t\t\t\tif (filesaver.readyState !== filesaver.DONE) {\n\t\t\t\t\t\t\treturn func.apply(this, arguments);\n\t\t\t\t\t\t}\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t\t, create_if_not_found = {create: true, exclusive: false}\n\t\t\t\t, slice\n\t\t\t;\n\t\t\tfilesaver.readyState = filesaver.INIT;\n\t\t\tif (!name) {\n\t\t\t\tname = \"download\";\n\t\t\t}\n\t\t\tif (can_use_save_link) {\n\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t// FF for Android has a nasty garbage collection mechanism\n\t\t\t\t// that turns all objects that are not pure javascript into 'deadObject'\n\t\t\t\t// this means `doc` and `save_link` are unusable and need to be recreated\n\t\t\t\t// `view` is usable though:\n\t\t\t\tdoc = view.document;\n\t\t\t\tsave_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\");\n\t\t\t\tsave_link.href = object_url;\n\t\t\t\tsave_link.download = name;\n\t\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\t\tevent.initMouseEvent(\n\t\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t\t, false, false, false, false, 0, null\n\t\t\t\t);\n\t\t\t\tsave_link.dispatchEvent(event);\n\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\tdispatch_all();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\t// Object and web filesystem URLs have a problem saving in Google Chrome when\n\t\t\t// viewed in a tab, so I force save with application/octet-stream\n\t\t\t// http://code.google.com/p/chromium/issues/detail?id=91158\n\t\t\tif (view.chrome && type && type !== force_saveable_type) {\n\t\t\t\tslice = blob.slice || blob.webkitSlice;\n\t\t\t\tblob = slice.call(blob, 0, blob.size, force_saveable_type);\n\t\t\t\tblob_changed = true;\n\t\t\t}\n\t\t\t// Since I can't be sure that the guessed media type will trigger a download\n\t\t\t// in WebKit, I append .download to the filename.\n\t\t\t// https://bugs.webkit.org/show_bug.cgi?id=65440\n\t\t\tif (webkit_req_fs && name !== \"download\") {\n\t\t\t\tname += \".download\";\n\t\t\t}\n\t\t\tif (type === force_saveable_type || webkit_req_fs) {\n\t\t\t\ttarget_view = view;\n\t\t\t}\n\t\t\tif (!req_fs) {\n\t\t\t\tfs_error();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tfs_min_size += blob.size;\n\t\t\treq_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {\n\t\t\t\tfs.root.getDirectory(\"saved\", create_if_not_found, abortable(function(dir) {\n\t\t\t\t\tvar save = function() {\n\t\t\t\t\t\tdir.getFile(name, create_if_not_found, abortable(function(file) {\n\t\t\t\t\t\t\tfile.createWriter(abortable(function(writer) {\n\t\t\t\t\t\t\t\twriter.onwriteend = function(event) {\n\t\t\t\t\t\t\t\t\ttarget_view.location.href = file.toURL();\n\t\t\t\t\t\t\t\t\tdeletion_queue.push(file);\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t\tdispatch(filesaver, \"writeend\", event);\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\twriter.onerror = function() {\n\t\t\t\t\t\t\t\t\tvar error = writer.error;\n\t\t\t\t\t\t\t\t\tif (error.code !== error.ABORT_ERR) {\n\t\t\t\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\t\"writestart progress write abort\".split(\" \").forEach(function(event) {\n\t\t\t\t\t\t\t\t\twriter[\"on\" + event] = filesaver[\"on\" + event];\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t\twriter.write(blob);\n\t\t\t\t\t\t\t\tfilesaver.abort = function() {\n\t\t\t\t\t\t\t\t\twriter.abort();\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.WRITING;\n\t\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t};\n\t\t\t\t\tdir.getFile(name, {create: false}, abortable(function(file) {\n\t\t\t\t\t\t// delete file if it already exists\n\t\t\t\t\t\tfile.remove();\n\t\t\t\t\t\tsave();\n\t\t\t\t\t}), abortable(function(ex) {\n\t\t\t\t\t\tif (ex.code === ex.NOT_FOUND_ERR) {\n\t\t\t\t\t\t\tsave();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t}\n\t\t\t\t\t}));\n\t\t\t\t}), fs_error);\n\t\t\t}), fs_error);\n\t\t}\n\t\t, FS_proto = FileSaver.prototype\n\t\t, saveAs = function(blob, name) {\n\t\t\treturn new FileSaver(blob, name);\n\t\t}\n\t;\n\tFS_proto.abort = function() {\n\t\tvar filesaver = this;\n\t\tfilesaver.readyState = filesaver.DONE;\n\t\tdispatch(filesaver, \"abort\");\n\t};\n\tFS_proto.readyState = FS_proto.INIT = 0;\n\tFS_proto.WRITING = 1;\n\tFS_proto.DONE = 2;\n\n\tFS_proto.error =\n\tFS_proto.onwritestart =\n\tFS_proto.onprogress =\n\tFS_proto.onwrite =\n\tFS_proto.onabort =\n\tFS_proto.onerror =\n\tFS_proto.onwriteend =\n\t\tnull;\n\n\tview.addEventListener(\"unload\", process_deletion_queue, false);\n\treturn saveAs;\n}(window));\n\nif (typeof module !== 'undefined') module.exports = saveAs;\n",
      "type": "blob"
    },
    "loader": {
      "path": "loader",
      "content": "(function() {\n  var Loader, TRANSPARENT_RGBA, arrayToHex, colorToRGBA, distanceSquared, getColor, nearestColorIndex, numberToHex;\n\n  Loader = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    return self.extend({\n      load: function(dataURL) {\n        var context, deferred, image;\n        deferred = Deferred();\n        context = document.createElement('canvas').getContext('2d');\n        image = document.createElement(\"img\");\n        image.onload = function() {\n          var height, imageData, width;\n          width = image.width, height = image.height;\n          context.drawImage(image, 0, 0);\n          imageData = context.getImageData(0, 0, width, height);\n          return deferred.resolve(imageData);\n        };\n        image.onerror = function() {\n          return deferred.reject(\"Error loading image data\");\n        };\n        image.src = dataURL;\n        return deferred.promise();\n      },\n      fromImageData: function(imageData) {\n        var colorFrequency, colors, data, height, palette, table, width, _i, _j, _ref, _ref1, _results, _results1;\n        width = imageData.width, height = imageData.height;\n        colorFrequency = {};\n        colors = (function() {\n          _results = [];\n          for (var _i = 0, _ref = width * height; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).map(function(n) {\n          var color, pieces;\n          pieces = getColor(imageData, n);\n          color = arrayToHex(pieces);\n          console.log(color);\n          if (colorFrequency[color] == null) {\n            colorFrequency[color] = 0;\n          }\n          colorFrequency[color] += 1;\n          return color;\n        });\n        table = Object.keys(colorFrequency).sort(function(a, b) {\n          return colorFrequency[b] - colorFrequency[a];\n        }).reduce(function(table, color, index) {\n          table[color] = index;\n          return table;\n        }, {});\n        palette = Object.keys(table);\n        data = (function() {\n          _results1 = [];\n          for (var _j = 0, _ref1 = width * height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; 0 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }\n          return _results1;\n        }).apply(this).map(function(n) {\n          return table[colors[n]];\n        });\n        return {\n          palette: palette,\n          width: width,\n          height: height,\n          data: data\n        };\n      },\n      fromImageDataWithPalette: function(imageData, palette) {\n        var height, paletteData, width, _i, _ref, _results;\n        width = imageData.width, height = imageData.height;\n        paletteData = palette.map(colorToRGBA);\n        return {\n          width: width,\n          height: height,\n          data: (function() {\n            _results = [];\n            for (var _i = 0, _ref = width * height; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).map(function(n) {\n            return nearestColorIndex(getColor(imageData, n), paletteData);\n          })\n        };\n      }\n    });\n  };\n\n  module.exports = Loader;\n\n  arrayToHex = function(parts) {\n    if (parts[3] < 128) {\n      return \"transparent\";\n    } else {\n      return \"#\" + (parts.slice(0, 3).map(numberToHex).join(''));\n    }\n  };\n\n  TRANSPARENT_RGBA = [Infinity, 0, 0, 0xff];\n\n  colorToRGBA = function(colorString) {\n    if (colorString === \"transparent\") {\n      return TRANSPARENT_RGBA;\n    } else {\n      return colorString.match(/([0-9A-F]{2})/g).map(function(part) {\n        return parseInt(part, 0x10);\n      }).concat([0]);\n    }\n  };\n\n  distanceSquared = function(a, b) {\n    return a.slice(0, 3).map(function(n, index) {\n      var delta;\n      delta = n - b[index];\n      return delta * delta;\n    }).sum();\n  };\n\n  nearestColorIndex = function(colorData, paletteData) {\n    var paletteColor;\n    if (colorData[3] < 128) {\n      return 0;\n    }\n    paletteColor = paletteData.minimum(function(paletteEntry) {\n      return distanceSquared(paletteEntry, colorData);\n    });\n    return paletteData.indexOf(paletteColor);\n  };\n\n  getColor = function(imageData, x, y) {\n    var index, stride;\n    stride = 4;\n    if (y != null) {\n      index = (x + y * imageData.width) * stride;\n    } else {\n      index = x * stride;\n    }\n    return Array.prototype.slice.call(imageData.data, index, index + stride);\n  };\n\n  numberToHex = function(n) {\n    return (\"0\" + (n.toString(0x10))).slice(-2).toUpperCase();\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Editor, runtime;\n\n  global.PACKAGE = PACKAGE;\n\n  global.require = require;\n\n  global.Observable = require(\"observable\");\n\n  global.Model = require(\"model\");\n\n  global.Bindable = require(\"bindable\");\n\n  require(\"cornerstone\");\n\n  require(\"appcache\");\n\n  require(\"jquery-utils\");\n\n  require(\"./lib/canvas-to-blob\");\n\n  runtime = require(\"runtime\")(PACKAGE);\n\n  runtime.boot();\n\n  runtime.applyStyleSheet(require('./style'));\n\n  Editor = require(\"./editor\");\n\n  global.editor = Editor();\n\n  editor.notify(\"Welcome to PixiPaint!\");\n\n}).call(this);\n",
      "type": "blob"
    },
    "modal": {
      "path": "modal",
      "content": "(function() {\n  var Modal;\n\n  $(function() {\n    return $(\"#modal\").click(function(e) {\n      if (e.target === this) {\n        return Modal.hide();\n      }\n    });\n  });\n\n  module.exports = Modal = {\n    show: function(element) {\n      return $(\"#modal\").empty().append(element).addClass(\"active\");\n    },\n    hide: function() {\n      return $(\"#modal\").removeClass(\"active\");\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "notifications": {
      "path": "notifications",
      "content": "(function() {\n  module.exports = function(I, self) {\n    var duration;\n    if (I == null) {\n      I = {};\n    }\n    duration = 5000;\n    self.extend({\n      notifications: Observable([]),\n      notify: function(message) {\n        self.notifications.push(message);\n        return setTimeout(function() {\n          return self.notifications.remove(message);\n        }, duration);\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "palette": {
      "path": "palette",
      "content": "(function() {\n  var Palette, TRANSPARENT, colorToRGB, exportJASC, fromStrings, numberToHex;\n\n  fromStrings = function(lines) {\n    return lines.split(\"\\n\").map(function(line) {\n      return \"#\" + line.split(\" \").map(function(string) {\n        return numberToHex(parseInt(string, 10));\n      }).join(\"\");\n    });\n  };\n\n  numberToHex = function(n) {\n    return (\"0\" + (n.toString(0x10))).slice(-2).toUpperCase();\n  };\n\n  TRANSPARENT = [0xff, 0, 0xff];\n\n  colorToRGB = function(colorString) {\n    if (colorString === \"transparent\") {\n      return TRANSPARENT;\n    } else {\n      return colorString.match(/([0-9A-F]{2})/g).map(function(part) {\n        return parseInt(part, 0x10);\n      });\n    }\n  };\n\n  exportJASC = function(array) {\n    var entries, padding, zeroes, _i, _results;\n    entries = array.map(function(entry) {\n      return colorToRGB(entry).join(\" \");\n    }).join(\"\\n\");\n    padding = Math.max(0, 256 - array.length);\n    zeroes = (function() {\n      _results = [];\n      for (var _i = 0; 0 <= padding ? _i < padding : _i > padding; 0 <= padding ? _i++ : _i--){ _results.push(_i); }\n      return _results;\n    }).apply(this).map(function() {\n      return \"0 0 0\";\n    }).join(\"\\n\");\n    return \"JASC-PAL\\n0100\\n256\\n\" + entries + \"\\n\" + zeroes;\n  };\n\n  Palette = {\n    defaults: [\"transparent\", \"#000000\", \"#FFFFFF\", \"#666666\", \"#DCDCDC\", \"#EB070E\", \"#F69508\", \"#FFDE49\", \"#388326\", \"#0246E3\", \"#563495\", \"#58C4F5\", \"#E5AC99\", \"#5B4635\", \"#FFFEE9\"],\n    dawnBringer16: fromStrings(\"20 12 28\\n68 36 52\\n48 52 109\\n78 74 78\\n133 76 48\\n52 101 36\\n208 70 72\\n117 113 97\\n89 125 206\\n210 125 44\\n133 149 161\\n109 170 44\\n210 170 153\\n109 194 202\\n218 212 94\\n222 238 214\"),\n    dawnBringer32: fromStrings(\"0 0 0\\n34 32 52\\n69 40 60\\n102 57 49\\n143 86 59\\n223 113 38\\n217 160 102\\n238 195 154\\n251 242 54\\n153 229 80\\n106 190 48\\n55 148 110\\n75 105 47\\n82 75 36\\n50 60 57\\n63 63 116\\n48 96 130\\n91 110 225\\n99 155 255\\n95 205 228\\n203 219 252\\n255 255 255\\n155 173 183\\n132 126 135\\n105 106 106\\n89 86 82\\n118 66 138\\n172 50 50\\n217 87 99\\n215 123 186\\n143 151 74\\n138 111 48\"),\n    \"export\": exportJASC\n  };\n\n  module.exports = Palette;\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.1.0\",\"remoteDependencies\":[\"https://code.jquery.com/jquery-1.11.0.min.js\"],\"dependencies\":{\"appcache\":\"distri/appcache:v0.2.0\",\"bindable\":\"distri/bindable:v0.1.0\",\"byte_array\":\"distri/byte_array:v0.1.1\",\"cornerstone\":\"distri/cornerstone:v0.2.2-pre.0\",\"model\":\"distri/compositions:v0.1.1\",\"eval\":\"distri/eval:v0.1.0\",\"facebook\":\"distri/facebook:v0.1.1\",\"grid-gen\":\"distri/grid-gen:v0.2.0\",\"hotkeys\":\"distri/hotkeys:v0.2.0\",\"jquery-utils\":\"distri/jquery-utils:v0.2.0\",\"observable\":\"distri/observable:v0.1.2\",\"postmaster\":\"distri/postmaster:v0.2.0\",\"runtime\":\"distri/runtime:v0.3.0\",\"touch-canvas\":\"distri/touch-canvas:v0.3.0\",\"undo\":\"distri/undo:v0.2.0\",\"util\":\"distri/util:v0.1.0\"},\"width\":1280,\"height\":720};",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html,\\nbody {\\n  margin: 0;\\n  height: 100%;\\n  font-family: helvetica;\\n}\\n\\n.editor {\\n  background-color: lightgray;\\n  height: 100%;\\n  padding: 0px 40px 64px 40px;\\n  position: relative;\\n  overflow: hidden;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n  -ms-user-select: none;\\n  -moz-user-select: none;\\n  -webkit-user-select: none;\\n  user-select: none;\\n}\\n\\n.editor .main .thumbnail {\\n  background-color: white;\\n  border: 1px solid rgba(0, 0, 0, 0.5);\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n}\\n\\n.editor .main {\\n  font-size: 0;\\n  height: 100%;\\n  position: relative;\\n  overflow: auto;\\n}\\n\\n.notifications {\\n  background-color: rgba(0, 0, 0, 0.5);\\n  border: 1px solid black;\\n  color: white;\\n  left: 40px;\\n  padding: 4px;\\n  position: absolute;\\n  top: 0;\\n  -ms-border-bottom-left-radius: 4px;\\n  -moz-border-bottom-left-radius: 4px;\\n  -webkit-border-bottom-left-radius: 4px;\\n  border-bottom-left-radius: 4px;\\n  -ms-border-bottom-right-radius: 4px;\\n  -moz-border-bottom-right-radius: 4px;\\n  -webkit-border-bottom-right-radius: 4px;\\n  border-bottom-right-radius: 4px;\\n}\\n\\n.notifications:empty {\\n  padding: 0;\\n  border: none;\\n}\\n\\n.notifications p:last-child {\\n  margin-bottom: 0;\\n}\\n\\n.notifications p {\\n  margin: 0;\\n  margin-bottom: 0.25em;\\n}\\n\\n.toolbar {\\n  height: 100%;\\n  width: 40px;\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.toolbar h2 {\\n  font-size: 12px;\\n}\\n\\n.toolbar .tool.active {\\n  background-color: #FFF;\\n  border-color: green;\\n}\\n\\n.toolbar .tool {\\n  background-color: #EEE;\\n  background-position: center;\\n  background-repeat: no-repeat;\\n  width: 36px;\\n  height: 36px;\\n  border: 1px solid rgba(0, 0, 0, 0.5);\\n  border-radius: 2px;\\n  margin: 2px;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.layers {\\n  font-size: 14px;\\n  height: 100%;\\n  width: 40px;\\n  position: absolute;\\n  top: 0;\\n  right: 0;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.layers .layer.active canvas {\\n  border-color: green;\\n}\\n\\n.layers .layer.hidden {\\n  opacity: 0.5;\\n  -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);\\n  filter: alpha(opacity=50);\\n}\\n\\n.layers .layer .eye {\\n  position: absolute;\\n  top: 0;\\n  right: 0;\\n  width: 16px;\\n  height: 16px;\\n  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnElEQVQ4T6WT30uTYRTHv8/27n33y/ljaptLzGpEoEZBQRKYBBFdREUXQhFddRNdRBF2ZX9BVJDQpRddRaQhWlBkISoqU2ammWtzzl85N51u757nffa8vZskSHd54Fye7/mcc76HYI9B9liPXQKhUOiMbNIeEXWtmbCMjQgO5IwUOYCYKezuUa3I11pTU9P/t/GOQDQa7TCrqy1mFpdlkwSNZbGeSIIzBsUMVLgcyDEKLnRd+E50e/z1l/IiBQGj+IO0ETovQ0NsYRHRpQSyxAlN8UDLETAu4OArqMIi6qvdMBlEoqp+ovzYuQYSDoefKOrCPVlLIfgjAvnAWcSoF5pBTjUdWSOpJqAygbpqGUdT3XCkwnBazEgdbO4gsdngMknO7NvQS+A/3oSeQAbraVEofni9AQYwHrSPG0ICVgtB69UyxKeGICZ6sbrJOQkPdwqbp44UV/ggSRLeDqWxtsVBDYK2W9sCd56NgVIBu2JCW0s5OOdIL/xE5N0LkFgkxO2uUrMsy7BYLOifVjEepsgayPmulOVHyI8icMpvx40mFzRNAzOWm/z6SifR4JeE4qosVUq8BYLldYFPwTTmfmvI8u3583vwFEu41lgEv9dSIFANAnXkDSNzM99eKonp2yaHG2Z3LUy2YkRXGcZ+ZfF9nhoX0HHYI+Ok34Yj+60QNAMtEgAd7UJU8g0WzjgdGBhwrE2etkkEelltUndUZom9lOmSLP4aRtd1IB6xitCgl81PYirrWLpw/6lvx0jDfe+76PLMxSqSkpx2K6C4ICx2Y4mGWQxH8q0ksDKLcHxT3yw5NDry+nPj474+vsvKPc/vKiylXmaMXjFgmmUQp5lwomtCZKgaUFXaqeu892b7x6l/rPy/T7Xnb/wDHedWhDseHEQAAAAASUVORK5CYII=);\\n}\\n\\n.layers .layer {\\n  padding: 8px 0 2px;\\n  position: relative;\\n}\\n\\n.layers canvas {\\n  border: 1px solid lightgray;\\n  display: block;\\n  margin: auto;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.palette {\\n  height: 100%;\\n  width: 40px;\\n  position: absolute;\\n  top: 0;\\n  right: 0;\\n  font-size: 0;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.palette .color.current {\\n  float: none;\\n  width: 36px;\\n  height: 36px;\\n}\\n\\n.palette .color {\\n  border: 1px solid rgba(0, 0, 0, 0.5);\\n  border-radius: 2px;\\n  float: left;\\n  width: 16px;\\n  height: 16px;\\n  margin: 2px;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.vertical-center {\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n}\\n\\n.viewport {\\n  background-color: white;\\n  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkIADOnDnzH58SxlEDGIZDGBCKZxMTE7zeZBw1gGEYhAEAJQ47KemVQJ8AAAAASUVORK5CYII=);\\n  border: 1px solid gray;\\n  margin: auto;\\n}\\n\\n.viewport canvas {\\n  background-color: transparent;\\n  position: absolute;\\n}\\n\\n.viewport .overlay {\\n  pointer-events: none;\\n  position: absolute;\\n  z-index: 1;\\n}\\n\\n.debug {\\n  background-color: white;\\n  position: absolute;\\n  width: 100%;\\n  height: 100px;\\n  bottom: 0;\\n  margin: 0;\\n  padding: 1em;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.actions {\\n  width: 100%;\\n  height: 64px;\\n  padding: 0px 40px;\\n  position: absolute;\\n  bottom: 0;\\n  left: 0;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n.actions .action .text:last-child {\\n  top: auto;\\n  bottom: 0;\\n}\\n\\n.actions .action .text {\\n  text-align: center;\\n  white-space: nowrap;\\n  overflow: hidden;\\n  position: absolute;\\n  width: 100%;\\n  top: 0;\\n}\\n\\n.actions .action {\\n  width: 64px;\\n  height: 64px;\\n  background-color: #EEE;\\n  background-position: center;\\n  background-repeat: no-repeat;\\n  border: 1px solid rgba(0, 0, 0, 0.5);\\n  border-radius: 2px;\\n  display: inline-block;\\n  font-size: 12px;\\n  margin: 2px;\\n  position: relative;\\n  vertical-align: top;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n#modal {\\n  background-color: rgba(0, 0, 0, 0.25);\\n  display: none;\\n  position: absolute;\\n  z-index: 9000;\\n  top: 0;\\n}\\n\\n#modal input[type=file] {\\n  padding: 5em 2em;\\n  width: 320px;\\n  height: 180px;\\n  -ms-box-sizing: border-box;\\n  -moz-box-sizing: border-box;\\n  -webkit-box-sizing: border-box;\\n  box-sizing: border-box;\\n}\\n\\n#modal > * {\\n  background-color: white;\\n  border: 1px solid black;\\n  margin: auto;\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n}\\n\\n#modal.active {\\n  display: block;\\n  width: 100%;\\n  height: 100%;\\n}\\n\\n@media all and (-webkit-min-device-pixel-ratio: 1.5) {\\n  .layers .layer .eye {\\n    background-image: url(\\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnElEQVQ4T6WT30uTYRTHv8/27n33y/ljaptLzGpEoEZBQRKYBBFdREUXQhFddRNdRBF2ZX9BVJDQpRddRaQhWlBkISoqU2ammWtzzl85N51u757nffa8vZskSHd54Fye7/mcc76HYI9B9liPXQKhUOiMbNIeEXWtmbCMjQgO5IwUOYCYKezuUa3I11pTU9P/t/GOQDQa7TCrqy1mFpdlkwSNZbGeSIIzBsUMVLgcyDEKLnRd+E50e/z1l/IiBQGj+IO0ETovQ0NsYRHRpQSyxAlN8UDLETAu4OArqMIi6qvdMBlEoqp+ovzYuQYSDoefKOrCPVlLIfgjAvnAWcSoF5pBTjUdWSOpJqAygbpqGUdT3XCkwnBazEgdbO4gsdngMknO7NvQS+A/3oSeQAbraVEofni9AQYwHrSPG0ICVgtB69UyxKeGICZ6sbrJOQkPdwqbp44UV/ggSRLeDqWxtsVBDYK2W9sCd56NgVIBu2JCW0s5OOdIL/xE5N0LkFgkxO2uUrMsy7BYLOifVjEepsgayPmulOVHyI8icMpvx40mFzRNAzOWm/z6SifR4JeE4qosVUq8BYLldYFPwTTmfmvI8u3583vwFEu41lgEv9dSIFANAnXkDSNzM99eKonp2yaHG2Z3LUy2YkRXGcZ+ZfF9nhoX0HHYI+Ok34Yj+60QNAMtEgAd7UJU8g0WzjgdGBhwrE2etkkEelltUndUZom9lOmSLP4aRtd1IB6xitCgl81PYirrWLpw/6lvx0jDfe+76PLMxSqSkpx2K6C4ICx2Y4mGWQxH8q0ksDKLcHxT3yw5NDry+nPj474+vsvKPc/vKiylXmaMXjFgmmUQp5lwomtCZKgaUFXaqeu892b7x6l/rPy/T7Xnb/wDHedWhDseHEQAAAAASUVORK5CYII=@2x\\\");\\n    background-size: contain;\\n  }\\n}\\n\\n@media all and (-webkit-min-device-pixel-ratio: 1.5) {\\n  .viewport {\\n    background-image: url(\\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkIADOnDnzH58SxlEDGIZDGBCKZxMTE7zeZBw1gGEYhAEAJQ47KemVQJ8AAAAASUVORK5CYII=@2x\\\");\\n    background-size: contain;\\n  }\\n}\";",
      "type": "blob"
    },
    "symmetry": {
      "path": "symmetry",
      "content": "(function() {\n  var append, mirror;\n\n  mirror = function(size, flip) {\n    var matrix, midpoint;\n    midpoint = Point((size.width - 1) / 2, (size.height - 1) / 2);\n    matrix = Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y));\n    return function(point) {\n      return matrix.transformPoint(point);\n    };\n  };\n\n  append = function(list, transform) {\n    return list.concat(list.map(transform));\n  };\n\n  module.exports = {\n    normal: function(points) {\n      return points;\n    },\n    flip: function(points, size) {\n      var t;\n      t = mirror(size, Matrix.HORIZONTAL_FLIP);\n      return append(points, t);\n    },\n    flop: function(points, size) {\n      var t;\n      t = mirror(size, Matrix.VERTICAL_FLIP);\n      return append(points, t);\n    },\n    quad: function(points, size) {\n      var t1, t2;\n      t1 = mirror(size, Matrix.HORIZONTAL_FLIP);\n      t2 = mirror(size, Matrix.VERTICAL_FLIP);\n      return append(append(points, t1), t2);\n    },\n    icon: {\n      normal: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWKB2CjDpo7keEc3ZNQApGgkNyYoDkQAREwcEdrwnzgAAAAASUVORK5CYIIA\",\n      flip: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPUlEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3VigZKkQFS847Ng1AAGhoEPAwCRtTgRC7T+1AAAAABJRU5ErkJgggAA\",\n      flop: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWIBFhOkxgBI32gsUCsMKI4FYnMeNnUAmxI4EQ3tXkkAAAAASUVORK5CYIIA\",\n      quad: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3ViARYThGIAW5SPxgI0FihOyhTHAiU5GgBvBXARCEfBgAAAAABJRU5ErkJgggAA\"\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "templates/debug": {
      "path": "templates/debug",
      "content": "Runtime = require(\"/lib/_hamljr_runtime\");\n\nmodule.exports = (function(data) {\n  return (function() {\n    var __runtime;\n    __runtime = Runtime(this);\n    __runtime.push(document.createDocumentFragment());\n    __runtime.push(document.createElement(\"pre\"));\n    __runtime.classes(\"debug\");\n    __runtime.each(this.items, function(item) {\n      return __runtime.text(item);\n    });\n    __runtime.pop();\n    return __runtime.pop();\n  }).call(data);\n});\n",
      "type": "blob"
    },
    "templates/editor": {
      "path": "templates/editor",
      "content": "Runtime = require(\"/lib/_hamljr_runtime\");\n\nmodule.exports = (function(data) {\n  return (function() {\n    var Symmetry, activeIndex, activeTool, editor, previousTool, swap, symmetryMode, __runtime;\n    __runtime = Runtime(this);\n    __runtime.push(document.createDocumentFragment());\n    activeIndex = this.activeIndex;\n    activeTool = this.activeTool;\n    previousTool = this.previousTool;\n    editor = this;\n    Symmetry = require(\"../symmetry\");\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"editor\");\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"toolbar\");\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"tools\");\n    __runtime.each(this.tools, function(tool) {\n      var activate, activeClass;\n      activeClass = function() {\n        if (tool === activeTool()) {\n          return \"active\";\n        }\n      };\n      activate = function() {\n        previousTool(activeTool());\n        return activeTool(tool);\n      };\n      __runtime.push(document.createElement(\"div\"));\n      __runtime.classes(\"tool\", activeClass);\n      __runtime.attribute(\"style\", \"background-image: url(\" + tool.iconUrl + \")\");\n      __runtime.attribute(\"click\", activate);\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.push(document.createElement(\"h2\"));\n    __runtime.text(\"Symmetry\\n\");\n    __runtime.pop();\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"tools\");\n    symmetryMode = this.symmetryMode;\n    __runtime.each([\"normal\", \"flip\", \"flop\", \"quad\"], function(mode) {\n      var activate, activeClass;\n      activeClass = function() {\n        if (mode === symmetryMode()) {\n          return \"active\";\n        }\n      };\n      activate = function() {\n        return symmetryMode(mode);\n      };\n      __runtime.push(document.createElement(\"div\"));\n      __runtime.classes(\"tool\", activeClass);\n      __runtime.attribute(\"style\", \"background-image: url(\" + Symmetry.icon[mode] + \")\");\n      __runtime.attribute(\"click\", activate);\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.pop();\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"main\");\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"viewport\");\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"overlay\");\n    __runtime.pop();\n    __runtime.pop();\n    swap = function(e) {\n      var $t;\n      if (($t = $(e.currentTarget)).css(\"left\") === \"auto\") {\n        return $t.css({\n          left: 0,\n          right: \"auto\"\n        });\n      } else {\n        return $t.css({\n          left: \"auto\",\n          right: 0\n        });\n      }\n    };\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"thumbnail\");\n    __runtime.attribute(\"click\", swap);\n    __runtime.pop();\n    __runtime.pop();\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"notifications\");\n    __runtime.each(this.notifications, function(notification) {\n      __runtime.push(document.createElement(\"p\"));\n      __runtime.text(notification);\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"palette\");\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"color\", \"current\");\n    __runtime.pop();\n    __runtime.each(this.palette, function(color, index) {\n      var activate;\n      activate = function() {\n        return activeIndex(index);\n      };\n      __runtime.push(document.createElement(\"div\"));\n      __runtime.classes(\"color\");\n      __runtime.attribute(\"click\", activate);\n      __runtime.attribute(\"touchstart\", activate);\n      __runtime.attribute(\"style\", \"background-color: \" + color);\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.classes(\"actions\");\n    __runtime.each(this.actions, function(action) {\n      __runtime.push(document.createElement(\"div\"));\n      __runtime.classes(\"action\");\n      __runtime.attribute(\"click\", this.perform);\n      __runtime.attribute(\"touchstart\", this.perform);\n      __runtime.attribute(\"style\", \"background-image: url(\" + this.iconUrl + \")\");\n      __runtime.push(document.createElement(\"div\"));\n      __runtime.classes(\"text\");\n      __runtime.text(this.name);\n      __runtime.pop();\n      __runtime.push(document.createElement(\"div\"));\n      __runtime.classes(\"text\");\n      __runtime.text(this.hotkey);\n      __runtime.pop();\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.pop();\n    __runtime.push(document.createElement(\"div\"));\n    __runtime.id(\"modal\");\n    __runtime.pop();\n    return __runtime.pop();\n  }).call(data);\n});\n",
      "type": "blob"
    },
    "test/editor": {
      "path": "test/editor",
      "content": "(function() {\n  var Editor;\n\n  Editor = require(\"../editor\");\n\n  describe(\"editor\", function() {\n    return it(\"should have eval\", function() {\n      var editor;\n      editor = Editor({\n        selector: \"#not_present\"\n      });\n      return assert.equal(editor[\"eval\"](\"5\"), 5);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "tools": {
      "path": "tools",
      "content": "(function() {\n  var Brushes, TOOLS, brushTool, circle, line, line2, neighbors, rect, rectOutline, shapeTool, _ref;\n\n  Brushes = require(\"./brushes\");\n\n  _ref = require(\"./util\"), line = _ref.line, circle = _ref.circle, rect = _ref.rect, rectOutline = _ref.rectOutline;\n\n  line2 = function(start, end, fn) {\n    fn(start);\n    return line(start, end, fn);\n  };\n\n  neighbors = function(point) {\n    return [Point(point.x, point.y - 1), Point(point.x - 1, point.y), Point(point.x + 1, point.y), Point(point.x, point.y + 1)];\n  };\n\n  shapeTool = function(fn, icon) {\n    var start;\n    start = null;\n    return {\n      iconUrl: icon,\n      touch: function(_arg) {\n        var position;\n        position = _arg.position;\n        return start = position;\n      },\n      move: function(_arg) {\n        var editor, position;\n        editor = _arg.editor, position = _arg.position;\n        return editor.preview(function() {\n          return fn(start, position, editor.draw);\n        });\n      },\n      release: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        return fn(start, position, editor.draw);\n      }\n    };\n  };\n\n  brushTool = function(brushName, icon, options) {\n    var OP, brush, paint, previousPosition;\n    previousPosition = null;\n    brush = Brushes[brushName];\n    OP = function(out) {\n      return function(p) {\n        return out(p, options);\n      };\n    };\n    paint = function(out) {\n      return function(point) {\n        return brush(point).forEach(OP(out));\n      };\n    };\n    return {\n      iconUrl: icon,\n      touch: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        paint(editor.draw)(position);\n        return previousPosition = position;\n      },\n      move: function(_arg) {\n        var editor, position;\n        editor = _arg.editor, position = _arg.position;\n        line(previousPosition, position, paint(editor.draw));\n        return previousPosition = position;\n      },\n      release: function() {\n        return previousPosition = null;\n      }\n    };\n  };\n\n  TOOLS = {\n    pencil: brushTool(\"pencil\", \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVQ4T5VTuw2DMBB9LmkZg54ZGCDpHYkJYBBYATcUSKnSwAy0iDFoKR0fDgiMDc5JLvy59969OzPchzSesP3+sLFgySoMweMYou/xmWe81VKx5d0CyCQBoghoGgiV/JombwDNzjkwjsAw/A8gswwgBWm6VPdU7L4laPa6BsrSyX6oxTBQ7munO1v9LgCv2ldCWxcWgDV4EDjZbQq0dDKv65ytuxokKdtWO08AagkhTr2/BiD2otBv8hyMurCbPHNaTQ8OBjJScZFs9eChTKMwB8byT5ajkwIC8E22AvyY7j7ZJugLVIZ5EV8R1SQAAAAASUVORK5CYII=\"),\n    brush: brushTool(\"brush\", \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAKBJREFUeJytkrsRgzAQRFeME6UXXwVUogKoRB2JmAagEEqBcB0ge/Dw0cm2ZpTd7tuTFqg/zBcA0NSKkwg6719G1WJSlUnkI4XZgCGQql+tQKoCbYt+WWrB2SDGA92aYKMD/6dbEjCJAPP8A73wbe5OnAuDYV1LsyfkEMgYi4W5ciW56Zxzt/THBR2YJmAcbXn34s77d+dh6Ps+2tlw8eGedfBU8rnbDOMAAAAASUVORK5CYII=\"),\n    eraser: brushTool(\"pencil\", \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==\", {\n      index: 0\n    }),\n    dropper: {\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAH1JREFUeJztjrsNhDAUBIfLTOiYsiClCHdEDUT0Q0rscElY3QkJOD4hI1nye/aOFm5S/Ny1sd/l43AdAqoq6hDWsr8aqIsRgLYsKcbRbzpq4wb0OQPQTJNXh+E18ulilFLyfBopJZmzEn+WhuGy5NvklWxKrgpYgrclFj3DDPqoerGlCYunAAAAAElFTkSuQmCC\",\n      touch: function(_arg) {\n        var editor, index, position, x, y;\n        position = _arg.position, editor = _arg.editor;\n        x = position.x, y = position.y;\n        index = editor.layer().get(x, y);\n        return editor.activeIndex(index);\n      },\n      move: function(_arg) {\n        var editor, index, position, x, y;\n        position = _arg.position, editor = _arg.editor;\n        x = position.x, y = position.y;\n        index = editor.layer().get(x, y);\n        return editor.activeIndex(index);\n      },\n      release: function() {\n        return editor.activeTool(editor.previousTool());\n      }\n    },\n    fill: {\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4T52TPRKCMBCFX0pbj+HY0tJKY+UB8AqchCuYXofCRs9gy3ADW1rKmLeQTIBEZ0wTwu779idZhfQygUml3FIGikPb8ux5MUDM+S9AWAIjRrNNZYDLdov7MEiqx80G576PQqIAJ75NgJMFXPMc6vlcQZYAI842unq/YQ4HoKrGho1iqLqeQWadZuSyLKG1FmeWwMjY7QDCJlAIcQAj4iyDfr1kp4gggVgb9nsPUkXhs1gBJBpX1wFtC20BrpmSjS0pDbD1h8uJeQu+pKaJAmgfy5icQzH/sani9HgkAWLnLTAi0+YeiFmu+QXwEH5EHpAx7EFwld+GybVjOVTJdzBrYOKwGqoP9IV4EbRDWfEAAAAASUVORK5CYII=\",\n      touch: function(_arg) {\n        var editor, height, index, position, queue, safetyHatch, targetIndex, width, _ref1;\n        position = _arg.position, editor = _arg.editor;\n        index = editor.activeIndex();\n        targetIndex = editor.getPixel(position).index;\n        if (targetIndex == null) {\n          return;\n        }\n        if (index === targetIndex) {\n          return;\n        }\n        queue = [position];\n        editor.draw(position);\n        _ref1 = editor.pixelExtent(), width = _ref1.width, height = _ref1.height;\n        safetyHatch = width * height;\n        while (queue.length && safetyHatch > 0) {\n          position = queue.pop();\n          neighbors(position).forEach(function(position) {\n            var _ref2;\n            if (((_ref2 = editor.getPixel(position)) != null ? _ref2.index : void 0) === targetIndex) {\n              safetyHatch -= 1;\n              editor.draw(position);\n              return queue.push(position);\n            }\n          });\n        }\n      },\n      move: function() {},\n      release: function() {}\n    },\n    circle: shapeTool(circle, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVQ4T2NkwA7+YxFmxKYUXRCmEZtirHLICkEKsNqCZjOKOpgGYjXDzIKrp4oBpNqO4gqQC0YNgAQJqeFA3WjESBw48gdWdVTNC8gWk50bCbgeUxoAvXwcEQnwKSYAAAAASUVORK5CYII=\"),\n    rect: shapeTool(rect, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVQ4T2NkoBAwUqifYfAY8J9MrzDCvDBqAAPDMAgDMpMBwyBKymR7AQAp1wgR44q8HgAAAABJRU5ErkJggg==\"),\n    rectOutline: shapeTool(rectOutline, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4T2NkoBAwUqifgWoG/CfTJYwwF4AMINU1YD2jBgy7MCAnLcHTATmawXpITX0YFlFsAADRBBIRAZEL0wAAAABJRU5ErkJggg==\"),\n    line2: shapeTool(line2, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAV0lEQVQ4T6XSyQ0AIAgEQOm/aIWHxoNzJTG+GASk9hnE+Z2P3FDMRBjZK0PI/fQyovVeQqzhpRFv+ikkWl+IRID8DRfJAC6SBUykAqhIFXgQBDgQFFjIAMAADxGQlO+iAAAAAElFTkSuQmCC\")\n  };\n\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      addTool: function(tool) {\n        return self.tools.push(tool);\n      },\n      activeTool: Observable(),\n      previousTool: Observable(),\n      tools: Observable([])\n    });\n    Object.keys(TOOLS).forEach(function(name) {\n      return self.addTool(TOOLS[name]);\n    });\n    self.activeTool(self.tools()[0]);\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "util": {
      "path": "util",
      "content": "(function() {\n  var Size, isObject;\n\n  global.Deferred = jQuery.Deferred;\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n  Size = function(width, height) {\n    var _ref;\n    if (isObject(width)) {\n      _ref = width, width = _ref.width, height = _ref.height;\n    }\n    return {\n      width: width,\n      height: height,\n      __proto__: Size.prototype\n    };\n  };\n\n  Size.prototype = {\n    scale: function(scalar) {\n      return Size(this.width * scalar, this.height * scalar);\n    },\n    toString: function() {\n      return \"Size(\" + this.width + \", \" + this.height + \")\";\n    },\n    max: function(otherSize) {\n      return Size(Math.max(this.width, otherSize.width), Math.max(this.height, otherSize.height));\n    },\n    each: function(iterator) {\n      var _i, _ref, _results;\n      return (function() {\n        _results = [];\n        for (var _i = 0, _ref = this.height; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(y) {\n        var _i, _ref, _results;\n        return (function() {\n          _results = [];\n          for (var _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).forEach(function(x) {\n          return iterator(x, y);\n        });\n      });\n    }\n  };\n\n  Point.prototype.scale = function(scalar) {\n    if (isObject(scalar)) {\n      return Point(this.x * scalar.width, this.y * scalar.height);\n    } else {\n      return Point(this.x * scalar, this.y * scalar);\n    }\n  };\n\n  module.exports = {\n    Size: Size,\n    Grid: function(width, height, defaultValue) {\n      var generateValue, grid, self, _i, _results;\n      generateValue = function(x, y) {\n        if (typeof defaultValue === \"function\") {\n          return defaultValue(x, y);\n        } else {\n          return defaultValue;\n        }\n      };\n      grid = (function() {\n        _results = [];\n        for (var _i = 0; 0 <= height ? _i < height : _i > height; 0 <= height ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function(y) {\n        var _i, _results;\n        return (function() {\n          _results = [];\n          for (var _i = 0; 0 <= width ? _i < width : _i > width; 0 <= width ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).map(function(x) {\n          return generateValue(x, y);\n        });\n      });\n      self = {\n        contract: function(x, y) {\n          height -= y;\n          width -= x;\n          grid.length = height;\n          grid.forEach(function(row) {\n            return row.length = width;\n          });\n          return self;\n        },\n        copy: function() {\n          return Grid(width, height, self.get);\n        },\n        get: function(x, y) {\n          if (x < 0 || x >= width) {\n            return;\n          }\n          if (y < 0 || y >= height) {\n            return;\n          }\n          return grid[y][x];\n        },\n        set: function(x, y, value) {\n          if (x < 0 || x >= width) {\n            return;\n          }\n          if (y < 0 || y >= height) {\n            return;\n          }\n          return grid[y][x] = value;\n        },\n        each: function(iterator) {\n          grid.forEach(function(row, y) {\n            return row.forEach(function(value, x) {\n              return iterator(value, x, y);\n            });\n          });\n          return self;\n        },\n        expand: function(x, y, defaultValue) {\n          var newRows, _j, _results1;\n          newRows = (function() {\n            _results1 = [];\n            for (var _j = 0; 0 <= y ? _j < y : _j > y; 0 <= y ? _j++ : _j--){ _results1.push(_j); }\n            return _results1;\n          }).apply(this).map(function(y) {\n            var _j, _results1;\n            return (function() {\n              _results1 = [];\n              for (var _j = 0; 0 <= width ? _j < width : _j > width; 0 <= width ? _j++ : _j--){ _results1.push(_j); }\n              return _results1;\n            }).apply(this).map(function(x) {\n              if (typeof defaultValue === \"function\") {\n                return defaultValue(x, y + height);\n              } else {\n                return defaultValue;\n              }\n            });\n          });\n          grid = grid.concat(newRows);\n          grid = grid.map(function(row, y) {\n            var _k, _results2;\n            return row.concat((function() {\n              _results2 = [];\n              for (var _k = 0; 0 <= x ? _k < x : _k > x; 0 <= x ? _k++ : _k--){ _results2.push(_k); }\n              return _results2;\n            }).apply(this).map(function(x) {\n              if (typeof defaultValue === \"function\") {\n                return defaultValue(width + x, y);\n              } else {\n                return defaultValue;\n              }\n            }));\n          });\n          height = y + height;\n          width = x + width;\n          return self;\n        },\n        toArray: function() {\n          return grid.reduce(function(a, b) {\n            return a.concat(b);\n          }, []);\n        }\n      };\n      return self;\n    },\n    line: function(p0, p1, iterator) {\n      var dx, dy, e2, err, sx, sy, x0, x1, y0, y1, _results;\n      x0 = p0.x, y0 = p0.y;\n      x1 = p1.x, y1 = p1.y;\n      dx = (x1 - x0).abs();\n      dy = (y1 - y0).abs();\n      sx = (x1 - x0).sign();\n      sy = (y1 - y0).sign();\n      err = dx - dy;\n      _results = [];\n      while (!(x0 === x1 && y0 === y1)) {\n        e2 = 2 * err;\n        if (e2 > -dy) {\n          err -= dy;\n          x0 += sx;\n        }\n        if (e2 < dx) {\n          err += dx;\n          y0 += sy;\n        }\n        _results.push(iterator({\n          x: x0,\n          y: y0\n        }));\n      }\n      return _results;\n    },\n    rect: function(start, end, iterator) {\n      var _i, _ref, _ref1, _results;\n      return (function() {\n        _results = [];\n        for (var _i = _ref = start.y, _ref1 = end.y; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(y) {\n        var _i, _ref, _ref1, _results;\n        return (function() {\n          _results = [];\n          for (var _i = _ref = start.x, _ref1 = end.x; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).forEach(function(x) {\n          return iterator({\n            x: x,\n            y: y\n          });\n        });\n      });\n    },\n    rectOutline: function(start, end, iterator) {\n      var _i, _ref, _ref1, _results;\n      return (function() {\n        _results = [];\n        for (var _i = _ref = start.y, _ref1 = end.y; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(y) {\n        var _i, _ref, _ref1, _results;\n        if (y === start.y || y === end.y) {\n          return (function() {\n            _results = [];\n            for (var _i = _ref = start.x, _ref1 = end.x; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).forEach(function(x) {\n            return iterator({\n              x: x,\n              y: y\n            });\n          });\n        } else {\n          iterator({\n            x: start.x,\n            y: y\n          });\n          return iterator({\n            x: end.x,\n            y: y\n          });\n        }\n      });\n    },\n    circle: function(start, endPoint, iterator) {\n      var center, ddFx, ddFy, extent, f, radius, x, x0, x1, y, y0, y1, _results;\n      center = Point.interpolate(start, endPoint, 0.5).floor();\n      x0 = center.x, y0 = center.y;\n      x1 = endPoint.x, y1 = endPoint.y;\n      extent = endPoint.subtract(start).scale(0.5).abs().floor();\n      radius = Math.min(extent.x, extent.y);\n      f = 1 - radius;\n      ddFx = 1;\n      ddFy = -2 * radius;\n      x = 0;\n      y = radius;\n      iterator(Point(x0, y0 + radius));\n      iterator(Point(x0, y0 - radius));\n      iterator(Point(x0 + radius, y0));\n      iterator(Point(x0 - radius, y0));\n      _results = [];\n      while (x < y) {\n        if (f > 0) {\n          y--;\n          ddFy += 2;\n          f += ddFy;\n        }\n        x++;\n        ddFx += 2;\n        f += ddFx;\n        iterator(Point(x0 + x, y0 + y));\n        iterator(Point(x0 - x, y0 + y));\n        iterator(Point(x0 + x, y0 - y));\n        iterator(Point(x0 - x, y0 - y));\n        iterator(Point(x0 + y, y0 + x));\n        iterator(Point(x0 - y, y0 + x));\n        iterator(Point(x0 + y, y0 - x));\n        _results.push(iterator(Point(x0 - y, y0 - x)));\n      }\n      return _results;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "version": "0.1.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "https://code.jquery.com/jquery-1.11.0.min.js"
  ],
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/pixel-editor",
    "homepage": null,
    "description": "It edits pixels",
    "html_url": "https://github.com/STRd6/pixel-editor",
    "url": "https://api.github.com/repos/STRd6/pixel-editor",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "appcache": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "appcache\n========\n\nHTML5 AppCache Helpers\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "App Cache\n=========\n\nSome helpers for working with HTML5 application cache.\n\nhttp://www.html5rocks.com/en/tutorials/appcache/beginner/\n\n    applicationCache = window.applicationCache\n\n    applicationCache.addEventListener 'updateready', (e) ->\n      if applicationCache.status is applicationCache.UPDATEREADY\n        # Browser downloaded a new app cache.\n        if confirm('A new version of this site is available. Load it?')\n          window.location.reload()\n    , false\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nentryPoint: \"main\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var applicationCache;\n\n  applicationCache = window.applicationCache;\n\n  applicationCache.addEventListener('updateready', function(e) {\n    if (applicationCache.status === applicationCache.UPDATEREADY) {\n      if (confirm('A new version of this site is available. Load it?')) {\n        return window.location.reload();\n      }\n    }\n  }, false);\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"main\"};",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "repository": {
        "id": 14539483,
        "name": "appcache",
        "full_name": "distri/appcache",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/appcache",
        "description": "HTML5 AppCache Helpers",
        "fork": false,
        "url": "https://api.github.com/repos/distri/appcache",
        "forks_url": "https://api.github.com/repos/distri/appcache/forks",
        "keys_url": "https://api.github.com/repos/distri/appcache/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/appcache/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/appcache/teams",
        "hooks_url": "https://api.github.com/repos/distri/appcache/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/appcache/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/appcache/events",
        "assignees_url": "https://api.github.com/repos/distri/appcache/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/appcache/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/appcache/tags",
        "blobs_url": "https://api.github.com/repos/distri/appcache/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/appcache/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/appcache/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/appcache/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/appcache/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/appcache/languages",
        "stargazers_url": "https://api.github.com/repos/distri/appcache/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/appcache/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/appcache/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/appcache/subscription",
        "commits_url": "https://api.github.com/repos/distri/appcache/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/appcache/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/appcache/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/appcache/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/appcache/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/appcache/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/appcache/merges",
        "archive_url": "https://api.github.com/repos/distri/appcache/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/appcache/downloads",
        "issues_url": "https://api.github.com/repos/distri/appcache/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/appcache/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/appcache/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/appcache/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/appcache/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/appcache/releases{/id}",
        "created_at": "2013-11-19T22:09:16Z",
        "updated_at": "2013-11-29T20:49:51Z",
        "pushed_at": "2013-11-19T22:10:28Z",
        "git_url": "git://github.com/distri/appcache.git",
        "ssh_url": "git@github.com:distri/appcache.git",
        "clone_url": "https://github.com/distri/appcache.git",
        "svn_url": "https://github.com/distri/appcache",
        "homepage": null,
        "size": 240,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "bindable": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.coffee.md": {
          "path": "README.coffee.md",
          "mode": "100644",
          "content": "Bindable\n========\n\n    Core = require \"core\"\n\nAdd event binding to objects.\n\n>     bindable = Bindable()\n>     bindable.on \"greet\", ->\n>       console.log \"yo!\"\n>     bindable.trigger \"greet\"\n>     #=> \"yo!\" is printed to log\n\nUse as a mixin.\n\n>    self.include Bindable\n\n    module.exports = (I={}, self=Core(I)) ->\n      eventCallbacks = {}\n\n      self.extend\n\nAdds a function as an event listener.\n\nThis will call `coolEventHandler` after `yourObject.trigger \"someCustomEvent\"`\nis called.\n\n>     yourObject.on \"someCustomEvent\", coolEventHandler\n\nHandlers can be attached to namespaces as well. The namespaces are only used\nfor finer control of targeting event removal. For example if you are making a\ncustom drawing system you could unbind `\".Drawable\"` events and add your own.\n\n>     yourObject.on \"\"\n\n        on: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          # HACK: Here we annotate the callback function with namespace metadata\n          # This will probably lead to some strange edge cases, but should work fine\n          # for simple cases.\n          if namespace\n            callback.__PIXIE ||= {}\n            callback.__PIXIE[namespace] = true\n\n          eventCallbacks[event] ||= []\n          eventCallbacks[event].push(callback)\n\n          return self\n\nRemoves a specific event listener, or all event listeners if\nno specific listener is given.\n\nRemoves the handler coolEventHandler from the event `\"someCustomEvent\"` while\nleaving the other events intact.\n\n>     yourObject.off \"someCustomEvent\", coolEventHandler\n\nRemoves all handlers attached to `\"anotherCustomEvent\"`\n\n>     yourObject.off \"anotherCustomEvent\"\n\nRemove all handlers from the `\".Drawable\" namespace`\n\n>     yourObject.off \".Drawable\"\n\n        off: (namespacedEvent, callback) ->\n          [event, namespace] = namespacedEvent.split(\".\")\n\n          if event\n            eventCallbacks[event] ||= []\n\n            if namespace\n              # Select only the callbacks that do not have this namespace metadata\n              eventCallbacks[event] = eventCallbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n            else\n              if callback\n                remove eventCallbacks[event], callback\n              else\n                eventCallbacks[event] = []\n          else if namespace\n            # No event given\n            # Select only the callbacks that do not have this namespace metadata\n            # for any events bound\n            for key, callbacks of eventCallbacks\n              eventCallbacks[key] = callbacks.filter (callback) ->\n                !callback.__PIXIE?[namespace]?\n\n          return self\n\nCalls all listeners attached to the specified event.\n\n>     # calls each event handler bound to \"someCustomEvent\"\n>     yourObject.trigger \"someCustomEvent\"\n\nAdditional parameters can be passed to the handlers.\n\n>     yourObject.trigger \"someEvent\", \"hello\", \"anotherParameter\"\n\n        trigger: (event, parameters...) ->\n          callbacks = eventCallbacks[event]\n\n          if callbacks\n            callbacks.forEach (callback) ->\n              callback.apply(self, parameters)\n\n          return self\n\nLegacy method aliases.\n\n      self.extend\n        bind: self.on\n        unbind: self.off\n\nHelpers\n-------\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "entryPoint: \"README\"\nversion: \"0.1.0\"\ndependencies:\n  core: \"distri/core:v0.6.0\"\n",
          "type": "blob"
        },
        "test/bindable.coffee": {
          "path": "test/bindable.coffee",
          "mode": "100644",
          "content": "test = it\nok = assert\nequal = assert.equal\n\nBindable = require \"../README\"\n\ndescribe \"Bindable\", ->\n\n  test \"#bind and #trigger\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"Multiple bindings\", ->\n    o = Bindable()\n\n    o.bind(\"test\", -> ok true)\n    o.bind(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"#trigger arguments\", ->\n    o = Bindable()\n\n    param1 = \"the message\"\n    param2 = 3\n\n    o.bind \"test\", (p1, p2) ->\n      equal(p1, param1)\n      equal(p2, param2)\n\n    o.trigger \"test\", param1, param2\n\n  test \"#unbind\", ->\n    o = Bindable()\n\n    callback = ->\n      ok false\n\n    o.bind \"test\", callback\n    # Unbind specific event\n    o.unbind \"test\", callback\n    o.trigger \"test\"\n\n    o.bind \"test\", callback\n    # Unbind all events\n    o.unbind \"test\"\n    o.trigger \"test\"\n\n  test \"#trigger namespace\", ->\n    o = Bindable()\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\"\n    o.trigger \"test\"\n\n  test \"#unbind namespaced\", ->\n    o = Bindable()\n\n    o.bind \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.unbind \".TestNamespace\", ->\n    o.trigger \"test\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "README": {
          "path": "README",
          "content": "(function() {\n  var Core, remove,\n    __slice = [].slice;\n\n  Core = require(\"core\");\n\n  module.exports = function(I, self) {\n    var eventCallbacks;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    eventCallbacks = {};\n    self.extend({\n      on: function(namespacedEvent, callback) {\n        var event, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (namespace) {\n          callback.__PIXIE || (callback.__PIXIE = {});\n          callback.__PIXIE[namespace] = true;\n        }\n        eventCallbacks[event] || (eventCallbacks[event] = []);\n        eventCallbacks[event].push(callback);\n        return self;\n      },\n      off: function(namespacedEvent, callback) {\n        var callbacks, event, key, namespace, _ref;\n        _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n        if (event) {\n          eventCallbacks[event] || (eventCallbacks[event] = []);\n          if (namespace) {\n            eventCallbacks[event] = eventCallbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          } else {\n            if (callback) {\n              remove(eventCallbacks[event], callback);\n            } else {\n              eventCallbacks[event] = [];\n            }\n          }\n        } else if (namespace) {\n          for (key in eventCallbacks) {\n            callbacks = eventCallbacks[key];\n            eventCallbacks[key] = callbacks.filter(function(callback) {\n              var _ref1;\n              return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n            });\n          }\n        }\n        return self;\n      },\n      trigger: function() {\n        var callbacks, event, parameters;\n        event = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n        callbacks = eventCallbacks[event];\n        if (callbacks) {\n          callbacks.forEach(function(callback) {\n            return callback.apply(self, parameters);\n          });\n        }\n        return self;\n      }\n    });\n    return self.extend({\n      bind: self.on,\n      unbind: self.off\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=README.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.1.0\",\"dependencies\":{\"core\":\"distri/core:v0.6.0\"}};",
          "type": "blob"
        },
        "test/bindable": {
          "path": "test/bindable",
          "content": "(function() {\n  var Bindable, equal, ok, test;\n\n  test = it;\n\n  ok = assert;\n\n  equal = assert.equal;\n\n  Bindable = require(\"../README\");\n\n  describe(\"Bindable\", function() {\n    test(\"#bind and #trigger\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"Multiple bindings\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      o.bind(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger arguments\", function() {\n      var o, param1, param2;\n      o = Bindable();\n      param1 = \"the message\";\n      param2 = 3;\n      o.bind(\"test\", function(p1, p2) {\n        equal(p1, param1);\n        return equal(p2, param2);\n      });\n      return o.trigger(\"test\", param1, param2);\n    });\n    test(\"#unbind\", function() {\n      var callback, o;\n      o = Bindable();\n      callback = function() {\n        return ok(false);\n      };\n      o.bind(\"test\", callback);\n      o.unbind(\"test\", callback);\n      o.trigger(\"test\");\n      o.bind(\"test\", callback);\n      o.unbind(\"test\");\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger namespace\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\");\n      return o.trigger(\"test\");\n    });\n    return test(\"#unbind namespaced\", function() {\n      var o;\n      o = Bindable();\n      o.bind(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.unbind(\".TestNamespace\", function() {});\n      return o.trigger(\"test\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/bindable.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.0",
      "entryPoint": "README",
      "repository": {
        "id": 17189431,
        "name": "bindable",
        "full_name": "distri/bindable",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/bindable",
        "description": "Event binding",
        "fork": false,
        "url": "https://api.github.com/repos/distri/bindable",
        "forks_url": "https://api.github.com/repos/distri/bindable/forks",
        "keys_url": "https://api.github.com/repos/distri/bindable/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/bindable/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/bindable/teams",
        "hooks_url": "https://api.github.com/repos/distri/bindable/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/bindable/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/bindable/events",
        "assignees_url": "https://api.github.com/repos/distri/bindable/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/bindable/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/bindable/tags",
        "blobs_url": "https://api.github.com/repos/distri/bindable/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/bindable/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/bindable/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/bindable/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/bindable/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/bindable/languages",
        "stargazers_url": "https://api.github.com/repos/distri/bindable/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/bindable/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/bindable/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/bindable/subscription",
        "commits_url": "https://api.github.com/repos/distri/bindable/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/bindable/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/bindable/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/bindable/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/bindable/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/bindable/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/bindable/merges",
        "archive_url": "https://api.github.com/repos/distri/bindable/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/bindable/downloads",
        "issues_url": "https://api.github.com/repos/distri/bindable/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/bindable/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/bindable/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/bindable/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/bindable/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/bindable/releases{/id}",
        "created_at": "2014-02-25T21:50:35Z",
        "updated_at": "2014-02-25T21:50:35Z",
        "pushed_at": "2014-02-25T21:50:35Z",
        "git_url": "git://github.com/distri/bindable.git",
        "ssh_url": "git@github.com:distri/bindable.git",
        "clone_url": "https://github.com/distri/bindable.git",
        "svn_url": "https://github.com/distri/bindable",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.1.0",
        "defaultBranch": "master"
      },
      "dependencies": {
        "core": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "core\n====\n\nAn object extension system.\n",
              "type": "blob"
            },
            "core.coffee.md": {
              "path": "core.coffee.md",
              "mode": "100644",
              "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
              "type": "blob"
            },
            "test/core.coffee": {
              "path": "test/core.coffee",
              "mode": "100644",
              "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "core": {
              "path": "core",
              "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
              "type": "blob"
            },
            "test/core": {
              "path": "test/core",
              "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.6.0",
          "entryPoint": "core",
          "repository": {
            "id": 13567517,
            "name": "core",
            "full_name": "distri/core",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/core",
            "description": "An object extension system.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/core",
            "forks_url": "https://api.github.com/repos/distri/core/forks",
            "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/core/teams",
            "hooks_url": "https://api.github.com/repos/distri/core/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/core/events",
            "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/core/tags",
            "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/core/languages",
            "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/core/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/core/subscription",
            "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/core/merges",
            "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/core/downloads",
            "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
            "created_at": "2013-10-14T17:04:33Z",
            "updated_at": "2013-12-24T00:49:21Z",
            "pushed_at": "2013-10-14T23:49:11Z",
            "git_url": "git://github.com/distri/core.git",
            "ssh_url": "git@github.com:distri/core.git",
            "clone_url": "https://github.com/distri/core.git",
            "svn_url": "https://github.com/distri/core",
            "homepage": null,
            "size": 592,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.6.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "byte_array": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "byte_array\n==========\n\nStore bytes in an array. Serialize and restore from JSON\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Byte Array\n=========\n\nExperiment to store an array of 8-bit data and serialize back and forth from JSON.\n\n    module.exports = (sizeOrData) ->\n      if typeof sizeOrData is \"string\"\n        view = deserialize(sizeOrData)\n      else\n        buffer = new ArrayBuffer(sizeOrData)\n        view = new Uint8Array(buffer)\n\n      self =\n        get: (i) ->\n          return view[i]\n\n        set: (i, value) ->\n          view[i] = value\n\n          return self.get(i)\n\n        size: ->\n          view.length\n\n        toJSON: ->\n          serialize(view)\n\n    mimeType = \"application/octet-binary\"\n\n    deserialize = (dataURL) ->\n      dataString = dataURL.substring(dataURL.indexOf(';') + 1)\n\n      binaryString = atob(dataString)\n      length =  binaryString.length\n\n      buffer = new ArrayBuffer length\n\n      view = new Uint8Array(buffer)\n\n      i = 0\n      while i < length\n        view[i] = binaryString.charCodeAt(i)\n        i += 1\n\n      return view\n\n    serialize = (bytes) ->\n      binary = ''\n      length = bytes.byteLength\n\n      i = 0\n      while i < length\n        binary += String.fromCharCode(bytes[i])\n        i += 1\n\n      \"data:#{mimeType};#{btoa(binary)}\"\n",
          "type": "blob"
        },
        "test/byte_array.coffee": {
          "path": "test/byte_array.coffee",
          "mode": "100644",
          "content": "ByteArray = require \"../main\"\n\ntestPattern = (n) ->\n  byteArray = ByteArray(256)\n\n  [0...256].forEach (i) ->\n    byteArray.set(i, i % n is 0)\n\n  reloadedArray = ByteArray(byteArray.toJSON())\n\n  [0...256].forEach (i) ->\n    test = 0 | (i % n is 0)\n    assert.equal reloadedArray.get(i), test, \"Byte #{i} is #{test}\"\n\ndescribe \"ByteArray\", ->\n  it \"should be empty to start\", ->\n    byteArray = ByteArray(256)\n\n    [0...256].forEach (i) ->\n      assert.equal byteArray.get(i), 0\n\n  it \"should be able to set and get byts\", ->\n    byteArray = ByteArray(512)\n\n    [0...512].forEach (i) ->\n      byteArray.set(i, i)\n\n    [0...512].forEach (i) ->\n      assert.equal byteArray.get(i), i % 256\n\n  it \"should be serializable and deserializable\", ->\n    byteArray = ByteArray(512)\n\n    [0...512].forEach (i) ->\n      byteArray.set(i, i)\n\n    reloadedArray = ByteArray(byteArray.toJSON())\n\n    [0...512].forEach (i) ->\n      assert.equal reloadedArray.get(i), i % 256, \"Byte #{i} is #{i % 256}\"\n\n  it \"should be serializable and deserializable with various patterns\", ->\n    testPattern(1)\n    testPattern(2)\n    testPattern(3)\n    testPattern(4)\n    testPattern(5)\n    testPattern(7)\n    testPattern(11)\n    testPattern(32)\n    testPattern(63)\n    testPattern(64)\n    testPattern(77)\n    testPattern(128)\n\n  # Some may wish for this to throw an error, but normal JS arrays don't\n  # and by default neither do typed arrays so this is just 'going with the flow'\n  it \"should silently discard setting out of range values\", ->\n    byteArray = ByteArray(8)\n\n    assert.equal byteArray.set(9, 1), undefined\n    assert.equal byteArray.get(9), undefined\n\n  it \"should know its size\", ->\n    byteArray = ByteArray(128)\n\n    assert.equal byteArray.size(), 128\n\n  it \"shouldn't be too big when serializing as json\", ->\n    byteLength = 2048\n    byteArray = ByteArray(byteLength)\n\n    serializedLength = byteArray.toJSON().length\n\n    n = 0.70\n    assert serializedLength < byteLength / n, \"Serialized length < bit length divided by #{n} : #{serializedLength} < #{byteLength / n}\"\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.1.1\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var deserialize, mimeType, serialize;\n\n  module.exports = function(sizeOrData) {\n    var buffer, self, view;\n    if (typeof sizeOrData === \"string\") {\n      view = deserialize(sizeOrData);\n    } else {\n      buffer = new ArrayBuffer(sizeOrData);\n      view = new Uint8Array(buffer);\n    }\n    return self = {\n      get: function(i) {\n        return view[i];\n      },\n      set: function(i, value) {\n        view[i] = value;\n        return self.get(i);\n      },\n      size: function() {\n        return view.length;\n      },\n      toJSON: function() {\n        return serialize(view);\n      }\n    };\n  };\n\n  mimeType = \"application/octet-binary\";\n\n  deserialize = function(dataURL) {\n    var binaryString, buffer, dataString, i, length, view;\n    dataString = dataURL.substring(dataURL.indexOf(';') + 1);\n    binaryString = atob(dataString);\n    length = binaryString.length;\n    buffer = new ArrayBuffer(length);\n    view = new Uint8Array(buffer);\n    i = 0;\n    while (i < length) {\n      view[i] = binaryString.charCodeAt(i);\n      i += 1;\n    }\n    return view;\n  };\n\n  serialize = function(bytes) {\n    var binary, i, length;\n    binary = '';\n    length = bytes.byteLength;\n    i = 0;\n    while (i < length) {\n      binary += String.fromCharCode(bytes[i]);\n      i += 1;\n    }\n    return \"data:\" + mimeType + \";\" + (btoa(binary));\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "test/byte_array": {
          "path": "test/byte_array",
          "content": "(function() {\n  var ByteArray, testPattern;\n\n  ByteArray = require(\"../main\");\n\n  testPattern = function(n) {\n    var byteArray, reloadedArray, _i, _j, _results, _results1;\n    byteArray = ByteArray(256);\n    (function() {\n      _results = [];\n      for (_i = 0; _i < 256; _i++){ _results.push(_i); }\n      return _results;\n    }).apply(this).forEach(function(i) {\n      return byteArray.set(i, i % n === 0);\n    });\n    reloadedArray = ByteArray(byteArray.toJSON());\n    return (function() {\n      _results1 = [];\n      for (_j = 0; _j < 256; _j++){ _results1.push(_j); }\n      return _results1;\n    }).apply(this).forEach(function(i) {\n      var test;\n      test = 0 | (i % n === 0);\n      return assert.equal(reloadedArray.get(i), test, \"Byte \" + i + \" is \" + test);\n    });\n  };\n\n  describe(\"ByteArray\", function() {\n    it(\"should be empty to start\", function() {\n      var byteArray, _i, _results;\n      byteArray = ByteArray(256);\n      return (function() {\n        _results = [];\n        for (_i = 0; _i < 256; _i++){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(i) {\n        return assert.equal(byteArray.get(i), 0);\n      });\n    });\n    it(\"should be able to set and get byts\", function() {\n      var byteArray, _i, _j, _results, _results1;\n      byteArray = ByteArray(512);\n      (function() {\n        _results = [];\n        for (_i = 0; _i < 512; _i++){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(i) {\n        return byteArray.set(i, i);\n      });\n      return (function() {\n        _results1 = [];\n        for (_j = 0; _j < 512; _j++){ _results1.push(_j); }\n        return _results1;\n      }).apply(this).forEach(function(i) {\n        return assert.equal(byteArray.get(i), i % 256);\n      });\n    });\n    it(\"should be serializable and deserializable\", function() {\n      var byteArray, reloadedArray, _i, _j, _results, _results1;\n      byteArray = ByteArray(512);\n      (function() {\n        _results = [];\n        for (_i = 0; _i < 512; _i++){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(i) {\n        return byteArray.set(i, i);\n      });\n      reloadedArray = ByteArray(byteArray.toJSON());\n      return (function() {\n        _results1 = [];\n        for (_j = 0; _j < 512; _j++){ _results1.push(_j); }\n        return _results1;\n      }).apply(this).forEach(function(i) {\n        return assert.equal(reloadedArray.get(i), i % 256, \"Byte \" + i + \" is \" + (i % 256));\n      });\n    });\n    it(\"should be serializable and deserializable with various patterns\", function() {\n      testPattern(1);\n      testPattern(2);\n      testPattern(3);\n      testPattern(4);\n      testPattern(5);\n      testPattern(7);\n      testPattern(11);\n      testPattern(32);\n      testPattern(63);\n      testPattern(64);\n      testPattern(77);\n      return testPattern(128);\n    });\n    it(\"should silently discard setting out of range values\", function() {\n      var byteArray;\n      byteArray = ByteArray(8);\n      assert.equal(byteArray.set(9, 1), void 0);\n      return assert.equal(byteArray.get(9), void 0);\n    });\n    it(\"should know its size\", function() {\n      var byteArray;\n      byteArray = ByteArray(128);\n      return assert.equal(byteArray.size(), 128);\n    });\n    return it(\"shouldn't be too big when serializing as json\", function() {\n      var byteArray, byteLength, n, serializedLength;\n      byteLength = 2048;\n      byteArray = ByteArray(byteLength);\n      serializedLength = byteArray.toJSON().length;\n      n = 0.70;\n      return assert(serializedLength < byteLength / n, \"Serialized length < bit length divided by \" + n + \" : \" + serializedLength + \" < \" + (byteLength / n));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/byte_array.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.1\"};",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.1",
      "entryPoint": "main",
      "repository": {
        "id": 14937369,
        "name": "byte_array",
        "full_name": "distri/byte_array",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/byte_array",
        "description": "Store bytes in an array. Serialize and restore from JSON",
        "fork": false,
        "url": "https://api.github.com/repos/distri/byte_array",
        "forks_url": "https://api.github.com/repos/distri/byte_array/forks",
        "keys_url": "https://api.github.com/repos/distri/byte_array/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/byte_array/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/byte_array/teams",
        "hooks_url": "https://api.github.com/repos/distri/byte_array/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/byte_array/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/byte_array/events",
        "assignees_url": "https://api.github.com/repos/distri/byte_array/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/byte_array/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/byte_array/tags",
        "blobs_url": "https://api.github.com/repos/distri/byte_array/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/byte_array/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/byte_array/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/byte_array/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/byte_array/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/byte_array/languages",
        "stargazers_url": "https://api.github.com/repos/distri/byte_array/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/byte_array/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/byte_array/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/byte_array/subscription",
        "commits_url": "https://api.github.com/repos/distri/byte_array/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/byte_array/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/byte_array/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/byte_array/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/byte_array/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/byte_array/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/byte_array/merges",
        "archive_url": "https://api.github.com/repos/distri/byte_array/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/byte_array/downloads",
        "issues_url": "https://api.github.com/repos/distri/byte_array/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/byte_array/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/byte_array/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/byte_array/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/byte_array/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/byte_array/releases{/id}",
        "created_at": "2013-12-04T22:10:23Z",
        "updated_at": "2013-12-04T22:11:11Z",
        "pushed_at": "2013-12-04T22:10:23Z",
        "git_url": "git://github.com/distri/byte_array.git",
        "ssh_url": "git@github.com:distri/byte_array.git",
        "clone_url": "https://github.com/distri/byte_array.git",
        "svn_url": "https://github.com/distri/byte_array",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.1.1",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "cornerstone": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "cornerstone\n===========\n\nCore JavaScript Extensions.\n",
          "mode": "100644",
          "type": "blob"
        },
        "cornerstone.coffee.md": {
          "path": "cornerstone.coffee.md",
          "content": "Cornerstone\n===========\n\nRequire and pollute.\n\n    require \"extensions\"\n\n    global.Core = require(\"core\")\n\n    require(\"math\").pollute()\n\n    require \"./point\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.2.2-pre.0\"\nentryPoint: \"cornerstone\"\ndependencies:\n  math: \"distri/math:v0.2.0\"\n  extensions: \"distri/extensions:v0.2.0\"\n  core: \"distri/core:v0.6.0\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/cornerstone.coffee": {
          "path": "test/cornerstone.coffee",
          "content": "require \"../cornerstone\"\n\ndescribe \"Cornerstone\", ->\n  it \"should provide Core\", ->\n    assert Core\n\n  it \"should provide Matrix\", ->\n    assert Matrix\n\n  describe \"Point\", ->\n    \n    it \"should provide Point\", ->\n      assert Point\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n    ].forEach (method) ->\n      it \"should have Point::#{method}\", ->\n        assert Point()[method]\n\n  it \"should provide Random\", ->\n    assert Random\n\n  it \"should provide rand\", ->\n    assert rand\n\n  it \"should provide Function#debounce\", ->\n    assert (->).debounce\n",
          "mode": "100644",
          "type": "blob"
        },
        "point.coffee.md": {
          "path": "point.coffee.md",
          "content": "Extend Point With Math Magic\n============================\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n    ].forEach (method) ->\n      Point.prototype[method] = ->\n        Point(@x[method](), @y[method]())\n",
          "mode": "100644"
        }
      },
      "distribution": {
        "cornerstone": {
          "path": "cornerstone",
          "content": "(function() {\n  require(\"extensions\");\n\n  global.Core = require(\"core\");\n\n  require(\"math\").pollute();\n\n  require(\"./point\");\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.2-pre.0\",\"entryPoint\":\"cornerstone\",\"dependencies\":{\"math\":\"distri/math:v0.2.0\",\"extensions\":\"distri/extensions:v0.2.0\",\"core\":\"distri/core:v0.6.0\"}};",
          "type": "blob"
        },
        "test/cornerstone": {
          "path": "test/cornerstone",
          "content": "(function() {\n  require(\"../cornerstone\");\n\n  describe(\"Cornerstone\", function() {\n    it(\"should provide Core\", function() {\n      return assert(Core);\n    });\n    it(\"should provide Matrix\", function() {\n      return assert(Matrix);\n    });\n    describe(\"Point\", function() {\n      it(\"should provide Point\", function() {\n        return assert(Point);\n      });\n      return [\"abs\", \"ceil\", \"floor\"].forEach(function(method) {\n        return it(\"should have Point::\" + method, function() {\n          return assert(Point()[method]);\n        });\n      });\n    });\n    it(\"should provide Random\", function() {\n      return assert(Random);\n    });\n    it(\"should provide rand\", function() {\n      return assert(rand);\n    });\n    return it(\"should provide Function#debounce\", function() {\n      return assert((function() {}).debounce);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "point": {
          "path": "point",
          "content": "(function() {\n  [\"abs\", \"ceil\", \"floor\"].forEach(function(method) {\n    return Point.prototype[method] = function() {\n      return Point(this.x[method](), this.y[method]());\n    };\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.2.2-pre.0",
      "entryPoint": "cornerstone",
      "repository": {
        "branch": "v0.2.2-pre.0",
        "default_branch": "master",
        "full_name": "distri/cornerstone",
        "homepage": null,
        "description": "Core JavaScript Extensions.",
        "html_url": "https://github.com/distri/cornerstone",
        "url": "https://api.github.com/repos/distri/cornerstone",
        "publishBranch": "gh-pages"
      },
      "dependencies": {
        "math": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "math\n====\n\nMath is for cool guys.\n",
              "type": "blob"
            },
            "math.coffee.md": {
              "path": "math.coffee.md",
              "mode": "100644",
              "content": "Math\n====\n\nRequire and export many math libraries.\n\n    Point = require \"point\"\n\n    Matrix = require \"matrix\"\n    Matrix.Point = Point\n\n    Random = require \"random\"\n\n    module.exports = self =\n      Point: Point\n      Matrix: Matrix\n      Random: Random\n      rand: Random.rand\n\nPollute all libraries to the global namespace.\n\n      pollute: ->\n        Object.keys(self).forEach (key) ->\n          return if key is \"version\"\n          return if key is \"pollute\"\n\n          global[key] = self[key]\n\n        return self\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"math\"\nversion: \"0.2.0\"\ndependencies:\n  point: \"distri/point:v0.2.0\"\n  matrix: \"distri/matrix:v0.3.1\"\n  random: \"distri/random:v0.2.0\"\n",
              "type": "blob"
            },
            "test/math.coffee": {
              "path": "test/math.coffee",
              "mode": "100644",
              "content": "require(\"../math\").pollute()\n\nconsole.log global\n\ndescribe \"Point\", ->\n  it \"should exist\", ->\n    assert Point\n\n  it \"should construct points\", ->\n    assert Point()\n\ndescribe \"Matrix\", ->\n  it \"should exist and return matrices when invoked\", ->\n    assert Matrix\n\n    assert Matrix()\n\n  it \"should use the same `Point` class\", ->\n    assert Matrix.Point is Point\n\n    assert Matrix().transformPoint(Point()) instanceof Point\n\ndescribe \"Random\", ->\n  it \"should exist\", ->\n    assert Random\n\ndescribe \"rand\", ->\n  it \"should exist\", ->\n    assert rand\n\n    assert rand()?\n",
              "type": "blob"
            }
          },
          "distribution": {
            "math": {
              "path": "math",
              "content": "(function() {\n  var Matrix, Point, Random, self;\n\n  Point = require(\"point\");\n\n  Matrix = require(\"matrix\");\n\n  Matrix.Point = Point;\n\n  Random = require(\"random\");\n\n  module.exports = self = {\n    Point: Point,\n    Matrix: Matrix,\n    Random: Random,\n    rand: Random.rand,\n    pollute: function() {\n      Object.keys(self).forEach(function(key) {\n        if (key === \"version\") {\n          return;\n        }\n        if (key === \"pollute\") {\n          return;\n        }\n        return global[key] = self[key];\n      });\n      return self;\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=math.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"math\",\"version\":\"0.2.0\",\"dependencies\":{\"point\":\"distri/point:v0.2.0\",\"matrix\":\"distri/matrix:v0.3.1\",\"random\":\"distri/random:v0.2.0\"}};",
              "type": "blob"
            },
            "test/math": {
              "path": "test/math",
              "content": "(function() {\n  require(\"../math\").pollute();\n\n  console.log(global);\n\n  describe(\"Point\", function() {\n    it(\"should exist\", function() {\n      return assert(Point);\n    });\n    return it(\"should construct points\", function() {\n      return assert(Point());\n    });\n  });\n\n  describe(\"Matrix\", function() {\n    it(\"should exist and return matrices when invoked\", function() {\n      assert(Matrix);\n      return assert(Matrix());\n    });\n    return it(\"should use the same `Point` class\", function() {\n      assert(Matrix.Point === Point);\n      return assert(Matrix().transformPoint(Point()) instanceof Point);\n    });\n  });\n\n  describe(\"Random\", function() {\n    return it(\"should exist\", function() {\n      return assert(Random);\n    });\n  });\n\n  describe(\"rand\", function() {\n    return it(\"should exist\", function() {\n      assert(rand);\n      return assert(rand() != null);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/math.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "math",
          "repository": {
            "id": 13576636,
            "name": "math",
            "full_name": "distri/math",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/math",
            "description": "Math is for cool guys.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/math",
            "forks_url": "https://api.github.com/repos/distri/math/forks",
            "keys_url": "https://api.github.com/repos/distri/math/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/math/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/math/teams",
            "hooks_url": "https://api.github.com/repos/distri/math/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/math/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/math/events",
            "assignees_url": "https://api.github.com/repos/distri/math/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/math/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/math/tags",
            "blobs_url": "https://api.github.com/repos/distri/math/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/math/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/math/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/math/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/math/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/math/languages",
            "stargazers_url": "https://api.github.com/repos/distri/math/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/math/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/math/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/math/subscription",
            "commits_url": "https://api.github.com/repos/distri/math/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/math/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/math/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/math/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/math/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/math/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/math/merges",
            "archive_url": "https://api.github.com/repos/distri/math/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/math/downloads",
            "issues_url": "https://api.github.com/repos/distri/math/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/math/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/math/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/math/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/math/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/math/releases{/id}",
            "created_at": "2013-10-15T00:13:24Z",
            "updated_at": "2013-12-23T23:29:58Z",
            "pushed_at": "2013-10-15T18:45:48Z",
            "git_url": "git://github.com/distri/math.git",
            "ssh_url": "git@github.com:distri/math.git",
            "clone_url": "https://github.com/distri/math.git",
            "svn_url": "https://github.com/distri/math",
            "homepage": null,
            "size": 364,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.2.0",
            "defaultBranch": "master"
          },
          "dependencies": {
            "point": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "point\n=====\n\nJavaScript Point implementation\n",
                  "type": "blob"
                },
                "interactive_runtime.coffee.md": {
                  "path": "interactive_runtime.coffee.md",
                  "mode": "100644",
                  "content": "Interactive Runtime\n-------------------\n\n    window.Point = require(\"./point\")\n\nRegister our example runner.\n\n    Interactive.register \"example\", ({source, runtimeElement}) ->\n      program = CoffeeScript.compile(source, bare: true)\n\n      outputElement = document.createElement \"pre\"\n      runtimeElement.empty().append outputElement\n\n      result = eval(program)\n\n      if typeof result is \"number\"\n        if result != (0 | result)\n          result = result.toFixed(4)\n    \n\n      outputElement.textContent = result\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "version: \"0.2.0\"\nentryPoint: \"point\"\n",
                  "type": "blob"
                },
                "point.coffee.md": {
                  "path": "point.coffee.md",
                  "mode": "100644",
                  "content": "\nCreate a new point with given x and y coordinates. If no arguments are given\ndefaults to (0, 0).\n\n>     #! example\n>     Point()\n\n----\n\n>     #! example\n>     Point(-2, 5)\n\n----\n\n    Point = (x, y) ->\n      if isObject(x)\n        {x, y} = x\n\n      __proto__: Point.prototype\n      x: x ? 0\n      y: y ? 0\n\nPoint protoype methods.\n\n    Point:: =\n\nConstrain the magnitude of a vector.\n\n      clamp: (n) ->\n        if @magnitude() > n\n          @norm(n)\n        else\n          @copy()\n\nCreates a copy of this point.\n\n      copy: ->\n        Point(@x, @y)\n\n>     #! example\n>     Point(1, 1).copy()\n\n----\n\nAdds a point to this one and returns the new point. You may\nalso use a two argument call like `point.add(x, y)`\nto add x and y values without a second point object.\n\n      add: (first, second) ->\n        if second?\n          Point(\n            @x + first\n            @y + second\n          )\n        else\n          Point(\n            @x + first.x,\n            @y + first.y\n          )\n\n>     #! example\n>     Point(2, 3).add(Point(3, 4))\n\n----\n\nSubtracts a point to this one and returns the new point.\n\n      subtract: (first, second) ->\n        if second?\n          Point(\n            @x - first,\n            @y - second\n          )\n        else\n          @add(first.scale(-1))\n\n>     #! example\n>     Point(1, 2).subtract(Point(2, 0))\n\n----\n\nScale this Point (Vector) by a constant amount.\n\n      scale: (scalar) ->\n        Point(\n          @x * scalar,\n          @y * scalar\n        )\n\n>     #! example\n>     point = Point(5, 6).scale(2)\n\n----\n\nThe `norm` of a vector is the unit vector pointing in the same direction. This method\ntreats the point as though it is a vector from the origin to (x, y).\n\n      norm: (length=1.0) ->\n        if m = @length()\n          @scale(length/m)\n        else\n          @copy()\n\n>     #! example\n>     point = Point(2, 3).norm()\n\n----\n\nDetermine whether this `Point` is equal to another `Point`. Returns `true` if\nthey are equal and `false` otherwise.\n\n      equal: (other) ->\n        @x == other.x && @y == other.y\n\n>     #! example\n>     point = Point(2, 3)\n>\n>     point.equal(Point(2, 3))\n\n----\n\nComputed the length of this point as though it were a vector from (0,0) to (x,y).\n\n      length: ->\n        Math.sqrt(@dot(this))\n\n>     #! example\n>     Point(5, 7).length()\n\n----\n\nCalculate the magnitude of this Point (Vector).\n\n      magnitude: ->\n        @length()\n\n>     #! example\n>     Point(5, 7).magnitude()\n\n----\n\nReturns the direction in radians of this point from the origin.\n\n      direction: ->\n        Math.atan2(@y, @x)\n\n>     #! example\n>     point = Point(0, 1)\n>\n>     point.direction()\n\n----\n\nCalculate the dot product of this point and another point (Vector).\n\n      dot: (other) ->\n        @x * other.x + @y * other.y\n\n\n`cross` calculates the cross product of this point and another point (Vector).\nUsually cross products are thought of as only applying to three dimensional vectors,\nbut z can be treated as zero. The result of this method is interpreted as the magnitude\nof the vector result of the cross product between [x1, y1, 0] x [x2, y2, 0]\nperpendicular to the xy plane.\n\n      cross: (other) ->\n        @x * other.y - other.x * @y\n\n\n`distance` computes the Euclidean distance between this point and another point.\n\n      distance: (other) ->\n        Point.distance(this, other)\n\n>     #! example\n>     pointA = Point(2, 3)\n>     pointB = Point(9, 2)\n>\n>     pointA.distance(pointB)\n\n----\n\n`toFixed` returns a string representation of this point with fixed decimal places.\n\n      toFixed: (n) ->\n        \"Point(#{@x.toFixed(n)}, #{@y.toFixed(n)})\"\n\n`toString` returns a string representation of this point. The representation is\nsuch that if `eval`d it will return a `Point`\n\n      toString: ->\n        \"Point(#{@x}, #{@y})\"\n\n`distance` Compute the Euclidean distance between two points.\n\n    Point.distance = (p1, p2) ->\n      Math.sqrt(Point.distanceSquared(p1, p2))\n\n>     #! example\n>     pointA = Point(2, 3)\n>     pointB = Point(9, 2)\n>\n>     Point.distance(pointA, pointB)\n\n----\n\n`distanceSquared` The square of the Euclidean distance between two points.\n\n    Point.distanceSquared = (p1, p2) ->\n      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)\n\n>     #! example\n>     pointA = Point(2, 3)\n>     pointB = Point(9, 2)\n>\n>     Point.distanceSquared(pointA, pointB)\n\n----\n\n`interpolate` returns a point along the path from p1 to p2\n\n    Point.interpolate = (p1, p2, t) ->\n      p2.subtract(p1).scale(t).add(p1)\n\nConstruct a point on the unit circle for the given angle.\n\n    Point.fromAngle = (angle) ->\n      Point(Math.cos(angle), Math.sin(angle))\n\n>     #! example\n>     Point.fromAngle(Math.PI / 2)\n\n----\n\nIf you have two dudes, one standing at point p1, and the other\nstanding at point p2, then this method will return the direction\nthat the dude standing at p1 will need to face to look at p2.\n\n>     #! example\n>     p1 = Point(0, 0)\n>     p2 = Point(7, 3)\n>\n>     Point.direction(p1, p2)\n\n    Point.direction = (p1, p2) ->\n      Math.atan2(\n        p2.y - p1.y,\n        p2.x - p1.x\n      )\n\nThe centroid of a set of points is their arithmetic mean.\n\n    Point.centroid = (points...) ->\n      points.reduce((sumPoint, point) ->\n        sumPoint.add(point)\n      , Point(0, 0))\n      .scale(1/points.length)\n\nGenerate a random point on the unit circle.\n\n    Point.random = ->\n      Point.fromAngle(Math.random() * 2 * Math.PI)\n\nExport\n\n    module.exports = Point\n\nHelpers\n-------\n\n    isObject = (object) ->\n      Object.prototype.toString.call(object) is \"[object Object]\"\n\nLive Examples\n-------------\n\n>     #! setup\n>     require(\"/interactive_runtime\")\n",
                  "type": "blob"
                },
                "test/test.coffee": {
                  "path": "test/test.coffee",
                  "mode": "100644",
                  "content": "Point = require \"../point\"\n\nok = assert\nequals = assert.equal\n\nTAU = 2 * Math.PI\n\ndescribe \"Point\", ->\n\n  TOLERANCE = 0.00001\n\n  equalEnough = (expected, actual, tolerance, message) ->\n    message ||= \"\" + expected + \" within \" + tolerance + \" of \" + actual\n    ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n\n  it \"copy constructor\", ->\n    p = Point(3, 7)\n\n    p2 = Point(p)\n\n    equals p2.x, p.x\n    equals p2.y, p.y\n\n  it \"#add\", ->\n    p1 = Point(5, 6)\n    p2 = Point(7, 5)\n\n    result = p1.add(p2)\n\n    equals result.x, p1.x + p2.x\n    equals result.y, p1.y + p2.y\n\n    equals p1.x, 5\n    equals p1.y, 6\n    equals p2.x, 7\n    equals p2.y, 5\n\n  it \"#add with two arguments\", ->\n    point = Point(3, 7)\n    x = 2\n    y = 1\n\n    result = point.add(x, y)\n\n    equals result.x, point.x + x\n    equals result.y, point.y + y\n\n    x = 2\n    y = 0\n\n    result = point.add(x, y)\n\n    equals result.x, point.x + x\n    equals result.y, point.y + y\n\n  it \"#add existing\", ->\n    p = Point(0, 0)\n\n    p.add(Point(3, 5))\n\n    equals p.x, 0\n    equals p.y, 0\n\n  it \"#subtract\", ->\n    p1 = Point(5, 6)\n    p2 = Point(7, 5)\n\n    result = p1.subtract(p2)\n\n    equals result.x, p1.x - p2.x\n    equals result.y, p1.y - p2.y\n\n  it \"#subtract existing\", ->\n    p = Point(8, 6)\n\n    p.subtract(3, 4)\n\n    equals p.x, 8\n    equals p.y, 6\n\n  it \"#norm\", ->\n    p = Point(2, 0)\n\n    normal = p.norm()\n    equals normal.x, 1\n\n    normal = p.norm(5)\n    equals normal.x, 5\n\n    p = Point(0, 0)\n\n    normal = p.norm()\n    equals normal.x, 0, \"x value of norm of point(0,0) is 0\"\n    equals normal.y, 0, \"y value of norm of point(0,0) is 0\"\n\n  it \"#norm existing\", ->\n    p = Point(6, 8)\n\n    p.norm(5)\n\n    equals p.x, 6\n    equals p.y, 8\n\n  it \"#scale\", ->\n    p = Point(5, 6)\n    scalar = 2\n\n    result = p.scale(scalar)\n\n    equals result.x, p.x * scalar\n    equals result.y, p.y * scalar\n\n    equals p.x, 5\n    equals p.y, 6\n\n  it \"#scale existing\", ->\n    p = Point(0, 1)\n    scalar = 3\n\n    p.scale(scalar)\n\n    equals p.x, 0\n    equals p.y, 1\n\n  it \"#equal\", ->\n    ok Point(7, 8).equal(Point(7, 8))\n\n  it \"#magnitude\", ->\n    equals Point(3, 4).magnitude(), 5\n\n  it \"#length\", ->\n    equals Point(0, 0).length(), 0\n    equals Point(-1, 0).length(), 1\n\n  it \"#toString\", ->\n    p = Point(7, 5)\n    ok eval(p.toString()).equal(p)\n\n  it \"#clamp\", ->\n    p = Point(10, 10)\n    p2 = p.clamp(5)\n\n    equals p2.length(), 5\n\n  it \".centroid\", ->\n    centroid = Point.centroid(\n      Point(0, 0),\n      Point(10, 10),\n      Point(10, 0),\n      Point(0, 10)\n    )\n\n    equals centroid.x, 5\n    equals centroid.y, 5\n\n  it \".fromAngle\", ->\n    p = Point.fromAngle(TAU / 4)\n\n    equalEnough p.x, 0, TOLERANCE\n    equals p.y, 1\n\n  it \".random\", ->\n    p = Point.random()\n\n    ok p\n\n  it \".interpolate\", ->\n    p1 = Point(10, 7)\n    p2 = Point(-6, 29)\n\n    ok p1.equal(Point.interpolate(p1, p2, 0))\n    ok p2.equal(Point.interpolate(p1, p2, 1))\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "interactive_runtime": {
                  "path": "interactive_runtime",
                  "content": "(function() {\n  window.Point = require(\"./point\");\n\n  Interactive.register(\"example\", function(_arg) {\n    var outputElement, program, result, runtimeElement, source;\n    source = _arg.source, runtimeElement = _arg.runtimeElement;\n    program = CoffeeScript.compile(source, {\n      bare: true\n    });\n    outputElement = document.createElement(\"pre\");\n    runtimeElement.empty().append(outputElement);\n    result = eval(program);\n    if (typeof result === \"number\") {\n      if (result !== (0 | result)) {\n        result = result.toFixed(4);\n      }\n    }\n    return outputElement.textContent = result;\n  });\n\n}).call(this);\n\n//# sourceURL=interactive_runtime.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"point\"};",
                  "type": "blob"
                },
                "point": {
                  "path": "point",
                  "content": "(function() {\n  var Point, isObject,\n    __slice = [].slice;\n\n  Point = function(x, y) {\n    var _ref;\n    if (isObject(x)) {\n      _ref = x, x = _ref.x, y = _ref.y;\n    }\n    return {\n      __proto__: Point.prototype,\n      x: x != null ? x : 0,\n      y: y != null ? y : 0\n    };\n  };\n\n  Point.prototype = {\n    clamp: function(n) {\n      if (this.magnitude() > n) {\n        return this.norm(n);\n      } else {\n        return this.copy();\n      }\n    },\n    copy: function() {\n      return Point(this.x, this.y);\n    },\n    add: function(first, second) {\n      if (second != null) {\n        return Point(this.x + first, this.y + second);\n      } else {\n        return Point(this.x + first.x, this.y + first.y);\n      }\n    },\n    subtract: function(first, second) {\n      if (second != null) {\n        return Point(this.x - first, this.y - second);\n      } else {\n        return this.add(first.scale(-1));\n      }\n    },\n    scale: function(scalar) {\n      return Point(this.x * scalar, this.y * scalar);\n    },\n    norm: function(length) {\n      var m;\n      if (length == null) {\n        length = 1.0;\n      }\n      if (m = this.length()) {\n        return this.scale(length / m);\n      } else {\n        return this.copy();\n      }\n    },\n    equal: function(other) {\n      return this.x === other.x && this.y === other.y;\n    },\n    length: function() {\n      return Math.sqrt(this.dot(this));\n    },\n    magnitude: function() {\n      return this.length();\n    },\n    direction: function() {\n      return Math.atan2(this.y, this.x);\n    },\n    dot: function(other) {\n      return this.x * other.x + this.y * other.y;\n    },\n    cross: function(other) {\n      return this.x * other.y - other.x * this.y;\n    },\n    distance: function(other) {\n      return Point.distance(this, other);\n    },\n    toFixed: function(n) {\n      return \"Point(\" + (this.x.toFixed(n)) + \", \" + (this.y.toFixed(n)) + \")\";\n    },\n    toString: function() {\n      return \"Point(\" + this.x + \", \" + this.y + \")\";\n    }\n  };\n\n  Point.distance = function(p1, p2) {\n    return Math.sqrt(Point.distanceSquared(p1, p2));\n  };\n\n  Point.distanceSquared = function(p1, p2) {\n    return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);\n  };\n\n  Point.interpolate = function(p1, p2, t) {\n    return p2.subtract(p1).scale(t).add(p1);\n  };\n\n  Point.fromAngle = function(angle) {\n    return Point(Math.cos(angle), Math.sin(angle));\n  };\n\n  Point.direction = function(p1, p2) {\n    return Math.atan2(p2.y - p1.y, p2.x - p1.x);\n  };\n\n  Point.centroid = function() {\n    var points;\n    points = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    return points.reduce(function(sumPoint, point) {\n      return sumPoint.add(point);\n    }, Point(0, 0)).scale(1 / points.length);\n  };\n\n  Point.random = function() {\n    return Point.fromAngle(Math.random() * 2 * Math.PI);\n  };\n\n  module.exports = Point;\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n}).call(this);\n\n//# sourceURL=point.coffee",
                  "type": "blob"
                },
                "test/test": {
                  "path": "test/test",
                  "content": "(function() {\n  var Point, TAU, equals, ok;\n\n  Point = require(\"../point\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  TAU = 2 * Math.PI;\n\n  describe(\"Point\", function() {\n    var TOLERANCE, equalEnough;\n    TOLERANCE = 0.00001;\n    equalEnough = function(expected, actual, tolerance, message) {\n      message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n      return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n    };\n    it(\"copy constructor\", function() {\n      var p, p2;\n      p = Point(3, 7);\n      p2 = Point(p);\n      equals(p2.x, p.x);\n      return equals(p2.y, p.y);\n    });\n    it(\"#add\", function() {\n      var p1, p2, result;\n      p1 = Point(5, 6);\n      p2 = Point(7, 5);\n      result = p1.add(p2);\n      equals(result.x, p1.x + p2.x);\n      equals(result.y, p1.y + p2.y);\n      equals(p1.x, 5);\n      equals(p1.y, 6);\n      equals(p2.x, 7);\n      return equals(p2.y, 5);\n    });\n    it(\"#add with two arguments\", function() {\n      var point, result, x, y;\n      point = Point(3, 7);\n      x = 2;\n      y = 1;\n      result = point.add(x, y);\n      equals(result.x, point.x + x);\n      equals(result.y, point.y + y);\n      x = 2;\n      y = 0;\n      result = point.add(x, y);\n      equals(result.x, point.x + x);\n      return equals(result.y, point.y + y);\n    });\n    it(\"#add existing\", function() {\n      var p;\n      p = Point(0, 0);\n      p.add(Point(3, 5));\n      equals(p.x, 0);\n      return equals(p.y, 0);\n    });\n    it(\"#subtract\", function() {\n      var p1, p2, result;\n      p1 = Point(5, 6);\n      p2 = Point(7, 5);\n      result = p1.subtract(p2);\n      equals(result.x, p1.x - p2.x);\n      return equals(result.y, p1.y - p2.y);\n    });\n    it(\"#subtract existing\", function() {\n      var p;\n      p = Point(8, 6);\n      p.subtract(3, 4);\n      equals(p.x, 8);\n      return equals(p.y, 6);\n    });\n    it(\"#norm\", function() {\n      var normal, p;\n      p = Point(2, 0);\n      normal = p.norm();\n      equals(normal.x, 1);\n      normal = p.norm(5);\n      equals(normal.x, 5);\n      p = Point(0, 0);\n      normal = p.norm();\n      equals(normal.x, 0, \"x value of norm of point(0,0) is 0\");\n      return equals(normal.y, 0, \"y value of norm of point(0,0) is 0\");\n    });\n    it(\"#norm existing\", function() {\n      var p;\n      p = Point(6, 8);\n      p.norm(5);\n      equals(p.x, 6);\n      return equals(p.y, 8);\n    });\n    it(\"#scale\", function() {\n      var p, result, scalar;\n      p = Point(5, 6);\n      scalar = 2;\n      result = p.scale(scalar);\n      equals(result.x, p.x * scalar);\n      equals(result.y, p.y * scalar);\n      equals(p.x, 5);\n      return equals(p.y, 6);\n    });\n    it(\"#scale existing\", function() {\n      var p, scalar;\n      p = Point(0, 1);\n      scalar = 3;\n      p.scale(scalar);\n      equals(p.x, 0);\n      return equals(p.y, 1);\n    });\n    it(\"#equal\", function() {\n      return ok(Point(7, 8).equal(Point(7, 8)));\n    });\n    it(\"#magnitude\", function() {\n      return equals(Point(3, 4).magnitude(), 5);\n    });\n    it(\"#length\", function() {\n      equals(Point(0, 0).length(), 0);\n      return equals(Point(-1, 0).length(), 1);\n    });\n    it(\"#toString\", function() {\n      var p;\n      p = Point(7, 5);\n      return ok(eval(p.toString()).equal(p));\n    });\n    it(\"#clamp\", function() {\n      var p, p2;\n      p = Point(10, 10);\n      p2 = p.clamp(5);\n      return equals(p2.length(), 5);\n    });\n    it(\".centroid\", function() {\n      var centroid;\n      centroid = Point.centroid(Point(0, 0), Point(10, 10), Point(10, 0), Point(0, 10));\n      equals(centroid.x, 5);\n      return equals(centroid.y, 5);\n    });\n    it(\".fromAngle\", function() {\n      var p;\n      p = Point.fromAngle(TAU / 4);\n      equalEnough(p.x, 0, TOLERANCE);\n      return equals(p.y, 1);\n    });\n    it(\".random\", function() {\n      var p;\n      p = Point.random();\n      return ok(p);\n    });\n    return it(\".interpolate\", function() {\n      var p1, p2;\n      p1 = Point(10, 7);\n      p2 = Point(-6, 29);\n      ok(p1.equal(Point.interpolate(p1, p2, 0)));\n      return ok(p2.equal(Point.interpolate(p1, p2, 1)));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.2.0",
              "entryPoint": "point",
              "repository": {
                "id": 13484982,
                "name": "point",
                "full_name": "distri/point",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/point",
                "description": "JavaScript Point implementation",
                "fork": false,
                "url": "https://api.github.com/repos/distri/point",
                "forks_url": "https://api.github.com/repos/distri/point/forks",
                "keys_url": "https://api.github.com/repos/distri/point/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/point/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/point/teams",
                "hooks_url": "https://api.github.com/repos/distri/point/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/point/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/point/events",
                "assignees_url": "https://api.github.com/repos/distri/point/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/point/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/point/tags",
                "blobs_url": "https://api.github.com/repos/distri/point/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/point/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/point/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/point/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/point/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/point/languages",
                "stargazers_url": "https://api.github.com/repos/distri/point/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/point/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/point/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/point/subscription",
                "commits_url": "https://api.github.com/repos/distri/point/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/point/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/point/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/point/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/point/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/point/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/point/merges",
                "archive_url": "https://api.github.com/repos/distri/point/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/point/downloads",
                "issues_url": "https://api.github.com/repos/distri/point/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/point/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/point/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/point/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/point/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/point/releases{/id}",
                "created_at": "2013-10-10T22:59:27Z",
                "updated_at": "2013-12-23T23:33:20Z",
                "pushed_at": "2013-10-15T00:22:04Z",
                "git_url": "git://github.com/distri/point.git",
                "ssh_url": "git@github.com:distri/point.git",
                "clone_url": "https://github.com/distri/point.git",
                "svn_url": "https://github.com/distri/point",
                "homepage": null,
                "size": 836,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.2.0",
                "defaultBranch": "master"
              },
              "dependencies": {}
            },
            "matrix": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "matrix\n======\n\nWhere matrices become heroes, together.\n",
                  "type": "blob"
                },
                "matrix.coffee.md": {
                  "path": "matrix.coffee.md",
                  "mode": "100644",
                  "content": "Matrix\n======\n\n```\n   _        _\n  | a  c tx  |\n  | b  d ty  |\n  |_0  0  1 _|\n```\n\nCreates a matrix for 2d affine transformations.\n\n`concat`, `inverse`, `rotate`, `scale` and `translate` return new matrices with\nthe transformations applied. The matrix is not modified in place.\n\nReturns the identity matrix when called with no arguments.\n\n    Matrix = (a, b, c, d, tx, ty) ->\n      if isObject(a)\n        {a, b, c, d, tx, ty} = a\n\n      __proto__: Matrix.prototype\n      a: a ? 1\n      b: b ? 0\n      c: c ? 0\n      d: d ? 1\n      tx: tx ? 0\n      ty: ty ? 0\n\nA `Point` constructor for the methods that return points. This can be overridden\nwith a compatible constructor if you want fancier points.\n\n    Matrix.Point = require \"./point\"\n\n    Matrix.prototype =\n\n`concat` returns the result of this matrix multiplied by another matrix\ncombining the geometric effects of the two. In mathematical terms,\nconcatenating two matrixes is the same as combining them using matrix multiplication.\nIf this matrix is A and the matrix passed in is B, the resulting matrix is A x B\nhttp://mathworld.wolfram.com/MatrixMultiplication.html\n\n      concat: (matrix) ->\n        Matrix(\n          @a * matrix.a + @c * matrix.b,\n          @b * matrix.a + @d * matrix.b,\n          @a * matrix.c + @c * matrix.d,\n          @b * matrix.c + @d * matrix.d,\n          @a * matrix.tx + @c * matrix.ty + @tx,\n          @b * matrix.tx + @d * matrix.ty + @ty\n        )\n\n\nReturn a new matrix that is a `copy` of this matrix.\n\n      copy: ->\n        Matrix(@a, @b, @c, @d, @tx, @ty)\n\nGiven a point in the pretransform coordinate space, returns the coordinates of\nthat point after the transformation occurs. Unlike the standard transformation\napplied using the transformPoint() method, the deltaTransformPoint() method\ndoes not consider the translation parameters tx and ty.\n\nReturns a new `Point` transformed by this matrix ignoring tx and ty.\n\n      deltaTransformPoint: (point) ->\n        Matrix.Point(\n          @a * point.x + @c * point.y,\n          @b * point.x + @d * point.y\n        )\n\nReturns a new matrix that is the inverse of this matrix.\nhttp://mathworld.wolfram.com/MatrixInverse.html\n\n      inverse: ->\n        determinant = @a * @d - @b * @c\n\n        Matrix(\n          @d / determinant,\n          -@b / determinant,\n          -@c / determinant,\n          @a / determinant,\n          (@c * @ty - @d * @tx) / determinant,\n          (@b * @tx - @a * @ty) / determinant\n        )\n\nReturns a new matrix that corresponds this matrix multiplied by a\na rotation matrix.\n\nThe first parameter `theta` is the amount to rotate in radians.\n\nThe second optional parameter, `aboutPoint` is the point about which the\nrotation occurs. Defaults to (0,0).\n\n      rotate: (theta, aboutPoint) ->\n        @concat(Matrix.rotation(theta, aboutPoint))\n\nReturns a new matrix that corresponds this matrix multiplied by a\na scaling matrix.\n\n      scale: (sx, sy, aboutPoint) ->\n        @concat(Matrix.scale(sx, sy, aboutPoint))\n\nReturns a new matrix that corresponds this matrix multiplied by a\na skewing matrix.\n\n      skew: (skewX, skewY) ->\n        @concat(Matrix.skew(skewX, skewY))\n\nReturns a string representation of this matrix.\n\n      toString: ->\n        \"Matrix(#{@a}, #{@b}, #{@c}, #{@d}, #{@tx}, #{@ty})\"\n\nReturns the result of applying the geometric transformation represented by the\nMatrix object to the specified point.\n\n      transformPoint: (point) ->\n        Matrix.Point(\n          @a * point.x + @c * point.y + @tx,\n          @b * point.x + @d * point.y + @ty\n        )\n\nTranslates the matrix along the x and y axes, as specified by the tx and ty parameters.\n\n      translate: (tx, ty) ->\n        @concat(Matrix.translation(tx, ty))\n\nCreates a matrix transformation that corresponds to the given rotation,\naround (0,0) or the specified point.\n\n    Matrix.rotate = Matrix.rotation = (theta, aboutPoint) ->\n      rotationMatrix = Matrix(\n        Math.cos(theta),\n        Math.sin(theta),\n        -Math.sin(theta),\n        Math.cos(theta)\n      )\n\n      if aboutPoint?\n        rotationMatrix =\n          Matrix.translation(aboutPoint.x, aboutPoint.y).concat(\n            rotationMatrix\n          ).concat(\n            Matrix.translation(-aboutPoint.x, -aboutPoint.y)\n          )\n\n      return rotationMatrix\n\nReturns a matrix that corresponds to scaling by factors of sx, sy along\nthe x and y axis respectively.\n\nIf only one parameter is given the matrix is scaled uniformly along both axis.\n\nIf the optional aboutPoint parameter is given the scaling takes place\nabout the given point.\n\n    Matrix.scale = (sx, sy, aboutPoint) ->\n      sy = sy || sx\n\n      scaleMatrix = Matrix(sx, 0, 0, sy)\n\n      if aboutPoint\n        scaleMatrix =\n          Matrix.translation(aboutPoint.x, aboutPoint.y).concat(\n            scaleMatrix\n          ).concat(\n            Matrix.translation(-aboutPoint.x, -aboutPoint.y)\n          )\n\n      return scaleMatrix\n\n\nReturns a matrix that corresponds to a skew of skewX, skewY.\n\n    Matrix.skew = (skewX, skewY) ->\n      Matrix(0, Math.tan(skewY), Math.tan(skewX), 0)\n\nReturns a matrix that corresponds to a translation of tx, ty.\n\n    Matrix.translate = Matrix.translation = (tx, ty) ->\n      Matrix(1, 0, 0, 1, tx, ty)\n\nHelpers\n-------\n\n    isObject = (object) ->\n      Object.prototype.toString.call(object) is \"[object Object]\"\n\n    frozen = (object) ->\n      Object.freeze?(object)\n\n      return object\n\nConstants\n---------\n\nA constant representing the identity matrix.\n\n    Matrix.IDENTITY = frozen Matrix()\n\nA constant representing the horizontal flip transformation matrix.\n\n    Matrix.HORIZONTAL_FLIP = frozen Matrix(-1, 0, 0, 1)\n\nA constant representing the vertical flip transformation matrix.\n\n    Matrix.VERTICAL_FLIP = frozen Matrix(1, 0, 0, -1)\n\nExports\n-------\n\n    module.exports = Matrix\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "version: \"0.3.1\"\nentryPoint: \"matrix\"\n",
                  "type": "blob"
                },
                "test/matrix.coffee": {
                  "path": "test/matrix.coffee",
                  "mode": "100644",
                  "content": "Matrix = require \"../matrix\"\nPoint = require \"../point\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Matrix\", ->\n\n  TOLERANCE = 0.00001\n  \n  equalEnough = (expected, actual, tolerance, message) ->\n    message ||= \"\" + expected + \" within \" + tolerance + \" of \" + actual\n    ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n  \n  matrixEqual = (m1, m2) ->\n    equalEnough(m1.a, m2.a, TOLERANCE)\n    equalEnough(m1.b, m2.b, TOLERANCE)\n    equalEnough(m1.c, m2.c, TOLERANCE)\n    equalEnough(m1.d, m2.d, TOLERANCE)\n    equalEnough(m1.tx, m2.tx, TOLERANCE)\n    equalEnough(m1.ty, m2.ty, TOLERANCE)\n  \n  test \"copy constructor\", ->\n   matrix = Matrix(1, 0, 0, 1, 10, 12)\n  \n   matrix2 = Matrix(matrix)\n  \n   ok matrix != matrix2\n   matrixEqual(matrix2, matrix)\n  \n  test \"Matrix() (Identity)\", ->\n    matrix = Matrix()\n  \n    equals(matrix.a, 1, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 1, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n    matrixEqual(matrix, Matrix.IDENTITY)\n  \n  test \"Empty\", ->\n    matrix = Matrix(0, 0, 0, 0, 0, 0)\n  \n    equals(matrix.a, 0, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 0, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n  test \"#copy\", ->\n    matrix = Matrix(2, 0, 0, 2)\n  \n    copyMatrix = matrix.copy()\n  \n    matrixEqual copyMatrix, matrix\n  \n    copyMatrix.a = 4\n  \n    equals copyMatrix.a, 4\n    equals matrix.a, 2, \"Old 'a' value is unchanged\"\n  \n  test \".scale\", ->\n    matrix = Matrix.scale(2, 2)\n  \n    equals(matrix.a, 2, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 2, \"d\")\n  \n    matrix = Matrix.scale(3)\n  \n    equals(matrix.a, 3, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 3, \"d\")\n  \n  test \".scale (about a point)\", ->\n    p = Point(5, 17)\n  \n    transformedPoint = Matrix.scale(3, 7, p).transformPoint(p)\n  \n    equals(transformedPoint.x, p.x, \"Point should remain the same\")\n    equals(transformedPoint.y, p.y, \"Point should remain the same\")\n  \n  test \"#scale (about a point)\", ->\n    p = Point(3, 11)\n  \n    transformedPoint = Matrix.IDENTITY.scale(3, 7, p).transformPoint(p)\n  \n    equals(transformedPoint.x, p.x, \"Point should remain the same\")\n    equals(transformedPoint.y, p.y, \"Point should remain the same\")\n  \n  test \"#skew\", ->\n    matrix = Matrix()\n\n    angle = 0.25 * Math.PI\n  \n    matrix = matrix.skew(angle, 0)\n  \n    equals matrix.c, Math.tan(angle)\n  \n  test \".rotation\", ->\n    matrix = Matrix.rotation(Math.PI / 2)\n  \n    equalEnough(matrix.a, 0, TOLERANCE)\n    equalEnough(matrix.b, 1, TOLERANCE)\n    equalEnough(matrix.c,-1, TOLERANCE)\n    equalEnough(matrix.d, 0, TOLERANCE)\n  \n  test \".rotation (about a point)\", ->\n    p = Point(11, 7)\n  \n    transformedPoint = Matrix.rotation(Math.PI / 2, p).transformPoint(p)\n  \n    equals transformedPoint.x, p.x, \"Point should remain the same\"\n    equals transformedPoint.y, p.y, \"Point should remain the same\"\n  \n  test \"#rotate (about a point)\", ->\n    p = Point(8, 5);\n  \n    transformedPoint = Matrix.IDENTITY.rotate(Math.PI / 2, p).transformPoint(p)\n  \n    equals transformedPoint.x, p.x, \"Point should remain the same\"\n    equals transformedPoint.y, p.y, \"Point should remain the same\"\n  \n  test \"#inverse (Identity)\", ->\n    matrix = Matrix().inverse()\n  \n    equals(matrix.a, 1, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 1, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n  test \"#concat\", ->\n    matrix = Matrix.rotation(Math.PI / 2).concat(Matrix.rotation(-Math.PI / 2))\n  \n    matrixEqual(matrix, Matrix.IDENTITY)\n  \n  test \"#toString\", ->\n    matrix = Matrix(0.5, 2, 0.5, -2, 3, 4.5)\n    matrixEqual eval(matrix.toString()), matrix\n  \n  test \"Maths\", ->\n    a = Matrix(12, 3, 3, 1, 7, 9)\n    b = Matrix(3, 8, 3, 2, 1, 5)\n  \n    c = a.concat(b)\n  \n    equals(c.a, 60)\n    equals(c.b, 17)\n    equals(c.c, 42)\n    equals(c.d, 11)\n    equals(c.tx, 34)\n    equals(c.ty, 17)\n  \n  test \"Order of transformations should match manual concat\", ->\n    tx = 10\n    ty = 5\n    theta = Math.PI/3\n    s = 2\n  \n    m1 = Matrix().translate(tx, ty).scale(s).rotate(theta)\n    m2 = Matrix().concat(Matrix.translation(tx, ty)).concat(Matrix.scale(s)).concat(Matrix.rotation(theta))\n  \n    matrixEqual(m1, m2)\n  \n  test \"IDENTITY is immutable\", ->\n    identity = Matrix.IDENTITY\n  \n    identity.a = 5\n  \n    equals identity.a, 1\n",
                  "type": "blob"
                },
                "point.coffee.md": {
                  "path": "point.coffee.md",
                  "mode": "100644",
                  "content": "Point\n=====\n\nA very simple Point object constructor.\n\n    module.exports = (x, y) ->\n      x: x\n      y: y\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "matrix": {
                  "path": "matrix",
                  "content": "(function() {\n  var Matrix, frozen, isObject;\n\n  Matrix = function(a, b, c, d, tx, ty) {\n    var _ref;\n    if (isObject(a)) {\n      _ref = a, a = _ref.a, b = _ref.b, c = _ref.c, d = _ref.d, tx = _ref.tx, ty = _ref.ty;\n    }\n    return {\n      __proto__: Matrix.prototype,\n      a: a != null ? a : 1,\n      b: b != null ? b : 0,\n      c: c != null ? c : 0,\n      d: d != null ? d : 1,\n      tx: tx != null ? tx : 0,\n      ty: ty != null ? ty : 0\n    };\n  };\n\n  Matrix.Point = require(\"./point\");\n\n  Matrix.prototype = {\n    concat: function(matrix) {\n      return Matrix(this.a * matrix.a + this.c * matrix.b, this.b * matrix.a + this.d * matrix.b, this.a * matrix.c + this.c * matrix.d, this.b * matrix.c + this.d * matrix.d, this.a * matrix.tx + this.c * matrix.ty + this.tx, this.b * matrix.tx + this.d * matrix.ty + this.ty);\n    },\n    copy: function() {\n      return Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);\n    },\n    deltaTransformPoint: function(point) {\n      return Matrix.Point(this.a * point.x + this.c * point.y, this.b * point.x + this.d * point.y);\n    },\n    inverse: function() {\n      var determinant;\n      determinant = this.a * this.d - this.b * this.c;\n      return Matrix(this.d / determinant, -this.b / determinant, -this.c / determinant, this.a / determinant, (this.c * this.ty - this.d * this.tx) / determinant, (this.b * this.tx - this.a * this.ty) / determinant);\n    },\n    rotate: function(theta, aboutPoint) {\n      return this.concat(Matrix.rotation(theta, aboutPoint));\n    },\n    scale: function(sx, sy, aboutPoint) {\n      return this.concat(Matrix.scale(sx, sy, aboutPoint));\n    },\n    skew: function(skewX, skewY) {\n      return this.concat(Matrix.skew(skewX, skewY));\n    },\n    toString: function() {\n      return \"Matrix(\" + this.a + \", \" + this.b + \", \" + this.c + \", \" + this.d + \", \" + this.tx + \", \" + this.ty + \")\";\n    },\n    transformPoint: function(point) {\n      return Matrix.Point(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);\n    },\n    translate: function(tx, ty) {\n      return this.concat(Matrix.translation(tx, ty));\n    }\n  };\n\n  Matrix.rotate = Matrix.rotation = function(theta, aboutPoint) {\n    var rotationMatrix;\n    rotationMatrix = Matrix(Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta));\n    if (aboutPoint != null) {\n      rotationMatrix = Matrix.translation(aboutPoint.x, aboutPoint.y).concat(rotationMatrix).concat(Matrix.translation(-aboutPoint.x, -aboutPoint.y));\n    }\n    return rotationMatrix;\n  };\n\n  Matrix.scale = function(sx, sy, aboutPoint) {\n    var scaleMatrix;\n    sy = sy || sx;\n    scaleMatrix = Matrix(sx, 0, 0, sy);\n    if (aboutPoint) {\n      scaleMatrix = Matrix.translation(aboutPoint.x, aboutPoint.y).concat(scaleMatrix).concat(Matrix.translation(-aboutPoint.x, -aboutPoint.y));\n    }\n    return scaleMatrix;\n  };\n\n  Matrix.skew = function(skewX, skewY) {\n    return Matrix(0, Math.tan(skewY), Math.tan(skewX), 0);\n  };\n\n  Matrix.translate = Matrix.translation = function(tx, ty) {\n    return Matrix(1, 0, 0, 1, tx, ty);\n  };\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n  frozen = function(object) {\n    if (typeof Object.freeze === \"function\") {\n      Object.freeze(object);\n    }\n    return object;\n  };\n\n  Matrix.IDENTITY = frozen(Matrix());\n\n  Matrix.HORIZONTAL_FLIP = frozen(Matrix(-1, 0, 0, 1));\n\n  Matrix.VERTICAL_FLIP = frozen(Matrix(1, 0, 0, -1));\n\n  module.exports = Matrix;\n\n}).call(this);\n\n//# sourceURL=matrix.coffee",
                  "type": "blob"
                },
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.3.1\",\"entryPoint\":\"matrix\"};",
                  "type": "blob"
                },
                "test/matrix": {
                  "path": "test/matrix",
                  "content": "(function() {\n  var Matrix, Point, equals, ok, test;\n\n  Matrix = require(\"../matrix\");\n\n  Point = require(\"../point\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Matrix\", function() {\n    var TOLERANCE, equalEnough, matrixEqual;\n    TOLERANCE = 0.00001;\n    equalEnough = function(expected, actual, tolerance, message) {\n      message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n      return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n    };\n    matrixEqual = function(m1, m2) {\n      equalEnough(m1.a, m2.a, TOLERANCE);\n      equalEnough(m1.b, m2.b, TOLERANCE);\n      equalEnough(m1.c, m2.c, TOLERANCE);\n      equalEnough(m1.d, m2.d, TOLERANCE);\n      equalEnough(m1.tx, m2.tx, TOLERANCE);\n      return equalEnough(m1.ty, m2.ty, TOLERANCE);\n    };\n    test(\"copy constructor\", function() {\n      var matrix, matrix2;\n      matrix = Matrix(1, 0, 0, 1, 10, 12);\n      matrix2 = Matrix(matrix);\n      ok(matrix !== matrix2);\n      return matrixEqual(matrix2, matrix);\n    });\n    test(\"Matrix() (Identity)\", function() {\n      var matrix;\n      matrix = Matrix();\n      equals(matrix.a, 1, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 1, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      equals(matrix.ty, 0, \"ty\");\n      return matrixEqual(matrix, Matrix.IDENTITY);\n    });\n    test(\"Empty\", function() {\n      var matrix;\n      matrix = Matrix(0, 0, 0, 0, 0, 0);\n      equals(matrix.a, 0, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 0, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      return equals(matrix.ty, 0, \"ty\");\n    });\n    test(\"#copy\", function() {\n      var copyMatrix, matrix;\n      matrix = Matrix(2, 0, 0, 2);\n      copyMatrix = matrix.copy();\n      matrixEqual(copyMatrix, matrix);\n      copyMatrix.a = 4;\n      equals(copyMatrix.a, 4);\n      return equals(matrix.a, 2, \"Old 'a' value is unchanged\");\n    });\n    test(\".scale\", function() {\n      var matrix;\n      matrix = Matrix.scale(2, 2);\n      equals(matrix.a, 2, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 2, \"d\");\n      matrix = Matrix.scale(3);\n      equals(matrix.a, 3, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      return equals(matrix.d, 3, \"d\");\n    });\n    test(\".scale (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(5, 17);\n      transformedPoint = Matrix.scale(3, 7, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#scale (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(3, 11);\n      transformedPoint = Matrix.IDENTITY.scale(3, 7, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#skew\", function() {\n      var angle, matrix;\n      matrix = Matrix();\n      angle = 0.25 * Math.PI;\n      matrix = matrix.skew(angle, 0);\n      return equals(matrix.c, Math.tan(angle));\n    });\n    test(\".rotation\", function() {\n      var matrix;\n      matrix = Matrix.rotation(Math.PI / 2);\n      equalEnough(matrix.a, 0, TOLERANCE);\n      equalEnough(matrix.b, 1, TOLERANCE);\n      equalEnough(matrix.c, -1, TOLERANCE);\n      return equalEnough(matrix.d, 0, TOLERANCE);\n    });\n    test(\".rotation (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(11, 7);\n      transformedPoint = Matrix.rotation(Math.PI / 2, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#rotate (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(8, 5);\n      transformedPoint = Matrix.IDENTITY.rotate(Math.PI / 2, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#inverse (Identity)\", function() {\n      var matrix;\n      matrix = Matrix().inverse();\n      equals(matrix.a, 1, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 1, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      return equals(matrix.ty, 0, \"ty\");\n    });\n    test(\"#concat\", function() {\n      var matrix;\n      matrix = Matrix.rotation(Math.PI / 2).concat(Matrix.rotation(-Math.PI / 2));\n      return matrixEqual(matrix, Matrix.IDENTITY);\n    });\n    test(\"#toString\", function() {\n      var matrix;\n      matrix = Matrix(0.5, 2, 0.5, -2, 3, 4.5);\n      return matrixEqual(eval(matrix.toString()), matrix);\n    });\n    test(\"Maths\", function() {\n      var a, b, c;\n      a = Matrix(12, 3, 3, 1, 7, 9);\n      b = Matrix(3, 8, 3, 2, 1, 5);\n      c = a.concat(b);\n      equals(c.a, 60);\n      equals(c.b, 17);\n      equals(c.c, 42);\n      equals(c.d, 11);\n      equals(c.tx, 34);\n      return equals(c.ty, 17);\n    });\n    test(\"Order of transformations should match manual concat\", function() {\n      var m1, m2, s, theta, tx, ty;\n      tx = 10;\n      ty = 5;\n      theta = Math.PI / 3;\n      s = 2;\n      m1 = Matrix().translate(tx, ty).scale(s).rotate(theta);\n      m2 = Matrix().concat(Matrix.translation(tx, ty)).concat(Matrix.scale(s)).concat(Matrix.rotation(theta));\n      return matrixEqual(m1, m2);\n    });\n    return test(\"IDENTITY is immutable\", function() {\n      var identity;\n      identity = Matrix.IDENTITY;\n      identity.a = 5;\n      return equals(identity.a, 1);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/matrix.coffee",
                  "type": "blob"
                },
                "point": {
                  "path": "point",
                  "content": "(function() {\n  module.exports = function(x, y) {\n    return {\n      x: x,\n      y: y\n    };\n  };\n\n}).call(this);\n\n//# sourceURL=point.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.3.1",
              "entryPoint": "matrix",
              "repository": {
                "id": 13551996,
                "name": "matrix",
                "full_name": "distri/matrix",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/matrix",
                "description": "Where matrices become heroes, together.",
                "fork": false,
                "url": "https://api.github.com/repos/distri/matrix",
                "forks_url": "https://api.github.com/repos/distri/matrix/forks",
                "keys_url": "https://api.github.com/repos/distri/matrix/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/matrix/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/matrix/teams",
                "hooks_url": "https://api.github.com/repos/distri/matrix/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/matrix/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/matrix/events",
                "assignees_url": "https://api.github.com/repos/distri/matrix/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/matrix/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/matrix/tags",
                "blobs_url": "https://api.github.com/repos/distri/matrix/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/matrix/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/matrix/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/matrix/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/matrix/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/matrix/languages",
                "stargazers_url": "https://api.github.com/repos/distri/matrix/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/matrix/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/matrix/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/matrix/subscription",
                "commits_url": "https://api.github.com/repos/distri/matrix/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/matrix/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/matrix/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/matrix/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/matrix/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/matrix/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/matrix/merges",
                "archive_url": "https://api.github.com/repos/distri/matrix/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/matrix/downloads",
                "issues_url": "https://api.github.com/repos/distri/matrix/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/matrix/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/matrix/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/matrix/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/matrix/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/matrix/releases{/id}",
                "created_at": "2013-10-14T03:46:16Z",
                "updated_at": "2013-12-23T23:45:28Z",
                "pushed_at": "2013-10-15T00:22:51Z",
                "git_url": "git://github.com/distri/matrix.git",
                "ssh_url": "git@github.com:distri/matrix.git",
                "clone_url": "https://github.com/distri/matrix.git",
                "svn_url": "https://github.com/distri/matrix",
                "homepage": null,
                "size": 580,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.3.1",
                "defaultBranch": "master"
              },
              "dependencies": {}
            },
            "random": {
              "source": {
                "LICENSE": {
                  "path": "LICENSE",
                  "mode": "100644",
                  "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
                  "type": "blob"
                },
                "README.md": {
                  "path": "README.md",
                  "mode": "100644",
                  "content": "random\n======\n\nRandom generation.\n",
                  "type": "blob"
                },
                "pixie.cson": {
                  "path": "pixie.cson",
                  "mode": "100644",
                  "content": "version: \"0.2.0\"\nentryPoint: \"random\"\n",
                  "type": "blob"
                },
                "random.coffee.md": {
                  "path": "random.coffee.md",
                  "mode": "100644",
                  "content": "Random\n======\n\nSome useful methods for generating random things.\n\nHelpers\n-------\n\n`τ` is the circle constant.\n\n    τ = 2 * Math.PI\n\n`U` returns a continuous uniform distribution between `min` and `max`.\n\n    U = (min, max) ->\n      ->\n        Math.random() * (max - min) + min\n\n`standardUniformDistribution` is the uniform distribution between [0, 1]\n\n    standardUniformDistribution = U(0, 1)\n\n`rand` is a helpful shortcut for generating random numbers from a standard\nuniform distribution or from a discreet set of integers.\n\n    rand = (n) ->\n      if n\n        Math.floor(n * standardUniformDistribution())\n      else\n        standardUniformDistribution()\n\nMethods\n-------\n\n    module.exports = Random =\n\nReturns a random angle, uniformly distributed, between 0 and τ.\n\n      angle: ->\n        rand() * τ\n\nA binomial distribution.\n\n      binomial: (n=1, p=0.5) ->\n        [0...n].map ->\n          if rand() < p\n            1\n          else\n            0\n        .reduce (a, b) ->\n          a + b\n        , 0\n\nReturns a random float between two numbers.\n\n      between: (min, max) ->\n        rand() * (max - min) + min\n\nReturns random integers from [0, n) if n is given.\nOtherwise returns random float between 0 and 1.\n\n      rand: rand\n\nReturns random float from [-n / 2, n / 2] if n is given.\nOtherwise returns random float between -0.5 and 0.5.\n\n      signed: (n=1) ->\n        (n * rand()) - (n / 2)\n",
                  "type": "blob"
                },
                "test/random.coffee": {
                  "path": "test/random.coffee",
                  "mode": "100644",
                  "content": "Random = require \"../random\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Random\", ->\n  \n  test \"methods\", ->\n    [\n      \"angle\"\n      \"binomial\"\n      \"between\"\n      \"rand\"\n      \"signed\"\n    ].forEach (name) ->\n      ok(Random[name], name)\n\n  it \"should have binomial\", ->\n    result = Random.binomial()\n\n    assert result is 1 or result is 0\n",
                  "type": "blob"
                }
              },
              "distribution": {
                "pixie": {
                  "path": "pixie",
                  "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"random\"};",
                  "type": "blob"
                },
                "random": {
                  "path": "random",
                  "content": "(function() {\n  var Random, U, rand, standardUniformDistribution, τ;\n\n  τ = 2 * Math.PI;\n\n  U = function(min, max) {\n    return function() {\n      return Math.random() * (max - min) + min;\n    };\n  };\n\n  standardUniformDistribution = U(0, 1);\n\n  rand = function(n) {\n    if (n) {\n      return Math.floor(n * standardUniformDistribution());\n    } else {\n      return standardUniformDistribution();\n    }\n  };\n\n  module.exports = Random = {\n    angle: function() {\n      return rand() * τ;\n    },\n    binomial: function(n, p) {\n      var _i, _results;\n      if (n == null) {\n        n = 1;\n      }\n      if (p == null) {\n        p = 0.5;\n      }\n      return (function() {\n        _results = [];\n        for (var _i = 0; 0 <= n ? _i < n : _i > n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function() {\n        if (rand() < p) {\n          return 1;\n        } else {\n          return 0;\n        }\n      }).reduce(function(a, b) {\n        return a + b;\n      }, 0);\n    },\n    between: function(min, max) {\n      return rand() * (max - min) + min;\n    },\n    rand: rand,\n    signed: function(n) {\n      if (n == null) {\n        n = 1;\n      }\n      return (n * rand()) - (n / 2);\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=random.coffee",
                  "type": "blob"
                },
                "test/random": {
                  "path": "test/random",
                  "content": "(function() {\n  var Random, equals, ok, test;\n\n  Random = require(\"../random\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Random\", function() {\n    test(\"methods\", function() {\n      return [\"angle\", \"binomial\", \"between\", \"rand\", \"signed\"].forEach(function(name) {\n        return ok(Random[name], name);\n      });\n    });\n    return it(\"should have binomial\", function() {\n      var result;\n      result = Random.binomial();\n      return assert(result === 1 || result === 0);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/random.coffee",
                  "type": "blob"
                }
              },
              "progenitor": {
                "url": "http://strd6.github.io/editor/"
              },
              "version": "0.2.0",
              "entryPoint": "random",
              "repository": {
                "id": 13576812,
                "name": "random",
                "full_name": "distri/random",
                "owner": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "private": false,
                "html_url": "https://github.com/distri/random",
                "description": "Random generation.",
                "fork": false,
                "url": "https://api.github.com/repos/distri/random",
                "forks_url": "https://api.github.com/repos/distri/random/forks",
                "keys_url": "https://api.github.com/repos/distri/random/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/distri/random/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/distri/random/teams",
                "hooks_url": "https://api.github.com/repos/distri/random/hooks",
                "issue_events_url": "https://api.github.com/repos/distri/random/issues/events{/number}",
                "events_url": "https://api.github.com/repos/distri/random/events",
                "assignees_url": "https://api.github.com/repos/distri/random/assignees{/user}",
                "branches_url": "https://api.github.com/repos/distri/random/branches{/branch}",
                "tags_url": "https://api.github.com/repos/distri/random/tags",
                "blobs_url": "https://api.github.com/repos/distri/random/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/distri/random/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/distri/random/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/distri/random/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/distri/random/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/distri/random/languages",
                "stargazers_url": "https://api.github.com/repos/distri/random/stargazers",
                "contributors_url": "https://api.github.com/repos/distri/random/contributors",
                "subscribers_url": "https://api.github.com/repos/distri/random/subscribers",
                "subscription_url": "https://api.github.com/repos/distri/random/subscription",
                "commits_url": "https://api.github.com/repos/distri/random/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/distri/random/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/distri/random/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/distri/random/issues/comments/{number}",
                "contents_url": "https://api.github.com/repos/distri/random/contents/{+path}",
                "compare_url": "https://api.github.com/repos/distri/random/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/distri/random/merges",
                "archive_url": "https://api.github.com/repos/distri/random/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/distri/random/downloads",
                "issues_url": "https://api.github.com/repos/distri/random/issues{/number}",
                "pulls_url": "https://api.github.com/repos/distri/random/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/distri/random/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/distri/random/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/distri/random/labels{/name}",
                "releases_url": "https://api.github.com/repos/distri/random/releases{/id}",
                "created_at": "2013-10-15T00:28:31Z",
                "updated_at": "2013-12-06T23:31:24Z",
                "pushed_at": "2013-10-15T01:01:00Z",
                "git_url": "git://github.com/distri/random.git",
                "ssh_url": "git@github.com:distri/random.git",
                "clone_url": "https://github.com/distri/random.git",
                "svn_url": "https://github.com/distri/random",
                "homepage": null,
                "size": 292,
                "stargazers_count": 0,
                "watchers_count": 0,
                "language": "CoffeeScript",
                "has_issues": true,
                "has_downloads": true,
                "has_wiki": true,
                "forks_count": 0,
                "mirror_url": null,
                "open_issues_count": 0,
                "forks": 0,
                "open_issues": 0,
                "watchers": 0,
                "default_branch": "master",
                "master_branch": "master",
                "permissions": {
                  "admin": true,
                  "push": true,
                  "pull": true
                },
                "organization": {
                  "login": "distri",
                  "id": 6005125,
                  "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
                  "gravatar_id": null,
                  "url": "https://api.github.com/users/distri",
                  "html_url": "https://github.com/distri",
                  "followers_url": "https://api.github.com/users/distri/followers",
                  "following_url": "https://api.github.com/users/distri/following{/other_user}",
                  "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
                  "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
                  "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
                  "organizations_url": "https://api.github.com/users/distri/orgs",
                  "repos_url": "https://api.github.com/users/distri/repos",
                  "events_url": "https://api.github.com/users/distri/events{/privacy}",
                  "received_events_url": "https://api.github.com/users/distri/received_events",
                  "type": "Organization",
                  "site_admin": false
                },
                "network_count": 0,
                "subscribers_count": 1,
                "branch": "v0.2.0",
                "defaultBranch": "master"
              },
              "dependencies": {}
            }
          }
        },
        "extensions": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "Extensions\n==========\n\nExtend built-in prototypes with helpful methods.\n",
              "type": "blob"
            },
            "array.coffee.md": {
              "path": "array.coffee.md",
              "mode": "100644",
              "content": "Array\n=====\n\n    {extend} = require \"./util\"\n\n    extend Array.prototype,\n\nCalculate the average value of an array. Returns undefined if some elements\nare not numbers.\n\n      average: ->\n        @sum()/@length\n\n>     #! example\n>     [1, 3, 5, 7].average()\n\n----\n\nReturns a copy of the array without null and undefined values.\n\n      compact: ->\n        @select (element) ->\n          element?\n\n>     #! example\n>     [null, undefined, 3, 3, undefined, 5].compact()\n\n----\n\nCreates and returns a copy of the array. The copy contains\nthe same objects.\n\n      copy: ->\n        @concat()\n\n>     #! example\n>     a = [\"a\", \"b\", \"c\"]\n>     b = a.copy()\n>\n>     # their elements are equal\n>     a[0] == b[0] && a[1] == b[1] && a[2] == b[2]\n>     # => true\n>\n>     # but they aren't the same object in memory\n>     a is b\n>     # => false\n\n----\n\nEmpties the array of its contents. It is modified in place.\n\n      clear: ->\n        @length = 0\n\n        return this\n\n>     #! example\n>     fullArray = [1, 2, 3]\n>     fullArray.clear()\n>     fullArray\n\n----\n\nFlatten out an array of arrays into a single array of elements.\n\n      flatten: ->\n        @inject [], (a, b) ->\n          a.concat b\n\n>     #! example\n>     [[1, 2], [3, 4], 5].flatten()\n>     # => [1, 2, 3, 4, 5]\n>\n>     # won't flatten twice nested arrays. call\n>     # flatten twice if that is what you want\n>     [[1, 2], [3, [4, 5]], 6].flatten()\n>     # => [1, 2, 3, [4, 5], 6]\n\n----\n\nInvoke the named method on each element in the array\nand return a new array containing the results of the invocation.\n\n      invoke: (method, args...) ->\n        @map (element) ->\n          element[method].apply(element, args)\n\n>     #! example\n>     [1.1, 2.2, 3.3, 4.4].invoke(\"floor\")\n\n----\n\n>     #! example\n>     ['hello', 'world', 'cool!'].invoke('substring', 0, 3)\n\n----\n\nRandomly select an element from the array.\n\n      rand: ->\n        @[rand(@length)]\n\n>     #! example\n>     [1, 2, 3].rand()\n\n----\n\nRemove the first occurrence of the given object from the array if it is\npresent. The array is modified in place.\n\n      remove: (object) ->\n        index = @indexOf(object)\n\n        if index >= 0\n          @splice(index, 1)[0]\n        else\n          undefined\n\n>     #! example\n>     a = [1, 1, \"a\", \"b\"]\n>     a.remove(1)\n>     a\n\n----\n\nReturns true if the element is present in the array.\n\n      include: (element) ->\n        @indexOf(element) != -1\n\n>     #! example\n>     [\"a\", \"b\", \"c\"].include(\"c\")\n\n----\n\nCall the given iterator once for each element in the array,\npassing in the element as the first argument, the index of\nthe element as the second argument, and this array as the\nthird argument.\n\n      each: (iterator, context) ->\n        if @forEach\n          @forEach iterator, context\n        else\n          for element, i in this\n            iterator.call context, element, i, this\n\n        return this\n\n>     #! example\n>     word = \"\"\n>     indices = []\n>     [\"r\", \"a\", \"d\"].each (letter, index) ->\n>       word += letter\n>       indices.push(index)\n>\n>     # => [\"r\", \"a\", \"d\"]\n>\n>     word\n>     # => \"rad\"\n>\n>     indices\n\n----\n\nCall the given iterator once for each pair of objects in the array.\n\n      eachPair: (iterator, context) ->\n        length = @length\n        i = 0\n        while i < length\n          a = @[i]\n          j = i + 1\n          i += 1\n\n          while j < length\n            b = @[j]\n            j += 1\n\n            iterator.call context, a, b\n\n>     #! example\n>     results = []\n>     [1, 2, 3, 4].eachPair (a, b) ->\n>       results.push [a, b]\n>\n>     results\n\n----\n\nCall the given iterator once for each element in the array,\npassing in the element as the first argument and the given object\nas the second argument. Additional arguments are passed similar to\n`each`.\n\n      eachWithObject: (object, iterator, context) ->\n        @each (element, i, self) ->\n          iterator.call context, element, object, i, self\n\n        return object\n\nCall the given iterator once for each group of elements in the array,\npassing in the elements in groups of n. Additional arguments are\npassed as in `each`.\n\n      eachSlice: (n, iterator, context) ->\n        len = @length / n\n        i = -1\n\n        while ++i < len\n          iterator.call(context, @slice(i*n, (i+1)*n), i*n, this)\n\n        return this\n\n>     #! example\n>     results = []\n>     [1, 2, 3, 4].eachSlice 2, (slice) ->\n>       results.push(slice)\n>\n>     results\n\n----\n\nPipe the input through each function in the array in turn. For example, if you have a\nlist of objects you can perform a series of selection, sorting, and other processing\nmethods and then receive the processed list. This array must contain functions that\naccept a single input and return the processed input. The output of the first function\nis fed to the input of the second and so on until the final processed output is returned.\n\n      pipeline: (input) ->\n        @inject input, (input, fn) ->\n          fn(input)\n\nReturns a new array with the elements all shuffled up.\n\n      shuffle: ->\n        shuffledArray = []\n\n        @each (element) ->\n          shuffledArray.splice(rand(shuffledArray.length + 1), 0, element)\n\n        return shuffledArray\n\n>     #! example\n>     [0..9].shuffle()\n\n----\n\nReturns the first element of the array, undefined if the array is empty.\n\n      first: ->\n        @[0]\n\n>     #! example\n>     [\"first\", \"second\", \"third\"].first()\n\n----\n\nReturns the last element of the array, undefined if the array is empty.\n\n      last: ->\n        @[@length - 1]\n\n>     #! example\n>     [\"first\", \"second\", \"third\"].last()\n\n----\n\nReturns an object containing the extremes of this array.\n\n      extremes: (fn=identity) ->\n        min = max = undefined\n        minResult = maxResult = undefined\n\n        @each (object) ->\n          result = fn(object)\n\n          if min?\n            if result < minResult\n              min = object\n              minResult = result\n          else\n            min = object\n            minResult = result\n\n          if max?\n            if result > maxResult\n              max = object\n              maxResult = result\n          else\n            max = object\n            maxResult = result\n\n        min: min\n        max: max\n\n>     #! example\n>     [-1, 3, 0].extremes()\n\n----\n\n      maxima: (valueFunction=identity) ->\n        @inject([-Infinity, []], (memo, item) ->\n          value = valueFunction(item)\n          [maxValue, maxItems] = memo\n\n          if value > maxValue\n            [value, [item]]\n          else if value is maxValue\n            [value, maxItems.concat(item)]\n          else\n            memo\n        ).last()\n\n      maximum: (valueFunction) ->\n        @maxima(valueFunction).first()\n\n      minima: (valueFunction=identity) ->\n        inverseFn = (x) ->\n          -valueFunction(x)\n\n        @maxima(inverseFn)\n\n      minimum: (valueFunction) ->\n        @minima(valueFunction).first()\n\nPretend the array is a circle and grab a new array containing length elements.\nIf length is not given return the element at start, again assuming the array\nis a circle.\n\n      wrap: (start, length) ->\n        if length?\n          end = start + length\n          i = start\n          result = []\n\n          while i < end\n            result.push(@[mod(i, @length)])\n            i += 1\n\n          return result\n        else\n          return @[mod(start, @length)]\n\n>     #! example\n>     [1, 2, 3].wrap(-1)\n\n----\n\n>     #! example\n>     [1, 2, 3].wrap(6)\n\n----\n\n>     #! example\n>     [\"l\", \"o\", \"o\", \"p\"].wrap(0, 12)\n\n----\n\nPartitions the elements into two groups: those for which the iterator returns\ntrue, and those for which it returns false.\n\n      partition: (iterator, context) ->\n        trueCollection = []\n        falseCollection = []\n\n        @each (element) ->\n          if iterator.call(context, element)\n            trueCollection.push element\n          else\n            falseCollection.push element\n\n        return [trueCollection, falseCollection]\n\n>     #! example\n>     [0..9].partition (n) ->\n>       n % 2 is 0\n\n----\n\nReturn the group of elements for which the return value of the iterator is true.\n\n      select: (iterator, context) ->\n        return @partition(iterator, context)[0]\n\nReturn the group of elements that are not in the passed in set.\n\n      without: (values) ->\n        @reject (element) ->\n          values.include(element)\n\n>     #! example\n>     [1, 2, 3, 4].without [2, 3]\n\n----\n\nReturn the group of elements for which the return value of the iterator is false.\n\n      reject: (iterator, context) ->\n        @partition(iterator, context)[1]\n\nCombines all elements of the array by applying a binary operation.\nfor each element in the arra the iterator is passed an accumulator\nvalue (memo) and the element.\n\n      inject: (initial, iterator) ->\n        @each (element) ->\n          initial = iterator(initial, element)\n\n        return initial\n\nAdd all the elements in the array.\n\n      sum: ->\n        @inject 0, (sum, n) ->\n          sum + n\n\n>     #! example\n>     [1, 2, 3, 4].sum()\n\n----\n\nMultiply all the elements in the array.\n\n      product: ->\n        @inject 1, (product, n) ->\n          product * n\n\n>     #! example\n>     [1, 2, 3, 4].product()\n\n----\n\nProduce a duplicate-free version of the array.\n\n      unique: ->\n        @inject [], (results, element) ->\n          results.push element if results.indexOf(element) is -1\n\n          results\n\nMerges together the values of each of the arrays with the values at the corresponding position.\n\n      zip: (args...) ->\n        @map (element, index) ->\n          output = args.map (arr) ->\n            arr[index]\n\n          output.unshift(element)\n\n          return output\n\n>     #! example\n>     ['a', 'b', 'c'].zip([1, 2, 3])\n\n----\n\nHelpers\n-------\n\n    identity = (x) ->\n      x\n\n    rand = (n) ->\n      Math.floor n * Math.random()\n\n    mod = (n, base) ->\n      result = n % base\n\n      if result < 0 and base > 0\n        result += base\n\n      return result\n",
              "type": "blob"
            },
            "extensions.coffee.md": {
              "path": "extensions.coffee.md",
              "mode": "100644",
              "content": "Extensions\n==========\n\nExtend built in prototypes with additional behavior.\n\n    require \"./array\"\n    require \"./function\"\n    require \"./number\"\n    require \"./string\"\n",
              "type": "blob"
            },
            "function.coffee.md": {
              "path": "function.coffee.md",
              "mode": "100644",
              "content": "Function\n========\n\n    {extend} = require \"./util\"\n\nAdd our `Function` extensions.\n\n    extend Function.prototype,\n      once: ->\n        func = this\n\n        ran = false\n        memo = undefined\n\n        return ->\n          return memo if ran\n          ran = true\n\n          return memo = func.apply(this, arguments)\n\nCalling a debounced function will postpone its execution until after\nwait milliseconds have elapsed since the last time the function was\ninvoked. Useful for implementing behavior that should only happen after\nthe input has stopped arriving. For example: rendering a preview of a\nMarkdown comment, recalculating a layout after the window has stopped\nbeing resized...\n\n      debounce: (wait) ->\n        timeout = null\n        func = this\n\n        return ->\n          context = this\n          args = arguments\n\n          later = ->\n            timeout = null\n            func.apply(context, args)\n\n          clearTimeout(timeout)\n          timeout = setTimeout(later, wait)\n\n>     lazyLayout = calculateLayout.debounce(300)\n>     $(window).resize(lazyLayout)\n\n----\n\n      delay: (wait, args...) ->\n        func = this\n\n        setTimeout ->\n          func.apply(null, args)\n        , wait\n\n      defer: (args...) ->\n        this.delay.apply this, [1].concat(args)\n\n    extend Function,\n      identity: (x) ->\n        x\n\n      noop: ->\n",
              "type": "blob"
            },
            "number.coffee.md": {
              "path": "number.coffee.md",
              "mode": "100644",
              "content": "Number\n======\n\nReturns the absolute value of this number.\n\n>     #! example\n>     (-4).abs()\n\nReturns the mathematical ceiling of this number. The number truncated to the\nnearest integer of greater than or equal value.\n\n>     #! example\n>     4.2.ceil()\n\n---\n\n>     #! example\n>     (-1.2).ceil()\n\n---\n\nReturns the mathematical floor of this number. The number truncated to the\nnearest integer of less than or equal value.\n\n>     #! example\n>     4.9.floor()\n\n---\n\n>     #! example\n>     (-1.2).floor()\n\n---\n\nReturns this number rounded to the nearest integer.\n\n>     #! example\n>     4.5.round()\n\n---\n\n>     #! example\n>     4.4.round()\n\n---\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n      \"round\"\n    ].forEach (method) ->\n      Number::[method] = ->\n        Math[method](this)\n\n    {extend} = require \"./util\"\n\n    extend Number.prototype,\n\nGet a bunch of points equally spaced around the unit circle.\n\n      circularPoints: ->\n        n = this\n\n        [0..n].map (i) ->\n          Point.fromAngle (i/n).turns\n\n>     #! example\n>     4.circularPoints()\n\n---\n\nReturns a number whose value is limited to the given range.\n\n      clamp: (min, max) ->\n        if min? and max?\n          Math.min(Math.max(this, min), max)\n        else if min?\n          Math.max(this, min)\n        else if max?\n          Math.min(this, max)\n        else\n          this\n\n>     #! example\n>     512.clamp(0, 255)\n\n---\n\nA mod method useful for array wrapping. The range of the function is\nconstrained to remain in bounds of array indices.\n\n      mod: (base) ->\n        result = this % base;\n\n        if result < 0 && base > 0\n          result += base\n\n        return result\n\n>     #! example\n>     (-1).mod(5)\n\n---\n\nGet the sign of this number as an integer (1, -1, or 0).\n\n      sign: ->\n        if this > 0\n          1\n        else if this < 0\n          -1\n        else\n          0\n\n>     #! example\n>     5.sign()\n\n---\n\nReturns true if this number is even (evenly divisible by 2).\n\n      even: ->\n        @mod(2) is 0\n\n>     #! example\n>     2.even()\n\n---\n\nReturns true if this number is odd (has remainder of 1 when divided by 2).\n\n      odd: ->\n        @mod(2) is 1\n\n>     #! example\n>     3.odd()\n\n---\n\nCalls iterator the specified number of times, passing in the number of the\ncurrent iteration as a parameter: 0 on first call, 1 on the second call, etc.\n\n      times: (iterator, context) ->\n        i = -1\n\n        while ++i < this\n          iterator.call context, i\n\n        return i\n\n>     #! example\n>     output = []\n>\n>     5.times (n) ->\n>       output.push(n)\n>\n>     output\n\n---\n\nReturns the the nearest grid resolution less than or equal to the number.\n\n      snap: (resolution) ->\n        (n / resolution).floor() * resolution\n\n>     #! example\n>     7.snap(8)\n\n---\n\n      truncate: ->\n        if this > 0\n          @floor()\n        else if this < 0\n          @ceil()\n        else\n          this\n\nConvert a number to an amount of rotations.\n\n    unless 5.rotations\n      Object.defineProperty Number::, 'rotations',\n        get: ->\n          this * Math.TAU\n\n    unless 1.rotation\n      Object.defineProperty Number::, 'rotation',\n        get: ->\n          this * Math.TAU\n\n>     #! example\n>     0.5.rotations\n\n---\n\nConvert a number to an amount of rotations.\n\n    unless 5.turns\n      Object.defineProperty Number.prototype, 'turns',\n        get: ->\n          this * Math.TAU\n\n    unless 1.turn\n      Object.defineProperty Number.prototype, 'turn',\n        get: ->\n          this * Math.TAU\n\n>     #! example\n>     0.5.turns\n\n---\n\nConvert a number to an amount of degrees.\n\n    unless 2.degrees\n      Object.defineProperty Number::, 'degrees',\n        get: ->\n          this * Math.TAU / 360\n\n    unless 1.degree\n      Object.defineProperty Number::, 'degree',\n        get: ->\n          this * Math.TAU / 360\n\n>     #! example\n>     180.degrees\n\n---\n\nExtra\n-----\n\nThe mathematical circle constant of 1 turn.\n\n    Math.TAU = 2 * Math.PI\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.2.0\"\nentryPoint: \"extensions\"\n",
              "type": "blob"
            },
            "string.coffee.md": {
              "path": "string.coffee.md",
              "mode": "100644",
              "content": "String\n======\n\nExtend strings with utility methods.\n\n    {extend} = require \"./util\"\n\n    extend String.prototype,\n\nReturns true if this string only contains whitespace characters.\n\n      blank: ->\n        /^\\s*$/.test(this)\n\n>     #! example\n>     \"   \".blank()\n\n---\n\nParse this string as though it is JSON and return the object it represents. If it\nis not valid JSON returns the string itself.\n\n      parse: () ->\n        try\n          JSON.parse(this.toString())\n        catch e\n          this.toString()\n\n>     #! example\n>     # this is valid json, so an object is returned\n>     '{\"a\": 3}'.parse()\n\n---\n\nReturns true if this string starts with the given string.\n\n      startsWith: (str) ->\n        @lastIndexOf(str, 0) is 0\n\nReturns true if this string ends with the given string.\n\n      endsWith: (str) ->\n        @indexOf(str, @length - str.length) != -1\n\nGet the file extension of a string.\n\n      extension: ->\n        if extension = this.match(/\\.([^\\.]*)$/, '')?.last()\n          extension\n        else\n          ''\n\n>     #! example\n>     \"README.md\".extension()\n\n---\n\nAssumes the string is something like a file name and returns the\ncontents of the string without the extension.\n\n      withoutExtension: ->\n        this.replace(/\\.[^\\.]*$/, '')\n\n      toInt: (base=10) ->\n        parseInt(this, base)\n\n>     #! example\n>     \"neat.png\".witouthExtension()\n\n---\n",
              "type": "blob"
            },
            "test/array.coffee": {
              "path": "test/array.coffee",
              "mode": "100644",
              "content": "require \"../array\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Array\", ->\n\n  test \"#average\", ->\n    equals [1, 3, 5, 7].average(), 4\n  \n  test \"#compact\", ->\n    a = [0, 1, undefined, 2, null, 3, '', 4]\n  \n    compacted = a.compact()\n  \n    equals(compacted[0], 0)\n    equals(compacted[1], 1)\n    equals(compacted[2], 2)\n    equals(compacted[3], 3)\n    equals(compacted[4], '')\n    equals(compacted[5], 4)\n  \n  test \"#copy\", ->\n    a = [1,2,3]\n    b = a.copy()\n  \n    ok a != b, \"Original array is not the same array as the copied one\"\n    ok a.length == b.length, \"Both arrays are the same size\"\n    ok a[0] == b[0] && a[1] == b[1] && a[2] == b[2], \"The elements of the two arrays are equal\"\n  \n  test \"#flatten\", ->\n    array = [[0,1], [2,3], [4,5]]\n  \n    flattenedArray = array.flatten()\n  \n    equals flattenedArray.length, 6, \"Flattened array length should equal number of elements in sub-arrays\"\n    equals flattenedArray.first(), 0, \"First element should be first element in first sub-array\"\n    equals flattenedArray.last(), 5, \"Last element should be last element in last sub-array\"\n  \n  test \"#rand\", ->\n    array = [1,2,3]\n  \n    ok array.indexOf(array.rand()) != -1, \"Array includes randomly selected element\"\n    ok [5].rand() == 5, \"[5].rand() === 5\"\n    ok [].rand() == undefined, \"[].rand() === undefined\"\n  \n  test \"#remove\", ->\n    equals [1,2,3].remove(2), 2, \"[1,2,3].remove(2) === 2\"\n    equals [1,3].remove(2), undefined, \"[1,3].remove(2) === undefined\"\n    equals [1,3].remove(3), 3, \"[1,3].remove(3) === 3\"\n  \n    array = [1,2,3]\n    array.remove(2)\n    ok array.length == 2, \"array = [1,2,3]; array.remove(2); array.length === 2\"\n    array.remove(3)\n    ok array.length == 1, \"array = [1,3]; array.remove(3); array.length === 1\"\n  \n  test \"#map\", ->\n    equals [1].map((x) -> return x + 1 )[0], 2\n  \n  test \"#invoke\", ->\n    results = ['hello', 'world', 'cool!'].invoke('substring', 0, 3)\n  \n    equals results[0], \"hel\"\n    equals results[1], \"wor\"\n    equals results[2], \"coo\"\n  \n  test \"#each\", ->\n    array = [1, 2, 3]\n    count = 0\n  \n    equals array, array.each -> count++\n    equals array.length, count\n  \n  test \"#eachPair\", ->\n    array = [1, 2, 3]\n    sum = 0\n  \n    array.eachPair (a, b) ->\n      sum += a + b\n  \n    equals(sum, 12)\n  \n  test \"#eachWithObject\", ->\n    array = [1, 2, 3]\n  \n    result = array.eachWithObject {}, (element, hash) ->\n      hash[element] = (element + 1).toString()\n  \n    equals result[1], \"2\"\n    equals result[2], \"3\"\n    equals result[3], \"4\"\n  \n  test \"#shuffle\", ->\n    array = [0, 1, 2, 3, 4, 5]\n  \n    shuffledArray = array.shuffle()\n  \n    shuffledArray.each (element) ->\n      ok array.indexOf(element) >= 0, \"Every element in shuffled array is in orig array\"\n  \n    array.each (element) ->\n      ok shuffledArray.indexOf(element) >= 0, \"Every element in orig array is in shuffled array\"\n  \n  test \"#first\", ->\n    equals [2].first(), 2\n    equals [1, 2, 3].first(), 1\n    equals [].first(), undefined\n  \n  test \"#last\", ->\n    equals [2].last(), 2\n    equals [1, 2, 3].last(), 3\n    equals [].first(), undefined\n  \n  test \"#maxima\", ->\n    maxima = [-52, 0, 78].maxima()\n  \n    maxima.each (n) ->\n      equals n, 78\n  \n    maxima = [0, 0, 1, 0, 1, 0, 1, 0].maxima()\n  \n    equals 3, maxima.length\n  \n    maxima.each (n) ->\n      equals n, 1\n  \n  test \"#maximum\", ->\n    equals [-345, 38, 8347].maximum(), 8347\n  \n  test \"#maximum with function\", ->\n    equals [3, 4, 5].maximum((n) ->\n      n % 4\n    ), 3\n  \n  test \"#minima\", ->\n    minima = [-52, 0, 78].minima()\n  \n    minima.each (n) ->\n      equals n, -52\n  \n    minima = [0, 0, 1, 0, 1, 0, 1, 0].minima()\n  \n    equals 5, minima.length\n  \n    minima.each (n) ->\n      equals n, 0\n  \n  test \"#minimum\", ->\n    equals [-345, 38, 8347].minimum(), -345\n  \n  test \"#pipeline\", ->\n    pipe = [\n      (x) -> x * x\n      (x) -> x - 10\n    ]\n  \n    equals pipe.pipeline(5), 15\n  \n  test \"#extremes\", ->\n    array = [-7, 1, 11, 94]\n  \n    extremes = array.extremes()\n  \n    equals extremes.min, -7, \"Min is -7\"\n    equals extremes.max, 94, \"Max is 94\"\n  \n  test \"#extremes with fn\", ->\n    array = [1, 11, 94]\n\n    extremes = array.extremes (value) ->\n      value % 11\n\n    equals extremes.min, 11, extremes.min\n    equals extremes.max, 94, extremes.max\n\n  test \"#sum\", ->\n    equals [].sum(), 0, \"Empty array sums to zero\"\n    equals [2].sum(), 2, \"[2] sums to 2\"\n    equals [1, 2, 3, 4, 5].sum(), 15, \"[1, 2, 3, 4, 5] sums to 15\"\n  \n  test \"#eachSlice\", ->\n    [1, 2, 3, 4, 5, 6].eachSlice 2, (array) ->\n      equals array[0] % 2, 1\n      equals array[1] % 2, 0\n  \n  test \"#without\", ->\n    array = [1, 2, 3, 4]\n  \n    excluded = array.without([2, 4])\n  \n    equals excluded[0], 1\n    equals excluded[1], 3\n  \n  test \"#clear\", ->\n    array = [1, 2, 3, 4]\n  \n    equals array.length, 4\n    equals array[0], 1\n  \n    array.clear()\n  \n    equals array.length, 0\n    equals array[0], undefined\n  \n  test \"#unique\", ->\n    array = [0, 0, 0, 1, 1, 1, 2, 3]\n  \n    equals array.unique().first(), 0\n    equals array.unique().last(), 3\n    equals array.unique().length, 4\n  \n  test \"#wrap\", ->\n    array = [0, 1, 2, 3, 4]\n  \n    equals array.wrap(0), 0\n    equals array.wrap(-1), 4\n    equals array.wrap(2), 2\n  \n  test \"#zip\", ->\n    a = [1, 2, 3]\n    b = [4, 5, 6]\n    c = [7, 8]\n  \n    output = a.zip(b, c)\n  \n    equals output[0][0], 1\n    equals output[0][1], 4\n    equals output[0][2], 7\n  \n    equals output[2][2], undefined\n",
              "type": "blob"
            },
            "test/function.coffee": {
              "path": "test/function.coffee",
              "mode": "100644",
              "content": "require \"../function\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Function\", ->\n\n  test \"#once\", ->\n    score = 0\n  \n    addScore = ->\n      score += 100\n  \n    onceScore = addScore.once()\n  \n    [0..9].map ->\n      onceScore()\n  \n    equals score, 100\n  \n  test \".identity\", ->\n    I = Function.identity\n  \n    [0, 1, true, false, null, undefined].each (x) ->\n      equals I(x), x\n  \n  test \"#debounce\", (done) ->\n    fn = (-> ok true; done()).debounce(1)\n  \n    # Though called multiple times the function is only triggered once\n    fn()\n    fn()\n    fn()\n  \n  test \"#delay\", (done) ->\n    fn = (x, y) ->\n      equals x, 3\n      equals y, \"testy\"\n      done()\n  \n    fn.delay 25, 3, \"testy\"\n  \n  test \"#defer\", (done) ->\n    fn = (x) ->\n      equals x, 3\n      done()\n  \n    fn.defer 3\n",
              "type": "blob"
            },
            "test/number.coffee": {
              "path": "test/number.coffee",
              "mode": "100644",
              "content": "require \"../number\"\n\nok = assert\nequals = assert.equal\ntest = it\n\nequalEnough = (expected, actual, tolerance, message) ->\n  message ||= \"#{expected} within #{tolerance} of #{actual}\"\n\n  ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n  \ndescribe \"Number\", ->\n  \n  test \"#abs\", ->\n    equals 5.abs(), 5, \"(5).abs() equals 5\"\n    equals 4.2.abs(), 4.2, \"(4.2).abs() equals 4.2\"\n    equals (-1.2).abs(), 1.2, \"(-1.2).abs() equals 1.2\"\n    equals 0.abs(), 0, \"(0).abs() equals 0\"\n  \n  test \"#ceil\", ->\n    equals 4.9.ceil(), 5, \"(4.9).floor() equals 5\"\n    equals 4.2.ceil(), 5, \"(4.2).ceil() equals 5\"\n    equals (-1.2).ceil(), -1, \"(-1.2).ceil() equals -1\"\n    equals 3.ceil(), 3, \"(3).ceil() equals 3\"\n  \n  test \"#clamp\", ->\n    equals 5.clamp(0, 3), 3\n    equals 5.clamp(-1, 0), 0\n    equals (-5).clamp(0, 1), 0\n    equals 1.clamp(0, null), 1\n    equals (-1).clamp(0, null), 0\n    equals (-10).clamp(-5, 0), -5\n    equals (-10).clamp(null, 0), -10\n    equals 50.clamp(null, 10), 10\n  \n  test \"#floor\", ->\n    equals 4.9.floor(), 4, \"(4.9).floor() equals 4\"\n    equals 4.2.floor(), 4, \"(4.2).floor() equals 4\"\n    equals (-1.2).floor(), -2, \"(-1.2).floor() equals -2\"\n    equals 3.floor(), 3, \"(3).floor() equals 3\"\n  \n  test \"#round\", ->\n    equals 4.5.round(), 5, \"(4.5).round() equals 5\"\n    equals 4.4.round(), 4, \"(4.4).round() equals 4\"\n  \n  test \"#sign\", ->\n    equals 5.sign(), 1, \"Positive number's sign is 1\"\n    equals (-3).sign(), -1, \"Negative number's sign is -1\"\n    equals 0.sign(), 0, \"Zero's sign is 0\"\n  \n  test \"#even\", ->\n    [0, 2, -32].each (n) ->\n      ok n.even(), \"#{n} is even\"\n  \n    [1, -1, 2.2, -3.784].each (n) ->\n      equals n.even(), false, \"#{n} is not even\"\n  \n  test \"#odd\", ->\n    [1, 9, -37].each (n) ->\n      ok n.odd(), \"#{n} is odd\"\n  \n    [0, 32, 2.2, -1.1].each (n) ->\n      equals n.odd(), false, \"#{n} is not odd\"\n  \n  test \"#times\", ->\n    n = 5\n    equals n.times(->), n, \"returns n\"\n  \n  test \"#times called correct amount\", ->\n    n = 5\n    count = 0\n  \n    n.times -> count++\n  \n    equals n, count, \"returns n\"\n  \n  test \"#mod should have a positive result when used with a positive base and a negative number\", ->\n    n = -3\n  \n    equals n.mod(8), 5, \"Should 'wrap' and be positive.\"\n  \n  test \"#degrees\", ->\n    equals 180.degrees, Math.PI\n    equals 1.degree, Math.TAU / 360\n  \n  test \"#rotations\", ->\n    equals 1.rotation, Math.TAU\n    equals 0.5.rotations, Math.TAU / 2\n  \n  test \"#turns\", ->\n    equals 1.turn, Math.TAU\n    equals 0.5.turns, Math.TAU / 2\n",
              "type": "blob"
            },
            "test/string.coffee": {
              "path": "test/string.coffee",
              "mode": "100644",
              "content": "require \"../string\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"String\", ->\n  \n  test \"#blank\", ->\n    equals \"  \".blank(), true, \"A string containing only whitespace should be blank\"\n    equals \"a\".blank(), false, \"A string that contains a letter should not be blank\"\n    equals \"  a \".blank(), false\n    equals \"  \\n\\t \".blank(), true\n  \n  test \"#extension\", ->\n    equals \"README\".extension(), \"\"\n    equals \"README.md\".extension(), \"md\"\n    equals \"jquery.min.js\".extension(), \"js\"\n    equals \"src/bouse.js.coffee\".extension(), \"coffee\"\n  \n  test \"#parse\", ->\n    equals \"true\".parse(), true, \"parsing 'true' should equal boolean true\"\n    equals \"false\".parse(), false, \"parsing 'true' should equal boolean true\"\n    equals \"7.2\".parse(), 7.2, \"numbers should be cool too\"\n  \n    equals '{\"val\": \"a string\"}'.parse().val, \"a string\", \"even parsing objects works\"\n  \n    ok ''.parse() == '', \"Empty string parses to exactly the empty string\"\n  \n  test \"#startsWith\", ->\n    ok \"cool\".startsWith(\"coo\")\n    equals \"cool\".startsWith(\"oo\"), false\n  \n  test \"#toInt\", ->\n    equals \"31.3\".toInt(), 31\n    equals \"31.\".toInt(), 31\n    equals \"-1.02\".toInt(), -1\n  \n    equals \"009\".toInt(), 9\n    equals \"0109\".toInt(), 109\n  \n    equals \"F\".toInt(16), 15\n  \n  test \"#withoutExtension\", ->\n    equals \"neat.png\".withoutExtension(), \"neat\"\n    equals \"not a file\".withoutExtension(), \"not a file\"\n",
              "type": "blob"
            },
            "util.coffee.md": {
              "path": "util.coffee.md",
              "mode": "100644",
              "content": "Util\n====\n\nUtility methods shared in our extensions.\n\n    module.exports =\n\nExtend an object with the properties of other objects.\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
              "type": "blob"
            }
          },
          "distribution": {
            "array": {
              "path": "array",
              "content": "(function() {\n  var extend, identity, mod, rand,\n    __slice = [].slice;\n\n  extend = require(\"./util\").extend;\n\n  extend(Array.prototype, {\n    average: function() {\n      return this.sum() / this.length;\n    },\n    compact: function() {\n      return this.select(function(element) {\n        return element != null;\n      });\n    },\n    copy: function() {\n      return this.concat();\n    },\n    clear: function() {\n      this.length = 0;\n      return this;\n    },\n    flatten: function() {\n      return this.inject([], function(a, b) {\n        return a.concat(b);\n      });\n    },\n    invoke: function() {\n      var args, method;\n      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      return this.map(function(element) {\n        return element[method].apply(element, args);\n      });\n    },\n    rand: function() {\n      return this[rand(this.length)];\n    },\n    remove: function(object) {\n      var index;\n      index = this.indexOf(object);\n      if (index >= 0) {\n        return this.splice(index, 1)[0];\n      } else {\n        return void 0;\n      }\n    },\n    include: function(element) {\n      return this.indexOf(element) !== -1;\n    },\n    each: function(iterator, context) {\n      var element, i, _i, _len;\n      if (this.forEach) {\n        this.forEach(iterator, context);\n      } else {\n        for (i = _i = 0, _len = this.length; _i < _len; i = ++_i) {\n          element = this[i];\n          iterator.call(context, element, i, this);\n        }\n      }\n      return this;\n    },\n    eachPair: function(iterator, context) {\n      var a, b, i, j, length, _results;\n      length = this.length;\n      i = 0;\n      _results = [];\n      while (i < length) {\n        a = this[i];\n        j = i + 1;\n        i += 1;\n        _results.push((function() {\n          var _results1;\n          _results1 = [];\n          while (j < length) {\n            b = this[j];\n            j += 1;\n            _results1.push(iterator.call(context, a, b));\n          }\n          return _results1;\n        }).call(this));\n      }\n      return _results;\n    },\n    eachWithObject: function(object, iterator, context) {\n      this.each(function(element, i, self) {\n        return iterator.call(context, element, object, i, self);\n      });\n      return object;\n    },\n    eachSlice: function(n, iterator, context) {\n      var i, len;\n      len = this.length / n;\n      i = -1;\n      while (++i < len) {\n        iterator.call(context, this.slice(i * n, (i + 1) * n), i * n, this);\n      }\n      return this;\n    },\n    pipeline: function(input) {\n      return this.inject(input, function(input, fn) {\n        return fn(input);\n      });\n    },\n    shuffle: function() {\n      var shuffledArray;\n      shuffledArray = [];\n      this.each(function(element) {\n        return shuffledArray.splice(rand(shuffledArray.length + 1), 0, element);\n      });\n      return shuffledArray;\n    },\n    first: function() {\n      return this[0];\n    },\n    last: function() {\n      return this[this.length - 1];\n    },\n    extremes: function(fn) {\n      var max, maxResult, min, minResult;\n      if (fn == null) {\n        fn = identity;\n      }\n      min = max = void 0;\n      minResult = maxResult = void 0;\n      this.each(function(object) {\n        var result;\n        result = fn(object);\n        if (min != null) {\n          if (result < minResult) {\n            min = object;\n            minResult = result;\n          }\n        } else {\n          min = object;\n          minResult = result;\n        }\n        if (max != null) {\n          if (result > maxResult) {\n            max = object;\n            return maxResult = result;\n          }\n        } else {\n          max = object;\n          return maxResult = result;\n        }\n      });\n      return {\n        min: min,\n        max: max\n      };\n    },\n    maxima: function(valueFunction) {\n      if (valueFunction == null) {\n        valueFunction = identity;\n      }\n      return this.inject([-Infinity, []], function(memo, item) {\n        var maxItems, maxValue, value;\n        value = valueFunction(item);\n        maxValue = memo[0], maxItems = memo[1];\n        if (value > maxValue) {\n          return [value, [item]];\n        } else if (value === maxValue) {\n          return [value, maxItems.concat(item)];\n        } else {\n          return memo;\n        }\n      }).last();\n    },\n    maximum: function(valueFunction) {\n      return this.maxima(valueFunction).first();\n    },\n    minima: function(valueFunction) {\n      var inverseFn;\n      if (valueFunction == null) {\n        valueFunction = identity;\n      }\n      inverseFn = function(x) {\n        return -valueFunction(x);\n      };\n      return this.maxima(inverseFn);\n    },\n    minimum: function(valueFunction) {\n      return this.minima(valueFunction).first();\n    },\n    wrap: function(start, length) {\n      var end, i, result;\n      if (length != null) {\n        end = start + length;\n        i = start;\n        result = [];\n        while (i < end) {\n          result.push(this[mod(i, this.length)]);\n          i += 1;\n        }\n        return result;\n      } else {\n        return this[mod(start, this.length)];\n      }\n    },\n    partition: function(iterator, context) {\n      var falseCollection, trueCollection;\n      trueCollection = [];\n      falseCollection = [];\n      this.each(function(element) {\n        if (iterator.call(context, element)) {\n          return trueCollection.push(element);\n        } else {\n          return falseCollection.push(element);\n        }\n      });\n      return [trueCollection, falseCollection];\n    },\n    select: function(iterator, context) {\n      return this.partition(iterator, context)[0];\n    },\n    without: function(values) {\n      return this.reject(function(element) {\n        return values.include(element);\n      });\n    },\n    reject: function(iterator, context) {\n      return this.partition(iterator, context)[1];\n    },\n    inject: function(initial, iterator) {\n      this.each(function(element) {\n        return initial = iterator(initial, element);\n      });\n      return initial;\n    },\n    sum: function() {\n      return this.inject(0, function(sum, n) {\n        return sum + n;\n      });\n    },\n    product: function() {\n      return this.inject(1, function(product, n) {\n        return product * n;\n      });\n    },\n    unique: function() {\n      return this.inject([], function(results, element) {\n        if (results.indexOf(element) === -1) {\n          results.push(element);\n        }\n        return results;\n      });\n    },\n    zip: function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return this.map(function(element, index) {\n        var output;\n        output = args.map(function(arr) {\n          return arr[index];\n        });\n        output.unshift(element);\n        return output;\n      });\n    }\n  });\n\n  identity = function(x) {\n    return x;\n  };\n\n  rand = function(n) {\n    return Math.floor(n * Math.random());\n  };\n\n  mod = function(n, base) {\n    var result;\n    result = n % base;\n    if (result < 0 && base > 0) {\n      result += base;\n    }\n    return result;\n  };\n\n}).call(this);\n\n//# sourceURL=array.coffee",
              "type": "blob"
            },
            "extensions": {
              "path": "extensions",
              "content": "(function() {\n  require(\"./array\");\n\n  require(\"./function\");\n\n  require(\"./number\");\n\n  require(\"./string\");\n\n}).call(this);\n\n//# sourceURL=extensions.coffee",
              "type": "blob"
            },
            "function": {
              "path": "function",
              "content": "(function() {\n  var extend,\n    __slice = [].slice;\n\n  extend = require(\"./util\").extend;\n\n  extend(Function.prototype, {\n    once: function() {\n      var func, memo, ran;\n      func = this;\n      ran = false;\n      memo = void 0;\n      return function() {\n        if (ran) {\n          return memo;\n        }\n        ran = true;\n        return memo = func.apply(this, arguments);\n      };\n    },\n    debounce: function(wait) {\n      var func, timeout;\n      timeout = null;\n      func = this;\n      return function() {\n        var args, context, later;\n        context = this;\n        args = arguments;\n        later = function() {\n          timeout = null;\n          return func.apply(context, args);\n        };\n        clearTimeout(timeout);\n        return timeout = setTimeout(later, wait);\n      };\n    },\n    delay: function() {\n      var args, func, wait;\n      wait = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      func = this;\n      return setTimeout(function() {\n        return func.apply(null, args);\n      }, wait);\n    },\n    defer: function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return this.delay.apply(this, [1].concat(args));\n    }\n  });\n\n  extend(Function, {\n    identity: function(x) {\n      return x;\n    },\n    noop: function() {}\n  });\n\n}).call(this);\n\n//# sourceURL=function.coffee",
              "type": "blob"
            },
            "number": {
              "path": "number",
              "content": "(function() {\n  var extend;\n\n  [\"abs\", \"ceil\", \"floor\", \"round\"].forEach(function(method) {\n    return Number.prototype[method] = function() {\n      return Math[method](this);\n    };\n  });\n\n  extend = require(\"./util\").extend;\n\n  extend(Number.prototype, {\n    circularPoints: function() {\n      var n, _i, _results;\n      n = this;\n      return (function() {\n        _results = [];\n        for (var _i = 0; 0 <= n ? _i <= n : _i >= n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function(i) {\n        return Point.fromAngle((i / n).turns);\n      });\n    },\n    clamp: function(min, max) {\n      if ((min != null) && (max != null)) {\n        return Math.min(Math.max(this, min), max);\n      } else if (min != null) {\n        return Math.max(this, min);\n      } else if (max != null) {\n        return Math.min(this, max);\n      } else {\n        return this;\n      }\n    },\n    mod: function(base) {\n      var result;\n      result = this % base;\n      if (result < 0 && base > 0) {\n        result += base;\n      }\n      return result;\n    },\n    sign: function() {\n      if (this > 0) {\n        return 1;\n      } else if (this < 0) {\n        return -1;\n      } else {\n        return 0;\n      }\n    },\n    even: function() {\n      return this.mod(2) === 0;\n    },\n    odd: function() {\n      return this.mod(2) === 1;\n    },\n    times: function(iterator, context) {\n      var i;\n      i = -1;\n      while (++i < this) {\n        iterator.call(context, i);\n      }\n      return i;\n    },\n    snap: function(resolution) {\n      return (n / resolution).floor() * resolution;\n    },\n    truncate: function() {\n      if (this > 0) {\n        return this.floor();\n      } else if (this < 0) {\n        return this.ceil();\n      } else {\n        return this;\n      }\n    }\n  });\n\n  if (!5..rotations) {\n    Object.defineProperty(Number.prototype, 'rotations', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!1..rotation) {\n    Object.defineProperty(Number.prototype, 'rotation', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!5..turns) {\n    Object.defineProperty(Number.prototype, 'turns', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!1..turn) {\n    Object.defineProperty(Number.prototype, 'turn', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!2..degrees) {\n    Object.defineProperty(Number.prototype, 'degrees', {\n      get: function() {\n        return this * Math.TAU / 360;\n      }\n    });\n  }\n\n  if (!1..degree) {\n    Object.defineProperty(Number.prototype, 'degree', {\n      get: function() {\n        return this * Math.TAU / 360;\n      }\n    });\n  }\n\n  Math.TAU = 2 * Math.PI;\n\n}).call(this);\n\n//# sourceURL=number.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"extensions\"};",
              "type": "blob"
            },
            "string": {
              "path": "string",
              "content": "(function() {\n  var extend;\n\n  extend = require(\"./util\").extend;\n\n  extend(String.prototype, {\n    blank: function() {\n      return /^\\s*$/.test(this);\n    },\n    parse: function() {\n      var e;\n      try {\n        return JSON.parse(this.toString());\n      } catch (_error) {\n        e = _error;\n        return this.toString();\n      }\n    },\n    startsWith: function(str) {\n      return this.lastIndexOf(str, 0) === 0;\n    },\n    endsWith: function(str) {\n      return this.indexOf(str, this.length - str.length) !== -1;\n    },\n    extension: function() {\n      var extension, _ref;\n      if (extension = (_ref = this.match(/\\.([^\\.]*)$/, '')) != null ? _ref.last() : void 0) {\n        return extension;\n      } else {\n        return '';\n      }\n    },\n    withoutExtension: function() {\n      return this.replace(/\\.[^\\.]*$/, '');\n    },\n    toInt: function(base) {\n      if (base == null) {\n        base = 10;\n      }\n      return parseInt(this, base);\n    }\n  });\n\n}).call(this);\n\n//# sourceURL=string.coffee",
              "type": "blob"
            },
            "test/array": {
              "path": "test/array",
              "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../array\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Array\", function() {\n    test(\"#average\", function() {\n      return equals([1, 3, 5, 7].average(), 4);\n    });\n    test(\"#compact\", function() {\n      var a, compacted;\n      a = [0, 1, void 0, 2, null, 3, '', 4];\n      compacted = a.compact();\n      equals(compacted[0], 0);\n      equals(compacted[1], 1);\n      equals(compacted[2], 2);\n      equals(compacted[3], 3);\n      equals(compacted[4], '');\n      return equals(compacted[5], 4);\n    });\n    test(\"#copy\", function() {\n      var a, b;\n      a = [1, 2, 3];\n      b = a.copy();\n      ok(a !== b, \"Original array is not the same array as the copied one\");\n      ok(a.length === b.length, \"Both arrays are the same size\");\n      return ok(a[0] === b[0] && a[1] === b[1] && a[2] === b[2], \"The elements of the two arrays are equal\");\n    });\n    test(\"#flatten\", function() {\n      var array, flattenedArray;\n      array = [[0, 1], [2, 3], [4, 5]];\n      flattenedArray = array.flatten();\n      equals(flattenedArray.length, 6, \"Flattened array length should equal number of elements in sub-arrays\");\n      equals(flattenedArray.first(), 0, \"First element should be first element in first sub-array\");\n      return equals(flattenedArray.last(), 5, \"Last element should be last element in last sub-array\");\n    });\n    test(\"#rand\", function() {\n      var array;\n      array = [1, 2, 3];\n      ok(array.indexOf(array.rand()) !== -1, \"Array includes randomly selected element\");\n      ok([5].rand() === 5, \"[5].rand() === 5\");\n      return ok([].rand() === void 0, \"[].rand() === undefined\");\n    });\n    test(\"#remove\", function() {\n      var array;\n      equals([1, 2, 3].remove(2), 2, \"[1,2,3].remove(2) === 2\");\n      equals([1, 3].remove(2), void 0, \"[1,3].remove(2) === undefined\");\n      equals([1, 3].remove(3), 3, \"[1,3].remove(3) === 3\");\n      array = [1, 2, 3];\n      array.remove(2);\n      ok(array.length === 2, \"array = [1,2,3]; array.remove(2); array.length === 2\");\n      array.remove(3);\n      return ok(array.length === 1, \"array = [1,3]; array.remove(3); array.length === 1\");\n    });\n    test(\"#map\", function() {\n      return equals([1].map(function(x) {\n        return x + 1;\n      })[0], 2);\n    });\n    test(\"#invoke\", function() {\n      var results;\n      results = ['hello', 'world', 'cool!'].invoke('substring', 0, 3);\n      equals(results[0], \"hel\");\n      equals(results[1], \"wor\");\n      return equals(results[2], \"coo\");\n    });\n    test(\"#each\", function() {\n      var array, count;\n      array = [1, 2, 3];\n      count = 0;\n      equals(array, array.each(function() {\n        return count++;\n      }));\n      return equals(array.length, count);\n    });\n    test(\"#eachPair\", function() {\n      var array, sum;\n      array = [1, 2, 3];\n      sum = 0;\n      array.eachPair(function(a, b) {\n        return sum += a + b;\n      });\n      return equals(sum, 12);\n    });\n    test(\"#eachWithObject\", function() {\n      var array, result;\n      array = [1, 2, 3];\n      result = array.eachWithObject({}, function(element, hash) {\n        return hash[element] = (element + 1).toString();\n      });\n      equals(result[1], \"2\");\n      equals(result[2], \"3\");\n      return equals(result[3], \"4\");\n    });\n    test(\"#shuffle\", function() {\n      var array, shuffledArray;\n      array = [0, 1, 2, 3, 4, 5];\n      shuffledArray = array.shuffle();\n      shuffledArray.each(function(element) {\n        return ok(array.indexOf(element) >= 0, \"Every element in shuffled array is in orig array\");\n      });\n      return array.each(function(element) {\n        return ok(shuffledArray.indexOf(element) >= 0, \"Every element in orig array is in shuffled array\");\n      });\n    });\n    test(\"#first\", function() {\n      equals([2].first(), 2);\n      equals([1, 2, 3].first(), 1);\n      return equals([].first(), void 0);\n    });\n    test(\"#last\", function() {\n      equals([2].last(), 2);\n      equals([1, 2, 3].last(), 3);\n      return equals([].first(), void 0);\n    });\n    test(\"#maxima\", function() {\n      var maxima;\n      maxima = [-52, 0, 78].maxima();\n      maxima.each(function(n) {\n        return equals(n, 78);\n      });\n      maxima = [0, 0, 1, 0, 1, 0, 1, 0].maxima();\n      equals(3, maxima.length);\n      return maxima.each(function(n) {\n        return equals(n, 1);\n      });\n    });\n    test(\"#maximum\", function() {\n      return equals([-345, 38, 8347].maximum(), 8347);\n    });\n    test(\"#maximum with function\", function() {\n      return equals([3, 4, 5].maximum(function(n) {\n        return n % 4;\n      }), 3);\n    });\n    test(\"#minima\", function() {\n      var minima;\n      minima = [-52, 0, 78].minima();\n      minima.each(function(n) {\n        return equals(n, -52);\n      });\n      minima = [0, 0, 1, 0, 1, 0, 1, 0].minima();\n      equals(5, minima.length);\n      return minima.each(function(n) {\n        return equals(n, 0);\n      });\n    });\n    test(\"#minimum\", function() {\n      return equals([-345, 38, 8347].minimum(), -345);\n    });\n    test(\"#pipeline\", function() {\n      var pipe;\n      pipe = [\n        function(x) {\n          return x * x;\n        }, function(x) {\n          return x - 10;\n        }\n      ];\n      return equals(pipe.pipeline(5), 15);\n    });\n    test(\"#extremes\", function() {\n      var array, extremes;\n      array = [-7, 1, 11, 94];\n      extremes = array.extremes();\n      equals(extremes.min, -7, \"Min is -7\");\n      return equals(extremes.max, 94, \"Max is 94\");\n    });\n    test(\"#extremes with fn\", function() {\n      var array, extremes;\n      array = [1, 11, 94];\n      extremes = array.extremes(function(value) {\n        return value % 11;\n      });\n      equals(extremes.min, 11, extremes.min);\n      return equals(extremes.max, 94, extremes.max);\n    });\n    test(\"#sum\", function() {\n      equals([].sum(), 0, \"Empty array sums to zero\");\n      equals([2].sum(), 2, \"[2] sums to 2\");\n      return equals([1, 2, 3, 4, 5].sum(), 15, \"[1, 2, 3, 4, 5] sums to 15\");\n    });\n    test(\"#eachSlice\", function() {\n      return [1, 2, 3, 4, 5, 6].eachSlice(2, function(array) {\n        equals(array[0] % 2, 1);\n        return equals(array[1] % 2, 0);\n      });\n    });\n    test(\"#without\", function() {\n      var array, excluded;\n      array = [1, 2, 3, 4];\n      excluded = array.without([2, 4]);\n      equals(excluded[0], 1);\n      return equals(excluded[1], 3);\n    });\n    test(\"#clear\", function() {\n      var array;\n      array = [1, 2, 3, 4];\n      equals(array.length, 4);\n      equals(array[0], 1);\n      array.clear();\n      equals(array.length, 0);\n      return equals(array[0], void 0);\n    });\n    test(\"#unique\", function() {\n      var array;\n      array = [0, 0, 0, 1, 1, 1, 2, 3];\n      equals(array.unique().first(), 0);\n      equals(array.unique().last(), 3);\n      return equals(array.unique().length, 4);\n    });\n    test(\"#wrap\", function() {\n      var array;\n      array = [0, 1, 2, 3, 4];\n      equals(array.wrap(0), 0);\n      equals(array.wrap(-1), 4);\n      return equals(array.wrap(2), 2);\n    });\n    return test(\"#zip\", function() {\n      var a, b, c, output;\n      a = [1, 2, 3];\n      b = [4, 5, 6];\n      c = [7, 8];\n      output = a.zip(b, c);\n      equals(output[0][0], 1);\n      equals(output[0][1], 4);\n      equals(output[0][2], 7);\n      return equals(output[2][2], void 0);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/array.coffee",
              "type": "blob"
            },
            "test/function": {
              "path": "test/function",
              "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../function\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Function\", function() {\n    test(\"#once\", function() {\n      var addScore, onceScore, score;\n      score = 0;\n      addScore = function() {\n        return score += 100;\n      };\n      onceScore = addScore.once();\n      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function() {\n        return onceScore();\n      });\n      return equals(score, 100);\n    });\n    test(\".identity\", function() {\n      var I;\n      I = Function.identity;\n      return [0, 1, true, false, null, void 0].each(function(x) {\n        return equals(I(x), x);\n      });\n    });\n    test(\"#debounce\", function(done) {\n      var fn;\n      fn = (function() {\n        ok(true);\n        return done();\n      }).debounce(1);\n      fn();\n      fn();\n      return fn();\n    });\n    test(\"#delay\", function(done) {\n      var fn;\n      fn = function(x, y) {\n        equals(x, 3);\n        equals(y, \"testy\");\n        return done();\n      };\n      return fn.delay(25, 3, \"testy\");\n    });\n    return test(\"#defer\", function(done) {\n      var fn;\n      fn = function(x) {\n        equals(x, 3);\n        return done();\n      };\n      return fn.defer(3);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/function.coffee",
              "type": "blob"
            },
            "test/number": {
              "path": "test/number",
              "content": "(function() {\n  var equalEnough, equals, ok, test;\n\n  require(\"../number\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  equalEnough = function(expected, actual, tolerance, message) {\n    message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n    return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n  };\n\n  describe(\"Number\", function() {\n    test(\"#abs\", function() {\n      equals(5..abs(), 5, \"(5).abs() equals 5\");\n      equals(4.2.abs(), 4.2, \"(4.2).abs() equals 4.2\");\n      equals((-1.2).abs(), 1.2, \"(-1.2).abs() equals 1.2\");\n      return equals(0..abs(), 0, \"(0).abs() equals 0\");\n    });\n    test(\"#ceil\", function() {\n      equals(4.9.ceil(), 5, \"(4.9).floor() equals 5\");\n      equals(4.2.ceil(), 5, \"(4.2).ceil() equals 5\");\n      equals((-1.2).ceil(), -1, \"(-1.2).ceil() equals -1\");\n      return equals(3..ceil(), 3, \"(3).ceil() equals 3\");\n    });\n    test(\"#clamp\", function() {\n      equals(5..clamp(0, 3), 3);\n      equals(5..clamp(-1, 0), 0);\n      equals((-5).clamp(0, 1), 0);\n      equals(1..clamp(0, null), 1);\n      equals((-1).clamp(0, null), 0);\n      equals((-10).clamp(-5, 0), -5);\n      equals((-10).clamp(null, 0), -10);\n      return equals(50..clamp(null, 10), 10);\n    });\n    test(\"#floor\", function() {\n      equals(4.9.floor(), 4, \"(4.9).floor() equals 4\");\n      equals(4.2.floor(), 4, \"(4.2).floor() equals 4\");\n      equals((-1.2).floor(), -2, \"(-1.2).floor() equals -2\");\n      return equals(3..floor(), 3, \"(3).floor() equals 3\");\n    });\n    test(\"#round\", function() {\n      equals(4.5.round(), 5, \"(4.5).round() equals 5\");\n      return equals(4.4.round(), 4, \"(4.4).round() equals 4\");\n    });\n    test(\"#sign\", function() {\n      equals(5..sign(), 1, \"Positive number's sign is 1\");\n      equals((-3).sign(), -1, \"Negative number's sign is -1\");\n      return equals(0..sign(), 0, \"Zero's sign is 0\");\n    });\n    test(\"#even\", function() {\n      [0, 2, -32].each(function(n) {\n        return ok(n.even(), \"\" + n + \" is even\");\n      });\n      return [1, -1, 2.2, -3.784].each(function(n) {\n        return equals(n.even(), false, \"\" + n + \" is not even\");\n      });\n    });\n    test(\"#odd\", function() {\n      [1, 9, -37].each(function(n) {\n        return ok(n.odd(), \"\" + n + \" is odd\");\n      });\n      return [0, 32, 2.2, -1.1].each(function(n) {\n        return equals(n.odd(), false, \"\" + n + \" is not odd\");\n      });\n    });\n    test(\"#times\", function() {\n      var n;\n      n = 5;\n      return equals(n.times(function() {}), n, \"returns n\");\n    });\n    test(\"#times called correct amount\", function() {\n      var count, n;\n      n = 5;\n      count = 0;\n      n.times(function() {\n        return count++;\n      });\n      return equals(n, count, \"returns n\");\n    });\n    test(\"#mod should have a positive result when used with a positive base and a negative number\", function() {\n      var n;\n      n = -3;\n      return equals(n.mod(8), 5, \"Should 'wrap' and be positive.\");\n    });\n    test(\"#degrees\", function() {\n      equals(180..degrees, Math.PI);\n      return equals(1..degree, Math.TAU / 360);\n    });\n    test(\"#rotations\", function() {\n      equals(1..rotation, Math.TAU);\n      return equals(0.5.rotations, Math.TAU / 2);\n    });\n    return test(\"#turns\", function() {\n      equals(1..turn, Math.TAU);\n      return equals(0.5.turns, Math.TAU / 2);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/number.coffee",
              "type": "blob"
            },
            "test/string": {
              "path": "test/string",
              "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../string\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"String\", function() {\n    test(\"#blank\", function() {\n      equals(\"  \".blank(), true, \"A string containing only whitespace should be blank\");\n      equals(\"a\".blank(), false, \"A string that contains a letter should not be blank\");\n      equals(\"  a \".blank(), false);\n      return equals(\"  \\n\\t \".blank(), true);\n    });\n    test(\"#extension\", function() {\n      equals(\"README\".extension(), \"\");\n      equals(\"README.md\".extension(), \"md\");\n      equals(\"jquery.min.js\".extension(), \"js\");\n      return equals(\"src/bouse.js.coffee\".extension(), \"coffee\");\n    });\n    test(\"#parse\", function() {\n      equals(\"true\".parse(), true, \"parsing 'true' should equal boolean true\");\n      equals(\"false\".parse(), false, \"parsing 'true' should equal boolean true\");\n      equals(\"7.2\".parse(), 7.2, \"numbers should be cool too\");\n      equals('{\"val\": \"a string\"}'.parse().val, \"a string\", \"even parsing objects works\");\n      return ok(''.parse() === '', \"Empty string parses to exactly the empty string\");\n    });\n    test(\"#startsWith\", function() {\n      ok(\"cool\".startsWith(\"coo\"));\n      return equals(\"cool\".startsWith(\"oo\"), false);\n    });\n    test(\"#toInt\", function() {\n      equals(\"31.3\".toInt(), 31);\n      equals(\"31.\".toInt(), 31);\n      equals(\"-1.02\".toInt(), -1);\n      equals(\"009\".toInt(), 9);\n      equals(\"0109\".toInt(), 109);\n      return equals(\"F\".toInt(16), 15);\n    });\n    return test(\"#withoutExtension\", function() {\n      equals(\"neat.png\".withoutExtension(), \"neat\");\n      return equals(\"not a file\".withoutExtension(), \"not a file\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/string.coffee",
              "type": "blob"
            },
            "util": {
              "path": "util",
              "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=util.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "extensions",
          "repository": {
            "id": 13577503,
            "name": "extensions",
            "full_name": "distri/extensions",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/extensions",
            "description": "",
            "fork": false,
            "url": "https://api.github.com/repos/distri/extensions",
            "forks_url": "https://api.github.com/repos/distri/extensions/forks",
            "keys_url": "https://api.github.com/repos/distri/extensions/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/extensions/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/extensions/teams",
            "hooks_url": "https://api.github.com/repos/distri/extensions/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/extensions/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/extensions/events",
            "assignees_url": "https://api.github.com/repos/distri/extensions/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/extensions/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/extensions/tags",
            "blobs_url": "https://api.github.com/repos/distri/extensions/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/extensions/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/extensions/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/extensions/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/extensions/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/extensions/languages",
            "stargazers_url": "https://api.github.com/repos/distri/extensions/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/extensions/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/extensions/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/extensions/subscription",
            "commits_url": "https://api.github.com/repos/distri/extensions/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/extensions/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/extensions/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/extensions/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/extensions/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/extensions/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/extensions/merges",
            "archive_url": "https://api.github.com/repos/distri/extensions/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/extensions/downloads",
            "issues_url": "https://api.github.com/repos/distri/extensions/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/extensions/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/extensions/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/extensions/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/extensions/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/extensions/releases{/id}",
            "created_at": "2013-10-15T01:14:11Z",
            "updated_at": "2013-12-24T01:04:48Z",
            "pushed_at": "2013-12-24T01:04:20Z",
            "git_url": "git://github.com/distri/extensions.git",
            "ssh_url": "git@github.com:distri/extensions.git",
            "clone_url": "https://github.com/distri/extensions.git",
            "svn_url": "https://github.com/distri/extensions",
            "homepage": null,
            "size": 964,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.2.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "core": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "core\n====\n\nAn object extension system.\n",
              "type": "blob"
            },
            "core.coffee.md": {
              "path": "core.coffee.md",
              "mode": "100644",
              "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
              "type": "blob"
            },
            "test/core.coffee": {
              "path": "test/core.coffee",
              "mode": "100644",
              "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "core": {
              "path": "core",
              "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
              "type": "blob"
            },
            "test/core": {
              "path": "test/core",
              "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.6.0",
          "entryPoint": "core",
          "repository": {
            "id": 13567517,
            "name": "core",
            "full_name": "distri/core",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/core",
            "description": "An object extension system.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/core",
            "forks_url": "https://api.github.com/repos/distri/core/forks",
            "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/core/teams",
            "hooks_url": "https://api.github.com/repos/distri/core/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/core/events",
            "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/core/tags",
            "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/core/languages",
            "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/core/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/core/subscription",
            "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/core/merges",
            "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/core/downloads",
            "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
            "created_at": "2013-10-14T17:04:33Z",
            "updated_at": "2013-12-24T00:49:21Z",
            "pushed_at": "2013-10-14T23:49:11Z",
            "git_url": "git://github.com/distri/core.git",
            "ssh_url": "git@github.com:distri/core.git",
            "clone_url": "https://github.com/distri/core.git",
            "svn_url": "https://github.com/distri/core",
            "homepage": null,
            "size": 592,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.6.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "model": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.coffee.md": {
          "path": "README.coffee.md",
          "mode": "100644",
          "content": "Compositions\n============\n\nThe `compositions` module provides helper methods to compose nested data models.\n\nCompositions uses [Observable](/observable/docs) to keep the internal data in sync.\n\n    Core = require \"core\"\n    Observable = require \"observable\"\n\n    module.exports = (I={}, self=Core(I)) ->\n\n      self.extend\n\nObserve any number of attributes as simple observables. For each attribute name passed in we expose a public getter/setter method and listen to changes when the value is set.\n\n        attrObservable: (names...) ->\n          names.forEach (name) ->\n            self[name] = Observable(I[name])\n\n            self[name].observe (newValue) ->\n              I[name] = newValue\n\n          return self\n\nObserve an attribute as a model. Treats the attribute given as an Observable\nmodel instance exposting a getter/setter method of the same name. The Model\nconstructor must be passed in explicitly.\n\n        attrModel: (name, Model) ->\n          model = Model(I[name])\n\n          self[name] = Observable(model)\n\n          self[name].observe (newValue) ->\n            I[name] = newValue.I\n\n          return self\n\nObserve an attribute as a list of sub-models. This is the same as `attrModel`\nexcept the attribute is expected to be an array of models rather than a single one.\n\n        attrModels: (name, Model) ->\n          models = (I[name] or []).map (x) ->\n            Model(x)\n\n          self[name] = Observable(models)\n\n          self[name].observe (newValue) ->\n            I[name] = newValue.map (instance) ->\n              instance.I\n\n          return self\n\nThe JSON representation is kept up to date via the observable properites and resides in `I`.\n\n        toJSON: ->\n          I\n\nReturn our public object.\n\n      return self\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "entryPoint: \"README\"\nversion: \"0.1.1\"\ndependencies:\n  core: \"distri/core:v0.6.0\"\n  observable: \"distri/observable:v0.1.1\"\n",
          "type": "blob"
        },
        "test/compositions.coffee": {
          "path": "test/compositions.coffee",
          "mode": "100644",
          "content": "\nModel = require \"../README\"\n\ndescribe 'Model', ->\n  # Association Testing model\n  Person = (I) ->\n    person = Model(I)\n\n    person.attrAccessor(\n      'firstName'\n      'lastName'\n      'suffix'\n    )\n\n    person.fullName = ->\n      \"#{@firstName()} #{@lastName()} #{@suffix()}\"\n\n    return person\n\n  describe \"#attrObservable\", ->\n    it 'should allow for observing of attributes', ->\n      model = Model\n        name: \"Duder\"\n\n      model.attrObservable \"name\"\n\n      model.name(\"Dudeman\")\n\n      assert.equal model.name(), \"Dudeman\"\n\n    it 'should bind properties to observable attributes', ->\n      model = Model\n        name: \"Duder\"\n\n      model.attrObservable \"name\"\n\n      model.name(\"Dudeman\")\n\n      assert.equal model.name(), \"Dudeman\"\n      assert.equal model.name(), model.I.name\n\n  describe \"#attrModel\", ->\n    it \"should be a model instance\", ->\n      model = Model\n        person:\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n\n      model.attrModel(\"person\", Person)\n\n      assert.equal model.person().fullName(), \"Duder Mannington Jr.\"\n\n    it \"should allow setting the associated model\", ->\n      model = Model\n        person:\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n\n      model.attrModel(\"person\", Person)\n\n      otherPerson = Person\n        firstName: \"Mr.\"\n        lastName: \"Man\"\n\n      model.person(otherPerson)\n\n      assert.equal model.person().firstName(), \"Mr.\"\n\n    it \"shouldn't update the instance properties after it's been replaced\", ->\n      model = Model\n        person:\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n\n      model.attrModel(\"person\", Person)\n\n      duder = model.person()\n\n      otherPerson = Person\n        firstName: \"Mr.\"\n        lastName: \"Man\"\n\n      model.person(otherPerson)\n\n      duder.firstName(\"Joe\")\n\n      assert.equal duder.I.firstName, \"Joe\"\n      assert.equal model.I.person.firstName, \"Mr.\"\n\n  describe \"#attrModels\", ->\n    it \"should have an array of model instances\", ->\n      model = Model\n        people: [{\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n        }, {\n          firstName: \"Mr.\"\n          lastName: \"Mannington\"\n          suffix: \"Sr.\"\n        }]\n\n      model.attrModels(\"people\", Person)\n\n      assert.equal model.people()[0].fullName(), \"Duder Mannington Jr.\"\n\n    it \"should track pushes\", ->\n      model = Model\n        people: [{\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n        }, {\n          firstName: \"Mr.\"\n          lastName: \"Mannington\"\n          suffix: \"Sr.\"\n        }]\n\n      model.attrModels(\"people\", Person)\n\n      model.people.push Person\n        firstName: \"JoJo\"\n        lastName: \"Loco\"\n\n      assert.equal model.people().length, 3\n      assert.equal model.I.people.length, 3\n\n    it \"should track pops\", ->\n      model = Model\n        people: [{\n          firstName: \"Duder\"\n          lastName: \"Mannington\"\n          suffix: \"Jr.\"\n        }, {\n          firstName: \"Mr.\"\n          lastName: \"Mannington\"\n          suffix: \"Sr.\"\n        }]\n\n      model.attrModels(\"people\", Person)\n\n      model.people.pop()\n\n      assert.equal model.people().length, 1\n      assert.equal model.I.people.length, 1\n\n  describe \"#toJSON\", ->\n    it \"should return an object appropriate for JSON serialization\", ->\n      model = Model\n        test: true\n\n      assert model.toJSON().test\n\n  describe \"#observeAll\", ->\n    it \"should observe all attributes of a simple model\"\n    ->  # TODO\n      model = Model\n        test: true\n        yolo: \"4life\"\n\n      model.observeAll()\n\n      assert model.test()\n      assert.equal model.yolo(), \"4life\"\n\n    it \"should camel case underscored names\"",
          "type": "blob"
        }
      },
      "distribution": {
        "README": {
          "path": "README",
          "content": "(function() {\n  var Core, Observable,\n    __slice = [].slice;\n\n  Core = require(\"core\");\n\n  Observable = require(\"observable\");\n\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      attrObservable: function() {\n        var names;\n        names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        names.forEach(function(name) {\n          self[name] = Observable(I[name]);\n          return self[name].observe(function(newValue) {\n            return I[name] = newValue;\n          });\n        });\n        return self;\n      },\n      attrModel: function(name, Model) {\n        var model;\n        model = Model(I[name]);\n        self[name] = Observable(model);\n        self[name].observe(function(newValue) {\n          return I[name] = newValue.I;\n        });\n        return self;\n      },\n      attrModels: function(name, Model) {\n        var models;\n        models = (I[name] || []).map(function(x) {\n          return Model(x);\n        });\n        self[name] = Observable(models);\n        self[name].observe(function(newValue) {\n          return I[name] = newValue.map(function(instance) {\n            return instance.I;\n          });\n        });\n        return self;\n      },\n      toJSON: function() {\n        return I;\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.1.1\",\"dependencies\":{\"core\":\"distri/core:v0.6.0\",\"observable\":\"distri/observable:v0.1.1\"}};",
          "type": "blob"
        },
        "test/compositions": {
          "path": "test/compositions",
          "content": "(function() {\n  var Model;\n\n  Model = require(\"../README\");\n\n  describe('Model', function() {\n    var Person;\n    Person = function(I) {\n      var person;\n      person = Model(I);\n      person.attrAccessor('firstName', 'lastName', 'suffix');\n      person.fullName = function() {\n        return \"\" + (this.firstName()) + \" \" + (this.lastName()) + \" \" + (this.suffix());\n      };\n      return person;\n    };\n    describe(\"#attrObservable\", function() {\n      it('should allow for observing of attributes', function() {\n        var model;\n        model = Model({\n          name: \"Duder\"\n        });\n        model.attrObservable(\"name\");\n        model.name(\"Dudeman\");\n        return assert.equal(model.name(), \"Dudeman\");\n      });\n      return it('should bind properties to observable attributes', function() {\n        var model;\n        model = Model({\n          name: \"Duder\"\n        });\n        model.attrObservable(\"name\");\n        model.name(\"Dudeman\");\n        assert.equal(model.name(), \"Dudeman\");\n        return assert.equal(model.name(), model.I.name);\n      });\n    });\n    describe(\"#attrModel\", function() {\n      it(\"should be a model instance\", function() {\n        var model;\n        model = Model({\n          person: {\n            firstName: \"Duder\",\n            lastName: \"Mannington\",\n            suffix: \"Jr.\"\n          }\n        });\n        model.attrModel(\"person\", Person);\n        return assert.equal(model.person().fullName(), \"Duder Mannington Jr.\");\n      });\n      it(\"should allow setting the associated model\", function() {\n        var model, otherPerson;\n        model = Model({\n          person: {\n            firstName: \"Duder\",\n            lastName: \"Mannington\",\n            suffix: \"Jr.\"\n          }\n        });\n        model.attrModel(\"person\", Person);\n        otherPerson = Person({\n          firstName: \"Mr.\",\n          lastName: \"Man\"\n        });\n        model.person(otherPerson);\n        return assert.equal(model.person().firstName(), \"Mr.\");\n      });\n      return it(\"shouldn't update the instance properties after it's been replaced\", function() {\n        var duder, model, otherPerson;\n        model = Model({\n          person: {\n            firstName: \"Duder\",\n            lastName: \"Mannington\",\n            suffix: \"Jr.\"\n          }\n        });\n        model.attrModel(\"person\", Person);\n        duder = model.person();\n        otherPerson = Person({\n          firstName: \"Mr.\",\n          lastName: \"Man\"\n        });\n        model.person(otherPerson);\n        duder.firstName(\"Joe\");\n        assert.equal(duder.I.firstName, \"Joe\");\n        return assert.equal(model.I.person.firstName, \"Mr.\");\n      });\n    });\n    describe(\"#attrModels\", function() {\n      it(\"should have an array of model instances\", function() {\n        var model;\n        model = Model({\n          people: [\n            {\n              firstName: \"Duder\",\n              lastName: \"Mannington\",\n              suffix: \"Jr.\"\n            }, {\n              firstName: \"Mr.\",\n              lastName: \"Mannington\",\n              suffix: \"Sr.\"\n            }\n          ]\n        });\n        model.attrModels(\"people\", Person);\n        return assert.equal(model.people()[0].fullName(), \"Duder Mannington Jr.\");\n      });\n      it(\"should track pushes\", function() {\n        var model;\n        model = Model({\n          people: [\n            {\n              firstName: \"Duder\",\n              lastName: \"Mannington\",\n              suffix: \"Jr.\"\n            }, {\n              firstName: \"Mr.\",\n              lastName: \"Mannington\",\n              suffix: \"Sr.\"\n            }\n          ]\n        });\n        model.attrModels(\"people\", Person);\n        model.people.push(Person({\n          firstName: \"JoJo\",\n          lastName: \"Loco\"\n        }));\n        assert.equal(model.people().length, 3);\n        return assert.equal(model.I.people.length, 3);\n      });\n      return it(\"should track pops\", function() {\n        var model;\n        model = Model({\n          people: [\n            {\n              firstName: \"Duder\",\n              lastName: \"Mannington\",\n              suffix: \"Jr.\"\n            }, {\n              firstName: \"Mr.\",\n              lastName: \"Mannington\",\n              suffix: \"Sr.\"\n            }\n          ]\n        });\n        model.attrModels(\"people\", Person);\n        model.people.pop();\n        assert.equal(model.people().length, 1);\n        return assert.equal(model.I.people.length, 1);\n      });\n    });\n    describe(\"#toJSON\", function() {\n      return it(\"should return an object appropriate for JSON serialization\", function() {\n        var model;\n        model = Model({\n          test: true\n        });\n        return assert(model.toJSON().test);\n      });\n    });\n    return describe(\"#observeAll\", function() {\n      it(\"should observe all attributes of a simple model\");\n      (function() {\n        var model;\n        model = Model({\n          test: true,\n          yolo: \"4life\"\n        });\n        model.observeAll();\n        assert(model.test());\n        return assert.equal(model.yolo(), \"4life\");\n      });\n      return it(\"should camel case underscored names\");\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.1",
      "entryPoint": "README",
      "repository": {
        "id": 17256636,
        "name": "compositions",
        "full_name": "distri/compositions",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/compositions",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/distri/compositions",
        "forks_url": "https://api.github.com/repos/distri/compositions/forks",
        "keys_url": "https://api.github.com/repos/distri/compositions/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/compositions/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/compositions/teams",
        "hooks_url": "https://api.github.com/repos/distri/compositions/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/compositions/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/compositions/events",
        "assignees_url": "https://api.github.com/repos/distri/compositions/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/compositions/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/compositions/tags",
        "blobs_url": "https://api.github.com/repos/distri/compositions/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/compositions/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/compositions/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/compositions/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/compositions/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/compositions/languages",
        "stargazers_url": "https://api.github.com/repos/distri/compositions/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/compositions/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/compositions/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/compositions/subscription",
        "commits_url": "https://api.github.com/repos/distri/compositions/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/compositions/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/compositions/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/compositions/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/compositions/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/compositions/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/compositions/merges",
        "archive_url": "https://api.github.com/repos/distri/compositions/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/compositions/downloads",
        "issues_url": "https://api.github.com/repos/distri/compositions/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/compositions/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/compositions/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/compositions/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/compositions/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/compositions/releases{/id}",
        "created_at": "2014-02-27T17:00:47Z",
        "updated_at": "2014-02-27T17:16:50Z",
        "pushed_at": "2014-02-27T17:16:49Z",
        "git_url": "git://github.com/distri/compositions.git",
        "ssh_url": "git@github.com:distri/compositions.git",
        "clone_url": "https://github.com/distri/compositions.git",
        "svn_url": "https://github.com/distri/compositions",
        "homepage": null,
        "size": 140,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.1.1",
        "publishBranch": "gh-pages"
      },
      "dependencies": {
        "core": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "core\n====\n\nAn object extension system.\n",
              "type": "blob"
            },
            "core.coffee.md": {
              "path": "core.coffee.md",
              "mode": "100644",
              "content": "Core\n====\n\nThe Core module is used to add extended functionality to objects without\nextending `Object.prototype` directly.\n\n    Core = (I={}, self={}) ->\n      extend self,\n\nExternal access to instance variables. Use of this property should be avoided\nin general, but can come in handy from time to time.\n\n>     #! example\n>     I =\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject = Core(I)\n>\n>     [myObject.I.r, myObject.I.g, myObject.I.b]\n\n        I: I\n\nGenerates a public jQuery style getter / setter method for each `String` argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrAccessor \"r\", \"g\", \"b\"\n>\n>     myObject.r(254)\n\n        attrAccessor: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = (newValue) ->\n              if arguments.length > 0\n                I[attrName] = newValue\n\n                return self\n              else\n                I[attrName]\n\n          return self\n\nGenerates a public jQuery style getter method for each String argument.\n\n>     #! example\n>     myObject = Core\n>       r: 255\n>       g: 0\n>       b: 100\n>\n>     myObject.attrReader \"r\", \"g\", \"b\"\n>\n>     [myObject.r(), myObject.g(), myObject.b()]\n\n        attrReader: (attrNames...) ->\n          attrNames.forEach (attrName) ->\n            self[attrName] = ->\n              I[attrName]\n\n          return self\n\nExtends this object with methods from the passed in object. A shortcut for Object.extend(self, methods)\n\n>     I =\n>       x: 30\n>       y: 40\n>       maxSpeed: 5\n>\n>     # we are using extend to give player\n>     # additional methods that Core doesn't have\n>     player = Core(I).extend\n>       increaseSpeed: ->\n>         I.maxSpeed += 1\n>\n>     player.increaseSpeed()\n\n        extend: (objects...) ->\n          extend self, objects...\n\nIncludes a module in this object. A module is a constructor that takes two parameters, `I` and `self`\n\n>     myObject = Core()\n>     myObject.include(Bindable)\n\n>     # now you can bind handlers to functions\n>     myObject.bind \"someEvent\", ->\n>       alert(\"wow. that was easy.\")\n\n        include: (modules...) ->\n          for Module in modules\n            Module(I, self)\n\n          return self\n\n      return self\n\nHelpers\n-------\n\nExtend an object with the properties of other objects.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nExport\n\n    module.exports = Core\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"core\"\nversion: \"0.6.0\"\n",
              "type": "blob"
            },
            "test/core.coffee": {
              "path": "test/core.coffee",
              "mode": "100644",
              "content": "Core = require \"../core\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Core\", ->\n\n  test \"#extend\", ->\n    o = Core()\n  \n    o.extend\n      test: \"jawsome\"\n  \n    equals o.test, \"jawsome\"\n  \n  test \"#attrAccessor\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrAccessor(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), o\n    equals o.test(), \"new_val\"\n  \n  test \"#attrReader\", ->\n    o = Core\n      test: \"my_val\"\n  \n    o.attrReader(\"test\")\n  \n    equals o.test(), \"my_val\"\n    equals o.test(\"new_val\"), \"my_val\"\n    equals o.test(), \"my_val\"\n  \n  test \"#include\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    ret = o.include M\n  \n    equals ret, o, \"Should return self\"\n  \n    equals o.test(), \"my_val\"\n    equals o.test2, \"cool\"\n  \n  test \"#include multiple\", ->\n    o = Core\n      test: \"my_val\"\n  \n    M = (I, self) ->\n      self.attrReader \"test\"\n  \n      self.extend\n        test2: \"cool\"\n  \n    M2 = (I, self) ->\n      self.extend\n        test2: \"coolio\"\n  \n    o.include M, M2\n  \n    equals o.test2, \"coolio\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "core": {
              "path": "core",
              "content": "(function() {\n  var Core, extend,\n    __slice = [].slice;\n\n  Core = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    extend(self, {\n      I: I,\n      attrAccessor: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function(newValue) {\n            if (arguments.length > 0) {\n              I[attrName] = newValue;\n              return self;\n            } else {\n              return I[attrName];\n            }\n          };\n        });\n        return self;\n      },\n      attrReader: function() {\n        var attrNames;\n        attrNames = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        attrNames.forEach(function(attrName) {\n          return self[attrName] = function() {\n            return I[attrName];\n          };\n        });\n        return self;\n      },\n      extend: function() {\n        var objects;\n        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return extend.apply(null, [self].concat(__slice.call(objects)));\n      },\n      include: function() {\n        var Module, modules, _i, _len;\n        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        for (_i = 0, _len = modules.length; _i < _len; _i++) {\n          Module = modules[_i];\n          Module(I, self);\n        }\n        return self;\n      }\n    });\n    return self;\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  module.exports = Core;\n\n}).call(this);\n\n//# sourceURL=core.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"core\",\"version\":\"0.6.0\"};",
              "type": "blob"
            },
            "test/core": {
              "path": "test/core",
              "content": "(function() {\n  var Core, equals, ok, test;\n\n  Core = require(\"../core\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Core\", function() {\n    test(\"#extend\", function() {\n      var o;\n      o = Core();\n      o.extend({\n        test: \"jawsome\"\n      });\n      return equals(o.test, \"jawsome\");\n    });\n    test(\"#attrAccessor\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrAccessor(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), o);\n      return equals(o.test(), \"new_val\");\n    });\n    test(\"#attrReader\", function() {\n      var o;\n      o = Core({\n        test: \"my_val\"\n      });\n      o.attrReader(\"test\");\n      equals(o.test(), \"my_val\");\n      equals(o.test(\"new_val\"), \"my_val\");\n      return equals(o.test(), \"my_val\");\n    });\n    test(\"#include\", function() {\n      var M, o, ret;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      ret = o.include(M);\n      equals(ret, o, \"Should return self\");\n      equals(o.test(), \"my_val\");\n      return equals(o.test2, \"cool\");\n    });\n    return test(\"#include multiple\", function() {\n      var M, M2, o;\n      o = Core({\n        test: \"my_val\"\n      });\n      M = function(I, self) {\n        self.attrReader(\"test\");\n        return self.extend({\n          test2: \"cool\"\n        });\n      };\n      M2 = function(I, self) {\n        return self.extend({\n          test2: \"coolio\"\n        });\n      };\n      o.include(M, M2);\n      return equals(o.test2, \"coolio\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/core.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.6.0",
          "entryPoint": "core",
          "repository": {
            "id": 13567517,
            "name": "core",
            "full_name": "distri/core",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/core",
            "description": "An object extension system.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/core",
            "forks_url": "https://api.github.com/repos/distri/core/forks",
            "keys_url": "https://api.github.com/repos/distri/core/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/core/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/core/teams",
            "hooks_url": "https://api.github.com/repos/distri/core/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/core/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/core/events",
            "assignees_url": "https://api.github.com/repos/distri/core/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/core/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/core/tags",
            "blobs_url": "https://api.github.com/repos/distri/core/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/core/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/core/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/core/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/core/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/core/languages",
            "stargazers_url": "https://api.github.com/repos/distri/core/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/core/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/core/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/core/subscription",
            "commits_url": "https://api.github.com/repos/distri/core/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/core/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/core/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/core/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/core/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/core/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/core/merges",
            "archive_url": "https://api.github.com/repos/distri/core/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/core/downloads",
            "issues_url": "https://api.github.com/repos/distri/core/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/core/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/core/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/core/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/core/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/core/releases{/id}",
            "created_at": "2013-10-14T17:04:33Z",
            "updated_at": "2013-12-24T00:49:21Z",
            "pushed_at": "2013-10-14T23:49:11Z",
            "git_url": "git://github.com/distri/core.git",
            "ssh_url": "git@github.com:distri/core.git",
            "clone_url": "https://github.com/distri/core.git",
            "svn_url": "https://github.com/distri/core",
            "homepage": null,
            "size": 592,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.6.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "observable": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "observable\n==========\n",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "Observable\n==========\n\n`Observable` allows for observing arrays, functions, and objects.\n\nFunction dependencies are automagically observed.\n\nStandard array methods are proxied through to the underlying array.\n\n    Observable = (value) ->\n\nReturn the object if it is already an observable object.\n\n      return value if typeof value?.observe is \"function\"\n\nMaintain a set of listeners to observe changes and provide a helper to notify each observer.\n\n      listeners = []\n\n      notify = (newValue) ->\n        listeners.forEach (listener) ->\n          listener(newValue)\n\nOur observable function is stored as a reference to `self`.\n\nIf `value` is a function compute dependencies and listen to observables that it depends on.\n\n      if typeof value is 'function'\n        fn = value\n        self = ->\n          # Automagic dependency observation\n          magicDependency(self)\n\n          return value\n\n        self.observe = (listener) ->\n          listeners.push listener\n\n        changed = ->\n          value = fn()\n          notify(value)\n\n        value = computeDependencies(fn, changed)\n\n      else\n\nWhen called with zero arguments it is treated as a getter. When called with one argument it is treated as a setter.\n\nChanges to the value will trigger notifications.\n\nThe value is always returned.\n\n        self = (newValue) ->\n          if arguments.length > 0\n            if value != newValue\n              value = newValue\n\n              notify(newValue)\n          else\n            # Automagic dependency observation\n            magicDependency(self)\n\n          return value\n\nAdd a listener for when this object changes.\n\n        self.observe = (listener) ->\n          listeners.push listener\n\nThis `each` iterator is similar to [the Maybe monad](http://en.wikipedia.org/wiki/Monad_&#40;functional_programming&#41;#The_Maybe_monad) in that our observable may contain a single value or nothing at all.\n\n      self.each = (args...) ->\n        if value?\n          [value].forEach(args...)\n\nIf the value is an array then proxy array methods and add notifications to mutation events.\n\n      if Array.isArray(value)\n        [\n          \"concat\"\n          \"every\"\n          \"filter\"\n          \"forEach\"\n          \"indexOf\"\n          \"join\"\n          \"lastIndexOf\"\n          \"map\"\n          \"reduce\"\n          \"reduceRight\"\n          \"slice\"\n          \"some\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            value[method](args...)\n\n        [\n          \"pop\"\n          \"push\"\n          \"reverse\"\n          \"shift\"\n          \"splice\"\n          \"sort\"\n          \"unshift\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            notifyReturning value[method](args...)\n\n        notifyReturning = (returnValue) ->\n          notify(value)\n\n          return returnValue\n\nAdd some extra helpful methods to array observables.\n\n        extend self,\n          each: (args...) ->\n            self.forEach(args...)\n\n            return self\n\nRemove an element from the array and notify observers of changes.\n\n          remove: (object) ->\n            index = value.indexOf(object)\n\n            if index >= 0\n              notifyReturning value.splice(index, 1)[0]\n\n          get: (index) ->\n            value[index]\n\n          first: ->\n            value[0]\n\n          last: ->\n            value[value.length-1]\n\n      self.stopObserving = (fn) ->\n        remove listeners, fn\n\n      return self\n\nExport `Observable`\n\n    module.exports = Observable\n\nAppendix\n--------\n\nThe extend method adds one objects properties to another.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nSuper hax for computing dependencies. This needs to be a shared global so that\ndifferent bundled versions of observable libraries can interoperate.\n\n    global.OBSERVABLE_ROOT_HACK = undefined\n\n    magicDependency = (self) ->\n      if base = global.OBSERVABLE_ROOT_HACK\n        self.observe base\n\n    withBase = (root, fn) ->\n      global.OBSERVABLE_ROOT_HACK = root\n      value = fn()\n      global.OBSERVABLE_ROOT_HACK = undefined\n\n      return value\n\n    base = ->\n      global.OBSERVABLE_ROOT_HACK\n\nAutomagically compute dependencies.\n\n    computeDependencies = (fn, root) ->\n      withBase root, ->\n        fn()\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.1.1\"\n",
              "type": "blob"
            },
            "test/observable.coffee": {
              "path": "test/observable.coffee",
              "mode": "100644",
              "content": "Observable = require \"../main\"\n\ndescribe 'Observable', ->\n  it 'should create an observable for an object', ->\n    n = 5\n\n    observable = Observable(n)\n\n    assert.equal(observable(), n)\n\n  it 'should fire events when setting', ->\n    string = \"yolo\"\n\n    observable = Observable(string)\n    observable.observe (newValue) ->\n      assert.equal newValue, \"4life\"\n\n    observable(\"4life\")\n\n  it 'should be idempotent', ->\n    o = Observable(5)\n\n    assert.equal o, Observable(o)\n\n  describe \"#each\", ->\n    it \"should be invoked once if there is an observable\", ->\n      o = Observable(5)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n        assert.equal value, 5\n\n      assert.equal called, 1\n\n    it \"should not be invoked if observable is null\", ->\n      o = Observable(null)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n\n      assert.equal called, 0\n\n  it \"should allow for stopping observation\", ->\n    observable = Observable(\"string\")\n\n    called = 0\n    fn = (newValue) ->\n      called += 1\n      assert.equal newValue, \"4life\"\n\n    observable.observe fn\n\n    observable(\"4life\")\n\n    observable.stopObserving fn\n\n    observable(\"wat\")\n\n    assert.equal called, 1\n\ndescribe \"Observable Array\", ->\n  it \"should proxy array methods\", ->\n    o = Observable [5]\n\n    o.map (n) ->\n      assert.equal n, 5\n\n  it \"should notify on mutation methods\", (done) ->\n    o = Observable []\n\n    o.observe (newValue) ->\n      assert.equal newValue[0], 1\n\n    o.push 1\n\n    done()\n\n  it \"should have an each method\", ->\n    o = Observable []\n\n    assert o.each\n\n  it \"#get\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.get(2), 2\n\n  it \"#first\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.first(), 0\n\n  it \"#last\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.last(), 3\n\n  it \"#remove\", (done) ->\n    o = Observable [0, 1, 2, 3]\n\n    o.observe (newValue) ->\n      assert.equal newValue.length, 3\n      setTimeout ->\n        done()\n      , 0\n\n    assert.equal o.remove(2), 2\n\n  # TODO: This looks like it might be impossible\n  it \"should proxy the length property\"\n\ndescribe \"Observable functions\", ->\n  it \"should compute dependencies\", (done) ->\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n      done()\n\n    lastName \"Bro\"\n\n  it \"should allow double nesting\", (done) ->\n    bottom = Observable \"rad\"\n    middle = Observable ->\n      bottom()\n    top = Observable ->\n      middle()\n\n    top.observe (newValue) ->\n      assert.equal newValue, \"wat\"\n      assert.equal top(), newValue\n      assert.equal middle(), newValue\n\n      done()\n\n    bottom(\"wat\")\n\n  it \"should have an each method\", ->\n    o = Observable ->\n\n    assert o.each\n\n  it \"should not invoke when returning undefined\", ->\n    o = Observable ->\n\n    o.each ->\n      assert false\n\n  it \"should invoke when returning any defined value\", (done) ->\n    o = Observable -> 5\n\n    o.each (n) ->\n      assert.equal n, 5\n      done()\n\n  it \"should work on an array dependency\", ->\n    oA = Observable [1, 2, 3]\n\n    o = Observable ->\n      oA()[0]\n\n    last = Observable ->\n      oA()[oA().length-1]\n\n    assert.equal o(), 1\n\n    oA.unshift 0\n\n    assert.equal o(), 0\n\n    oA.push 4\n\n    assert.equal last(), 4, \"Last should be 4\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var Observable, base, computeDependencies, extend, magicDependency, remove, withBase,\n    __slice = [].slice;\n\n  Observable = function(value) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return listeners.forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      self.observe = function(listener) {\n        return listeners.push(listener);\n      };\n      changed = function() {\n        value = fn();\n        return notify(value);\n      };\n      value = computeDependencies(fn, changed);\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n      self.observe = function(listener) {\n        return listeners.push(listener);\n      };\n    }\n    self.each = function() {\n      var args, _ref;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      if (value != null) {\n        return (_ref = [value]).forEach.apply(_ref, args);\n      }\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          self.forEach.apply(self, args);\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          return value[index];\n        },\n        first: function() {\n          return value[0];\n        },\n        last: function() {\n          return value[value.length - 1];\n        }\n      });\n    }\n    self.stopObserving = function(fn) {\n      return remove(listeners, fn);\n    };\n    return self;\n  };\n\n  module.exports = Observable;\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = void 0;\n\n  magicDependency = function(self) {\n    var base;\n    if (base = global.OBSERVABLE_ROOT_HACK) {\n      return self.observe(base);\n    }\n  };\n\n  withBase = function(root, fn) {\n    var value;\n    global.OBSERVABLE_ROOT_HACK = root;\n    value = fn();\n    global.OBSERVABLE_ROOT_HACK = void 0;\n    return value;\n  };\n\n  base = function() {\n    return global.OBSERVABLE_ROOT_HACK;\n  };\n\n  computeDependencies = function(fn, root) {\n    return withBase(root, function() {\n      return fn();\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.1.1\"};",
              "type": "blob"
            },
            "test/observable": {
              "path": "test/observable",
              "content": "(function() {\n  var Observable;\n\n  Observable = require(\"../main\");\n\n  describe('Observable', function() {\n    it('should create an observable for an object', function() {\n      var n, observable;\n      n = 5;\n      observable = Observable(n);\n      return assert.equal(observable(), n);\n    });\n    it('should fire events when setting', function() {\n      var observable, string;\n      string = \"yolo\";\n      observable = Observable(string);\n      observable.observe(function(newValue) {\n        return assert.equal(newValue, \"4life\");\n      });\n      return observable(\"4life\");\n    });\n    it('should be idempotent', function() {\n      var o;\n      o = Observable(5);\n      return assert.equal(o, Observable(o));\n    });\n    describe(\"#each\", function() {\n      it(\"should be invoked once if there is an observable\", function() {\n        var called, o;\n        o = Observable(5);\n        called = 0;\n        o.each(function(value) {\n          called += 1;\n          return assert.equal(value, 5);\n        });\n        return assert.equal(called, 1);\n      });\n      return it(\"should not be invoked if observable is null\", function() {\n        var called, o;\n        o = Observable(null);\n        called = 0;\n        o.each(function(value) {\n          return called += 1;\n        });\n        return assert.equal(called, 0);\n      });\n    });\n    return it(\"should allow for stopping observation\", function() {\n      var called, fn, observable;\n      observable = Observable(\"string\");\n      called = 0;\n      fn = function(newValue) {\n        called += 1;\n        return assert.equal(newValue, \"4life\");\n      };\n      observable.observe(fn);\n      observable(\"4life\");\n      observable.stopObserving(fn);\n      observable(\"wat\");\n      return assert.equal(called, 1);\n    });\n  });\n\n  describe(\"Observable Array\", function() {\n    it(\"should proxy array methods\", function() {\n      var o;\n      o = Observable([5]);\n      return o.map(function(n) {\n        return assert.equal(n, 5);\n      });\n    });\n    it(\"should notify on mutation methods\", function(done) {\n      var o;\n      o = Observable([]);\n      o.observe(function(newValue) {\n        return assert.equal(newValue[0], 1);\n      });\n      o.push(1);\n      return done();\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable([]);\n      return assert(o.each);\n    });\n    it(\"#get\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.get(2), 2);\n    });\n    it(\"#first\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.first(), 0);\n    });\n    it(\"#last\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.last(), 3);\n    });\n    it(\"#remove\", function(done) {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      o.observe(function(newValue) {\n        assert.equal(newValue.length, 3);\n        return setTimeout(function() {\n          return done();\n        }, 0);\n      });\n      return assert.equal(o.remove(2), 2);\n    });\n    return it(\"should proxy the length property\");\n  });\n\n  describe(\"Observable functions\", function() {\n    it(\"should compute dependencies\", function(done) {\n      var firstName, lastName, o;\n      firstName = Observable(\"Duder\");\n      lastName = Observable(\"Man\");\n      o = Observable(function() {\n        return \"\" + (firstName()) + \" \" + (lastName());\n      });\n      o.observe(function(newValue) {\n        assert.equal(newValue, \"Duder Bro\");\n        return done();\n      });\n      return lastName(\"Bro\");\n    });\n    it(\"should allow double nesting\", function(done) {\n      var bottom, middle, top;\n      bottom = Observable(\"rad\");\n      middle = Observable(function() {\n        return bottom();\n      });\n      top = Observable(function() {\n        return middle();\n      });\n      top.observe(function(newValue) {\n        assert.equal(newValue, \"wat\");\n        assert.equal(top(), newValue);\n        assert.equal(middle(), newValue);\n        return done();\n      });\n      return bottom(\"wat\");\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable(function() {});\n      return assert(o.each);\n    });\n    it(\"should not invoke when returning undefined\", function() {\n      var o;\n      o = Observable(function() {});\n      return o.each(function() {\n        return assert(false);\n      });\n    });\n    it(\"should invoke when returning any defined value\", function(done) {\n      var o;\n      o = Observable(function() {\n        return 5;\n      });\n      return o.each(function(n) {\n        assert.equal(n, 5);\n        return done();\n      });\n    });\n    return it(\"should work on an array dependency\", function() {\n      var last, o, oA;\n      oA = Observable([1, 2, 3]);\n      o = Observable(function() {\n        return oA()[0];\n      });\n      last = Observable(function() {\n        return oA()[oA().length - 1];\n      });\n      assert.equal(o(), 1);\n      oA.unshift(0);\n      assert.equal(o(), 0);\n      oA.push(4);\n      return assert.equal(last(), 4, \"Last should be 4\");\n    });\n  });\n\n}).call(this);\n",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.1.1",
          "entryPoint": "main",
          "repository": {
            "id": 17119562,
            "name": "observable",
            "full_name": "distri/observable",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
              "gravatar_id": "192f3f168409e79c42107f081139d9f3",
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/observable",
            "description": "",
            "fork": false,
            "url": "https://api.github.com/repos/distri/observable",
            "forks_url": "https://api.github.com/repos/distri/observable/forks",
            "keys_url": "https://api.github.com/repos/distri/observable/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/observable/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/observable/teams",
            "hooks_url": "https://api.github.com/repos/distri/observable/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/observable/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/observable/events",
            "assignees_url": "https://api.github.com/repos/distri/observable/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/observable/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/observable/tags",
            "blobs_url": "https://api.github.com/repos/distri/observable/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/observable/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/observable/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/observable/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/observable/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/observable/languages",
            "stargazers_url": "https://api.github.com/repos/distri/observable/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/observable/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/observable/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/observable/subscription",
            "commits_url": "https://api.github.com/repos/distri/observable/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/observable/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/observable/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/observable/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/observable/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/observable/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/observable/merges",
            "archive_url": "https://api.github.com/repos/distri/observable/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/observable/downloads",
            "issues_url": "https://api.github.com/repos/distri/observable/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/observable/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/observable/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/observable/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/observable/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/observable/releases{/id}",
            "created_at": "2014-02-23T23:17:52Z",
            "updated_at": "2014-04-02T00:41:29Z",
            "pushed_at": "2014-04-02T00:41:31Z",
            "git_url": "git://github.com/distri/observable.git",
            "ssh_url": "git@github.com:distri/observable.git",
            "clone_url": "https://github.com/distri/observable.git",
            "svn_url": "https://github.com/distri/observable",
            "homepage": null,
            "size": 164,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
              "gravatar_id": "192f3f168409e79c42107f081139d9f3",
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 2,
            "branch": "v0.1.1",
            "publishBranch": "gh-pages"
          },
          "dependencies": {}
        }
      }
    },
    "eval": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "eval\n====\n\nSuperSystem Eval Component\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Eval\n====\n\nAllow for evaluation within the context of a SuperSystem component.\n\nProvides `self.eval` which will evaluate JS code and return the result.\n\n    module.exports = (I={}, self={}) ->\n      self.eval = (code) ->\n        eval code\n\n      return self\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.1.0\"\n",
          "type": "blob"
        },
        "test/eval.coffee": {
          "path": "test/eval.coffee",
          "mode": "100644",
          "content": "Eval = require \"../main\"\n\ndescribe \"eval\", ->\n  it \"should evaluate code within the context of the component\", ->\n    e = Eval()\n    \n    I = e.eval \"I\"\n    e.eval \"I.a = 0\"\n    \n    assert.equal I.a, 0\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    self[\"eval\"] = function(code) {\n      return eval(code);\n    };\n    return self;\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.0\"};",
          "type": "blob"
        },
        "test/eval": {
          "path": "test/eval",
          "content": "(function() {\n  var Eval;\n\n  Eval = require(\"../main\");\n\n  describe(\"eval\", function() {\n    return it(\"should evaluate code within the context of the component\", function() {\n      var I, e;\n      e = Eval();\n      I = e[\"eval\"](\"I\");\n      e[\"eval\"](\"I.a = 0\");\n      return assert.equal(I.a, 0);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/eval.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.0",
      "entryPoint": "main",
      "repository": {
        "id": 15091435,
        "name": "eval",
        "full_name": "distri/eval",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/eval",
        "description": "SuperSystem Eval Component",
        "fork": false,
        "url": "https://api.github.com/repos/distri/eval",
        "forks_url": "https://api.github.com/repos/distri/eval/forks",
        "keys_url": "https://api.github.com/repos/distri/eval/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/eval/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/eval/teams",
        "hooks_url": "https://api.github.com/repos/distri/eval/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/eval/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/eval/events",
        "assignees_url": "https://api.github.com/repos/distri/eval/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/eval/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/eval/tags",
        "blobs_url": "https://api.github.com/repos/distri/eval/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/eval/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/eval/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/eval/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/eval/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/eval/languages",
        "stargazers_url": "https://api.github.com/repos/distri/eval/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/eval/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/eval/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/eval/subscription",
        "commits_url": "https://api.github.com/repos/distri/eval/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/eval/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/eval/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/eval/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/eval/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/eval/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/eval/merges",
        "archive_url": "https://api.github.com/repos/distri/eval/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/eval/downloads",
        "issues_url": "https://api.github.com/repos/distri/eval/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/eval/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/eval/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/eval/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/eval/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/eval/releases{/id}",
        "created_at": "2013-12-10T22:35:17Z",
        "updated_at": "2013-12-10T22:35:40Z",
        "pushed_at": "2013-12-10T22:35:18Z",
        "git_url": "git://github.com/distri/eval.git",
        "ssh_url": "git@github.com:distri/eval.git",
        "clone_url": "https://github.com/distri/eval.git",
        "svn_url": "https://github.com/distri/eval",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.1.0",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "facebook": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "facebook\n========\n\nFacebook API integration for distri apps.\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Facebook\n========\n\n    module.exports =\n      init: (appId, options={}, callback) ->\n        options.status ?= true\n        options.xfbml ?= true\n        options.appId = appId\n\n        window.fbAsyncInit = ->\n          # init the FB JS SDK\n          FB.init options\n\n          # Additional initialization code such as adding Event Listeners goes here\n          callback?(FB)\n\n        # Attach the fb-root element to the body\n        fbRoot = document.createElement \"div\"\n        fbRoot.id = \"fb-root\"\n        document.body.appendChild(fbRoot)\n\n        # Load the SDK asynchronously\n        do (d=document, s='script', id='facebook-jssdk', js=undefined) ->\n           fjs = d.getElementsByTagName(s)[0]\n           return if d.getElementById(id)\n           js = d.createElement(s)\n           js.id = id\n           js.src = \"//connect.facebook.net/en_US/all.js\"\n           fjs.parentNode.insertBefore(js, fjs)\n\nTODO: Test this out\n\nPass an array of scope permissions and a function to call once those permissions\nhave been granted.\n\n      requiringPermissions: (scopes, fn) ->\n        wrapped = (fn) ->\n          ({authResponse}) ->\n            fn(authResponse)\n\n        FB.getLoginStatus ({status, authResponse}) ->\n          if status is 'connected'\n            FB.api '/me/permissions', ({data:[permissions]}) ->\n\n              permissionsToPrompt = scopes.filter (permission) ->\n                !permissions[permission]\n\n              if permissionsToPrompt.length\n                FB.login wrapped(fn),\n                  scope: permissionsToPrompt.join(',')\n              else\n                fn(authResponse)\n          else if status is 'not_authorized'\n            FB.login wrapped(fn),\n              scope: scope\n          else\n            FB.login wrapped(fn),\n              scope: scope\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.1.1\"\n",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "mode": "100644",
          "content": "Facebook = require \"../main\"\n\nmakeLoginButton = ->\n  login = document.createElement \"fb:login-button\"\n  login.setAttribute \"show-faces\", \"true\"\n  login.setAttribute \"width\", \"200\"\n  login.setAttribute \"max-rows\", \"1\"\n\n  return login\n\n# Note, any xfbml inserted before we call the API is parsed, if any is inserted\n# later we'll need to call `FB.XFBML.parse()`\n# https://developers.facebook.com/docs/reference/javascript/FB.XFBML.parse/\ndocument.body.insertBefore(makeLoginButton())\n\nFacebook.init \"7570224823\", null, (FB) ->\n  Facebook.requiringPermissions [\"email\", \"user_photos\"], ->\n    console.log arguments\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = {\n    init: function(appId, options, callback) {\n      var fbRoot;\n      if (options == null) {\n        options = {};\n      }\n      if (options.status == null) {\n        options.status = true;\n      }\n      if (options.xfbml == null) {\n        options.xfbml = true;\n      }\n      options.appId = appId;\n      window.fbAsyncInit = function() {\n        FB.init(options);\n        return typeof callback === \"function\" ? callback(FB) : void 0;\n      };\n      fbRoot = document.createElement(\"div\");\n      fbRoot.id = \"fb-root\";\n      document.body.appendChild(fbRoot);\n      return (function(d, s, id, js) {\n        var fjs;\n        fjs = d.getElementsByTagName(s)[0];\n        if (d.getElementById(id)) {\n          return;\n        }\n        js = d.createElement(s);\n        js.id = id;\n        js.src = \"//connect.facebook.net/en_US/all.js\";\n        return fjs.parentNode.insertBefore(js, fjs);\n      })(document, 'script', 'facebook-jssdk', void 0);\n    },\n    requiringPermissions: function(scopes, fn) {\n      var wrapped;\n      wrapped = function(fn) {\n        return function(_arg) {\n          var authResponse;\n          authResponse = _arg.authResponse;\n          return fn(authResponse);\n        };\n      };\n      return FB.getLoginStatus(function(_arg) {\n        var authResponse, status;\n        status = _arg.status, authResponse = _arg.authResponse;\n        if (status === 'connected') {\n          return FB.api('/me/permissions', function(_arg1) {\n            var permissions, permissionsToPrompt;\n            permissions = _arg1.data[0];\n            permissionsToPrompt = scopes.filter(function(permission) {\n              return !permissions[permission];\n            });\n            if (permissionsToPrompt.length) {\n              return FB.login(wrapped(fn), {\n                scope: permissionsToPrompt.join(',')\n              });\n            } else {\n              return fn(authResponse);\n            }\n          });\n        } else if (status === 'not_authorized') {\n          return FB.login(wrapped(fn), {\n            scope: scope\n          });\n        } else {\n          return FB.login(wrapped(fn), {\n            scope: scope\n          });\n        }\n      });\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.1\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Facebook, makeLoginButton;\n\n  Facebook = require(\"../main\");\n\n  makeLoginButton = function() {\n    var login;\n    login = document.createElement(\"fb:login-button\");\n    login.setAttribute(\"show-faces\", \"true\");\n    login.setAttribute(\"width\", \"200\");\n    login.setAttribute(\"max-rows\", \"1\");\n    return login;\n  };\n\n  document.body.insertBefore(makeLoginButton());\n\n  Facebook.init(\"7570224823\", null, function(FB) {\n    return Facebook.requiringPermissions([\"email\", \"user_photos\"], function() {\n      return console.log(arguments);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.1",
      "entryPoint": "main",
      "repository": {
        "id": 14601350,
        "name": "facebook",
        "full_name": "distri/facebook",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/facebook",
        "description": "Facebook API integration for distri apps.",
        "fork": false,
        "url": "https://api.github.com/repos/distri/facebook",
        "forks_url": "https://api.github.com/repos/distri/facebook/forks",
        "keys_url": "https://api.github.com/repos/distri/facebook/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/facebook/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/facebook/teams",
        "hooks_url": "https://api.github.com/repos/distri/facebook/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/facebook/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/facebook/events",
        "assignees_url": "https://api.github.com/repos/distri/facebook/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/facebook/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/facebook/tags",
        "blobs_url": "https://api.github.com/repos/distri/facebook/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/facebook/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/facebook/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/facebook/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/facebook/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/facebook/languages",
        "stargazers_url": "https://api.github.com/repos/distri/facebook/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/facebook/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/facebook/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/facebook/subscription",
        "commits_url": "https://api.github.com/repos/distri/facebook/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/facebook/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/facebook/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/facebook/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/facebook/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/facebook/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/facebook/merges",
        "archive_url": "https://api.github.com/repos/distri/facebook/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/facebook/downloads",
        "issues_url": "https://api.github.com/repos/distri/facebook/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/facebook/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/facebook/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/facebook/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/facebook/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/facebook/releases{/id}",
        "created_at": "2013-11-21T22:02:00Z",
        "updated_at": "2013-11-24T03:57:53Z",
        "pushed_at": "2013-11-24T03:57:53Z",
        "git_url": "git://github.com/distri/facebook.git",
        "ssh_url": "git@github.com:distri/facebook.git",
        "clone_url": "https://github.com/distri/facebook.git",
        "svn_url": "https://github.com/distri/facebook",
        "homepage": null,
        "size": 896,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.1.1",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "grid-gen": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "grid-gen\n========\n\nGenerate a grid image programatically.\n",
          "type": "blob"
        },
        "grid.coffee.md": {
          "path": "grid.coffee.md",
          "mode": "100644",
          "content": "Grid Generator\n==============\n\n    Grid = ({width, height, guide, color}={}) ->\n      color ?= \"rgba(0, 0, 0, 0.3)\"\n      height ?= 32\n      width ?= 32\n      guide ?= 4\n\n      canvasWidth = width * guide\n      canvasHeight = height * guide\n\n      canvas = document.createElement(\"canvas\")\n      canvas.width = canvasWidth\n      canvas.height = canvasHeight\n\n      context = canvas.getContext(\"2d\")\n\n      context.fillStyle = color\n\n      [0...guide].forEach (i) ->\n        context.fillRect(i * width, 0, 1, canvasHeight)\n        context.fillRect(0, i * height, canvasWidth, 1)\n    \n      # Draw the strong line\n      context.fillRect(0, 0, 1, canvasHeight)\n      context.fillRect(0, 0, canvasWidth, 1)\n    \n      backgroundImage: ->\n        \"url(#{this.toDataURL()})\"\n    \n      toDataURL: ->\n        canvas.toDataURL(\"image/png\")\n\n    module.exports = Grid\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nentryPoint: \"grid\"\n",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "mode": "100644",
          "content": "Grid = require \"../grid\"\n\ndocument.body.style[\"background-image\"] = Grid().backgroundImage()\n",
          "type": "blob"
        }
      },
      "distribution": {
        "grid": {
          "path": "grid",
          "content": "(function() {\n  var Grid;\n\n  Grid = function(_arg) {\n    var canvas, canvasHeight, canvasWidth, color, context, guide, height, width, _i, _ref, _results;\n    _ref = _arg != null ? _arg : {}, width = _ref.width, height = _ref.height, guide = _ref.guide, color = _ref.color;\n    if (color == null) {\n      color = \"rgba(0, 0, 0, 0.3)\";\n    }\n    if (height == null) {\n      height = 32;\n    }\n    if (width == null) {\n      width = 32;\n    }\n    if (guide == null) {\n      guide = 4;\n    }\n    canvasWidth = width * guide;\n    canvasHeight = height * guide;\n    canvas = document.createElement(\"canvas\");\n    canvas.width = canvasWidth;\n    canvas.height = canvasHeight;\n    context = canvas.getContext(\"2d\");\n    context.fillStyle = color;\n    (function() {\n      _results = [];\n      for (var _i = 0; 0 <= guide ? _i < guide : _i > guide; 0 <= guide ? _i++ : _i--){ _results.push(_i); }\n      return _results;\n    }).apply(this).forEach(function(i) {\n      context.fillRect(i * width, 0, 1, canvasHeight);\n      return context.fillRect(0, i * height, canvasWidth, 1);\n    });\n    context.fillRect(0, 0, 1, canvasHeight);\n    context.fillRect(0, 0, canvasWidth, 1);\n    return {\n      backgroundImage: function() {\n        return \"url(\" + (this.toDataURL()) + \")\";\n      },\n      toDataURL: function() {\n        return canvas.toDataURL(\"image/png\");\n      }\n    };\n  };\n\n  module.exports = Grid;\n\n}).call(this);\n\n//# sourceURL=grid.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"grid\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Grid;\n\n  Grid = require(\"../grid\");\n\n  document.body.style[\"background-image\"] = Grid().backgroundImage();\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "grid",
      "repository": {
        "id": 13941148,
        "name": "grid-gen",
        "full_name": "distri/grid-gen",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/grid-gen",
        "description": "Generate a grid image programatically.",
        "fork": false,
        "url": "https://api.github.com/repos/distri/grid-gen",
        "forks_url": "https://api.github.com/repos/distri/grid-gen/forks",
        "keys_url": "https://api.github.com/repos/distri/grid-gen/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/grid-gen/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/grid-gen/teams",
        "hooks_url": "https://api.github.com/repos/distri/grid-gen/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/grid-gen/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/grid-gen/events",
        "assignees_url": "https://api.github.com/repos/distri/grid-gen/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/grid-gen/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/grid-gen/tags",
        "blobs_url": "https://api.github.com/repos/distri/grid-gen/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/grid-gen/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/grid-gen/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/grid-gen/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/grid-gen/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/grid-gen/languages",
        "stargazers_url": "https://api.github.com/repos/distri/grid-gen/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/grid-gen/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/grid-gen/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/grid-gen/subscription",
        "commits_url": "https://api.github.com/repos/distri/grid-gen/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/grid-gen/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/grid-gen/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/grid-gen/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/grid-gen/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/grid-gen/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/grid-gen/merges",
        "archive_url": "https://api.github.com/repos/distri/grid-gen/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/grid-gen/downloads",
        "issues_url": "https://api.github.com/repos/distri/grid-gen/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/grid-gen/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/grid-gen/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/grid-gen/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/grid-gen/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/grid-gen/releases{/id}",
        "created_at": "2013-10-28T23:06:21Z",
        "updated_at": "2013-11-29T20:55:43Z",
        "pushed_at": "2013-10-28T23:30:48Z",
        "git_url": "git://github.com/distri/grid-gen.git",
        "ssh_url": "git@github.com:distri/grid-gen.git",
        "clone_url": "https://github.com/distri/grid-gen.git",
        "svn_url": "https://github.com/distri/grid-gen",
        "homepage": null,
        "size": 260,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "hotkeys": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "hotkeys\n=======\n\nHotkeys module for editors\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Hotkeys\n=======\n\nHotkeys module for the editors.\n\n    module.exports = (I={}, self=Core(I)) ->\n      self.extend\n        addHotkey: (key, method) ->\n          $(document).bind \"keydown\", key, (event) ->\n            if typeof method is \"function\"\n              method\n                editor: self\n            else\n              self[method]()\n\n            event.preventDefault()\n\n      return self\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n  \"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"\n]\n",
          "type": "blob"
        },
        "test/hotkeys.coffee": {
          "path": "test/hotkeys.coffee",
          "mode": "100644",
          "content": "Hotkeys = require \"../main\"\n\ndescribe \"hotkeys\", ->\n  it \"should be hot\", (done) ->\n    hotkeys = Hotkeys()\n    \n    hotkeys.addHotkey \"a\", ->\n      done()\n\n    $(document).trigger $.Event \"keydown\",\n      which: 65 # a\n      keyCode: 65\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      addHotkey: function(key, method) {\n        return $(document).bind(\"keydown\", key, function(event) {\n          if (typeof method === \"function\") {\n            method({\n              editor: self\n            });\n          } else {\n            self[method]();\n          }\n          return event.preventDefault();\n        });\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\",\"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"]};",
          "type": "blob"
        },
        "test/hotkeys": {
          "path": "test/hotkeys",
          "content": "(function() {\n  var Hotkeys;\n\n  Hotkeys = require(\"../main\");\n\n  describe(\"hotkeys\", function() {\n    return it(\"should be hot\", function(done) {\n      var hotkeys;\n      hotkeys = Hotkeys();\n      hotkeys.addHotkey(\"a\", function() {\n        return done();\n      });\n      return $(document).trigger($.Event(\"keydown\", {\n        which: 65,\n        keyCode: 65\n      }));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/hotkeys.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "remoteDependencies": [
        "//code.jquery.com/jquery-1.10.1.min.js",
        "http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js"
      ],
      "repository": {
        "id": 14673639,
        "name": "hotkeys",
        "full_name": "distri/hotkeys",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/hotkeys",
        "description": "Hotkeys module for editors",
        "fork": false,
        "url": "https://api.github.com/repos/distri/hotkeys",
        "forks_url": "https://api.github.com/repos/distri/hotkeys/forks",
        "keys_url": "https://api.github.com/repos/distri/hotkeys/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/hotkeys/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/hotkeys/teams",
        "hooks_url": "https://api.github.com/repos/distri/hotkeys/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/hotkeys/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/hotkeys/events",
        "assignees_url": "https://api.github.com/repos/distri/hotkeys/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/hotkeys/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/hotkeys/tags",
        "blobs_url": "https://api.github.com/repos/distri/hotkeys/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/hotkeys/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/hotkeys/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/hotkeys/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/hotkeys/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/hotkeys/languages",
        "stargazers_url": "https://api.github.com/repos/distri/hotkeys/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/hotkeys/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/hotkeys/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/hotkeys/subscription",
        "commits_url": "https://api.github.com/repos/distri/hotkeys/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/hotkeys/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/hotkeys/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/hotkeys/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/hotkeys/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/hotkeys/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/hotkeys/merges",
        "archive_url": "https://api.github.com/repos/distri/hotkeys/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/hotkeys/downloads",
        "issues_url": "https://api.github.com/repos/distri/hotkeys/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/hotkeys/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/hotkeys/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/hotkeys/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/hotkeys/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/hotkeys/releases{/id}",
        "created_at": "2013-11-25T01:55:42Z",
        "updated_at": "2013-11-25T02:03:57Z",
        "pushed_at": "2013-11-25T02:03:56Z",
        "git_url": "git://github.com/distri/hotkeys.git",
        "ssh_url": "git@github.com:distri/hotkeys.git",
        "clone_url": "https://github.com/distri/hotkeys.git",
        "svn_url": "https://github.com/distri/hotkeys",
        "homepage": null,
        "size": 264,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "jquery-utils": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "jquery-utils\n============\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "    require \"hotkeys\"\n    require \"image-reader\"\n    require \"./take_class\"\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n]\ndependencies:\n  hotkeys: \"distri/jquery-hotkeys:v0.9.2\"\n  \"image-reader\": \"distri/jquery-image_reader:v0.2.0\"\n",
          "type": "blob"
        },
        "take_class.coffee.md": {
          "path": "take_class.coffee.md",
          "mode": "100644",
          "content": "Take Class\n==========\n\nTake the named class from all the sibling elements. Perfect for something like\nradio buttons.\n\n    (($) ->\n      $.fn.takeClass = (name) ->\n        @addClass(name).siblings().removeClass(name)\n\n        return this\n    )(jQuery)\n",
          "type": "blob"
        },
        "test/image_reader.coffee": {
          "path": "test/image_reader.coffee",
          "mode": "100644",
          "content": "require \"../main\"\n\ndescribe \"jQuery#pasteImageReader\", ->\n  it \"should exist\", ->\n    assert $.fn.pasteImageReader\n\ndescribe \"jQuery#dropImageReader\", ->\n  it \"should exist\", ->\n    assert $.fn.dropImageReader\n",
          "type": "blob"
        },
        "test/take_class.coffee": {
          "path": "test/take_class.coffee",
          "mode": "100644",
          "content": "require \"../main\"\n\ndescribe \"jQuery#takeClass\", ->\n  it \"should exist\", ->\n    assert $.fn.takeClass\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  require(\"hotkeys\");\n\n  require(\"image-reader\");\n\n  require(\"./take_class\");\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\"],\"dependencies\":{\"hotkeys\":\"distri/jquery-hotkeys:v0.9.2\",\"image-reader\":\"distri/jquery-image_reader:v0.2.0\"}};",
          "type": "blob"
        },
        "take_class": {
          "path": "take_class",
          "content": "(function() {\n  (function($) {\n    return $.fn.takeClass = function(name) {\n      this.addClass(name).siblings().removeClass(name);\n      return this;\n    };\n  })(jQuery);\n\n}).call(this);\n\n//# sourceURL=take_class.coffee",
          "type": "blob"
        },
        "test/image_reader": {
          "path": "test/image_reader",
          "content": "(function() {\n  require(\"../main\");\n\n  describe(\"jQuery#pasteImageReader\", function() {\n    return it(\"should exist\", function() {\n      return assert($.fn.pasteImageReader);\n    });\n  });\n\n  describe(\"jQuery#dropImageReader\", function() {\n    return it(\"should exist\", function() {\n      return assert($.fn.dropImageReader);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/image_reader.coffee",
          "type": "blob"
        },
        "test/take_class": {
          "path": "test/take_class",
          "content": "(function() {\n  require(\"../main\");\n\n  describe(\"jQuery#takeClass\", function() {\n    return it(\"should exist\", function() {\n      return assert($.fn.takeClass);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/take_class.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "remoteDependencies": [
        "//code.jquery.com/jquery-1.10.1.min.js"
      ],
      "repository": {
        "id": 13183366,
        "name": "jquery-utils",
        "full_name": "distri/jquery-utils",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/jquery-utils",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/distri/jquery-utils",
        "forks_url": "https://api.github.com/repos/distri/jquery-utils/forks",
        "keys_url": "https://api.github.com/repos/distri/jquery-utils/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/jquery-utils/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/jquery-utils/teams",
        "hooks_url": "https://api.github.com/repos/distri/jquery-utils/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/jquery-utils/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/jquery-utils/events",
        "assignees_url": "https://api.github.com/repos/distri/jquery-utils/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/jquery-utils/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/jquery-utils/tags",
        "blobs_url": "https://api.github.com/repos/distri/jquery-utils/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/jquery-utils/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/jquery-utils/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/jquery-utils/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/jquery-utils/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/jquery-utils/languages",
        "stargazers_url": "https://api.github.com/repos/distri/jquery-utils/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/jquery-utils/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/jquery-utils/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/jquery-utils/subscription",
        "commits_url": "https://api.github.com/repos/distri/jquery-utils/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/jquery-utils/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/jquery-utils/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/jquery-utils/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/jquery-utils/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/jquery-utils/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/jquery-utils/merges",
        "archive_url": "https://api.github.com/repos/distri/jquery-utils/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/jquery-utils/downloads",
        "issues_url": "https://api.github.com/repos/distri/jquery-utils/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/jquery-utils/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/jquery-utils/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/jquery-utils/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/jquery-utils/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/jquery-utils/releases{/id}",
        "created_at": "2013-09-29T00:25:09Z",
        "updated_at": "2013-11-29T20:57:42Z",
        "pushed_at": "2013-10-25T17:28:57Z",
        "git_url": "git://github.com/distri/jquery-utils.git",
        "ssh_url": "git@github.com:distri/jquery-utils.git",
        "clone_url": "https://github.com/distri/jquery-utils.git",
        "svn_url": "https://github.com/distri/jquery-utils",
        "homepage": null,
        "size": 592,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {
        "hotkeys": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "jquery.hotkeys\n==============\n\njQuery hotkeys plugin\n",
              "type": "blob"
            },
            "hotkeys.coffee.md": {
              "path": "hotkeys.coffee.md",
              "mode": "100644",
              "content": "jQuery Hotkeys Plugin\n=====================\n\nCopyright 2010, John Resig\nDual licensed under the MIT or GPL Version 2 licenses.\n\nBased upon the plugin by Tzury Bar Yochay:\nhttp://github.com/tzuryby/hotkeys\n\nOriginal idea by:\nBinny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/\n\n    if jQuery?\n      ((jQuery) ->\n        isTextAcceptingInput = (element) ->\n          /textarea|select/i.test(element.nodeName) or element.type is \"text\" or element.type is \"password\"\n\n        isFunctionKey = (event) ->\n          (event.type != \"keypress\") && (112 <= event.which <= 123)\n\n        jQuery.hotkeys =\n          version: \"0.9.0\"\n\n          specialKeys:\n            8: \"backspace\"\n            9: \"tab\"\n            13: \"return\"\n            16: \"shift\"\n            17: \"ctrl\"\n            18: \"alt\"\n            19: \"pause\"\n            20: \"capslock\"\n            27: \"esc\"\n            32: \"space\"\n            33: \"pageup\"\n            34: \"pagedown\"\n            35: \"end\"\n            36: \"home\"\n            37: \"left\"\n            38: \"up\"\n            39: \"right\"\n            40: \"down\"\n            45: \"insert\"\n            46: \"del\"\n            96: \"0\"\n            97: \"1\"\n            98: \"2\"\n            99: \"3\"\n            100: \"4\"\n            101: \"5\"\n            102: \"6\"\n            103: \"7\"\n            104: \"8\"\n            105: \"9\"\n            106: \"*\"\n            107: \"+\"\n            109: \"-\"\n            110: \".\"\n            111 : \"/\"\n            112: \"f1\"\n            113: \"f2\"\n            114: \"f3\"\n            115: \"f4\"\n            116: \"f5\"\n            117: \"f6\"\n            118: \"f7\"\n            119: \"f8\"\n            120: \"f9\"\n            121: \"f10\"\n            122: \"f11\"\n            123: \"f12\"\n            144: \"numlock\"\n            145: \"scroll\"\n            186: \";\"\n            187: \"=\"\n            188: \",\"\n            189: \"-\"\n            190: \".\"\n            191: \"/\"\n            219: \"[\"\n            220: \"\\\\\"\n            221: \"]\"\n            222: \"'\"\n            224: \"meta\"\n\n          shiftNums:\n            \"`\": \"~\"\n            \"1\": \"!\"\n            \"2\": \"@\"\n            \"3\": \"#\"\n            \"4\": \"$\"\n            \"5\": \"%\"\n            \"6\": \"^\"\n            \"7\": \"&\"\n            \"8\": \"*\"\n            \"9\": \"(\"\n            \"0\": \")\"\n            \"-\": \"_\"\n            \"=\": \"+\"\n            \";\": \":\"\n            \"'\": \"\\\"\"\n            \",\": \"<\"\n            \".\": \">\"\n            \"/\": \"?\"\n            \"\\\\\": \"|\"\n\n        keyHandler = (handleObj) ->\n          # Only care when a possible input has been specified\n          if typeof handleObj.data != \"string\"\n            return\n\n          origHandler = handleObj.handler\n          keys = handleObj.data.toLowerCase().split(\" \")\n\n          handleObj.handler = (event) ->\n            # Keypress represents characters, not special keys\n            special = event.type != \"keypress\" && jQuery.hotkeys.specialKeys[ event.which ]\n            character = String.fromCharCode( event.which ).toLowerCase()\n            modif = \"\"\n            possible = {}\n            target = event.target\n\n            # check combinations (alt|ctrl|shift+anything)\n            if event.altKey && special != \"alt\"\n              modif += \"alt+\"\n\n            if event.ctrlKey && special != \"ctrl\"\n              modif += \"ctrl+\"\n\n            # TODO: Need to make sure this works consistently across platforms\n            if event.metaKey && !event.ctrlKey && special != \"meta\"\n              modif += \"meta+\"\n\n            # Don't fire in text-accepting inputs that we didn't directly bind to\n            # unless a non-shift modifier key or function key is pressed\n            unless this == target\n              if isTextAcceptingInput(target) && !modif && !isFunctionKey(event)\n                return\n\n            if event.shiftKey && special != \"shift\"\n              modif += \"shift+\"\n\n            if special\n              possible[ modif + special ] = true\n            else\n              possible[ modif + character ] = true\n              possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true\n\n              # \"$\" can be triggered as \"Shift+4\" or \"Shift+$\" or just \"$\"\n              if modif == \"shift+\"\n                possible[ jQuery.hotkeys.shiftNums[ character ] ] = true\n\n            for key in keys\n              if possible[key]\n                return origHandler.apply( this, arguments )\n\n        jQuery.each [ \"keydown\", \"keyup\", \"keypress\" ], ->\n          jQuery.event.special[ this ] = { add: keyHandler }\n\n      )(jQuery)\n    else\n      console.warn \"jQuery not found, no hotkeys added :(\"\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.9.2\"\nentryPoint: \"hotkeys\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n]\n",
              "type": "blob"
            },
            "test/hotkeys.coffee": {
              "path": "test/hotkeys.coffee",
              "mode": "100644",
              "content": "require \"../hotkeys\"\n\ndescribe \"hotkeys binding\", ->\n  it \"should bind a hotkey\", (done) ->\n    $(document).bind \"keydown\", \"a\", ->\n      done()\n\n    $(document).trigger $.Event \"keydown\",\n      which: 65 # a\n      keyCode: 65\n",
              "type": "blob"
            }
          },
          "distribution": {
            "hotkeys": {
              "path": "hotkeys",
              "content": "(function() {\n  if (typeof jQuery !== \"undefined\" && jQuery !== null) {\n    (function(jQuery) {\n      var isFunctionKey, isTextAcceptingInput, keyHandler;\n      isTextAcceptingInput = function(element) {\n        return /textarea|select/i.test(element.nodeName) || element.type === \"text\" || element.type === \"password\";\n      };\n      isFunctionKey = function(event) {\n        var _ref;\n        return (event.type !== \"keypress\") && ((112 <= (_ref = event.which) && _ref <= 123));\n      };\n      jQuery.hotkeys = {\n        version: \"0.9.0\",\n        specialKeys: {\n          8: \"backspace\",\n          9: \"tab\",\n          13: \"return\",\n          16: \"shift\",\n          17: \"ctrl\",\n          18: \"alt\",\n          19: \"pause\",\n          20: \"capslock\",\n          27: \"esc\",\n          32: \"space\",\n          33: \"pageup\",\n          34: \"pagedown\",\n          35: \"end\",\n          36: \"home\",\n          37: \"left\",\n          38: \"up\",\n          39: \"right\",\n          40: \"down\",\n          45: \"insert\",\n          46: \"del\",\n          96: \"0\",\n          97: \"1\",\n          98: \"2\",\n          99: \"3\",\n          100: \"4\",\n          101: \"5\",\n          102: \"6\",\n          103: \"7\",\n          104: \"8\",\n          105: \"9\",\n          106: \"*\",\n          107: \"+\",\n          109: \"-\",\n          110: \".\",\n          111: \"/\",\n          112: \"f1\",\n          113: \"f2\",\n          114: \"f3\",\n          115: \"f4\",\n          116: \"f5\",\n          117: \"f6\",\n          118: \"f7\",\n          119: \"f8\",\n          120: \"f9\",\n          121: \"f10\",\n          122: \"f11\",\n          123: \"f12\",\n          144: \"numlock\",\n          145: \"scroll\",\n          186: \";\",\n          187: \"=\",\n          188: \",\",\n          189: \"-\",\n          190: \".\",\n          191: \"/\",\n          219: \"[\",\n          220: \"\\\\\",\n          221: \"]\",\n          222: \"'\",\n          224: \"meta\"\n        },\n        shiftNums: {\n          \"`\": \"~\",\n          \"1\": \"!\",\n          \"2\": \"@\",\n          \"3\": \"#\",\n          \"4\": \"$\",\n          \"5\": \"%\",\n          \"6\": \"^\",\n          \"7\": \"&\",\n          \"8\": \"*\",\n          \"9\": \"(\",\n          \"0\": \")\",\n          \"-\": \"_\",\n          \"=\": \"+\",\n          \";\": \":\",\n          \"'\": \"\\\"\",\n          \",\": \"<\",\n          \".\": \">\",\n          \"/\": \"?\",\n          \"\\\\\": \"|\"\n        }\n      };\n      keyHandler = function(handleObj) {\n        var keys, origHandler;\n        if (typeof handleObj.data !== \"string\") {\n          return;\n        }\n        origHandler = handleObj.handler;\n        keys = handleObj.data.toLowerCase().split(\" \");\n        return handleObj.handler = function(event) {\n          var character, key, modif, possible, special, target, _i, _len;\n          special = event.type !== \"keypress\" && jQuery.hotkeys.specialKeys[event.which];\n          character = String.fromCharCode(event.which).toLowerCase();\n          modif = \"\";\n          possible = {};\n          target = event.target;\n          if (event.altKey && special !== \"alt\") {\n            modif += \"alt+\";\n          }\n          if (event.ctrlKey && special !== \"ctrl\") {\n            modif += \"ctrl+\";\n          }\n          if (event.metaKey && !event.ctrlKey && special !== \"meta\") {\n            modif += \"meta+\";\n          }\n          if (this !== target) {\n            if (isTextAcceptingInput(target) && !modif && !isFunctionKey(event)) {\n              return;\n            }\n          }\n          if (event.shiftKey && special !== \"shift\") {\n            modif += \"shift+\";\n          }\n          if (special) {\n            possible[modif + special] = true;\n          } else {\n            possible[modif + character] = true;\n            possible[modif + jQuery.hotkeys.shiftNums[character]] = true;\n            if (modif === \"shift+\") {\n              possible[jQuery.hotkeys.shiftNums[character]] = true;\n            }\n          }\n          for (_i = 0, _len = keys.length; _i < _len; _i++) {\n            key = keys[_i];\n            if (possible[key]) {\n              return origHandler.apply(this, arguments);\n            }\n          }\n        };\n      };\n      return jQuery.each([\"keydown\", \"keyup\", \"keypress\"], function() {\n        return jQuery.event.special[this] = {\n          add: keyHandler\n        };\n      });\n    })(jQuery);\n  } else {\n    console.warn(\"jQuery not found, no hotkeys added :(\");\n  }\n\n}).call(this);\n\n//# sourceURL=hotkeys.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.9.2\",\"entryPoint\":\"hotkeys\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\"]};",
              "type": "blob"
            },
            "test/hotkeys": {
              "path": "test/hotkeys",
              "content": "(function() {\n  require(\"../hotkeys\");\n\n  describe(\"hotkeys binding\", function() {\n    return it(\"should bind a hotkey\", function(done) {\n      $(document).bind(\"keydown\", \"a\", function() {\n        return done();\n      });\n      return $(document).trigger($.Event(\"keydown\", {\n        which: 65,\n        keyCode: 65\n      }));\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/hotkeys.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.9.2",
          "entryPoint": "hotkeys",
          "remoteDependencies": [
            "//code.jquery.com/jquery-1.10.1.min.js"
          ],
          "repository": {
            "id": 13182272,
            "name": "jquery-hotkeys",
            "full_name": "distri/jquery-hotkeys",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/jquery-hotkeys",
            "description": "jQuery hotkeys plugin",
            "fork": false,
            "url": "https://api.github.com/repos/distri/jquery-hotkeys",
            "forks_url": "https://api.github.com/repos/distri/jquery-hotkeys/forks",
            "keys_url": "https://api.github.com/repos/distri/jquery-hotkeys/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/jquery-hotkeys/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/jquery-hotkeys/teams",
            "hooks_url": "https://api.github.com/repos/distri/jquery-hotkeys/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/jquery-hotkeys/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/jquery-hotkeys/events",
            "assignees_url": "https://api.github.com/repos/distri/jquery-hotkeys/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/jquery-hotkeys/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/jquery-hotkeys/tags",
            "blobs_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/jquery-hotkeys/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/jquery-hotkeys/languages",
            "stargazers_url": "https://api.github.com/repos/distri/jquery-hotkeys/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/jquery-hotkeys/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/jquery-hotkeys/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/jquery-hotkeys/subscription",
            "commits_url": "https://api.github.com/repos/distri/jquery-hotkeys/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/jquery-hotkeys/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/jquery-hotkeys/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/jquery-hotkeys/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/jquery-hotkeys/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/jquery-hotkeys/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/jquery-hotkeys/merges",
            "archive_url": "https://api.github.com/repos/distri/jquery-hotkeys/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/jquery-hotkeys/downloads",
            "issues_url": "https://api.github.com/repos/distri/jquery-hotkeys/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/jquery-hotkeys/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/jquery-hotkeys/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/jquery-hotkeys/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/jquery-hotkeys/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/jquery-hotkeys/releases{/id}",
            "created_at": "2013-09-28T22:58:08Z",
            "updated_at": "2013-11-29T20:59:45Z",
            "pushed_at": "2013-09-29T23:55:14Z",
            "git_url": "git://github.com/distri/jquery-hotkeys.git",
            "ssh_url": "git@github.com:distri/jquery-hotkeys.git",
            "clone_url": "https://github.com/distri/jquery-hotkeys.git",
            "svn_url": "https://github.com/distri/jquery-hotkeys",
            "homepage": null,
            "size": 608,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.9.2",
            "defaultBranch": "master"
          },
          "dependencies": {}
        },
        "image-reader": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "Copyright (c) 2012 Daniel X. Moore\n\nMIT License\n\nPermission is hereby granted, free of charge, to any person obtaining\na copy of this software and associated documentation files (the\n\"Software\"), to deal in the Software without restriction, including\nwithout limitation the rights to use, copy, modify, merge, publish,\ndistribute, sublicense, and/or sell copies of the Software, and to\npermit persons to whom the Software is furnished to do so, subject to\nthe following conditions:\n\nThe above copyright notice and this permission notice shall be\nincluded in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\nMERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\nNONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE\nLIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION\nOF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\nWITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "# Jquery::ImageReader\n\nHelpful jQuery plugins for dropping and pasting image data.\n\n## Usage\n\n```coffeescript\n$(\"html\").pasteImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n\n$(\"html\").dropImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n```\n\n## Contributing\n\n1. Fork it\n2. Create your feature branch (`git checkout -b my-new-feature`)\n3. Commit your changes (`git commit -am 'Added some feature'`)\n4. Push to the branch (`git push origin my-new-feature`)\n5. Create new Pull Request\n",
              "type": "blob"
            },
            "drop.coffee.md": {
              "path": "drop.coffee.md",
              "mode": "100644",
              "content": "Drop\n====\n\n    (($) ->\n      $.event.fix = ((originalFix) ->\n        (event) ->\n          event = originalFix.apply(this, arguments)\n\n          if event.type.indexOf('drag') == 0 || event.type.indexOf('drop') == 0\n            event.dataTransfer = event.originalEvent.dataTransfer\n\n          event\n\n      )($.event.fix)\n\n      defaults =\n        callback: $.noop\n        matchType: /image.*/\n\n      $.fn.dropImageReader = (options) ->\n        if typeof options == \"function\"\n          options =\n            callback: options\n\n        options = $.extend({}, defaults, options)\n\n        stopFn = (event) ->\n          event.stopPropagation()\n          event.preventDefault()\n\n        this.each ->\n          element = this\n          $this = $(this)\n\n          $this.bind 'dragenter dragover dragleave', stopFn\n\n          $this.bind 'drop', (event) ->\n            stopFn(event)\n\n            Array::forEach.call event.dataTransfer.files, (file) ->\n              return unless file.type.match(options.matchType)\n\n              reader = new FileReader()\n\n              reader.onload = (evt) ->\n                options.callback.call element,\n                  dataURL: evt.target.result\n                  event: evt\n                  file: file\n                  name: file.name\n\n              reader.readAsDataURL(file)\n\n    )(jQuery)\n",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "\n    require \"./paste\"\n    require \"./drop\"\n",
              "type": "blob"
            },
            "paste.coffee.md": {
              "path": "paste.coffee.md",
              "mode": "100644",
              "content": "Paste\n=====\n\n    (($) ->\n      $.event.fix = ((originalFix) ->\n        (event) ->\n          event = originalFix.apply(this, arguments)\n\n          if event.type.indexOf('copy') == 0 || event.type.indexOf('paste') == 0\n            event.clipboardData = event.originalEvent.clipboardData\n\n          return event\n\n      )($.event.fix)\n\n      defaults =\n        callback: $.noop\n        matchType: /image.*/\n\n      $.fn.pasteImageReader = (options) ->\n        if typeof options == \"function\"\n          options =\n            callback: options\n\n        options = $.extend({}, defaults, options)\n\n        @each ->\n          element = this\n          $this = $(this)\n\n          $this.bind 'paste', (event) ->\n            found = false\n            clipboardData = event.clipboardData\n\n            Array::forEach.call clipboardData.types, (type, i) ->\n              return if found\n\n              if type.match(options.matchType) or (clipboardData.items && clipboardData.items[i].type.match(options.matchType))\n                file = clipboardData.items[i].getAsFile()\n\n                reader = new FileReader()\n\n                reader.onload = (evt) ->\n                  options.callback.call element,\n                    dataURL: evt.target.result\n                    event: evt\n                    file: file\n                    name: file.name\n\n                reader.readAsDataURL(file)\n\n                found = true\n\n    )(jQuery)\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n]\n",
              "type": "blob"
            },
            "test/image_reader.coffee": {
              "path": "test/image_reader.coffee",
              "mode": "100644",
              "content": "require \"../main\"\n\n$(\"html\").pasteImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n\n$(\"html\").dropImageReader ({name, dataURL, file, event}) ->\n  $(\"body\").css\n    backgroundImage: \"url(#{dataURL})\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "drop": {
              "path": "drop",
              "content": "(function() {\n  (function($) {\n    var defaults;\n    $.event.fix = (function(originalFix) {\n      return function(event) {\n        event = originalFix.apply(this, arguments);\n        if (event.type.indexOf('drag') === 0 || event.type.indexOf('drop') === 0) {\n          event.dataTransfer = event.originalEvent.dataTransfer;\n        }\n        return event;\n      };\n    })($.event.fix);\n    defaults = {\n      callback: $.noop,\n      matchType: /image.*/\n    };\n    return $.fn.dropImageReader = function(options) {\n      var stopFn;\n      if (typeof options === \"function\") {\n        options = {\n          callback: options\n        };\n      }\n      options = $.extend({}, defaults, options);\n      stopFn = function(event) {\n        event.stopPropagation();\n        return event.preventDefault();\n      };\n      return this.each(function() {\n        var $this, element;\n        element = this;\n        $this = $(this);\n        $this.bind('dragenter dragover dragleave', stopFn);\n        return $this.bind('drop', function(event) {\n          stopFn(event);\n          return Array.prototype.forEach.call(event.dataTransfer.files, function(file) {\n            var reader;\n            if (!file.type.match(options.matchType)) {\n              return;\n            }\n            reader = new FileReader();\n            reader.onload = function(evt) {\n              return options.callback.call(element, {\n                dataURL: evt.target.result,\n                event: evt,\n                file: file,\n                name: file.name\n              });\n            };\n            return reader.readAsDataURL(file);\n          });\n        });\n      });\n    };\n  })(jQuery);\n\n}).call(this);\n\n//# sourceURL=drop.coffee",
              "type": "blob"
            },
            "main": {
              "path": "main",
              "content": "(function() {\n  require(\"./paste\");\n\n  require(\"./drop\");\n\n}).call(this);\n\n//# sourceURL=main.coffee",
              "type": "blob"
            },
            "paste": {
              "path": "paste",
              "content": "(function() {\n  (function($) {\n    var defaults;\n    $.event.fix = (function(originalFix) {\n      return function(event) {\n        event = originalFix.apply(this, arguments);\n        if (event.type.indexOf('copy') === 0 || event.type.indexOf('paste') === 0) {\n          event.clipboardData = event.originalEvent.clipboardData;\n        }\n        return event;\n      };\n    })($.event.fix);\n    defaults = {\n      callback: $.noop,\n      matchType: /image.*/\n    };\n    return $.fn.pasteImageReader = function(options) {\n      if (typeof options === \"function\") {\n        options = {\n          callback: options\n        };\n      }\n      options = $.extend({}, defaults, options);\n      return this.each(function() {\n        var $this, element;\n        element = this;\n        $this = $(this);\n        return $this.bind('paste', function(event) {\n          var clipboardData, found;\n          found = false;\n          clipboardData = event.clipboardData;\n          return Array.prototype.forEach.call(clipboardData.types, function(type, i) {\n            var file, reader;\n            if (found) {\n              return;\n            }\n            if (type.match(options.matchType) || (clipboardData.items && clipboardData.items[i].type.match(options.matchType))) {\n              file = clipboardData.items[i].getAsFile();\n              reader = new FileReader();\n              reader.onload = function(evt) {\n                return options.callback.call(element, {\n                  dataURL: evt.target.result,\n                  event: evt,\n                  file: file,\n                  name: file.name\n                });\n              };\n              reader.readAsDataURL(file);\n              return found = true;\n            }\n          });\n        });\n      });\n    };\n  })(jQuery);\n\n}).call(this);\n\n//# sourceURL=paste.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\"]};",
              "type": "blob"
            },
            "test/image_reader": {
              "path": "test/image_reader",
              "content": "(function() {\n  require(\"../main\");\n\n  $(\"html\").pasteImageReader(function(_arg) {\n    var dataURL, event, file, name;\n    name = _arg.name, dataURL = _arg.dataURL, file = _arg.file, event = _arg.event;\n    return $(\"body\").css({\n      backgroundImage: \"url(\" + dataURL + \")\"\n    });\n  });\n\n  $(\"html\").dropImageReader(function(_arg) {\n    var dataURL, event, file, name;\n    name = _arg.name, dataURL = _arg.dataURL, file = _arg.file, event = _arg.event;\n    return $(\"body\").css({\n      backgroundImage: \"url(\" + dataURL + \")\"\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/image_reader.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "main",
          "remoteDependencies": [
            "//code.jquery.com/jquery-1.10.1.min.js"
          ],
          "repository": {
            "id": 4527535,
            "name": "jquery-image_reader",
            "full_name": "distri/jquery-image_reader",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/jquery-image_reader",
            "description": "Paste and Drop images into web apps",
            "fork": false,
            "url": "https://api.github.com/repos/distri/jquery-image_reader",
            "forks_url": "https://api.github.com/repos/distri/jquery-image_reader/forks",
            "keys_url": "https://api.github.com/repos/distri/jquery-image_reader/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/jquery-image_reader/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/jquery-image_reader/teams",
            "hooks_url": "https://api.github.com/repos/distri/jquery-image_reader/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/jquery-image_reader/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/jquery-image_reader/events",
            "assignees_url": "https://api.github.com/repos/distri/jquery-image_reader/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/jquery-image_reader/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/jquery-image_reader/tags",
            "blobs_url": "https://api.github.com/repos/distri/jquery-image_reader/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/jquery-image_reader/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/jquery-image_reader/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/jquery-image_reader/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/jquery-image_reader/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/jquery-image_reader/languages",
            "stargazers_url": "https://api.github.com/repos/distri/jquery-image_reader/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/jquery-image_reader/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/jquery-image_reader/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/jquery-image_reader/subscription",
            "commits_url": "https://api.github.com/repos/distri/jquery-image_reader/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/jquery-image_reader/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/jquery-image_reader/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/jquery-image_reader/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/jquery-image_reader/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/jquery-image_reader/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/jquery-image_reader/merges",
            "archive_url": "https://api.github.com/repos/distri/jquery-image_reader/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/jquery-image_reader/downloads",
            "issues_url": "https://api.github.com/repos/distri/jquery-image_reader/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/jquery-image_reader/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/jquery-image_reader/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/jquery-image_reader/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/jquery-image_reader/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/jquery-image_reader/releases{/id}",
            "created_at": "2012-06-02T07:12:27Z",
            "updated_at": "2013-11-29T21:02:52Z",
            "pushed_at": "2013-10-30T15:54:19Z",
            "git_url": "git://github.com/distri/jquery-image_reader.git",
            "ssh_url": "git@github.com:distri/jquery-image_reader.git",
            "clone_url": "https://github.com/distri/jquery-image_reader.git",
            "svn_url": "https://github.com/distri/jquery-image_reader",
            "homepage": null,
            "size": 142,
            "stargazers_count": 5,
            "watchers_count": 5,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 1,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 1,
            "open_issues": 0,
            "watchers": 5,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 1,
            "subscribers_count": 1,
            "branch": "v0.2.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "observable": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "observable\n==========\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Observable\n==========\n\n`Observable` allows for observing arrays, functions, and objects.\n\nFunction dependencies are automagically observed.\n\nStandard array methods are proxied through to the underlying array.\n\n    Observable = (value) ->\n\nReturn the object if it is already an observable object.\n\n      return value if typeof value?.observe is \"function\"\n\nMaintain a set of listeners to observe changes and provide a helper to notify each observer.\n\n      listeners = []\n\n      notify = (newValue) ->\n        listeners.forEach (listener) ->\n          listener(newValue)\n\nOur observable function is stored as a reference to `self`.\n\nIf `value` is a function compute dependencies and listen to observables that it depends on.\n\n      if typeof value is 'function'\n        fn = value\n        self = ->\n          # Automagic dependency observation\n          magicDependency(self)\n\n          return value\n\n        self.observe = (listener) ->\n          listeners.push listener\n\n        changed = ->\n          value = fn()\n          notify(value)\n\n        value = computeDependencies(fn, changed)\n\n      else\n\nWhen called with zero arguments it is treated as a getter. When called with one argument it is treated as a setter.\n\nChanges to the value will trigger notifications.\n\nThe value is always returned.\n\n        self = (newValue) ->\n          if arguments.length > 0\n            if value != newValue\n              value = newValue\n\n              notify(newValue)\n          else\n            # Automagic dependency observation\n            magicDependency(self)\n\n          return value\n\nAdd a listener for when this object changes.\n\n        self.observe = (listener) ->\n          listeners.push listener\n\nThis `each` iterator is similar to [the Maybe monad](http://en.wikipedia.org/wiki/Monad_&#40;functional_programming&#41;#The_Maybe_monad) in that our observable may contain a single value or nothing at all.\n\n      self.each = (args...) ->\n        if value?\n          [value].forEach(args...)\n\nIf the value is an array then proxy array methods and add notifications to mutation events.\n\n      if Array.isArray(value)\n        [\n          \"concat\"\n          \"every\"\n          \"filter\"\n          \"forEach\"\n          \"indexOf\"\n          \"join\"\n          \"lastIndexOf\"\n          \"map\"\n          \"reduce\"\n          \"reduceRight\"\n          \"slice\"\n          \"some\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            value[method](args...)\n\n        [\n          \"pop\"\n          \"push\"\n          \"reverse\"\n          \"shift\"\n          \"splice\"\n          \"sort\"\n          \"unshift\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            notifyReturning value[method](args...)\n\n        notifyReturning = (returnValue) ->\n          notify(value)\n\n          return returnValue\n\nAdd some extra helpful methods to array observables.\n\n        extend self,\n          each: (args...) ->\n            self.forEach(args...)\n\n            return self\n\nRemove an element from the array and notify observers of changes.\n\n          remove: (object) ->\n            index = value.indexOf(object)\n\n            if index >= 0\n              notifyReturning value.splice(index, 1)[0]\n\n          get: (index) ->\n            value[index]\n\n          first: ->\n            value[0]\n\n          last: ->\n            value[value.length-1]\n\n      extend self,\n        stopObserving: (fn) ->\n          remove listeners, fn\n\n        toggle: ->\n          self !value\n\n        increment: (n) ->\n          self value + n\n\n        decrement: (n) ->\n          self value - n\n\n        toString: ->\n          \"Observable(#{value})\"\n\n      return self\n\nExport `Observable`\n\n    module.exports = Observable\n\nAppendix\n--------\n\nThe extend method adds one objects properties to another.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nSuper hax for computing dependencies. This needs to be a shared global so that\ndifferent bundled versions of observable libraries can interoperate.\n\n    global.OBSERVABLE_ROOT_HACK = undefined\n\n    magicDependency = (self) ->\n      if base = global.OBSERVABLE_ROOT_HACK\n        self.observe base\n\n    withBase = (root, fn) ->\n      global.OBSERVABLE_ROOT_HACK = root\n      value = fn()\n      global.OBSERVABLE_ROOT_HACK = undefined\n\n      return value\n\n    base = ->\n      global.OBSERVABLE_ROOT_HACK\n\nAutomagically compute dependencies.\n\n    computeDependencies = (fn, root) ->\n      withBase root, ->\n        fn()\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.2\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/observable.coffee": {
          "path": "test/observable.coffee",
          "content": "global.Observable = require \"../main\"\n\ndescribe 'Observable', ->\n  it 'should create an observable for an object', ->\n    n = 5\n\n    observable = Observable(n)\n\n    assert.equal(observable(), n)\n\n  it 'should fire events when setting', ->\n    string = \"yolo\"\n\n    observable = Observable(string)\n    observable.observe (newValue) ->\n      assert.equal newValue, \"4life\"\n\n    observable(\"4life\")\n\n  it 'should be idempotent', ->\n    o = Observable(5)\n\n    assert.equal o, Observable(o)\n\n  describe \"#each\", ->\n    it \"should be invoked once if there is an observable\", ->\n      o = Observable(5)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n        assert.equal value, 5\n\n      assert.equal called, 1\n\n    it \"should not be invoked if observable is null\", ->\n      o = Observable(null)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n\n      assert.equal called, 0\n\n  it \"should allow for stopping observation\", ->\n    observable = Observable(\"string\")\n\n    called = 0\n    fn = (newValue) ->\n      called += 1\n      assert.equal newValue, \"4life\"\n\n    observable.observe fn\n\n    observable(\"4life\")\n\n    observable.stopObserving fn\n\n    observable(\"wat\")\n\n    assert.equal called, 1\n\n  it \"should increment\", ->\n    observable = Observable 1\n\n    observable.increment(5)\n\n    assert.equal observable(), 6\n\n  it \"should decremnet\", ->\n    observable = Observable 1\n\n    observable.decrement 5\n\n    assert.equal observable(), -4\n\n  it \"should toggle\", ->\n    observable = Observable false\n\n    observable.toggle()\n    assert.equal observable(), true\n\n    observable.toggle()\n    assert.equal observable(), false\n\ndescribe \"Observable Array\", ->\n  it \"should proxy array methods\", ->\n    o = Observable [5]\n\n    o.map (n) ->\n      assert.equal n, 5\n\n  it \"should notify on mutation methods\", (done) ->\n    o = Observable []\n\n    o.observe (newValue) ->\n      assert.equal newValue[0], 1\n\n    o.push 1\n\n    done()\n\n  it \"should have an each method\", ->\n    o = Observable []\n\n    assert o.each\n\n  it \"#get\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.get(2), 2\n\n  it \"#first\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.first(), 0\n\n  it \"#last\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.last(), 3\n\n  it \"#remove\", (done) ->\n    o = Observable [0, 1, 2, 3]\n\n    o.observe (newValue) ->\n      assert.equal newValue.length, 3\n      setTimeout ->\n        done()\n      , 0\n\n    assert.equal o.remove(2), 2\n\n  # TODO: This looks like it might be impossible\n  it \"should proxy the length property\"\n\ndescribe \"Observable functions\", ->\n  it \"should compute dependencies\", (done) ->\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n      done()\n\n    lastName \"Bro\"\n\n  it \"should allow double nesting\", (done) ->\n    bottom = Observable \"rad\"\n    middle = Observable ->\n      bottom()\n    top = Observable ->\n      middle()\n\n    top.observe (newValue) ->\n      assert.equal newValue, \"wat\"\n      assert.equal top(), newValue\n      assert.equal middle(), newValue\n\n      done()\n\n    bottom(\"wat\")\n\n  it \"should have an each method\", ->\n    o = Observable ->\n\n    assert o.each\n\n  it \"should not invoke when returning undefined\", ->\n    o = Observable ->\n\n    o.each ->\n      assert false\n\n  it \"should invoke when returning any defined value\", (done) ->\n    o = Observable -> 5\n\n    o.each (n) ->\n      assert.equal n, 5\n      done()\n\n  it \"should work on an array dependency\", ->\n    oA = Observable [1, 2, 3]\n\n    o = Observable ->\n      oA()[0]\n\n    last = Observable ->\n      oA()[oA().length-1]\n\n    assert.equal o(), 1\n\n    oA.unshift 0\n\n    assert.equal o(), 0\n\n    oA.push 4\n\n    assert.equal last(), 4, \"Last should be 4\"\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var Observable, base, computeDependencies, extend, magicDependency, remove, withBase,\n    __slice = [].slice;\n\n  Observable = function(value) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return listeners.forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      self.observe = function(listener) {\n        return listeners.push(listener);\n      };\n      changed = function() {\n        value = fn();\n        return notify(value);\n      };\n      value = computeDependencies(fn, changed);\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n      self.observe = function(listener) {\n        return listeners.push(listener);\n      };\n    }\n    self.each = function() {\n      var args, _ref;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      if (value != null) {\n        return (_ref = [value]).forEach.apply(_ref, args);\n      }\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          self.forEach.apply(self, args);\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          return value[index];\n        },\n        first: function() {\n          return value[0];\n        },\n        last: function() {\n          return value[value.length - 1];\n        }\n      });\n    }\n    extend(self, {\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  module.exports = Observable;\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = void 0;\n\n  magicDependency = function(self) {\n    var base;\n    if (base = global.OBSERVABLE_ROOT_HACK) {\n      return self.observe(base);\n    }\n  };\n\n  withBase = function(root, fn) {\n    var value;\n    global.OBSERVABLE_ROOT_HACK = root;\n    value = fn();\n    global.OBSERVABLE_ROOT_HACK = void 0;\n    return value;\n  };\n\n  base = function() {\n    return global.OBSERVABLE_ROOT_HACK;\n  };\n\n  computeDependencies = function(fn, root) {\n    return withBase(root, function() {\n      return fn();\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.2\"};",
          "type": "blob"
        },
        "test/observable": {
          "path": "test/observable",
          "content": "(function() {\n  global.Observable = require(\"../main\");\n\n  describe('Observable', function() {\n    it('should create an observable for an object', function() {\n      var n, observable;\n      n = 5;\n      observable = Observable(n);\n      return assert.equal(observable(), n);\n    });\n    it('should fire events when setting', function() {\n      var observable, string;\n      string = \"yolo\";\n      observable = Observable(string);\n      observable.observe(function(newValue) {\n        return assert.equal(newValue, \"4life\");\n      });\n      return observable(\"4life\");\n    });\n    it('should be idempotent', function() {\n      var o;\n      o = Observable(5);\n      return assert.equal(o, Observable(o));\n    });\n    describe(\"#each\", function() {\n      it(\"should be invoked once if there is an observable\", function() {\n        var called, o;\n        o = Observable(5);\n        called = 0;\n        o.each(function(value) {\n          called += 1;\n          return assert.equal(value, 5);\n        });\n        return assert.equal(called, 1);\n      });\n      return it(\"should not be invoked if observable is null\", function() {\n        var called, o;\n        o = Observable(null);\n        called = 0;\n        o.each(function(value) {\n          return called += 1;\n        });\n        return assert.equal(called, 0);\n      });\n    });\n    it(\"should allow for stopping observation\", function() {\n      var called, fn, observable;\n      observable = Observable(\"string\");\n      called = 0;\n      fn = function(newValue) {\n        called += 1;\n        return assert.equal(newValue, \"4life\");\n      };\n      observable.observe(fn);\n      observable(\"4life\");\n      observable.stopObserving(fn);\n      observable(\"wat\");\n      return assert.equal(called, 1);\n    });\n    it(\"should increment\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.increment(5);\n      return assert.equal(observable(), 6);\n    });\n    it(\"should decremnet\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.decrement(5);\n      return assert.equal(observable(), -4);\n    });\n    return it(\"should toggle\", function() {\n      var observable;\n      observable = Observable(false);\n      observable.toggle();\n      assert.equal(observable(), true);\n      observable.toggle();\n      return assert.equal(observable(), false);\n    });\n  });\n\n  describe(\"Observable Array\", function() {\n    it(\"should proxy array methods\", function() {\n      var o;\n      o = Observable([5]);\n      return o.map(function(n) {\n        return assert.equal(n, 5);\n      });\n    });\n    it(\"should notify on mutation methods\", function(done) {\n      var o;\n      o = Observable([]);\n      o.observe(function(newValue) {\n        return assert.equal(newValue[0], 1);\n      });\n      o.push(1);\n      return done();\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable([]);\n      return assert(o.each);\n    });\n    it(\"#get\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.get(2), 2);\n    });\n    it(\"#first\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.first(), 0);\n    });\n    it(\"#last\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.last(), 3);\n    });\n    it(\"#remove\", function(done) {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      o.observe(function(newValue) {\n        assert.equal(newValue.length, 3);\n        return setTimeout(function() {\n          return done();\n        }, 0);\n      });\n      return assert.equal(o.remove(2), 2);\n    });\n    return it(\"should proxy the length property\");\n  });\n\n  describe(\"Observable functions\", function() {\n    it(\"should compute dependencies\", function(done) {\n      var firstName, lastName, o;\n      firstName = Observable(\"Duder\");\n      lastName = Observable(\"Man\");\n      o = Observable(function() {\n        return \"\" + (firstName()) + \" \" + (lastName());\n      });\n      o.observe(function(newValue) {\n        assert.equal(newValue, \"Duder Bro\");\n        return done();\n      });\n      return lastName(\"Bro\");\n    });\n    it(\"should allow double nesting\", function(done) {\n      var bottom, middle, top;\n      bottom = Observable(\"rad\");\n      middle = Observable(function() {\n        return bottom();\n      });\n      top = Observable(function() {\n        return middle();\n      });\n      top.observe(function(newValue) {\n        assert.equal(newValue, \"wat\");\n        assert.equal(top(), newValue);\n        assert.equal(middle(), newValue);\n        return done();\n      });\n      return bottom(\"wat\");\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable(function() {});\n      return assert(o.each);\n    });\n    it(\"should not invoke when returning undefined\", function() {\n      var o;\n      o = Observable(function() {});\n      return o.each(function() {\n        return assert(false);\n      });\n    });\n    it(\"should invoke when returning any defined value\", function(done) {\n      var o;\n      o = Observable(function() {\n        return 5;\n      });\n      return o.each(function(n) {\n        assert.equal(n, 5);\n        return done();\n      });\n    });\n    return it(\"should work on an array dependency\", function() {\n      var last, o, oA;\n      oA = Observable([1, 2, 3]);\n      o = Observable(function() {\n        return oA()[0];\n      });\n      last = Observable(function() {\n        return oA()[oA().length - 1];\n      });\n      assert.equal(o(), 1);\n      oA.unshift(0);\n      assert.equal(o(), 0);\n      oA.push(4);\n      return assert.equal(last(), 4, \"Last should be 4\");\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.1.2",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.1.2",
        "default_branch": "master",
        "full_name": "distri/observable",
        "homepage": null,
        "description": "",
        "html_url": "https://github.com/distri/observable",
        "url": "https://api.github.com/repos/distri/observable",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "postmaster": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "postmaster\n==========\n\nSend and receive postMessage commands.\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Postmaster\n==========\n\nPostmaster allows a child window that was opened from a parent window to\nreceive method calls from the parent window through the postMessage events.\n\nBind postMessage events to methods.\n\n    module.exports = (I={}, self={}) ->\n      # Only listening to messages from `opener`\n      addEventListener \"message\", (event) ->\n        if event.source is opener\n          {method, params, id} = event.data\n\n          try\n            result = self[method](params...)\n\n            send\n              success:\n                id: id\n                result: result\n          catch error\n            send\n              error:\n                id: id\n                message: error.message\n                stack: error.stack\n\n      addEventListener \"unload\", ->\n        send\n          status: \"unload\"\n\n      # Tell our opener that we're ready\n      send\n        status: \"ready\"\n\n      self.sendToParent = send\n\n      return self\n\n    send = (data) ->\n      opener?.postMessage data, \"*\"\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\n",
          "type": "blob"
        },
        "test/postmaster.coffee": {
          "path": "test/postmaster.coffee",
          "mode": "100644",
          "content": "Postmaster = require \"../main\"\n\ndescribe \"Postmaster\", ->\n  it \"should allow sending messages to parent\", ->\n    postmaster = Postmaster()\n\n    assert postmaster.sendToParent\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var send;\n\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    addEventListener(\"message\", function(event) {\n      var error, id, method, params, result, _ref;\n      if (event.source === opener) {\n        _ref = event.data, method = _ref.method, params = _ref.params, id = _ref.id;\n        try {\n          result = self[method].apply(self, params);\n          return send({\n            success: {\n              id: id,\n              result: result\n            }\n          });\n        } catch (_error) {\n          error = _error;\n          return send({\n            error: {\n              id: id,\n              message: error.message,\n              stack: error.stack\n            }\n          });\n        }\n      }\n    });\n    addEventListener(\"unload\", function() {\n      return send({\n        status: \"unload\"\n      });\n    });\n    send({\n      status: \"ready\"\n    });\n    self.sendToParent = send;\n    return self;\n  };\n\n  send = function(data) {\n    return typeof opener !== \"undefined\" && opener !== null ? opener.postMessage(data, \"*\") : void 0;\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\"};",
          "type": "blob"
        },
        "test/postmaster": {
          "path": "test/postmaster",
          "content": "(function() {\n  var Postmaster;\n\n  Postmaster = require(\"../main\");\n\n  describe(\"Postmaster\", function() {\n    return it(\"should allow sending messages to parent\", function() {\n      var postmaster;\n      postmaster = Postmaster();\n      return assert(postmaster.sendToParent);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/postmaster.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "repository": {
        "id": 15326478,
        "name": "postmaster",
        "full_name": "distri/postmaster",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/postmaster",
        "description": "Send and receive postMessage commands.",
        "fork": false,
        "url": "https://api.github.com/repos/distri/postmaster",
        "forks_url": "https://api.github.com/repos/distri/postmaster/forks",
        "keys_url": "https://api.github.com/repos/distri/postmaster/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/postmaster/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/postmaster/teams",
        "hooks_url": "https://api.github.com/repos/distri/postmaster/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/postmaster/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/postmaster/events",
        "assignees_url": "https://api.github.com/repos/distri/postmaster/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/postmaster/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/postmaster/tags",
        "blobs_url": "https://api.github.com/repos/distri/postmaster/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/postmaster/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/postmaster/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/postmaster/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/postmaster/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/postmaster/languages",
        "stargazers_url": "https://api.github.com/repos/distri/postmaster/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/postmaster/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/postmaster/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/postmaster/subscription",
        "commits_url": "https://api.github.com/repos/distri/postmaster/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/postmaster/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/postmaster/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/postmaster/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/postmaster/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/postmaster/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/postmaster/merges",
        "archive_url": "https://api.github.com/repos/distri/postmaster/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/postmaster/downloads",
        "issues_url": "https://api.github.com/repos/distri/postmaster/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/postmaster/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/postmaster/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/postmaster/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/postmaster/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/postmaster/releases{/id}",
        "created_at": "2013-12-20T00:42:15Z",
        "updated_at": "2013-12-20T01:05:32Z",
        "pushed_at": "2013-12-20T01:05:32Z",
        "git_url": "git://github.com/distri/postmaster.git",
        "ssh_url": "git@github.com:distri/postmaster.git",
        "clone_url": "https://github.com/distri/postmaster.git",
        "svn_url": "https://github.com/distri/postmaster",
        "homepage": null,
        "size": 124,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "runtime": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "runtime\n=======\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.3.0\"\nentryPoint: \"runtime\"\ndependencies:\n  appcache: \"distri/appcache:v0.2.0\"\n",
          "type": "blob"
        },
        "runtime.coffee.md": {
          "path": "runtime.coffee.md",
          "mode": "100644",
          "content": "Runtime\n=======\n\n    require \"appcache\"\n\nThe runtime holds utilities to assist with an apps running environment.\n\n    module.exports = (pkg) ->\n\nCall on start to boot up the runtime, get the root node, add styles, display a\npromo. Link back to the creator of this app in the promo.\n\n      self =\n        boot: ->\n          if pkg?.progenitor?.url\n            promo(\"You should meet my creator #{pkg.progenitor.url}\")\n\n          promo(\"Docs #{document.location.href}docs\")\n\n          return self\n\nApply the stylesheet to the root node.\n\n        applyStyleSheet: (style, className=\"runtime\") ->\n          styleNode = document.createElement(\"style\")\n          styleNode.innerHTML = style\n          styleNode.className = className\n\n          if previousStyleNode = document.head.querySelector(\"style.#{className}\")\n            previousStyleNode.parentNode.removeChild(prevousStyleNode)\n\n          document.head.appendChild(styleNode)\n\n          return self\n\nHelpers\n-------\n\nDisplay a promo in the console.\n\n    promo = (message) ->\n      console.log(\"%c #{message}\", \"\"\"\n        background: #000;\n        color: white;\n        font-size: 2em;\n        line-height: 2em;\n        padding: 10px 100px;\n        margin-bottom: 1em;\n        text-shadow:\n          0 0 0.05em #fff,\n          0 0 0.1em #fff,\n          0 0 0.15em #fff,\n          0 0 0.2em #ff00de,\n          0 0 0.35em #ff00de,\n          0 0 0.4em #ff00de,\n          0 0 0.5em #ff00de,\n          0 0 0.75em #ff00de;'\n      \"\"\")\n",
          "type": "blob"
        },
        "test/runtime.coffee": {
          "path": "test/runtime.coffee",
          "mode": "100644",
          "content": "Runtime = require \"../runtime\"\n\ndescribe \"Runtime\", ->\n  it \"should be created from a package and provide a boot method\", ->\n    assert Runtime(PACKAGE).boot()\n\n  it \"should be able to attach a style\", ->\n    assert Runtime().applyStyleSheet(\"body {background-color: lightgrey}\")\n\n  it \"should work without a package\", ->\n    assert Runtime().boot()\n",
          "type": "blob"
        }
      },
      "distribution": {
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.3.0\",\"entryPoint\":\"runtime\",\"dependencies\":{\"appcache\":\"distri/appcache:v0.2.0\"}};",
          "type": "blob"
        },
        "runtime": {
          "path": "runtime",
          "content": "(function() {\n  var promo;\n\n  require(\"appcache\");\n\n  module.exports = function(pkg) {\n    var self;\n    return self = {\n      boot: function() {\n        var _ref;\n        if (pkg != null ? (_ref = pkg.progenitor) != null ? _ref.url : void 0 : void 0) {\n          promo(\"You should meet my creator \" + pkg.progenitor.url);\n        }\n        promo(\"Docs \" + document.location.href + \"docs\");\n        return self;\n      },\n      applyStyleSheet: function(style, className) {\n        var previousStyleNode, styleNode;\n        if (className == null) {\n          className = \"runtime\";\n        }\n        styleNode = document.createElement(\"style\");\n        styleNode.innerHTML = style;\n        styleNode.className = className;\n        if (previousStyleNode = document.head.querySelector(\"style.\" + className)) {\n          previousStyleNode.parentNode.removeChild(prevousStyleNode);\n        }\n        document.head.appendChild(styleNode);\n        return self;\n      }\n    };\n  };\n\n  promo = function(message) {\n    return console.log(\"%c \" + message, \"background: #000;\\ncolor: white;\\nfont-size: 2em;\\nline-height: 2em;\\npadding: 10px 100px;\\nmargin-bottom: 1em;\\ntext-shadow:\\n  0 0 0.05em #fff,\\n  0 0 0.1em #fff,\\n  0 0 0.15em #fff,\\n  0 0 0.2em #ff00de,\\n  0 0 0.35em #ff00de,\\n  0 0 0.4em #ff00de,\\n  0 0 0.5em #ff00de,\\n  0 0 0.75em #ff00de;'\");\n  };\n\n}).call(this);\n\n//# sourceURL=runtime.coffee",
          "type": "blob"
        },
        "test/runtime": {
          "path": "test/runtime",
          "content": "(function() {\n  var Runtime;\n\n  Runtime = require(\"../runtime\");\n\n  describe(\"Runtime\", function() {\n    it(\"should be created from a package and provide a boot method\", function() {\n      return assert(Runtime(PACKAGE).boot());\n    });\n    it(\"should be able to attach a style\", function() {\n      return assert(Runtime().applyStyleSheet(\"body {background-color: lightgrey}\"));\n    });\n    return it(\"should work without a package\", function() {\n      return assert(Runtime().boot());\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/runtime.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.3.0",
      "entryPoint": "runtime",
      "repository": {
        "id": 13202878,
        "name": "runtime",
        "full_name": "distri/runtime",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/runtime",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/distri/runtime",
        "forks_url": "https://api.github.com/repos/distri/runtime/forks",
        "keys_url": "https://api.github.com/repos/distri/runtime/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/runtime/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/runtime/teams",
        "hooks_url": "https://api.github.com/repos/distri/runtime/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/runtime/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/runtime/events",
        "assignees_url": "https://api.github.com/repos/distri/runtime/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/runtime/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/runtime/tags",
        "blobs_url": "https://api.github.com/repos/distri/runtime/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/runtime/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/runtime/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/runtime/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/runtime/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/runtime/languages",
        "stargazers_url": "https://api.github.com/repos/distri/runtime/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/runtime/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/runtime/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/runtime/subscription",
        "commits_url": "https://api.github.com/repos/distri/runtime/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/runtime/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/runtime/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/runtime/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/runtime/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/runtime/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/runtime/merges",
        "archive_url": "https://api.github.com/repos/distri/runtime/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/runtime/downloads",
        "issues_url": "https://api.github.com/repos/distri/runtime/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/runtime/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/runtime/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/runtime/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/runtime/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/runtime/releases{/id}",
        "created_at": "2013-09-30T00:44:37Z",
        "updated_at": "2014-02-27T19:26:02Z",
        "pushed_at": "2013-11-29T20:14:49Z",
        "git_url": "git://github.com/distri/runtime.git",
        "ssh_url": "git@github.com:distri/runtime.git",
        "clone_url": "https://github.com/distri/runtime.git",
        "svn_url": "https://github.com/distri/runtime",
        "homepage": null,
        "size": 140,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.3.0",
        "defaultBranch": "master"
      },
      "dependencies": {
        "appcache": {
          "source": {
            "LICENSE": {
              "path": "LICENSE",
              "mode": "100644",
              "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
              "type": "blob"
            },
            "README.md": {
              "path": "README.md",
              "mode": "100644",
              "content": "appcache\n========\n\nHTML5 AppCache Helpers\n",
              "type": "blob"
            },
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "App Cache\n=========\n\nSome helpers for working with HTML5 application cache.\n\nhttp://www.html5rocks.com/en/tutorials/appcache/beginner/\n\n    applicationCache = window.applicationCache\n\n    applicationCache.addEventListener 'updateready', (e) ->\n      if applicationCache.status is applicationCache.UPDATEREADY\n        # Browser downloaded a new app cache.\n        if confirm('A new version of this site is available. Load it?')\n          window.location.reload()\n    , false\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.2.0\"\nentryPoint: \"main\"\n",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var applicationCache;\n\n  applicationCache = window.applicationCache;\n\n  applicationCache.addEventListener('updateready', function(e) {\n    if (applicationCache.status === applicationCache.UPDATEREADY) {\n      if (confirm('A new version of this site is available. Load it?')) {\n        return window.location.reload();\n      }\n    }\n  }, false);\n\n}).call(this);\n\n//# sourceURL=main.coffee",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"main\"};",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.2.0",
          "entryPoint": "main",
          "repository": {
            "id": 14539483,
            "name": "appcache",
            "full_name": "distri/appcache",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/appcache",
            "description": "HTML5 AppCache Helpers",
            "fork": false,
            "url": "https://api.github.com/repos/distri/appcache",
            "forks_url": "https://api.github.com/repos/distri/appcache/forks",
            "keys_url": "https://api.github.com/repos/distri/appcache/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/appcache/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/appcache/teams",
            "hooks_url": "https://api.github.com/repos/distri/appcache/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/appcache/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/appcache/events",
            "assignees_url": "https://api.github.com/repos/distri/appcache/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/appcache/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/appcache/tags",
            "blobs_url": "https://api.github.com/repos/distri/appcache/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/appcache/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/appcache/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/appcache/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/appcache/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/appcache/languages",
            "stargazers_url": "https://api.github.com/repos/distri/appcache/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/appcache/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/appcache/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/appcache/subscription",
            "commits_url": "https://api.github.com/repos/distri/appcache/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/appcache/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/appcache/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/appcache/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/appcache/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/appcache/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/appcache/merges",
            "archive_url": "https://api.github.com/repos/distri/appcache/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/appcache/downloads",
            "issues_url": "https://api.github.com/repos/distri/appcache/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/appcache/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/appcache/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/appcache/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/appcache/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/appcache/releases{/id}",
            "created_at": "2013-11-19T22:09:16Z",
            "updated_at": "2013-11-29T20:49:51Z",
            "pushed_at": "2013-11-19T22:10:28Z",
            "git_url": "git://github.com/distri/appcache.git",
            "ssh_url": "git@github.com:distri/appcache.git",
            "clone_url": "https://github.com/distri/appcache.git",
            "svn_url": "https://github.com/distri/appcache",
            "homepage": null,
            "size": 240,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.2.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "touch-canvas": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "touch-canvas\n============\n\nA canvas you can touch\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "entryPoint: \"touch_canvas\"\nversion: \"0.3.0\"\nremoteDependencies: [\n  \"//code.jquery.com/jquery-1.10.1.min.js\"\n  \"http://strd6.github.io/tempest/javascripts/envweb.js\"\n]\ndependencies:\n  \"pixie-canvas\": \"distri/pixie-canvas:v0.9.1\"\n",
          "type": "blob"
        },
        "touch_canvas.coffee.md": {
          "path": "touch_canvas.coffee.md",
          "mode": "100644",
          "content": "Touch Canvas\n============\n\nA canvas element that reports mouse and touch events in the range [0, 1].\n\n    PixieCanvas = require \"pixie-canvas\"\n\nA number really close to 1. We should never actually return 1, but move events\nmay get a little fast and loose with exiting the canvas, so let's play it safe.\n\n    MAX = 0.999999999999\n\n    TouchCanvas = (I={}) ->\n      self = PixieCanvas I\n\n      Core(I, self)\n\n      self.include Bindable\n\n      element = self.element()\n\n      # Keep track of if the mouse is active in the element\n      active = false\n\nWhen we click within the canvas set the value for the position we clicked at.\n\n      $(element).on \"mousedown\", (e) ->\n        active = true\n\n        self.trigger \"touch\", localPosition(e)\n\nHandle touch starts\n\n      $(element).on \"touchstart\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"touch\", localPosition(touch)\n\nWhen the mouse moves apply a change for each x value in the intervening positions.\n\n      $(element).on \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle moves outside of the element.\n\n      $(document).on \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle touch moves.\n\n      $(element).on \"touchmove\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"move\", localPosition(touch)\n\nHandle releases.\n\n      $(element).on \"mouseup\", (e) ->\n        self.trigger \"release\", localPosition(e)\n        active = false\n\n        return\n\nHandle touch ends.\n\n      $(element).on \"touchend\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"release\", localPosition(touch)\n\nWhenever the mouse button is released from anywhere, deactivate. Be sure to\ntrigger the release event if the mousedown started within the element.\n\n      $(document).on \"mouseup\", (e) ->\n        if active\n          self.trigger \"release\", localPosition(e)\n\n        active = false\n\n        return\n\nHelpers\n-------\n\nProcess touches\n\n      processTouches = (event, fn) ->\n        event.preventDefault()\n\n        if event.type is \"touchend\"\n          # touchend doesn't have any touches, but does have changed touches\n          touches = event.changedTouches\n        else\n          touches = event.touches\n\n        self.debug? Array::map.call touches, ({identifier, pageX, pageY}) ->\n          \"[#{identifier}: #{pageX}, #{pageY} (#{event.type})]\\n\"\n\n        Array::forEach.call touches, fn\n\nLocal event position.\n\n      localPosition = (e) ->\n        $currentTarget = $(element)\n        offset = $currentTarget.offset()\n\n        width = $currentTarget.width()\n        height = $currentTarget.height()\n\n        point = Point(\n          ((e.pageX - offset.left) / width).clamp(0, MAX)\n          ((e.pageY - offset.top) / height).clamp(0, MAX)\n        )\n\n        # Add mouse into touch identifiers as 0\n        point.identifier = (e.identifier + 1) or 0\n\n        return point\n\nReturn self\n\n      return self\n\nExport\n\n    module.exports = TouchCanvas\n",
          "type": "blob"
        }
      },
      "distribution": {
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"touch_canvas\",\"version\":\"0.3.0\",\"remoteDependencies\":[\"//code.jquery.com/jquery-1.10.1.min.js\",\"http://strd6.github.io/tempest/javascripts/envweb.js\"],\"dependencies\":{\"pixie-canvas\":\"distri/pixie-canvas:v0.9.1\"}};",
          "type": "blob"
        },
        "touch_canvas": {
          "path": "touch_canvas",
          "content": "(function() {\n  var MAX, PixieCanvas, TouchCanvas;\n\n  PixieCanvas = require(\"pixie-canvas\");\n\n  MAX = 0.999999999999;\n\n  TouchCanvas = function(I) {\n    var active, element, localPosition, processTouches, self;\n    if (I == null) {\n      I = {};\n    }\n    self = PixieCanvas(I);\n    Core(I, self);\n    self.include(Bindable);\n    element = self.element();\n    active = false;\n    $(element).on(\"mousedown\", function(e) {\n      active = true;\n      return self.trigger(\"touch\", localPosition(e));\n    });\n    $(element).on(\"touchstart\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"touch\", localPosition(touch));\n      });\n    });\n    $(element).on(\"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    $(document).on(\"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    $(element).on(\"touchmove\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"move\", localPosition(touch));\n      });\n    });\n    $(element).on(\"mouseup\", function(e) {\n      self.trigger(\"release\", localPosition(e));\n      active = false;\n    });\n    $(element).on(\"touchend\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"release\", localPosition(touch));\n      });\n    });\n    $(document).on(\"mouseup\", function(e) {\n      if (active) {\n        self.trigger(\"release\", localPosition(e));\n      }\n      active = false;\n    });\n    processTouches = function(event, fn) {\n      var touches;\n      event.preventDefault();\n      if (event.type === \"touchend\") {\n        touches = event.changedTouches;\n      } else {\n        touches = event.touches;\n      }\n      if (typeof self.debug === \"function\") {\n        self.debug(Array.prototype.map.call(touches, function(_arg) {\n          var identifier, pageX, pageY;\n          identifier = _arg.identifier, pageX = _arg.pageX, pageY = _arg.pageY;\n          return \"[\" + identifier + \": \" + pageX + \", \" + pageY + \" (\" + event.type + \")]\\n\";\n        }));\n      }\n      return Array.prototype.forEach.call(touches, fn);\n    };\n    localPosition = function(e) {\n      var $currentTarget, height, offset, point, width;\n      $currentTarget = $(element);\n      offset = $currentTarget.offset();\n      width = $currentTarget.width();\n      height = $currentTarget.height();\n      point = Point(((e.pageX - offset.left) / width).clamp(0, MAX), ((e.pageY - offset.top) / height).clamp(0, MAX));\n      point.identifier = (e.identifier + 1) || 0;\n      return point;\n    };\n    return self;\n  };\n\n  module.exports = TouchCanvas;\n\n}).call(this);\n\n//# sourceURL=touch_canvas.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.3.0",
      "entryPoint": "touch_canvas",
      "remoteDependencies": [
        "//code.jquery.com/jquery-1.10.1.min.js",
        "http://strd6.github.io/tempest/javascripts/envweb.js"
      ],
      "repository": {
        "id": 13783983,
        "name": "touch-canvas",
        "full_name": "distri/touch-canvas",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/touch-canvas",
        "description": "A canvas you can touch",
        "fork": false,
        "url": "https://api.github.com/repos/distri/touch-canvas",
        "forks_url": "https://api.github.com/repos/distri/touch-canvas/forks",
        "keys_url": "https://api.github.com/repos/distri/touch-canvas/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/touch-canvas/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/touch-canvas/teams",
        "hooks_url": "https://api.github.com/repos/distri/touch-canvas/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/touch-canvas/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/touch-canvas/events",
        "assignees_url": "https://api.github.com/repos/distri/touch-canvas/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/touch-canvas/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/touch-canvas/tags",
        "blobs_url": "https://api.github.com/repos/distri/touch-canvas/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/touch-canvas/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/touch-canvas/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/touch-canvas/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/touch-canvas/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/touch-canvas/languages",
        "stargazers_url": "https://api.github.com/repos/distri/touch-canvas/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/touch-canvas/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/touch-canvas/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/touch-canvas/subscription",
        "commits_url": "https://api.github.com/repos/distri/touch-canvas/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/touch-canvas/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/touch-canvas/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/touch-canvas/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/touch-canvas/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/touch-canvas/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/touch-canvas/merges",
        "archive_url": "https://api.github.com/repos/distri/touch-canvas/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/touch-canvas/downloads",
        "issues_url": "https://api.github.com/repos/distri/touch-canvas/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/touch-canvas/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/touch-canvas/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/touch-canvas/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/touch-canvas/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/touch-canvas/releases{/id}",
        "created_at": "2013-10-22T19:46:48Z",
        "updated_at": "2013-11-29T20:39:31Z",
        "pushed_at": "2013-11-29T20:38:52Z",
        "git_url": "git://github.com/distri/touch-canvas.git",
        "ssh_url": "git@github.com:distri/touch-canvas.git",
        "clone_url": "https://github.com/distri/touch-canvas.git",
        "svn_url": "https://github.com/distri/touch-canvas",
        "homepage": null,
        "size": 2900,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 1,
        "branch": "v0.3.0",
        "defaultBranch": "master"
      },
      "dependencies": {
        "pixie-canvas": {
          "source": {
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"pixie_canvas\"\nversion: \"0.9.1\"\n",
              "type": "blob"
            },
            "pixie_canvas.coffee.md": {
              "path": "pixie_canvas.coffee.md",
              "mode": "100644",
              "content": "Pixie Canvas\n============\n\nPixieCanvas provides a convenient wrapper for working with Context2d.\n\nMethods try to be as flexible as possible as to what arguments they take.\n\nNon-getter methods return `this` for method chaining.\n\n    TAU = 2 * Math.PI\n\n    module.exports = (options={}) ->\n        defaults options,\n          width: 400\n          height: 400\n          init: ->\n\n        canvas = document.createElement \"canvas\"\n        canvas.width = options.width\n        canvas.height = options.height\n\n        context = undefined\n\n        self =\n\n`clear` clears the entire canvas (or a portion of it).\n\nTo clear the entire canvas use `canvas.clear()`\n\n>     #! paint\n>     # Set up: Fill canvas with blue\n>     canvas.fill(\"blue\")\n>\n>     # Clear a portion of the canvas\n>     canvas.clear\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n\n          clear: ({x, y, width, height}={}) ->\n            x ?= 0\n            y ?= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            context.clearRect(x, y, width, height)\n\n            return this\n\nFills the entire canvas (or a specified section of it) with\nthe given color.\n\n>     #! paint\n>     # Paint the town (entire canvas) red\n>     canvas.fill \"red\"\n>\n>     # Fill a section of the canvas white (#FFF)\n>     canvas.fill\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#FFF\"\n\n          fill: (color={}) ->\n            unless (typeof color is \"string\") or color.channels\n              {x, y, width, height, bounds, color} = color\n\n            {x, y, width, height} = bounds if bounds\n\n            x ||= 0\n            y ||= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            @fillColor(color)\n            context.fillRect(x, y, width, height)\n\n            return this\n\nA direct map to the Context2d draw image. `GameObject`s\nthat implement drawable will have this wrapped up nicely,\nso there is a good chance that you will not have to deal with\nit directly.\n\n>     #! paint\n>     $ \"<img>\",\n>       src: \"https://secure.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045\"\n>       load: ->\n>         canvas.drawImage(this, 25, 25)\n\n          drawImage: (args...) ->\n            context.drawImage(args...)\n\n            return this\n\nDraws a circle at the specified position with the specified\nradius and color.\n\n>     #! paint\n>     # Draw a large orange circle\n>     canvas.drawCircle\n>       radius: 30\n>       position: Point(100, 75)\n>       color: \"orange\"\n>\n>     # You may also set a stroke\n>     canvas.drawCircle\n>       x: 25\n>       y: 50\n>       radius: 10\n>       color: \"blue\"\n>       stroke:\n>         color: \"red\"\n>         width: 1\n\nYou can pass in circle objects as well.\n\n>     #! paint\n>     # Create a circle object to set up the next examples\n>     circle =\n>       radius: 20\n>       x: 50\n>       y: 50\n>\n>     # Draw a given circle in yellow\n>     canvas.drawCircle\n>       circle: circle\n>       color: \"yellow\"\n>\n>     # Draw the circle in green at a different position\n>     canvas.drawCircle\n>       circle: circle\n>       position: Point(25, 75)\n>       color: \"green\"\n\nYou may set a stroke, or even pass in only a stroke to draw an unfilled circle.\n\n>     #! paint\n>     # Draw an outline circle in purple.\n>     canvas.drawCircle\n>       x: 50\n>       y: 75\n>       radius: 10\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n>\n\n          drawCircle: ({x, y, radius, position, color, stroke, circle}) ->\n            {x, y, radius} = circle if circle\n            {x, y} = position if position\n\n            radius = 0 if radius < 0\n\n            context.beginPath()\n            context.arc(x, y, radius, 0, TAU, true)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return this\n\nDraws a rectangle at the specified position with given\nwidth and height. Optionally takes a position, bounds\nand color argument.\n\n\n          drawRect: ({x, y, width, height, position, bounds, color, stroke}) ->\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            if color\n              @fillColor(color)\n              context.fillRect(x, y, width, height)\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.strokeRect(x, y, width, height)\n\n            return @\n\n>     #! paint\n>     # Draw a red rectangle using x, y, width and height\n>     canvas.drawRect\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#F00\"\n\n----\n\nYou can mix and match position, witdth and height.\n\n>     #! paint\n>     canvas.drawRect\n>       position: Point(0, 0)\n>       width: 50\n>       height: 50\n>       color: \"blue\"\n>       stroke:\n>         color: \"orange\"\n>         width: 3\n\n----\n\nA bounds can be reused to draw multiple rectangles.\n\n>     #! paint\n>     bounds =\n>       x: 100\n>       y: 0\n>       width: 100\n>       height: 100\n>\n>     # Draw a purple rectangle using bounds\n>     canvas.drawRect\n>       bounds: bounds\n>       color: \"green\"\n>\n>     # Draw the outline of the same bounds, but at a different position\n>     canvas.drawRect\n>       bounds: bounds\n>       position: Point(0, 50)\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n\n----\n\nDraw a line from `start` to `end`.\n\n>     #! paint\n>     # Draw a sweet diagonal\n>     canvas.drawLine\n>       start: Point(0, 0)\n>       end: Point(200, 200)\n>       color: \"purple\"\n>\n>     # Draw another sweet diagonal\n>     canvas.drawLine\n>       start: Point(200, 0)\n>       end: Point(0, 200)\n>       color: \"red\"\n>       width: 6\n>\n>     # Now draw a sweet horizontal with a direction and a length\n>     canvas.drawLine\n>       start: Point(0, 100)\n>       length: 200\n>       direction: Point(1, 0)\n>       color: \"orange\"\n\n          drawLine: ({start, end, width, color, direction, length}) ->\n            width ||= 3\n\n            if direction\n              end = direction.norm(length).add(start)\n\n            @lineWidth(width)\n            @strokeColor(color)\n\n            context.beginPath()\n            context.moveTo(start.x, start.y)\n            context.lineTo(end.x, end.y)\n            context.closePath()\n            context.stroke()\n\n            return this\n\nDraw a polygon.\n\n>     #! paint\n>     # Draw a sweet rhombus\n>     canvas.drawPoly\n>       points: [\n>         Point(50, 25)\n>         Point(75, 50)\n>         Point(50, 75)\n>         Point(25, 50)\n>       ]\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawPoly: ({points, color, stroke}) ->\n            context.beginPath()\n            points.forEach (point, i) ->\n              if i == 0\n                context.moveTo(point.x, point.y)\n              else\n                context.lineTo(point.x, point.y)\n            context.lineTo points[0].x, points[0].y\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return @\n\nDraw a rounded rectangle.\n\nAdapted from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html\n\n>     #! paint\n>     # Draw a purple rounded rectangle with a red outline\n>     canvas.drawRoundRect\n>       position: Point(25, 25)\n>       radius: 10\n>       width: 150\n>       height: 100\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawRoundRect: ({x, y, width, height, radius, position, bounds, color, stroke}) ->\n            radius = 5 unless radius?\n\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            context.beginPath()\n            context.moveTo(x + radius, y)\n            context.lineTo(x + width - radius, y)\n            context.quadraticCurveTo(x + width, y, x + width, y + radius)\n            context.lineTo(x + width, y + height - radius)\n            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)\n            context.lineTo(x + radius, y + height)\n            context.quadraticCurveTo(x, y + height, x, y + height - radius)\n            context.lineTo(x, y + radius)\n            context.quadraticCurveTo(x, y, x + radius, y)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @lineWidth(stroke.width)\n              @strokeColor(stroke.color)\n              context.stroke()\n\n            return this\n\nDraws text on the canvas at the given position, in the given color.\nIf no color is given then the previous fill color is used.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: '#eee'\n>\n>     # A line to indicate the baseline\n>     canvas.drawLine\n>       start: Point(25, 50)\n>       end: Point(125, 50)\n>       color: \"#333\"\n>       width: 1\n>\n>     # Draw some text, note the position of the baseline\n>     canvas.drawText\n>       position: Point(25, 50)\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n\n\n          drawText: ({x, y, text, position, color, font}) ->\n            {x, y} = position if position\n\n            @fillColor(color)\n            @font(font) if font\n            context.fillText(text, x, y)\n\n            return this\n\nCenters the given text on the canvas at the given y position. An x position\nor point position can also be given in which case the text is centered at the\nx, y or position value specified.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: \"#eee\"\n>\n>     # Center text on the screen at y value 25\n>     canvas.centerText\n>       y: 25\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n>\n>     # Center text at point (75, 75)\n>     canvas.centerText\n>       position: Point(75, 75)\n>       color: \"green\"\n>       text: \"take this\"\n\n          centerText: ({text, x, y, position, color, font}) ->\n            {x, y} = position if position\n\n            x = canvas.width / 2 unless x?\n\n            textWidth = @measureText(text)\n\n            @drawText {\n              text\n              color\n              font\n              x: x - (textWidth) / 2\n              y\n            }\n\nSetting the fill color:\n\n`canvas.fillColor(\"#FF0000\")`\n\nPassing no arguments returns the fillColor:\n\n`canvas.fillColor() # => \"#FF000000\"`\n\nYou can also pass a Color object:\n\n`canvas.fillColor(Color('sky blue'))`\n\n          fillColor: (color) ->\n            if color\n              if color.channels\n                context.fillStyle = color.toString()\n              else\n                context.fillStyle = color\n\n              return @\n            else\n              return context.fillStyle\n\nSetting the stroke color:\n\n`canvas.strokeColor(\"#FF0000\")`\n\nPassing no arguments returns the strokeColor:\n\n`canvas.strokeColor() # => \"#FF0000\"`\n\nYou can also pass a Color object:\n\n`canvas.strokeColor(Color('sky blue'))`\n\n          strokeColor: (color) ->\n            if color\n              if color.channels\n                context.strokeStyle = color.toString()\n              else\n                context.strokeStyle = color\n\n              return this\n            else\n              return context.strokeStyle\n\nDetermine how wide some text is.\n\n`canvas.measureText('Hello World!') # => 55`\n\nIt may have accuracy issues depending on the font used.\n\n          measureText: (text) ->\n            context.measureText(text).width\n\nPasses this canvas to the block with the given matrix transformation\napplied. All drawing methods called within the block will draw\ninto the canvas with the transformation applied. The transformation\nis removed at the end of the block, even if the block throws an error.\n\n          withTransform: (matrix, block) ->\n            context.save()\n\n            context.transform(\n              matrix.a,\n              matrix.b,\n              matrix.c,\n              matrix.d,\n              matrix.tx,\n              matrix.ty\n            )\n\n            try\n              block(this)\n            finally\n              context.restore()\n\n            return this\n\nStraight proxy to context `putImageData` method.\n\n          putImageData: (args...) ->\n            context.putImageData(args...)\n\n            return this\n\nContext getter.\n\n          context: ->\n            context\n\nGetter for the actual html canvas element.\n\n          element: ->\n            canvas\n\nStraight proxy to context pattern creation.\n\n          createPattern: (image, repitition) ->\n            context.createPattern(image, repitition)\n\nSet a clip rectangle.\n\n          clip: (x, y, width, height) ->\n            context.beginPath()\n            context.rect(x, y, width, height)\n            context.clip()\n\n            return this\n\nGenerate accessors that get properties from the context object.\n\n        contextAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                context[attr] = newVal\n                return @\n              else\n                context[attr]\n\n        contextAttrAccessor(\n          \"font\",\n          \"globalAlpha\",\n          \"globalCompositeOperation\",\n          \"lineWidth\",\n          \"textAlign\",\n        )\n\nGenerate accessors that get properties from the canvas object.\n\n        canvasAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                canvas[attr] = newVal\n                return @\n              else\n                canvas[attr]\n\n        canvasAttrAccessor(\n          \"height\",\n          \"width\",\n        )\n\n        context = canvas.getContext('2d')\n\n        options.init(self)\n\n        return self\n\nDepend on either jQuery or Zepto for now (TODO: Don't depend on either)\n\nHelpers\n-------\n\nFill in default properties for an object, setting them only if they are not\nalready present.\n\n    defaults = (target, objects...) ->\n      for object in objects\n        for name of object\n          unless target.hasOwnProperty(name)\n            target[name] = object[name]\n\n      return target\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     Canvas = require \"/pixie_canvas\"\n>\n>     window.Point ?= (x, y) ->\n>       x: x\n>       y: y\n>\n>     Interactive.register \"paint\", ({source, runtimeElement}) ->\n>       canvas = Canvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
              "type": "blob"
            },
            "test/test.coffee": {
              "path": "test/test.coffee",
              "mode": "100644",
              "content": "Canvas = require \"../pixie_canvas\"\n\ndescribe \"pixie canvas\", ->\n  it \"Should create a canvas\", ->\n    canvas = Canvas\n      width: 400\n      height: 150\n\n    assert canvas\n    \n    assert canvas.width() is 400\n",
              "type": "blob"
            }
          },
          "distribution": {
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"pixie_canvas\",\"version\":\"0.9.1\"};",
              "type": "blob"
            },
            "pixie_canvas": {
              "path": "pixie_canvas",
              "content": "(function() {\n  var TAU, defaults,\n    __slice = [].slice;\n\n  TAU = 2 * Math.PI;\n\n  module.exports = function(options) {\n    var canvas, canvasAttrAccessor, context, contextAttrAccessor, self;\n    if (options == null) {\n      options = {};\n    }\n    defaults(options, {\n      width: 400,\n      height: 400,\n      init: function() {}\n    });\n    canvas = document.createElement(\"canvas\");\n    canvas.width = options.width;\n    canvas.height = options.height;\n    context = void 0;\n    self = {\n      clear: function(_arg) {\n        var height, width, x, y, _ref;\n        _ref = _arg != null ? _arg : {}, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;\n        if (x == null) {\n          x = 0;\n        }\n        if (y == null) {\n          y = 0;\n        }\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        context.clearRect(x, y, width, height);\n        return this;\n      },\n      fill: function(color) {\n        var bounds, height, width, x, y, _ref;\n        if (color == null) {\n          color = {};\n        }\n        if (!((typeof color === \"string\") || color.channels)) {\n          _ref = color, x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height, bounds = _ref.bounds, color = _ref.color;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        x || (x = 0);\n        y || (y = 0);\n        if (width == null) {\n          width = canvas.width;\n        }\n        if (height == null) {\n          height = canvas.height;\n        }\n        this.fillColor(color);\n        context.fillRect(x, y, width, height);\n        return this;\n      },\n      drawImage: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.drawImage.apply(context, args);\n        return this;\n      },\n      drawCircle: function(_arg) {\n        var circle, color, position, radius, stroke, x, y;\n        x = _arg.x, y = _arg.y, radius = _arg.radius, position = _arg.position, color = _arg.color, stroke = _arg.stroke, circle = _arg.circle;\n        if (circle) {\n          x = circle.x, y = circle.y, radius = circle.radius;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (radius < 0) {\n          radius = 0;\n        }\n        context.beginPath();\n        context.arc(x, y, radius, 0, TAU, true);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRect: function(_arg) {\n        var bounds, color, height, position, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (color) {\n          this.fillColor(color);\n          context.fillRect(x, y, width, height);\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.strokeRect(x, y, width, height);\n        }\n        return this;\n      },\n      drawLine: function(_arg) {\n        var color, direction, end, length, start, width;\n        start = _arg.start, end = _arg.end, width = _arg.width, color = _arg.color, direction = _arg.direction, length = _arg.length;\n        width || (width = 3);\n        if (direction) {\n          end = direction.norm(length).add(start);\n        }\n        this.lineWidth(width);\n        this.strokeColor(color);\n        context.beginPath();\n        context.moveTo(start.x, start.y);\n        context.lineTo(end.x, end.y);\n        context.closePath();\n        context.stroke();\n        return this;\n      },\n      drawPoly: function(_arg) {\n        var color, points, stroke;\n        points = _arg.points, color = _arg.color, stroke = _arg.stroke;\n        context.beginPath();\n        points.forEach(function(point, i) {\n          if (i === 0) {\n            return context.moveTo(point.x, point.y);\n          } else {\n            return context.lineTo(point.x, point.y);\n          }\n        });\n        context.lineTo(points[0].x, points[0].y);\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.strokeColor(stroke.color);\n          this.lineWidth(stroke.width);\n          context.stroke();\n        }\n        return this;\n      },\n      drawRoundRect: function(_arg) {\n        var bounds, color, height, position, radius, stroke, width, x, y;\n        x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height, radius = _arg.radius, position = _arg.position, bounds = _arg.bounds, color = _arg.color, stroke = _arg.stroke;\n        if (radius == null) {\n          radius = 5;\n        }\n        if (bounds) {\n          x = bounds.x, y = bounds.y, width = bounds.width, height = bounds.height;\n        }\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        context.beginPath();\n        context.moveTo(x + radius, y);\n        context.lineTo(x + width - radius, y);\n        context.quadraticCurveTo(x + width, y, x + width, y + radius);\n        context.lineTo(x + width, y + height - radius);\n        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);\n        context.lineTo(x + radius, y + height);\n        context.quadraticCurveTo(x, y + height, x, y + height - radius);\n        context.lineTo(x, y + radius);\n        context.quadraticCurveTo(x, y, x + radius, y);\n        context.closePath();\n        if (color) {\n          this.fillColor(color);\n          context.fill();\n        }\n        if (stroke) {\n          this.lineWidth(stroke.width);\n          this.strokeColor(stroke.color);\n          context.stroke();\n        }\n        return this;\n      },\n      drawText: function(_arg) {\n        var color, font, position, text, x, y;\n        x = _arg.x, y = _arg.y, text = _arg.text, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        this.fillColor(color);\n        if (font) {\n          this.font(font);\n        }\n        context.fillText(text, x, y);\n        return this;\n      },\n      centerText: function(_arg) {\n        var color, font, position, text, textWidth, x, y;\n        text = _arg.text, x = _arg.x, y = _arg.y, position = _arg.position, color = _arg.color, font = _arg.font;\n        if (position) {\n          x = position.x, y = position.y;\n        }\n        if (x == null) {\n          x = canvas.width / 2;\n        }\n        textWidth = this.measureText(text);\n        return this.drawText({\n          text: text,\n          color: color,\n          font: font,\n          x: x - textWidth / 2,\n          y: y\n        });\n      },\n      fillColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.fillStyle = color.toString();\n          } else {\n            context.fillStyle = color;\n          }\n          return this;\n        } else {\n          return context.fillStyle;\n        }\n      },\n      strokeColor: function(color) {\n        if (color) {\n          if (color.channels) {\n            context.strokeStyle = color.toString();\n          } else {\n            context.strokeStyle = color;\n          }\n          return this;\n        } else {\n          return context.strokeStyle;\n        }\n      },\n      measureText: function(text) {\n        return context.measureText(text).width;\n      },\n      withTransform: function(matrix, block) {\n        context.save();\n        context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);\n        try {\n          block(this);\n        } finally {\n          context.restore();\n        }\n        return this;\n      },\n      putImageData: function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        context.putImageData.apply(context, args);\n        return this;\n      },\n      context: function() {\n        return context;\n      },\n      element: function() {\n        return canvas;\n      },\n      createPattern: function(image, repitition) {\n        return context.createPattern(image, repitition);\n      },\n      clip: function(x, y, width, height) {\n        context.beginPath();\n        context.rect(x, y, width, height);\n        context.clip();\n        return this;\n      }\n    };\n    contextAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            context[attr] = newVal;\n            return this;\n          } else {\n            return context[attr];\n          }\n        };\n      });\n    };\n    contextAttrAccessor(\"font\", \"globalAlpha\", \"globalCompositeOperation\", \"lineWidth\", \"textAlign\");\n    canvasAttrAccessor = function() {\n      var attrs;\n      attrs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return attrs.forEach(function(attr) {\n        return self[attr] = function(newVal) {\n          if (newVal != null) {\n            canvas[attr] = newVal;\n            return this;\n          } else {\n            return canvas[attr];\n          }\n        };\n      });\n    };\n    canvasAttrAccessor(\"height\", \"width\");\n    context = canvas.getContext('2d');\n    options.init(self);\n    return self;\n  };\n\n  defaults = function() {\n    var name, object, objects, target, _i, _len;\n    target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = objects.length; _i < _len; _i++) {\n      object = objects[_i];\n      for (name in object) {\n        if (!target.hasOwnProperty(name)) {\n          target[name] = object[name];\n        }\n      }\n    }\n    return target;\n  };\n\n}).call(this);\n\n//# sourceURL=pixie_canvas.coffee",
              "type": "blob"
            },
            "test/test": {
              "path": "test/test",
              "content": "(function() {\n  var Canvas;\n\n  Canvas = require(\"../pixie_canvas\");\n\n  describe(\"pixie canvas\", function() {\n    return it(\"Should create a canvas\", function() {\n      var canvas;\n      canvas = Canvas({\n        width: 400,\n        height: 150\n      });\n      assert(canvas);\n      return assert(canvas.width() === 400);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/test.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.9.1",
          "entryPoint": "pixie_canvas",
          "repository": {
            "id": 12096899,
            "name": "pixie-canvas",
            "full_name": "distri/pixie-canvas",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/pixie-canvas",
            "description": "A pretty ok HTML5 canvas wrapper",
            "fork": false,
            "url": "https://api.github.com/repos/distri/pixie-canvas",
            "forks_url": "https://api.github.com/repos/distri/pixie-canvas/forks",
            "keys_url": "https://api.github.com/repos/distri/pixie-canvas/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/pixie-canvas/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/pixie-canvas/teams",
            "hooks_url": "https://api.github.com/repos/distri/pixie-canvas/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/pixie-canvas/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/pixie-canvas/events",
            "assignees_url": "https://api.github.com/repos/distri/pixie-canvas/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/pixie-canvas/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/pixie-canvas/tags",
            "blobs_url": "https://api.github.com/repos/distri/pixie-canvas/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/pixie-canvas/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/pixie-canvas/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/pixie-canvas/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/pixie-canvas/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/pixie-canvas/languages",
            "stargazers_url": "https://api.github.com/repos/distri/pixie-canvas/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/pixie-canvas/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/pixie-canvas/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/pixie-canvas/subscription",
            "commits_url": "https://api.github.com/repos/distri/pixie-canvas/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/pixie-canvas/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/pixie-canvas/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/pixie-canvas/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/pixie-canvas/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/pixie-canvas/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/pixie-canvas/merges",
            "archive_url": "https://api.github.com/repos/distri/pixie-canvas/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/pixie-canvas/downloads",
            "issues_url": "https://api.github.com/repos/distri/pixie-canvas/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/pixie-canvas/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/pixie-canvas/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/pixie-canvas/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/pixie-canvas/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/pixie-canvas/releases{/id}",
            "created_at": "2013-08-14T01:15:34Z",
            "updated_at": "2013-11-29T20:35:57Z",
            "pushed_at": "2013-11-29T20:34:09Z",
            "git_url": "git://github.com/distri/pixie-canvas.git",
            "ssh_url": "git@github.com:distri/pixie-canvas.git",
            "clone_url": "https://github.com/distri/pixie-canvas.git",
            "svn_url": "https://github.com/distri/pixie-canvas",
            "homepage": null,
            "size": 2464,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 1,
            "forks": 0,
            "open_issues": 1,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.9.1",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "undo": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "undo\n====\n\nUndo module for editors.\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Undo\n====\n\nAn editor module for editors that support undo/redo\n\n    CommandStack = require \"command-stack\"\n\n    module.exports = (I={}, self=Core(I)) ->\n      commandStack = CommandStack()\n\n      self.extend\n        history: (newHistory=[]) ->\n          if arguments.length > 0\n            commandStack = CommandStack newHistory\n          else\n            commandStack.stack()\n\n        execute: (command) ->\n          commandStack.execute command\n\n          return self\n\n        undo: ->\n          commandStack.undo()\n\n          return self\n\n        redo: ->\n          commandStack.redo()\n\n          return self\n\n      return self\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"\n]\ndependencies:\n  \"command-stack\": \"distri/command-stack:v0.11.0\"\n",
          "type": "blob"
        },
        "test/undo.coffee": {
          "path": "test/undo.coffee",
          "mode": "100644",
          "content": "Undo = require \"../main\"\n\ndescribe \"undo\", ->\n  it \"should undo\", ->\n    undo = Undo()\n    \n    undo.execute\n      execute: ->\n        console.log \"execute\"\n      undo: ->\n        console.log \"undo\"\n    \n    undo.undo()\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var CommandStack;\n\n  CommandStack = require(\"command-stack\");\n\n  module.exports = function(I, self) {\n    var commandStack;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    commandStack = CommandStack();\n    self.extend({\n      history: function(newHistory) {\n        if (newHistory == null) {\n          newHistory = [];\n        }\n        if (arguments.length > 0) {\n          return commandStack = CommandStack(newHistory);\n        } else {\n          return commandStack.stack();\n        }\n      },\n      execute: function(command) {\n        commandStack.execute(command);\n        return self;\n      },\n      undo: function() {\n        commandStack.undo();\n        return self;\n      },\n      redo: function() {\n        commandStack.redo();\n        return self;\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"],\"dependencies\":{\"command-stack\":\"distri/command-stack:v0.11.0\"}};",
          "type": "blob"
        },
        "test/undo": {
          "path": "test/undo",
          "content": "(function() {\n  var Undo;\n\n  Undo = require(\"../main\");\n\n  describe(\"undo\", function() {\n    return it(\"should undo\", function() {\n      var undo;\n      undo = Undo();\n      undo.execute({\n        execute: function() {\n          return console.log(\"execute\");\n        },\n        undo: function() {\n          return console.log(\"undo\");\n        }\n      });\n      return undo.undo();\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/undo.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "main",
      "remoteDependencies": [
        "http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js"
      ],
      "repository": {
        "id": 14673255,
        "name": "undo",
        "full_name": "distri/undo",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/undo",
        "description": "Undo module for editors.",
        "fork": false,
        "url": "https://api.github.com/repos/distri/undo",
        "forks_url": "https://api.github.com/repos/distri/undo/forks",
        "keys_url": "https://api.github.com/repos/distri/undo/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/undo/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/undo/teams",
        "hooks_url": "https://api.github.com/repos/distri/undo/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/undo/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/undo/events",
        "assignees_url": "https://api.github.com/repos/distri/undo/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/undo/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/undo/tags",
        "blobs_url": "https://api.github.com/repos/distri/undo/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/undo/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/undo/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/undo/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/undo/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/undo/languages",
        "stargazers_url": "https://api.github.com/repos/distri/undo/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/undo/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/undo/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/undo/subscription",
        "commits_url": "https://api.github.com/repos/distri/undo/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/undo/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/undo/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/undo/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/undo/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/undo/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/undo/merges",
        "archive_url": "https://api.github.com/repos/distri/undo/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/undo/downloads",
        "issues_url": "https://api.github.com/repos/distri/undo/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/undo/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/undo/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/undo/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/undo/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/undo/releases{/id}",
        "created_at": "2013-11-25T01:31:38Z",
        "updated_at": "2013-11-25T01:40:59Z",
        "pushed_at": "2013-11-25T01:40:58Z",
        "git_url": "git://github.com/distri/undo.git",
        "ssh_url": "git@github.com:distri/undo.git",
        "clone_url": "https://github.com/distri/undo.git",
        "svn_url": "https://github.com/distri/undo",
        "homepage": null,
        "size": 336,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "CoffeeScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
          "gravatar_id": null,
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.2.0",
        "defaultBranch": "master"
      },
      "dependencies": {
        "command-stack": {
          "source": {
            "main.coffee.md": {
              "path": "main.coffee.md",
              "mode": "100644",
              "content": "Command Stack\n-------------\n\nA simple stack based implementation of executable and undoable commands.\n\n    CommandStack = (stack=[]) ->\n      index = stack.length\n\n      execute: (command) ->\n        stack[index] = command\n        command.execute()\n\n        index += 1\n\n        # Be sure to blast obsolete redos\n        stack.length = index\n\n        return this\n\n      undo: ->\n        if @canUndo()\n          index -= 1\n\n          command = stack[index]\n          command.undo()\n\n          return command\n\n      redo: ->\n        if @canRedo()\n          command = stack[index]\n          command.execute()\n\n          index += 1\n\n          return command\n\n      current: ->\n        stack[index-1]\n\n      canUndo: ->\n        index > 0\n\n      canRedo: ->\n        stack[index]?\n\n      stack: ->\n        stack.slice(0, index)\n\n    module.exports = CommandStack\n\nTODO\n----\n\nIntegrate Observables\n",
              "type": "blob"
            },
            "package.json": {
              "path": "package.json",
              "mode": "100644",
              "content": "{\n  \"name\": \"commando\",\n  \"version\": \"0.9.0\",\n  \"description\": \"Simple Command Pattern\",\n  \"devDependencies\": {\n    \"coffee-script\": \"~1.6.3\",\n    \"mocha\": \"~1.12.0\",\n    \"uglify-js\": \"~2.3.6\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/STRd6/commando.git\"\n  },\n  \"files\": [\n    \"dist\"\n  ],\n  \"main\": \"dist/commando.js\"\n}\n",
              "type": "blob"
            },
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "version: \"0.11.0\"\n",
              "type": "blob"
            },
            "test/command_stack.coffee": {
              "path": "test/command_stack.coffee",
              "mode": "100644",
              "content": "CommandStack = require \"../main\"\n\nok = assert\nequals = assert.equal\n\ndescribe \"CommandStack\", ->\n  it \"undo on an empty stack returns undefined\", ->\n    commandStack = CommandStack()\n  \n    equals commandStack.undo(), undefined\n  \n  it \"redo on an empty stack returns undefined\", ->\n    commandStack = CommandStack()\n  \n    equals commandStack.redo(), undefined\n  \n  it \"executes commands\", ->\n    command =\n      execute: ->\n        ok true, \"command executed\"\n  \n    commandStack = CommandStack()\n  \n    commandStack.execute command\n  \n  it \"can undo\", ->\n    command =\n      execute: ->\n      undo: ->\n        ok true, \"command executed\"\n  \n    commandStack = CommandStack()\n    commandStack.execute command\n  \n    commandStack.undo()\n  \n  it \"can redo\", ->\n    command =\n      execute: ->\n        ok true, \"command executed\"\n      undo: ->\n  \n    commandStack = CommandStack()\n    commandStack.execute command\n  \n    commandStack.undo()\n    commandStack.redo()\n  \n  it \"executes redone command once on redo\", ->\n    command =\n      execute: ->\n        ok true, \"command executed\"\n      undo: ->\n  \n    commandStack = CommandStack()\n    commandStack.execute command\n  \n    commandStack.undo()\n    commandStack.redo()\n  \n    equals commandStack.redo(), undefined\n    equals commandStack.redo(), undefined\n  \n  it \"command is returned when undone\", ->\n    command =\n      execute: ->\n      undo: ->\n  \n    commandStack = CommandStack()\n    commandStack.execute command\n  \n    equals commandStack.undo(), command, \"Undone command is returned\"\n  \n  it \"command is returned when redone\", ->\n    command =\n      execute: ->\n      undo: ->\n  \n    commandStack = CommandStack()\n    commandStack.execute command\n    commandStack.undo()\n  \n    equals commandStack.redo(), command, \"Redone command is returned\"\n  \n  it \"cannot redo an obsolete future\", ->\n    Command = ->\n      execute: ->\n      undo: ->\n  \n    commandStack = CommandStack()\n    commandStack.execute Command()\n    commandStack.execute Command()\n  \n    commandStack.undo()\n    commandStack.undo()\n  \n    equals commandStack.canRedo(), true\n  \n    commandStack.execute Command()\n  \n    equals commandStack.canRedo(), false\n",
              "type": "blob"
            }
          },
          "distribution": {
            "main": {
              "path": "main",
              "content": "(function() {\n  var CommandStack;\n\n  CommandStack = function(stack) {\n    var index;\n    if (stack == null) {\n      stack = [];\n    }\n    index = stack.length;\n    return {\n      execute: function(command) {\n        stack[index] = command;\n        command.execute();\n        index += 1;\n        stack.length = index;\n        return this;\n      },\n      undo: function() {\n        var command;\n        if (this.canUndo()) {\n          index -= 1;\n          command = stack[index];\n          command.undo();\n          return command;\n        }\n      },\n      redo: function() {\n        var command;\n        if (this.canRedo()) {\n          command = stack[index];\n          command.execute();\n          index += 1;\n          return command;\n        }\n      },\n      current: function() {\n        return stack[index - 1];\n      },\n      canUndo: function() {\n        return index > 0;\n      },\n      canRedo: function() {\n        return stack[index] != null;\n      },\n      stack: function() {\n        return stack.slice(0, index);\n      }\n    };\n  };\n\n  module.exports = CommandStack;\n\n}).call(this);\n\n//# sourceURL=main.coffee",
              "type": "blob"
            },
            "package": {
              "path": "package",
              "content": "module.exports = {\"name\":\"commando\",\"version\":\"0.9.0\",\"description\":\"Simple Command Pattern\",\"devDependencies\":{\"coffee-script\":\"~1.6.3\",\"mocha\":\"~1.12.0\",\"uglify-js\":\"~2.3.6\"},\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/STRd6/commando.git\"},\"files\":[\"dist\"],\"main\":\"dist/commando.js\"};",
              "type": "blob"
            },
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"version\":\"0.11.0\"};",
              "type": "blob"
            },
            "test/command_stack": {
              "path": "test/command_stack",
              "content": "(function() {\n  var CommandStack, equals, ok;\n\n  CommandStack = require(\"../main\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  describe(\"CommandStack\", function() {\n    it(\"undo on an empty stack returns undefined\", function() {\n      var commandStack;\n      commandStack = CommandStack();\n      return equals(commandStack.undo(), void 0);\n    });\n    it(\"redo on an empty stack returns undefined\", function() {\n      var commandStack;\n      commandStack = CommandStack();\n      return equals(commandStack.redo(), void 0);\n    });\n    it(\"executes commands\", function() {\n      var command, commandStack;\n      command = {\n        execute: function() {\n          return ok(true, \"command executed\");\n        }\n      };\n      commandStack = CommandStack();\n      return commandStack.execute(command);\n    });\n    it(\"can undo\", function() {\n      var command, commandStack;\n      command = {\n        execute: function() {},\n        undo: function() {\n          return ok(true, \"command executed\");\n        }\n      };\n      commandStack = CommandStack();\n      commandStack.execute(command);\n      return commandStack.undo();\n    });\n    it(\"can redo\", function() {\n      var command, commandStack;\n      command = {\n        execute: function() {\n          return ok(true, \"command executed\");\n        },\n        undo: function() {}\n      };\n      commandStack = CommandStack();\n      commandStack.execute(command);\n      commandStack.undo();\n      return commandStack.redo();\n    });\n    it(\"executes redone command once on redo\", function() {\n      var command, commandStack;\n      command = {\n        execute: function() {\n          return ok(true, \"command executed\");\n        },\n        undo: function() {}\n      };\n      commandStack = CommandStack();\n      commandStack.execute(command);\n      commandStack.undo();\n      commandStack.redo();\n      equals(commandStack.redo(), void 0);\n      return equals(commandStack.redo(), void 0);\n    });\n    it(\"command is returned when undone\", function() {\n      var command, commandStack;\n      command = {\n        execute: function() {},\n        undo: function() {}\n      };\n      commandStack = CommandStack();\n      commandStack.execute(command);\n      return equals(commandStack.undo(), command, \"Undone command is returned\");\n    });\n    it(\"command is returned when redone\", function() {\n      var command, commandStack;\n      command = {\n        execute: function() {},\n        undo: function() {}\n      };\n      commandStack = CommandStack();\n      commandStack.execute(command);\n      commandStack.undo();\n      return equals(commandStack.redo(), command, \"Redone command is returned\");\n    });\n    return it(\"cannot redo an obsolete future\", function() {\n      var Command, commandStack;\n      Command = function() {\n        return {\n          execute: function() {},\n          undo: function() {}\n        };\n      };\n      commandStack = CommandStack();\n      commandStack.execute(Command());\n      commandStack.execute(Command());\n      commandStack.undo();\n      commandStack.undo();\n      equals(commandStack.canRedo(), true);\n      commandStack.execute(Command());\n      return equals(commandStack.canRedo(), false);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/command_stack.coffee",
              "type": "blob"
            }
          },
          "progenitor": {
            "url": "http://strd6.github.io/editor/"
          },
          "version": "0.11.0",
          "entryPoint": "main",
          "repository": {
            "id": 11981428,
            "name": "command-stack",
            "full_name": "distri/command-stack",
            "owner": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/distri/command-stack",
            "description": "A stack for holding command objects.",
            "fork": false,
            "url": "https://api.github.com/repos/distri/command-stack",
            "forks_url": "https://api.github.com/repos/distri/command-stack/forks",
            "keys_url": "https://api.github.com/repos/distri/command-stack/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/distri/command-stack/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/distri/command-stack/teams",
            "hooks_url": "https://api.github.com/repos/distri/command-stack/hooks",
            "issue_events_url": "https://api.github.com/repos/distri/command-stack/issues/events{/number}",
            "events_url": "https://api.github.com/repos/distri/command-stack/events",
            "assignees_url": "https://api.github.com/repos/distri/command-stack/assignees{/user}",
            "branches_url": "https://api.github.com/repos/distri/command-stack/branches{/branch}",
            "tags_url": "https://api.github.com/repos/distri/command-stack/tags",
            "blobs_url": "https://api.github.com/repos/distri/command-stack/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/distri/command-stack/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/distri/command-stack/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/distri/command-stack/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/distri/command-stack/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/distri/command-stack/languages",
            "stargazers_url": "https://api.github.com/repos/distri/command-stack/stargazers",
            "contributors_url": "https://api.github.com/repos/distri/command-stack/contributors",
            "subscribers_url": "https://api.github.com/repos/distri/command-stack/subscribers",
            "subscription_url": "https://api.github.com/repos/distri/command-stack/subscription",
            "commits_url": "https://api.github.com/repos/distri/command-stack/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/distri/command-stack/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/distri/command-stack/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/distri/command-stack/issues/comments/{number}",
            "contents_url": "https://api.github.com/repos/distri/command-stack/contents/{+path}",
            "compare_url": "https://api.github.com/repos/distri/command-stack/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/distri/command-stack/merges",
            "archive_url": "https://api.github.com/repos/distri/command-stack/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/distri/command-stack/downloads",
            "issues_url": "https://api.github.com/repos/distri/command-stack/issues{/number}",
            "pulls_url": "https://api.github.com/repos/distri/command-stack/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/distri/command-stack/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/distri/command-stack/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/distri/command-stack/labels{/name}",
            "releases_url": "https://api.github.com/repos/distri/command-stack/releases{/id}",
            "created_at": "2013-08-08T16:51:40Z",
            "updated_at": "2013-11-25T00:40:55Z",
            "pushed_at": "2013-11-25T00:40:53Z",
            "git_url": "git://github.com/distri/command-stack.git",
            "ssh_url": "git@github.com:distri/command-stack.git",
            "clone_url": "https://github.com/distri/command-stack.git",
            "svn_url": "https://github.com/distri/command-stack",
            "homepage": "",
            "size": 664,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": "CoffeeScript",
            "has_issues": true,
            "has_downloads": true,
            "has_wiki": true,
            "forks_count": 0,
            "mirror_url": null,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "default_branch": "master",
            "master_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "organization": {
              "login": "distri",
              "id": 6005125,
              "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
              "gravatar_id": null,
              "url": "https://api.github.com/users/distri",
              "html_url": "https://github.com/distri",
              "followers_url": "https://api.github.com/users/distri/followers",
              "following_url": "https://api.github.com/users/distri/following{/other_user}",
              "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
              "organizations_url": "https://api.github.com/users/distri/orgs",
              "repos_url": "https://api.github.com/users/distri/repos",
              "events_url": "https://api.github.com/users/distri/events{/privacy}",
              "received_events_url": "https://api.github.com/users/distri/received_events",
              "type": "Organization",
              "site_admin": false
            },
            "network_count": 0,
            "subscribers_count": 1,
            "branch": "v0.11.0",
            "defaultBranch": "master"
          },
          "dependencies": {}
        }
      }
    },
    "util": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "mode": "100644",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "mode": "100644",
          "content": "util\n====\n\nSmall utility methods for JS\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Util\n====\n\n    module.exports =\n      approach: (current, target, amount) ->\n        (target - current).clamp(-amount, amount) + current\n\nApply a stylesheet idempotently.\n\n      applyStylesheet: (style, id=\"primary\") ->\n        styleNode = document.createElement(\"style\")\n        styleNode.innerHTML = style\n        styleNode.id = id\n\n        if previousStyleNode = document.head.querySelector(\"style##{id}\")\n          previousStyleNode.parentNode.removeChild(prevousStyleNode)\n\n        document.head.appendChild(styleNode)\n\n      defaults: (target, objects...) ->\n        for object in objects\n          for name of object\n            unless target.hasOwnProperty(name)\n              target[name] = object[name]\n\n        return target\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.1.0\"\n",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    approach: function(current, target, amount) {\n      return (target - current).clamp(-amount, amount) + current;\n    },\n    applyStylesheet: function(style, id) {\n      var previousStyleNode, styleNode;\n      if (id == null) {\n        id = \"primary\";\n      }\n      styleNode = document.createElement(\"style\");\n      styleNode.innerHTML = style;\n      styleNode.id = id;\n      if (previousStyleNode = document.head.querySelector(\"style#\" + id)) {\n        previousStyleNode.parentNode.removeChild(prevousStyleNode);\n      }\n      return document.head.appendChild(styleNode);\n    },\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.0\"};",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.1.0",
      "entryPoint": "main",
      "repository": {
        "id": 18501018,
        "name": "util",
        "full_name": "distri/util",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/distri/util",
        "description": "Small utility methods for JS",
        "fork": false,
        "url": "https://api.github.com/repos/distri/util",
        "forks_url": "https://api.github.com/repos/distri/util/forks",
        "keys_url": "https://api.github.com/repos/distri/util/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/util/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/util/teams",
        "hooks_url": "https://api.github.com/repos/distri/util/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/util/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/util/events",
        "assignees_url": "https://api.github.com/repos/distri/util/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/util/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/util/tags",
        "blobs_url": "https://api.github.com/repos/distri/util/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/util/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/util/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/util/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/util/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/util/languages",
        "stargazers_url": "https://api.github.com/repos/distri/util/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/util/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/util/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/util/subscription",
        "commits_url": "https://api.github.com/repos/distri/util/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/util/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/util/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/util/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/util/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/util/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/util/merges",
        "archive_url": "https://api.github.com/repos/distri/util/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/util/downloads",
        "issues_url": "https://api.github.com/repos/distri/util/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/util/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/util/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/util/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/util/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/util/releases{/id}",
        "created_at": "2014-04-06T22:42:56Z",
        "updated_at": "2014-04-06T22:42:56Z",
        "pushed_at": "2014-04-06T22:42:56Z",
        "git_url": "git://github.com/distri/util.git",
        "ssh_url": "git@github.com:distri/util.git",
        "clone_url": "https://github.com/distri/util.git",
        "svn_url": "https://github.com/distri/util",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "master_branch": "master",
        "permissions": {
          "admin": true,
          "push": true,
          "pull": true
        },
        "organization": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://avatars.githubusercontent.com/u/6005125?",
          "gravatar_id": "192f3f168409e79c42107f081139d9f3",
          "url": "https://api.github.com/users/distri",
          "html_url": "https://github.com/distri",
          "followers_url": "https://api.github.com/users/distri/followers",
          "following_url": "https://api.github.com/users/distri/following{/other_user}",
          "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
          "organizations_url": "https://api.github.com/users/distri/orgs",
          "repos_url": "https://api.github.com/users/distri/repos",
          "events_url": "https://api.github.com/users/distri/events{/privacy}",
          "received_events_url": "https://api.github.com/users/distri/received_events",
          "type": "Organization",
          "site_admin": false
        },
        "network_count": 0,
        "subscribers_count": 2,
        "branch": "v0.1.0",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});