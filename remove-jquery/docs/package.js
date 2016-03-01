(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

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
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
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
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
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
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
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

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    ".travis.yml": {
      "path": ".travis.yml",
      "content": "language: node_js\nnode_js:\n  - \"stable\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "Pixel Editor\n============\n\nIt edits pixels\n\n[Live Demo](https://danielx.net/pixel-editor/)\n\nEmbedding Instructions\n======================\n\nThe editor will send a `postMessage` to its parent window when \"Save\" is clicked.\n\nOne thing to note is that this is pointing to the latest version of\nhttps://danielx.net/pixel-editor/ so it might break out from under you. You'd\nprobably want to host a stable version of the editor on your own service after\nyou get it working if you care about that kind of thing.\n\n```html\n    <html>\n    <body>\n    </body>\n    <iframe src=\"https://danielx.net/pixel-editor/\" width=\"100%\" height=\"100%\"></iframe>\n    <script>\n    window.addEventListener(\"message\", receiveMessage, false);\n    function receiveMessage(event) {\n      var origin = event.origin;\n\n      if (origin !== \"https://danielx.net\") {\n        return;\n      }\n\n      var data = event.data;\n      if (data.method === \"save\") {\n        var image = data.image; // HTML5 Blob object\n        var width = data.width;\n        var height = data.height;\n\n        // Post to your server, etc\n        console.log(data);\n      }\n    }\n    <\\/script>\n    </html>\n```\n\nDeveloper Instructions\n======================\n\nFork on Github https://github.com/STRd6/pixel-editor/fork\n\nGo to http://danielx.net/editor\n\nLoad your fork by clicking \"Load Repo\" and typing in \"<username>/pixel-editor\"\n\nWhen it loads click \"Run\" to make sure it works\n\nClick \"New Feature\" to start working on a feature branch\n\nModify the code and click \"Run\" to see your changes.\n\nClick \"Save\" to push the code to your feature branch\n\nReview your branch on Github to make a pull request.\n\nHopefully that works, but if not open an issue at https://github.com/STRd6/editor/issues/\nand let me know what's not working.\n",
      "mode": "100644",
      "type": "blob"
    },
    "TODO.md": {
      "path": "TODO.md",
      "content": "TODO\n====\n\nPolishing\n---------\n\nIcons, Icon offsets for tools\n\nThumbnail viewing mini-map rectangle\n\nResponsive Design\n-----------------\n\nStyling for mobile viewports.\n\nVintage Replays\n---------------\n\nBe able to display PixieEngine replays\n\nPlatforms\n---------\n\nChrome Web Store\nDownloadable\nOthers?\n\nPromotional Media\n-----------------\n\nScreenshots\nPromo images\n\nDocumentation\n-------------\n\nManual\nTutorials\nPlugins\n\nBugs\n----\n\nPrevent interacting during replay\nMaintain Redo stack after replay\n\nV2\n====\n\nBetter Symmetry/Multi Modes\n---------------------------\n\nRadial symmetry\n\nMulti Brush (2x, 3x, 4x, etc.)\n\nBrush Options\n-------------\n\nShould symmetry be a per-brush option, along with brush sizes, etc?\n\nTrue replays\n------------\n\nCapture all user input as events, replay entire event stream.\n\nMinimize Memory Footprint\n-------------------------\n\nUse quadtrees for diffing regions in undo stack.\n\n\nHot reload editor state / initial editor state\n\nDocumentation\n\nAutosave\n\nAnalytics\n\nLayers\n  Reorder Layers\n  Delete Layers\n\nSync to server?\n\nAnimation Frames\n  New Frame\n  Delete Frame\n  Onion Skin\n\nCopy/Paste\n\nGrid\n  Modify Grid Size\n\nCommand Console\n\nScripts\n\nPlugins\n\nBugs\n----\n\nDisplay transparent preview as transparent instead of white\n\nDone\n====\n\nSimple Replays\n--------------\n\nMake sure replays can be saved and loaded\n\nMemory Usage\n------------\n\nReduce memory usage in undo using dirty regions.\n\nMisc\n----\n\nOpacity/Alpha\n\nPalette styling, editing palette colors\n\nPreview window on large images\n\nEye dropper\n\nMultiply events through symmetry so that flood fill and others\ncan work better with symmetry modes.\n\nBetter performance\n------------------\n\nUse true size canvas, not enlarged canvas. Avoid lots of pixel manipulation and\nlet the canvas drawing functions do the work for us. Blit the 'work' canvas onto\nthe active layer when the command completes.\n\nNever call `repaint` on the whole editor, all the layers should always paint\nthemselves, and only the regions necessary should be repainted.\n\nOperate directly on imageData arrays where possible.\n\nBetter Circle Tool\n------------------\n\nCalculate midpoint of [start, end], use that as center and radius as length/2\n\nSelection Tool\n\nTransparancy Mode (index 0 or none)\n\nPrompt unsaved on exit\n\nPalette\n  Load Palette\n  Modify Palette\n\nTool cursors\n\nPosition Display\n\nTool Hotkeys\n\nReplay\n\nComposite Preview\n\nZoom In/Out\n\nResize Image\n\nExport Image\n\nLoad Image\nSave Image\n\nSave Files to desktop\n  .json\n\nExport to desktop\n  .png\n\nOpen files from a file picker\n  .json\n  .png or .jpeg\n\nBugs\n----\n\nReplay doesn't reset to initial canvas size\n\nOpening an images keeps old layer instead of replacing\n\nOpening an image that is smaller than the canvas grid spacing issues\n\nExpand canvas when dropping an larger image\n\nPreview Erase/Transparent\n\nPreview Layer in canvas always shows at top\n\nPreview and layers get cut off for larger images\n\nResize doesn't repaint\n\nError undoing resize\n",
      "mode": "100644",
      "type": "blob"
    },
    "actions.coffee.md": {
      "path": "actions.coffee.md",
      "content": "Actions\n=======\n\n    require \"./lib/mousetrap\"\n\n    ByteArray = require \"byte_array\"\n    FileReading = require(\"./file_reading\")\n    Modal = require(\"./modal\")\n    Palette = require(\"./palette\")\n\n    loader = require(\"./loader\")()\n    saveAs = require \"./lib/file_saver\"\n\n    module.exports = Actions = (I={}, self=Core(I)) ->\n      self.extend\n        addAction: (action) ->\n          self.actions.push action\n\n        actions: Observable []\n\n        addHotkey: (key, method) ->\n          Mousetrap.bind key, (event) ->\n            event.preventDefault()\n\n            if typeof method is \"function\"\n              method\n                editor: self\n            else\n              self[method]()\n\n            return\n\n      Object.keys(Actions.defaults).forEach (hotkey) ->\n        {method, icon, name} = Actions.defaults[hotkey]\n\n        self.addAction\n          perform: ->\n            if typeof method is \"function\"\n              method\n                editor: self\n            else\n              self[method]()\n          name: name\n          iconUrl: icon\n          hotkey: hotkey\n\n        self.addHotkey hotkey, method\n\n      return self\n\n    state = null\n\n    Actions.defaults =\n      \"ctrl+z\":\n        name: \"Undo\"\n        method: \"undo\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVQ4T6VTXUhTYRh+p47sbhcR2zmMDGXUTVBBiyBdJUjU6EJ2K4R0ESm6CyEo6qKZWcGkoC6KFt2GxKhwi4JKbcg2khmonVW6RbmGnnI1z873c3rPjp6aQQw88PJ834H3+b73eZ7PAhv8LBvsB5PAP3pK45wDZxyYXpQZSBjHWiSUJTmlUaVQGg6feZZdO9gk6HnZqXnEw6BpAFxjWBowRGwHhSgg/5RhQc6B9FkKq0ppMOJ/FdNJTIKuFye1Q84jwLGBAzbrqOENyiQciuQX1NVYIbOQgcR0IqwUV7pfn49nTYLT0Q7NuDYDShBxTfU9rgWbCA32BrDWWZGQQ2o2Be8/Sv7RCxNDVYnovdUaJCptb9njcTILhe/yDxiPxyKxS4mjVRHos7ZeOxh0bXP1ig4RiKrCk+eRfGJgcmsFgc8HteD1nn3Y8bh/vb3Nl93BHdt39oqCAKpK4Gl0JD95/d06ggfeECV076POkV1/EzQH3EHUpL3lgMdJawgsLxVgfOxNZOrGzJ8RfPeP3XTYxC5duLmvn8pCIpkhoh1FdKKIm6zoEoqYmgJpVvJP304bIvpCx6/abY6+JrHJtFB3Y81CHQulZaiv3QzzmSwk44mwulLs/hD6Yth44k5bQLAJ5xqdjeg9GBnAouUsYJAUBRblJcjlvkF6RgqjI4Ppe/OVQWoLeoaELY4eivGdy6yOsJoDHCWPoyUZoVFKlGH95H+irP/wBPbfpYztG7sYrxDxfw+uMgdoo9u1u2+i/+2Val/pb35FXyDc5lZBAAAAAElFTkSuQmCC\"\n\n      \"ctrl+y\":\n        name: \"Redo\"\n        method: \"redo\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUUlEQVQ4T6WTUUhTURjHv+scNheypmOy7RY0H7IHC6Rgo/ItB0GXWIgSBUOJMIRFkEUlBEWBDzOsXnoQpIdqTUlrQ6k9NPBhUeCaFO0udxuB7bVc5D3n3L5zYNZSiNG9nHu+C+f/4/v+33ck+M9HqkXf9/DYRRKbHo1GgVZ0NQF6Jo9miE7SU/3xgU0Bg3Mh2TBIkBpGNyWkkxHmIIQC1Snw3WVzA8Nd/ZK/HR9KhjlkPYOzL075KDWGPVZZ2dZoB6vZCvV19UANBDAGjCEEY50SeJfLgFpQbyQvLVwRgMG5XpkZ5vH2lt2K09oKP0gZTJIZmMFQzAEUYwRwCK7FD4ugaupo6mr6ggCcjp8Iy03bI157mxCtrpVBXcnB8sqySF2UoBNwtbiBUgr5Qv5OaiQ9tF7CwLO+REfr3kCj2YIHGCSzySIejD0JPT/3Z5e6bvoyTCdvUiOvQ1UmhqZ7Sv6dBx11aIlW0iD7OTs21Z+oEnOB/9r+ywvZ9C34u40nHwdL/rYDDklCwFcNlgpLYzNn5jcANpsZ4UHvAyXRIe8JWCxbsFYs4e3LIl2jsfnzr/4JEYDjE0fCbrsn4nV5sW1oYnkVchqaWEQT0cDKHFA0VPyjke/v5YRWfJS7h2Xs9PiuHe2Ko9kJ339+gwZTg2gZbx/DORAxvnwmZqKz8PH+p98ADglEunw6YcMep0exNdlgq9UKkskEBp8FXByEEwoGgp4+moX8hFYN4JBD1/fJlBhBTLWbENZJCGlmOqvjqfP2VnaGcWGyuBFQy82snP0Ffg5KIO/aNV0AAAAASUVORK5CYII=\"\n\n      \"ctrl+o\":\n        name: \"Open\"\n        description: \"\"\"\n          Open an image file from your local filesystem.\n        \"\"\"\n        method: ({editor}) ->\n          Modal.show FileReading.readerInput\n            image: (dataURL) ->\n              editor.fromDataURL(dataURL)\n            json: (data) ->\n              editor.restoreState data\n            text: ->\n              # TODO: Currently we don't handle this format\n            chose: ->\n              Modal.hide()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACwklEQVQ4T31TXUgUURT+7mzr5taaL9ofgdm6YtZDuvqg0UOED2lGYUQkhathCoblT1KSBlJhuyksZj0EKflQtlaaT1pKtIIQUZmiPqhpmBn4s7o6zjpzO7OumqAd+OYcZs75zjnfncuwgWWU1p/mnFUxxnZwMICrid7HqnFeTV/Wt4wSh7vo4iF9cFAQGNvkLfUoDIo3nUNelHCjslWlXt/SSxz8QV4Csmw1MIaFrSRpBIbh3i7czctGobX5/wSVBcdhbXiHA3FHoBE0EDRaCIKA7x3tsCTEE8HbjQnSbr3klYWJqGp24uDhozT16v5dzjakJcQhv5wI+pqivugCIvczJvyrDkpakrW2gkRk3ndgT2Tc0ubykgIjPR2wX0vB1fJGsP5Gs2hM6tSR2qtKU3yh2IGKwiRkVzQRQfwaoUa6najIScKVO6+JwBE9ZTz5cZs09hCypAGEAFLdgPRqBfaiZKTk3kNwSOQagvGhbtRZryOrrIFWeB7jMp5qNYg/a8EVDmVhAh73b4wOjSMwIBAKV8cmeDVQoEgyJL12fmvUY/9Lt+tVgmgp9ESzdnagHlyahcf1B4aIsxiZ24m9uwJpGvWkqdhLQNAYMNyaJhli7ZrUm6+mWd+zGMl0vlNL1CudaA78GhvA9LiTfhg3FHkW3ENQ5uG33YKRtlLJ+vWMS1bkFNb31LwQlvrBT5n7RipPEWbAF6egeCYpngYoVj2XXQQ3/ENsGKjPEE2WT/6qMKz/kVncZ3mvk2faqVBNJKhF3phIFtXCZbihNz7BYN1l0ZS1TGA3zxszWzZ7Jt/4Cn0dV8hoIl93rojYEl6HwZps0ZTjI+i1RY2GWl7opYlOAxRR4FwksQnkubxAXiL9yKsacRm63ef4j9qrrvD8z4HeFXrKInKZIMQyzo6BccNGl8t3CakCEh13bURxT4767i/ium6v2KS7zgAAAABJRU5ErkJggg==\"\n\n      \"ctrl+shift+s\":\n        name: \"Download\"\n        description: \"\"\"\n          Download image to your local filesystem.\n        \"\"\"\n        method: ({editor}) ->\n          if name = prompt(\"File name\", \"image\")\n            editor.markClean()\n            editor.outputCanvas().toBlob (blob) ->\n              saveAs blob, \"#{name}.png\"\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACs0lEQVQ4T42SS0hUURjH/2fGO2MPTC3p6VQudBEt1Bm1UWgXCEW0LNpIlk5WYoq2UYseFAmaYaRNAy2KApMkq5lRepChjJqaiUJp4cKyRTgzPsZp7jl954xEK+teDt/HPff/+57MWuwpE2DbDQx5AFLIXwuIGMbAIOgLPUa6NNARgkPnmDVp+BwKLV3rbz7QymwO7x1nVV4h6P+0rWalEVwgHKHziyvxKrMBBMTcIsdcSBcT03P6PfeEf+zrTBWzOjrH71bmprX5gqg6lCTlOH2jD9eLMxHhQKzGYNIMWCKYf0EnKzA5swAjOC64BpYkYNZZmbvucW8AFQc3qJTPNvXjyokMaEaKbjJQ6kBgUcd8iINTdq6uH8jPjENZY4+QgPDtCrvW7gugJH+9AlQ7B3GpMB2rY43QqITFMBU+r1NGEgACzCB9hxl1D96DAF7eVG5nT6mE4/sSFYA0WGM2UnSGiE7RKfWFsK7Egl6X9zt2W0xoeDQIZjvpFY2ldjzrD+Db9BQ1izpOAC2GGkewCKUcoWYsD0QFiI9PxC6LGU2twwRweEV9aQ6e9/lVrVKl5qcUAqSnyASgSy4P+QYKkrqJoeXJSBRQdyoH7gG/ov8ZPoFkw6RQzl+lT1ZIh8ApSQyujo9RwFVHFrqGAtGtoUu5Q9LqEiCjy0zI51xXO0IeLIkC991jEuARl4uy8Go4iNoj25YhK5uKllEkJwg87BwHy6Ymni+04c1IALWHk9Hw7tiK6lK7E+XNH7AlXqDt5ScClHhFTYEV3aNB1BDAN/V6RYAteS/Kbg1hc5xA+1sCUAm8usDKesYkwPJfGZy5OYCNBOjonpCb6Jk8dzRjp5zh/uzoKv/ruejyqQa/6P3yk1mL3PXU11QwsYcJJNDw1Oio3Wpsf1sZJDpWIRh4UDDjyG82p2waquUVyAAAAABJRU5ErkJggg==\"\n\n      \"ctrl+r\":\n        name: \"Resize\"\n        description: \"\"\"\n          Resize\n        \"\"\"\n        method: ({editor}) ->\n          {width, height} = size = editor.pixelExtent()\n\n          if newSize = prompt(\"New Size (WxH)\", \"#{width}x#{height}\")\n            [width, height] = newSize.split(\"x\").map (v) -> parseInt v, 10\n\n            command = editor.Command.Resize\n              size: {width, height}\n              sizePrevious: size\n              imageDataPrevious: editor.getSnapshot()\n\n            editor.execute command\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACLElEQVQ4T91Tz2sTQRR+05hmTTeB0iS7h8ZjLyEKgoVehCLWFG0g0ahrMEpp6rH++EMUFH8UUbRIq7ZZ21qoh14UjfQiQkXpQWKSJmlcyzZmY3fj7DhjGklK+g/4YBjmzX7fvve9+dC15CUCNIhJgBC66H7j8H3EcjsjvhAlJr03TRNMXNsRIzjU2UcPGJaV5K5gRibNSoKjzVrwu/cDQgiSqXeArr4dJQc7e6FS1UDRFchpWflW/8Pwzr8zsI2QVS/vdXIWDuxWHpYz7wFdeRMnFmQFgRNBtImQKqcg/zMr3x543ERyQT6reB3dXZ4OAVIb3yC3uVZrYez1CNEMTeQQt9rN73Pqhg758tqru4MTgcYqzk9H5oUO8YSJTciVcvLUOTl86tEQ+SfWCC3Rutf6iYqUvBeYGGolojQVXqQiVxi4ft9S7Vbg3XL/G0FsJpLA2LQ/OT3TNIF6/8HxwXmCcV9Fx76ly0vrLI+G5yTyIDiJGNjFeUJstvlS/uXT6IumSQTHA4tu3nPMgiyQVjKlKiY9FiAFdFE+8/d9uzg3CHYRiloR0hvpH89js65G5Y/fGUi4HZ6Q6KTfbBZhXS2AXjUAxaYjxNflB/WXCjrWIatmSltbWs9cvFZiYwRuHknQKkLt7XuAtzlhJbUCKPrsJPG7DoDx24Av3z9DuaKKrcB1oqPX+4nP64M2aqYPXz8CkibDtAVmT7q2rSoPL7R8HwzM7G5u257Z/w969A/vqEbP0wAAAABJRU5ErkJggg==\"\n\n      \"ctrl+shift+c\":\n        name: \"Clear\"\n        description: \"\"\"\n          Clear image\n        \"\"\"\n        method: ({editor}) ->\n          previous = editor.getSnapshot()\n          editor.canvas.clear()\n\n          editor.execute editor.Command.PutImageData\n            imageData: editor.getSnapshot()\n            imageDataPrevious: previous\n            x: 0\n            y: 0\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAC4SURBVCjPdZFbDsIgEEWnrsMm7oGGfZrohxvU+Iq1TyjU60Bf1pac4Yc5YS4ZAtGWBMk/drQBOVwJlZrWYkLhsB8UV9K0BUrPGy9cWbng2CtEEUmLGppPjRwpbixUKHBiZRS0p+ZGhvs4irNEvWD8heHpbsyDXznPhYFOyTjJc13olIqzZCHBouE0FRMUjA+s1gTjaRgVFpqRwC8mfoXPPEVPS7LbRaJL2y7bOifRCTEli3U7BMWgLzKlW/CuebZPAAAAAElFTkSuQmCC\"\n\n      \"+\":\n        name: \"Zoom In\"\n        description: \"\"\"\n          Zoom in\n        \"\"\"\n        method: ({editor}) ->\n          currentSize = editor.pixelSize()\n          if currentSize < 32\n            editor.pixelSize(currentSize*2)\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbklEQVQ4T6WTbWhSURjH/15fptPltJm2pJkGLRdUNAZBY/TycZ8EI6LojWAUYxBBtL74KSKCYDSEiCihDBcEvdArgy2C1WRbc6GN3jaXIpMcvl7vvefa8YarMT8IXe45l8u9z+/8zvM8R4b/vGSVeI/Hw3Qe6R8UiNhNiNhMn+AFISYIwtPwsxtn6Xex2loSQAo+3D/cqC51GeplUDAlgN6sUMJ8ksVcIj8SHb25rxpEArye5bwGtdhj1jHIFAlYvgRCAUoGaKiTY2C6Dzk2Da7Asz73kOZfEwnwPJyPbmmSW1lBRJ4rQSzRQYWpAOoUMng/nsQBy1Y8CgcxdOzJ8rbLsdLL41CWbG9WMotZAiKWATSYToFv55HJpWBW6mBf04TJhR/4Go+jyHKp0UtjxmXAw4klsmujhklkBAoA1f9jcHv6BDrNDroljo4izUkRBa6IN+MhfLg8JS0uTffHktGdLVprjurnOFEyKJvcm+zFr3QcRpUGVqMen+YWMP9zEcUCx4YGIlIuJMCdkbh3nV7V47BokcoTZMsQalCnlMGgkaP37l7scGzA2+AsJq6FVuegXEZTx/Fhy1p1l83SAJWCQbnoBVZA6EsSvndHkcmmoOaJeE6jcx68GvxcqcSKRtJsOzTI8aSbF2gj8QScQOImdobbrw9tsjo7EIuMIxJ8lSxw6T2nvN8lyAqdap0WcLeplPZGv6ml1WVz7kY08h4zwRfJ07eippoAUqdSyGaz6Dfb2lz21na8DFzHGV/ibxVqOU8eN1QW7Xq/QqV25TJLV/r8qYs1G1QWcLshb5fXmy88yMdWJbEWi2r//AZSUiAguj/HUQAAAABJRU5ErkJggg==\"\n\n      \"-\":\n        name: \"Zoom Out\"\n        description: \"\"\"\n          Zoom out\n        \"\"\"\n        method: ({editor}) ->\n          currentSize = editor.pixelSize()\n          if currentSize > 1\n            editor.pixelSize(currentSize/2)\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACVElEQVQ4T6WTS2gTURSG/0zejaVNbUws0aZVamgFFUtUiBQUF2JXgYiIC0GEqovufBTELNWFblpSxIUPMFK6EsVaMVBXPoIuUkwqbUXHJA0GE5vMdDKZO+OdkaQqkQYc5twLdzjf+bjnjA7/+eiq+aFQiNl/YmRMIvIgIXIH3VGRpLQkSY8TT0bP0e9yvVoaQEs+PhJttSgD9iYdDIwC0FeQFHzJCfic5WfYl7cO1INogOcfxbDdIg851zEolgmEigJCAUYGaDbrkUgVsZAujg8f6Trzt4UGeJrg2W3tercgyeBFBbJCgwpTAZgNOhh1CqZjqa/nAz2b6gIexUtkR4eR+VYiILIKoMl08d2/Bn0+D7nEgfwo0VgGKahRyrfNx9tUmGYw+a5Adm+2MtmiRAGg+r8M/KMXwe/1QhbpOQ1ZEEHKFRhu3EV7ZlHL1ZYHr3Lsrk6bm6P6nChrBqrJnvErMLDsamVqodkIZcGZT1lrgDszmfCGFtPQFpcNeZ6gpEKogdmog92qx5sPS+DmXgg9hcmdhy9Pzf1+D7U2Onwno671lgGPqxkmAwO16SuChPh8Dtz3JRwyRbH4fjq3InL+o9djNcgfg2TdfmxMrJDBikQHqUIgSiTjEGbFgy3xLnevD+nkWyRjKmTZfyr8SYPUAP+a6Ilgn8nY3RpxdHoDnt59YJOvMRubyp2+zToaAmiTSiFbnXLE6ekLdHv78WziJs7ey652oZH/KRSEyWXbGDGYLAGuWLg6HMlfatigWiAYhL5f3+S88JBPV8/WvIO17H4CfCMpIEZZGWYAAAAASUVORK5CYII=\"\n\n      \"g\":\n        name: \"Toggle Grid\"\n        description: \"\"\"\n          Toggle Grid\n        \"\"\"\n        method: ({editor}) ->\n          editor.grid.toggle()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVQ4T2NkoBAwUqifAZsB/4GGIovj5VPVAJBNpAJGqroAZvtoGDAwjIYBFcKApOQMANUmIRHQ0q3yAAAAAElFTkSuQmCC\"\n\n      \"f5\":\n        name: \"Replay\"\n        description: \"\"\"\n          Replay the drawing process\n        \"\"\"\n        method: ({editor}) ->\n          editor.replay()\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACZElEQVQ4T6WSX0hTcRTHz9XYTXEPRboC05qilK0N58N8kD1IIstyIHsYhReGrT9j4VOv+lgEQtCkB4ugZ8MSggXtIQXDl7pzLbOtYAij3D9r3Vt39+72vULSD+5bG+fhcs75nO853x9H//nj/vZPT0+nNE3rrNfr32KxWJcZ1+/3p1VV7arVap/j8fgpo2YfEI1Gf6H5CSBTpVLJVJckSYTmOcRoIpHoYwCRSEQHvQSAlQ/MqnwDj2KdlDrRlbb7dNxKdPnm2gHUJAFwr66u7g3fVxAOh0U0L6PAnxY6+9wWgXjNTrJGdM76lC62vqQRYfODoijzhsr19XUXAwiFQl/QvG0o+HrthzMvqTTQOEcNWi816kRHGzL0amZyA9N3Ee2iKJ5kAIIgbCHxBuGw3Prt6mg5SBVlh6rSWfpeGaGy1Eby7RsiFBgreNLpdA8DCAaDKShYRIyN3TvRb+GaScX/p7aDRWWqczV6eOGTiOZngExkMpkzDCAQCOSQLNlsNme5XDZ1IZlMyhiwBcDhXC7XwQDGx8dTSCziBud7Z567mxrhgkqkYP+p1gfU3sKRx3v3LYYsIyby+TyrwOfzGeS9G0gzXpeZC91DL4wVklDhKRQK7A2Gh4f3XECBtfnOEVMXFiaHNlCzi2ivVCqsC16v9x0ULCB5vWf+2GkzF96HRzfxWmMYMlWtVtl3MDg4qCOxhnBGl4aaLFwT1f51AV+z/a8l5JcAuSTLMvsS3W43BChXeZ5/ZLfbTV1YWVmhYrHoB+AxlB5iXHA4HJug240jZbPZATMC4B/R3IPmrK7r3UbNHy8zkCA9UyOUAAAAAElFTkSuQmCC\"\n\n    Actions.extras =\n      \"F1\":\n        name: \"Help\"\n        method: ({editor}) ->\n          window.open(\"./docs\")\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC7klEQVQ4T6WTW0hUQRjH/+7q6mpkbLK663ZX28pExDJLKRRKKypZiNouVoTggy+RDxEoCSEp0UNJPkSloYTdoxtYdNE2a7vRmou4mWjppuUF3T3n7Dkz03Rku9JDNPMwM8z8f3zf9/8mBP85Qn7X3+sS52kJszOGnZSxOEoJCGNeSli9pIiNBemx737W/AJodvttYPT4nOlhphDGhYSobzUaDQJ8+/aDb0AmSol9hflSEPIdcKd93MYIrbOadFFjEwI6en3o/eIDoQzGaB2SLVNhmBaBxx2jPkUhhUV5s1WICrjhHJ1LNLQl2RJh9o740ewagik6DGvTzGB8Oj0jeNE9jJXWGFhiotD86lO/oIjZB2wp3SqgqW2obGG8/pAkybjq7IckyijfuijI5ytD9ZUOBBSKvLR48Prg4Zv+8jJ7aoUKqL//sSsjaWpC69vPcH8c5WFT7NtgxeueEURFaLEsMQZtXYO42NqNJMt05CyOQ8Pdbs+RvemJKuDk7R5/bopBf+7Be4wLMmQi81oSrFsyE5nzjQjIFHde9uGJ2wt9uBZFecmoudYu1JRkRaqAo5c7/euXmvRnOWBsYpyLeeY8zKrdGRiZkFDd9BJiQOGJAHqdBsUbU1F1/pVQV5ozCahocHUVZFkSHroG4e4b5vbJoDwN7orqFpEVXgZ+5jNhRgzWLJ2FIw0vPBfK8ydTKD31rCw31XxoSqQOFx+9g08QVGHlnkzwZsL+2gfqORQUW1anYGhYQOM9d/nNyk2TRSw+1jIXGtaya43VPOqTcM3hgSAGkJZgVIXOzgFoqIz8zAUwGiJx+NzTfpGI2a3Htk3a+G1sr2y2UUbrijemRMk8dIfrA3q9w6DcuvjYaCxPtiA0VIuKMw6fTEih44T9RyMFIZsOXrcpjB3fvCrJZJ1tQLhOq14JogKXZwinb70ZkCkteV67489WDkJySs7PI9oQ9TMRhcZ9qwGhxMt7o16SWGN73a6/f6Yg5F/WrzeMbiDawgJJAAAAAElFTkSuQmCC\"\n\n      \"ctrl+shift+s\":\n        name: \"Save State\"\n        description: \"\"\"\n          Download project file to your local filesystem.\n        \"\"\"\n        method: ({editor}) ->\n          if name = prompt(\"Name\", \"file\")\n            data = editor.saveState()\n\n            blob = new Blob [JSON.stringify(data)],\n              type: \"application/json\"\n\n            saveAs blob, \"#{name}.json\"\n\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC\"\n\n      \"ctrl+p\":\n        name: \"Share\"\n        description: \"\"\"\n          Publish picture to Facebook.\n        \"\"\"\n        icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAALoElEQVRYRzVXeXBV9Rk9d31rEpJA9p1VCKBQJoEIYooOKgmKA3XBLSqiEnQcWzsSa4vOyHTRVgVG3P6onamt7bS26NRWrGwBxQpIEhCSSAiSBEjy8rb73r33/Xp+9+lL7rzlLr/zne985/t+yrZjT4m9/96DxFAMebm5iNgWXMVGwO9H2kpBz5hQdIG4mIDhV+CkMzAUH3QRhp12oQLQfQqiNs9rAjlmDgq0Emxc/WM0zlwOJaVA1RXIC12+ObAheI8QBlR+V5Y9N1u4CQdmUuWCLoRPh9D4ORFHwBcEbBWKImAbaahGBq6dgZbRoCHAp+hwnDTMkAFHsZARFtSMgM8Ko/32Dtx09RoYwgQy/OchASi6w+X5Dt0DrzQ9XSsCwo/rG27E1MpZSLoONMOEsF0EjRBU24DrunANYhcEkXEJgKAyBnTdhObTMBodRdqII5xn4pvebvzr73uw/oaHcO8tDwJpjQwQLAF4K6r84LjIOGSGIJSVW+eK0QsR/HRDB1ZceQPGwCj452OMDByawwgEFzR1pPnnI3aVT3McJ/tJ0eGqDhlIweDv+3s+xs6XtuO2lvtxV8sDfArvZYAgaO8lAQhJic53MtD8zFyRHEuTsiewdNEKRBMJmAYpTUTh15knl3SrJpJCgeWm4NNdL9ci48BQg3xegM9WMWpdRmiSjgOff4o3dr2O+25/BLetvMMjWiE0lwvqCuEoTIHgykwlw4OydMssKkxDW+vDWDhnMZKWQ2pVuFYMOQE/MhaRa0EMR1zo/iB0zeYDbOrFIgDTO28GgrAyaYQKwuj8Yh/+8t5fsablR7i5ZQ00RmtoTBUDkGlQXK7rZGAqKkLMjNL83EyRvOTgoVs2o2nBCly8FKHoiFleyRsCRgFOnBzGu3/7DIk002CnIFyJHgj7fXDsJCPUkHAE9eDns21EYwlMypkM3dDIVJIAFAiHn3mNIFCqB5NyC1FUOIUMPFslRExH202PYsn8azEWScDnY5mpLqx4GrnhUuw92Icdb35CiquQEybtpDydckD9QVFZtukUND0XaSlOgvcHQkjEU1CZKqhxMk7RuTpMitZghSUTFpJxh7/x/uU/rxZOBNjQshmNc5dhIkZqJXKXkVF8wWAR9h7ow8639mFG/dWYWlfJkmKl8E+IFAJ6mopmKWq5XJQiJXhV1cgUGSGAjJYgVxStTRYYuTw/PhHFkc+PedpSrvnF9wA2YXG9BECKCADfAQgECrFvPwG8fQgzZzegpq4kS6NqeFpQVQKw0yxNEznBEFmbgG3TyEL5SFhxai0OfygITQkzNUkE83IwEU1if+cRlidrqum5auGOk4FWApizHLEoy8nwUShpMqAgFCzAfpmC1w9i6syrUFWZA9eJUyM6jYdiZbRywdyAD6nYZS5kIT8/D7oZgkt12PSQi2MRCq6IC1swCTJOB/3f8W4aE1PW+HyNcCOCKZAMEMCEzVxJAIyOC4RDZOBgL3bsOoCaqfNQXkb3S03QDyhAUir8OUgmGaVcOBe47tpFmDGjjq4JBgJ8vK8Puz/cg5xQCQVqIEWjY2joPTcEizpSGp6flgXQutFLQRYAa5tupQoNvkAOOg8NkIFOAqhHRZkKkY7RiBkh/TzFw88eYU0M4s5112PhvDLP6xOsVmm9x7ou4b33/omgfwqVwOsZWJxl2D9IANSJ0vSLK4Q94WQBzF2CaFRqgPXPkpEO6A/k4sDhAex8/bPvANDBJACRx/MGy488aKwIjKPjJ3fCx6jJLL46OYIYG9HxnjM4eaqf5ZyLFBc0WboxK43j3f1QuI7S3DFf2Mz7htYH0TivwROKZvqYZ9asVG0ozwOwnQCqa+ejopS5Z8f0uwRAlxR0xnRyFLUlITz26CqZOUgJbfvtn9F1ahDFlZVe1zR1P7XiIkCtJFMZfNnVzyoJZAG4pH3D6vvRMHexB0CK0GGRZmijZpDu9tk5bN91GDW1VxKA7JA2izDksSS7mybiKC808dC9rVwApBl4652P8O3lGO1bRYoApBsKWnCGbdFxVHSfGfTsWVm2dQ414KLtxgfQVL8UyZidBeCkoNA0pP0ePT6EF1/8CDOnN6CiJB+plAWHTcX0G4hOjGHVyqVYsrAKYdLvZ4YYKCIWWzct/aP/nsa+A0foJwGWZIby47OZ2hNdp2hSCpRFW+qEbulZDcxeilRcqpdiSbOGWUI5tMsDB0/jzV17UV50BaZXV/NGgQk3wbmBbhmN4dbVK9DcUEqJsW1I6VB8zATVDvz+3S9wtKsX/qBkVc4BflhkrufkSS9ApXlrvbBGLbSxdS5bsBzRCFurbAN0O3+YNU+3OnS4F3945xCqS+eioqjIG0JSBKHQ40kHZk8tx7wZxWi4spq55r0EceTYNxgZT+NY9xAujEQ4NbFk5UDC1hxnjk6e6WUg7IbXPDNLuFEX97W2YfH8qxFPsFjMbFNR2I6DeYX45NMevPLSB5gzvQllBVO8XCqUu0snUNMcsawIJoddPPn4XRxiGDnDf/m1P+Hs+TGE82uQpPrZPghANg8diaSNr/sGWMZMQdOWacKwTdzT+gAWzFpIAMw9c3dh5CyGLo4gkDsZPT0R7PnwAqZWNaI8vwg2I8hQA4KHwUO1YyjMzeCpx9dxUspOPq/seB8DwzGmKczD54lPNiqFSCxWQU/voMe00vz8bDE2NI4Nazfi+mU34tzAEA4f7sTBzn24NDbGhQKkvIjzwTSUTZ6HaaXVXEQgzT7gC5jsikmWZQSVRX5s2riGOfa0xarZjW9HkqxU+j1tUY51sosKzgeca9Fz6rw3kyiNW6uFQrWsX3UHith6d/9jD/pOD6KqpAZNS5rJRghDQw7+83E/igvqUFtcxAUERSpnRCAYDtG8LqJ8ig+bH7mVPcKbtPDSq7txfiTmDSvS03Q5sFE3NueHDAF1dZ9lmbMbLnq2gl6iob6iHue/HkJ03MH6tW24oXkVJpmlzDIv7r+E9s2/Rv3sH6CAE7BCDRg+kwDIBGtO4Rhfku/Dpkdv9lZnBvGblz/A5XHOBIacnLkUdSXbctKK8gIDX3UNkBk6YePTNSKo5cAadjCzbA7a7n4YV9Uu8KjSFfYE1u3howPY+sIfUVQyHRXF+SzPGH9nCzY5vnLsTkUnUFzox5NPrPGGDIob2371PqJxoiElEoCcgmT1+AM6okkLp88MsTFRE/e+uk5cHLyI6xqu4yR7B8LaJLqczmrVPZo1ttXPvxrG5qd2oLK2HtPrKuiWoyxRA/F4nEMqBxA+uKosH/esv4aNiQ7NWF974xDOfcv2LGcLuVegFbu8TuPXSCKGvv5hMkgA5zJjnC9SKOCk4vcGa1LK5BpayNt4uAziRO842rdsR0FpHUqLJ3vzoMtzl0dH6YSjFKWcjICaqmLSys2NpuN03zDi3OhIU5Nt3VRMjhhydGOZkqZRWr7pYy+wWNRSNCbLRJUzu0yiZ2VMJMcoNnp0HhtCe8fvMK1+IYqn5FN0UXSfOO2pOp+bEfYXTrsOx7gUfSnBLmfACIS5QIi0ExAp0dk5XZudU3ZL6iLDR8vpSBEZIWy536MtejsX+ZKIsoOvt5/oPD6Cjl++jUlFFfBxAzJ0gQLigretXY2WlYs4HWctWLogq43uyRu/6wkyOjq2/Mo9htfhvfNyg8YKheLQpjR5p6SVOeemwMuTB4A3s0Bw8OgFdGx7A75gDmKXz2JGbTmefKydndHHvYPcXvAlzf/7+/hus7ZpVbKhZ/eA2S1h9sUfMqrNZDPdkgGXQ4UmOwlvkA1EtgypWhkN96E48GUffvbCTg4eJta1NOPutT8E96rshtmIaHAezfLdG7X5LIdbPDkHK3ITy2A0KSbvwixQodKkiFphT6dFy3DlV4mabsXDkG1TbuO4wIUI54VNHWhvb0fzwgqE5KIyInmb3Dp646fHg1cC1CefFPNcUUPQG+/lrlkG5rEq2EOMlAfy/zaifUZYoqDwAAAAAElFTkSuQmCC\"\n        method: ({editor}) ->\n          Facebook.requiringPermissions [\"publish_stream\"], ({accessToken, userID}) ->\n            editor.notify \"Publishing image to Facebook\"\n\n            editor.outputCanvas(8).toBlob (blob) ->\n              formData = new FormData\n              formData.append \"access_token\", accessToken\n              formData.append(\"source\", blob)\n\n              $.ajax\n                url:\"https://graph.facebook.com/\" + userID + \"/photos?access_token=\" + accessToken,\n                type:\"POST\"\n                data:formData,\n                processData:false,\n                contentType:false,\n                cache:false,\n                success: (data) ->\n                  editor.notify \"Successfully published!\"\n                error: (shr, status, data) ->\n                  editor.notify \"Error publishing image\"\n                complete: ->\n",
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
      "content": "Command\n=======\n\n    LZString = require \"./lib/lz-string\"\n    {extend} = require \"util\"\n\nCommands that can be done/undone in the editor.\n\n    module.exports = (I={}, self) ->\n      self.imageDataToJSON = imageDataToJSON\n      self.imageDataFromJSON = imageDataFromJSON\n\n      self.Command = {}\n\nThis is a weird DSL for each command to inherit a toJSON method and to register\nto be de-serialized by name.\n\n*IMPORTANT:* If the names change then old command data may fail to load in newer\nversions.\n\n      C = (name, constructor) ->\n        self.Command[name] = (data={}) ->\n          data = extend {}, data\n          data.name = name\n\n          command = constructor(data)\n\n          command.toJSON ?= ->\n            # TODO: May want to return a copy of the data to be super-duper safe\n            data\n\n          return command\n\n      C \"Resize\", (data) ->\n        if typeof data.imageData?.data is \"string\"\n          data.imageData = imageDataFromJSON(data.imageData)\n\n        if typeof data.imageDataPrevious?.data is \"string\"\n          data.imageDataPrevious = imageDataFromJSON(data.imageDataPrevious)\n\n        execute: ->\n          self.resize(data.size, data.imageData)\n\n        undo: ->\n          self.resize(data.sizePrevious, data.imageDataPrevious)\n\n        toJSON: ->\n          {imageData, imageDataPrevious, size, sizePrevious} = data\n\n          name: \"Resize\"\n          size: size\n          sizePrevious: sizePrevious\n          imageData: imageDataToJSON(imageData)\n          imageDataPrevious: imageDataToJSON(imageDataPrevious)\n\n      C \"PutImageData\", (data) ->\n        if typeof data.imageData.data is \"string\"\n          data.imageData = imageDataFromJSON(data.imageData)\n\n        if typeof data.imageDataPrevious.data is \"string\"\n          data.imageDataPrevious = imageDataFromJSON(data.imageDataPrevious)\n\n        execute: ->\n          self.putImageData(data.imageData, data.x, data.y)\n        undo: ->\n          self.putImageData(data.imageDataPrevious, data.x, data.y)\n        toJSON: ->\n          {x, y, imageData, imageDataPrevious} = data\n\n          name: \"PutImageData\"\n          x: x\n          y: y\n          imageData: imageDataToJSON(imageData)\n          imageDataPrevious: imageDataToJSON(imageDataPrevious)\n\n      C \"Composite\", (data) ->\n        if data.commands\n          # We came from JSON so rehydrate the commands.\n          data.commands = data.commands.map self.Command.parse\n        else\n          data.commands = []\n\n        commands = data.commands\n\n        execute: ->\n          commands.invoke \"execute\"\n\n        undo: ->\n          # Undo last command first because the order matters\n          commands.copy().reverse().invoke \"undo\"\n\n        push: (command, noExecute) ->\n          # We execute commands immediately when pushed in the compound\n          # so that the effects of events during mousemove appear\n          # immediately but they are all revoked together on undo/redo\n          # Passing noExecute as true will skip executing if we are\n          # adding commands that have already executed.\n          commands.push command\n          command.execute() unless noExecute\n\n        empty: ->\n          commands.length is 0\n\n        toJSON: ->\n          extend {}, data,\n            commands: commands.invoke \"toJSON\"\n\n      self.Command.parse = (commandData) ->\n        self.Command[commandData.name](commandData)\n\nHelpers\n-------\n\n    imageDataToJSON = (imageData) ->\n      return unless imageData\n\n      data: serialize(imageData.data)\n      width: imageData.width\n      height: imageData.height\n\n    imageDataFromJSON = ({data, width, height}) ->\n      new ImageData deserialize(data), width, height\n\n    deserialize = (dataURL) ->\n      dataString = dataURL.substring(dataURL.indexOf(';') + 1)\n\n      binaryString = atob(LZString.decompressFromBase64 dataString)\n      length =  binaryString.length\n      buffer = new ArrayBuffer length\n      view = new Uint8ClampedArray(buffer)\n\n      i = 0\n      while i < length\n        view[i] = binaryString.charCodeAt(i)\n        i += 1\n\n      return view\n\n    serialize = (bytes) ->\n      binary = ''\n      length = bytes.byteLength\n\n      i = 0\n      while i < length\n        binary += String.fromCharCode(bytes[i])\n        i += 1\n\n      LZString.compressToBase64 btoa(binary)\n",
      "mode": "100644",
      "type": "blob"
    },
    "dirty.coffee.md": {
      "path": "dirty.coffee.md",
      "content": "Dirty\n=====\n\nHandle dirty tracking and onbeforeunload event for editors.\n\n    module.exports = (I, self) ->\n      # TODO: May want to not stash this on I, possibly have a volatileAccessor?\n      self.attrAccessor \"savedCommand\"\n\n      self.extend\n        dirty: ->\n          self.savedCommand() != self.lastCommand()\n        lastCommand: ->\n          self.history().last()\n        markClean: ->\n          self.savedCommand self.lastCommand()\n\n      self.markClean()\n\n      # HACK: This assumes we're the only app in the page\n      window.onbeforeunload = ->\n        return \"Your changes haven't yet been saved. If you leave now you will lose your work.\" if self.dirty()\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "download.md": {
      "path": "download.md",
      "content": "Download Pixi Paint\n===================\n\nPixi Paint is a pay what you want pixel editor. Try it out!\n\nOur primary focus is on ease of use and simplicity. Pixi Paint is fun for\nbeginners and experts alike to explore limited palette pixel art.\n\n<h3>Features</h3>\n\n- Brushes and Shapes\n- Color Picker\n- Line Tool\n- Total Palette Control\n- 4 Symmetry Modes\n- 2 Transparency Modes\n- Unlimited Undo\n- Adjustable Zoom\n- Optional Grid\n- Replays\n- Export to .png\n\n---\n\nSuggested Donation $1.99\n------------------------\n\nPlease donate if Pixi Paint is fun or useful for you!\n\n<button class=\"paymentButton\">Pay with Card</button>\n\nDownload\n--------\n\n[Windows](http://0.pixiecdn.com/PixiePaint-win.zip)\n\n[OSX](http://0.pixiecdn.com/PixiePaint-osx.zip)\n\nPixi Paint is [open source software](https://github.com/STRd6/pixel-editor).\n\n---\n\n>     #! setup\n>     # TODO: Figure out the right way to add analytics to all docs/app pages\n>     require(\"analytics\").init(\"UA-3464282-15\")\n>     require(\"/stripe-payment\")(\".paymentButton\")\n>\n>     $(\"li.example\").remove() # Hack to hide setup code\n>\n>     $(\".content\").eq(0).empty()\n>     .append($ \"<h2>\", text: \"Live Demo\")\n>     $(\".content\").eq(1).empty()\n>     .append($ \"<iframe>\", src: \"http://danielx.net/pixel-editor\", style: \"border: none; border-top: 1px solid gray\", width: 640, height: 640)\n",
      "mode": "100644",
      "type": "blob"
    },
    "drop.coffee.md": {
      "path": "drop.coffee.md",
      "content": "Drop and Paste Events\n=====================\n\n    Loader = require \"./loader\"\n\n    loader = Loader()\n\n    Drop = (I={}, self=Core(I)) ->\n      stopFn = (event) ->\n        event.stopPropagation()\n        event.preventDefault()\n        return false\n\n      html = document.documentElement\n      html.addEventListener \"dragenter\", stopFn\n      html.addEventListener \"dragover\", stopFn\n      html.addEventListener \"dragleave\", stopFn\n      html.addEventListener \"drop\", (event) ->\n        stopFn(event)\n        Array::forEach.call event.dataTransfer.files, (file) ->\n          url = URL.createObjectURL(file)\n          self.fromDataURL(url)\n\n      document.addEventListener \"paste\", (event) ->\n        Array::some.call event.clipboardData.items, (item) ->\n          if item.type.match /^image\\//\n            file = item.getAsFile()\n            url = URL.createObjectURL(file)\n            self.fromDataURL(url)\n            return true\n          else\n            return false\n\n    module.exports = Drop\n\nHelpers\n-------\n\n    logError = (message) ->\n      console.error message\n",
      "mode": "100644",
      "type": "blob"
    },
    "editor.coffee.md": {
      "path": "editor.coffee.md",
      "content": "Editor\n======\n\n    LITTLE_ENDIAN = require \"./endianness\"\n\n    loader = require(\"./loader\")()\n    ajax = require(\"ajax\")()\n\n    {extend, defaults} = require \"util\"\n\n    TouchCanvas = require \"touch-canvas\"\n\n    Actions = require \"./actions\"\n    Command = require \"./command\"\n    Drop = require \"./drop\"\n    Eval = require \"eval\"\n    GridGen = require \"grid-gen\"\n    Notifications = require \"./notifications\"\n    Postmaster = require \"postmaster\"\n    Tools = require \"./tools\"\n    Undo = require \"undo\"\n\n    Palette = require(\"./palette\")\n\n    {rgb2Hex} = require \"./util\"\n\n    Symmetry = require \"./symmetry\"\n\n    module.exports = (I={}, self=Model(I)) ->\n      pixelExtent = Observable Size(64, 64)\n      pixelSize = Observable 8\n\n      positionDisplay = Observable(\"\")\n\n      symmetryMode = Observable(\"normal\")\n\n      canvas = null\n      lastCommand = null\n\n      replaying = false\n      initialState = null\n\n      self.include Actions\n      self.include Bindable\n      self.include Command\n      self.include Drop\n      self.include Eval\n      self.include Notifications\n      self.include Postmaster\n      self.include Undo\n      self.include Tools\n\n      activeTool = self.activeTool\n\n      self.extend\n        alpha: Observable 100\n\n        pixelSize: pixelSize\n        pixelExtent: pixelExtent\n        positionDisplay: positionDisplay\n\n        viewportWidth: ->\n          pixelExtent().scale(pixelSize()).width\n        viewportHeight: ->\n          pixelExtent().scale(pixelSize()).height\n\n        viewportStyle: ->\n          width = self.viewportWidth()\n          height = self.viewportHeight()\n\n          {iconUrl, iconOffset} = self.activeTool()\n          {x, y} = Point(iconOffset)\n          cursor = \"url(#{iconUrl}) #{x} #{y}, default\"\n\n          \"width: #{width}px; height: #{height}px; cursor: #{cursor};\"\n\n        mainHeight: Observable(720)\n\n        viewportCenter: ->\n          if self.viewportHeight() < self.mainHeight()\n            \"vertical-center\"\n\n        grid: Observable false\n\n        gridStyle: ->\n          if self.grid()\n            gridImage = GridGen(\n              # TODO: Grid size options and matching pixel size/extent\n            ).backgroundImage()\n\n            \"background-image: #{gridImage};\"\n\n        symmetryMode: symmetryMode\n\n        outputCanvas: () ->\n          outputCanvas = TouchCanvas pixelExtent()\n          outputCanvas.context().drawImage(canvas.element(), 0, 0)\n          outputCanvas.element()\n\n        resize: (size, data) ->\n          data ?= self.getSnapshot()\n\n          pixelExtent(Size(size))\n          {width, height} = pixelExtent()\n\n          canvasElement = canvas.element()\n          thumbnailCanvasElement = thumbnailCanvas.element()\n          previewCanvasElement = previewCanvas.element()\n\n          thumbnailCanvasElement.width = canvasElement.width = previewCanvasElement.width = width\n          thumbnailCanvasElement.height = canvasElement.height = previewCanvasElement.height = height\n\n          self.putImageData(data)\n\n          self.repaint()\n\n        repaint: ->\n          {width, height} = pixelExtent()\n          thumbnailCanvas.clear()\n          thumbnailCanvas.context().drawImage(canvas.element(), 0, 0)\n\n          return self\n\n        getSnapshot: ->\n          size = pixelExtent()\n          canvas.context().getImageData(0, 0, size.width, size.height)\n\n        insertImageData: (imageData) ->\n          size = pixelExtent()\n\n          self.execute self.Command.Resize\n            size:\n              width: imageData.width\n              height: imageData.height\n            sizePrevious: size\n            imageData: imageData\n            imageDataPrevious: editor.getSnapshot()\n\n        fromDataURL: (dataURL) ->\n          loader.load(dataURL)\n          .then self.insertImageData\n\n        vintageReplay: (data) ->\n          unless replaying\n            replaying = true\n\n            steps = data\n\n            # It's pretty funny if we don't reset the symmetry mode ^_^\n            self.symmetryMode \"normal\"\n\n            self.repaint()\n\n            delay = (5000 / steps.length).clamp(1, 250)\n            i = 0\n\n            runStep = ->\n              if step = steps[i]\n                step.forEach ({x, y, color}) ->\n                  self.draw {x, y}, {color}\n\n                i += 1\n\n                setTimeout runStep, delay\n              else\n                # Replay will be done and history will have been automatically rebuilt\n                replaying = false\n\n            setTimeout runStep, delay\n\n        replay: (steps) ->\n          unless replaying\n            replaying = true\n\n            # Copy and clear history\n            steps ?= self.history()\n            self.history([])\n\n            editor.canvas.clear()\n            self.repaint()\n\n            delay = (5000 / steps.length).clamp(1, 250)\n            i = 0\n\n            runStep = ->\n              if step = steps[i]\n                self.execute step\n                i += 1\n\n                setTimeout runStep, delay\n              else\n                # Replay will be done and history will have been automatically rebuilt\n                replaying = false\n\n            setTimeout runStep, delay\n\n        loadReplayFromURL: (jsonURL, sourceImage, finalImage) ->\n          if jsonURL?\n            ajax.getJSON(jsonURL)\n            .then (data) ->\n              if Array.isArray(data[0])\n                if sourceImage\n                  Q.all([loader.load(sourceImage), loader.load(finalImage)])\n                  .then ([imageData, finalImageData]) ->\n                    {width, height} = finalImageData\n\n                    editor.setInitialState imageData\n                    editor.restoreInitialState()\n                    editor.resize({width, height})\n                    editor.vintageReplay(data)\n                    editor.setInitialState finalImageData\n                else\n                  loader.load(finalImage)\n                  .then (finalImageData) ->\n                    {width, height} = finalImageData\n                    editor.resize({width, height})\n                    editor.vintageReplay(data)\n                    editor.setInitialState finalImageData\n              else\n                editor.restoreState data, true\n          else\n            loader.load(finalImage)\n            .then (imageData) ->\n              editor.setInitialState imageData\n              editor.restoreInitialState()\n\n        restoreState: (state, performReplay=false) ->\n          self.palette state.palette.map Observable\n\n          initialState = self.imageDataFromJSON(state.initialState)\n          self.restoreInitialState()\n\n          commands = state.history.map self.Command.parse\n\n          if performReplay\n            self.replay commands\n          else\n            commands.forEach (command) -> command.execute()\n            self.history commands\n\n            self.repaint()\n\n        saveState: ->\n          version: \"1\"\n          palette: self.palette().map (o) -> o()\n          history: self.history().invoke \"toJSON\"\n          initialState: self.imageDataToJSON initialState\n\n        setInitialState: (imageData) ->\n          initialState = imageData\n\n        restoreInitialState: ->\n          # Become the image with no history\n          self.resize initialState, initialState\n          self.history([])\n\n        withCanvasMods: (cb) ->\n          canvas.context().globalAlpha = thumbnailCanvas.context().globalAlpha = self.alpha() / 100\n\n          try\n            Symmetry[symmetryMode()](pixelExtent(), [Matrix.IDENTITY]).forEach (transform) ->\n              canvas.withTransform transform, (canvas) ->\n                cb(canvas)\n              thumbnailCanvas.withTransform transform, (canvas) ->\n                cb(canvas)\n          finally\n            canvas.context().globalAlpha = thumbnailCanvas.context().globalAlpha = 1\n\n        draw: (point, options={}) ->\n          {color, size} = options\n          color ?= self.activeColor()\n          size ?= 1\n\n          {x, y} = point\n\n          self.withCanvasMods (canvas) ->\n            if color is \"transparent\"\n              canvas.clear\n                x: x * size\n                y: y * size\n                width: size\n                height: size\n            else\n              canvas.drawRect\n                x: x * size\n                y: y * size\n                width: size\n                height: size\n                color: color\n\n        color: (index) ->\n          self.palette()[index]()\n\n        getColor: (position) ->\n          {x, y} = position\n          data = canvas.context().getImageData(x, y, 1, 1).data\n\n          rgb2Hex data[0], data[1], data[2]\n\n        colorAsInt: ->\n          color = self.activeColor()\n\n          color = color.substring(color.indexOf(\"#\") + 1)\n\n          if color is \"transparent\"\n            0\n          else\n            if LITTLE_ENDIAN\n              parseInt(\"ff#{color[4..5]}#{color[2..3]}#{color[0..1]}\", 16)\n            else\n              parseInt(\"#{color}ff\")\n\n        palette: Observable(Palette.dawnBringer32.map Observable)\n\n        putImageData: (imageData, x=0, y=0) ->\n          canvas.context().putImageData(imageData, x, y)\n\n        selection: (rectangle) ->\n          each: (iterator) ->\n            rectangle.each (x, y) ->\n              index = self.getIndex(x, y)\n              iterator(index, x, y)\n\n        thumbnailClick: (e) ->\n          e.currentTarget.classList.toggle \"right\"\n\n      self.activeColor = Observable \"#000000\"\n\n      self.activeColorStyle = Observable ->\n        \"background-color: #{self.activeColor()}\"\n\n      self.canvas = canvas = TouchCanvas pixelExtent()\n      self.previewCanvas = previewCanvas = TouchCanvas pixelExtent()\n      self.thumbnailCanvas = thumbnailCanvas = TouchCanvas pixelExtent()\n\n      previewCanvas.element().classList.add \"preview\"\n\n      do (ctx=self.canvas.context()) ->\n        ctx.imageSmoothingEnabled = false\n        ctx.mozImageSmoothingEnabled = false\n\n      self.TRANSPARENT_FILL = require(\"./lib/checker\")().pattern()\n\n      canvasPosition = (position) ->\n        Point(position).scale(pixelExtent()).floor()\n\n      snapshot = null\n\n      self.restore = ->\n        if snapshot\n          self.putImageData(snapshot)\n          self.repaint()\n\n      previewCanvas.on \"touch\", (position) ->\n        # Snapshot canvas\n        snapshot = self.getSnapshot()\n\n        activeTool().touch\n          position: canvasPosition position\n          editor: self\n\n      previewCanvas.on \"move\", (position) ->\n        activeTool().move\n          position: canvasPosition position\n          editor: self\n\n      previewCanvas.on \"release\", (position) ->\n        activeTool().release\n          position: canvasPosition position\n          editor: self\n\n        size = pixelExtent()\n        diffSnapshot(snapshot, canvas.context().getImageData(0, 0, size.width, size.height))\n\n        self.trigger \"release\"\n\n      compareImageData = (previous, current) ->\n        return unless previous and current\n        xMin = Infinity\n        xMax = -Infinity\n        yMin = Infinity\n        yMax = -Infinity\n\n        previousData = new Uint32Array(previous.data.buffer)\n        currentData = new Uint32Array(current.data.buffer)\n        length = currentData.length\n        width = current.width\n\n        i = 0\n\n        while i < length\n          x = i % width\n          y = (i / width)|0\n          if previousData[i] != currentData[i]\n            xMin = x if x < xMin\n            xMax = x if x > xMax\n            yMin = y if y < yMin\n            yMax = y if y > yMax\n\n          i += 1\n\n        if xMin != Infinity\n          return [xMin, yMin, xMax - xMin + 1, yMax - yMin + 1]\n        else\n          return null\n\n      diffSnapshot = (previous, current) ->\n        region = compareImageData(previous, current)\n\n        if region\n          [x, y, width, height] = region\n\n          spareCanvas = document.createElement(\"canvas\")\n          spareCanvas.width = width\n          spareCanvas.height = height\n          spareContext = spareCanvas.getContext(\"2d\")\n\n          spareContext.putImageData(previous, -x, -y)\n          previous = spareContext.getImageData(0, 0, width, height)\n\n          spareContext.putImageData(current, -x, -y)\n          current = spareContext.getImageData(0, 0, width, height)\n\n          self.execute self.Command.PutImageData\n            imageData: current\n            imageDataPrevious: previous\n            x: x\n            y: y\n\n      previewCanvas.element().addEventListener \"mousemove\", ({currentTarget, pageX, pageY}) ->\n        {left, top} = currentTarget.getBoundingClientRect()\n        {x, y} = Point(pageX - left, pageY - top).scale(1/pixelSize()).floor()\n\n        positionDisplay(\"#{x},#{y}\")\n\n      self.on \"release\", ->\n        previewCanvas.clear()\n\n        # TODO: Think more about triggering change events\n        self.trigger \"change\"\n\n      # TODO: Extract this decorator pattern\n      [\"undo\", \"execute\", \"redo\"].forEach (method) ->\n        oldMethod = self[method]\n\n        self[method] = ->\n          oldMethod.apply(self, arguments)\n          self.repaint()\n          self.trigger \"change\"\n\n      self.include require \"./dirty\"\n\n      # self.include require(\"./plugins/save_to_s3\")\n\n      initialState = self.getSnapshot()\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "endianness.coffee": {
      "path": "endianness.coffee",
      "content": "buffer = new ArrayBuffer(2)\nnew DataView(buffer).setInt16(0, 256, true)\nmodule.exports = new Int16Array(buffer)[0] is 256\n",
      "mode": "100644",
      "type": "blob"
    },
    "file_reading.coffee.md": {
      "path": "file_reading.coffee.md",
      "content": "File Reading\n============\n\nRead files from a file input triggering an event when a person chooses a file.\n\nCurrently we only care about json, image, and text files, though we may care\nabout others later.\n\n    detectType = (file) ->\n      if file.type.match /^image\\//\n        return \"image\"\n\n      if file.name.match /\\.json$/\n        return \"json\"\n\n      return \"text\"\n\n    normalizeNewlines = (str) ->\n      str.replace(/\\r\\n/g, \"\\n\").replace(/\\r/g, \"\\n\")\n\n    module.exports =\n      readerInput: ({chose, encoding, image, json, text, accept}) ->\n        accept ?= \"image/gif,image/png\"\n        encoding ?= \"UTF-8\"\n\n        input = document.createElement('input')\n        input.type = \"file\"\n        input.setAttribute \"accept\", accept\n\n        input.onchange = ->\n          reader = new FileReader()\n\n          file = input.files[0]\n\n          switch detectType(file)\n            when \"image\"\n              image? URL.createObjectURL(file)\n            when \"json\"\n              reader.onload = (evt) ->\n                json? JSON.parse evt.target.result\n\n              reader.readAsText(file, encoding)\n            when \"text\"\n              reader.onload = (evt) ->\n                text? normalizeNewlines evt.target.result\n\n              reader.readAsText(file, encoding)\n\n          chose(file)\n\n        return input\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/canvas-to-blob.js": {
      "path": "lib/canvas-to-blob.js",
      "content": "/* canvas-toBlob.js\n * A canvas.toBlob() implementation.\n * 2011-07-13\n *\n * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */\n\n(function(view) {\n\"use strict\";\nvar\n    Uint8Array = view.Uint8Array\n\t, HTMLCanvasElement = view.HTMLCanvasElement\n\t, is_base64_regex = /\\s*;\\s*base64\\s*(?:;|$)/i\n\t, base64_ranks\n\t, decode_base64 = function(base64) {\n\t\tvar\n\t\t\t  len = base64.length\n\t\t\t, buffer = new Uint8Array(len / 4 * 3 | 0)\n\t\t\t, i = 0\n\t\t\t, outptr = 0\n\t\t\t, last = [0, 0]\n\t\t\t, state = 0\n\t\t\t, save = 0\n\t\t\t, rank\n\t\t\t, code\n\t\t\t, undef\n\t\t;\n\t\twhile (len--) {\n\t\t\tcode = base64.charCodeAt(i++);\n\t\t\trank = base64_ranks[code-43];\n\t\t\tif (rank !== 255 && rank !== undef) {\n\t\t\t\tlast[1] = last[0];\n\t\t\t\tlast[0] = code;\n\t\t\t\tsave = (save << 6) | rank;\n\t\t\t\tstate++;\n\t\t\t\tif (state === 4) {\n\t\t\t\t\tbuffer[outptr++] = save >>> 16;\n\t\t\t\t\tif (last[1] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save >>> 8;\n\t\t\t\t\t}\n\t\t\t\t\tif (last[0] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save;\n\t\t\t\t\t}\n\t\t\t\t\tstate = 0;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t// 2/3 chance there's going to be some null bytes at the end, but that\n\t\t// doesn't really matter with most image formats.\n\t\t// If it somehow matters for you, truncate the buffer up outptr.\n\t\treturn buffer;\n\t}\n;\nif (Uint8Array) {\n\tbase64_ranks = new Uint8Array([\n\t\t  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1\n\t\t, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9\n\t\t, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25\n\t\t, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35\n\t\t, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51\n\t]);\n}\nif (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {\n\tHTMLCanvasElement.prototype.toBlob = function(callback, type /*, ...args*/) {\n\t\t  if (!type) {\n\t\t\ttype = \"image/png\";\n\t\t} if (this.mozGetAsFile) {\n\t\t\tcallback(this.mozGetAsFile(\"canvas\", type));\n\t\t\treturn;\n\t\t}\n\t\tvar\n\t\t\t  args = Array.prototype.slice.call(arguments, 1)\n\t\t\t, dataURI = this.toDataURL.apply(this, args)\n\t\t\t, header_end = dataURI.indexOf(\",\")\n\t\t\t, data = dataURI.substring(header_end + 1)\n\t\t\t, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))\n\t\t\t, blob\n\t\t;\n\t\tif (Blob.fake) {\n\t\t\t// no reason to decode a data: URI that's just going to become a data URI again\n\t\t\tblob = new Blob\n\t\t\tif (is_base64) {\n\t\t\t\tblob.encoding = \"base64\";\n\t\t\t} else {\n\t\t\t\tblob.encoding = \"URI\";\n\t\t\t}\n\t\t\tblob.data = data;\n\t\t\tblob.size = data.length;\n\t\t} else if (Uint8Array) {\n\t\t\tif (is_base64) {\n\t\t\t\tblob = new Blob([decode_base64(data)], {type: type});\n\t\t\t} else {\n\t\t\t\tblob = new Blob([decodeURIComponent(data)], {type: type});\n\t\t\t}\n\t\t}\n\t\tcallback(blob);\n\t};\n}\n}(self));\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/checker.coffee": {
      "path": "lib/checker.coffee",
      "content": "module.exports = ({colors, size}={}) ->\n  colors ?= [\"white\", \"#CCCCCC\"]\n  size ?= 8\n\n  canvasWidth = 2 * size\n  canvasHeight = 2 * size\n\n  canvas = document.createElement(\"canvas\")\n  canvas.width = canvasWidth\n  canvas.height = canvasHeight\n\n  context = canvas.getContext(\"2d\")\n\n  context.fillStyle = colors[0]\n  context.fillRect(0, 0, size, size)\n  context.fillRect(size, size, size, size)\n\n  context.fillStyle = colors[1]\n  context.fillRect(0, size, size, size)\n  context.fillRect(size, 0, size, size)\n\n  pattern: (repeat=\"repeat\") ->\n    context.createPattern(canvas, repeat)\n\n  backgroundImage: ->\n    \"url(#{this.toDataURL()})\"\n\n  toDataURL: ->\n    canvas.toDataURL(\"image/png\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/file_saver.js": {
      "path": "lib/file_saver.js",
      "content": "/* FileSaver.js\n * A saveAs() FileSaver implementation.\n * 2013-10-21\n *\n * By Eli Grey, http://eligrey.com\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */\n\nvar saveAs = saveAs\n  || (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))\n  || (function(view) {\n  \"use strict\";\n\tvar\n\t\t  doc = view.document\n\t\t  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet\n\t\t, get_URL = function() {\n\t\t\treturn view.URL || view.webkitURL || view;\n\t\t}\n\t\t, URL = view.URL || view.webkitURL || view\n\t\t, save_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\")\n\t\t, can_use_save_link =  !view.externalHost && \"download\" in save_link\n\t\t, click = function(node) {\n\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\tevent.initMouseEvent(\n\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t, false, false, false, false, 0, null\n\t\t\t);\n\t\t\tnode.dispatchEvent(event);\n\t\t}\n\t\t, webkit_req_fs = view.webkitRequestFileSystem\n\t\t, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem\n\t\t, throw_outside = function (ex) {\n\t\t\t(view.setImmediate || view.setTimeout)(function() {\n\t\t\t\tthrow ex;\n\t\t\t}, 0);\n\t\t}\n\t\t, force_saveable_type = \"application/octet-stream\"\n\t\t, fs_min_size = 0\n\t\t, deletion_queue = []\n\t\t, process_deletion_queue = function() {\n\t\t\tvar i = deletion_queue.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar file = deletion_queue[i];\n\t\t\t\tif (typeof file === \"string\") { // file is an object URL\n\t\t\t\t\tURL.revokeObjectURL(file);\n\t\t\t\t} else { // file is a File\n\t\t\t\t\tfile.remove();\n\t\t\t\t}\n\t\t\t}\n\t\t\tdeletion_queue.length = 0; // clear queue\n\t\t}\n\t\t, dispatch = function(filesaver, event_types, event) {\n\t\t\tevent_types = [].concat(event_types);\n\t\t\tvar i = event_types.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar listener = filesaver[\"on\" + event_types[i]];\n\t\t\t\tif (typeof listener === \"function\") {\n\t\t\t\t\ttry {\n\t\t\t\t\t\tlistener.call(filesaver, event || filesaver);\n\t\t\t\t\t} catch (ex) {\n\t\t\t\t\t\tthrow_outside(ex);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t, FileSaver = function(blob, name) {\n\t\t\t// First try a.download, then web filesystem, then object URLs\n\t\t\tvar\n\t\t\t\t  filesaver = this\n\t\t\t\t, type = blob.type\n\t\t\t\t, blob_changed = false\n\t\t\t\t, object_url\n\t\t\t\t, target_view\n\t\t\t\t, get_object_url = function() {\n\t\t\t\t\tvar object_url = get_URL().createObjectURL(blob);\n\t\t\t\t\tdeletion_queue.push(object_url);\n\t\t\t\t\treturn object_url;\n\t\t\t\t}\n\t\t\t\t, dispatch_all = function() {\n\t\t\t\t\tdispatch(filesaver, \"writestart progress write writeend\".split(\" \"));\n\t\t\t\t}\n\t\t\t\t// on any filesys errors revert to saving with object URLs\n\t\t\t\t, fs_error = function() {\n\t\t\t\t\t// don't create more object URLs than needed\n\t\t\t\t\tif (blob_changed || !object_url) {\n\t\t\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t\t}\n\t\t\t\t\tif (target_view) {\n\t\t\t\t\t\ttarget_view.location.href = object_url;\n\t\t\t\t\t} else {\n                        window.open(object_url, \"_blank\");\n                    }\n\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\tdispatch_all();\n\t\t\t\t}\n\t\t\t\t, abortable = function(func) {\n\t\t\t\t\treturn function() {\n\t\t\t\t\t\tif (filesaver.readyState !== filesaver.DONE) {\n\t\t\t\t\t\t\treturn func.apply(this, arguments);\n\t\t\t\t\t\t}\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t\t, create_if_not_found = {create: true, exclusive: false}\n\t\t\t\t, slice\n\t\t\t;\n\t\t\tfilesaver.readyState = filesaver.INIT;\n\t\t\tif (!name) {\n\t\t\t\tname = \"download\";\n\t\t\t}\n\t\t\tif (can_use_save_link) {\n\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t// FF for Android has a nasty garbage collection mechanism\n\t\t\t\t// that turns all objects that are not pure javascript into 'deadObject'\n\t\t\t\t// this means `doc` and `save_link` are unusable and need to be recreated\n\t\t\t\t// `view` is usable though:\n\t\t\t\tdoc = view.document;\n\t\t\t\tsave_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\");\n\t\t\t\tsave_link.href = object_url;\n\t\t\t\tsave_link.download = name;\n\t\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\t\tevent.initMouseEvent(\n\t\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t\t, false, false, false, false, 0, null\n\t\t\t\t);\n\t\t\t\tsave_link.dispatchEvent(event);\n\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\tdispatch_all();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\t// Object and web filesystem URLs have a problem saving in Google Chrome when\n\t\t\t// viewed in a tab, so I force save with application/octet-stream\n\t\t\t// http://code.google.com/p/chromium/issues/detail?id=91158\n\t\t\tif (view.chrome && type && type !== force_saveable_type) {\n\t\t\t\tslice = blob.slice || blob.webkitSlice;\n\t\t\t\tblob = slice.call(blob, 0, blob.size, force_saveable_type);\n\t\t\t\tblob_changed = true;\n\t\t\t}\n\t\t\t// Since I can't be sure that the guessed media type will trigger a download\n\t\t\t// in WebKit, I append .download to the filename.\n\t\t\t// https://bugs.webkit.org/show_bug.cgi?id=65440\n\t\t\tif (webkit_req_fs && name !== \"download\") {\n\t\t\t\tname += \".download\";\n\t\t\t}\n\t\t\tif (type === force_saveable_type || webkit_req_fs) {\n\t\t\t\ttarget_view = view;\n\t\t\t}\n\t\t\tif (!req_fs) {\n\t\t\t\tfs_error();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tfs_min_size += blob.size;\n\t\t\treq_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {\n\t\t\t\tfs.root.getDirectory(\"saved\", create_if_not_found, abortable(function(dir) {\n\t\t\t\t\tvar save = function() {\n\t\t\t\t\t\tdir.getFile(name, create_if_not_found, abortable(function(file) {\n\t\t\t\t\t\t\tfile.createWriter(abortable(function(writer) {\n\t\t\t\t\t\t\t\twriter.onwriteend = function(event) {\n\t\t\t\t\t\t\t\t\ttarget_view.location.href = file.toURL();\n\t\t\t\t\t\t\t\t\tdeletion_queue.push(file);\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t\tdispatch(filesaver, \"writeend\", event);\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\twriter.onerror = function() {\n\t\t\t\t\t\t\t\t\tvar error = writer.error;\n\t\t\t\t\t\t\t\t\tif (error.code !== error.ABORT_ERR) {\n\t\t\t\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\t\"writestart progress write abort\".split(\" \").forEach(function(event) {\n\t\t\t\t\t\t\t\t\twriter[\"on\" + event] = filesaver[\"on\" + event];\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t\twriter.write(blob);\n\t\t\t\t\t\t\t\tfilesaver.abort = function() {\n\t\t\t\t\t\t\t\t\twriter.abort();\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.WRITING;\n\t\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t};\n\t\t\t\t\tdir.getFile(name, {create: false}, abortable(function(file) {\n\t\t\t\t\t\t// delete file if it already exists\n\t\t\t\t\t\tfile.remove();\n\t\t\t\t\t\tsave();\n\t\t\t\t\t}), abortable(function(ex) {\n\t\t\t\t\t\tif (ex.code === ex.NOT_FOUND_ERR) {\n\t\t\t\t\t\t\tsave();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t}\n\t\t\t\t\t}));\n\t\t\t\t}), fs_error);\n\t\t\t}), fs_error);\n\t\t}\n\t\t, FS_proto = FileSaver.prototype\n\t\t, saveAs = function(blob, name) {\n\t\t\treturn new FileSaver(blob, name);\n\t\t}\n\t;\n\tFS_proto.abort = function() {\n\t\tvar filesaver = this;\n\t\tfilesaver.readyState = filesaver.DONE;\n\t\tdispatch(filesaver, \"abort\");\n\t};\n\tFS_proto.readyState = FS_proto.INIT = 0;\n\tFS_proto.WRITING = 1;\n\tFS_proto.DONE = 2;\n\n\tFS_proto.error =\n\tFS_proto.onwritestart =\n\tFS_proto.onprogress =\n\tFS_proto.onwrite =\n\tFS_proto.onabort =\n\tFS_proto.onerror =\n\tFS_proto.onwriteend =\n\t\tnull;\n\n\tview.addEventListener(\"unload\", process_deletion_queue, false);\n\treturn saveAs;\n}(window));\n\nif (typeof module !== 'undefined') module.exports = saveAs;\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/lz-string.js": {
      "path": "lib/lz-string.js",
      "content": "// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>\n// This work is free. You can redistribute it and/or modify it\n// under the terms of the WTFPL, Version 2\n// For more information see LICENSE.txt or http://www.wtfpl.net/\n//\n// For more information, the home page:\n// http://pieroxy.net/blog/pages/lz-string/testing.html\n//\n// LZ-based compression algorithm, version 1.4.4\nvar LZString = (function() {\n\n// private property\nvar f = String.fromCharCode;\nvar keyStrBase64 = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\";\nvar keyStrUriSafe = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$\";\nvar baseReverseDic = {};\n\nfunction getBaseValue(alphabet, character) {\n  if (!baseReverseDic[alphabet]) {\n    baseReverseDic[alphabet] = {};\n    for (var i=0 ; i<alphabet.length ; i++) {\n      baseReverseDic[alphabet][alphabet.charAt(i)] = i;\n    }\n  }\n  return baseReverseDic[alphabet][character];\n}\n\nvar LZString = {\n  compressToBase64 : function (input) {\n    if (input == null) return \"\";\n    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});\n    switch (res.length % 4) { // To produce valid Base64\n    default: // When could this happen ?\n    case 0 : return res;\n    case 1 : return res+\"===\";\n    case 2 : return res+\"==\";\n    case 3 : return res+\"=\";\n    }\n  },\n\n  decompressFromBase64 : function (input) {\n    if (input == null) return \"\";\n    if (input == \"\") return null;\n    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });\n  },\n\n  compressToUTF16 : function (input) {\n    if (input == null) return \"\";\n    return LZString._compress(input, 15, function(a){return f(a+32);}) + \" \";\n  },\n\n  decompressFromUTF16: function (compressed) {\n    if (compressed == null) return \"\";\n    if (compressed == \"\") return null;\n    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });\n  },\n\n  //compress into uint8array (UCS-2 big endian format)\n  compressToUint8Array: function (uncompressed) {\n    var compressed = LZString.compress(uncompressed);\n    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character\n\n    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {\n      var current_value = compressed.charCodeAt(i);\n      buf[i*2] = current_value >>> 8;\n      buf[i*2+1] = current_value % 256;\n    }\n    return buf;\n  },\n\n  //decompress from uint8array (UCS-2 big endian format)\n  decompressFromUint8Array:function (compressed) {\n    if (compressed===null || compressed===undefined){\n        return LZString.decompress(compressed);\n    } else {\n        var buf=new Array(compressed.length/2); // 2 bytes per character\n        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {\n          buf[i]=compressed[i*2]*256+compressed[i*2+1];\n        }\n\n        var result = [];\n        buf.forEach(function (c) {\n          result.push(f(c));\n        });\n        return LZString.decompress(result.join(''));\n\n    }\n\n  },\n\n\n  //compress into a string that is already URI encoded\n  compressToEncodedURIComponent: function (input) {\n    if (input == null) return \"\";\n    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});\n  },\n\n  //decompress from an output of compressToEncodedURIComponent\n  decompressFromEncodedURIComponent:function (input) {\n    if (input == null) return \"\";\n    if (input == \"\") return null;\n    input = input.replace(/ /g, \"+\");\n    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });\n  },\n\n  compress: function (uncompressed) {\n    return LZString._compress(uncompressed, 16, function(a){return f(a);});\n  },\n  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {\n    if (uncompressed == null) return \"\";\n    var i, value,\n        context_dictionary= {},\n        context_dictionaryToCreate= {},\n        context_c=\"\",\n        context_wc=\"\",\n        context_w=\"\",\n        context_enlargeIn= 2, // Compensate for the first entry which should not count\n        context_dictSize= 3,\n        context_numBits= 2,\n        context_data=[],\n        context_data_val=0,\n        context_data_position=0,\n        ii;\n\n    for (ii = 0; ii < uncompressed.length; ii += 1) {\n      context_c = uncompressed.charAt(ii);\n      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {\n        context_dictionary[context_c] = context_dictSize++;\n        context_dictionaryToCreate[context_c] = true;\n      }\n\n      context_wc = context_w + context_c;\n      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {\n        context_w = context_wc;\n      } else {\n        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {\n          if (context_w.charCodeAt(0)<256) {\n            for (i=0 ; i<context_numBits ; i++) {\n              context_data_val = (context_data_val << 1);\n              if (context_data_position == bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n            }\n            value = context_w.charCodeAt(0);\n            for (i=0 ; i<8 ; i++) {\n              context_data_val = (context_data_val << 1) | (value&1);\n              if (context_data_position == bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n              value = value >> 1;\n            }\n          } else {\n            value = 1;\n            for (i=0 ; i<context_numBits ; i++) {\n              context_data_val = (context_data_val << 1) | value;\n              if (context_data_position ==bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n              value = 0;\n            }\n            value = context_w.charCodeAt(0);\n            for (i=0 ; i<16 ; i++) {\n              context_data_val = (context_data_val << 1) | (value&1);\n              if (context_data_position == bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n              value = value >> 1;\n            }\n          }\n          context_enlargeIn--;\n          if (context_enlargeIn == 0) {\n            context_enlargeIn = Math.pow(2, context_numBits);\n            context_numBits++;\n          }\n          delete context_dictionaryToCreate[context_w];\n        } else {\n          value = context_dictionary[context_w];\n          for (i=0 ; i<context_numBits ; i++) {\n            context_data_val = (context_data_val << 1) | (value&1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = value >> 1;\n          }\n\n\n        }\n        context_enlargeIn--;\n        if (context_enlargeIn == 0) {\n          context_enlargeIn = Math.pow(2, context_numBits);\n          context_numBits++;\n        }\n        // Add wc to the dictionary.\n        context_dictionary[context_wc] = context_dictSize++;\n        context_w = String(context_c);\n      }\n    }\n\n    // Output the code for w.\n    if (context_w !== \"\") {\n      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {\n        if (context_w.charCodeAt(0)<256) {\n          for (i=0 ; i<context_numBits ; i++) {\n            context_data_val = (context_data_val << 1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n          }\n          value = context_w.charCodeAt(0);\n          for (i=0 ; i<8 ; i++) {\n            context_data_val = (context_data_val << 1) | (value&1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = value >> 1;\n          }\n        } else {\n          value = 1;\n          for (i=0 ; i<context_numBits ; i++) {\n            context_data_val = (context_data_val << 1) | value;\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = 0;\n          }\n          value = context_w.charCodeAt(0);\n          for (i=0 ; i<16 ; i++) {\n            context_data_val = (context_data_val << 1) | (value&1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = value >> 1;\n          }\n        }\n        context_enlargeIn--;\n        if (context_enlargeIn == 0) {\n          context_enlargeIn = Math.pow(2, context_numBits);\n          context_numBits++;\n        }\n        delete context_dictionaryToCreate[context_w];\n      } else {\n        value = context_dictionary[context_w];\n        for (i=0 ; i<context_numBits ; i++) {\n          context_data_val = (context_data_val << 1) | (value&1);\n          if (context_data_position == bitsPerChar-1) {\n            context_data_position = 0;\n            context_data.push(getCharFromInt(context_data_val));\n            context_data_val = 0;\n          } else {\n            context_data_position++;\n          }\n          value = value >> 1;\n        }\n\n\n      }\n      context_enlargeIn--;\n      if (context_enlargeIn == 0) {\n        context_enlargeIn = Math.pow(2, context_numBits);\n        context_numBits++;\n      }\n    }\n\n    // Mark the end of the stream\n    value = 2;\n    for (i=0 ; i<context_numBits ; i++) {\n      context_data_val = (context_data_val << 1) | (value&1);\n      if (context_data_position == bitsPerChar-1) {\n        context_data_position = 0;\n        context_data.push(getCharFromInt(context_data_val));\n        context_data_val = 0;\n      } else {\n        context_data_position++;\n      }\n      value = value >> 1;\n    }\n\n    // Flush the last char\n    while (true) {\n      context_data_val = (context_data_val << 1);\n      if (context_data_position == bitsPerChar-1) {\n        context_data.push(getCharFromInt(context_data_val));\n        break;\n      }\n      else context_data_position++;\n    }\n    return context_data.join('');\n  },\n\n  decompress: function (compressed) {\n    if (compressed == null) return \"\";\n    if (compressed == \"\") return null;\n    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });\n  },\n\n  _decompress: function (length, resetValue, getNextValue) {\n    var dictionary = [],\n        next,\n        enlargeIn = 4,\n        dictSize = 4,\n        numBits = 3,\n        entry = \"\",\n        result = [],\n        i,\n        w,\n        bits, resb, maxpower, power,\n        c,\n        data = {val:getNextValue(0), position:resetValue, index:1};\n\n    for (i = 0; i < 3; i += 1) {\n      dictionary[i] = i;\n    }\n\n    bits = 0;\n    maxpower = Math.pow(2,2);\n    power=1;\n    while (power!=maxpower) {\n      resb = data.val & data.position;\n      data.position >>= 1;\n      if (data.position == 0) {\n        data.position = resetValue;\n        data.val = getNextValue(data.index++);\n      }\n      bits |= (resb>0 ? 1 : 0) * power;\n      power <<= 1;\n    }\n\n    switch (next = bits) {\n      case 0:\n          bits = 0;\n          maxpower = Math.pow(2,8);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n        c = f(bits);\n        break;\n      case 1:\n          bits = 0;\n          maxpower = Math.pow(2,16);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n        c = f(bits);\n        break;\n      case 2:\n        return \"\";\n    }\n    dictionary[3] = c;\n    w = c;\n    result.push(c);\n    while (true) {\n      if (data.index > length) {\n        return \"\";\n      }\n\n      bits = 0;\n      maxpower = Math.pow(2,numBits);\n      power=1;\n      while (power!=maxpower) {\n        resb = data.val & data.position;\n        data.position >>= 1;\n        if (data.position == 0) {\n          data.position = resetValue;\n          data.val = getNextValue(data.index++);\n        }\n        bits |= (resb>0 ? 1 : 0) * power;\n        power <<= 1;\n      }\n\n      switch (c = bits) {\n        case 0:\n          bits = 0;\n          maxpower = Math.pow(2,8);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n\n          dictionary[dictSize++] = f(bits);\n          c = dictSize-1;\n          enlargeIn--;\n          break;\n        case 1:\n          bits = 0;\n          maxpower = Math.pow(2,16);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n          dictionary[dictSize++] = f(bits);\n          c = dictSize-1;\n          enlargeIn--;\n          break;\n        case 2:\n          return result.join('');\n      }\n\n      if (enlargeIn == 0) {\n        enlargeIn = Math.pow(2, numBits);\n        numBits++;\n      }\n\n      if (dictionary[c]) {\n        entry = dictionary[c];\n      } else {\n        if (c === dictSize) {\n          entry = w + w.charAt(0);\n        } else {\n          return null;\n        }\n      }\n      result.push(entry);\n\n      // Add w+entry[0] to the dictionary.\n      dictionary[dictSize++] = w + entry.charAt(0);\n      enlargeIn--;\n\n      w = entry;\n\n      if (enlargeIn == 0) {\n        enlargeIn = Math.pow(2, numBits);\n        numBits++;\n      }\n\n    }\n  }\n};\n  return LZString;\n})();\n\nif (typeof define === 'function' && define.amd) {\n  define(function () { return LZString; });\n} else if( typeof module !== 'undefined' && module != null ) {\n  module.exports = LZString\n}\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/mousetrap.js": {
      "path": "lib/mousetrap.js",
      "content": "/* mousetrap v1.5.3 craig.is/killing/mice */\n(function(C,r,g){function t(a,b,h){a.addEventListener?a.addEventListener(b,h,!1):a.attachEvent(\"on\"+b,h)}function x(a){if(\"keypress\"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return l[a.which]?l[a.which]:p[a.which]?p[a.which]:String.fromCharCode(a.which).toLowerCase()}function D(a){var b=[];a.shiftKey&&b.push(\"shift\");a.altKey&&b.push(\"alt\");a.ctrlKey&&b.push(\"ctrl\");a.metaKey&&b.push(\"meta\");return b}function u(a){return\"shift\"==a||\"ctrl\"==a||\"alt\"==a||\n\"meta\"==a}function y(a,b){var h,c,e,g=[];h=a;\"+\"===h?h=[\"+\"]:(h=h.replace(/\\+{2}/g,\"+plus\"),h=h.split(\"+\"));for(e=0;e<h.length;++e)c=h[e],z[c]&&(c=z[c]),b&&\"keypress\"!=b&&A[c]&&(c=A[c],g.push(\"shift\")),u(c)&&g.push(c);h=c;e=b;if(!e){if(!k){k={};for(var m in l)95<m&&112>m||l.hasOwnProperty(m)&&(k[l[m]]=m)}e=k[h]?\"keydown\":\"keypress\"}\"keypress\"==e&&g.length&&(e=\"keydown\");return{key:c,modifiers:g,action:e}}function B(a,b){return null===a||a===r?!1:a===b?!0:B(a.parentNode,b)}function c(a){function b(a){a=\na||{};var b=!1,n;for(n in q)a[n]?b=!0:q[n]=0;b||(v=!1)}function h(a,b,n,f,c,h){var g,e,l=[],m=n.type;if(!d._callbacks[a])return[];\"keyup\"==m&&u(a)&&(b=[a]);for(g=0;g<d._callbacks[a].length;++g)if(e=d._callbacks[a][g],(f||!e.seq||q[e.seq]==e.level)&&m==e.action){var k;(k=\"keypress\"==m&&!n.metaKey&&!n.ctrlKey)||(k=e.modifiers,k=b.sort().join(\",\")===k.sort().join(\",\"));k&&(k=f&&e.seq==f&&e.level==h,(!f&&e.combo==c||k)&&d._callbacks[a].splice(g,1),l.push(e))}return l}function g(a,b,n,f){d.stopCallback(b,\nb.target||b.srcElement,n,f)||!1!==a(b,n)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){\"number\"!==typeof a.which&&(a.which=a.keyCode);var b=x(a);b&&(\"keyup\"==a.type&&w===b?w=!1:d.handleKey(b,D(a),a))}function l(a,c,n,f){function e(c){return function(){v=c;++q[a];clearTimeout(k);k=setTimeout(b,1E3)}}function h(c){g(n,c,a);\"keyup\"!==f&&(w=x(c));setTimeout(b,10)}for(var d=q[a]=0;d<c.length;++d){var p=d+1===c.length?h:e(f||\ny(c[d+1]).action);m(c[d],p,f,a,d)}}function m(a,b,c,f,e){d._directMap[a+\":\"+c]=b;a=a.replace(/\\s+/g,\" \");var g=a.split(\" \");1<g.length?l(a,g,b,c):(c=y(a,c),d._callbacks[c.key]=d._callbacks[c.key]||[],h(c.key,c.modifiers,{type:c.action},f,a,e),d._callbacks[c.key][f?\"unshift\":\"push\"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:e,combo:a}))}var d=this;a=a||r;if(!(d instanceof c))return new c(a);d.target=a;d._callbacks={};d._directMap={};var q={},k,w=!1,p=!1,v=!1;d._handleKey=function(a,\nc,e){var f=h(a,c,e),d;c={};var k=0,l=!1;for(d=0;d<f.length;++d)f[d].seq&&(k=Math.max(k,f[d].level));for(d=0;d<f.length;++d)f[d].seq?f[d].level==k&&(l=!0,c[f[d].seq]=1,g(f[d].callback,e,f[d].combo,f[d].seq)):l||g(f[d].callback,e,f[d].combo);f=\"keypress\"==e.type&&p;e.type!=v||u(a)||f||b(c);p=l&&\"keydown\"==e.type};d._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)m(a[d],b,c)};t(a,\"keypress\",e);t(a,\"keydown\",e);t(a,\"keyup\",e)}var l={8:\"backspace\",9:\"tab\",13:\"enter\",16:\"shift\",17:\"ctrl\",18:\"alt\",\n20:\"capslock\",27:\"esc\",32:\"space\",33:\"pageup\",34:\"pagedown\",35:\"end\",36:\"home\",37:\"left\",38:\"up\",39:\"right\",40:\"down\",45:\"ins\",46:\"del\",91:\"meta\",93:\"meta\",224:\"meta\"},p={106:\"*\",107:\"+\",109:\"-\",110:\".\",111:\"/\",186:\";\",187:\"=\",188:\",\",189:\"-\",190:\".\",191:\"/\",192:\"`\",219:\"[\",220:\"\\\\\",221:\"]\",222:\"'\"},A={\"~\":\"`\",\"!\":\"1\",\"@\":\"2\",\"#\":\"3\",$:\"4\",\"%\":\"5\",\"^\":\"6\",\"&\":\"7\",\"*\":\"8\",\"(\":\"9\",\")\":\"0\",_:\"-\",\"+\":\"=\",\":\":\";\",'\"':\"'\",\"<\":\",\",\">\":\".\",\"?\":\"/\",\"|\":\"\\\\\"},z={option:\"alt\",command:\"meta\",\"return\":\"enter\",\nescape:\"esc\",plus:\"+\",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?\"meta\":\"ctrl\"},k;for(g=1;20>g;++g)l[111+g]=\"f\"+g;for(g=0;9>=g;++g)l[g+96]=g;c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+\":\"+b])this._directMap[a+\":\"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};this._directMap=\n{};return this};c.prototype.stopCallback=function(a,b){return-1<(\" \"+b.className+\" \").indexOf(\" mousetrap \")||B(b,this.target)?!1:\"INPUT\"==b.tagName||\"SELECT\"==b.tagName||\"TEXTAREA\"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.init=function(){var a=c(r),b;for(b in a)\"_\"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};c.init();C.Mousetrap=c;\"undefined\"!==typeof module&&module.exports&&(module.exports=\nc);\"function\"===typeof define&&define.amd&&define(function(){return c})})(window,document);\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/rectangle.coffee.md": {
      "path": "lib/rectangle.coffee.md",
      "content": "Rectangle\n=========\n\n    {abs, min} = Math\n\n    module.exports = Rectangle = (position, size) ->\n      if position?.size?\n        {position, size} = position\n\n      position: Point(position)\n      size: Size(size)\n      __proto__: Rectangle.prototype\n\n    Rectangle.prototype =\n      each: (iterator) ->\n        p = @position\n\n        @size.each (x, y) ->\n          iterator(p.x + x, p.y + y)\n\n    Rectangle.fromPoints = (start, end) ->\n      Rectangle Point(min(start.x, end.x), min(start.y, end.y)), Size(abs(end.x - start.x), abs(end.y - start.y))\n",
      "mode": "100644",
      "type": "blob"
    },
    "loader.coffee.md": {
      "path": "loader.coffee.md",
      "content": "Loader\n======\n\n    Loader = ->\n      load: (url) ->\n        new Promise (resolve, reject) ->\n          canvas = document.createElement('canvas')\n          context = canvas.getContext('2d')\n          image = document.createElement(\"img\")\n          image.crossOrigin = true\n\n          image.onload = ->\n            {width, height} = image\n\n            canvas.width = width\n            canvas.height = height\n            context.drawImage(image, 0, 0)\n            imageData = context.getImageData(0, 0, width, height)\n\n            resolve imageData\n\n          image.onerror = ->\n            reject new Error \"Error loading image data\"\n\n          image.src = url\n\n    module.exports = Loader\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "Pixel Editor\n============\n\nWelcome to this cool pixel editor. Eventually you'll be able to read this for\nhelp, but right now it's mostly code.\n\nEditing pixels in your browser.\n\n    # For debug purposes\n    global.PACKAGE = PACKAGE\n    global.require = require\n\n    # Google Analytics\n    require(\"analytics\").init(\"UA-3464282-15\")\n\n    # Setup\n    require \"./lib/canvas-to-blob\"\n\n    runtime = require(\"runtime\")(PACKAGE)\n    runtime.boot()\n    runtime.applyStyleSheet(require('./style'))\n\n    Editor = require \"./editor\"\n\n    # For debugging\n    global.editor = Editor()\n\n    editor.notify(\"Welcome to PixiPaint!\")\n\n    Template = require \"./templates/editor\"\n    editorElement = Template editor\n    document.body.appendChild editorElement\n\n    updateViewportCentering = ->\n      {height: mainHeight} = editorElement.querySelector(\".main\").getBoundingClientRect()\n      editor.mainHeight mainHeight\n    window.addEventListener \"resize\", updateViewportCentering\n    updateViewportCentering()\n",
      "mode": "100644",
      "type": "blob"
    },
    "modal.coffee.md": {
      "path": "modal.coffee.md",
      "content": "Modal\n=====\n\nMessing around with some modal BS\n\n    modal = document.createElement \"div\"\n    modal.id = \"modal\"\n\n    modal.onclick = (e) ->\n      console.log e\n      if e.target is modal\n        Modal.hide()\n\n    document.body.appendChild modal\n\n    module.exports = Modal =\n      show: (element) ->\n        empty(modal).appendChild(element)\n        modal.classList.add \"active\"\n\n      hide: ->\n        modal.classList.remove \"active\"\n\n    empty = (node) ->\n      while node.hasChildNodes()\n        node.removeChild(node.lastChild)\n\n      return node\n",
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
      "content": "Palette\n=======\n\nHelpers\n-------\n\n    JASC_HEADER = \"\"\"\n      JASC-PAL\n      0100\n      256\n    \"\"\"\n\nA liberal regex for matching the header in a JASC PAL file.\n\n    JASC_REGEX = ///\n      JASC-PAL\\n\n      \\d+\\n\n      \\d+\\n\n    ///\n\n    fromStrings = (lines) ->\n      lines.split(\"\\n\").map (line) ->\n        \"#\" + line.split(\" \").map (string) ->\n          numberToHex parseInt(string, 10)\n        .join(\"\")\n\n    numberToHex = (n) ->\n      \"0#{n.toString(0x10)}\".slice(-2).toUpperCase()\n\n    TRANSPARENT = [0xff, 0, 0xff]\n    colorToRGB = (colorString) ->\n      # HACK: Use crazy magenta for transparent in palette export.\n      if colorString is \"transparent\"\n        TRANSPARENT\n      else\n        colorString.match(/([0-9A-F]{2})/g).map (part) ->\n          parseInt part, 0x10\n\n    loadJASC = (lines) ->\n      if lines.match JASC_REGEX\n        colors = fromStrings(lines.replace(JASC_REGEX, \"\")).unique()\n\n        if colors.length > 32\n          # TODO: Notify on screen\n          console.warn \"Dropped excess colors (#{colors.length - 32}), kept first 32\"\n          colors[0...32]\n        else\n          colors\n      else\n        alert \"unknown file format, currently only support JASC PAL\"\n\nExport to Formats\n-----------------\n\n    exportJASC = (array) ->\n      entries = array\n      .map (entry) ->\n        colorToRGB(entry).join(\" \")\n      .join(\"\\n\")\n\n      padding = Math.max(0, 256 - array.length)\n\n      zeroes = [0...padding].map ->\n        \"0 0 0\"\n      .join(\"\\n\")\n\n      \"\"\"\n        #{JASC_HEADER}\n        #{entries}\n        #{zeroes}\n      \"\"\"\n\nPalettes\n--------\n\n    Palette =\n\n      defaults:\n        [\n          \"transparent\"\n          \"#05050D\"\n          \"#666666\"\n          \"#DCDCDC\"\n          \"#FFFFFF\"\n          \"#EB070E\"\n          \"#F69508\"\n          \"#FFDE49\"\n          \"#388326\"\n          \"#0246E3\"\n          \"#563495\"\n          \"#58C4F5\"\n          \"#F82481\"\n          \"#E5AC99\"\n          \"#5B4635\"\n          \"#FFFEE9\"\n        ]\n\nhttp://www.pixeljoint.com/forum/forum_posts.asp?TID=12795\n\n      dawnBringer16: fromStrings \"\"\"\n        20 12 28\n        68 36 52\n        48 52 109\n        78 74 78\n        133 76 48\n        52 101 36\n        208 70 72\n        117 113 97\n        89 125 206\n        210 125 44\n        133 149 161\n        109 170 44\n        210 170 153\n        109 194 202\n        218 212 94\n        222 238 214\n      \"\"\"\n\nhttp://www.pixeljoint.com/forum/forum_posts.asp?TID=16247\n\n      dawnBringer32: fromStrings \"\"\"\n        0 0 0\n        34 32 52\n        69 40 60\n        102 57 49\n        143 86 59\n        223 113 38\n        217 160 102\n        238 195 154\n        251 242 54\n        153 229 80\n        106 190 48\n        55 148 110\n        75 105 47\n        82 75 36\n        50 60 57\n        63 63 116\n        48 96 130\n        91 110 225\n        99 155 255\n        95 205 228\n        203 219 252\n        255 255 255\n        155 173 183\n        132 126 135\n        105 106 106\n        89 86 82\n        118 66 138\n        172 50 50\n        217 87 99\n        215 123 186\n        143 151 74\n        138 111 48\n      \"\"\"\n\n      load: loadJASC\n      export: exportJASC\n      fromStrings: fromStrings\n\n    module.exports = Palette\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.2.0\"\ndependencies:\n  ajax: \"distri/ajax:master\"\n  analytics: \"distri/google-analytics:v0.1.0\"\n  bindable: \"distri/bindable:master\"\n  byte_array: \"distri/byte_array:v0.1.1\"\n  core: \"distri/core:master\"\n  eval: \"distri/eval:v0.1.0\"\n  extensions: \"distri/extensions:master\"\n  \"grid-gen\": \"distri/grid-gen:v0.2.0\"\n  matrix: \"distri/matrix:master\"\n  observable: \"distri/observable:master\"\n  point: \"distri/point:master\"\n  postmaster: \"distri/postmaster:v0.2.3\"\n  runtime: \"distri/runtime:v0.3.0\"\n  size: \"distri/size:master\"\n  \"touch-canvas\": \"distri/touch-canvas:v0.4.1\"\n  \"undo\": \"distri/undo:v0.2.0\"\n  util: \"distri/util:v0.1.0\"\nwidth: 1280\nheight: 720\n",
      "mode": "100644",
      "type": "blob"
    },
    "plugins/save_to_s3.coffee.md": {
      "path": "plugins/save_to_s3.coffee.md",
      "content": "Save to S3\n==========\n\nSave images to S3 directly.\n\n    module.exports = (I, self) ->\n      # Init from I.s3_policy\n\n      self.addAction\n        perform: ->\n          alert \"wat\"\n          # Get image data\n\n          # Get replay data\n\n          # Upload to S3\n\n          # Post Save hook\n        name: \"Save\"\n        iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKFSURBVDjLhVNNaxNRFD3vzUwSJ622YEwgYoVaNBUVilZwqStBtJBNxC4EEel/sDsXLhRcVxSUQo07QVy0jbpQqiANsS5ciNpowBhM2kk7nWS+vPdJqi0tXjhz39x595zz7syIMAxRKBSilM8TLgZBcIjyAIGWwQfKnyjfIxRGRkZ8bAoxOzs7SJumEonE0VQqhXg8DtM0wcTLy8toNpsol8uo1WqvqJbLZrOVDQzT09MvFhcXWS7cLlzXDYvFYpjP5x8w8b+QdDmcTCbxv0in0yCRs5vrOhUVU7VaRSwWQzQahWEYqmbbNur1OiqVCvr7+5kA2xLouo5GowHHcdS953mwLAutVks949qWBJ2zaJqmHPBmxs0ndXRHe2G3PfR2RfBo/geEHEy8v1sKg1CgYa3hebFyct0BK9KwVBZCYM12cHr4IC4MdeHpm+8Yv5TZoPzwZY0cibeyQ+D7vmpm8Npuuag3PbV55l11vdGhktUCakttEgr+zoDVGdzMx5FSQAsB1w9we2yI1OioRKDR1dShZmOttv8QMDrqHcKYIeGQixv5ryAueEQUEJiEn/PCNAJIVuRXRV+ieoWd8Eix5XvQpEFWdZAfyho1SiIQcEmsTQNmB5fn5uYeZzKZeF9fnyLhITbtKgxqHDvXTWRtopRKNaRzx/QIbk2V8ctahZ7L5Z5NTk4eWVhYuF4qlbJSyl38L/hBijQNBFjD/flr2G3uIxcSNfsbrp64Q6sYDZpmwHZHR0e/ULrCmJiY6F5ZWTmg6+n5/Skg2dXEmWPD6ImklYklJ409cQ9mhD4icirUQLaI42Mzrwf27jjVE+0hyzvpGC4EDViEPgJh42P5M35aLn4DnlayCCcx84IAAAAASUVORK5CYII=\"\n        # TODO: hotkey: hotkey\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "script/build": {
      "path": "script/build",
      "content": "#!/bin/bash\n\nmkdir -p dist\nrm -r dist/*\n\ncd gh-pages\ncp index.html master.json.js ../dist\ncd ..\n\n# TODO: Read config from pixie.cson\n\nTITLE=\"Pixi Paint\"\nWIDTH=1280\nHEIGHT=720\nVERSION=\"0.9.0\"\n\ntee dist/package.json <<EOS\n{\n  \"name\": \"$TITLE\",\n  \"version\": \"$VERSION\",\n  \"main\": \"index.html\",\n  \"window\": {\n    \"title\": \"$TITLE\",\n    \"width\": $WIDTH,\n    \"height\": $HEIGHT,\n    \"toolbar\": false\n  }\n}\nEOS\n\nmkdir -p build\nrm -r build/*\n\n# Can also build ,linux32,linux64\nnwbuild -p \"osx,win\" dist\n\n# TODO: May be able to only update nw.pack in zip file rather than\n# rebuild everything\n\n# Rename nw.exe to \"$TITLE\".exe\nmv build/\"$TITLE\"/win/nw.exe build/\"$TITLE\"/win/\"$TITLE\".exe\n# Rename node-webkit.app to \"#$TITLE\".app\nmv build/\"$TITLE\"/osx/node-webkit.app build/\"$TITLE\"/osx/\"$TITLE\".app\n\n# Zip all builds\ncd \"build/$TITLE\"\n\nfor folder in *\ndo\n  echo \"$folder\"\n  mkdir -p \"$TITLE\"\n  rm -r \"$TITLE\"/*\n  cp -r \"$folder\"/* \"$TITLE\"\n  zip -9 -r \"../$folder.zip\" \"$TITLE\"\ndone\n\n# To get nw working on newer linux distros need to modify binary\n# cd ~/.nvm/v0.10.28/lib/node_modules/node-webkit-builder/cache/0.9.2/linux32\n# sed -i 's/\\x75\\x64\\x65\\x76\\x2E\\x73\\x6F\\x2E\\x30/\\x75\\x64\\x65\\x76\\x2E\\x73\\x6F\\x2E\\x31/g' nw\n",
      "mode": "100755",
      "type": "blob"
    },
    "stripe-payment.coffee": {
      "path": "stripe-payment.coffee",
      "content": "q = []\n\npush = (selector) ->\n  q.push selector\n\n$.getScript('https://checkout.stripe.com/checkout.js')\n.done ->\n  console.log \"loaded\"\n  q.forEach process\n  push = process\n\ndescription = 'Pixi Paint ($1.99)'\namount = 199\n\nprocess = (selector) ->\n  handler = StripeCheckout.configure\n    key: 'pk_PPCRZgLrovwFHSKmMkjtVONHDs3pR'\n    image: 'https://fbcdn-photos-h-a.akamaihd.net/hphotos-ak-xap1/t39.2081-0/851574_391517107646989_794757491_n.png'\n    token: (token, args) ->\n      $.post \"http://pixi-paint-payments.herokuapp.com/charge\",\n        amount: amount\n        description: description\n        stripeEmail: token.email\n        stripeToken: token.id\n\n  document.querySelector(selector).addEventListener 'click', (e) ->\n\n    handler.open\n      name: 'Pixi Paint'\n      description: description\n      amount: amount\n\n    e.preventDefault()\n\nmodule.exports = (selector) ->\n  push selector\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html, body\n  margin: 0\n  height: 100%\n  font-family: helvetica\n\nbody\n  color: #222\n\nh2\n  font-size: 12px\n\n.editor\n  background-color: #AAA\n  box-sizing: border-box\n  height: 100%\n  padding: 0px 72px 64px 35px\n  position: relative\n  user-select: none\n  -moz-user-select: none\n  -ms-user-select: none\n  -webkit-user-select: none\n  overflow: hidden\n\n  .main\n    font-size: 0\n    height: 100%\n    position: relative\n    overflow: auto\n\n    .thumbnail\n      background-color: white\n      border: 1px solid rgba(0, 0, 0, 0.5)\n      position: fixed\n      top: 4px\n      left: 40px\n      z-index: 2\n\n      & > canvas\n        max-width: 256px\n        max-height: 256px\n        width: auto\n        height: auto\n\n      &.right\n        right: 77px\n        left: auto\n\n  .position\n    position: absolute\n    bottom:0\n    right: 0.25em\n    z-index: 2\n\n  & > .opacity\n    display: inline-block\n    position: absolute\n    right: -2.5em\n    bottom: 5em\n    z-index: 2\n\n    & > h2\n      position: absolute\n      right: 40px\n      bottom: 3.5em\n\n    input.alphaValue\n      position: absolute\n      right: 56px\n      width: 25px\n      bottom: 2em\n      text-align: right\n\n    input.alphaSlider\n      position: absolute\n      right: 8px\n      bottom: 4px\n      transform: rotate(-90deg)\n      width: 64px\n      height: 20px\n\n.notifications\n  background-color: rgba(0, 0, 0, 0.5)\n  border: 1px solid black\n  border-bottom-left-radius: 2px\n  border-bottom-right-radius: 2px\n  color: white\n  left: 40px\n  padding: 4px\n  position: absolute\n  top: 0\n  z-index: 9000\n\n  &:empty\n    padding: 0\n    border: none\n\n  p\n    margin: 0\n    margin-bottom: 0.25em\n\n    &:last-child\n      margin-bottom: 0\n\n.toolbar\n  box-sizing: border-box\n  height: 100%\n  width: 40px\n  position: absolute\n  top: 0\n  left: 0\n\n  h2\n    font-size: 12px\n\n  .tool\n    background-color: #CCC\n    background-position: center\n    background-repeat: no-repeat\n    width: 36px\n    height: 36px\n    box-sizing: border-box\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    border-top: 1px solid rgba(255, 255, 255, 0.5)\n    border-left: 1px solid rgba(255, 255, 255, 0.5)\n    cursor: pointer\n\n    &:last-child\n      border-bottom-right-radius: 2px\n\n    &.active\n      background-color: #EEE\n\n  .tools:not(:first-child)\n    .tool\n      &:first-child\n        border-top-right-radius: 2px\n\n.palette\n  background-color: #CCC\n  box-sizing: border-box\n  border-left: 1px solid rgba(255, 255, 255, 0.5)\n  height: 100%\n  width: 50px\n  position: absolute\n  top: 0\n  right: -1px\n  font-size: 0\n\n  & > .color\n    box-sizing: border-box\n    border: 1px solid rgba(255, 255, 255, 0.5)\n    border-top: 1px solid rgba(0, 0, 0, 0.5)\n    border-left: 1px solid rgba(0, 0, 0, 0.5)\n    border-radius: 2px\n    display: inline-block\n    width: 24px\n    height: 24px\n    overflow: hidden\n    padding: 0\n\n    &.primary.color\n      width: 48px\n      height: 48px\n\n    & > input\n      width: 64px\n      height: 64px\n      margin: -8px 0 0 -8px\n      padding: 0\n\n    &.active\n      border: 1px solid rgba(255, 255, 255, 0.875)\n\n    &:nth-child(1)\n      border-top-right-radius: 0\n      border-top-left-radius: 0\n      border-top: 0\n\n    &:nth-child(even)\n      border-top-right-radius: 0\n      border-bottom-right-radius: 0\n\n.vertical-center\n  position: absolute\n  top: 0\n  bottom: 0\n  left: 0\n  right: 0\n  margin: auto\n\n.viewport\n  background-color: white\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkIADOnDnzH58SxlEDGIZDGBCKZxMTE7zeZBw1gGEYhAEAJQ47KemVQJ8AAAAASUVORK5CYII=\")\n  border: 1px solid gray\n  margin: auto\n  position: relative\n\n  &.vertical-center\n    position: absolute\n\n  & > canvas\n    image-rendering: optimizeSpeed\n    image-rendering: -moz-crisp-edges\n    image-rendering: -webkit-optimize-contrast\n    image-rendering: optimize-contrast\n    image-rendering: pixelated\n    -ms-interpolation-mode: nearest-neighbor\n\n    background-color: transparent\n    position: absolute\n    width: 100%\n    height: 100%\n\n  .overlay\n    pointer-events: none\n    position: absolute\n    z-index: 1\n    width: 100%\n    height: 100%\n\n.debug\n  background-color: white\n  box-sizing: border-box\n  position: absolute\n  width: 100%\n  height: 100px\n  bottom: 0\n  margin: 0\n  padding: 1em\n\n.actions\n  box-sizing: border-box\n  width: 100%\n  height: 64px\n  position: absolute\n  bottom: 0\n  left: 0\n\n  .action\n    cursor: pointer\n    width: 64px\n    height: 64px\n\n    background-color: #CCC\n    background-position: 50% 25%\n    background-repeat: no-repeat\n    box-sizing: border-box\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    border-left: none\n    border: 1px solid rgba(0, 0, 0, 0.5)\n    border-left: 1px solid rgba(255, 255, 255, 0.5)\n    border-top: 1px solid rgba(255, 255, 255, 0.5)\n    display: inline-block\n    font-size: 12px\n    position: relative\n    vertical-align: top\n\n    &:last-child\n      border-top-right-radius: 2px\n\n    .text\n      text-align: center\n      overflow: hidden\n      position: absolute\n      width: 100%\n\n      top: 50%\n\n#modal\n  background-color: rgba(0, 0, 0, 0.25)\n  display: none\n  position: absolute\n  z-index: 9000\n  top: 0\n\n  input[type=file]\n    box-sizing: border-box\n    padding: 5em 2em\n    width: 320px\n    height: 180px\n\n  & > *\n    background-color: white\n    border: 1px solid black\n    margin: auto\n    position: absolute\n    top: 0\n    bottom: 0\n    left: 0\n    right: 0\n\n  &.active\n    display: block\n    width: 100%\n    height: 100%\n",
      "mode": "100644",
      "type": "blob"
    },
    "symmetry.coffee": {
      "path": "symmetry.coffee",
      "content": "mirror = (size, flip) ->\n  midpoint = Point size.width/2, size.height/2\n\n  Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y))\n\nmodule.exports = Symmetry =\n  normal: (size, transforms) ->\n    transforms\n\n  flip: (size, transforms) ->\n    transforms.concat transforms.map (transform) ->\n      transform.concat(mirror(size, Matrix.HORIZONTAL_FLIP))\n\n  flop: (size, transforms) ->\n    transforms.concat transforms.map (transform) ->\n      transform.concat(mirror(size, Matrix.VERTICAL_FLIP))\n\n  quad: (size, transforms) ->\n    Symmetry.flop(size, Symmetry.flip(size, transforms))\n\n  icon:\n    normal: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWKB2CjDpo7keEc3ZNQApGgkNyYoDkQAREwcEdrwnzgAAAAASUVORK5CYIIA\"\n    flip: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPUlEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3VigZKkQFS847Ng1AAGhoEPAwCRtTgRC7T+1AAAAABJRU5ErkJgggAA\"\n    flop: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWIBFhOkxgBI32gsUCsMKI4FYnMeNnUAmxI4EQ3tXkkAAAAASUVORK5CYIIA\"\n    quad: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3ViARYThGIAW5SPxgI0FihOyhTHAiU5GgBvBXARCEfBgAAAAABJRU5ErkJgggAA\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "templates/editor.haml.md": {
      "path": "templates/editor.haml.md",
      "content": "Editor template\n\n    - activeIndex = @activeIndex\n    - activeTool = @activeTool\n    - previousTool = @previousTool\n    - editor = this\n    - Symmetry = require \"../symmetry\"\n    - Palette = require \"./palette\"\n\n    .editor\n\nThe toolbar holds our tools.\n\n      .toolbar\n        .tools\n          - @tools.each (tool) ->\n            - activeClass = -> \"active\" if tool is activeTool()\n            - activate = -> activeTool(tool)\n            .tool(style=\"background-image: url(#{tool.iconUrl})\" title=tool.hotkeys class=activeClass click=activate)\n        %h2 Symmetry\n        .tools\n          - symmetryMode = @symmetryMode\n          - [\"normal\", \"flip\", \"flop\", \"quad\"].forEach (mode) ->\n            - activeClass = -> \"active\" if mode is symmetryMode()\n            - activate = -> symmetryMode(mode)\n            .tool(style=\"background-image: url(#{Symmetry.icon[mode]})\" class=activeClass click=activate)\n\nOur layers and preview canvases are placed in the viewport.\n\n      .main\n        .viewport(style=@viewportStyle class=@viewportCenter)\n          .overlay(style=@gridStyle)\n          = @canvas.element()\n          = @previewCanvas.element()\n        .thumbnail(click=@thumbnailClick)\n          = @thumbnailCanvas.element()\n\n      .position\n        = @positionDisplay\n\n      .notifications\n        - @notifications.forEach (notification) ->\n          %p\n            = notification\n\nThe palette holds our colors.\n\n      = Palette(this)\n\n      .opacity\n        %h2 Opacity\n        %input.alphaValue(value=@alpha)\n        %input.alphaSlider(type=\"range\" value=@alpha step=\"1\" min=\"0\" max=\"100\")\n\n      .actions\n        - @actions.each (action) ->\n          .action(click=action.perform touchstart=action.perform title=action.hotkey style=\"background-image: url(#{action.iconUrl})\")\n            .text= action.name\n",
      "mode": "100644",
      "type": "blob"
    },
    "templates/palette.haml": {
      "path": "templates/palette.haml",
      "content": ".palette\n  - editor = this\n  - activeIndex = @activeIndex\n\n  .primary.color\n    - style = ->\n      - c = editor.activeColor()\n      - \"background-color: #{c}\"\n    %input(type=\"color\" value=editor.activeColor style=style)\n\n  - @palette.forEach (color, index) ->\n    - showPicker = false\n    - click = (e) ->\n      - unless showPicker\n        - e.preventDefault()\n\n    - longHold = null\n    - start = (e) ->\n      - clearTimeout longHold\n      - longHold = setTimeout ->\n        - showPicker = true\n        - e.target.click()\n        - showPicker = false\n      - , 500\n      - editor.activeColor color()\n      - return\n\n    - stop = ->\n      - clearTimeout longHold\n\n    - input = (e) ->\n      - editor.activeColor e.target.value\n\n    .color(mousedown=start touchstart=start mouseup=stop touchend=stop mouseout=stop)\n      - style = -> \n        - c = color()\n        - \"background-color: #{c}; color: #{c};\"\n      %input(type=\"color\" value=color click=click input=input style=style)\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/editor.coffee": {
      "path": "test/editor.coffee",
      "content": "Editor = require \"../editor\"\n#\n#describe \"editor\", ->\n  #it \"should have eval\", ->\n    #editor = Editor\n      #selector: \"#not_present\"\n#\n    #assert.equal editor.eval(\"5\"), 5\n\n\ndescribe \"plugins\", ->\n  it \"should be able to load via JSON package\", ->\n    result = require\n      distribution:\n        main:\n          content: \"module.exports = 'the test'\"\n\n    assert.equal result, \"the test\"\n\ndescribe \"Editor\", ->\n  editor = Editor()\n\n  it \"should exist\", ->\n    assert editor\n\n  it \"should be able to drawn upon\", ->\n    p1 = x: 0, y: 0, identifier: 0\n    p2 = x: 5, y: 5, identifier: 0\n\n    editor.previewCanvas.trigger \"touch\", p1\n\n    editor.previewCanvas.trigger \"move\", p2\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/palette.coffee": {
      "path": "test/palette.coffee",
      "content": "Palette = require \"../palette\"\n\ndescribe \"palette\", ->\n  it \"should parse strings into colors\", ->\n    colors = Palette.fromStrings \"\"\"\n      0 0 0\n      255 0 251\n      255 255 255\n    \"\"\"\n\n    assert.equal colors[0], \"#000000\"\n    assert.equal colors[1], \"#FF00FB\"\n    assert.equal colors[2], \"#FFFFFF\"\n\n    assert.equal colors.length, 3\n\n  it \"should load JASC files\", ->\n    colors = Palette.load \"\"\"\n      JASC-PAL\n      0100\n      256\n      0 0 0\n      255 0 251\n      255 255 255\n    \"\"\"\n\n    assert.equal colors[0], \"#000000\"\n    assert.equal colors[1], \"#FF00FB\"\n    assert.equal colors[2], \"#FFFFFF\"\n\n    assert.equal colors.length, 3\n",
      "mode": "100644",
      "type": "blob"
    },
    "tools.coffee.md": {
      "path": "tools.coffee.md",
      "content": "Tools\n=====\n\n    Brushes = require \"./brushes\"\n    {circle, line, rect, rectOutline, endDeltoid} = require \"./util\"\n\n    line2 = (start, end, fn) ->\n      fn start\n      line start, end, fn\n\n    neighbors = (point) ->\n      [\n        {x: point.x, y: point.y-1}\n        {x: point.x-1, y: point.y}\n        {x: point.x+1, y: point.y}\n        {x: point.x, y: point.y+1}\n      ]\n\n    shapeTool = (hotkey, offsetX, offsetY, icon, fn) ->\n      start = null\n      end = null\n\n      hotkeys: hotkey\n      iconUrl: icon\n      iconOffset:\n        x: offsetX\n        y: offsetY\n      touch: ({position}) ->\n        start = position\n\n      move: ({editor, position}) ->\n        end = position\n\n        editor.restore()\n        fn(editor, editor.canvas, start, end)\n\n      release: ({position, editor}) ->\n        editor.restore()\n        fn(editor, editor.canvas, start, end)\n\n    brushTool = (brushName, hotkey, offsetX, offsetY, icon, options) ->\n      previousPosition = null\n      brush = Brushes[brushName]\n\n      OP = (out) ->\n        (p) ->\n          out(p, options)\n\n      paint = (out) ->\n        (x, y) ->\n          brush({x, y}).forEach OP out\n\n      hotkeys: hotkey\n      iconUrl: icon\n      iconOffset:\n        x: offsetX\n        y: offsetY\n      touch: ({position, editor})->\n        paint(editor.draw) position.x, position.y\n        previousPosition = position\n      move: ({editor, position})->\n        line previousPosition, position, paint(editor.draw)\n        previousPosition = position\n      release: ->\n        previousPosition = null\n\nDefault tools.\n\n    TOOLS =\n\nDraw a line when moving while touching.\n\n      pencil: brushTool \"pencil\", \"p\", 4, 14,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVQ4T5VTuw2DMBB9LmkZg54ZGCDpHYkJYBBYATcUSKnSwAy0iDFoKR0fDgiMDc5JLvy59969OzPchzSesP3+sLFgySoMweMYou/xmWe81VKx5d0CyCQBoghoGgiV/JombwDNzjkwjsAw/A8gswwgBWm6VPdU7L4laPa6BsrSyX6oxTBQ7munO1v9LgCv2ldCWxcWgDV4EDjZbQq0dDKv65ytuxokKdtWO08AagkhTr2/BiD2otBv8hyMurCbPHNaTQ8OBjJScZFs9eChTKMwB8byT5ajkwIC8E22AvyY7j7ZJugLVIZ5EV8R1SQAAAAASUVORK5CYII=\"\n\n      brush: brushTool \"brush\", \"b\", 4, 14,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAKBJREFUeJytkrsRgzAQRFeME6UXXwVUogKoRB2JmAagEEqBcB0ge/Dw0cm2ZpTd7tuTFqg/zBcA0NSKkwg6719G1WJSlUnkI4XZgCGQql+tQKoCbYt+WWrB2SDGA92aYKMD/6dbEjCJAPP8A73wbe5OnAuDYV1LsyfkEMgYi4W5ciW56Zxzt/THBR2YJmAcbXn34s77d+dh6Ps+2tlw8eGedfBU8rnbDOMAAAAASUVORK5CYII=\"\n\n      eraser: brushTool \"pencil\", \"e\", 4, 11,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==\",\n        color: \"transparent\"\n\n      dropper:\n        hotkeys: \"i\"\n        iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAH1JREFUeJztjrsNhDAUBIfLTOiYsiClCHdEDUT0Q0rscElY3QkJOD4hI1nye/aOFm5S/Ny1sd/l43AdAqoq6hDWsr8aqIsRgLYsKcbRbzpq4wb0OQPQTJNXh+E18ulilFLyfBopJZmzEn+WhuGy5NvklWxKrgpYgrclFj3DDPqoerGlCYunAAAAAElFTkSuQmCC\"\n        iconOffset:\n          x: 13\n          y: 13\n        touch: ({position, editor}) ->\n          editor.activeColor(editor.getColor(position))\n        move: ({position, editor}) ->\n          editor.activeColor(editor.getColor(position))\n        release: ->\n          # Return to the previous tool\n          editor.activeTool editor.previousTool()\n\n      move: require(\"./tools/selection\")()\n\nFill a connected area.\n\n      fill:\n        hotkeys: \"f\"\n        iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4T52TPRKCMBCFX0pbj+HY0tJKY+UB8AqchCuYXofCRs9gy3ADW1rKmLeQTIBEZ0wTwu779idZhfQygUml3FIGikPb8ux5MUDM+S9AWAIjRrNNZYDLdov7MEiqx80G576PQqIAJ75NgJMFXPMc6vlcQZYAI842unq/YQ4HoKrGho1iqLqeQWadZuSyLKG1FmeWwMjY7QDCJlAIcQAj4iyDfr1kp4gggVgb9nsPUkXhs1gBJBpX1wFtC20BrpmSjS0pDbD1h8uJeQu+pKaJAmgfy5icQzH/sani9HgkAWLnLTAi0+YeiFmu+QXwEH5EHpAx7EFwld+GybVjOVTJdzBrYOKwGqoP9IV4EbRDWfEAAAAASUVORK5CYII=\"\n        iconOffset:\n          x: 12\n          y: 13\n        touch: ({position, editor}) ->\n          color = editor.colorAsInt()\n\n          imageData = editor.getSnapshot()\n          {width, height} = imageData\n\n          data = new Uint32Array(imageData.data.buffer)\n\n          set = ({x, y}, color) ->\n            if 0 <= x < width\n              if 0 <= y < height\n                data[y * width + x] = color\n\n          get = ({x, y}) ->\n            if 0 <= x < width\n              if 0 <= y < height\n                data[y * width + x]\n\n          target = get(position)\n\n          return unless target?\n          return if color is target\n\n          queue = [position]\n\n          set(position, color)\n\n          # Allow for interrupts if it takes too long\n          safetyHatch = width * height\n\n          while(queue.length and safetyHatch > 0)\n            position = queue.pop()\n\n            neighbors(position).forEach (position) ->\n              pixelColor = get(position)\n              if pixelColor is target\n                # This is here because I HAVE been burned\n                # Later I should fix the underlying cause, but it seems handy to keep\n                # a hatch on any while loops.\n                safetyHatch -= 1\n\n                set position, color\n                queue.push(position)\n\n          editor.putImageData(imageData)\n\n          return\n\n        move: ->\n        release: ->\n\nShapes\n------\n\n      rect: shapeTool \"r\", 1, 4,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVQ4T2NkoBAwUqifYfAY8J9MrzDCvDBqAAPDMAgDMpMBwyBKymR7AQAp1wgR44q8HgAAAABJRU5ErkJggg==\"\n        (editor, canvas, start, end) ->\n          color = editor.activeColor()\n          delta = end.subtract(start)\n\n          editor.withCanvasMods (canvas) ->\n            canvas.drawRect\n              x: start.x\n              y: start.y\n              width: delta.x\n              height: delta.y\n              color: color\n\n      rectOutline: shapeTool \"shift+r\", 1, 4,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4T2NkoBAwUqifgWoG/CfTJYwwF4AMINU1YD2jBgy7MCAnLcHTATmawXpITX0YFlFsAADRBBIRAZEL0wAAAABJRU5ErkJggg==\"\n        (editor, canvas, start, end) ->\n          delta = end.subtract(start)\n          color = editor.activeColor()\n\n          editor.withCanvasMods (canvas) ->\n            canvas.drawRect\n              x: start.x - 0.5\n              y: start.y - 0.5\n              width: delta.x\n              height: delta.y\n              stroke:\n                color: color\n                width: 1\n\n      circle: shapeTool \"c\", 0, 0, # TODO: Real offset\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVQ4T2NkwA7+YxFmxKYUXRCmEZtirHLICkEKsNqCZjOKOpgGYjXDzIKrp4oBpNqO4gqQC0YNgAQJqeFA3WjESBw48gdWdVTNC8gWk50bCbgeUxoAvXwcEQnwKSYAAAAASUVORK5CYII=\"\n        (editor, canvas, start, end) ->\n          circle start, end, (x, y) ->\n            editor.draw({x, y})\n\n      line2: shapeTool \"l\", 0, 0,\n        \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAV0lEQVQ4T6XSyQ0AIAgEQOm/aIWHxoNzJTG+GASk9hnE+Z2P3FDMRBjZK0PI/fQyovVeQqzhpRFv+ikkWl+IRID8DRfJAC6SBUykAqhIFXgQBDgQFFjIAMAADxGQlO+iAAAAAElFTkSuQmCC\"\n        (editor, canvas, start, end) ->\n          color = editor.activeColor()\n\n          # Have to draw our own lines if we want them crisp ;_;\n          line start, end, (x, y) ->\n            editor.draw {x, y}\n\n    module.exports = (I={}, self=Core(I)) ->\n      self.extend\n        addTool: (tool) ->\n          [].concat(tool.hotkeys or []).forEach (hotkey) ->\n            self.addHotkey hotkey, ->\n              self.activeTool tool\n\n          self.tools.push tool\n\n        activeTool: Observable()\n        previousTool: Observable()\n\n        tools: Observable []\n\n      # TODO: Probably want to let the editor add its own tools so this is more\n      # reusable\n      Object.keys(TOOLS).forEach (name) ->\n        self.addTool TOOLS[name]\n\n      setNthTool = (n) ->\n        ->\n          if tool = self.tools.get(n)\n            self.activeTool tool\n\n      [1..9].forEach (n) ->\n        self.addHotkey n.toString(), setNthTool(n-1)\n\n      self.addHotkey \"0\", setNthTool(9)\n\n      prevTool = null\n      self.activeTool.observe (newTool) ->\n        self.previousTool prevTool\n        prevTool = newTool\n\n      self.activeTool(self.tools()[0])\n\n      return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "tools/selection.coffee.md": {
      "path": "tools/selection.coffee.md",
      "content": "Selection Tool\n==============\n\n    Rectangle = require \"../lib/rectangle\"\n\n    {endDeltoid} = require \"../util\"\n\n    drawOutline = (canvas, scale, rectangle) ->\n      canvas.drawRect\n        x: (rectangle.position.x - 0.5) * scale\n        y: (rectangle.position.y - 0.5) * scale\n        width: rectangle.size.width * scale\n        height: rectangle.size.height * scale\n        color: \"transparent\"\n        stroke:\n          width: 1\n          color: \"green\"\n\n    paint = (editor, selection, delta) ->\n      editor.restore()\n      editor.canvas.drawImage editor.canvas.element(),\n        selection.position.x,\n        selection.position.y,\n        selection.size.width,\n        selection.size.height,\n        selection.position.x + delta.x,\n        selection.position.y + delta.y,\n        selection.size.width,\n        selection.size.height\n\nSelect a region, then move it.\n\n    module.exports = ->\n      selecting = true\n      moving = false\n      selection = delta = selectionStart = startPosition = selectionEnd = undefined\n\n      touch: ({position, editor}) ->\n        if selecting\n          selectionStart = position\n          selectionEnd = position.add(Point(1, 1))\n        else\n          # if clicked in selection\n          moving = true\n          startPosition = position\n          delta = Point(0, 0)\n          # else\n          #   clear selection\n\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABlUlEQVQ4T6WTz0sCQRTHnyvpNYsuGSQbpQgiiAiC/0L/RIcuHbwkQocOQRAFXTpEB4M8dOgQ1L8hiAjiam5gpn+B6MWZ13uzzrblEoSPnZmdH+/znTdvJgBLWmBJf1CAq9cRapBABBQAgkakkCAkgqCOpLHZTMDlgflD1AVsRkKA5EzrAamSkiBUcSvnEHs0hevDnUXAxcsQo6sh5cyLvwtBaBcKQKX3OYGbo71FwPnzELciK76q2llSGG8EuC3GFwFnTwOMrtEO9NY9quxIXZqT0BlMobxvqH8uyWQyoGinj33cWg+7sXpV3X+CdPpjqJQS6qza7TakUikHcFJlAIfgxOpV1YfIc1Z/AvelXTAMA1qtFqTTaQdwXHnH7Y2w6+xV5VQqCKlaH2N4KCcUoNlsQiaTcQDFux7KmQT61KkLyjnHqPOv7gb1+bJUy3EIBoPQaDQgm806gN9m2zbGYjECEGluHLc2BtTrdcjlcv6AbreLpmn+ectrtRrk83l/gGVZyOo6XX4tzxcKBX/Afx7Y0q/xCyxxSSDAf7z0AAAAAElFTkSuQmCC\"\n      iconOffset:\n        x: 1\n        y: 2\n\n      move: ({position, editor}) ->\n        scale = 1\n        canvas = editor.previewCanvas\n        canvas.clear()\n\n        if selecting\n          selectionEnd = endDeltoid(selectionStart, position)\n\n          selection = Rectangle.fromPoints(selectionStart, selectionEnd)\n\n          drawOutline(canvas, scale, selection)\n\n        else\n          # Update selection position\n          delta = position.subtract(startPosition)\n\n          paint(editor, selection, delta)\n\n          # Draw selection area\n          outlineRect = Rectangle(selection)\n          outlineRect.position.x += delta.x\n          outlineRect.position.y += delta.y\n          drawOutline(editor.previewCanvas, scale, outlineRect)\n\n      release: ({editor}) ->\n        if selecting\n          selecting = !selecting\n          # HACK: Painting the ui on the preview canvas after it get's auto\n          # cleared from the release event\n          setTimeout ->\n            canvas = editor.previewCanvas\n            scale = 1\n            drawOutline(canvas, scale, selection)\n        else if moving\n          paint(editor, selection, delta)\n\n          moving = false\n          selecting = true\n",
      "mode": "100644",
      "type": "blob"
    },
    "util.coffee.md": {
      "path": "util.coffee.md",
      "content": "Util\n====\n\n    require \"extensions\"\n\n    global.Bindable = require \"bindable\"\n    global.Matrix = require \"matrix\"\n    global.Model = require \"core\"\n    global.Point = require \"point\"\n    global.Observable = require \"observable\"\n    global.Size = require \"size\"\n\n    Matrix.Point = Point\n\nHelpers\n-------\n\n    componentToHex = (c) ->\n      hex = c.toString(16)\n\n      if hex.length is 1\n        \"0\" + hex\n      else\n        hex\n\n    isObject = (object) ->\n      Object::toString.call(object) is \"[object Object]\"\n\nPoint Extensions\n----------------\n\n    Point.prototype.scale = (scalar) ->\n      if isObject(scalar)\n        Point(@x * scalar.width, @y * scalar.height)\n      else\n        Point(@x * scalar, @y * scalar)\n\n    Point.prototype.floor = ->\n      Point @x.floor(), @y.floor()\n\nExtra utilities that may be broken out into separate libraries.\n\n    module.exports =\n      endDeltoid: (start, end) ->\n        if end.x < start.x\n          x = 0\n        else\n          x = 1\n\n        if end.y < start.y\n          y = 0\n        else\n          y = 1\n\n        end.add(Point(x, y))\n\nCall an iterator for each integer point on a line between two integer points.\n\n      line: (p0, p1, iterator) ->\n        {x:x0, y:y0} = p0\n        {x:x1, y:y1} = p1\n\n        dx = (x1 - x0).abs()\n        dy = (y1 - y0).abs()\n        sx = (x1 - x0).sign()\n        sy = (y1 - y0).sign()\n        err = dx - dy\n\n        while !(x0 is x1 and y0 is y1)\n          e2 = 2 * err\n\n          if e2 > -dy\n            err -= dy\n            x0 += sx\n\n          if e2 < dx\n            err += dx\n            y0 += sy\n\n          iterator x0, y0\n\n      rect: (start, end, iterator) ->\n        [start.y..end.y].forEach (y) ->\n          [start.x..end.x].forEach (x) ->\n            iterator\n              x: x\n              y: y\n\n      rectOutline: (start, end, iterator) ->\n        [start.y..end.y].forEach (y) ->\n          if y is start.y or y is end.y\n            [start.x..end.x].forEach (x) ->\n              iterator\n                x: x\n                y: y\n          else\n            iterator\n              x: start.x\n              y: y\n\n            iterator\n              x: end.x\n              y: y\n\ngross code courtesy of http://en.wikipedia.org/wiki/Midpoint_circle_algorithm\n\n      circle: (start, endPoint, iterator) ->\n        center = Point.interpolate(start, endPoint, 0.5).floor()\n        {x:x0, y:y0} = center\n        {x:x1, y:y1} = endPoint\n\n        radius = (endPoint.subtract(start).magnitude() / 2) | 0\n\n        f = 1 - radius\n        ddFx = 1\n        ddFy = -2 * radius\n\n        x = 0\n        y = radius\n\n        iterator x0, y0 + radius\n        iterator x0, y0 - radius\n        iterator x0 + radius, y0\n        iterator x0 - radius, y0\n\n        while x < y\n          if f > 0\n            y--\n            ddFy += 2\n            f += ddFy\n\n          x++\n          ddFx += 2\n          f += ddFx\n\n          iterator x0 + x, y0 + y\n          iterator x0 - x, y0 + y\n          iterator x0 + x, y0 - y\n          iterator x0 - x, y0 - y\n          iterator x0 + y, y0 + x\n          iterator x0 - y, y0 + x\n          iterator x0 + y, y0 - x\n          iterator x0 - y, y0 - x\n\n      rgb2Hex: (r, g, b) ->\n        return \"#\" + [r, g, b].map(componentToHex).join(\"\")\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "actions": {
      "path": "actions",
      "content": "(function() {\n  var Actions, ByteArray, FileReading, Modal, Palette, loader, saveAs, state;\n\n  require(\"./lib/mousetrap\");\n\n  ByteArray = require(\"byte_array\");\n\n  FileReading = require(\"./file_reading\");\n\n  Modal = require(\"./modal\");\n\n  Palette = require(\"./palette\");\n\n  loader = require(\"./loader\")();\n\n  saveAs = require(\"./lib/file_saver\");\n\n  module.exports = Actions = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      addAction: function(action) {\n        return self.actions.push(action);\n      },\n      actions: Observable([]),\n      addHotkey: function(key, method) {\n        return Mousetrap.bind(key, function(event) {\n          event.preventDefault();\n          if (typeof method === \"function\") {\n            method({\n              editor: self\n            });\n          } else {\n            self[method]();\n          }\n        });\n      }\n    });\n    Object.keys(Actions.defaults).forEach(function(hotkey) {\n      var icon, method, name, _ref;\n      _ref = Actions.defaults[hotkey], method = _ref.method, icon = _ref.icon, name = _ref.name;\n      self.addAction({\n        perform: function() {\n          if (typeof method === \"function\") {\n            return method({\n              editor: self\n            });\n          } else {\n            return self[method]();\n          }\n        },\n        name: name,\n        iconUrl: icon,\n        hotkey: hotkey\n      });\n      return self.addHotkey(hotkey, method);\n    });\n    return self;\n  };\n\n  state = null;\n\n  Actions.defaults = {\n    \"ctrl+z\": {\n      name: \"Undo\",\n      method: \"undo\",\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVQ4T6VTXUhTYRh+p47sbhcR2zmMDGXUTVBBiyBdJUjU6EJ2K4R0ESm6CyEo6qKZWcGkoC6KFt2GxKhwi4JKbcg2khmonVW6RbmGnnI1z873c3rPjp6aQQw88PJ834H3+b73eZ7PAhv8LBvsB5PAP3pK45wDZxyYXpQZSBjHWiSUJTmlUaVQGg6feZZdO9gk6HnZqXnEw6BpAFxjWBowRGwHhSgg/5RhQc6B9FkKq0ppMOJ/FdNJTIKuFye1Q84jwLGBAzbrqOENyiQciuQX1NVYIbOQgcR0IqwUV7pfn49nTYLT0Q7NuDYDShBxTfU9rgWbCA32BrDWWZGQQ2o2Be8/Sv7RCxNDVYnovdUaJCptb9njcTILhe/yDxiPxyKxS4mjVRHos7ZeOxh0bXP1ig4RiKrCk+eRfGJgcmsFgc8HteD1nn3Y8bh/vb3Nl93BHdt39oqCAKpK4Gl0JD95/d06ggfeECV076POkV1/EzQH3EHUpL3lgMdJawgsLxVgfOxNZOrGzJ8RfPeP3XTYxC5duLmvn8pCIpkhoh1FdKKIm6zoEoqYmgJpVvJP304bIvpCx6/abY6+JrHJtFB3Y81CHQulZaiv3QzzmSwk44mwulLs/hD6Yth44k5bQLAJ5xqdjeg9GBnAouUsYJAUBRblJcjlvkF6RgqjI4Ppe/OVQWoLeoaELY4eivGdy6yOsJoDHCWPoyUZoVFKlGH95H+irP/wBPbfpYztG7sYrxDxfw+uMgdoo9u1u2+i/+2Val/pb35FXyDc5lZBAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+y\": {\n      name: \"Redo\",\n      method: \"redo\",\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUUlEQVQ4T6WTUUhTURjHv+scNheypmOy7RY0H7IHC6Rgo/ItB0GXWIgSBUOJMIRFkEUlBEWBDzOsXnoQpIdqTUlrQ6k9NPBhUeCaFO0udxuB7bVc5D3n3L5zYNZSiNG9nHu+C+f/4/v+33ck+M9HqkXf9/DYRRKbHo1GgVZ0NQF6Jo9miE7SU/3xgU0Bg3Mh2TBIkBpGNyWkkxHmIIQC1Snw3WVzA8Nd/ZK/HR9KhjlkPYOzL075KDWGPVZZ2dZoB6vZCvV19UANBDAGjCEEY50SeJfLgFpQbyQvLVwRgMG5XpkZ5vH2lt2K09oKP0gZTJIZmMFQzAEUYwRwCK7FD4ugaupo6mr6ggCcjp8Iy03bI157mxCtrpVBXcnB8sqySF2UoBNwtbiBUgr5Qv5OaiQ9tF7CwLO+REfr3kCj2YIHGCSzySIejD0JPT/3Z5e6bvoyTCdvUiOvQ1UmhqZ7Sv6dBx11aIlW0iD7OTs21Z+oEnOB/9r+ywvZ9C34u40nHwdL/rYDDklCwFcNlgpLYzNn5jcANpsZ4UHvAyXRIe8JWCxbsFYs4e3LIl2jsfnzr/4JEYDjE0fCbrsn4nV5sW1oYnkVchqaWEQT0cDKHFA0VPyjke/v5YRWfJS7h2Xs9PiuHe2Ko9kJ339+gwZTg2gZbx/DORAxvnwmZqKz8PH+p98ADglEunw6YcMep0exNdlgq9UKkskEBp8FXByEEwoGgp4+moX8hFYN4JBD1/fJlBhBTLWbENZJCGlmOqvjqfP2VnaGcWGyuBFQy82snP0Ffg5KIO/aNV0AAAAASUVORK5CYII=\"\n    },\n    \"ctrl+o\": {\n      name: \"Open\",\n      description: \"Open an image file from your local filesystem.\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return Modal.show(FileReading.readerInput({\n          image: function(dataURL) {\n            return editor.fromDataURL(dataURL);\n          },\n          json: function(data) {\n            return editor.restoreState(data);\n          },\n          text: function() {},\n          chose: function() {\n            return Modal.hide();\n          }\n        }));\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACwklEQVQ4T31TXUgUURT+7mzr5taaL9ofgdm6YtZDuvqg0UOED2lGYUQkhathCoblT1KSBlJhuyksZj0EKflQtlaaT1pKtIIQUZmiPqhpmBn4s7o6zjpzO7OumqAd+OYcZs75zjnfncuwgWWU1p/mnFUxxnZwMICrid7HqnFeTV/Wt4wSh7vo4iF9cFAQGNvkLfUoDIo3nUNelHCjslWlXt/SSxz8QV4Csmw1MIaFrSRpBIbh3i7czctGobX5/wSVBcdhbXiHA3FHoBE0EDRaCIKA7x3tsCTEE8HbjQnSbr3klYWJqGp24uDhozT16v5dzjakJcQhv5wI+pqivugCIvczJvyrDkpakrW2gkRk3ndgT2Tc0ubykgIjPR2wX0vB1fJGsP5Gs2hM6tSR2qtKU3yh2IGKwiRkVzQRQfwaoUa6najIScKVO6+JwBE9ZTz5cZs09hCypAGEAFLdgPRqBfaiZKTk3kNwSOQagvGhbtRZryOrrIFWeB7jMp5qNYg/a8EVDmVhAh73b4wOjSMwIBAKV8cmeDVQoEgyJL12fmvUY/9Lt+tVgmgp9ESzdnagHlyahcf1B4aIsxiZ24m9uwJpGvWkqdhLQNAYMNyaJhli7ZrUm6+mWd+zGMl0vlNL1CudaA78GhvA9LiTfhg3FHkW3ENQ5uG33YKRtlLJ+vWMS1bkFNb31LwQlvrBT5n7RipPEWbAF6egeCYpngYoVj2XXQQ3/ENsGKjPEE2WT/6qMKz/kVncZ3mvk2faqVBNJKhF3phIFtXCZbihNz7BYN1l0ZS1TGA3zxszWzZ7Jt/4Cn0dV8hoIl93rojYEl6HwZps0ZTjI+i1RY2GWl7opYlOAxRR4FwksQnkubxAXiL9yKsacRm63ef4j9qrrvD8z4HeFXrKInKZIMQyzo6BccNGl8t3CakCEh13bURxT4767i/ium6v2KS7zgAAAABJRU5ErkJggg==\"\n    },\n    \"ctrl+shift+s\": {\n      name: \"Download\",\n      description: \"Download image to your local filesystem.\",\n      method: function(_arg) {\n        var editor, name;\n        editor = _arg.editor;\n        if (name = prompt(\"File name\", \"image\")) {\n          editor.markClean();\n          return editor.outputCanvas().toBlob(function(blob) {\n            return saveAs(blob, \"\" + name + \".png\");\n          });\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACs0lEQVQ4T42SS0hUURjH/2fGO2MPTC3p6VQudBEt1Bm1UWgXCEW0LNpIlk5WYoq2UYseFAmaYaRNAy2KApMkq5lRepChjJqaiUJp4cKyRTgzPsZp7jl954xEK+teDt/HPff/+57MWuwpE2DbDQx5AFLIXwuIGMbAIOgLPUa6NNARgkPnmDVp+BwKLV3rbz7QymwO7x1nVV4h6P+0rWalEVwgHKHziyvxKrMBBMTcIsdcSBcT03P6PfeEf+zrTBWzOjrH71bmprX5gqg6lCTlOH2jD9eLMxHhQKzGYNIMWCKYf0EnKzA5swAjOC64BpYkYNZZmbvucW8AFQc3qJTPNvXjyokMaEaKbjJQ6kBgUcd8iINTdq6uH8jPjENZY4+QgPDtCrvW7gugJH+9AlQ7B3GpMB2rY43QqITFMBU+r1NGEgACzCB9hxl1D96DAF7eVG5nT6mE4/sSFYA0WGM2UnSGiE7RKfWFsK7Egl6X9zt2W0xoeDQIZjvpFY2ldjzrD+Db9BQ1izpOAC2GGkewCKUcoWYsD0QFiI9PxC6LGU2twwRweEV9aQ6e9/lVrVKl5qcUAqSnyASgSy4P+QYKkrqJoeXJSBRQdyoH7gG/ov8ZPoFkw6RQzl+lT1ZIh8ApSQyujo9RwFVHFrqGAtGtoUu5Q9LqEiCjy0zI51xXO0IeLIkC991jEuARl4uy8Go4iNoj25YhK5uKllEkJwg87BwHy6Ymni+04c1IALWHk9Hw7tiK6lK7E+XNH7AlXqDt5ScClHhFTYEV3aNB1BDAN/V6RYAteS/Kbg1hc5xA+1sCUAm8usDKesYkwPJfGZy5OYCNBOjonpCb6Jk8dzRjp5zh/uzoKv/ruejyqQa/6P3yk1mL3PXU11QwsYcJJNDw1Oio3Wpsf1sZJDpWIRh4UDDjyG82p2waquUVyAAAAABJRU5ErkJggg==\"\n    },\n    \"ctrl+r\": {\n      name: \"Resize\",\n      description: \"Resize\",\n      method: function(_arg) {\n        var command, editor, height, newSize, size, width, _ref, _ref1;\n        editor = _arg.editor;\n        _ref = size = editor.pixelExtent(), width = _ref.width, height = _ref.height;\n        if (newSize = prompt(\"New Size (WxH)\", \"\" + width + \"x\" + height)) {\n          _ref1 = newSize.split(\"x\").map(function(v) {\n            return parseInt(v, 10);\n          }), width = _ref1[0], height = _ref1[1];\n          command = editor.Command.Resize({\n            size: {\n              width: width,\n              height: height\n            },\n            sizePrevious: size,\n            imageDataPrevious: editor.getSnapshot()\n          });\n          return editor.execute(command);\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACLElEQVQ4T91Tz2sTQRR+05hmTTeB0iS7h8ZjLyEKgoVehCLWFG0g0ahrMEpp6rH++EMUFH8UUbRIq7ZZ21qoh14UjfQiQkXpQWKSJmlcyzZmY3fj7DhjGklK+g/4YBjmzX7fvve9+dC15CUCNIhJgBC66H7j8H3EcjsjvhAlJr03TRNMXNsRIzjU2UcPGJaV5K5gRibNSoKjzVrwu/cDQgiSqXeArr4dJQc7e6FS1UDRFchpWflW/8Pwzr8zsI2QVS/vdXIWDuxWHpYz7wFdeRMnFmQFgRNBtImQKqcg/zMr3x543ERyQT6reB3dXZ4OAVIb3yC3uVZrYez1CNEMTeQQt9rN73Pqhg758tqru4MTgcYqzk9H5oUO8YSJTciVcvLUOTl86tEQ+SfWCC3Rutf6iYqUvBeYGGolojQVXqQiVxi4ft9S7Vbg3XL/G0FsJpLA2LQ/OT3TNIF6/8HxwXmCcV9Fx76ly0vrLI+G5yTyIDiJGNjFeUJstvlS/uXT6IumSQTHA4tu3nPMgiyQVjKlKiY9FiAFdFE+8/d9uzg3CHYRiloR0hvpH89js65G5Y/fGUi4HZ6Q6KTfbBZhXS2AXjUAxaYjxNflB/WXCjrWIatmSltbWs9cvFZiYwRuHknQKkLt7XuAtzlhJbUCKPrsJPG7DoDx24Av3z9DuaKKrcB1oqPX+4nP64M2aqYPXz8CkibDtAVmT7q2rSoPL7R8HwzM7G5u257Z/w969A/vqEbP0wAAAABJRU5ErkJggg==\"\n    },\n    \"ctrl+shift+c\": {\n      name: \"Clear\",\n      description: \"Clear image\",\n      method: function(_arg) {\n        var editor, previous;\n        editor = _arg.editor;\n        previous = editor.getSnapshot();\n        editor.canvas.clear();\n        return editor.execute(editor.Command.PutImageData({\n          imageData: editor.getSnapshot(),\n          imageDataPrevious: previous,\n          x: 0,\n          y: 0\n        }));\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAC4SURBVCjPdZFbDsIgEEWnrsMm7oGGfZrohxvU+Iq1TyjU60Bf1pac4Yc5YS4ZAtGWBMk/drQBOVwJlZrWYkLhsB8UV9K0BUrPGy9cWbng2CtEEUmLGppPjRwpbixUKHBiZRS0p+ZGhvs4irNEvWD8heHpbsyDXznPhYFOyTjJc13olIqzZCHBouE0FRMUjA+s1gTjaRgVFpqRwC8mfoXPPEVPS7LbRaJL2y7bOifRCTEli3U7BMWgLzKlW/CuebZPAAAAAElFTkSuQmCC\"\n    },\n    \"+\": {\n      name: \"Zoom In\",\n      description: \"Zoom in\",\n      method: function(_arg) {\n        var currentSize, editor;\n        editor = _arg.editor;\n        currentSize = editor.pixelSize();\n        if (currentSize < 32) {\n          return editor.pixelSize(currentSize * 2);\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbklEQVQ4T6WTbWhSURjH/15fptPltJm2pJkGLRdUNAZBY/TycZ8EI6LojWAUYxBBtL74KSKCYDSEiCihDBcEvdArgy2C1WRbc6GN3jaXIpMcvl7vvefa8YarMT8IXe45l8u9z+/8zvM8R4b/vGSVeI/Hw3Qe6R8UiNhNiNhMn+AFISYIwtPwsxtn6Xex2loSQAo+3D/cqC51GeplUDAlgN6sUMJ8ksVcIj8SHb25rxpEArye5bwGtdhj1jHIFAlYvgRCAUoGaKiTY2C6Dzk2Da7Asz73kOZfEwnwPJyPbmmSW1lBRJ4rQSzRQYWpAOoUMng/nsQBy1Y8CgcxdOzJ8rbLsdLL41CWbG9WMotZAiKWATSYToFv55HJpWBW6mBf04TJhR/4Go+jyHKp0UtjxmXAw4klsmujhklkBAoA1f9jcHv6BDrNDroljo4izUkRBa6IN+MhfLg8JS0uTffHktGdLVprjurnOFEyKJvcm+zFr3QcRpUGVqMen+YWMP9zEcUCx4YGIlIuJMCdkbh3nV7V47BokcoTZMsQalCnlMGgkaP37l7scGzA2+AsJq6FVuegXEZTx/Fhy1p1l83SAJWCQbnoBVZA6EsSvndHkcmmoOaJeE6jcx68GvxcqcSKRtJsOzTI8aSbF2gj8QScQOImdobbrw9tsjo7EIuMIxJ8lSxw6T2nvN8lyAqdap0WcLeplPZGv6ml1WVz7kY08h4zwRfJ07eippoAUqdSyGaz6Dfb2lz21na8DFzHGV/ibxVqOU8eN1QW7Xq/QqV25TJLV/r8qYs1G1QWcLshb5fXmy88yMdWJbEWi2r//AZSUiAguj/HUQAAAABJRU5ErkJggg==\"\n    },\n    \"-\": {\n      name: \"Zoom Out\",\n      description: \"Zoom out\",\n      method: function(_arg) {\n        var currentSize, editor;\n        editor = _arg.editor;\n        currentSize = editor.pixelSize();\n        if (currentSize > 1) {\n          return editor.pixelSize(currentSize / 2);\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACVElEQVQ4T6WTS2gTURSG/0zejaVNbUws0aZVamgFFUtUiBQUF2JXgYiIC0GEqovufBTELNWFblpSxIUPMFK6EsVaMVBXPoIuUkwqbUXHJA0GE5vMdDKZO+OdkaQqkQYc5twLdzjf+bjnjA7/+eiq+aFQiNl/YmRMIvIgIXIH3VGRpLQkSY8TT0bP0e9yvVoaQEs+PhJttSgD9iYdDIwC0FeQFHzJCfic5WfYl7cO1INogOcfxbDdIg851zEolgmEigJCAUYGaDbrkUgVsZAujg8f6Trzt4UGeJrg2W3tercgyeBFBbJCgwpTAZgNOhh1CqZjqa/nAz2b6gIexUtkR4eR+VYiILIKoMl08d2/Bn0+D7nEgfwo0VgGKahRyrfNx9tUmGYw+a5Adm+2MtmiRAGg+r8M/KMXwe/1QhbpOQ1ZEEHKFRhu3EV7ZlHL1ZYHr3Lsrk6bm6P6nChrBqrJnvErMLDsamVqodkIZcGZT1lrgDszmfCGFtPQFpcNeZ6gpEKogdmog92qx5sPS+DmXgg9hcmdhy9Pzf1+D7U2Onwno671lgGPqxkmAwO16SuChPh8Dtz3JRwyRbH4fjq3InL+o9djNcgfg2TdfmxMrJDBikQHqUIgSiTjEGbFgy3xLnevD+nkWyRjKmTZfyr8SYPUAP+a6Ilgn8nY3RpxdHoDnt59YJOvMRubyp2+zToaAmiTSiFbnXLE6ekLdHv78WziJs7ey652oZH/KRSEyWXbGDGYLAGuWLg6HMlfatigWiAYhL5f3+S88JBPV8/WvIO17H4CfCMpIEZZGWYAAAAASUVORK5CYII=\"\n    },\n    \"g\": {\n      name: \"Toggle Grid\",\n      description: \"Toggle Grid\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return editor.grid.toggle();\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVQ4T2NkoBAwUqifAZsB/4GGIovj5VPVAJBNpAJGqroAZvtoGDAwjIYBFcKApOQMANUmIRHQ0q3yAAAAAElFTkSuQmCC\"\n    },\n    \"f5\": {\n      name: \"Replay\",\n      description: \"Replay the drawing process\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return editor.replay();\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACZElEQVQ4T6WSX0hTcRTHz9XYTXEPRboC05qilK0N58N8kD1IIstyIHsYhReGrT9j4VOv+lgEQtCkB4ugZ8MSggXtIQXDl7pzLbOtYAij3D9r3Vt39+72vULSD+5bG+fhcs75nO853x9H//nj/vZPT0+nNE3rrNfr32KxWJcZ1+/3p1VV7arVap/j8fgpo2YfEI1Gf6H5CSBTpVLJVJckSYTmOcRoIpHoYwCRSEQHvQSAlQ/MqnwDj2KdlDrRlbb7dNxKdPnm2gHUJAFwr66u7g3fVxAOh0U0L6PAnxY6+9wWgXjNTrJGdM76lC62vqQRYfODoijzhsr19XUXAwiFQl/QvG0o+HrthzMvqTTQOEcNWi816kRHGzL0amZyA9N3Ee2iKJ5kAIIgbCHxBuGw3Prt6mg5SBVlh6rSWfpeGaGy1Eby7RsiFBgreNLpdA8DCAaDKShYRIyN3TvRb+GaScX/p7aDRWWqczV6eOGTiOZngExkMpkzDCAQCOSQLNlsNme5XDZ1IZlMyhiwBcDhXC7XwQDGx8dTSCziBud7Z567mxrhgkqkYP+p1gfU3sKRx3v3LYYsIyby+TyrwOfzGeS9G0gzXpeZC91DL4wVklDhKRQK7A2Gh4f3XECBtfnOEVMXFiaHNlCzi2ivVCqsC16v9x0ULCB5vWf+2GkzF96HRzfxWmMYMlWtVtl3MDg4qCOxhnBGl4aaLFwT1f51AV+z/a8l5JcAuSTLMvsS3W43BChXeZ5/ZLfbTV1YWVmhYrHoB+AxlB5iXHA4HJug240jZbPZATMC4B/R3IPmrK7r3UbNHy8zkCA9UyOUAAAAAElFTkSuQmCC\"\n    }\n  };\n\n  Actions.extras = {\n    \"F1\": {\n      name: \"Help\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return window.open(\"./docs\");\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC7klEQVQ4T6WTW0hUQRjH/+7q6mpkbLK663ZX28pExDJLKRRKKypZiNouVoTggy+RDxEoCSEp0UNJPkSloYTdoxtYdNE2a7vRmou4mWjppuUF3T3n7Dkz03Rku9JDNPMwM8z8f3zf9/8mBP85Qn7X3+sS52kJszOGnZSxOEoJCGNeSli9pIiNBemx737W/AJodvttYPT4nOlhphDGhYSobzUaDQJ8+/aDb0AmSol9hflSEPIdcKd93MYIrbOadFFjEwI6en3o/eIDoQzGaB2SLVNhmBaBxx2jPkUhhUV5s1WICrjhHJ1LNLQl2RJh9o740ewagik6DGvTzGB8Oj0jeNE9jJXWGFhiotD86lO/oIjZB2wp3SqgqW2obGG8/pAkybjq7IckyijfuijI5ytD9ZUOBBSKvLR48Prg4Zv+8jJ7aoUKqL//sSsjaWpC69vPcH8c5WFT7NtgxeueEURFaLEsMQZtXYO42NqNJMt05CyOQ8Pdbs+RvemJKuDk7R5/bopBf+7Be4wLMmQi81oSrFsyE5nzjQjIFHde9uGJ2wt9uBZFecmoudYu1JRkRaqAo5c7/euXmvRnOWBsYpyLeeY8zKrdGRiZkFDd9BJiQOGJAHqdBsUbU1F1/pVQV5ozCahocHUVZFkSHroG4e4b5vbJoDwN7orqFpEVXgZ+5jNhRgzWLJ2FIw0vPBfK8ydTKD31rCw31XxoSqQOFx+9g08QVGHlnkzwZsL+2gfqORQUW1anYGhYQOM9d/nNyk2TRSw+1jIXGtaya43VPOqTcM3hgSAGkJZgVIXOzgFoqIz8zAUwGiJx+NzTfpGI2a3Htk3a+G1sr2y2UUbrijemRMk8dIfrA3q9w6DcuvjYaCxPtiA0VIuKMw6fTEih44T9RyMFIZsOXrcpjB3fvCrJZJ1tQLhOq14JogKXZwinb70ZkCkteV67489WDkJySs7PI9oQ9TMRhcZ9qwGhxMt7o16SWGN73a6/f6Yg5F/WrzeMbiDawgJJAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+shift+s\": {\n      name: \"Save State\",\n      description: \"Download project file to your local filesystem.\",\n      method: function(_arg) {\n        var blob, data, editor, name;\n        editor = _arg.editor;\n        if (name = prompt(\"Name\", \"file\")) {\n          data = editor.saveState();\n          blob = new Blob([JSON.stringify(data)], {\n            type: \"application/json\"\n          });\n          return saveAs(blob, \"\" + name + \".json\");\n        }\n      },\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC4klEQVQ4T32T70tTURjHv8fpppuaQkuhlgU2f4wCs6b4QpxLod9BJSaYEOS7+gOiF/VCYvjKepf0IsFfU6wxUSNFiALJ9NWi7AelbmbX2qZzv9zdvT3nSOAMei6Xe++55/mc7/N9zmGgGBsb06Wnp19QVfVaMpkspaEjynZ4aOwLPZ8kEomppqamJJ+/Mxgll2s0mv6CgoJjhYWFMBgM0Ov1oESsr68jFAphcXERkiS9prFmgvhSABMTE9NlZWV1JpMJjLHdC4hvWZbh8XiwsLDQ09zc3JYCGB8fl2w2m1Gr1f4XEAgEMDk5udbS0rJvdwkCEAwGkZmZCZ1Oh4yMDFFCJBKB3++H1+tFcXExpqam1lpbW1MBo6OjUn19vTEcDot6Y7GYSOayuQfxeBxkMMxms1DQ1taWCnC73QLAJ/JknsgTHjz3I0cHRLZk5GdrsSJFwdKAbL0GisoQ2Iji5exSFXO5XJLdbjdyudFoVAC4H/cHf+KsrQSXjmfDPePF+eoDKQY/nV7D9NtvYCMjI1JDQ4Nxc3NT1MwB3Ic7vT9grynFjbo83H40h4e3KgUgJgNbtBsej/nw/vMy2PDwsNTY2ChM5ADaSAJwb+gXTlWVoKU2F4yuNOqwSgBFUalbgGPoO+Y/EMDpdAoAd5sDaNchKysLDlcAJyyH4PsdEslyUoFCN4dwk/mLb2UFbGBgQLJarUYKrK6uCh84oOOZHxXlJjKLNNNsWU4KOFegqAp9J6i9BOjt7T1DP5wWi8VQVFQk5PMdeb1zHvaTJbhSmwVZ2SIItYAvzBRkpmvR2beEWc8nKo6iu7v7MLXuLoEu07nYw89Cn6cQp6uO4mJtAt2z7dhrOMidwFp4Ge3WLnT1xzE9924bsDMcDkcOlVD8Klg5f/NcORor/JgJDCJPu1+ICMYkVOdfRUdPEi9m5v4F/IVVtE+8MZv0NXm6fJKcS2UkwMgDppIXLIKPS18hbSTwB3tLeq03+hLeAAAAAElFTkSuQmCC\"\n    },\n    \"ctrl+p\": {\n      name: \"Share\",\n      description: \"Publish picture to Facebook.\",\n      icon: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAALoElEQVRYRzVXeXBV9Rk9d31rEpJA9p1VCKBQJoEIYooOKgmKA3XBLSqiEnQcWzsSa4vOyHTRVgVG3P6onamt7bS26NRWrGwBxQpIEhCSSAiSBEjy8rb73r33/Xp+9+lL7rzlLr/zne985/t+yrZjT4m9/96DxFAMebm5iNgWXMVGwO9H2kpBz5hQdIG4mIDhV+CkMzAUH3QRhp12oQLQfQqiNs9rAjlmDgq0Emxc/WM0zlwOJaVA1RXIC12+ObAheI8QBlR+V5Y9N1u4CQdmUuWCLoRPh9D4ORFHwBcEbBWKImAbaahGBq6dgZbRoCHAp+hwnDTMkAFHsZARFtSMgM8Ko/32Dtx09RoYwgQy/OchASi6w+X5Dt0DrzQ9XSsCwo/rG27E1MpZSLoONMOEsF0EjRBU24DrunANYhcEkXEJgKAyBnTdhObTMBodRdqII5xn4pvebvzr73uw/oaHcO8tDwJpjQwQLAF4K6r84LjIOGSGIJSVW+eK0QsR/HRDB1ZceQPGwCj452OMDByawwgEFzR1pPnnI3aVT3McJ/tJ0eGqDhlIweDv+3s+xs6XtuO2lvtxV8sDfArvZYAgaO8lAQhJic53MtD8zFyRHEuTsiewdNEKRBMJmAYpTUTh15knl3SrJpJCgeWm4NNdL9ci48BQg3xegM9WMWpdRmiSjgOff4o3dr2O+25/BLetvMMjWiE0lwvqCuEoTIHgykwlw4OydMssKkxDW+vDWDhnMZKWQ2pVuFYMOQE/MhaRa0EMR1zo/iB0zeYDbOrFIgDTO28GgrAyaYQKwuj8Yh/+8t5fsablR7i5ZQ00RmtoTBUDkGlQXK7rZGAqKkLMjNL83EyRvOTgoVs2o2nBCly8FKHoiFleyRsCRgFOnBzGu3/7DIk002CnIFyJHgj7fXDsJCPUkHAE9eDns21EYwlMypkM3dDIVJIAFAiHn3mNIFCqB5NyC1FUOIUMPFslRExH202PYsn8azEWScDnY5mpLqx4GrnhUuw92Icdb35CiquQEybtpDydckD9QVFZtukUND0XaSlOgvcHQkjEU1CZKqhxMk7RuTpMitZghSUTFpJxh7/x/uU/rxZOBNjQshmNc5dhIkZqJXKXkVF8wWAR9h7ow8639mFG/dWYWlfJkmKl8E+IFAJ6mopmKWq5XJQiJXhV1cgUGSGAjJYgVxStTRYYuTw/PhHFkc+PedpSrvnF9wA2YXG9BECKCADfAQgECrFvPwG8fQgzZzegpq4kS6NqeFpQVQKw0yxNEznBEFmbgG3TyEL5SFhxai0OfygITQkzNUkE83IwEU1if+cRlidrqum5auGOk4FWApizHLEoy8nwUShpMqAgFCzAfpmC1w9i6syrUFWZA9eJUyM6jYdiZbRywdyAD6nYZS5kIT8/D7oZgkt12PSQi2MRCq6IC1swCTJOB/3f8W4aE1PW+HyNcCOCKZAMEMCEzVxJAIyOC4RDZOBgL3bsOoCaqfNQXkb3S03QDyhAUir8OUgmGaVcOBe47tpFmDGjjq4JBgJ8vK8Puz/cg5xQCQVqIEWjY2joPTcEizpSGp6flgXQutFLQRYAa5tupQoNvkAOOg8NkIFOAqhHRZkKkY7RiBkh/TzFw88eYU0M4s5112PhvDLP6xOsVmm9x7ou4b33/omgfwqVwOsZWJxl2D9IANSJ0vSLK4Q94WQBzF2CaFRqgPXPkpEO6A/k4sDhAex8/bPvANDBJACRx/MGy488aKwIjKPjJ3fCx6jJLL46OYIYG9HxnjM4eaqf5ZyLFBc0WboxK43j3f1QuI7S3DFf2Mz7htYH0TivwROKZvqYZ9asVG0ozwOwnQCqa+ejopS5Z8f0uwRAlxR0xnRyFLUlITz26CqZOUgJbfvtn9F1ahDFlZVe1zR1P7XiIkCtJFMZfNnVzyoJZAG4pH3D6vvRMHexB0CK0GGRZmijZpDu9tk5bN91GDW1VxKA7JA2izDksSS7mybiKC808dC9rVwApBl4652P8O3lGO1bRYoApBsKWnCGbdFxVHSfGfTsWVm2dQ414KLtxgfQVL8UyZidBeCkoNA0pP0ePT6EF1/8CDOnN6CiJB+plAWHTcX0G4hOjGHVyqVYsrAKYdLvZ4YYKCIWWzct/aP/nsa+A0foJwGWZIby47OZ2hNdp2hSCpRFW+qEbulZDcxeilRcqpdiSbOGWUI5tMsDB0/jzV17UV50BaZXV/NGgQk3wbmBbhmN4dbVK9DcUEqJsW1I6VB8zATVDvz+3S9wtKsX/qBkVc4BflhkrufkSS9ApXlrvbBGLbSxdS5bsBzRCFurbAN0O3+YNU+3OnS4F3945xCqS+eioqjIG0JSBKHQ40kHZk8tx7wZxWi4spq55r0EceTYNxgZT+NY9xAujEQ4NbFk5UDC1hxnjk6e6WUg7IbXPDNLuFEX97W2YfH8qxFPsFjMbFNR2I6DeYX45NMevPLSB5gzvQllBVO8XCqUu0snUNMcsawIJoddPPn4XRxiGDnDf/m1P+Hs+TGE82uQpPrZPghANg8diaSNr/sGWMZMQdOWacKwTdzT+gAWzFpIAMw9c3dh5CyGLo4gkDsZPT0R7PnwAqZWNaI8vwg2I8hQA4KHwUO1YyjMzeCpx9dxUspOPq/seB8DwzGmKczD54lPNiqFSCxWQU/voMe00vz8bDE2NI4Nazfi+mU34tzAEA4f7sTBzn24NDbGhQKkvIjzwTSUTZ6HaaXVXEQgzT7gC5jsikmWZQSVRX5s2riGOfa0xarZjW9HkqxU+j1tUY51sosKzgeca9Fz6rw3kyiNW6uFQrWsX3UHith6d/9jD/pOD6KqpAZNS5rJRghDQw7+83E/igvqUFtcxAUERSpnRCAYDtG8LqJ8ig+bH7mVPcKbtPDSq7txfiTmDSvS03Q5sFE3NueHDAF1dZ9lmbMbLnq2gl6iob6iHue/HkJ03MH6tW24oXkVJpmlzDIv7r+E9s2/Rv3sH6CAE7BCDRg+kwDIBGtO4Rhfku/Dpkdv9lZnBvGblz/A5XHOBIacnLkUdSXbctKK8gIDX3UNkBk6YePTNSKo5cAadjCzbA7a7n4YV9Uu8KjSFfYE1u3howPY+sIfUVQyHRXF+SzPGH9nCzY5vnLsTkUnUFzox5NPrPGGDIob2371PqJxoiElEoCcgmT1+AM6okkLp88MsTFRE/e+uk5cHLyI6xqu4yR7B8LaJLqczmrVPZo1ttXPvxrG5qd2oLK2HtPrKuiWoyxRA/F4nEMqBxA+uKosH/esv4aNiQ7NWF974xDOfcv2LGcLuVegFbu8TuPXSCKGvv5hMkgA5zJjnC9SKOCk4vcGa1LK5BpayNt4uAziRO842rdsR0FpHUqLJ3vzoMtzl0dH6YSjFKWcjICaqmLSys2NpuN03zDi3OhIU5Nt3VRMjhhydGOZkqZRWr7pYy+wWNRSNCbLRJUzu0yiZ2VMJMcoNnp0HhtCe8fvMK1+IYqn5FN0UXSfOO2pOp+bEfYXTrsOx7gUfSnBLmfACIS5QIi0ExAp0dk5XZudU3ZL6iLDR8vpSBEZIWy536MtejsX+ZKIsoOvt5/oPD6Cjl++jUlFFfBxAzJ0gQLigretXY2WlYs4HWctWLogq43uyRu/6wkyOjq2/Mo9htfhvfNyg8YKheLQpjR5p6SVOeemwMuTB4A3s0Bw8OgFdGx7A75gDmKXz2JGbTmefKydndHHvYPcXvAlzf/7+/hus7ZpVbKhZ/eA2S1h9sUfMqrNZDPdkgGXQ4UmOwlvkA1EtgypWhkN96E48GUffvbCTg4eJta1NOPutT8E96rshtmIaHAezfLdG7X5LIdbPDkHK3ITy2A0KSbvwixQodKkiFphT6dFy3DlV4mabsXDkG1TbuO4wIUI54VNHWhvb0fzwgqE5KIyInmb3Dp646fHg1cC1CefFPNcUUPQG+/lrlkG5rEq2EOMlAfy/zaifUZYoqDwAAAAAElFTkSuQmCC\",\n      method: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        return Facebook.requiringPermissions([\"publish_stream\"], function(_arg1) {\n          var accessToken, userID;\n          accessToken = _arg1.accessToken, userID = _arg1.userID;\n          editor.notify(\"Publishing image to Facebook\");\n          return editor.outputCanvas(8).toBlob(function(blob) {\n            var formData;\n            formData = new FormData;\n            formData.append(\"access_token\", accessToken);\n            formData.append(\"source\", blob);\n            return $.ajax({\n              url: \"https://graph.facebook.com/\" + userID + \"/photos?access_token=\" + accessToken,\n              type: \"POST\",\n              data: formData,\n              processData: false,\n              contentType: false,\n              cache: false,\n              success: function(data) {\n                return editor.notify(\"Successfully published!\");\n              },\n              error: function(shr, status, data) {\n                return editor.notify(\"Error publishing image\");\n              },\n              complete: function() {}\n            });\n          });\n        });\n      }\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "brushes": {
      "path": "brushes",
      "content": "(function() {\n  module.exports = {\n    pencil: function(point) {\n      return [point];\n    },\n    brush: function(_arg) {\n      var x, y;\n      x = _arg.x, y = _arg.y;\n      return [Point(x, y - 1), Point(x - 1, y), Point(x, y), Point(x + 1, y), Point(x, y + 1)];\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "command": {
      "path": "command",
      "content": "(function() {\n  var LZString, deserialize, extend, imageDataFromJSON, imageDataToJSON, serialize;\n\n  LZString = require(\"./lib/lz-string\");\n\n  extend = require(\"util\").extend;\n\n  module.exports = function(I, self) {\n    var C;\n    if (I == null) {\n      I = {};\n    }\n    self.imageDataToJSON = imageDataToJSON;\n    self.imageDataFromJSON = imageDataFromJSON;\n    self.Command = {};\n    C = function(name, constructor) {\n      return self.Command[name] = function(data) {\n        var command;\n        if (data == null) {\n          data = {};\n        }\n        data = extend({}, data);\n        data.name = name;\n        command = constructor(data);\n        if (command.toJSON == null) {\n          command.toJSON = function() {\n            return data;\n          };\n        }\n        return command;\n      };\n    };\n    C(\"Resize\", function(data) {\n      var _ref, _ref1;\n      if (typeof ((_ref = data.imageData) != null ? _ref.data : void 0) === \"string\") {\n        data.imageData = imageDataFromJSON(data.imageData);\n      }\n      if (typeof ((_ref1 = data.imageDataPrevious) != null ? _ref1.data : void 0) === \"string\") {\n        data.imageDataPrevious = imageDataFromJSON(data.imageDataPrevious);\n      }\n      return {\n        execute: function() {\n          return self.resize(data.size, data.imageData);\n        },\n        undo: function() {\n          return self.resize(data.sizePrevious, data.imageDataPrevious);\n        },\n        toJSON: function() {\n          var imageData, imageDataPrevious, size, sizePrevious;\n          imageData = data.imageData, imageDataPrevious = data.imageDataPrevious, size = data.size, sizePrevious = data.sizePrevious;\n          return {\n            name: \"Resize\",\n            size: size,\n            sizePrevious: sizePrevious,\n            imageData: imageDataToJSON(imageData),\n            imageDataPrevious: imageDataToJSON(imageDataPrevious)\n          };\n        }\n      };\n    });\n    C(\"PutImageData\", function(data) {\n      if (typeof data.imageData.data === \"string\") {\n        data.imageData = imageDataFromJSON(data.imageData);\n      }\n      if (typeof data.imageDataPrevious.data === \"string\") {\n        data.imageDataPrevious = imageDataFromJSON(data.imageDataPrevious);\n      }\n      return {\n        execute: function() {\n          return self.putImageData(data.imageData, data.x, data.y);\n        },\n        undo: function() {\n          return self.putImageData(data.imageDataPrevious, data.x, data.y);\n        },\n        toJSON: function() {\n          var imageData, imageDataPrevious, x, y;\n          x = data.x, y = data.y, imageData = data.imageData, imageDataPrevious = data.imageDataPrevious;\n          return {\n            name: \"PutImageData\",\n            x: x,\n            y: y,\n            imageData: imageDataToJSON(imageData),\n            imageDataPrevious: imageDataToJSON(imageDataPrevious)\n          };\n        }\n      };\n    });\n    C(\"Composite\", function(data) {\n      var commands;\n      if (data.commands) {\n        data.commands = data.commands.map(self.Command.parse);\n      } else {\n        data.commands = [];\n      }\n      commands = data.commands;\n      return {\n        execute: function() {\n          return commands.invoke(\"execute\");\n        },\n        undo: function() {\n          return commands.copy().reverse().invoke(\"undo\");\n        },\n        push: function(command, noExecute) {\n          commands.push(command);\n          if (!noExecute) {\n            return command.execute();\n          }\n        },\n        empty: function() {\n          return commands.length === 0;\n        },\n        toJSON: function() {\n          return extend({}, data, {\n            commands: commands.invoke(\"toJSON\")\n          });\n        }\n      };\n    });\n    return self.Command.parse = function(commandData) {\n      return self.Command[commandData.name](commandData);\n    };\n  };\n\n  imageDataToJSON = function(imageData) {\n    if (!imageData) {\n      return;\n    }\n    return {\n      data: serialize(imageData.data),\n      width: imageData.width,\n      height: imageData.height\n    };\n  };\n\n  imageDataFromJSON = function(_arg) {\n    var data, height, width;\n    data = _arg.data, width = _arg.width, height = _arg.height;\n    return new ImageData(deserialize(data), width, height);\n  };\n\n  deserialize = function(dataURL) {\n    var binaryString, buffer, dataString, i, length, view;\n    dataString = dataURL.substring(dataURL.indexOf(';') + 1);\n    binaryString = atob(LZString.decompressFromBase64(dataString));\n    length = binaryString.length;\n    buffer = new ArrayBuffer(length);\n    view = new Uint8ClampedArray(buffer);\n    i = 0;\n    while (i < length) {\n      view[i] = binaryString.charCodeAt(i);\n      i += 1;\n    }\n    return view;\n  };\n\n  serialize = function(bytes) {\n    var binary, i, length;\n    binary = '';\n    length = bytes.byteLength;\n    i = 0;\n    while (i < length) {\n      binary += String.fromCharCode(bytes[i]);\n      i += 1;\n    }\n    return LZString.compressToBase64(btoa(binary));\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "dirty": {
      "path": "dirty",
      "content": "(function() {\n  module.exports = function(I, self) {\n    self.attrAccessor(\"savedCommand\");\n    self.extend({\n      dirty: function() {\n        return self.savedCommand() !== self.lastCommand();\n      },\n      lastCommand: function() {\n        return self.history().last();\n      },\n      markClean: function() {\n        return self.savedCommand(self.lastCommand());\n      }\n    });\n    self.markClean();\n    window.onbeforeunload = function() {\n      if (self.dirty()) {\n        return \"Your changes haven't yet been saved. If you leave now you will lose your work.\";\n      }\n    };\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "drop": {
      "path": "drop",
      "content": "(function() {\n  var Drop, Loader, loader, logError;\n\n  Loader = require(\"./loader\");\n\n  loader = Loader();\n\n  Drop = function(I, self) {\n    var html, stopFn;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    stopFn = function(event) {\n      event.stopPropagation();\n      event.preventDefault();\n      return false;\n    };\n    html = document.documentElement;\n    html.addEventListener(\"dragenter\", stopFn);\n    html.addEventListener(\"dragover\", stopFn);\n    html.addEventListener(\"dragleave\", stopFn);\n    html.addEventListener(\"drop\", function(event) {\n      stopFn(event);\n      return Array.prototype.forEach.call(event.dataTransfer.files, function(file) {\n        var url;\n        url = URL.createObjectURL(file);\n        return self.fromDataURL(url);\n      });\n    });\n    return document.addEventListener(\"paste\", function(event) {\n      return Array.prototype.some.call(event.clipboardData.items, function(item) {\n        var file, url;\n        if (item.type.match(/^image\\//)) {\n          file = item.getAsFile();\n          url = URL.createObjectURL(file);\n          self.fromDataURL(url);\n          return true;\n        } else {\n          return false;\n        }\n      });\n    });\n  };\n\n  module.exports = Drop;\n\n  logError = function(message) {\n    return console.error(message);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "editor": {
      "path": "editor",
      "content": "(function() {\n  var Actions, Command, Drop, Eval, GridGen, LITTLE_ENDIAN, Notifications, Palette, Postmaster, Symmetry, Tools, TouchCanvas, Undo, ajax, defaults, extend, loader, rgb2Hex, _ref;\n\n  LITTLE_ENDIAN = require(\"./endianness\");\n\n  loader = require(\"./loader\")();\n\n  ajax = require(\"ajax\")();\n\n  _ref = require(\"util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  TouchCanvas = require(\"touch-canvas\");\n\n  Actions = require(\"./actions\");\n\n  Command = require(\"./command\");\n\n  Drop = require(\"./drop\");\n\n  Eval = require(\"eval\");\n\n  GridGen = require(\"grid-gen\");\n\n  Notifications = require(\"./notifications\");\n\n  Postmaster = require(\"postmaster\");\n\n  Tools = require(\"./tools\");\n\n  Undo = require(\"undo\");\n\n  Palette = require(\"./palette\");\n\n  rgb2Hex = require(\"./util\").rgb2Hex;\n\n  Symmetry = require(\"./symmetry\");\n\n  module.exports = function(I, self) {\n    var activeTool, canvas, canvasPosition, compareImageData, diffSnapshot, initialState, lastCommand, pixelExtent, pixelSize, positionDisplay, previewCanvas, replaying, snapshot, symmetryMode, thumbnailCanvas;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Model(I);\n    }\n    pixelExtent = Observable(Size(64, 64));\n    pixelSize = Observable(8);\n    positionDisplay = Observable(\"\");\n    symmetryMode = Observable(\"normal\");\n    canvas = null;\n    lastCommand = null;\n    replaying = false;\n    initialState = null;\n    self.include(Actions);\n    self.include(Bindable);\n    self.include(Command);\n    self.include(Drop);\n    self.include(Eval);\n    self.include(Notifications);\n    self.include(Postmaster);\n    self.include(Undo);\n    self.include(Tools);\n    activeTool = self.activeTool;\n    self.extend({\n      alpha: Observable(100),\n      pixelSize: pixelSize,\n      pixelExtent: pixelExtent,\n      positionDisplay: positionDisplay,\n      viewportWidth: function() {\n        return pixelExtent().scale(pixelSize()).width;\n      },\n      viewportHeight: function() {\n        return pixelExtent().scale(pixelSize()).height;\n      },\n      viewportStyle: function() {\n        var cursor, height, iconOffset, iconUrl, width, x, y, _ref1, _ref2;\n        width = self.viewportWidth();\n        height = self.viewportHeight();\n        _ref1 = self.activeTool(), iconUrl = _ref1.iconUrl, iconOffset = _ref1.iconOffset;\n        _ref2 = Point(iconOffset), x = _ref2.x, y = _ref2.y;\n        cursor = \"url(\" + iconUrl + \") \" + x + \" \" + y + \", default\";\n        return \"width: \" + width + \"px; height: \" + height + \"px; cursor: \" + cursor + \";\";\n      },\n      mainHeight: Observable(720),\n      viewportCenter: function() {\n        if (self.viewportHeight() < self.mainHeight()) {\n          return \"vertical-center\";\n        }\n      },\n      grid: Observable(false),\n      gridStyle: function() {\n        var gridImage;\n        if (self.grid()) {\n          gridImage = GridGen().backgroundImage();\n          return \"background-image: \" + gridImage + \";\";\n        }\n      },\n      symmetryMode: symmetryMode,\n      outputCanvas: function() {\n        var outputCanvas;\n        outputCanvas = TouchCanvas(pixelExtent());\n        outputCanvas.context().drawImage(canvas.element(), 0, 0);\n        return outputCanvas.element();\n      },\n      resize: function(size, data) {\n        var canvasElement, height, previewCanvasElement, thumbnailCanvasElement, width, _ref1;\n        if (data == null) {\n          data = self.getSnapshot();\n        }\n        pixelExtent(Size(size));\n        _ref1 = pixelExtent(), width = _ref1.width, height = _ref1.height;\n        canvasElement = canvas.element();\n        thumbnailCanvasElement = thumbnailCanvas.element();\n        previewCanvasElement = previewCanvas.element();\n        thumbnailCanvasElement.width = canvasElement.width = previewCanvasElement.width = width;\n        thumbnailCanvasElement.height = canvasElement.height = previewCanvasElement.height = height;\n        self.putImageData(data);\n        return self.repaint();\n      },\n      repaint: function() {\n        var height, width, _ref1;\n        _ref1 = pixelExtent(), width = _ref1.width, height = _ref1.height;\n        thumbnailCanvas.clear();\n        thumbnailCanvas.context().drawImage(canvas.element(), 0, 0);\n        return self;\n      },\n      getSnapshot: function() {\n        var size;\n        size = pixelExtent();\n        return canvas.context().getImageData(0, 0, size.width, size.height);\n      },\n      insertImageData: function(imageData) {\n        var size;\n        size = pixelExtent();\n        return self.execute(self.Command.Resize({\n          size: {\n            width: imageData.width,\n            height: imageData.height\n          },\n          sizePrevious: size,\n          imageData: imageData,\n          imageDataPrevious: editor.getSnapshot()\n        }));\n      },\n      fromDataURL: function(dataURL) {\n        return loader.load(dataURL).then(self.insertImageData);\n      },\n      vintageReplay: function(data) {\n        var delay, i, runStep, steps;\n        if (!replaying) {\n          replaying = true;\n          steps = data;\n          self.symmetryMode(\"normal\");\n          self.repaint();\n          delay = (5000 / steps.length).clamp(1, 250);\n          i = 0;\n          runStep = function() {\n            var step;\n            if (step = steps[i]) {\n              step.forEach(function(_arg) {\n                var color, x, y;\n                x = _arg.x, y = _arg.y, color = _arg.color;\n                return self.draw({\n                  x: x,\n                  y: y\n                }, {\n                  color: color\n                });\n              });\n              i += 1;\n              return setTimeout(runStep, delay);\n            } else {\n              return replaying = false;\n            }\n          };\n          return setTimeout(runStep, delay);\n        }\n      },\n      replay: function(steps) {\n        var delay, i, runStep;\n        if (!replaying) {\n          replaying = true;\n          if (steps == null) {\n            steps = self.history();\n          }\n          self.history([]);\n          editor.canvas.clear();\n          self.repaint();\n          delay = (5000 / steps.length).clamp(1, 250);\n          i = 0;\n          runStep = function() {\n            var step;\n            if (step = steps[i]) {\n              self.execute(step);\n              i += 1;\n              return setTimeout(runStep, delay);\n            } else {\n              return replaying = false;\n            }\n          };\n          return setTimeout(runStep, delay);\n        }\n      },\n      loadReplayFromURL: function(jsonURL, sourceImage, finalImage) {\n        if (jsonURL != null) {\n          return ajax.getJSON(jsonURL).then(function(data) {\n            if (Array.isArray(data[0])) {\n              if (sourceImage) {\n                return Q.all([loader.load(sourceImage), loader.load(finalImage)]).then(function(_arg) {\n                  var finalImageData, height, imageData, width;\n                  imageData = _arg[0], finalImageData = _arg[1];\n                  width = finalImageData.width, height = finalImageData.height;\n                  editor.setInitialState(imageData);\n                  editor.restoreInitialState();\n                  editor.resize({\n                    width: width,\n                    height: height\n                  });\n                  editor.vintageReplay(data);\n                  return editor.setInitialState(finalImageData);\n                });\n              } else {\n                return loader.load(finalImage).then(function(finalImageData) {\n                  var height, width;\n                  width = finalImageData.width, height = finalImageData.height;\n                  editor.resize({\n                    width: width,\n                    height: height\n                  });\n                  editor.vintageReplay(data);\n                  return editor.setInitialState(finalImageData);\n                });\n              }\n            } else {\n              return editor.restoreState(data, true);\n            }\n          });\n        } else {\n          return loader.load(finalImage).then(function(imageData) {\n            editor.setInitialState(imageData);\n            return editor.restoreInitialState();\n          });\n        }\n      },\n      restoreState: function(state, performReplay) {\n        var commands;\n        if (performReplay == null) {\n          performReplay = false;\n        }\n        self.palette(state.palette.map(Observable));\n        initialState = self.imageDataFromJSON(state.initialState);\n        self.restoreInitialState();\n        commands = state.history.map(self.Command.parse);\n        if (performReplay) {\n          return self.replay(commands);\n        } else {\n          commands.forEach(function(command) {\n            return command.execute();\n          });\n          self.history(commands);\n          return self.repaint();\n        }\n      },\n      saveState: function() {\n        return {\n          version: \"1\",\n          palette: self.palette().map(function(o) {\n            return o();\n          }),\n          history: self.history().invoke(\"toJSON\"),\n          initialState: self.imageDataToJSON(initialState)\n        };\n      },\n      setInitialState: function(imageData) {\n        return initialState = imageData;\n      },\n      restoreInitialState: function() {\n        self.resize(initialState, initialState);\n        return self.history([]);\n      },\n      withCanvasMods: function(cb) {\n        canvas.context().globalAlpha = thumbnailCanvas.context().globalAlpha = self.alpha() / 100;\n        try {\n          return Symmetry[symmetryMode()](pixelExtent(), [Matrix.IDENTITY]).forEach(function(transform) {\n            canvas.withTransform(transform, function(canvas) {\n              return cb(canvas);\n            });\n            return thumbnailCanvas.withTransform(transform, function(canvas) {\n              return cb(canvas);\n            });\n          });\n        } finally {\n          canvas.context().globalAlpha = thumbnailCanvas.context().globalAlpha = 1;\n        }\n      },\n      draw: function(point, options) {\n        var color, size, x, y;\n        if (options == null) {\n          options = {};\n        }\n        color = options.color, size = options.size;\n        if (color == null) {\n          color = self.activeColor();\n        }\n        if (size == null) {\n          size = 1;\n        }\n        x = point.x, y = point.y;\n        return self.withCanvasMods(function(canvas) {\n          if (color === \"transparent\") {\n            return canvas.clear({\n              x: x * size,\n              y: y * size,\n              width: size,\n              height: size\n            });\n          } else {\n            return canvas.drawRect({\n              x: x * size,\n              y: y * size,\n              width: size,\n              height: size,\n              color: color\n            });\n          }\n        });\n      },\n      color: function(index) {\n        return self.palette()[index]();\n      },\n      getColor: function(position) {\n        var data, x, y;\n        x = position.x, y = position.y;\n        data = canvas.context().getImageData(x, y, 1, 1).data;\n        return rgb2Hex(data[0], data[1], data[2]);\n      },\n      colorAsInt: function() {\n        var color;\n        color = self.activeColor();\n        color = color.substring(color.indexOf(\"#\") + 1);\n        if (color === \"transparent\") {\n          return 0;\n        } else {\n          if (LITTLE_ENDIAN) {\n            return parseInt(\"ff\" + color.slice(4, 6) + color.slice(2, 4) + color.slice(0, 2), 16);\n          } else {\n            return parseInt(\"\" + color + \"ff\");\n          }\n        }\n      },\n      palette: Observable(Palette.dawnBringer32.map(Observable)),\n      putImageData: function(imageData, x, y) {\n        if (x == null) {\n          x = 0;\n        }\n        if (y == null) {\n          y = 0;\n        }\n        return canvas.context().putImageData(imageData, x, y);\n      },\n      selection: function(rectangle) {\n        return {\n          each: function(iterator) {\n            return rectangle.each(function(x, y) {\n              var index;\n              index = self.getIndex(x, y);\n              return iterator(index, x, y);\n            });\n          }\n        };\n      },\n      thumbnailClick: function(e) {\n        return e.currentTarget.classList.toggle(\"right\");\n      }\n    });\n    self.activeColor = Observable(\"#000000\");\n    self.activeColorStyle = Observable(function() {\n      return \"background-color: \" + (self.activeColor());\n    });\n    self.canvas = canvas = TouchCanvas(pixelExtent());\n    self.previewCanvas = previewCanvas = TouchCanvas(pixelExtent());\n    self.thumbnailCanvas = thumbnailCanvas = TouchCanvas(pixelExtent());\n    previewCanvas.element().classList.add(\"preview\");\n    (function(ctx) {\n      ctx.imageSmoothingEnabled = false;\n      return ctx.mozImageSmoothingEnabled = false;\n    })(self.canvas.context());\n    self.TRANSPARENT_FILL = require(\"./lib/checker\")().pattern();\n    canvasPosition = function(position) {\n      return Point(position).scale(pixelExtent()).floor();\n    };\n    snapshot = null;\n    self.restore = function() {\n      if (snapshot) {\n        self.putImageData(snapshot);\n        return self.repaint();\n      }\n    };\n    previewCanvas.on(\"touch\", function(position) {\n      snapshot = self.getSnapshot();\n      return activeTool().touch({\n        position: canvasPosition(position),\n        editor: self\n      });\n    });\n    previewCanvas.on(\"move\", function(position) {\n      return activeTool().move({\n        position: canvasPosition(position),\n        editor: self\n      });\n    });\n    previewCanvas.on(\"release\", function(position) {\n      var size;\n      activeTool().release({\n        position: canvasPosition(position),\n        editor: self\n      });\n      size = pixelExtent();\n      diffSnapshot(snapshot, canvas.context().getImageData(0, 0, size.width, size.height));\n      return self.trigger(\"release\");\n    });\n    compareImageData = function(previous, current) {\n      var currentData, i, length, previousData, width, x, xMax, xMin, y, yMax, yMin;\n      if (!(previous && current)) {\n        return;\n      }\n      xMin = Infinity;\n      xMax = -Infinity;\n      yMin = Infinity;\n      yMax = -Infinity;\n      previousData = new Uint32Array(previous.data.buffer);\n      currentData = new Uint32Array(current.data.buffer);\n      length = currentData.length;\n      width = current.width;\n      i = 0;\n      while (i < length) {\n        x = i % width;\n        y = (i / width) | 0;\n        if (previousData[i] !== currentData[i]) {\n          if (x < xMin) {\n            xMin = x;\n          }\n          if (x > xMax) {\n            xMax = x;\n          }\n          if (y < yMin) {\n            yMin = y;\n          }\n          if (y > yMax) {\n            yMax = y;\n          }\n        }\n        i += 1;\n      }\n      if (xMin !== Infinity) {\n        return [xMin, yMin, xMax - xMin + 1, yMax - yMin + 1];\n      } else {\n        return null;\n      }\n    };\n    diffSnapshot = function(previous, current) {\n      var height, region, spareCanvas, spareContext, width, x, y;\n      region = compareImageData(previous, current);\n      if (region) {\n        x = region[0], y = region[1], width = region[2], height = region[3];\n        spareCanvas = document.createElement(\"canvas\");\n        spareCanvas.width = width;\n        spareCanvas.height = height;\n        spareContext = spareCanvas.getContext(\"2d\");\n        spareContext.putImageData(previous, -x, -y);\n        previous = spareContext.getImageData(0, 0, width, height);\n        spareContext.putImageData(current, -x, -y);\n        current = spareContext.getImageData(0, 0, width, height);\n        return self.execute(self.Command.PutImageData({\n          imageData: current,\n          imageDataPrevious: previous,\n          x: x,\n          y: y\n        }));\n      }\n    };\n    previewCanvas.element().addEventListener(\"mousemove\", function(_arg) {\n      var currentTarget, left, pageX, pageY, top, x, y, _ref1, _ref2;\n      currentTarget = _arg.currentTarget, pageX = _arg.pageX, pageY = _arg.pageY;\n      _ref1 = currentTarget.getBoundingClientRect(), left = _ref1.left, top = _ref1.top;\n      _ref2 = Point(pageX - left, pageY - top).scale(1 / pixelSize()).floor(), x = _ref2.x, y = _ref2.y;\n      return positionDisplay(\"\" + x + \",\" + y);\n    });\n    self.on(\"release\", function() {\n      previewCanvas.clear();\n      return self.trigger(\"change\");\n    });\n    [\"undo\", \"execute\", \"redo\"].forEach(function(method) {\n      var oldMethod;\n      oldMethod = self[method];\n      return self[method] = function() {\n        oldMethod.apply(self, arguments);\n        self.repaint();\n        return self.trigger(\"change\");\n      };\n    });\n    self.include(require(\"./dirty\"));\n    initialState = self.getSnapshot();\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "endianness": {
      "path": "endianness",
      "content": "(function() {\n  var buffer;\n\n  buffer = new ArrayBuffer(2);\n\n  new DataView(buffer).setInt16(0, 256, true);\n\n  module.exports = new Int16Array(buffer)[0] === 256;\n\n}).call(this);\n",
      "type": "blob"
    },
    "file_reading": {
      "path": "file_reading",
      "content": "(function() {\n  var detectType, normalizeNewlines;\n\n  detectType = function(file) {\n    if (file.type.match(/^image\\//)) {\n      return \"image\";\n    }\n    if (file.name.match(/\\.json$/)) {\n      return \"json\";\n    }\n    return \"text\";\n  };\n\n  normalizeNewlines = function(str) {\n    return str.replace(/\\r\\n/g, \"\\n\").replace(/\\r/g, \"\\n\");\n  };\n\n  module.exports = {\n    readerInput: function(_arg) {\n      var accept, chose, encoding, image, input, json, text;\n      chose = _arg.chose, encoding = _arg.encoding, image = _arg.image, json = _arg.json, text = _arg.text, accept = _arg.accept;\n      if (accept == null) {\n        accept = \"image/gif,image/png\";\n      }\n      if (encoding == null) {\n        encoding = \"UTF-8\";\n      }\n      input = document.createElement('input');\n      input.type = \"file\";\n      input.setAttribute(\"accept\", accept);\n      input.onchange = function() {\n        var file, reader;\n        reader = new FileReader();\n        file = input.files[0];\n        switch (detectType(file)) {\n          case \"image\":\n            if (typeof image === \"function\") {\n              image(URL.createObjectURL(file));\n            }\n            break;\n          case \"json\":\n            reader.onload = function(evt) {\n              return typeof json === \"function\" ? json(JSON.parse(evt.target.result)) : void 0;\n            };\n            reader.readAsText(file, encoding);\n            break;\n          case \"text\":\n            reader.onload = function(evt) {\n              return typeof text === \"function\" ? text(normalizeNewlines(evt.target.result)) : void 0;\n            };\n            reader.readAsText(file, encoding);\n        }\n        return chose(file);\n      };\n      return input;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/canvas-to-blob": {
      "path": "lib/canvas-to-blob",
      "content": "/* canvas-toBlob.js\n * A canvas.toBlob() implementation.\n * 2011-07-13\n *\n * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */\n\n(function(view) {\n\"use strict\";\nvar\n    Uint8Array = view.Uint8Array\n\t, HTMLCanvasElement = view.HTMLCanvasElement\n\t, is_base64_regex = /\\s*;\\s*base64\\s*(?:;|$)/i\n\t, base64_ranks\n\t, decode_base64 = function(base64) {\n\t\tvar\n\t\t\t  len = base64.length\n\t\t\t, buffer = new Uint8Array(len / 4 * 3 | 0)\n\t\t\t, i = 0\n\t\t\t, outptr = 0\n\t\t\t, last = [0, 0]\n\t\t\t, state = 0\n\t\t\t, save = 0\n\t\t\t, rank\n\t\t\t, code\n\t\t\t, undef\n\t\t;\n\t\twhile (len--) {\n\t\t\tcode = base64.charCodeAt(i++);\n\t\t\trank = base64_ranks[code-43];\n\t\t\tif (rank !== 255 && rank !== undef) {\n\t\t\t\tlast[1] = last[0];\n\t\t\t\tlast[0] = code;\n\t\t\t\tsave = (save << 6) | rank;\n\t\t\t\tstate++;\n\t\t\t\tif (state === 4) {\n\t\t\t\t\tbuffer[outptr++] = save >>> 16;\n\t\t\t\t\tif (last[1] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save >>> 8;\n\t\t\t\t\t}\n\t\t\t\t\tif (last[0] !== 61 /* padding character */) {\n\t\t\t\t\t\tbuffer[outptr++] = save;\n\t\t\t\t\t}\n\t\t\t\t\tstate = 0;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t// 2/3 chance there's going to be some null bytes at the end, but that\n\t\t// doesn't really matter with most image formats.\n\t\t// If it somehow matters for you, truncate the buffer up outptr.\n\t\treturn buffer;\n\t}\n;\nif (Uint8Array) {\n\tbase64_ranks = new Uint8Array([\n\t\t  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1\n\t\t, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9\n\t\t, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25\n\t\t, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35\n\t\t, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51\n\t]);\n}\nif (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {\n\tHTMLCanvasElement.prototype.toBlob = function(callback, type /*, ...args*/) {\n\t\t  if (!type) {\n\t\t\ttype = \"image/png\";\n\t\t} if (this.mozGetAsFile) {\n\t\t\tcallback(this.mozGetAsFile(\"canvas\", type));\n\t\t\treturn;\n\t\t}\n\t\tvar\n\t\t\t  args = Array.prototype.slice.call(arguments, 1)\n\t\t\t, dataURI = this.toDataURL.apply(this, args)\n\t\t\t, header_end = dataURI.indexOf(\",\")\n\t\t\t, data = dataURI.substring(header_end + 1)\n\t\t\t, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))\n\t\t\t, blob\n\t\t;\n\t\tif (Blob.fake) {\n\t\t\t// no reason to decode a data: URI that's just going to become a data URI again\n\t\t\tblob = new Blob\n\t\t\tif (is_base64) {\n\t\t\t\tblob.encoding = \"base64\";\n\t\t\t} else {\n\t\t\t\tblob.encoding = \"URI\";\n\t\t\t}\n\t\t\tblob.data = data;\n\t\t\tblob.size = data.length;\n\t\t} else if (Uint8Array) {\n\t\t\tif (is_base64) {\n\t\t\t\tblob = new Blob([decode_base64(data)], {type: type});\n\t\t\t} else {\n\t\t\t\tblob = new Blob([decodeURIComponent(data)], {type: type});\n\t\t\t}\n\t\t}\n\t\tcallback(blob);\n\t};\n}\n}(self));\n",
      "type": "blob"
    },
    "lib/checker": {
      "path": "lib/checker",
      "content": "(function() {\n  module.exports = function(_arg) {\n    var canvas, canvasHeight, canvasWidth, colors, context, size, _ref;\n    _ref = _arg != null ? _arg : {}, colors = _ref.colors, size = _ref.size;\n    if (colors == null) {\n      colors = [\"white\", \"#CCCCCC\"];\n    }\n    if (size == null) {\n      size = 8;\n    }\n    canvasWidth = 2 * size;\n    canvasHeight = 2 * size;\n    canvas = document.createElement(\"canvas\");\n    canvas.width = canvasWidth;\n    canvas.height = canvasHeight;\n    context = canvas.getContext(\"2d\");\n    context.fillStyle = colors[0];\n    context.fillRect(0, 0, size, size);\n    context.fillRect(size, size, size, size);\n    context.fillStyle = colors[1];\n    context.fillRect(0, size, size, size);\n    context.fillRect(size, 0, size, size);\n    return {\n      pattern: function(repeat) {\n        if (repeat == null) {\n          repeat = \"repeat\";\n        }\n        return context.createPattern(canvas, repeat);\n      },\n      backgroundImage: function() {\n        return \"url(\" + (this.toDataURL()) + \")\";\n      },\n      toDataURL: function() {\n        return canvas.toDataURL(\"image/png\");\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/file_saver": {
      "path": "lib/file_saver",
      "content": "/* FileSaver.js\n * A saveAs() FileSaver implementation.\n * 2013-10-21\n *\n * By Eli Grey, http://eligrey.com\n * License: X11/MIT\n *   See LICENSE.md\n */\n\n/*global self */\n/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,\n  plusplus: true */\n\n/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */\n\nvar saveAs = saveAs\n  || (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))\n  || (function(view) {\n  \"use strict\";\n\tvar\n\t\t  doc = view.document\n\t\t  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet\n\t\t, get_URL = function() {\n\t\t\treturn view.URL || view.webkitURL || view;\n\t\t}\n\t\t, URL = view.URL || view.webkitURL || view\n\t\t, save_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\")\n\t\t, can_use_save_link =  !view.externalHost && \"download\" in save_link\n\t\t, click = function(node) {\n\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\tevent.initMouseEvent(\n\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t, false, false, false, false, 0, null\n\t\t\t);\n\t\t\tnode.dispatchEvent(event);\n\t\t}\n\t\t, webkit_req_fs = view.webkitRequestFileSystem\n\t\t, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem\n\t\t, throw_outside = function (ex) {\n\t\t\t(view.setImmediate || view.setTimeout)(function() {\n\t\t\t\tthrow ex;\n\t\t\t}, 0);\n\t\t}\n\t\t, force_saveable_type = \"application/octet-stream\"\n\t\t, fs_min_size = 0\n\t\t, deletion_queue = []\n\t\t, process_deletion_queue = function() {\n\t\t\tvar i = deletion_queue.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar file = deletion_queue[i];\n\t\t\t\tif (typeof file === \"string\") { // file is an object URL\n\t\t\t\t\tURL.revokeObjectURL(file);\n\t\t\t\t} else { // file is a File\n\t\t\t\t\tfile.remove();\n\t\t\t\t}\n\t\t\t}\n\t\t\tdeletion_queue.length = 0; // clear queue\n\t\t}\n\t\t, dispatch = function(filesaver, event_types, event) {\n\t\t\tevent_types = [].concat(event_types);\n\t\t\tvar i = event_types.length;\n\t\t\twhile (i--) {\n\t\t\t\tvar listener = filesaver[\"on\" + event_types[i]];\n\t\t\t\tif (typeof listener === \"function\") {\n\t\t\t\t\ttry {\n\t\t\t\t\t\tlistener.call(filesaver, event || filesaver);\n\t\t\t\t\t} catch (ex) {\n\t\t\t\t\t\tthrow_outside(ex);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t, FileSaver = function(blob, name) {\n\t\t\t// First try a.download, then web filesystem, then object URLs\n\t\t\tvar\n\t\t\t\t  filesaver = this\n\t\t\t\t, type = blob.type\n\t\t\t\t, blob_changed = false\n\t\t\t\t, object_url\n\t\t\t\t, target_view\n\t\t\t\t, get_object_url = function() {\n\t\t\t\t\tvar object_url = get_URL().createObjectURL(blob);\n\t\t\t\t\tdeletion_queue.push(object_url);\n\t\t\t\t\treturn object_url;\n\t\t\t\t}\n\t\t\t\t, dispatch_all = function() {\n\t\t\t\t\tdispatch(filesaver, \"writestart progress write writeend\".split(\" \"));\n\t\t\t\t}\n\t\t\t\t// on any filesys errors revert to saving with object URLs\n\t\t\t\t, fs_error = function() {\n\t\t\t\t\t// don't create more object URLs than needed\n\t\t\t\t\tif (blob_changed || !object_url) {\n\t\t\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t\t}\n\t\t\t\t\tif (target_view) {\n\t\t\t\t\t\ttarget_view.location.href = object_url;\n\t\t\t\t\t} else {\n                        window.open(object_url, \"_blank\");\n                    }\n\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\tdispatch_all();\n\t\t\t\t}\n\t\t\t\t, abortable = function(func) {\n\t\t\t\t\treturn function() {\n\t\t\t\t\t\tif (filesaver.readyState !== filesaver.DONE) {\n\t\t\t\t\t\t\treturn func.apply(this, arguments);\n\t\t\t\t\t\t}\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t\t, create_if_not_found = {create: true, exclusive: false}\n\t\t\t\t, slice\n\t\t\t;\n\t\t\tfilesaver.readyState = filesaver.INIT;\n\t\t\tif (!name) {\n\t\t\t\tname = \"download\";\n\t\t\t}\n\t\t\tif (can_use_save_link) {\n\t\t\t\tobject_url = get_object_url(blob);\n\t\t\t\t// FF for Android has a nasty garbage collection mechanism\n\t\t\t\t// that turns all objects that are not pure javascript into 'deadObject'\n\t\t\t\t// this means `doc` and `save_link` are unusable and need to be recreated\n\t\t\t\t// `view` is usable though:\n\t\t\t\tdoc = view.document;\n\t\t\t\tsave_link = doc.createElementNS(\"http://www.w3.org/1999/xhtml\", \"a\");\n\t\t\t\tsave_link.href = object_url;\n\t\t\t\tsave_link.download = name;\n\t\t\t\tvar event = doc.createEvent(\"MouseEvents\");\n\t\t\t\tevent.initMouseEvent(\n\t\t\t\t\t\"click\", true, false, view, 0, 0, 0, 0, 0\n\t\t\t\t\t, false, false, false, false, 0, null\n\t\t\t\t);\n\t\t\t\tsave_link.dispatchEvent(event);\n\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\tdispatch_all();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\t// Object and web filesystem URLs have a problem saving in Google Chrome when\n\t\t\t// viewed in a tab, so I force save with application/octet-stream\n\t\t\t// http://code.google.com/p/chromium/issues/detail?id=91158\n\t\t\tif (view.chrome && type && type !== force_saveable_type) {\n\t\t\t\tslice = blob.slice || blob.webkitSlice;\n\t\t\t\tblob = slice.call(blob, 0, blob.size, force_saveable_type);\n\t\t\t\tblob_changed = true;\n\t\t\t}\n\t\t\t// Since I can't be sure that the guessed media type will trigger a download\n\t\t\t// in WebKit, I append .download to the filename.\n\t\t\t// https://bugs.webkit.org/show_bug.cgi?id=65440\n\t\t\tif (webkit_req_fs && name !== \"download\") {\n\t\t\t\tname += \".download\";\n\t\t\t}\n\t\t\tif (type === force_saveable_type || webkit_req_fs) {\n\t\t\t\ttarget_view = view;\n\t\t\t}\n\t\t\tif (!req_fs) {\n\t\t\t\tfs_error();\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tfs_min_size += blob.size;\n\t\t\treq_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {\n\t\t\t\tfs.root.getDirectory(\"saved\", create_if_not_found, abortable(function(dir) {\n\t\t\t\t\tvar save = function() {\n\t\t\t\t\t\tdir.getFile(name, create_if_not_found, abortable(function(file) {\n\t\t\t\t\t\t\tfile.createWriter(abortable(function(writer) {\n\t\t\t\t\t\t\t\twriter.onwriteend = function(event) {\n\t\t\t\t\t\t\t\t\ttarget_view.location.href = file.toURL();\n\t\t\t\t\t\t\t\t\tdeletion_queue.push(file);\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t\tdispatch(filesaver, \"writeend\", event);\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\twriter.onerror = function() {\n\t\t\t\t\t\t\t\t\tvar error = writer.error;\n\t\t\t\t\t\t\t\t\tif (error.code !== error.ABORT_ERR) {\n\t\t\t\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\t\"writestart progress write abort\".split(\" \").forEach(function(event) {\n\t\t\t\t\t\t\t\t\twriter[\"on\" + event] = filesaver[\"on\" + event];\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t\twriter.write(blob);\n\t\t\t\t\t\t\t\tfilesaver.abort = function() {\n\t\t\t\t\t\t\t\t\twriter.abort();\n\t\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.DONE;\n\t\t\t\t\t\t\t\t};\n\t\t\t\t\t\t\t\tfilesaver.readyState = filesaver.WRITING;\n\t\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t\t}), fs_error);\n\t\t\t\t\t};\n\t\t\t\t\tdir.getFile(name, {create: false}, abortable(function(file) {\n\t\t\t\t\t\t// delete file if it already exists\n\t\t\t\t\t\tfile.remove();\n\t\t\t\t\t\tsave();\n\t\t\t\t\t}), abortable(function(ex) {\n\t\t\t\t\t\tif (ex.code === ex.NOT_FOUND_ERR) {\n\t\t\t\t\t\t\tsave();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tfs_error();\n\t\t\t\t\t\t}\n\t\t\t\t\t}));\n\t\t\t\t}), fs_error);\n\t\t\t}), fs_error);\n\t\t}\n\t\t, FS_proto = FileSaver.prototype\n\t\t, saveAs = function(blob, name) {\n\t\t\treturn new FileSaver(blob, name);\n\t\t}\n\t;\n\tFS_proto.abort = function() {\n\t\tvar filesaver = this;\n\t\tfilesaver.readyState = filesaver.DONE;\n\t\tdispatch(filesaver, \"abort\");\n\t};\n\tFS_proto.readyState = FS_proto.INIT = 0;\n\tFS_proto.WRITING = 1;\n\tFS_proto.DONE = 2;\n\n\tFS_proto.error =\n\tFS_proto.onwritestart =\n\tFS_proto.onprogress =\n\tFS_proto.onwrite =\n\tFS_proto.onabort =\n\tFS_proto.onerror =\n\tFS_proto.onwriteend =\n\t\tnull;\n\n\tview.addEventListener(\"unload\", process_deletion_queue, false);\n\treturn saveAs;\n}(window));\n\nif (typeof module !== 'undefined') module.exports = saveAs;\n",
      "type": "blob"
    },
    "lib/lz-string": {
      "path": "lib/lz-string",
      "content": "// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>\n// This work is free. You can redistribute it and/or modify it\n// under the terms of the WTFPL, Version 2\n// For more information see LICENSE.txt or http://www.wtfpl.net/\n//\n// For more information, the home page:\n// http://pieroxy.net/blog/pages/lz-string/testing.html\n//\n// LZ-based compression algorithm, version 1.4.4\nvar LZString = (function() {\n\n// private property\nvar f = String.fromCharCode;\nvar keyStrBase64 = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\";\nvar keyStrUriSafe = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$\";\nvar baseReverseDic = {};\n\nfunction getBaseValue(alphabet, character) {\n  if (!baseReverseDic[alphabet]) {\n    baseReverseDic[alphabet] = {};\n    for (var i=0 ; i<alphabet.length ; i++) {\n      baseReverseDic[alphabet][alphabet.charAt(i)] = i;\n    }\n  }\n  return baseReverseDic[alphabet][character];\n}\n\nvar LZString = {\n  compressToBase64 : function (input) {\n    if (input == null) return \"\";\n    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});\n    switch (res.length % 4) { // To produce valid Base64\n    default: // When could this happen ?\n    case 0 : return res;\n    case 1 : return res+\"===\";\n    case 2 : return res+\"==\";\n    case 3 : return res+\"=\";\n    }\n  },\n\n  decompressFromBase64 : function (input) {\n    if (input == null) return \"\";\n    if (input == \"\") return null;\n    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });\n  },\n\n  compressToUTF16 : function (input) {\n    if (input == null) return \"\";\n    return LZString._compress(input, 15, function(a){return f(a+32);}) + \" \";\n  },\n\n  decompressFromUTF16: function (compressed) {\n    if (compressed == null) return \"\";\n    if (compressed == \"\") return null;\n    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });\n  },\n\n  //compress into uint8array (UCS-2 big endian format)\n  compressToUint8Array: function (uncompressed) {\n    var compressed = LZString.compress(uncompressed);\n    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character\n\n    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {\n      var current_value = compressed.charCodeAt(i);\n      buf[i*2] = current_value >>> 8;\n      buf[i*2+1] = current_value % 256;\n    }\n    return buf;\n  },\n\n  //decompress from uint8array (UCS-2 big endian format)\n  decompressFromUint8Array:function (compressed) {\n    if (compressed===null || compressed===undefined){\n        return LZString.decompress(compressed);\n    } else {\n        var buf=new Array(compressed.length/2); // 2 bytes per character\n        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {\n          buf[i]=compressed[i*2]*256+compressed[i*2+1];\n        }\n\n        var result = [];\n        buf.forEach(function (c) {\n          result.push(f(c));\n        });\n        return LZString.decompress(result.join(''));\n\n    }\n\n  },\n\n\n  //compress into a string that is already URI encoded\n  compressToEncodedURIComponent: function (input) {\n    if (input == null) return \"\";\n    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});\n  },\n\n  //decompress from an output of compressToEncodedURIComponent\n  decompressFromEncodedURIComponent:function (input) {\n    if (input == null) return \"\";\n    if (input == \"\") return null;\n    input = input.replace(/ /g, \"+\");\n    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });\n  },\n\n  compress: function (uncompressed) {\n    return LZString._compress(uncompressed, 16, function(a){return f(a);});\n  },\n  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {\n    if (uncompressed == null) return \"\";\n    var i, value,\n        context_dictionary= {},\n        context_dictionaryToCreate= {},\n        context_c=\"\",\n        context_wc=\"\",\n        context_w=\"\",\n        context_enlargeIn= 2, // Compensate for the first entry which should not count\n        context_dictSize= 3,\n        context_numBits= 2,\n        context_data=[],\n        context_data_val=0,\n        context_data_position=0,\n        ii;\n\n    for (ii = 0; ii < uncompressed.length; ii += 1) {\n      context_c = uncompressed.charAt(ii);\n      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {\n        context_dictionary[context_c] = context_dictSize++;\n        context_dictionaryToCreate[context_c] = true;\n      }\n\n      context_wc = context_w + context_c;\n      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {\n        context_w = context_wc;\n      } else {\n        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {\n          if (context_w.charCodeAt(0)<256) {\n            for (i=0 ; i<context_numBits ; i++) {\n              context_data_val = (context_data_val << 1);\n              if (context_data_position == bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n            }\n            value = context_w.charCodeAt(0);\n            for (i=0 ; i<8 ; i++) {\n              context_data_val = (context_data_val << 1) | (value&1);\n              if (context_data_position == bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n              value = value >> 1;\n            }\n          } else {\n            value = 1;\n            for (i=0 ; i<context_numBits ; i++) {\n              context_data_val = (context_data_val << 1) | value;\n              if (context_data_position ==bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n              value = 0;\n            }\n            value = context_w.charCodeAt(0);\n            for (i=0 ; i<16 ; i++) {\n              context_data_val = (context_data_val << 1) | (value&1);\n              if (context_data_position == bitsPerChar-1) {\n                context_data_position = 0;\n                context_data.push(getCharFromInt(context_data_val));\n                context_data_val = 0;\n              } else {\n                context_data_position++;\n              }\n              value = value >> 1;\n            }\n          }\n          context_enlargeIn--;\n          if (context_enlargeIn == 0) {\n            context_enlargeIn = Math.pow(2, context_numBits);\n            context_numBits++;\n          }\n          delete context_dictionaryToCreate[context_w];\n        } else {\n          value = context_dictionary[context_w];\n          for (i=0 ; i<context_numBits ; i++) {\n            context_data_val = (context_data_val << 1) | (value&1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = value >> 1;\n          }\n\n\n        }\n        context_enlargeIn--;\n        if (context_enlargeIn == 0) {\n          context_enlargeIn = Math.pow(2, context_numBits);\n          context_numBits++;\n        }\n        // Add wc to the dictionary.\n        context_dictionary[context_wc] = context_dictSize++;\n        context_w = String(context_c);\n      }\n    }\n\n    // Output the code for w.\n    if (context_w !== \"\") {\n      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {\n        if (context_w.charCodeAt(0)<256) {\n          for (i=0 ; i<context_numBits ; i++) {\n            context_data_val = (context_data_val << 1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n          }\n          value = context_w.charCodeAt(0);\n          for (i=0 ; i<8 ; i++) {\n            context_data_val = (context_data_val << 1) | (value&1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = value >> 1;\n          }\n        } else {\n          value = 1;\n          for (i=0 ; i<context_numBits ; i++) {\n            context_data_val = (context_data_val << 1) | value;\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = 0;\n          }\n          value = context_w.charCodeAt(0);\n          for (i=0 ; i<16 ; i++) {\n            context_data_val = (context_data_val << 1) | (value&1);\n            if (context_data_position == bitsPerChar-1) {\n              context_data_position = 0;\n              context_data.push(getCharFromInt(context_data_val));\n              context_data_val = 0;\n            } else {\n              context_data_position++;\n            }\n            value = value >> 1;\n          }\n        }\n        context_enlargeIn--;\n        if (context_enlargeIn == 0) {\n          context_enlargeIn = Math.pow(2, context_numBits);\n          context_numBits++;\n        }\n        delete context_dictionaryToCreate[context_w];\n      } else {\n        value = context_dictionary[context_w];\n        for (i=0 ; i<context_numBits ; i++) {\n          context_data_val = (context_data_val << 1) | (value&1);\n          if (context_data_position == bitsPerChar-1) {\n            context_data_position = 0;\n            context_data.push(getCharFromInt(context_data_val));\n            context_data_val = 0;\n          } else {\n            context_data_position++;\n          }\n          value = value >> 1;\n        }\n\n\n      }\n      context_enlargeIn--;\n      if (context_enlargeIn == 0) {\n        context_enlargeIn = Math.pow(2, context_numBits);\n        context_numBits++;\n      }\n    }\n\n    // Mark the end of the stream\n    value = 2;\n    for (i=0 ; i<context_numBits ; i++) {\n      context_data_val = (context_data_val << 1) | (value&1);\n      if (context_data_position == bitsPerChar-1) {\n        context_data_position = 0;\n        context_data.push(getCharFromInt(context_data_val));\n        context_data_val = 0;\n      } else {\n        context_data_position++;\n      }\n      value = value >> 1;\n    }\n\n    // Flush the last char\n    while (true) {\n      context_data_val = (context_data_val << 1);\n      if (context_data_position == bitsPerChar-1) {\n        context_data.push(getCharFromInt(context_data_val));\n        break;\n      }\n      else context_data_position++;\n    }\n    return context_data.join('');\n  },\n\n  decompress: function (compressed) {\n    if (compressed == null) return \"\";\n    if (compressed == \"\") return null;\n    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });\n  },\n\n  _decompress: function (length, resetValue, getNextValue) {\n    var dictionary = [],\n        next,\n        enlargeIn = 4,\n        dictSize = 4,\n        numBits = 3,\n        entry = \"\",\n        result = [],\n        i,\n        w,\n        bits, resb, maxpower, power,\n        c,\n        data = {val:getNextValue(0), position:resetValue, index:1};\n\n    for (i = 0; i < 3; i += 1) {\n      dictionary[i] = i;\n    }\n\n    bits = 0;\n    maxpower = Math.pow(2,2);\n    power=1;\n    while (power!=maxpower) {\n      resb = data.val & data.position;\n      data.position >>= 1;\n      if (data.position == 0) {\n        data.position = resetValue;\n        data.val = getNextValue(data.index++);\n      }\n      bits |= (resb>0 ? 1 : 0) * power;\n      power <<= 1;\n    }\n\n    switch (next = bits) {\n      case 0:\n          bits = 0;\n          maxpower = Math.pow(2,8);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n        c = f(bits);\n        break;\n      case 1:\n          bits = 0;\n          maxpower = Math.pow(2,16);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n        c = f(bits);\n        break;\n      case 2:\n        return \"\";\n    }\n    dictionary[3] = c;\n    w = c;\n    result.push(c);\n    while (true) {\n      if (data.index > length) {\n        return \"\";\n      }\n\n      bits = 0;\n      maxpower = Math.pow(2,numBits);\n      power=1;\n      while (power!=maxpower) {\n        resb = data.val & data.position;\n        data.position >>= 1;\n        if (data.position == 0) {\n          data.position = resetValue;\n          data.val = getNextValue(data.index++);\n        }\n        bits |= (resb>0 ? 1 : 0) * power;\n        power <<= 1;\n      }\n\n      switch (c = bits) {\n        case 0:\n          bits = 0;\n          maxpower = Math.pow(2,8);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n\n          dictionary[dictSize++] = f(bits);\n          c = dictSize-1;\n          enlargeIn--;\n          break;\n        case 1:\n          bits = 0;\n          maxpower = Math.pow(2,16);\n          power=1;\n          while (power!=maxpower) {\n            resb = data.val & data.position;\n            data.position >>= 1;\n            if (data.position == 0) {\n              data.position = resetValue;\n              data.val = getNextValue(data.index++);\n            }\n            bits |= (resb>0 ? 1 : 0) * power;\n            power <<= 1;\n          }\n          dictionary[dictSize++] = f(bits);\n          c = dictSize-1;\n          enlargeIn--;\n          break;\n        case 2:\n          return result.join('');\n      }\n\n      if (enlargeIn == 0) {\n        enlargeIn = Math.pow(2, numBits);\n        numBits++;\n      }\n\n      if (dictionary[c]) {\n        entry = dictionary[c];\n      } else {\n        if (c === dictSize) {\n          entry = w + w.charAt(0);\n        } else {\n          return null;\n        }\n      }\n      result.push(entry);\n\n      // Add w+entry[0] to the dictionary.\n      dictionary[dictSize++] = w + entry.charAt(0);\n      enlargeIn--;\n\n      w = entry;\n\n      if (enlargeIn == 0) {\n        enlargeIn = Math.pow(2, numBits);\n        numBits++;\n      }\n\n    }\n  }\n};\n  return LZString;\n})();\n\nif (typeof define === 'function' && define.amd) {\n  define(function () { return LZString; });\n} else if( typeof module !== 'undefined' && module != null ) {\n  module.exports = LZString\n}\n",
      "type": "blob"
    },
    "lib/mousetrap": {
      "path": "lib/mousetrap",
      "content": "/* mousetrap v1.5.3 craig.is/killing/mice */\n(function(C,r,g){function t(a,b,h){a.addEventListener?a.addEventListener(b,h,!1):a.attachEvent(\"on\"+b,h)}function x(a){if(\"keypress\"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return l[a.which]?l[a.which]:p[a.which]?p[a.which]:String.fromCharCode(a.which).toLowerCase()}function D(a){var b=[];a.shiftKey&&b.push(\"shift\");a.altKey&&b.push(\"alt\");a.ctrlKey&&b.push(\"ctrl\");a.metaKey&&b.push(\"meta\");return b}function u(a){return\"shift\"==a||\"ctrl\"==a||\"alt\"==a||\n\"meta\"==a}function y(a,b){var h,c,e,g=[];h=a;\"+\"===h?h=[\"+\"]:(h=h.replace(/\\+{2}/g,\"+plus\"),h=h.split(\"+\"));for(e=0;e<h.length;++e)c=h[e],z[c]&&(c=z[c]),b&&\"keypress\"!=b&&A[c]&&(c=A[c],g.push(\"shift\")),u(c)&&g.push(c);h=c;e=b;if(!e){if(!k){k={};for(var m in l)95<m&&112>m||l.hasOwnProperty(m)&&(k[l[m]]=m)}e=k[h]?\"keydown\":\"keypress\"}\"keypress\"==e&&g.length&&(e=\"keydown\");return{key:c,modifiers:g,action:e}}function B(a,b){return null===a||a===r?!1:a===b?!0:B(a.parentNode,b)}function c(a){function b(a){a=\na||{};var b=!1,n;for(n in q)a[n]?b=!0:q[n]=0;b||(v=!1)}function h(a,b,n,f,c,h){var g,e,l=[],m=n.type;if(!d._callbacks[a])return[];\"keyup\"==m&&u(a)&&(b=[a]);for(g=0;g<d._callbacks[a].length;++g)if(e=d._callbacks[a][g],(f||!e.seq||q[e.seq]==e.level)&&m==e.action){var k;(k=\"keypress\"==m&&!n.metaKey&&!n.ctrlKey)||(k=e.modifiers,k=b.sort().join(\",\")===k.sort().join(\",\"));k&&(k=f&&e.seq==f&&e.level==h,(!f&&e.combo==c||k)&&d._callbacks[a].splice(g,1),l.push(e))}return l}function g(a,b,n,f){d.stopCallback(b,\nb.target||b.srcElement,n,f)||!1!==a(b,n)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){\"number\"!==typeof a.which&&(a.which=a.keyCode);var b=x(a);b&&(\"keyup\"==a.type&&w===b?w=!1:d.handleKey(b,D(a),a))}function l(a,c,n,f){function e(c){return function(){v=c;++q[a];clearTimeout(k);k=setTimeout(b,1E3)}}function h(c){g(n,c,a);\"keyup\"!==f&&(w=x(c));setTimeout(b,10)}for(var d=q[a]=0;d<c.length;++d){var p=d+1===c.length?h:e(f||\ny(c[d+1]).action);m(c[d],p,f,a,d)}}function m(a,b,c,f,e){d._directMap[a+\":\"+c]=b;a=a.replace(/\\s+/g,\" \");var g=a.split(\" \");1<g.length?l(a,g,b,c):(c=y(a,c),d._callbacks[c.key]=d._callbacks[c.key]||[],h(c.key,c.modifiers,{type:c.action},f,a,e),d._callbacks[c.key][f?\"unshift\":\"push\"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:e,combo:a}))}var d=this;a=a||r;if(!(d instanceof c))return new c(a);d.target=a;d._callbacks={};d._directMap={};var q={},k,w=!1,p=!1,v=!1;d._handleKey=function(a,\nc,e){var f=h(a,c,e),d;c={};var k=0,l=!1;for(d=0;d<f.length;++d)f[d].seq&&(k=Math.max(k,f[d].level));for(d=0;d<f.length;++d)f[d].seq?f[d].level==k&&(l=!0,c[f[d].seq]=1,g(f[d].callback,e,f[d].combo,f[d].seq)):l||g(f[d].callback,e,f[d].combo);f=\"keypress\"==e.type&&p;e.type!=v||u(a)||f||b(c);p=l&&\"keydown\"==e.type};d._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)m(a[d],b,c)};t(a,\"keypress\",e);t(a,\"keydown\",e);t(a,\"keyup\",e)}var l={8:\"backspace\",9:\"tab\",13:\"enter\",16:\"shift\",17:\"ctrl\",18:\"alt\",\n20:\"capslock\",27:\"esc\",32:\"space\",33:\"pageup\",34:\"pagedown\",35:\"end\",36:\"home\",37:\"left\",38:\"up\",39:\"right\",40:\"down\",45:\"ins\",46:\"del\",91:\"meta\",93:\"meta\",224:\"meta\"},p={106:\"*\",107:\"+\",109:\"-\",110:\".\",111:\"/\",186:\";\",187:\"=\",188:\",\",189:\"-\",190:\".\",191:\"/\",192:\"`\",219:\"[\",220:\"\\\\\",221:\"]\",222:\"'\"},A={\"~\":\"`\",\"!\":\"1\",\"@\":\"2\",\"#\":\"3\",$:\"4\",\"%\":\"5\",\"^\":\"6\",\"&\":\"7\",\"*\":\"8\",\"(\":\"9\",\")\":\"0\",_:\"-\",\"+\":\"=\",\":\":\";\",'\"':\"'\",\"<\":\",\",\">\":\".\",\"?\":\"/\",\"|\":\"\\\\\"},z={option:\"alt\",command:\"meta\",\"return\":\"enter\",\nescape:\"esc\",plus:\"+\",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?\"meta\":\"ctrl\"},k;for(g=1;20>g;++g)l[111+g]=\"f\"+g;for(g=0;9>=g;++g)l[g+96]=g;c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+\":\"+b])this._directMap[a+\":\"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};this._directMap=\n{};return this};c.prototype.stopCallback=function(a,b){return-1<(\" \"+b.className+\" \").indexOf(\" mousetrap \")||B(b,this.target)?!1:\"INPUT\"==b.tagName||\"SELECT\"==b.tagName||\"TEXTAREA\"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.init=function(){var a=c(r),b;for(b in a)\"_\"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};c.init();C.Mousetrap=c;\"undefined\"!==typeof module&&module.exports&&(module.exports=\nc);\"function\"===typeof define&&define.amd&&define(function(){return c})})(window,document);\n",
      "type": "blob"
    },
    "lib/rectangle": {
      "path": "lib/rectangle",
      "content": "(function() {\n  var Rectangle, abs, min;\n\n  abs = Math.abs, min = Math.min;\n\n  module.exports = Rectangle = function(position, size) {\n    var _ref;\n    if ((position != null ? position.size : void 0) != null) {\n      _ref = position, position = _ref.position, size = _ref.size;\n    }\n    return {\n      position: Point(position),\n      size: Size(size),\n      __proto__: Rectangle.prototype\n    };\n  };\n\n  Rectangle.prototype = {\n    each: function(iterator) {\n      var p;\n      p = this.position;\n      return this.size.each(function(x, y) {\n        return iterator(p.x + x, p.y + y);\n      });\n    }\n  };\n\n  Rectangle.fromPoints = function(start, end) {\n    return Rectangle(Point(min(start.x, end.x), min(start.y, end.y)), Size(abs(end.x - start.x), abs(end.y - start.y)));\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "loader": {
      "path": "loader",
      "content": "(function() {\n  var Loader;\n\n  Loader = function() {\n    return {\n      load: function(url) {\n        return new Promise(function(resolve, reject) {\n          var canvas, context, image;\n          canvas = document.createElement('canvas');\n          context = canvas.getContext('2d');\n          image = document.createElement(\"img\");\n          image.crossOrigin = true;\n          image.onload = function() {\n            var height, imageData, width;\n            width = image.width, height = image.height;\n            canvas.width = width;\n            canvas.height = height;\n            context.drawImage(image, 0, 0);\n            imageData = context.getImageData(0, 0, width, height);\n            return resolve(imageData);\n          };\n          image.onerror = function() {\n            return reject(new Error(\"Error loading image data\"));\n          };\n          return image.src = url;\n        });\n      }\n    };\n  };\n\n  module.exports = Loader;\n\n}).call(this);\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Editor, Template, editorElement, runtime, updateViewportCentering;\n\n  global.PACKAGE = PACKAGE;\n\n  global.require = require;\n\n  require(\"analytics\").init(\"UA-3464282-15\");\n\n  require(\"./lib/canvas-to-blob\");\n\n  runtime = require(\"runtime\")(PACKAGE);\n\n  runtime.boot();\n\n  runtime.applyStyleSheet(require('./style'));\n\n  Editor = require(\"./editor\");\n\n  global.editor = Editor();\n\n  editor.notify(\"Welcome to PixiPaint!\");\n\n  Template = require(\"./templates/editor\");\n\n  editorElement = Template(editor);\n\n  document.body.appendChild(editorElement);\n\n  updateViewportCentering = function() {\n    var mainHeight;\n    mainHeight = editorElement.querySelector(\".main\").getBoundingClientRect().height;\n    return editor.mainHeight(mainHeight);\n  };\n\n  window.addEventListener(\"resize\", updateViewportCentering);\n\n  updateViewportCentering();\n\n}).call(this);\n",
      "type": "blob"
    },
    "modal": {
      "path": "modal",
      "content": "(function() {\n  var Modal, empty, modal;\n\n  modal = document.createElement(\"div\");\n\n  modal.id = \"modal\";\n\n  modal.onclick = function(e) {\n    console.log(e);\n    if (e.target === modal) {\n      return Modal.hide();\n    }\n  };\n\n  document.body.appendChild(modal);\n\n  module.exports = Modal = {\n    show: function(element) {\n      empty(modal).appendChild(element);\n      return modal.classList.add(\"active\");\n    },\n    hide: function() {\n      return modal.classList.remove(\"active\");\n    }\n  };\n\n  empty = function(node) {\n    while (node.hasChildNodes()) {\n      node.removeChild(node.lastChild);\n    }\n    return node;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "notifications": {
      "path": "notifications",
      "content": "(function() {\n  module.exports = function(I, self) {\n    var duration;\n    if (I == null) {\n      I = {};\n    }\n    duration = 5000;\n    self.extend({\n      notifications: Observable([]),\n      notify: function(message) {\n        self.notifications.push(message);\n        return setTimeout(function() {\n          return self.notifications.remove(message);\n        }, duration);\n      }\n    });\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "palette": {
      "path": "palette",
      "content": "(function() {\n  var JASC_HEADER, JASC_REGEX, Palette, TRANSPARENT, colorToRGB, exportJASC, fromStrings, loadJASC, numberToHex;\n\n  JASC_HEADER = \"JASC-PAL\\n0100\\n256\";\n\n  JASC_REGEX = /JASC-PAL\\n\\d+\\n\\d+\\n/;\n\n  fromStrings = function(lines) {\n    return lines.split(\"\\n\").map(function(line) {\n      return \"#\" + line.split(\" \").map(function(string) {\n        return numberToHex(parseInt(string, 10));\n      }).join(\"\");\n    });\n  };\n\n  numberToHex = function(n) {\n    return (\"0\" + (n.toString(0x10))).slice(-2).toUpperCase();\n  };\n\n  TRANSPARENT = [0xff, 0, 0xff];\n\n  colorToRGB = function(colorString) {\n    if (colorString === \"transparent\") {\n      return TRANSPARENT;\n    } else {\n      return colorString.match(/([0-9A-F]{2})/g).map(function(part) {\n        return parseInt(part, 0x10);\n      });\n    }\n  };\n\n  loadJASC = function(lines) {\n    var colors;\n    if (lines.match(JASC_REGEX)) {\n      colors = fromStrings(lines.replace(JASC_REGEX, \"\")).unique();\n      if (colors.length > 32) {\n        console.warn(\"Dropped excess colors (\" + (colors.length - 32) + \"), kept first 32\");\n        return colors.slice(0, 32);\n      } else {\n        return colors;\n      }\n    } else {\n      return alert(\"unknown file format, currently only support JASC PAL\");\n    }\n  };\n\n  exportJASC = function(array) {\n    var entries, padding, zeroes, _i, _results;\n    entries = array.map(function(entry) {\n      return colorToRGB(entry).join(\" \");\n    }).join(\"\\n\");\n    padding = Math.max(0, 256 - array.length);\n    zeroes = (function() {\n      _results = [];\n      for (var _i = 0; 0 <= padding ? _i < padding : _i > padding; 0 <= padding ? _i++ : _i--){ _results.push(_i); }\n      return _results;\n    }).apply(this).map(function() {\n      return \"0 0 0\";\n    }).join(\"\\n\");\n    return \"\" + JASC_HEADER + \"\\n\" + entries + \"\\n\" + zeroes;\n  };\n\n  Palette = {\n    defaults: [\"transparent\", \"#05050D\", \"#666666\", \"#DCDCDC\", \"#FFFFFF\", \"#EB070E\", \"#F69508\", \"#FFDE49\", \"#388326\", \"#0246E3\", \"#563495\", \"#58C4F5\", \"#F82481\", \"#E5AC99\", \"#5B4635\", \"#FFFEE9\"],\n    dawnBringer16: fromStrings(\"20 12 28\\n68 36 52\\n48 52 109\\n78 74 78\\n133 76 48\\n52 101 36\\n208 70 72\\n117 113 97\\n89 125 206\\n210 125 44\\n133 149 161\\n109 170 44\\n210 170 153\\n109 194 202\\n218 212 94\\n222 238 214\"),\n    dawnBringer32: fromStrings(\"0 0 0\\n34 32 52\\n69 40 60\\n102 57 49\\n143 86 59\\n223 113 38\\n217 160 102\\n238 195 154\\n251 242 54\\n153 229 80\\n106 190 48\\n55 148 110\\n75 105 47\\n82 75 36\\n50 60 57\\n63 63 116\\n48 96 130\\n91 110 225\\n99 155 255\\n95 205 228\\n203 219 252\\n255 255 255\\n155 173 183\\n132 126 135\\n105 106 106\\n89 86 82\\n118 66 138\\n172 50 50\\n217 87 99\\n215 123 186\\n143 151 74\\n138 111 48\"),\n    load: loadJASC,\n    \"export\": exportJASC,\n    fromStrings: fromStrings\n  };\n\n  module.exports = Palette;\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.2.0\",\"dependencies\":{\"ajax\":\"distri/ajax:master\",\"analytics\":\"distri/google-analytics:v0.1.0\",\"bindable\":\"distri/bindable:master\",\"byte_array\":\"distri/byte_array:v0.1.1\",\"core\":\"distri/core:master\",\"eval\":\"distri/eval:v0.1.0\",\"extensions\":\"distri/extensions:master\",\"grid-gen\":\"distri/grid-gen:v0.2.0\",\"matrix\":\"distri/matrix:master\",\"observable\":\"distri/observable:master\",\"point\":\"distri/point:master\",\"postmaster\":\"distri/postmaster:v0.2.3\",\"runtime\":\"distri/runtime:v0.3.0\",\"size\":\"distri/size:master\",\"touch-canvas\":\"distri/touch-canvas:v0.4.1\",\"undo\":\"distri/undo:v0.2.0\",\"util\":\"distri/util:v0.1.0\"},\"width\":1280,\"height\":720};",
      "type": "blob"
    },
    "plugins/save_to_s3": {
      "path": "plugins/save_to_s3",
      "content": "(function() {\n  module.exports = function(I, self) {\n    self.addAction({\n      perform: function() {\n        return alert(\"wat\");\n      },\n      name: \"Save\",\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKFSURBVDjLhVNNaxNRFD3vzUwSJ622YEwgYoVaNBUVilZwqStBtJBNxC4EEel/sDsXLhRcVxSUQo07QVy0jbpQqiANsS5ciNpowBhM2kk7nWS+vPdJqi0tXjhz39x595zz7syIMAxRKBSilM8TLgZBcIjyAIGWwQfKnyjfIxRGRkZ8bAoxOzs7SJumEonE0VQqhXg8DtM0wcTLy8toNpsol8uo1WqvqJbLZrOVDQzT09MvFhcXWS7cLlzXDYvFYpjP5x8w8b+QdDmcTCbxv0in0yCRs5vrOhUVU7VaRSwWQzQahWEYqmbbNur1OiqVCvr7+5kA2xLouo5GowHHcdS953mwLAutVks949qWBJ2zaJqmHPBmxs0ndXRHe2G3PfR2RfBo/geEHEy8v1sKg1CgYa3hebFyct0BK9KwVBZCYM12cHr4IC4MdeHpm+8Yv5TZoPzwZY0cibeyQ+D7vmpm8Npuuag3PbV55l11vdGhktUCakttEgr+zoDVGdzMx5FSQAsB1w9we2yI1OioRKDR1dShZmOttv8QMDrqHcKYIeGQixv5ryAueEQUEJiEn/PCNAJIVuRXRV+ieoWd8Eix5XvQpEFWdZAfyho1SiIQcEmsTQNmB5fn5uYeZzKZeF9fnyLhITbtKgxqHDvXTWRtopRKNaRzx/QIbk2V8ctahZ7L5Z5NTk4eWVhYuF4qlbJSyl38L/hBijQNBFjD/flr2G3uIxcSNfsbrp64Q6sYDZpmwHZHR0e/ULrCmJiY6F5ZWTmg6+n5/Skg2dXEmWPD6ImklYklJ409cQ9mhD4icirUQLaI42Mzrwf27jjVE+0hyzvpGC4EDViEPgJh42P5M35aLn4DnlayCCcx84IAAAAASUVORK5CYII=\"\n    });\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "stripe-payment": {
      "path": "stripe-payment",
      "content": "(function() {\n  var amount, description, process, push, q;\n\n  q = [];\n\n  push = function(selector) {\n    return q.push(selector);\n  };\n\n  $.getScript('https://checkout.stripe.com/checkout.js').done(function() {\n    console.log(\"loaded\");\n    q.forEach(process);\n    return push = process;\n  });\n\n  description = 'Pixi Paint ($1.99)';\n\n  amount = 199;\n\n  process = function(selector) {\n    var handler;\n    handler = StripeCheckout.configure({\n      key: 'pk_PPCRZgLrovwFHSKmMkjtVONHDs3pR',\n      image: 'https://fbcdn-photos-h-a.akamaihd.net/hphotos-ak-xap1/t39.2081-0/851574_391517107646989_794757491_n.png',\n      token: function(token, args) {\n        return $.post(\"http://pixi-paint-payments.herokuapp.com/charge\", {\n          amount: amount,\n          description: description,\n          stripeEmail: token.email,\n          stripeToken: token.id\n        });\n      }\n    });\n    return document.querySelector(selector).addEventListener('click', function(e) {\n      handler.open({\n        name: 'Pixi Paint',\n        description: description,\n        amount: amount\n      });\n      return e.preventDefault();\n    });\n  };\n\n  module.exports = function(selector) {\n    return push(selector);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html,\\nbody {\\n  margin: 0;\\n  height: 100%;\\n  font-family: helvetica;\\n}\\nbody {\\n  color: #222;\\n}\\nh2 {\\n  font-size: 12px;\\n}\\n.editor {\\n  background-color: #aaa;\\n  box-sizing: border-box;\\n  height: 100%;\\n  padding: 0px 72px 64px 35px;\\n  position: relative;\\n  user-select: none;\\n  -moz-user-select: none;\\n  -ms-user-select: none;\\n  -webkit-user-select: none;\\n  overflow: hidden;\\n}\\n.editor .main {\\n  font-size: 0;\\n  height: 100%;\\n  position: relative;\\n  overflow: auto;\\n}\\n.editor .main .thumbnail {\\n  background-color: #fff;\\n  border: 1px solid rgba(0,0,0,0.5);\\n  position: fixed;\\n  top: 4px;\\n  left: 40px;\\n  z-index: 2;\\n}\\n.editor .main .thumbnail > canvas {\\n  max-width: 256px;\\n  max-height: 256px;\\n  width: auto;\\n  height: auto;\\n}\\n.editor .main .thumbnail.right {\\n  right: 77px;\\n  left: auto;\\n}\\n.editor .position {\\n  position: absolute;\\n  bottom: 0;\\n  right: 0.25em;\\n  z-index: 2;\\n}\\n.editor > .opacity {\\n  display: inline-block;\\n  position: absolute;\\n  right: -2.5em;\\n  bottom: 5em;\\n  z-index: 2;\\n}\\n.editor > .opacity > h2 {\\n  position: absolute;\\n  right: 40px;\\n  bottom: 3.5em;\\n}\\n.editor > .opacity input.alphaValue {\\n  position: absolute;\\n  right: 56px;\\n  width: 25px;\\n  bottom: 2em;\\n  text-align: right;\\n}\\n.editor > .opacity input.alphaSlider {\\n  position: absolute;\\n  right: 8px;\\n  bottom: 4px;\\n  transform: rotate(-90deg);\\n  width: 64px;\\n  height: 20px;\\n}\\n.notifications {\\n  background-color: rgba(0,0,0,0.5);\\n  border: 1px solid #000;\\n  border-bottom-left-radius: 2px;\\n  border-bottom-right-radius: 2px;\\n  color: #fff;\\n  left: 40px;\\n  padding: 4px;\\n  position: absolute;\\n  top: 0;\\n  z-index: 9000;\\n}\\n.notifications:empty {\\n  padding: 0;\\n  border: none;\\n}\\n.notifications p {\\n  margin: 0;\\n  margin-bottom: 0.25em;\\n}\\n.notifications p:last-child {\\n  margin-bottom: 0;\\n}\\n.toolbar {\\n  box-sizing: border-box;\\n  height: 100%;\\n  width: 40px;\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n}\\n.toolbar h2 {\\n  font-size: 12px;\\n}\\n.toolbar .tool {\\n  background-color: #ccc;\\n  background-position: center;\\n  background-repeat: no-repeat;\\n  width: 36px;\\n  height: 36px;\\n  box-sizing: border-box;\\n  border: 1px solid rgba(0,0,0,0.5);\\n  border-top: 1px solid rgba(255,255,255,0.5);\\n  border-left: 1px solid rgba(255,255,255,0.5);\\n  cursor: pointer;\\n}\\n.toolbar .tool:last-child {\\n  border-bottom-right-radius: 2px;\\n}\\n.toolbar .tool.active {\\n  background-color: #eee;\\n}\\n.toolbar .tools:not(:first-child) .tool:first-child {\\n  border-top-right-radius: 2px;\\n}\\n.palette {\\n  background-color: #ccc;\\n  box-sizing: border-box;\\n  border-left: 1px solid rgba(255,255,255,0.5);\\n  height: 100%;\\n  width: 50px;\\n  position: absolute;\\n  top: 0;\\n  right: -1px;\\n  font-size: 0;\\n}\\n.palette > .color {\\n  box-sizing: border-box;\\n  border: 1px solid rgba(255,255,255,0.5);\\n  border-top: 1px solid rgba(0,0,0,0.5);\\n  border-left: 1px solid rgba(0,0,0,0.5);\\n  border-radius: 2px;\\n  display: inline-block;\\n  width: 24px;\\n  height: 24px;\\n  overflow: hidden;\\n  padding: 0;\\n}\\n.palette > .color.primary.color {\\n  width: 48px;\\n  height: 48px;\\n}\\n.palette > .color > input {\\n  width: 64px;\\n  height: 64px;\\n  margin: -8px 0 0 -8px;\\n  padding: 0;\\n}\\n.palette > .color.active {\\n  border: 1px solid rgba(255,255,255,0.875);\\n}\\n.palette > .color:nth-child(1) {\\n  border-top-right-radius: 0;\\n  border-top-left-radius: 0;\\n  border-top: 0;\\n}\\n.palette > .color:nth-child(even) {\\n  border-top-right-radius: 0;\\n  border-bottom-right-radius: 0;\\n}\\n.vertical-center {\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n  margin: auto;\\n}\\n.viewport {\\n  background-color: #fff;\\n  background-image: url(\\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkIADOnDnzH58SxlEDGIZDGBCKZxMTE7zeZBw1gGEYhAEAJQ47KemVQJ8AAAAASUVORK5CYII=\\\");\\n  border: 1px solid #808080;\\n  margin: auto;\\n  position: relative;\\n}\\n.viewport.vertical-center {\\n  position: absolute;\\n}\\n.viewport > canvas {\\n  image-rendering: optimizeSpeed;\\n  image-rendering: -moz-crisp-edges;\\n  image-rendering: -webkit-optimize-contrast;\\n  image-rendering: optimize-contrast;\\n  image-rendering: pixelated;\\n  -ms-interpolation-mode: nearest-neighbor;\\n  background-color: transparent;\\n  position: absolute;\\n  width: 100%;\\n  height: 100%;\\n}\\n.viewport .overlay {\\n  pointer-events: none;\\n  position: absolute;\\n  z-index: 1;\\n  width: 100%;\\n  height: 100%;\\n}\\n.debug {\\n  background-color: #fff;\\n  box-sizing: border-box;\\n  position: absolute;\\n  width: 100%;\\n  height: 100px;\\n  bottom: 0;\\n  margin: 0;\\n  padding: 1em;\\n}\\n.actions {\\n  box-sizing: border-box;\\n  width: 100%;\\n  height: 64px;\\n  position: absolute;\\n  bottom: 0;\\n  left: 0;\\n}\\n.actions .action {\\n  cursor: pointer;\\n  width: 64px;\\n  height: 64px;\\n  background-color: #ccc;\\n  background-position: 50% 25%;\\n  background-repeat: no-repeat;\\n  box-sizing: border-box;\\n  border: 1px solid rgba(0,0,0,0.5);\\n  border-left: none;\\n  border: 1px solid rgba(0,0,0,0.5);\\n  border-left: 1px solid rgba(255,255,255,0.5);\\n  border-top: 1px solid rgba(255,255,255,0.5);\\n  display: inline-block;\\n  font-size: 12px;\\n  position: relative;\\n  vertical-align: top;\\n}\\n.actions .action:last-child {\\n  border-top-right-radius: 2px;\\n}\\n.actions .action .text {\\n  text-align: center;\\n  overflow: hidden;\\n  position: absolute;\\n  width: 100%;\\n  top: 50%;\\n}\\n#modal {\\n  background-color: rgba(0,0,0,0.25);\\n  display: none;\\n  position: absolute;\\n  z-index: 9000;\\n  top: 0;\\n}\\n#modal input[type=file] {\\n  box-sizing: border-box;\\n  padding: 5em 2em;\\n  width: 320px;\\n  height: 180px;\\n}\\n#modal > * {\\n  background-color: #fff;\\n  border: 1px solid #000;\\n  margin: auto;\\n  position: absolute;\\n  top: 0;\\n  bottom: 0;\\n  left: 0;\\n  right: 0;\\n}\\n#modal.active {\\n  display: block;\\n  width: 100%;\\n  height: 100%;\\n}\\n\";",
      "type": "blob"
    },
    "symmetry": {
      "path": "symmetry",
      "content": "(function() {\n  var Symmetry, mirror;\n\n  mirror = function(size, flip) {\n    var midpoint;\n    midpoint = Point(size.width / 2, size.height / 2);\n    return Matrix.translate(midpoint.x, midpoint.y).concat(flip).concat(Matrix.translate(-midpoint.x, -midpoint.y));\n  };\n\n  module.exports = Symmetry = {\n    normal: function(size, transforms) {\n      return transforms;\n    },\n    flip: function(size, transforms) {\n      return transforms.concat(transforms.map(function(transform) {\n        return transform.concat(mirror(size, Matrix.HORIZONTAL_FLIP));\n      }));\n    },\n    flop: function(size, transforms) {\n      return transforms.concat(transforms.map(function(transform) {\n        return transform.concat(mirror(size, Matrix.VERTICAL_FLIP));\n      }));\n    },\n    quad: function(size, transforms) {\n      return Symmetry.flop(size, Symmetry.flip(size, transforms));\n    },\n    icon: {\n      normal: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWKB2CjDpo7keEc3ZNQApGgkNyYoDkQAREwcEdrwnzgAAAAASUVORK5CYIIA\",\n      flip: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPUlEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3VigZKkQFS847Ng1AAGhoEPAwCRtTgRC7T+1AAAAABJRU5ErkJgggAA\",\n      flop: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkoBAwwvTfDE/+r75yLpxPrLlgDSDNMA2kGjJqAAMDdWIBFhOkxgBI32gsUCsMKI4FYnMeNnUAmxI4EQ3tXkkAAAAASUVORK5CYIIA\",\n      quad: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVQ4T2NkoBAwwvTfDE/+r75yLpyPz1xktWANIAGYBkKGoKsdNWAuI3ViARYThGIAW5SPxgI0FihOyhTHAiU5GgBvBXARCEfBgAAAAABJRU5ErkJgggAA\"\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "templates/editor": {
      "path": "templates/editor",
      "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var Palette, Symmetry, activeIndex, activeTool, editor, previousTool, __root;\n    __root = require(\"/lib/hamlet-runtime\")(this);\n    activeIndex = this.activeIndex;\n    activeTool = this.activeTool;\n    previousTool = this.previousTool;\n    editor = this;\n    Symmetry = require(\"../symmetry\");\n    Palette = require(\"./palette\");\n    __root.buffer(__root.element(\"div\", this, {\n      \"class\": [\"editor\"]\n    }, function(__root) {\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"toolbar\"]\n      }, function(__root) {\n        __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"tools\"]\n        }, function(__root) {\n          this.tools.each(function(tool) {\n            var activate, activeClass;\n            activeClass = function() {\n              if (tool === activeTool()) {\n                return \"active\";\n              }\n            };\n            activate = function() {\n              return activeTool(tool);\n            };\n            return __root.buffer(__root.element(\"div\", this, {\n              \"class\": [\"tool\", activeClass],\n              \"style\": \"background-image: url(\" + tool.iconUrl + \")\",\n              \"title\": tool.hotkeys,\n              \"click\": activate\n            }, function(__root) {}));\n          });\n        }));\n        __root.buffer(__root.element(\"h2\", this, {}, function(__root) {\n          __root.buffer(\"Symmetry\\n\");\n        }));\n        __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"tools\"]\n        }, function(__root) {\n          var symmetryMode;\n          symmetryMode = this.symmetryMode;\n          [\"normal\", \"flip\", \"flop\", \"quad\"].forEach(function(mode) {\n            var activate, activeClass;\n            activeClass = function() {\n              if (mode === symmetryMode()) {\n                return \"active\";\n              }\n            };\n            activate = function() {\n              return symmetryMode(mode);\n            };\n            return __root.buffer(__root.element(\"div\", this, {\n              \"class\": [\"tool\", activeClass],\n              \"style\": \"background-image: url(\" + Symmetry.icon[mode] + \")\",\n              \"click\": activate\n            }, function(__root) {}));\n          });\n        }));\n      }));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"main\"]\n      }, function(__root) {\n        __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"viewport\", this.viewportCenter],\n          \"style\": this.viewportStyle\n        }, function(__root) {\n          __root.buffer(__root.element(\"div\", this, {\n            \"class\": [\"overlay\"],\n            \"style\": this.gridStyle\n          }, function(__root) {}));\n          __root.buffer(this.canvas.element());\n          __root.buffer(this.previewCanvas.element());\n        }));\n        __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"thumbnail\"],\n          \"click\": this.thumbnailClick\n        }, function(__root) {\n          __root.buffer(this.thumbnailCanvas.element());\n        }));\n      }));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"position\"]\n      }, function(__root) {\n        __root.buffer(this.positionDisplay);\n      }));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"notifications\"]\n      }, function(__root) {\n        this.notifications.forEach(function(notification) {\n          return __root.buffer(__root.element(\"p\", this, {}, function(__root) {\n            __root.buffer(notification);\n          }));\n        });\n      }));\n      __root.buffer(Palette(this));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"opacity\"]\n      }, function(__root) {\n        __root.buffer(__root.element(\"h2\", this, {}, function(__root) {\n          __root.buffer(\"Opacity\\n\");\n        }));\n        __root.buffer(__root.element(\"input\", this, {\n          \"class\": [\"alphaValue\"],\n          \"value\": this.alpha\n        }, function(__root) {}));\n        __root.buffer(__root.element(\"input\", this, {\n          \"class\": [\"alphaSlider\"],\n          \"type\": \"range\",\n          \"value\": this.alpha,\n          \"step\": \"1\",\n          \"min\": \"0\",\n          \"max\": \"100\"\n        }, function(__root) {}));\n      }));\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"actions\"]\n      }, function(__root) {\n        this.actions.each(function(action) {\n          return __root.buffer(__root.element(\"div\", this, {\n            \"class\": [\"action\"],\n            \"click\": action.perform,\n            \"touchstart\": action.perform,\n            \"title\": action.hotkey,\n            \"style\": \"background-image: url(\" + action.iconUrl + \")\"\n          }, function(__root) {\n            __root.buffer(__root.element(\"div\", this, {\n              \"class\": [\"text\"]\n            }, function(__root) {\n              __root.buffer(action.name);\n            }));\n          }));\n        });\n      }));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
      "type": "blob"
    },
    "templates/palette": {
      "path": "templates/palette",
      "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/hamlet-runtime\")(this);\n    __root.buffer(__root.element(\"div\", this, {\n      \"class\": [\"palette\"]\n    }, function(__root) {\n      var activeIndex, editor;\n      editor = this;\n      activeIndex = this.activeIndex;\n      __root.buffer(__root.element(\"div\", this, {\n        \"class\": [\"primary\", \"color\"]\n      }, function(__root) {\n        var style;\n        style = function() {\n          var c;\n          c = editor.activeColor();\n          return \"background-color: \" + c;\n        };\n        __root.buffer(__root.element(\"input\", this, {\n          \"type\": \"color\",\n          \"value\": editor.activeColor,\n          \"style\": style\n        }, function(__root) {}));\n      }));\n      this.palette.forEach(function(color, index) {\n        var click, input, longHold, showPicker, start, stop;\n        showPicker = false;\n        click = function(e) {\n          if (!showPicker) {\n            return e.preventDefault();\n          }\n        };\n        longHold = null;\n        start = function(e) {\n          clearTimeout(longHold);\n          longHold = setTimeout(function() {\n            showPicker = true;\n            e.target.click();\n            return showPicker = false;\n          }, 500);\n          editor.activeColor(color());\n        };\n        stop = function() {\n          return clearTimeout(longHold);\n        };\n        input = function(e) {\n          return editor.activeColor(e.target.value);\n        };\n        return __root.buffer(__root.element(\"div\", this, {\n          \"class\": [\"color\"],\n          \"mousedown\": start,\n          \"touchstart\": start,\n          \"mouseup\": stop,\n          \"touchend\": stop,\n          \"mouseout\": stop\n        }, function(__root) {\n          var style;\n          style = function() {\n            var c;\n            c = color();\n            return \"background-color: \" + c + \"; color: \" + c + \";\";\n          };\n          __root.buffer(__root.element(\"input\", this, {\n            \"type\": \"color\",\n            \"value\": color,\n            \"click\": click,\n            \"input\": input,\n            \"style\": style\n          }, function(__root) {}));\n        }));\n      });\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
      "type": "blob"
    },
    "test/editor": {
      "path": "test/editor",
      "content": "(function() {\n  var Editor;\n\n  Editor = require(\"../editor\");\n\n  describe(\"plugins\", function() {\n    return it(\"should be able to load via JSON package\", function() {\n      var result;\n      result = require({\n        distribution: {\n          main: {\n            content: \"module.exports = 'the test'\"\n          }\n        }\n      });\n      return assert.equal(result, \"the test\");\n    });\n  });\n\n  describe(\"Editor\", function() {\n    var editor;\n    editor = Editor();\n    it(\"should exist\", function() {\n      return assert(editor);\n    });\n    return it(\"should be able to drawn upon\", function() {\n      var p1, p2;\n      p1 = {\n        x: 0,\n        y: 0,\n        identifier: 0\n      };\n      p2 = {\n        x: 5,\n        y: 5,\n        identifier: 0\n      };\n      editor.previewCanvas.trigger(\"touch\", p1);\n      return editor.previewCanvas.trigger(\"move\", p2);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "test/palette": {
      "path": "test/palette",
      "content": "(function() {\n  var Palette;\n\n  Palette = require(\"../palette\");\n\n  describe(\"palette\", function() {\n    it(\"should parse strings into colors\", function() {\n      var colors;\n      colors = Palette.fromStrings(\"0 0 0\\n255 0 251\\n255 255 255\");\n      assert.equal(colors[0], \"#000000\");\n      assert.equal(colors[1], \"#FF00FB\");\n      assert.equal(colors[2], \"#FFFFFF\");\n      return assert.equal(colors.length, 3);\n    });\n    return it(\"should load JASC files\", function() {\n      var colors;\n      colors = Palette.load(\"JASC-PAL\\n0100\\n256\\n0 0 0\\n255 0 251\\n255 255 255\");\n      assert.equal(colors[0], \"#000000\");\n      assert.equal(colors[1], \"#FF00FB\");\n      assert.equal(colors[2], \"#FFFFFF\");\n      return assert.equal(colors.length, 3);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "tools": {
      "path": "tools",
      "content": "(function() {\n  var Brushes, TOOLS, brushTool, circle, endDeltoid, line, line2, neighbors, rect, rectOutline, shapeTool, _ref;\n\n  Brushes = require(\"./brushes\");\n\n  _ref = require(\"./util\"), circle = _ref.circle, line = _ref.line, rect = _ref.rect, rectOutline = _ref.rectOutline, endDeltoid = _ref.endDeltoid;\n\n  line2 = function(start, end, fn) {\n    fn(start);\n    return line(start, end, fn);\n  };\n\n  neighbors = function(point) {\n    return [\n      {\n        x: point.x,\n        y: point.y - 1\n      }, {\n        x: point.x - 1,\n        y: point.y\n      }, {\n        x: point.x + 1,\n        y: point.y\n      }, {\n        x: point.x,\n        y: point.y + 1\n      }\n    ];\n  };\n\n  shapeTool = function(hotkey, offsetX, offsetY, icon, fn) {\n    var end, start;\n    start = null;\n    end = null;\n    return {\n      hotkeys: hotkey,\n      iconUrl: icon,\n      iconOffset: {\n        x: offsetX,\n        y: offsetY\n      },\n      touch: function(_arg) {\n        var position;\n        position = _arg.position;\n        return start = position;\n      },\n      move: function(_arg) {\n        var editor, position;\n        editor = _arg.editor, position = _arg.position;\n        end = position;\n        editor.restore();\n        return fn(editor, editor.canvas, start, end);\n      },\n      release: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        editor.restore();\n        return fn(editor, editor.canvas, start, end);\n      }\n    };\n  };\n\n  brushTool = function(brushName, hotkey, offsetX, offsetY, icon, options) {\n    var OP, brush, paint, previousPosition;\n    previousPosition = null;\n    brush = Brushes[brushName];\n    OP = function(out) {\n      return function(p) {\n        return out(p, options);\n      };\n    };\n    paint = function(out) {\n      return function(x, y) {\n        return brush({\n          x: x,\n          y: y\n        }).forEach(OP(out));\n      };\n    };\n    return {\n      hotkeys: hotkey,\n      iconUrl: icon,\n      iconOffset: {\n        x: offsetX,\n        y: offsetY\n      },\n      touch: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        paint(editor.draw)(position.x, position.y);\n        return previousPosition = position;\n      },\n      move: function(_arg) {\n        var editor, position;\n        editor = _arg.editor, position = _arg.position;\n        line(previousPosition, position, paint(editor.draw));\n        return previousPosition = position;\n      },\n      release: function() {\n        return previousPosition = null;\n      }\n    };\n  };\n\n  TOOLS = {\n    pencil: brushTool(\"pencil\", \"p\", 4, 14, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVQ4T5VTuw2DMBB9LmkZg54ZGCDpHYkJYBBYATcUSKnSwAy0iDFoKR0fDgiMDc5JLvy59969OzPchzSesP3+sLFgySoMweMYou/xmWe81VKx5d0CyCQBoghoGgiV/JombwDNzjkwjsAw/A8gswwgBWm6VPdU7L4laPa6BsrSyX6oxTBQ7munO1v9LgCv2ldCWxcWgDV4EDjZbQq0dDKv65ytuxokKdtWO08AagkhTr2/BiD2otBv8hyMurCbPHNaTQ8OBjJScZFs9eChTKMwB8byT5ajkwIC8E22AvyY7j7ZJugLVIZ5EV8R1SQAAAAASUVORK5CYII=\"),\n    brush: brushTool(\"brush\", \"b\", 4, 14, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAKBJREFUeJytkrsRgzAQRFeME6UXXwVUogKoRB2JmAagEEqBcB0ge/Dw0cm2ZpTd7tuTFqg/zBcA0NSKkwg6719G1WJSlUnkI4XZgCGQql+tQKoCbYt+WWrB2SDGA92aYKMD/6dbEjCJAPP8A73wbe5OnAuDYV1LsyfkEMgYi4W5ciW56Zxzt/THBR2YJmAcbXn34s77d+dh6Ps+2tlw8eGedfBU8rnbDOMAAAAASUVORK5CYII=\"),\n    eraser: brushTool(\"pencil\", \"e\", 4, 11, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAIdJREFUeJzNUsERwCAIw15n031wDt0Hl0s/9VoF9NnmZzRBCERfI2zusdOtDABmopRGVoRCrdviADNMiADM6L873Mql2NYiw3E2WItzVi2dSuw8JBHNvQyegcU4vmjNFesWZrHFTSlYQ/RhRDgatKZFnXPy7zMIoVaYa3fH5i3PTHira4r/gQv1W1E4p9FksQAAAABJRU5ErkJggg==\", {\n      color: \"transparent\"\n    }),\n    dropper: {\n      hotkeys: \"i\",\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAH1JREFUeJztjrsNhDAUBIfLTOiYsiClCHdEDUT0Q0rscElY3QkJOD4hI1nye/aOFm5S/Ny1sd/l43AdAqoq6hDWsr8aqIsRgLYsKcbRbzpq4wb0OQPQTJNXh+E18ulilFLyfBopJZmzEn+WhuGy5NvklWxKrgpYgrclFj3DDPqoerGlCYunAAAAAElFTkSuQmCC\",\n      iconOffset: {\n        x: 13,\n        y: 13\n      },\n      touch: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        return editor.activeColor(editor.getColor(position));\n      },\n      move: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        return editor.activeColor(editor.getColor(position));\n      },\n      release: function() {\n        return editor.activeTool(editor.previousTool());\n      }\n    },\n    move: require(\"./tools/selection\")(),\n    fill: {\n      hotkeys: \"f\",\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVQ4T52TPRKCMBCFX0pbj+HY0tJKY+UB8AqchCuYXofCRs9gy3ADW1rKmLeQTIBEZ0wTwu779idZhfQygUml3FIGikPb8ux5MUDM+S9AWAIjRrNNZYDLdov7MEiqx80G576PQqIAJ75NgJMFXPMc6vlcQZYAI842unq/YQ4HoKrGho1iqLqeQWadZuSyLKG1FmeWwMjY7QDCJlAIcQAj4iyDfr1kp4gggVgb9nsPUkXhs1gBJBpX1wFtC20BrpmSjS0pDbD1h8uJeQu+pKaJAmgfy5icQzH/sani9HgkAWLnLTAi0+YeiFmu+QXwEH5EHpAx7EFwld+GybVjOVTJdzBrYOKwGqoP9IV4EbRDWfEAAAAASUVORK5CYII=\",\n      iconOffset: {\n        x: 12,\n        y: 13\n      },\n      touch: function(_arg) {\n        var color, data, editor, get, height, imageData, position, queue, safetyHatch, set, target, width;\n        position = _arg.position, editor = _arg.editor;\n        color = editor.colorAsInt();\n        imageData = editor.getSnapshot();\n        width = imageData.width, height = imageData.height;\n        data = new Uint32Array(imageData.data.buffer);\n        set = function(_arg1, color) {\n          var x, y;\n          x = _arg1.x, y = _arg1.y;\n          if ((0 <= x && x < width)) {\n            if ((0 <= y && y < height)) {\n              return data[y * width + x] = color;\n            }\n          }\n        };\n        get = function(_arg1) {\n          var x, y;\n          x = _arg1.x, y = _arg1.y;\n          if ((0 <= x && x < width)) {\n            if ((0 <= y && y < height)) {\n              return data[y * width + x];\n            }\n          }\n        };\n        target = get(position);\n        if (target == null) {\n          return;\n        }\n        if (color === target) {\n          return;\n        }\n        queue = [position];\n        set(position, color);\n        safetyHatch = width * height;\n        while (queue.length && safetyHatch > 0) {\n          position = queue.pop();\n          neighbors(position).forEach(function(position) {\n            var pixelColor;\n            pixelColor = get(position);\n            if (pixelColor === target) {\n              safetyHatch -= 1;\n              set(position, color);\n              return queue.push(position);\n            }\n          });\n        }\n        editor.putImageData(imageData);\n      },\n      move: function() {},\n      release: function() {}\n    },\n    rect: shapeTool(\"r\", 1, 4, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK0lEQVQ4T2NkoBAwUqifYfAY8J9MrzDCvDBqAAPDMAgDMpMBwyBKymR7AQAp1wgR44q8HgAAAABJRU5ErkJggg==\", function(editor, canvas, start, end) {\n      var color, delta;\n      color = editor.activeColor();\n      delta = end.subtract(start);\n      return editor.withCanvasMods(function(canvas) {\n        return canvas.drawRect({\n          x: start.x,\n          y: start.y,\n          width: delta.x,\n          height: delta.y,\n          color: color\n        });\n      });\n    }),\n    rectOutline: shapeTool(\"shift+r\", 1, 4, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4T2NkoBAwUqifgWoG/CfTJYwwF4AMINU1YD2jBgy7MCAnLcHTATmawXpITX0YFlFsAADRBBIRAZEL0wAAAABJRU5ErkJggg==\", function(editor, canvas, start, end) {\n      var color, delta;\n      delta = end.subtract(start);\n      color = editor.activeColor();\n      return editor.withCanvasMods(function(canvas) {\n        return canvas.drawRect({\n          x: start.x - 0.5,\n          y: start.y - 0.5,\n          width: delta.x,\n          height: delta.y,\n          stroke: {\n            color: color,\n            width: 1\n          }\n        });\n      });\n    }),\n    circle: shapeTool(\"c\", 0, 0, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVQ4T2NkwA7+YxFmxKYUXRCmEZtirHLICkEKsNqCZjOKOpgGYjXDzIKrp4oBpNqO4gqQC0YNgAQJqeFA3WjESBw48gdWdVTNC8gWk50bCbgeUxoAvXwcEQnwKSYAAAAASUVORK5CYII=\", function(editor, canvas, start, end) {\n      return circle(start, end, function(x, y) {\n        return editor.draw({\n          x: x,\n          y: y\n        });\n      });\n    }),\n    line2: shapeTool(\"l\", 0, 0, \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAV0lEQVQ4T6XSyQ0AIAgEQOm/aIWHxoNzJTG+GASk9hnE+Z2P3FDMRBjZK0PI/fQyovVeQqzhpRFv+ikkWl+IRID8DRfJAC6SBUykAqhIFXgQBDgQFFjIAMAADxGQlO+iAAAAAElFTkSuQmCC\", function(editor, canvas, start, end) {\n      var color;\n      color = editor.activeColor();\n      return line(start, end, function(x, y) {\n        return editor.draw({\n          x: x,\n          y: y\n        });\n      });\n    })\n  };\n\n  module.exports = function(I, self) {\n    var prevTool, setNthTool;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = Core(I);\n    }\n    self.extend({\n      addTool: function(tool) {\n        [].concat(tool.hotkeys || []).forEach(function(hotkey) {\n          return self.addHotkey(hotkey, function() {\n            return self.activeTool(tool);\n          });\n        });\n        return self.tools.push(tool);\n      },\n      activeTool: Observable(),\n      previousTool: Observable(),\n      tools: Observable([])\n    });\n    Object.keys(TOOLS).forEach(function(name) {\n      return self.addTool(TOOLS[name]);\n    });\n    setNthTool = function(n) {\n      return function() {\n        var tool;\n        if (tool = self.tools.get(n)) {\n          return self.activeTool(tool);\n        }\n      };\n    };\n    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(n) {\n      return self.addHotkey(n.toString(), setNthTool(n - 1));\n    });\n    self.addHotkey(\"0\", setNthTool(9));\n    prevTool = null;\n    self.activeTool.observe(function(newTool) {\n      self.previousTool(prevTool);\n      return prevTool = newTool;\n    });\n    self.activeTool(self.tools()[0]);\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "tools/selection": {
      "path": "tools/selection",
      "content": "(function() {\n  var Rectangle, drawOutline, endDeltoid, paint;\n\n  Rectangle = require(\"../lib/rectangle\");\n\n  endDeltoid = require(\"../util\").endDeltoid;\n\n  drawOutline = function(canvas, scale, rectangle) {\n    return canvas.drawRect({\n      x: (rectangle.position.x - 0.5) * scale,\n      y: (rectangle.position.y - 0.5) * scale,\n      width: rectangle.size.width * scale,\n      height: rectangle.size.height * scale,\n      color: \"transparent\",\n      stroke: {\n        width: 1,\n        color: \"green\"\n      }\n    });\n  };\n\n  paint = function(editor, selection, delta) {\n    editor.restore();\n    return editor.canvas.drawImage(editor.canvas.element(), selection.position.x, selection.position.y, selection.size.width, selection.size.height, selection.position.x + delta.x, selection.position.y + delta.y, selection.size.width, selection.size.height);\n  };\n\n  module.exports = function() {\n    var delta, moving, selecting, selection, selectionEnd, selectionStart, startPosition;\n    selecting = true;\n    moving = false;\n    selection = delta = selectionStart = startPosition = selectionEnd = void 0;\n    return {\n      touch: function(_arg) {\n        var editor, position;\n        position = _arg.position, editor = _arg.editor;\n        if (selecting) {\n          selectionStart = position;\n          return selectionEnd = position.add(Point(1, 1));\n        } else {\n          moving = true;\n          startPosition = position;\n          return delta = Point(0, 0);\n        }\n      },\n      iconUrl: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABlUlEQVQ4T6WTz0sCQRTHnyvpNYsuGSQbpQgiiAiC/0L/RIcuHbwkQocOQRAFXTpEB4M8dOgQ1L8hiAjiam5gpn+B6MWZ13uzzrblEoSPnZmdH+/znTdvJgBLWmBJf1CAq9cRapBABBQAgkakkCAkgqCOpLHZTMDlgflD1AVsRkKA5EzrAamSkiBUcSvnEHs0hevDnUXAxcsQo6sh5cyLvwtBaBcKQKX3OYGbo71FwPnzELciK76q2llSGG8EuC3GFwFnTwOMrtEO9NY9quxIXZqT0BlMobxvqH8uyWQyoGinj33cWg+7sXpV3X+CdPpjqJQS6qza7TakUikHcFJlAIfgxOpV1YfIc1Z/AvelXTAMA1qtFqTTaQdwXHnH7Y2w6+xV5VQqCKlaH2N4KCcUoNlsQiaTcQDFux7KmQT61KkLyjnHqPOv7gb1+bJUy3EIBoPQaDQgm806gN9m2zbGYjECEGluHLc2BtTrdcjlcv6AbreLpmn+ectrtRrk83l/gGVZyOo6XX4tzxcKBX/Afx7Y0q/xCyxxSSDAf7z0AAAAAElFTkSuQmCC\",\n      iconOffset: {\n        x: 1,\n        y: 2\n      },\n      move: function(_arg) {\n        var canvas, editor, outlineRect, position, scale;\n        position = _arg.position, editor = _arg.editor;\n        scale = 1;\n        canvas = editor.previewCanvas;\n        canvas.clear();\n        if (selecting) {\n          selectionEnd = endDeltoid(selectionStart, position);\n          selection = Rectangle.fromPoints(selectionStart, selectionEnd);\n          return drawOutline(canvas, scale, selection);\n        } else {\n          delta = position.subtract(startPosition);\n          paint(editor, selection, delta);\n          outlineRect = Rectangle(selection);\n          outlineRect.position.x += delta.x;\n          outlineRect.position.y += delta.y;\n          return drawOutline(editor.previewCanvas, scale, outlineRect);\n        }\n      },\n      release: function(_arg) {\n        var editor;\n        editor = _arg.editor;\n        if (selecting) {\n          selecting = !selecting;\n          return setTimeout(function() {\n            var canvas, scale;\n            canvas = editor.previewCanvas;\n            scale = 1;\n            return drawOutline(canvas, scale, selection);\n          });\n        } else if (moving) {\n          paint(editor, selection, delta);\n          moving = false;\n          return selecting = true;\n        }\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "util": {
      "path": "util",
      "content": "(function() {\n  var componentToHex, isObject;\n\n  require(\"extensions\");\n\n  global.Bindable = require(\"bindable\");\n\n  global.Matrix = require(\"matrix\");\n\n  global.Model = require(\"core\");\n\n  global.Point = require(\"point\");\n\n  global.Observable = require(\"observable\");\n\n  global.Size = require(\"size\");\n\n  Matrix.Point = Point;\n\n  componentToHex = function(c) {\n    var hex;\n    hex = c.toString(16);\n    if (hex.length === 1) {\n      return \"0\" + hex;\n    } else {\n      return hex;\n    }\n  };\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n  Point.prototype.scale = function(scalar) {\n    if (isObject(scalar)) {\n      return Point(this.x * scalar.width, this.y * scalar.height);\n    } else {\n      return Point(this.x * scalar, this.y * scalar);\n    }\n  };\n\n  Point.prototype.floor = function() {\n    return Point(this.x.floor(), this.y.floor());\n  };\n\n  module.exports = {\n    endDeltoid: function(start, end) {\n      var x, y;\n      if (end.x < start.x) {\n        x = 0;\n      } else {\n        x = 1;\n      }\n      if (end.y < start.y) {\n        y = 0;\n      } else {\n        y = 1;\n      }\n      return end.add(Point(x, y));\n    },\n    line: function(p0, p1, iterator) {\n      var dx, dy, e2, err, sx, sy, x0, x1, y0, y1, _results;\n      x0 = p0.x, y0 = p0.y;\n      x1 = p1.x, y1 = p1.y;\n      dx = (x1 - x0).abs();\n      dy = (y1 - y0).abs();\n      sx = (x1 - x0).sign();\n      sy = (y1 - y0).sign();\n      err = dx - dy;\n      _results = [];\n      while (!(x0 === x1 && y0 === y1)) {\n        e2 = 2 * err;\n        if (e2 > -dy) {\n          err -= dy;\n          x0 += sx;\n        }\n        if (e2 < dx) {\n          err += dx;\n          y0 += sy;\n        }\n        _results.push(iterator(x0, y0));\n      }\n      return _results;\n    },\n    rect: function(start, end, iterator) {\n      var _i, _ref, _ref1, _results;\n      return (function() {\n        _results = [];\n        for (var _i = _ref = start.y, _ref1 = end.y; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(y) {\n        var _i, _ref, _ref1, _results;\n        return (function() {\n          _results = [];\n          for (var _i = _ref = start.x, _ref1 = end.x; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n          return _results;\n        }).apply(this).forEach(function(x) {\n          return iterator({\n            x: x,\n            y: y\n          });\n        });\n      });\n    },\n    rectOutline: function(start, end, iterator) {\n      var _i, _ref, _ref1, _results;\n      return (function() {\n        _results = [];\n        for (var _i = _ref = start.y, _ref1 = end.y; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(function(y) {\n        var _i, _ref, _ref1, _results;\n        if (y === start.y || y === end.y) {\n          return (function() {\n            _results = [];\n            for (var _i = _ref = start.x, _ref1 = end.x; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; _ref <= _ref1 ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).forEach(function(x) {\n            return iterator({\n              x: x,\n              y: y\n            });\n          });\n        } else {\n          iterator({\n            x: start.x,\n            y: y\n          });\n          return iterator({\n            x: end.x,\n            y: y\n          });\n        }\n      });\n    },\n    circle: function(start, endPoint, iterator) {\n      var center, ddFx, ddFy, f, radius, x, x0, x1, y, y0, y1, _results;\n      center = Point.interpolate(start, endPoint, 0.5).floor();\n      x0 = center.x, y0 = center.y;\n      x1 = endPoint.x, y1 = endPoint.y;\n      radius = (endPoint.subtract(start).magnitude() / 2) | 0;\n      f = 1 - radius;\n      ddFx = 1;\n      ddFy = -2 * radius;\n      x = 0;\n      y = radius;\n      iterator(x0, y0 + radius);\n      iterator(x0, y0 - radius);\n      iterator(x0 + radius, y0);\n      iterator(x0 - radius, y0);\n      _results = [];\n      while (x < y) {\n        if (f > 0) {\n          y--;\n          ddFy += 2;\n          f += ddFy;\n        }\n        x++;\n        ddFx += 2;\n        f += ddFx;\n        iterator(x0 + x, y0 + y);\n        iterator(x0 - x, y0 + y);\n        iterator(x0 + x, y0 - y);\n        iterator(x0 - x, y0 - y);\n        iterator(x0 + y, y0 + x);\n        iterator(x0 - y, y0 + x);\n        iterator(x0 + y, y0 - x);\n        _results.push(iterator(x0 - y, y0 - x));\n      }\n      return _results;\n    },\n    rgb2Hex: function(r, g, b) {\n      return \"#\" + [r, g, b].map(componentToHex).join(\"\");\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/hamlet-runtime": {
      "path": "lib/hamlet-runtime",
      "content": "!function(e){if(\"object\"==typeof exports)module.exports=e();else if(\"function\"==typeof define&&define.amd)define(e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.Hamlet=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error(\"Cannot find module '\"+o+\"'\")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){\n!function(){var Hamlet,compile;Hamlet=_dereq_(\"hamlet-runtime\");compile=_dereq_(\"hamlet-compiler\").compile;Hamlet.compile=compile;module.exports=Hamlet}.call(this);\n},{\"hamlet-compiler\":6,\"hamlet-runtime\":11}],2:[function(_dereq_,module,exports){\n\n},{}],3:[function(_dereq_,module,exports){\n(function (process){\n// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length - 1; i >= 0; i--) {\n    var last = parts[i];\n    if (last === '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Split a filename into [root, dir, basename, ext], unix version\n// 'root' is just a slash, or nothing.\nvar splitPathRe =\n    /^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;\nvar splitPath = function(filename) {\n  return splitPathRe.exec(filename).slice(1);\n};\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\n  var resolvedPath = '',\n      resolvedAbsolute = false;\n\n  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {\n    var path = (i >= 0) ? arguments[i] : process.cwd();\n\n    // Skip empty and invalid entries\n    if (typeof path !== 'string') {\n      throw new TypeError('Arguments to path.resolve must be strings');\n    } else if (!path) {\n      continue;\n    }\n\n    resolvedPath = path + '/' + resolvedPath;\n    resolvedAbsolute = path.charAt(0) === '/';\n  }\n\n  // At this point the path should be resolved to a full absolute path, but\n  // handle relative paths to be safe (might happen when process.cwd() fails)\n\n  // Normalize the path\n  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\n  var isAbsolute = exports.isAbsolute(path),\n      trailingSlash = substr(path, -1) === '/';\n\n  // Normalize the path\n  path = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n\n  return (isAbsolute ? '/' : '') + path;\n};\n\n// posix version\nexports.isAbsolute = function(path) {\n  return path.charAt(0) === '/';\n};\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    if (typeof p !== 'string') {\n      throw new TypeError('Arguments to path.join must be strings');\n    }\n    return p;\n  }).join('/'));\n};\n\n\n// path.relative(from, to)\n// posix version\nexports.relative = function(from, to) {\n  from = exports.resolve(from).substr(1);\n  to = exports.resolve(to).substr(1);\n\n  function trim(arr) {\n    var start = 0;\n    for (; start < arr.length; start++) {\n      if (arr[start] !== '') break;\n    }\n\n    var end = arr.length - 1;\n    for (; end >= 0; end--) {\n      if (arr[end] !== '') break;\n    }\n\n    if (start > end) return [];\n    return arr.slice(start, end - start + 1);\n  }\n\n  var fromParts = trim(from.split('/'));\n  var toParts = trim(to.split('/'));\n\n  var length = Math.min(fromParts.length, toParts.length);\n  var samePartsLength = length;\n  for (var i = 0; i < length; i++) {\n    if (fromParts[i] !== toParts[i]) {\n      samePartsLength = i;\n      break;\n    }\n  }\n\n  var outputParts = [];\n  for (var i = samePartsLength; i < fromParts.length; i++) {\n    outputParts.push('..');\n  }\n\n  outputParts = outputParts.concat(toParts.slice(samePartsLength));\n\n  return outputParts.join('/');\n};\n\nexports.sep = '/';\nexports.delimiter = ':';\n\nexports.dirname = function(path) {\n  var result = splitPath(path),\n      root = result[0],\n      dir = result[1];\n\n  if (!root && !dir) {\n    // No dirname whatsoever\n    return '.';\n  }\n\n  if (dir) {\n    // It has a dirname, strip trailing slash\n    dir = dir.substr(0, dir.length - 1);\n  }\n\n  return root + dir;\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPath(path)[2];\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPath(path)[3];\n};\n\nfunction filter (xs, f) {\n    if (xs.filter) return xs.filter(f);\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (f(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// String.prototype.substr - negative index don't work in IE8\nvar substr = 'ab'.substr(-1) === 'b'\n    ? function (str, start, len) { return str.substr(start, len) }\n    : function (str, start, len) {\n        if (start < 0) start = str.length + start;\n        return str.substr(start, len);\n    }\n;\n\n}).call(this,_dereq_(\"FWaASH\"))\n},{\"FWaASH\":4}],4:[function(_dereq_,module,exports){\n// shim for using process in browser\n\nvar process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var canSetImmediate = typeof window !== 'undefined'\n    && window.setImmediate;\n    var canPost = typeof window !== 'undefined'\n    && window.postMessage && window.addEventListener\n    ;\n\n    if (canSetImmediate) {\n        return function (f) { return window.setImmediate(f) };\n    }\n\n    if (canPost) {\n        var queue = [];\n        window.addEventListener('message', function (ev) {\n            var source = ev.source;\n            if ((source === window || source === null) && ev.data === 'process-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n\n        return function nextTick(fn) {\n            queue.push(fn);\n            window.postMessage('process-tick', '*');\n        };\n    }\n\n    return function nextTick(fn) {\n        setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nfunction noop() {}\n\nprocess.on = noop;\nprocess.addListener = noop;\nprocess.once = noop;\nprocess.off = noop;\nprocess.removeListener = noop;\nprocess.removeAllListeners = noop;\nprocess.emit = noop;\n\nprocess.binding = function (name) {\n    throw new Error('process.binding is not supported');\n}\n\n// TODO(shtylman)\nprocess.cwd = function () { return '/' };\nprocess.chdir = function (dir) {\n    throw new Error('process.chdir is not supported');\n};\n\n},{}],5:[function(_dereq_,module,exports){\n// Generated by CoffeeScript 1.7.1\n(function() {\n  var ROOT_NAME, indentText, util;\n\n  indentText = function(text, indent) {\n    if (indent == null) {\n      indent = \"  \";\n    }\n    return indent + text.replace(/\\n/g, \"\\n\" + indent);\n  };\n\n  ROOT_NAME = \"__root\";\n\n  util = {\n    indent: indentText,\n    filters: {\n      verbatim: function(content, compiler) {\n        return compiler.buffer('\"\"\"' + content.replace(/(#|\")/g, \"\\\\$1\") + '\"\"\"');\n      },\n      plain: function(content, compiler) {\n        return compiler.buffer(JSON.stringify(content));\n      },\n      coffeescript: function(content, compiler) {\n        return [content];\n      },\n      javascript: function(content, compiler) {\n        return [\"`\", compiler.indent(content), \"`\"];\n      }\n    },\n    element: function(tag, attributes, contents) {\n      var lines;\n      if (attributes == null) {\n        attributes = [];\n      }\n      if (contents == null) {\n        contents = [];\n      }\n      return lines = [\"\" + ROOT_NAME + \".buffer \" + ROOT_NAME + \".element \" + (JSON.stringify(tag)) + \", this, {\" + (attributes.join('\\n')) + \"}, (\" + ROOT_NAME + \") ->\", indentText(contents.join(\"\\n\")), \"  return\"];\n    },\n    buffer: function(value) {\n      return [\"\" + ROOT_NAME + \".buffer \" + value];\n    },\n    attributes: function(node) {\n      var attributeLines, attributes, classes, id, ids, idsAndClasses;\n      id = node.id, classes = node.classes, attributes = node.attributes;\n      if (id) {\n        ids = [JSON.stringify(id)];\n      } else {\n        ids = [];\n      }\n      classes = (classes || []).map(JSON.stringify);\n      if (attributes) {\n        attributes = attributes.filter(function(_arg) {\n          var name, value;\n          name = _arg.name, value = _arg.value;\n          if (name === \"class\") {\n            classes.push(value);\n            return false;\n          } else if (name === \"id\") {\n            ids.push(value);\n            return false;\n          } else {\n            return true;\n          }\n        });\n      } else {\n        attributes = [];\n      }\n      idsAndClasses = [];\n      if (ids.length) {\n        idsAndClasses.push(\"id: [\" + (ids.join(', ')) + \"]\");\n      }\n      if (classes.length) {\n        idsAndClasses.push(\"class: [\" + (classes.join(', ')) + \"]\");\n      }\n      attributeLines = attributes.map(function(_arg) {\n        var name, value;\n        name = _arg.name, value = _arg.value;\n        name = JSON.stringify(name);\n        return \"\" + name + \": \" + value;\n      });\n      return idsAndClasses.concat(attributeLines);\n    },\n    render: function(node) {\n      var filter, tag, text;\n      tag = node.tag, filter = node.filter, text = node.text;\n      if (tag) {\n        return this.tag(node);\n      } else if (filter) {\n        return this.filter(node);\n      } else {\n        return this.contents(node);\n      }\n    },\n    filter: function(node) {\n      var filter, filterName;\n      filterName = node.filter;\n      if (filter = this.filters[filterName]) {\n        return [].concat.apply([], this.filters[filterName](node.content, this));\n      } else {\n        return [\"\" + ROOT_NAME + \".filter(\" + (JSON.stringify(filterName)) + \", \" + (JSON.stringify(node.content)) + \")\"];\n      }\n    },\n    contents: function(node) {\n      var bufferedCode, childContent, children, contents, indent, text, unbufferedCode;\n      children = node.children, bufferedCode = node.bufferedCode, unbufferedCode = node.unbufferedCode, text = node.text;\n      if (unbufferedCode) {\n        indent = true;\n        contents = [unbufferedCode];\n      } else if (bufferedCode) {\n        contents = this.buffer(bufferedCode);\n      } else if (text) {\n        contents = this.buffer(JSON.stringify(text));\n      } else if (node.tag) {\n        contents = [];\n      } else if (node.comment) {\n        return [];\n      } else {\n        contents = [];\n        console.warn(\"No content for node:\", node);\n      }\n      if (children) {\n        childContent = this.renderNodes(children);\n        if (indent) {\n          childContent = this.indent(childContent.join(\"\\n\"));\n        }\n        contents = contents.concat(childContent);\n      }\n      return contents;\n    },\n    renderNodes: function(nodes) {\n      return [].concat.apply([], nodes.map(this.render, this));\n    },\n    tag: function(node) {\n      var tag;\n      tag = node.tag;\n      return this.element(tag, this.attributes(node), this.contents(node));\n    }\n  };\n\n  exports.compile = function(parseTree, _arg) {\n    var compiler, exports, items, options, program, programSource, runtime, source, _ref;\n    _ref = _arg != null ? _arg : {}, compiler = _ref.compiler, runtime = _ref.runtime, exports = _ref.exports;\n    if (runtime == null) {\n      runtime = \"require\" + \"(\\\"hamlet-runtime\\\")\";\n    }\n    if (exports == null) {\n      exports = \"module.exports\";\n    }\n    items = util.renderNodes(parseTree);\n    if (exports) {\n      exports = \"\" + exports + \" = \";\n    } else {\n      exports = \"\";\n    }\n    source = \"\" + exports + \"(data) ->\\n  \\\"use strict\\\"\\n  (->\\n    \" + ROOT_NAME + \" = \" + runtime + \"(this)\\n\\n\" + (util.indent(items.join(\"\\n\"), \"    \")) + \"\\n    return \" + ROOT_NAME + \".root\\n  ).call(data)\";\n    options = {\n      bare: true\n    };\n    programSource = source;\n    program = compiler.compile(programSource, options);\n    return program;\n  };\n\n}).call(this);\n\n},{}],6:[function(_dereq_,module,exports){\n// Generated by CoffeeScript 1.7.1\n(function() {\n  var compile, parser;\n\n  compile = _dereq_(\"./compiler\").compile;\n\n  parser = _dereq_(\"hamlet-parser\");\n\n  module.exports = {\n    compile: function(input, options) {\n      if (options == null) {\n        options = {};\n      }\n      if (typeof input === \"string\") {\n        input = parser.parse(input, options.mode);\n      }\n      return compile(input, options);\n    }\n  };\n\n}).call(this);\n\n},{\"./compiler\":5,\"hamlet-parser\":9}],7:[function(_dereq_,module,exports){\n/* generated by jison-lex 0.2.1 */\nvar haml_lexer = (function(){\nvar lexer = {\n\nEOF:1,\n\nparseError:function parseError(str, hash) {\n        if (this.yy.parser) {\n            this.yy.parser.parseError(str, hash);\n        } else {\n            throw new Error(str);\n        }\n    },\n\n// resets the lexer, sets new input\nsetInput:function (input) {\n        this._input = input;\n        this._more = this._backtrack = this.done = false;\n        this.yylineno = this.yyleng = 0;\n        this.yytext = this.matched = this.match = '';\n        this.conditionStack = ['INITIAL'];\n        this.yylloc = {\n            first_line: 1,\n            first_column: 0,\n            last_line: 1,\n            last_column: 0\n        };\n        if (this.options.ranges) {\n            this.yylloc.range = [0,0];\n        }\n        this.offset = 0;\n        return this;\n    },\n\n// consumes and returns one char from the input\ninput:function () {\n        var ch = this._input[0];\n        this.yytext += ch;\n        this.yyleng++;\n        this.offset++;\n        this.match += ch;\n        this.matched += ch;\n        var lines = ch.match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno++;\n            this.yylloc.last_line++;\n        } else {\n            this.yylloc.last_column++;\n        }\n        if (this.options.ranges) {\n            this.yylloc.range[1]++;\n        }\n\n        this._input = this._input.slice(1);\n        return ch;\n    },\n\n// unshifts one char (or a string) into the input\nunput:function (ch) {\n        var len = ch.length;\n        var lines = ch.split(/(?:\\r\\n?|\\n)/g);\n\n        this._input = ch + this._input;\n        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);\n        //this.yyleng -= len;\n        this.offset -= len;\n        var oldLines = this.match.split(/(?:\\r\\n?|\\n)/g);\n        this.match = this.match.substr(0, this.match.length - 1);\n        this.matched = this.matched.substr(0, this.matched.length - 1);\n\n        if (lines.length - 1) {\n            this.yylineno -= lines.length - 1;\n        }\n        var r = this.yylloc.range;\n\n        this.yylloc = {\n            first_line: this.yylloc.first_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.first_column,\n            last_column: lines ?\n                (lines.length === oldLines.length ? this.yylloc.first_column : 0)\n                 + oldLines[oldLines.length - lines.length].length - lines[0].length :\n              this.yylloc.first_column - len\n        };\n\n        if (this.options.ranges) {\n            this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n        }\n        this.yyleng = this.yytext.length;\n        return this;\n    },\n\n// When called from action, caches matched text and appends it on next action\nmore:function () {\n        this._more = true;\n        return this;\n    },\n\n// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\nreject:function () {\n        if (this.options.backtrack_lexer) {\n            this._backtrack = true;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n\n        }\n        return this;\n    },\n\n// retain first n characters of the match\nless:function (n) {\n        this.unput(this.match.slice(n));\n    },\n\n// displays already matched input, i.e. for error messages\npastInput:function () {\n        var past = this.matched.substr(0, this.matched.length - this.match.length);\n        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n/g, \"\");\n    },\n\n// displays upcoming input, i.e. for error messages\nupcomingInput:function () {\n        var next = this.match;\n        if (next.length < 20) {\n            next += this._input.substr(0, 20-next.length);\n        }\n        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\\n/g, \"\");\n    },\n\n// displays the character position where the lexing error occurred, i.e. for error messages\nshowPosition:function () {\n        var pre = this.pastInput();\n        var c = new Array(pre.length + 1).join(\"-\");\n        return pre + this.upcomingInput() + \"\\n\" + c + \"^\";\n    },\n\n// test the lexed token: return FALSE when not a match, otherwise return token\ntest_match:function (match, indexed_rule) {\n        var token,\n            lines,\n            backup;\n\n        if (this.options.backtrack_lexer) {\n            // save context\n            backup = {\n                yylineno: this.yylineno,\n                yylloc: {\n                    first_line: this.yylloc.first_line,\n                    last_line: this.last_line,\n                    first_column: this.yylloc.first_column,\n                    last_column: this.yylloc.last_column\n                },\n                yytext: this.yytext,\n                match: this.match,\n                matches: this.matches,\n                matched: this.matched,\n                yyleng: this.yyleng,\n                offset: this.offset,\n                _more: this._more,\n                _input: this._input,\n                yy: this.yy,\n                conditionStack: this.conditionStack.slice(0),\n                done: this.done\n            };\n            if (this.options.ranges) {\n                backup.yylloc.range = this.yylloc.range.slice(0);\n            }\n        }\n\n        lines = match[0].match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno += lines.length;\n        }\n        this.yylloc = {\n            first_line: this.yylloc.last_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.last_column,\n            last_column: lines ?\n                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n?/)[0].length :\n                         this.yylloc.last_column + match[0].length\n        };\n        this.yytext += match[0];\n        this.match += match[0];\n        this.matches = match;\n        this.yyleng = this.yytext.length;\n        if (this.options.ranges) {\n            this.yylloc.range = [this.offset, this.offset += this.yyleng];\n        }\n        this._more = false;\n        this._backtrack = false;\n        this._input = this._input.slice(match[0].length);\n        this.matched += match[0];\n        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);\n        if (this.done && this._input) {\n            this.done = false;\n        }\n        if (token) {\n            return token;\n        } else if (this._backtrack) {\n            // recover context\n            for (var k in backup) {\n                this[k] = backup[k];\n            }\n            return false; // rule action called reject() implying the next rule should be tested instead.\n        }\n        return false;\n    },\n\n// return next match in input\nnext:function () {\n        if (this.done) {\n            return this.EOF;\n        }\n        if (!this._input) {\n            this.done = true;\n        }\n\n        var token,\n            match,\n            tempMatch,\n            index;\n        if (!this._more) {\n            this.yytext = '';\n            this.match = '';\n        }\n        var rules = this._currentRules();\n        for (var i = 0; i < rules.length; i++) {\n            tempMatch = this._input.match(this.rules[rules[i]]);\n            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n                match = tempMatch;\n                index = i;\n                if (this.options.backtrack_lexer) {\n                    token = this.test_match(tempMatch, rules[i]);\n                    if (token !== false) {\n                        return token;\n                    } else if (this._backtrack) {\n                        match = false;\n                        continue; // rule action called reject() implying a rule MISmatch.\n                    } else {\n                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n                        return false;\n                    }\n                } else if (!this.options.flex) {\n                    break;\n                }\n            }\n        }\n        if (match) {\n            token = this.test_match(match, rules[index]);\n            if (token !== false) {\n                return token;\n            }\n            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n            return false;\n        }\n        if (this._input === \"\") {\n            return this.EOF;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n        }\n    },\n\n// return next match that has a token\nlex:function lex() {\n        var r = this.next();\n        if (r) {\n            return r;\n        } else {\n            return this.lex();\n        }\n    },\n\n// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\nbegin:function begin(condition) {\n        this.conditionStack.push(condition);\n    },\n\n// pop the previously active lexer condition state off the condition stack\npopState:function popState() {\n        var n = this.conditionStack.length - 1;\n        if (n > 0) {\n            return this.conditionStack.pop();\n        } else {\n            return this.conditionStack[0];\n        }\n    },\n\n// produce the lexer rule set which is active for the currently active lexer condition state\n_currentRules:function _currentRules() {\n        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {\n            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n        } else {\n            return this.conditions[\"INITIAL\"].rules;\n        }\n    },\n\n// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\ntopState:function topState(n) {\n        n = this.conditionStack.length - 1 - Math.abs(n || 0);\n        if (n >= 0) {\n            return this.conditionStack[n];\n        } else {\n            return \"INITIAL\";\n        }\n    },\n\n// alias for begin(condition)\npushState:function pushState(condition) {\n        this.begin(condition);\n    },\n\n// return the number of states currently on the stack\nstateStackSize:function stateStackSize() {\n        return this.conditionStack.length;\n    },\noptions: {\"moduleName\":\"haml_lexer\"},\nperformAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\n\nvar YYSTATE=YY_START;\nswitch($avoiding_name_collisions) {\ncase 0:return 'SEPARATOR';\nbreak;\ncase 1:this.popState(); return 'RIGHT_PARENTHESIS';\nbreak;\ncase 2:return 'ATTRIBUTE';\nbreak;\ncase 3:this.begin('value'); return 'EQUAL';\nbreak;\ncase 4:return 'AT_ATTRIBUTE';\nbreak;\ncase 5:this.popState(); return 'ATTRIBUTE_VALUE';\nbreak;\ncase 6:this.popState(); return 'ATTRIBUTE_VALUE';\nbreak;\ncase 7:this.popState(); return 'ATTRIBUTE_VALUE';\nbreak;\ncase 8:yy.indent = 0; this.popState(); return 'NEWLINE';\nbreak;\ncase 9:return 'FILTER_LINE';\nbreak;\ncase 10:yy.indent = 0; return 'NEWLINE';\nbreak;\ncase 11:yy.indent += 1; if(yy.indent > yy.filterIndent){this.begin('filter'); }; return 'INDENT';\nbreak;\ncase 12:this.begin(\"parentheses_attributes\"); return 'LEFT_PARENTHESIS';\nbreak;\ncase 13:yy_.yytext = yy_.yytext.substring(1); return 'COMMENT';\nbreak;\ncase 14:yy.filterIndent = yy.indent; yy_.yytext = yy_.yytext.substring(1); return 'FILTER';\nbreak;\ncase 15:yy_.yytext = yy_.yytext.substring(1); return 'ID';\nbreak;\ncase 16:yy_.yytext = yy_.yytext.substring(1); return 'CLASS';\nbreak;\ncase 17:yy_.yytext = yy_.yytext.substring(1); return 'TAG';\nbreak;\ncase 18:yy_.yytext = yy_.yytext.substring(1).trim(); return 'BUFFERED_CODE';\nbreak;\ncase 19:yy_.yytext = yy_.yytext.substring(1).trim(); return 'UNBUFFERED_CODE';\nbreak;\ncase 20:yy_.yytext = yy_.yytext.trim(); return 'TEXT';\nbreak;\n}\n},\nrules: [/^(?:[ \\t]+)/,/^(?:\\))/,/^(?:([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:=)/,/^(?:@([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:\"(\\\\.|[^\\\\\"])*\")/,/^(?:'(\\\\.|[^\\\\'])*')/,/^(?:[^ \\t\\)]*)/,/^(?:(\\n|$))/,/^(?:[^\\n]*)/,/^(?:\\s*(\\n|$))/,/^(?:(  |\\\\t))/,/^(?:\\()/,/^(?:\\/.*)/,/^(?::([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:#((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:\\.((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:%((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:=.*)/,/^(?:-.*)/,/^(?:.*)/],\nconditions: {\"filter\":{\"rules\":[8,9],\"inclusive\":false},\"value\":{\"rules\":[5,6,7],\"inclusive\":false},\"parentheses_attributes\":{\"rules\":[0,1,2,3,4],\"inclusive\":false},\"INITIAL\":{\"rules\":[10,11,12,13,14,15,16,17,18,19,20],\"inclusive\":true}}\n};\nreturn lexer;\n})();module.exports = haml_lexer;\n\n},{}],8:[function(_dereq_,module,exports){\n/* generated by jison-lex 0.2.1 */\nvar jade_lexer = (function(){\nvar lexer = {\n\nEOF:1,\n\nparseError:function parseError(str, hash) {\n        if (this.yy.parser) {\n            this.yy.parser.parseError(str, hash);\n        } else {\n            throw new Error(str);\n        }\n    },\n\n// resets the lexer, sets new input\nsetInput:function (input) {\n        this._input = input;\n        this._more = this._backtrack = this.done = false;\n        this.yylineno = this.yyleng = 0;\n        this.yytext = this.matched = this.match = '';\n        this.conditionStack = ['INITIAL'];\n        this.yylloc = {\n            first_line: 1,\n            first_column: 0,\n            last_line: 1,\n            last_column: 0\n        };\n        if (this.options.ranges) {\n            this.yylloc.range = [0,0];\n        }\n        this.offset = 0;\n        return this;\n    },\n\n// consumes and returns one char from the input\ninput:function () {\n        var ch = this._input[0];\n        this.yytext += ch;\n        this.yyleng++;\n        this.offset++;\n        this.match += ch;\n        this.matched += ch;\n        var lines = ch.match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno++;\n            this.yylloc.last_line++;\n        } else {\n            this.yylloc.last_column++;\n        }\n        if (this.options.ranges) {\n            this.yylloc.range[1]++;\n        }\n\n        this._input = this._input.slice(1);\n        return ch;\n    },\n\n// unshifts one char (or a string) into the input\nunput:function (ch) {\n        var len = ch.length;\n        var lines = ch.split(/(?:\\r\\n?|\\n)/g);\n\n        this._input = ch + this._input;\n        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);\n        //this.yyleng -= len;\n        this.offset -= len;\n        var oldLines = this.match.split(/(?:\\r\\n?|\\n)/g);\n        this.match = this.match.substr(0, this.match.length - 1);\n        this.matched = this.matched.substr(0, this.matched.length - 1);\n\n        if (lines.length - 1) {\n            this.yylineno -= lines.length - 1;\n        }\n        var r = this.yylloc.range;\n\n        this.yylloc = {\n            first_line: this.yylloc.first_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.first_column,\n            last_column: lines ?\n                (lines.length === oldLines.length ? this.yylloc.first_column : 0)\n                 + oldLines[oldLines.length - lines.length].length - lines[0].length :\n              this.yylloc.first_column - len\n        };\n\n        if (this.options.ranges) {\n            this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n        }\n        this.yyleng = this.yytext.length;\n        return this;\n    },\n\n// When called from action, caches matched text and appends it on next action\nmore:function () {\n        this._more = true;\n        return this;\n    },\n\n// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.\nreject:function () {\n        if (this.options.backtrack_lexer) {\n            this._backtrack = true;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n\n        }\n        return this;\n    },\n\n// retain first n characters of the match\nless:function (n) {\n        this.unput(this.match.slice(n));\n    },\n\n// displays already matched input, i.e. for error messages\npastInput:function () {\n        var past = this.matched.substr(0, this.matched.length - this.match.length);\n        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n/g, \"\");\n    },\n\n// displays upcoming input, i.e. for error messages\nupcomingInput:function () {\n        var next = this.match;\n        if (next.length < 20) {\n            next += this._input.substr(0, 20-next.length);\n        }\n        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\\n/g, \"\");\n    },\n\n// displays the character position where the lexing error occurred, i.e. for error messages\nshowPosition:function () {\n        var pre = this.pastInput();\n        var c = new Array(pre.length + 1).join(\"-\");\n        return pre + this.upcomingInput() + \"\\n\" + c + \"^\";\n    },\n\n// test the lexed token: return FALSE when not a match, otherwise return token\ntest_match:function (match, indexed_rule) {\n        var token,\n            lines,\n            backup;\n\n        if (this.options.backtrack_lexer) {\n            // save context\n            backup = {\n                yylineno: this.yylineno,\n                yylloc: {\n                    first_line: this.yylloc.first_line,\n                    last_line: this.last_line,\n                    first_column: this.yylloc.first_column,\n                    last_column: this.yylloc.last_column\n                },\n                yytext: this.yytext,\n                match: this.match,\n                matches: this.matches,\n                matched: this.matched,\n                yyleng: this.yyleng,\n                offset: this.offset,\n                _more: this._more,\n                _input: this._input,\n                yy: this.yy,\n                conditionStack: this.conditionStack.slice(0),\n                done: this.done\n            };\n            if (this.options.ranges) {\n                backup.yylloc.range = this.yylloc.range.slice(0);\n            }\n        }\n\n        lines = match[0].match(/(?:\\r\\n?|\\n).*/g);\n        if (lines) {\n            this.yylineno += lines.length;\n        }\n        this.yylloc = {\n            first_line: this.yylloc.last_line,\n            last_line: this.yylineno + 1,\n            first_column: this.yylloc.last_column,\n            last_column: lines ?\n                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n?/)[0].length :\n                         this.yylloc.last_column + match[0].length\n        };\n        this.yytext += match[0];\n        this.match += match[0];\n        this.matches = match;\n        this.yyleng = this.yytext.length;\n        if (this.options.ranges) {\n            this.yylloc.range = [this.offset, this.offset += this.yyleng];\n        }\n        this._more = false;\n        this._backtrack = false;\n        this._input = this._input.slice(match[0].length);\n        this.matched += match[0];\n        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);\n        if (this.done && this._input) {\n            this.done = false;\n        }\n        if (token) {\n            return token;\n        } else if (this._backtrack) {\n            // recover context\n            for (var k in backup) {\n                this[k] = backup[k];\n            }\n            return false; // rule action called reject() implying the next rule should be tested instead.\n        }\n        return false;\n    },\n\n// return next match in input\nnext:function () {\n        if (this.done) {\n            return this.EOF;\n        }\n        if (!this._input) {\n            this.done = true;\n        }\n\n        var token,\n            match,\n            tempMatch,\n            index;\n        if (!this._more) {\n            this.yytext = '';\n            this.match = '';\n        }\n        var rules = this._currentRules();\n        for (var i = 0; i < rules.length; i++) {\n            tempMatch = this._input.match(this.rules[rules[i]]);\n            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n                match = tempMatch;\n                index = i;\n                if (this.options.backtrack_lexer) {\n                    token = this.test_match(tempMatch, rules[i]);\n                    if (token !== false) {\n                        return token;\n                    } else if (this._backtrack) {\n                        match = false;\n                        continue; // rule action called reject() implying a rule MISmatch.\n                    } else {\n                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n                        return false;\n                    }\n                } else if (!this.options.flex) {\n                    break;\n                }\n            }\n        }\n        if (match) {\n            token = this.test_match(match, rules[index]);\n            if (token !== false) {\n                return token;\n            }\n            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)\n            return false;\n        }\n        if (this._input === \"\") {\n            return this.EOF;\n        } else {\n            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\\n' + this.showPosition(), {\n                text: \"\",\n                token: null,\n                line: this.yylineno\n            });\n        }\n    },\n\n// return next match that has a token\nlex:function lex() {\n        var r = this.next();\n        if (r) {\n            return r;\n        } else {\n            return this.lex();\n        }\n    },\n\n// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)\nbegin:function begin(condition) {\n        this.conditionStack.push(condition);\n    },\n\n// pop the previously active lexer condition state off the condition stack\npopState:function popState() {\n        var n = this.conditionStack.length - 1;\n        if (n > 0) {\n            return this.conditionStack.pop();\n        } else {\n            return this.conditionStack[0];\n        }\n    },\n\n// produce the lexer rule set which is active for the currently active lexer condition state\n_currentRules:function _currentRules() {\n        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {\n            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n        } else {\n            return this.conditions[\"INITIAL\"].rules;\n        }\n    },\n\n// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available\ntopState:function topState(n) {\n        n = this.conditionStack.length - 1 - Math.abs(n || 0);\n        if (n >= 0) {\n            return this.conditionStack[n];\n        } else {\n            return \"INITIAL\";\n        }\n    },\n\n// alias for begin(condition)\npushState:function pushState(condition) {\n        this.begin(condition);\n    },\n\n// return the number of states currently on the stack\nstateStackSize:function stateStackSize() {\n        return this.conditionStack.length;\n    },\noptions: {\"moduleName\":\"jade_lexer\"},\nperformAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\n\nvar YYSTATE=YY_START;\nswitch($avoiding_name_collisions) {\ncase 0:return 'SEPARATOR';\nbreak;\ncase 1:this.popState(); return 'RIGHT_PARENTHESIS';\nbreak;\ncase 2:return 'ATTRIBUTE';\nbreak;\ncase 3:this.begin('value'); return 'EQUAL';\nbreak;\ncase 4:return 'AT_ATTRIBUTE';\nbreak;\ncase 5:this.popState(); return 'ATTRIBUTE_VALUE';\nbreak;\ncase 6:this.popState(); return 'ATTRIBUTE_VALUE';\nbreak;\ncase 7:this.popState(); return 'ATTRIBUTE_VALUE';\nbreak;\ncase 8:yy.indent = 0; this.popState(); return 'NEWLINE';\nbreak;\ncase 9:return 'FILTER_LINE';\nbreak;\ncase 10:yy.indent = 0; return 'NEWLINE';\nbreak;\ncase 11:yy.indent += 1; if(yy.indent > yy.filterIndent){this.begin('filter'); }; return 'INDENT';\nbreak;\ncase 12:this.begin(\"parentheses_attributes\"); return 'LEFT_PARENTHESIS';\nbreak;\ncase 13:yy_.yytext = yy_.yytext.substring(2); return 'COMMENT';\nbreak;\ncase 14:yy.filterIndent = yy.indent; yy_.yytext = yy_.yytext.substring(1); return 'FILTER';\nbreak;\ncase 15:yy_.yytext = yy_.yytext.substring(1); return 'ID';\nbreak;\ncase 16:yy_.yytext = yy_.yytext.substring(1); return 'CLASS';\nbreak;\ncase 17:return 'TAG';\nbreak;\ncase 18:yy_.yytext = yy_.yytext.substring(1).trim(); return 'BUFFERED_CODE';\nbreak;\ncase 19:yy_.yytext = yy_.yytext.substring(1).trim(); return 'UNBUFFERED_CODE';\nbreak;\ncase 20:yy_.yytext = yy_.yytext.trim(); return 'TEXT';\nbreak;\n}\n},\nrules: [/^(?:[ \\t]+)/,/^(?:\\))/,/^(?:([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:=)/,/^(?:@([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:\"(\\\\.|[^\\\\\"])*\")/,/^(?:'(\\\\.|[^\\\\'])*')/,/^(?:[^ \\t\\)]*)/,/^(?:(\\n|$))/,/^(?:[^\\n]*)/,/^(?:\\s*(\\n|$))/,/^(?:(  |\\\\t))/,/^(?:\\()/,/^(?:\\/\\/.*)/,/^(?::([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:#((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:\\.((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:=.*)/,/^(?:-.*)/,/^(?:.*)/],\nconditions: {\"filter\":{\"rules\":[8,9],\"inclusive\":false},\"value\":{\"rules\":[5,6,7],\"inclusive\":false},\"parentheses_attributes\":{\"rules\":[0,1,2,3,4],\"inclusive\":false},\"INITIAL\":{\"rules\":[10,11,12,13,14,15,16,17,18,19,20],\"inclusive\":true}}\n};\nreturn lexer;\n})();module.exports = jade_lexer;\n\n},{}],9:[function(_dereq_,module,exports){\n// Generated by CoffeeScript 1.7.1\n(function() {\n  var extend, lexers, oldParse, parser,\n    __slice = [].slice;\n\n  parser = _dereq_(\"./parser\").parser;\n\n  lexers = {\n    haml: _dereq_(\"./haml_lexer\"),\n    jade: _dereq_(\"./jade_lexer\")\n  };\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  oldParse = parser.parse;\n\n  extend(parser, {\n    parse: function(input, mode) {\n      if (mode == null) {\n        mode = \"haml\";\n      }\n      parser.lexer = lexers[mode];\n      extend(parser.yy, {\n        indent: 0,\n        nodePath: [\n          {\n            children: []\n          }\n        ],\n        filterIndent: void 0\n      });\n      return oldParse.call(parser, input);\n    }\n  });\n\n  extend(parser.yy, {\n    extend: extend,\n    newline: function() {\n      var lastNode;\n      lastNode = this.nodePath[this.nodePath.length - 1];\n      if (lastNode.filter) {\n        return this.appendFilterContent(lastNode, \"\");\n      }\n    },\n    lastParent: function(indentation) {\n      var parent;\n      while (!(parent = this.nodePath[indentation])) {\n        indentation -= 1;\n      }\n      return parent;\n    },\n    append: function(node, indentation) {\n      var index, lastNode, parent;\n      if (indentation == null) {\n        indentation = 0;\n      }\n      if (node.filterLine) {\n        lastNode = this.nodePath[this.nodePath.length - 1];\n        this.appendFilterContent(lastNode, node.filterLine);\n        return;\n      }\n      parent = this.lastParent(indentation);\n      this.appendChild(parent, node);\n      index = indentation + 1;\n      this.nodePath[index] = node;\n      this.nodePath.length = index + 1;\n      return node;\n    },\n    appendChild: function(parent, child) {\n      if (!child.filter) {\n        this.filterIndent = void 0;\n        this.lexer.popState();\n      }\n      parent.children || (parent.children = []);\n      return parent.children.push(child);\n    },\n    appendFilterContent: function(filter, content) {\n      filter.content || (filter.content = \"\");\n      return filter.content += \"\" + content + \"\\n\";\n    }\n  });\n\n  module.exports = parser;\n\n}).call(this);\n\n},{\"./haml_lexer\":7,\"./jade_lexer\":8,\"./parser\":10}],10:[function(_dereq_,module,exports){\n(function (process){\n/* parser generated by jison 0.4.6 */\n/*\n  Returns a Parser object of the following structure:\n\n  Parser: {\n    yy: {}\n  }\n\n  Parser.prototype: {\n    yy: {},\n    trace: function(),\n    symbols_: {associative list: name ==> number},\n    terminals_: {associative list: number ==> name},\n    productions_: [...],\n    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\n    table: [...],\n    defaultActions: {...},\n    parseError: function(str, hash),\n    parse: function(input),\n\n    lexer: {\n        EOF: 1,\n        parseError: function(str, hash),\n        setInput: function(input),\n        input: function(),\n        unput: function(str),\n        more: function(),\n        less: function(n),\n        pastInput: function(),\n        upcomingInput: function(),\n        showPosition: function(),\n        test_match: function(regex_match_array, rule_index),\n        next: function(),\n        lex: function(),\n        begin: function(condition),\n        popState: function(),\n        _currentRules: function(),\n        topState: function(),\n        pushState: function(condition),\n\n        options: {\n            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\n            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\n            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\n        },\n\n        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\n        rules: [...],\n        conditions: {associative list: name ==> set},\n    }\n  }\n\n\n  token location info (@$, _$, etc.): {\n    first_line: n,\n    last_line: n,\n    first_column: n,\n    last_column: n,\n    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\n  }\n\n\n  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\n    text:        (matched text)\n    token:       (the produced terminal token, if any)\n    line:        (yylineno)\n  }\n  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\n    loc:         (yylloc)\n    expected:    (string describing the set of expected tokens)\n    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\n  }\n*/\nvar parser = (function(){\nvar parser = {trace: function trace() { },\nyy: {},\nsymbols_: {\"error\":2,\"root\":3,\"lines\":4,\"line\":5,\"indentation\":6,\"indentationLevel\":7,\"INDENT\":8,\"lineMain\":9,\"end\":10,\"tag\":11,\"rest\":12,\"COMMENT\":13,\"FILTER\":14,\"FILTER_LINE\":15,\"NEWLINE\":16,\"name\":17,\"tagComponents\":18,\"attributes\":19,\"idComponent\":20,\"classComponents\":21,\"ID\":22,\"CLASS\":23,\"LEFT_PARENTHESIS\":24,\"attributePairs\":25,\"RIGHT_PARENTHESIS\":26,\"SEPARATOR\":27,\"attributePair\":28,\"ATTRIBUTE\":29,\"EQUAL\":30,\"ATTRIBUTE_VALUE\":31,\"AT_ATTRIBUTE\":32,\"TAG\":33,\"BUFFERED_CODE\":34,\"UNBUFFERED_CODE\":35,\"TEXT\":36,\"$accept\":0,\"$end\":1},\nterminals_: {2:\"error\",8:\"INDENT\",13:\"COMMENT\",14:\"FILTER\",15:\"FILTER_LINE\",16:\"NEWLINE\",22:\"ID\",23:\"CLASS\",24:\"LEFT_PARENTHESIS\",26:\"RIGHT_PARENTHESIS\",27:\"SEPARATOR\",29:\"ATTRIBUTE\",30:\"EQUAL\",31:\"ATTRIBUTE_VALUE\",32:\"AT_ATTRIBUTE\",33:\"TAG\",34:\"BUFFERED_CODE\",35:\"UNBUFFERED_CODE\",36:\"TEXT\"},\nproductions_: [0,[3,1],[4,2],[4,1],[6,0],[6,1],[7,2],[7,1],[5,3],[5,1],[9,2],[9,1],[9,1],[9,1],[9,1],[9,1],[10,1],[11,2],[11,2],[11,1],[11,1],[18,3],[18,2],[18,2],[18,2],[18,1],[18,1],[20,1],[21,2],[21,1],[19,3],[25,3],[25,1],[28,3],[28,1],[17,1],[12,1],[12,1],[12,1]],\nperformAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {\n/* this == yyval */\n\nvar $0 = $$.length - 1;\nswitch (yystate) {\ncase 1:return this.$ = yy.nodePath[0].children;\nbreak;\ncase 2:this.$ = $$[$0-1];\nbreak;\ncase 3:this.$ = $$[$0];\nbreak;\ncase 4:this.$ = 0;\nbreak;\ncase 5:this.$ = $$[$0];\nbreak;\ncase 6:this.$ = $$[$0-1] + 1;\nbreak;\ncase 7:this.$ = 1;\nbreak;\ncase 8:this.$ = yy.append($$[$0-1], $$[$0-2]);\nbreak;\ncase 9:this.$ = (function () {\n        if ($$[$0].newline) {\n          return yy.newline();\n        }\n      }());\nbreak;\ncase 10:this.$ = yy.extend($$[$0-1], $$[$0]);\nbreak;\ncase 11:this.$ = $$[$0];\nbreak;\ncase 12:this.$ = $$[$0];\nbreak;\ncase 13:this.$ = {\n          comment: $$[$0]\n        };\nbreak;\ncase 14:this.$ = {\n          filter: $$[$0]\n        };\nbreak;\ncase 15:this.$ = {\n          filterLine: $$[$0]\n        };\nbreak;\ncase 16:this.$ = {\n          newline: true\n        };\nbreak;\ncase 17:this.$ = (function () {\n        $$[$0].tag = $$[$0-1];\n        return $$[$0];\n      }());\nbreak;\ncase 18:this.$ = {\n          tag: $$[$0-1],\n          attributes: $$[$0]\n        };\nbreak;\ncase 19:this.$ = {\n          tag: $$[$0]\n        };\nbreak;\ncase 20:this.$ = yy.extend($$[$0], {\n          tag: \"div\"\n        });\nbreak;\ncase 21:this.$ = {\n          id: $$[$0-2],\n          classes: $$[$0-1],\n          attributes: $$[$0]\n        };\nbreak;\ncase 22:this.$ = {\n          id: $$[$0-1],\n          attributes: $$[$0]\n        };\nbreak;\ncase 23:this.$ = {\n          classes: $$[$0-1],\n          attributes: $$[$0]\n        };\nbreak;\ncase 24:this.$ = {\n          id: $$[$0-1],\n          classes: $$[$0]\n        };\nbreak;\ncase 25:this.$ = {\n          id: $$[$0]\n        };\nbreak;\ncase 26:this.$ = {\n          classes: $$[$0]\n        };\nbreak;\ncase 27:this.$ = $$[$0];\nbreak;\ncase 28:this.$ = $$[$0-1].concat($$[$0]);\nbreak;\ncase 29:this.$ = [$$[$0]];\nbreak;\ncase 30:this.$ = $$[$0-1];\nbreak;\ncase 31:this.$ = $$[$0-2].concat($$[$0]);\nbreak;\ncase 32:this.$ = [$$[$0]];\nbreak;\ncase 33:this.$ = {\n          name: $$[$0-2],\n          value: $$[$0]\n        };\nbreak;\ncase 34:this.$ = {\n          name: $$[$0].substring(1),\n          value: $$[$0]\n        };\nbreak;\ncase 35:this.$ = $$[$0];\nbreak;\ncase 36:this.$ = {\n          bufferedCode: $$[$0]\n        };\nbreak;\ncase 37:this.$ = {\n          unbufferedCode: $$[$0]\n        };\nbreak;\ncase 38:this.$ = {\n          text: $$[$0] + \"\\n\"\n        };\nbreak;\n}\n},\ntable: [{3:1,4:2,5:3,6:4,7:6,8:[1,8],10:5,13:[2,4],14:[2,4],15:[2,4],16:[1,7],22:[2,4],23:[2,4],33:[2,4],34:[2,4],35:[2,4],36:[2,4]},{1:[3]},{1:[2,1],5:9,6:4,7:6,8:[1,8],10:5,13:[2,4],14:[2,4],15:[2,4],16:[1,7],22:[2,4],23:[2,4],33:[2,4],34:[2,4],35:[2,4],36:[2,4]},{1:[2,3],8:[2,3],13:[2,3],14:[2,3],15:[2,3],16:[2,3],22:[2,3],23:[2,3],33:[2,3],34:[2,3],35:[2,3],36:[2,3]},{9:10,11:11,12:12,13:[1,13],14:[1,14],15:[1,15],17:16,18:17,20:22,21:23,22:[1,24],23:[1,25],33:[1,21],34:[1,18],35:[1,19],36:[1,20]},{1:[2,9],8:[2,9],13:[2,9],14:[2,9],15:[2,9],16:[2,9],22:[2,9],23:[2,9],33:[2,9],34:[2,9],35:[2,9],36:[2,9]},{8:[1,26],13:[2,5],14:[2,5],15:[2,5],22:[2,5],23:[2,5],33:[2,5],34:[2,5],35:[2,5],36:[2,5]},{1:[2,16],8:[2,16],13:[2,16],14:[2,16],15:[2,16],16:[2,16],22:[2,16],23:[2,16],33:[2,16],34:[2,16],35:[2,16],36:[2,16]},{8:[2,7],13:[2,7],14:[2,7],15:[2,7],22:[2,7],23:[2,7],33:[2,7],34:[2,7],35:[2,7],36:[2,7]},{1:[2,2],8:[2,2],13:[2,2],14:[2,2],15:[2,2],16:[2,2],22:[2,2],23:[2,2],33:[2,2],34:[2,2],35:[2,2],36:[2,2]},{10:27,16:[1,7]},{12:28,16:[2,11],34:[1,18],35:[1,19],36:[1,20]},{16:[2,12]},{16:[2,13]},{16:[2,14]},{16:[2,15]},{16:[2,19],18:29,19:30,20:22,21:23,22:[1,24],23:[1,25],24:[1,31],34:[2,19],35:[2,19],36:[2,19]},{16:[2,20],34:[2,20],35:[2,20],36:[2,20]},{16:[2,36]},{16:[2,37]},{16:[2,38]},{16:[2,35],22:[2,35],23:[2,35],24:[2,35],34:[2,35],35:[2,35],36:[2,35]},{16:[2,25],19:33,21:32,23:[1,25],24:[1,31],34:[2,25],35:[2,25],36:[2,25]},{16:[2,26],19:34,23:[1,35],24:[1,31],34:[2,26],35:[2,26],36:[2,26]},{16:[2,27],23:[2,27],24:[2,27],34:[2,27],35:[2,27],36:[2,27]},{16:[2,29],23:[2,29],24:[2,29],34:[2,29],35:[2,29],36:[2,29]},{8:[2,6],13:[2,6],14:[2,6],15:[2,6],22:[2,6],23:[2,6],33:[2,6],34:[2,6],35:[2,6],36:[2,6]},{1:[2,8],8:[2,8],13:[2,8],14:[2,8],15:[2,8],16:[2,8],22:[2,8],23:[2,8],33:[2,8],34:[2,8],35:[2,8],36:[2,8]},{16:[2,10]},{16:[2,17],34:[2,17],35:[2,17],36:[2,17]},{16:[2,18],34:[2,18],35:[2,18],36:[2,18]},{25:36,28:37,29:[1,38],32:[1,39]},{16:[2,24],19:40,23:[1,35],24:[1,31],34:[2,24],35:[2,24],36:[2,24]},{16:[2,22],34:[2,22],35:[2,22],36:[2,22]},{16:[2,23],34:[2,23],35:[2,23],36:[2,23]},{16:[2,28],23:[2,28],24:[2,28],34:[2,28],35:[2,28],36:[2,28]},{26:[1,41],27:[1,42]},{26:[2,32],27:[2,32]},{30:[1,43]},{26:[2,34],27:[2,34]},{16:[2,21],34:[2,21],35:[2,21],36:[2,21]},{16:[2,30],34:[2,30],35:[2,30],36:[2,30]},{28:44,29:[1,38],32:[1,39]},{31:[1,45]},{26:[2,31],27:[2,31]},{26:[2,33],27:[2,33]}],\ndefaultActions: {12:[2,12],13:[2,13],14:[2,14],15:[2,15],18:[2,36],19:[2,37],20:[2,38],28:[2,10]},\nparseError: function parseError(str, hash) {\n    if (hash.recoverable) {\n        this.trace(str);\n    } else {\n        throw new Error(str);\n    }\n},\nparse: function parse(input) {\n    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;\n    this.lexer.setInput(input);\n    this.lexer.yy = this.yy;\n    this.yy.lexer = this.lexer;\n    this.yy.parser = this;\n    if (typeof this.lexer.yylloc == 'undefined') {\n        this.lexer.yylloc = {};\n    }\n    var yyloc = this.lexer.yylloc;\n    lstack.push(yyloc);\n    var ranges = this.lexer.options && this.lexer.options.ranges;\n    if (typeof this.yy.parseError === 'function') {\n        this.parseError = this.yy.parseError;\n    } else {\n        this.parseError = Object.getPrototypeOf(this).parseError;\n    }\n    function popStack(n) {\n        stack.length = stack.length - 2 * n;\n        vstack.length = vstack.length - n;\n        lstack.length = lstack.length - n;\n    }\n    function lex() {\n        var token;\n        token = self.lexer.lex() || EOF;\n        if (typeof token !== 'number') {\n            token = self.symbols_[token] || token;\n        }\n        return token;\n    }\n    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;\n    while (true) {\n        state = stack[stack.length - 1];\n        if (this.defaultActions[state]) {\n            action = this.defaultActions[state];\n        } else {\n            if (symbol === null || typeof symbol == 'undefined') {\n                symbol = lex();\n            }\n            action = table[state] && table[state][symbol];\n        }\n                    if (typeof action === 'undefined' || !action.length || !action[0]) {\n                var errStr = '';\n                expected = [];\n                for (p in table[state]) {\n                    if (this.terminals_[p] && p > TERROR) {\n                        expected.push('\\'' + this.terminals_[p] + '\\'');\n                    }\n                }\n                if (this.lexer.showPosition) {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\\n' + this.lexer.showPosition() + '\\nExpecting ' + expected.join(', ') + ', got \\'' + (this.terminals_[symbol] || symbol) + '\\'';\n                } else {\n                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\\'' + (this.terminals_[symbol] || symbol) + '\\'');\n                }\n                this.parseError(errStr, {\n                    text: this.lexer.match,\n                    token: this.terminals_[symbol] || symbol,\n                    line: this.lexer.yylineno,\n                    loc: yyloc,\n                    expected: expected\n                });\n            }\n        if (action[0] instanceof Array && action.length > 1) {\n            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);\n        }\n        switch (action[0]) {\n        case 1:\n            stack.push(symbol);\n            vstack.push(this.lexer.yytext);\n            lstack.push(this.lexer.yylloc);\n            stack.push(action[1]);\n            symbol = null;\n            if (!preErrorSymbol) {\n                yyleng = this.lexer.yyleng;\n                yytext = this.lexer.yytext;\n                yylineno = this.lexer.yylineno;\n                yyloc = this.lexer.yylloc;\n                if (recovering > 0) {\n                    recovering--;\n                }\n            } else {\n                symbol = preErrorSymbol;\n                preErrorSymbol = null;\n            }\n            break;\n        case 2:\n            len = this.productions_[action[1]][1];\n            yyval.$ = vstack[vstack.length - len];\n            yyval._$ = {\n                first_line: lstack[lstack.length - (len || 1)].first_line,\n                last_line: lstack[lstack.length - 1].last_line,\n                first_column: lstack[lstack.length - (len || 1)].first_column,\n                last_column: lstack[lstack.length - 1].last_column\n            };\n            if (ranges) {\n                yyval._$.range = [\n                    lstack[lstack.length - (len || 1)].range[0],\n                    lstack[lstack.length - 1].range[1]\n                ];\n            }\n            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);\n            if (typeof r !== 'undefined') {\n                return r;\n            }\n            if (len) {\n                stack = stack.slice(0, -1 * len * 2);\n                vstack = vstack.slice(0, -1 * len);\n                lstack = lstack.slice(0, -1 * len);\n            }\n            stack.push(this.productions_[action[1]][0]);\n            vstack.push(yyval.$);\n            lstack.push(yyval._$);\n            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];\n            stack.push(newState);\n            break;\n        case 3:\n            return true;\n        }\n    }\n    return true;\n}};\nundefined\nfunction Parser () {\n  this.yy = {};\n}\nParser.prototype = parser;parser.Parser = Parser;\nreturn new Parser;\n})();\n\n\nif (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {\nexports.parser = parser;\nexports.Parser = parser.Parser;\nexports.parse = function () { return parser.parse.apply(parser, arguments); };\nexports.main = function commonjsMain(args) {\n    if (!args[1]) {\n        console.log('Usage: '+args[0]+' FILE');\n        process.exit(1);\n    }\n    var source = _dereq_('fs').readFileSync(_dereq_('path').normalize(args[1]), \"utf8\");\n    return exports.parser.parse(source);\n};\nif (typeof module !== 'undefined' && _dereq_.main === module) {\n  exports.main(process.argv.slice(1));\n}\n}\n}).call(this,_dereq_(\"FWaASH\"))\n},{\"FWaASH\":4,\"fs\":2,\"path\":3}],11:[function(_dereq_,module,exports){\n// Generated by CoffeeScript 1.7.1\n(function() {\n  \"use strict\";\n  var Observable, Runtime, bindEvent, bindObservable, bufferTo, classes, createElement, empty, eventNames, get, id, isEvent, isFragment, makeElement, observeAttribute, observeAttributes, observeContent, specialBindings, valueBind, valueIndexOf;\n\n  Observable = _dereq_(\"o_0\");\n\n  eventNames = \"abort\\nblur\\nchange\\nclick\\ndblclick\\ndrag\\ndragend\\ndragenter\\ndragleave\\ndragover\\ndragstart\\ndrop\\nerror\\nfocus\\ninput\\nkeydown\\nkeypress\\nkeyup\\nload\\nmousedown\\nmousemove\\nmouseout\\nmouseover\\nmouseup\\nreset\\nresize\\nscroll\\nselect\\nsubmit\\ntouchcancel\\ntouchend\\ntouchenter\\ntouchleave\\ntouchmove\\ntouchstart\\nunload\".split(\"\\n\");\n\n  isEvent = function(name) {\n    return eventNames.indexOf(name) !== -1;\n  };\n\n  isFragment = function(node) {\n    return (node != null ? node.nodeType : void 0) === 11;\n  };\n\n  valueBind = function(element, value, context) {\n    Observable(function() {\n      var update;\n      value = Observable(value, context);\n      switch (element.nodeName) {\n        case \"SELECT\":\n          element.oninput = element.onchange = function() {\n            var optionValue, _ref, _value;\n            _ref = this.children[this.selectedIndex], optionValue = _ref.value, _value = _ref._value;\n            return value(_value || optionValue);\n          };\n          update = function(newValue) {\n            var options;\n            element._value = newValue;\n            if ((options = element._options)) {\n              if (newValue.value != null) {\n                return element.value = (typeof newValue.value === \"function\" ? newValue.value() : void 0) || newValue.value;\n              } else {\n                return element.selectedIndex = valueIndexOf(options, newValue);\n              }\n            } else {\n              return element.value = newValue;\n            }\n          };\n          return bindObservable(element, value, context, update);\n        default:\n          element.oninput = element.onchange = function() {\n            return value(element.value);\n          };\n          if (typeof element.attachEvent === \"function\") {\n            element.attachEvent(\"onkeydown\", function() {\n              return setTimeout(function() {\n                return value(element.value);\n              }, 0);\n            });\n          }\n          return bindObservable(element, value, context, function(newValue) {\n            if (element.value !== newValue) {\n              return element.value = newValue;\n            }\n          });\n      }\n    });\n  };\n\n  specialBindings = {\n    INPUT: {\n      checked: function(element, value, context) {\n        element.onchange = function() {\n          return typeof value === \"function\" ? value(element.checked) : void 0;\n        };\n        return bindObservable(element, value, context, function(newValue) {\n          return element.checked = newValue;\n        });\n      }\n    },\n    SELECT: {\n      options: function(element, values, context) {\n        var updateValues;\n        values = Observable(values, context);\n        updateValues = function(values) {\n          empty(element);\n          element._options = values;\n          return values.map(function(value, index) {\n            var option, optionName, optionValue;\n            option = createElement(\"option\");\n            option._value = value;\n            if (typeof value === \"object\") {\n              optionValue = (value != null ? value.value : void 0) || index;\n            } else {\n              optionValue = value.toString();\n            }\n            bindObservable(option, optionValue, value, function(newValue) {\n              return option.value = newValue;\n            });\n            optionName = (value != null ? value.name : void 0) || value;\n            bindObservable(option, optionName, value, function(newValue) {\n              return option.textContent = option.innerText = newValue;\n            });\n            element.appendChild(option);\n            if (value === element._value) {\n              element.selectedIndex = index;\n            }\n            return option;\n          });\n        };\n        return bindObservable(element, values, context, updateValues);\n      }\n    }\n  };\n\n  observeAttribute = function(element, context, name, value) {\n    var binding, nodeName, _ref;\n    nodeName = element.nodeName;\n    if (name === \"value\") {\n      valueBind(element, value);\n    } else if (binding = (_ref = specialBindings[nodeName]) != null ? _ref[name] : void 0) {\n      binding(element, value, context);\n    } else if (name.match(/^on/) && isEvent(name.substr(2))) {\n      bindEvent(element, name, value, context);\n    } else if (isEvent(name)) {\n      bindEvent(element, \"on\" + name, value, context);\n    } else {\n      bindObservable(element, value, context, function(newValue) {\n        if ((newValue != null) && newValue !== false) {\n          return element.setAttribute(name, newValue);\n        } else {\n          return element.removeAttribute(name);\n        }\n      });\n    }\n    return element;\n  };\n\n  observeAttributes = function(element, context, attributes) {\n    return Object.keys(attributes).forEach(function(name) {\n      var value;\n      value = attributes[name];\n      return observeAttribute(element, context, name, value);\n    });\n  };\n\n  bindObservable = function(element, value, context, update) {\n    var observable, observe, unobserve;\n    observable = Observable(value, context);\n    observe = function() {\n      observable.observe(update);\n      return update(observable());\n    };\n    unobserve = function() {\n      return observable.stopObserving(update);\n    };\n    observe();\n    return element;\n  };\n\n  bindEvent = function(element, name, fn, context) {\n    return element[name] = function() {\n      return fn.apply(context, arguments);\n    };\n  };\n\n  id = function(element, context, sources) {\n    var lastId, update, value;\n    value = Observable.concat.apply(Observable, sources.map(function(source) {\n      return Observable(source, context);\n    }));\n    update = function(newId) {\n      return element.id = newId;\n    };\n    lastId = function() {\n      return value.last();\n    };\n    return bindObservable(element, lastId, context, update);\n  };\n\n  classes = function(element, context, sources) {\n    var classNames, update, value;\n    value = Observable.concat.apply(Observable, sources.map(function(source) {\n      return Observable(source, context);\n    }));\n    update = function(classNames) {\n      return element.className = classNames;\n    };\n    classNames = function() {\n      return value.join(\" \");\n    };\n    return bindObservable(element, classNames, context, update);\n  };\n\n  createElement = function(name) {\n    return document.createElement(name);\n  };\n\n  observeContent = function(element, context, contentFn) {\n    var append, contents, update;\n    contents = [];\n    contentFn.call(context, {\n      buffer: bufferTo(context, contents),\n      element: makeElement\n    });\n    append = function(item) {\n      if (typeof item === \"string\") {\n        return element.appendChild(document.createTextNode(item));\n      } else if (typeof item === \"number\") {\n        return element.appendChild(document.createTextNode(item));\n      } else if (typeof item === \"boolean\") {\n        return element.appendChild(document.createTextNode(item));\n      } else if (typeof item.each === \"function\") {\n        return item.each(append);\n      } else if (typeof item.forEach === \"function\") {\n        return item.forEach(append);\n      } else {\n        return element.appendChild(item);\n      }\n    };\n    update = function(contents) {\n      empty(element);\n      return contents.forEach(append);\n    };\n    return update(contents);\n  };\n\n  bufferTo = function(context, collection) {\n    return function(content) {\n      if (typeof content === 'function') {\n        content = Observable(content, context);\n      }\n      collection.push(content);\n      return content;\n    };\n  };\n\n  makeElement = function(name, context, attributes, fn) {\n    var element;\n    if (attributes == null) {\n      attributes = {};\n    }\n    element = createElement(name);\n    Observable(function() {\n      if (attributes.id != null) {\n        id(element, context, attributes.id);\n        return delete attributes.id;\n      }\n    });\n    Observable(function() {\n      if (attributes[\"class\"] != null) {\n        classes(element, context, attributes[\"class\"]);\n        return delete attributes[\"class\"];\n      }\n    });\n    Observable(function() {\n      return observeAttributes(element, context, attributes);\n    }, context);\n    if (element.nodeName !== \"SELECT\") {\n      Observable(function() {\n        return observeContent(element, context, fn);\n      }, context);\n    }\n    return element;\n  };\n\n  Runtime = function(context) {\n    var self;\n    self = {\n      buffer: function(content) {\n        if (self.root) {\n          throw \"Cannot have multiple root elements\";\n        }\n        return self.root = content;\n      },\n      element: makeElement,\n      filter: function(name, content) {}\n    };\n    return self;\n  };\n\n  Runtime.VERSION = _dereq_(\"../package.json\").version;\n\n  Runtime.Observable = Observable;\n\n  module.exports = Runtime;\n\n  empty = function(node) {\n    var child, _results;\n    _results = [];\n    while (child = node.firstChild) {\n      _results.push(node.removeChild(child));\n    }\n    return _results;\n  };\n\n  valueIndexOf = function(options, value) {\n    if (typeof value === \"object\") {\n      return options.indexOf(value);\n    } else {\n      return options.map(function(option) {\n        return option.toString();\n      }).indexOf(value.toString());\n    }\n  };\n\n  get = function(x) {\n    if (typeof x === 'function') {\n      return x();\n    } else {\n      return x;\n    }\n  };\n\n}).call(this);\n\n},{\"../package.json\":13,\"o_0\":12}],12:[function(_dereq_,module,exports){\n(function (global){\n// Generated by CoffeeScript 1.8.0\n(function() {\n  var Observable, autoDeps, computeDependencies, copy, extend, flatten, get, last, magicDependency, remove, splat, withBase,\n    __slice = [].slice;\n\n  Observable = function(value, context) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return copy(listeners).forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      changed = function() {\n        value = computeDependencies(self, fn, changed, context);\n        return notify(value);\n      };\n      value = computeDependencies(self, fn, changed, context);\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n    }\n    self.each = function(callback) {\n      magicDependency(self);\n      if (value != null) {\n        [value].forEach(function(item) {\n          return callback.call(item, item);\n        });\n      }\n      return self;\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          magicDependency(self);\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function(callback) {\n          self.forEach(function(item, index) {\n            return callback.call(item, item, index, self);\n          });\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          magicDependency(self);\n          return value[index];\n        },\n        first: function() {\n          magicDependency(self);\n          return value[0];\n        },\n        last: function() {\n          magicDependency(self);\n          return value[value.length - 1];\n        },\n        size: function() {\n          magicDependency(self);\n          return value.length;\n        }\n      });\n    }\n    extend(self, {\n      listeners: listeners,\n      observe: function(listener) {\n        return listeners.push(listener);\n      },\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  Observable.concat = function() {\n    var args, o;\n    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    args = Observable(args);\n    o = Observable(function() {\n      return flatten(args.map(splat));\n    });\n    o.push = args.push;\n    return o;\n  };\n\n  module.exports = Observable;\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = [];\n\n  autoDeps = function() {\n    return last(global.OBSERVABLE_ROOT_HACK);\n  };\n\n  magicDependency = function(self) {\n    var observerStack;\n    if (observerStack = autoDeps()) {\n      return observerStack.push(self);\n    }\n  };\n\n  withBase = function(self, update, fn) {\n    var deps, value, _ref;\n    global.OBSERVABLE_ROOT_HACK.push(deps = []);\n    try {\n      value = fn();\n      if ((_ref = self._deps) != null) {\n        _ref.forEach(function(observable) {\n          return observable.stopObserving(update);\n        });\n      }\n      self._deps = deps;\n      deps.forEach(function(observable) {\n        return observable.observe(update);\n      });\n    } finally {\n      global.OBSERVABLE_ROOT_HACK.pop();\n    }\n    return value;\n  };\n\n  computeDependencies = function(self, fn, update, context) {\n    return withBase(self, update, function() {\n      return fn.call(context);\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n  copy = function(array) {\n    return array.concat([]);\n  };\n\n  get = function(arg) {\n    if (typeof arg === \"function\") {\n      return arg();\n    } else {\n      return arg;\n    }\n  };\n\n  splat = function(item) {\n    var result, results;\n    results = [];\n    if (item == null) {\n      return results;\n    }\n    if (typeof item.forEach === \"function\") {\n      item.forEach(function(i) {\n        return results.push(i);\n      });\n    } else {\n      result = get(item);\n      if (result != null) {\n        results.push(result);\n      }\n    }\n    return results;\n  };\n\n  last = function(array) {\n    return array[array.length - 1];\n  };\n\n  flatten = function(array) {\n    return array.reduce(function(a, b) {\n      return a.concat(b);\n    }, []);\n  };\n\n}).call(this);\n\n}).call(this,typeof self !== \"undefined\" ? self : typeof window !== \"undefined\" ? window : {})\n},{}],13:[function(_dereq_,module,exports){\nmodule.exports={\n  \"name\": \"hamlet-runtime\",\n  \"version\": \"0.7.0\",\n  \"devDependencies\": {\n    \"browserify\": \"^4.1.11\",\n    \"coffee-script\": \"~1.7.1\",\n    \"hamlet-compiler\": \"0.7.0\",\n    \"jsdom\": \"^0.10.5\",\n    \"mocha\": \"~1.12.0\",\n    \"uglify-js\": \"~2.3.6\"\n  },\n  \"dependencies\": {\n    \"o_0\": \"0.3.3\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/dr-coffee-labs/hamlet-compiler.git\"\n  },\n  \"scripts\": {\n    \"prepublish\": \"script/prepublish\",\n    \"test\": \"script/test\"\n  },\n  \"files\": [\n    \"dist/\"\n  ],\n  \"main\": \"dist/runtime.js\",\n  \"bugs\": {\n    \"url\": \"https://github.com/dr-coffee-labs/hamlet-compiler/issues\"\n  },\n  \"homepage\": \"https://github.com/dr-coffee-labs/hamlet-compiler\",\n  \"_id\": \"hamlet-runtime@0.7.0\",\n  \"_shasum\": \"2ca3b4729fa92282818cff8f4c5d4f14583538fc\",\n  \"_from\": \"hamlet-runtime@0.7.0\",\n  \"_npmVersion\": \"1.4.9\",\n  \"_npmUser\": {\n    \"name\": \"strd6\",\n    \"email\": \"yahivin@gmail.com\"\n  },\n  \"maintainers\": [\n    {\n      \"name\": \"strd6\",\n      \"email\": \"yahivin@gmail.com\"\n    }\n  ],\n  \"dist\": {\n    \"shasum\": \"2ca3b4729fa92282818cff8f4c5d4f14583538fc\",\n    \"tarball\": \"http://registry.npmjs.org/hamlet-runtime/-/hamlet-runtime-0.7.0.tgz\"\n  },\n  \"directories\": {},\n  \"_resolved\": \"https://registry.npmjs.org/hamlet-runtime/-/hamlet-runtime-0.7.0.tgz\"\n}\n\n},{}]},{},[1])\n(1)\n});\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "version": "0.2.0",
  "entryPoint": "main",
  "repository": {
    "branch": "remove-jquery",
    "default_branch": "master",
    "full_name": "STRd6/pixel-editor",
    "homepage": "https://danielx.net/pixel-editor/",
    "description": "It edits pixels",
    "html_url": "https://github.com/STRd6/pixel-editor",
    "url": "https://api.github.com/repos/STRd6/pixel-editor",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "ajax": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2016 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "# ajax\n\nA Promise returning wrapper for XMLHttpRequest\n\nThis aims to be a very small and very direct wrapper for XMLHttpRequest. We\nreturn a native promise and configure the requets via an options object.\n\n\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "{extend, defaults} = require \"./util\"\n\nmodule.exports = ->\n  ajax = (options={}) ->\n    {data, headers, method, overrideMimeType, password, url, responseType, timeout, user, withCredentials} = options\n    data ?= \"\"\n    method ?= \"GET\"\n    password ?= \"\"\n    responseType ?= \"\"\n    timeout ?= 0\n    user ?= \"\"\n    withCredentials ?= false\n\n    new Promise (resolve, reject) ->\n      xhr = new XMLHttpRequest()\n      xhr.open(method, url, true, user, password)\n      xhr.responseType = responseType\n      xhr.timeout = timeout\n      xhr.withCredentialls = withCredentials\n\n      if headers\n        Object.keys(headers).forEach (header) ->\n          value = headers[header]\n          xhr.setRequestHeader header, value\n\n      if overrideMimeType\n        xhr.overrideMimeType overrideMimeType\n\n      xhr.onload = (e) ->\n        if (200 <= this.status < 300) or this.status is 304\n          resolve this.response\n          complete e, xhr, options\n        else\n          reject xhr\n          complete e, xhr, options\n\n      xhr.onerror = (e) ->\n        reject xhr\n        complete e, xhr, options\n\n      xhr.send(data)\n\n  complete = (args...) ->\n    completeHandlers.forEach (handler) ->\n      handler args...\n\n  configure = (optionDefaults) ->\n    (url, options={}) ->\n      if typeof url is \"object\"\n        options = url\n      else\n        options.url = url\n\n      defaults options, optionDefaults\n\n      ajax(options)\n\n  completeHandlers = []\n\n  extend ajax,\n    ajax: configure {}\n    complete: (handler) ->\n      completeHandlers.push handler\n\n    getJSON: configure\n      responseType: \"json\"\n\n    getBlob: configure\n      responseType: \"blob\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.4\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "Ajax = require \"../main\"\n\ndescribe \"Ajax\", ->\n  it \"should getJSON\", (done) ->\n    ajax = Ajax()\n\n    ajax\n      url: \"https://api.github.com/users\"\n      responseType: \"json\"\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n\n  it \"should have complete handlers\", (done) ->\n    ajax = Ajax()\n\n    ajax.complete (e, xhr, options) ->\n      done()\n\n    ajax.getJSON(\"https://api.github.com/users\")\n\n  it \"should work with options only\", (done) ->\n    ajax = Ajax()\n\n    ajax.getJSON(url: \"https://api.github.com/users\")\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n",
          "mode": "100644",
          "type": "blob"
        },
        "util.coffee": {
          "path": "util.coffee",
          "content": "module.exports =\n  defaults: (target, objects...) ->\n    for object in objects\n      for name of object\n        unless target.hasOwnProperty(name)\n          target[name] = object[name]\n\n    return target\n\n  extend: (target, sources...) ->\n    for source in sources\n      for name of source\n        target[name] = source[name]\n\n    return target\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var defaults, extend, _ref,\n    __slice = [].slice;\n\n  _ref = require(\"./util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  module.exports = function() {\n    var ajax, complete, completeHandlers, configure;\n    ajax = function(options) {\n      var data, headers, method, overrideMimeType, password, responseType, timeout, url, user, withCredentials;\n      if (options == null) {\n        options = {};\n      }\n      data = options.data, headers = options.headers, method = options.method, overrideMimeType = options.overrideMimeType, password = options.password, url = options.url, responseType = options.responseType, timeout = options.timeout, user = options.user, withCredentials = options.withCredentials;\n      if (data == null) {\n        data = \"\";\n      }\n      if (method == null) {\n        method = \"GET\";\n      }\n      if (password == null) {\n        password = \"\";\n      }\n      if (responseType == null) {\n        responseType = \"\";\n      }\n      if (timeout == null) {\n        timeout = 0;\n      }\n      if (user == null) {\n        user = \"\";\n      }\n      if (withCredentials == null) {\n        withCredentials = false;\n      }\n      return new Promise(function(resolve, reject) {\n        var xhr;\n        xhr = new XMLHttpRequest();\n        xhr.open(method, url, true, user, password);\n        xhr.responseType = responseType;\n        xhr.timeout = timeout;\n        xhr.withCredentialls = withCredentials;\n        if (headers) {\n          Object.keys(headers).forEach(function(header) {\n            var value;\n            value = headers[header];\n            return xhr.setRequestHeader(header, value);\n          });\n        }\n        if (overrideMimeType) {\n          xhr.overrideMimeType(overrideMimeType);\n        }\n        xhr.onload = function(e) {\n          var _ref1;\n          if (((200 <= (_ref1 = this.status) && _ref1 < 300)) || this.status === 304) {\n            resolve(this.response);\n            return complete(e, xhr, options);\n          } else {\n            reject(xhr);\n            return complete(e, xhr, options);\n          }\n        };\n        xhr.onerror = function(e) {\n          reject(xhr);\n          return complete(e, xhr, options);\n        };\n        return xhr.send(data);\n      });\n    };\n    complete = function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return completeHandlers.forEach(function(handler) {\n        return handler.apply(null, args);\n      });\n    };\n    configure = function(optionDefaults) {\n      return function(url, options) {\n        if (options == null) {\n          options = {};\n        }\n        if (typeof url === \"object\") {\n          options = url;\n        } else {\n          options.url = url;\n        }\n        defaults(options, optionDefaults);\n        return ajax(options);\n      };\n    };\n    completeHandlers = [];\n    return extend(ajax, {\n      ajax: configure({}),\n      complete: function(handler) {\n        return completeHandlers.push(handler);\n      },\n      getJSON: configure({\n        responseType: \"json\"\n      }),\n      getBlob: configure({\n        responseType: \"blob\"\n      })\n    });\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.4\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Ajax;\n\n  Ajax = require(\"../main\");\n\n  describe(\"Ajax\", function() {\n    it(\"should getJSON\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax({\n        url: \"https://api.github.com/users\",\n        responseType: \"json\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n    it(\"should have complete handlers\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      ajax.complete(function(e, xhr, options) {\n        return done();\n      });\n      return ajax.getJSON(\"https://api.github.com/users\");\n    });\n    return it(\"should work with options only\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax.getJSON({\n        url: \"https://api.github.com/users\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "util": {
          "path": "util",
          "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/v0.4.2/"
      },
      "version": "0.1.4",
      "entryPoint": "main",
      "repository": {
        "branch": "master",
        "default_branch": "master",
        "full_name": "distri/ajax",
        "homepage": null,
        "description": "Promise returning Ajax lib",
        "html_url": "https://github.com/distri/ajax",
        "url": "https://api.github.com/repos/distri/ajax",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "analytics": {
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
          "content": "google-analytics\n================\n\nGoogle analytics for distri apps\n",
          "type": "blob"
        },
        "lib/analytics.js": {
          "path": "lib/analytics.js",
          "mode": "100644",
          "content": "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\nm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n})(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "mode": "100644",
          "content": "Google Analytics\n================\n\n    module.exports =\n      init: (id) ->\n        require \"./lib/analytics\"\n\n        global.ga('create', id, 'auto')\n        global.ga('send', 'pageview')\n",
          "type": "blob"
        },
        "test/main.coffee": {
          "path": "test/main.coffee",
          "mode": "100644",
          "content": "mocha.globals(\"ga\")\n\ndescribe \"analytics\", ->\n  it \"should put analytics on the page\", ->\n    GA = require \"../main\"\n\n    GA.init(\"UA-XXXX-Y\")\n\n  it \"should be a chill bro\", ->\n    ga(\"send\", \"duder\")\n",
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
        "lib/analytics": {
          "path": "lib/analytics",
          "content": "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\nm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n})(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n",
          "type": "blob"
        },
        "main": {
          "path": "main",
          "content": "(function() {\n  module.exports = {\n    init: function(id) {\n      require(\"./lib/analytics\");\n      global.ga('create', id, 'auto');\n      return global.ga('send', 'pageview');\n    }\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
          "type": "blob"
        },
        "test/main": {
          "path": "test/main",
          "content": "(function() {\n  mocha.globals(\"ga\");\n\n  describe(\"analytics\", function() {\n    it(\"should put analytics on the page\", function() {\n      var GA;\n      GA = require(\"../main\");\n      return GA.init(\"UA-XXXX-Y\");\n    });\n    return it(\"should be a chill bro\", function() {\n      return ga(\"send\", \"duder\");\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/main.coffee",
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
        "id": 17791404,
        "name": "google-analytics",
        "full_name": "distri/google-analytics",
        "owner": {
          "login": "distri",
          "id": 6005125,
          "avatar_url": "https://gravatar.com/avatar/192f3f168409e79c42107f081139d9f3?d=https%3A%2F%2Fidenticons.github.com%2Ff90c81ffc1498e260c820082f2e7ca5f.png&r=x",
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
        "html_url": "https://github.com/distri/google-analytics",
        "description": "Google analytics for distri apps",
        "fork": false,
        "url": "https://api.github.com/repos/distri/google-analytics",
        "forks_url": "https://api.github.com/repos/distri/google-analytics/forks",
        "keys_url": "https://api.github.com/repos/distri/google-analytics/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/distri/google-analytics/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/distri/google-analytics/teams",
        "hooks_url": "https://api.github.com/repos/distri/google-analytics/hooks",
        "issue_events_url": "https://api.github.com/repos/distri/google-analytics/issues/events{/number}",
        "events_url": "https://api.github.com/repos/distri/google-analytics/events",
        "assignees_url": "https://api.github.com/repos/distri/google-analytics/assignees{/user}",
        "branches_url": "https://api.github.com/repos/distri/google-analytics/branches{/branch}",
        "tags_url": "https://api.github.com/repos/distri/google-analytics/tags",
        "blobs_url": "https://api.github.com/repos/distri/google-analytics/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/distri/google-analytics/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/distri/google-analytics/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/distri/google-analytics/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/distri/google-analytics/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/distri/google-analytics/languages",
        "stargazers_url": "https://api.github.com/repos/distri/google-analytics/stargazers",
        "contributors_url": "https://api.github.com/repos/distri/google-analytics/contributors",
        "subscribers_url": "https://api.github.com/repos/distri/google-analytics/subscribers",
        "subscription_url": "https://api.github.com/repos/distri/google-analytics/subscription",
        "commits_url": "https://api.github.com/repos/distri/google-analytics/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/distri/google-analytics/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/distri/google-analytics/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/distri/google-analytics/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/distri/google-analytics/contents/{+path}",
        "compare_url": "https://api.github.com/repos/distri/google-analytics/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/distri/google-analytics/merges",
        "archive_url": "https://api.github.com/repos/distri/google-analytics/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/distri/google-analytics/downloads",
        "issues_url": "https://api.github.com/repos/distri/google-analytics/issues{/number}",
        "pulls_url": "https://api.github.com/repos/distri/google-analytics/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/distri/google-analytics/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/distri/google-analytics/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/distri/google-analytics/labels{/name}",
        "releases_url": "https://api.github.com/repos/distri/google-analytics/releases{/id}",
        "created_at": "2014-03-16T03:39:25Z",
        "updated_at": "2014-03-16T03:39:25Z",
        "pushed_at": "2014-03-16T03:39:25Z",
        "git_url": "git://github.com/distri/google-analytics.git",
        "ssh_url": "git@github.com:distri/google-analytics.git",
        "clone_url": "https://github.com/distri/google-analytics.git",
        "svn_url": "https://github.com/distri/google-analytics",
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
          "avatar_url": "https://gravatar.com/avatar/192f3f168409e79c42107f081139d9f3?d=https%3A%2F%2Fidenticons.github.com%2Ff90c81ffc1498e260c820082f2e7ca5f.png&r=x",
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
        "branch": "master",
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
        "branch": "master",
        "defaultBranch": "master"
      },
      "dependencies": {}
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
    "extensions": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "Extensions\n==========\n\nExtend built-in prototypes with helpful methods.\n",
          "mode": "100644",
          "type": "blob"
        },
        "array.coffee.md": {
          "path": "array.coffee.md",
          "content": "Array\n=====\n\n    {extend} = require \"./util\"\n\n    extend Array.prototype,\n\nCalculate the average value of an array. Returns undefined if some elements\nare not numbers.\n\n      average: ->\n        @sum()/@length\n\n>     #! example\n>     [1, 3, 5, 7].average()\n\n----\n\nReturns a copy of the array without null and undefined values.\n\n      compact: ->\n        @select (element) ->\n          element?\n\n>     #! example\n>     [null, undefined, 3, 3, undefined, 5].compact()\n\n----\n\nCreates and returns a copy of the array. The copy contains\nthe same objects.\n\n      copy: ->\n        @concat()\n\n>     #! example\n>     a = [\"a\", \"b\", \"c\"]\n>     b = a.copy()\n>\n>     # their elements are equal\n>     a[0] == b[0] && a[1] == b[1] && a[2] == b[2]\n>     # => true\n>\n>     # but they aren't the same object in memory\n>     a is b\n>     # => false\n\n----\n\nEmpties the array of its contents. It is modified in place.\n\n      clear: ->\n        @length = 0\n\n        return this\n\n>     #! example\n>     fullArray = [1, 2, 3]\n>     fullArray.clear()\n>     fullArray\n\n----\n\nFlatten out an array of arrays into a single array of elements.\n\n      flatten: ->\n        @inject [], (a, b) ->\n          a.concat b\n\n>     #! example\n>     [[1, 2], [3, 4], 5].flatten()\n>     # => [1, 2, 3, 4, 5]\n>\n>     # won't flatten twice nested arrays. call\n>     # flatten twice if that is what you want\n>     [[1, 2], [3, [4, 5]], 6].flatten()\n>     # => [1, 2, 3, [4, 5], 6]\n\n----\n\nInvoke the named method on each element in the array\nand return a new array containing the results of the invocation.\n\n      invoke: (method, args...) ->\n        @map (element) ->\n          element[method].apply(element, args)\n\n>     #! example\n>     [1.1, 2.2, 3.3, 4.4].invoke(\"floor\")\n\n----\n\n>     #! example\n>     ['hello', 'world', 'cool!'].invoke('substring', 0, 3)\n\n----\n\nRandomly select an element from the array.\n\n      rand: ->\n        @[rand(@length)]\n\n>     #! example\n>     [1, 2, 3].rand()\n\n----\n\nRemove the first occurrence of the given object from the array if it is\npresent. The array is modified in place.\n\n      remove: (object) ->\n        index = @indexOf(object)\n\n        if index >= 0\n          @splice(index, 1)[0]\n        else\n          undefined\n\n>     #! example\n>     a = [1, 1, \"a\", \"b\"]\n>     a.remove(1)\n>     a\n\n----\n\nReturns true if the element is present in the array.\n\n      include: (element) ->\n        @indexOf(element) != -1\n\n>     #! example\n>     [\"a\", \"b\", \"c\"].include(\"c\")\n\n----\n\nCall the given iterator once for each element in the array,\npassing in the element as the first argument, the index of\nthe element as the second argument, and this array as the\nthird argument.\n\n      each: (iterator, context) ->\n        if @forEach\n          @forEach iterator, context\n        else\n          for element, i in this\n            iterator.call context, element, i, this\n\n        return this\n\n>     #! example\n>     word = \"\"\n>     indices = []\n>     [\"r\", \"a\", \"d\"].each (letter, index) ->\n>       word += letter\n>       indices.push(index)\n>\n>     # => [\"r\", \"a\", \"d\"]\n>\n>     word\n>     # => \"rad\"\n>\n>     indices\n\n----\n\nCall the given iterator once for each pair of objects in the array.\n\n      eachPair: (iterator, context) ->\n        length = @length\n        i = 0\n        while i < length\n          a = @[i]\n          j = i + 1\n          i += 1\n\n          while j < length\n            b = @[j]\n            j += 1\n\n            iterator.call context, a, b\n\n>     #! example\n>     results = []\n>     [1, 2, 3, 4].eachPair (a, b) ->\n>       results.push [a, b]\n>\n>     results\n\n----\n\nCall the given iterator once for each element in the array,\npassing in the element as the first argument and the given object\nas the second argument. Additional arguments are passed similar to\n`each`.\n\n      eachWithObject: (object, iterator, context) ->\n        @each (element, i, self) ->\n          iterator.call context, element, object, i, self\n\n        return object\n\nCall the given iterator once for each group of elements in the array,\npassing in the elements in groups of n. Additional arguments are\npassed as in `each`.\n\n      eachSlice: (n, iterator, context) ->\n        len = @length / n\n        i = -1\n\n        while ++i < len\n          iterator.call(context, @slice(i*n, (i+1)*n), i*n, this)\n\n        return this\n\n>     #! example\n>     results = []\n>     [1, 2, 3, 4].eachSlice 2, (slice) ->\n>       results.push(slice)\n>\n>     results\n\n----\n\nPipe the input through each function in the array in turn. For example, if you have a\nlist of objects you can perform a series of selection, sorting, and other processing\nmethods and then receive the processed list. This array must contain functions that\naccept a single input and return the processed input. The output of the first function\nis fed to the input of the second and so on until the final processed output is returned.\n\n      pipeline: (input) ->\n        @inject input, (input, fn) ->\n          fn(input)\n\nReturns a new array with the elements all shuffled up.\n\n      shuffle: ->\n        shuffledArray = []\n\n        @each (element) ->\n          shuffledArray.splice(rand(shuffledArray.length + 1), 0, element)\n\n        return shuffledArray\n\n>     #! example\n>     [0..9].shuffle()\n\n----\n\nReturns the first element of the array, undefined if the array is empty.\n\n      first: ->\n        @[0]\n\n>     #! example\n>     [\"first\", \"second\", \"third\"].first()\n\n----\n\nReturns the last element of the array, undefined if the array is empty.\n\n      last: ->\n        @[@length - 1]\n\n>     #! example\n>     [\"first\", \"second\", \"third\"].last()\n\n----\n\nReturns an object containing the extremes of this array.\n\n      extremes: (fn=identity) ->\n        min = max = undefined\n        minResult = maxResult = undefined\n\n        @each (object) ->\n          result = fn(object)\n\n          if min?\n            if result < minResult\n              min = object\n              minResult = result\n          else\n            min = object\n            minResult = result\n\n          if max?\n            if result > maxResult\n              max = object\n              maxResult = result\n          else\n            max = object\n            maxResult = result\n\n        min: min\n        max: max\n\n>     #! example\n>     [-1, 3, 0].extremes()\n\n----\n\n      maxima: (valueFunction=identity) ->\n        @inject([-Infinity, []], (memo, item) ->\n          value = valueFunction(item)\n          [maxValue, maxItems] = memo\n\n          if value > maxValue\n            [value, [item]]\n          else if value is maxValue\n            [value, maxItems.concat(item)]\n          else\n            memo\n        ).last()\n\n      maximum: (valueFunction) ->\n        @maxima(valueFunction).first()\n\n      minima: (valueFunction=identity) ->\n        inverseFn = (x) ->\n          -valueFunction(x)\n\n        @maxima(inverseFn)\n\n      minimum: (valueFunction) ->\n        @minima(valueFunction).first()\n\nPretend the array is a circle and grab a new array containing length elements.\nIf length is not given return the element at start, again assuming the array\nis a circle.\n\n      wrap: (start, length) ->\n        if length?\n          end = start + length\n          i = start\n          result = []\n\n          while i < end\n            result.push(@[mod(i, @length)])\n            i += 1\n\n          return result\n        else\n          return @[mod(start, @length)]\n\n>     #! example\n>     [1, 2, 3].wrap(-1)\n\n----\n\n>     #! example\n>     [1, 2, 3].wrap(6)\n\n----\n\n>     #! example\n>     [\"l\", \"o\", \"o\", \"p\"].wrap(0, 12)\n\n----\n\nPartitions the elements into two groups: those for which the iterator returns\ntrue, and those for which it returns false.\n\n      partition: (iterator, context) ->\n        trueCollection = []\n        falseCollection = []\n\n        @each (element) ->\n          if iterator.call(context, element)\n            trueCollection.push element\n          else\n            falseCollection.push element\n\n        return [trueCollection, falseCollection]\n\n>     #! example\n>     [0..9].partition (n) ->\n>       n % 2 is 0\n\n----\n\nReturn the group of elements for which the return value of the iterator is true.\n\n      select: (iterator, context) ->\n        return @partition(iterator, context)[0]\n\nReturn the group of elements that are not in the passed in set.\n\n      without: (values) ->\n        @reject (element) ->\n          values.include(element)\n\n>     #! example\n>     [1, 2, 3, 4].without [2, 3]\n\n----\n\nReturn the group of elements for which the return value of the iterator is false.\n\n      reject: (iterator, context) ->\n        @partition(iterator, context)[1]\n\nCombines all elements of the array by applying a binary operation.\nfor each element in the arra the iterator is passed an accumulator\nvalue (memo) and the element.\n\n      inject: (initial, iterator) ->\n        @each (element) ->\n          initial = iterator(initial, element)\n\n        return initial\n\nAdd all the elements in the array.\n\n      sum: ->\n        @inject 0, (sum, n) ->\n          sum + n\n\n>     #! example\n>     [1, 2, 3, 4].sum()\n\n----\n\nMultiply all the elements in the array.\n\n      product: ->\n        @inject 1, (product, n) ->\n          product * n\n\n>     #! example\n>     [1, 2, 3, 4].product()\n\n----\n\nProduce a duplicate-free version of the array.\n\n      unique: ->\n        @inject [], (results, element) ->\n          results.push element if results.indexOf(element) is -1\n\n          results\n\nMerges together the values of each of the arrays with the values at the corresponding position.\n\n      zip: (args...) ->\n        @map (element, index) ->\n          output = args.map (arr) ->\n            arr[index]\n\n          output.unshift(element)\n\n          return output\n\n>     #! example\n>     ['a', 'b', 'c'].zip([1, 2, 3])\n\n----\n\nHelpers\n-------\n\n    identity = (x) ->\n      x\n\n    rand = (n) ->\n      Math.floor n * Math.random()\n\n    mod = (n, base) ->\n      result = n % base\n\n      if result < 0 and base > 0\n        result += base\n\n      return result\n",
          "mode": "100644",
          "type": "blob"
        },
        "extensions.coffee.md": {
          "path": "extensions.coffee.md",
          "content": "Extensions\n==========\n\nExtend built in prototypes with additional behavior.\n\n    require \"./array\"\n    require \"./function\"\n    require \"./number\"\n    require \"./string\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "function.coffee.md": {
          "path": "function.coffee.md",
          "content": "Function\n========\n\n    {extend} = require \"./util\"\n\nAdd our `Function` extensions.\n\n    extend Function.prototype,\n      once: ->\n        func = this\n\n        ran = false\n        memo = undefined\n\n        return ->\n          return memo if ran\n          ran = true\n\n          return memo = func.apply(this, arguments)\n\nCalling a debounced function will postpone its execution until after\nwait milliseconds have elapsed since the last time the function was\ninvoked. Useful for implementing behavior that should only happen after\nthe input has stopped arriving. For example: rendering a preview of a\nMarkdown comment, recalculating a layout after the window has stopped\nbeing resized...\n\n      debounce: (wait) ->\n        timeout = null\n        func = this\n\n        return ->\n          context = this\n          args = arguments\n\n          later = ->\n            timeout = null\n            func.apply(context, args)\n\n          clearTimeout(timeout)\n          timeout = setTimeout(later, wait)\n\n>     lazyLayout = calculateLayout.debounce(300)\n>     $(window).resize(lazyLayout)\n\n----\n\n      delay: (wait, args...) ->\n        func = this\n\n        setTimeout ->\n          func.apply(null, args)\n        , wait\n\n      defer: (args...) ->\n        this.delay.apply this, [1].concat(args)\n\n    extend Function,\n      identity: (x) ->\n        x\n\n      noop: ->\n",
          "mode": "100644",
          "type": "blob"
        },
        "number.coffee.md": {
          "path": "number.coffee.md",
          "content": "Number\n======\n\nReturns the absolute value of this number.\n\n>     #! example\n>     (-4).abs()\n\nReturns the mathematical ceiling of this number. The number truncated to the\nnearest integer of greater than or equal value.\n\n>     #! example\n>     4.2.ceil()\n\n---\n\n>     #! example\n>     (-1.2).ceil()\n\n---\n\nReturns the mathematical floor of this number. The number truncated to the\nnearest integer of less than or equal value.\n\n>     #! example\n>     4.9.floor()\n\n---\n\n>     #! example\n>     (-1.2).floor()\n\n---\n\nReturns this number rounded to the nearest integer.\n\n>     #! example\n>     4.5.round()\n\n---\n\n>     #! example\n>     4.4.round()\n\n---\n\n    [\n      \"abs\"\n      \"ceil\"\n      \"floor\"\n      \"round\"\n    ].forEach (method) ->\n      Number::[method] = ->\n        if isNaN(this)\n          throw \"Can't #{method} NaN\"\n        else\n          Math[method](this)\n\n    {extend} = require \"./util\"\n\n    extend Number.prototype,\n\nApproach a target number from the current number and a maximum delta.\n\n      approach: (target, maxDelta) ->\n        this + (target - this).clamp(-maxDelta, maxDelta)\n\nApproach a target number from the current number and a ratio of that number to\napproach the target by.\n\n      approachByRatio: (target, ratio) ->\n        @approach(target, this * ratio)\n\nGet a bunch of points equally spaced around the unit circle.\n\n      circularPoints: ->\n        n = this\n\n        [0..n].map (i) ->\n          Point.fromAngle (i/n).turns\n\n>     #! example\n>     4.circularPoints()\n\n---\n\nReturns a number whose value is limited to the given range.\n\n      clamp: (min, max) ->\n        if min? and max?\n          Math.min(Math.max(this, min), max)\n        else if min?\n          Math.max(this, min)\n        else if max?\n          Math.min(this, max)\n        else\n          this\n\n>     #! example\n>     512.clamp(0, 255)\n\n---\n\nA mod method useful for array wrapping. The range of the function is\nconstrained to remain in bounds of array indices.\n\n      mod: (base) ->\n        if isNaN(this)\n          throw \"Can't mod NaN\"\n\n        result = this % base\n\n        if result < 0 && base > 0\n          result += base\n\n        return result\n\n>     #! example\n>     (-1).mod(5)\n\n---\n\nGet the sign of this number as an integer (1, -1, or 0).\n\n      sign: ->\n        if this > 0\n          1\n        else if this < 0\n          -1\n        else if isNaN(this)\n          throw \"Can't get sign of NaN\"\n        else\n          0\n\n>     #! example\n>     5.sign()\n\n---\n\nReturns true if this number is even (evenly divisible by 2).\n\n      even: ->\n        @mod(2) is 0\n\n>     #! example\n>     2.even()\n\n---\n\nReturns true if this number is odd (has remainder of 1 when divided by 2).\n\n      odd: ->\n        @mod(2) is 1\n\n>     #! example\n>     3.odd()\n\n---\n\nCalls iterator the specified number of times, passing in the number of the\ncurrent iteration as a parameter: 0 on first call, 1 on the second call, etc.\n\n      times: (iterator, context) ->\n        i = -1\n\n        while ++i < this\n          iterator.call context, i\n\n        return i\n\n>     #! example\n>     output = []\n>\n>     5.times (n) ->\n>       output.push(n)\n>\n>     output\n\n---\n\nReturns the the nearest grid resolution less than or equal to the number.\n\n      snap: (resolution) ->\n        (n / resolution).floor() * resolution\n\n>     #! example\n>     7.snap(8)\n\n---\n\n      truncate: ->\n        if this > 0\n          @floor()\n        else if this < 0\n          @ceil()\n        else\n          this\n\nConvert a number to an amount of rotations.\n\n    unless 5.rotations\n      Object.defineProperty Number::, 'rotations',\n        get: ->\n          this * Math.TAU\n\n    unless 1.rotation\n      Object.defineProperty Number::, 'rotation',\n        get: ->\n          this * Math.TAU\n\n>     #! example\n>     0.5.rotations\n\n---\n\nConvert a number to an amount of rotations.\n\n    unless 5.turns\n      Object.defineProperty Number.prototype, 'turns',\n        get: ->\n          this * Math.TAU\n\n    unless 1.turn\n      Object.defineProperty Number.prototype, 'turn',\n        get: ->\n          this * Math.TAU\n\n>     #! example\n>     0.5.turns\n\n---\n\nConvert a number to an amount of degrees.\n\n    unless 2.degrees\n      Object.defineProperty Number::, 'degrees',\n        get: ->\n          this * Math.TAU / 360\n\n    unless 1.degree\n      Object.defineProperty Number::, 'degree',\n        get: ->\n          this * Math.TAU / 360\n\n>     #! example\n>     180.degrees\n\n---\n\nExtra\n-----\n\nThe mathematical circle constant of 1 turn.\n\n    Math.TAU = 2 * Math.PI\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.2.0\"\nentryPoint: \"extensions\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "string.coffee.md": {
          "path": "string.coffee.md",
          "content": "String\n======\n\nExtend strings with utility methods.\n\n    {extend} = require \"./util\"\n\n    extend String.prototype,\n\nReturns true if this string only contains whitespace characters.\n\n      blank: ->\n        /^\\s*$/.test(this)\n\n>     #! example\n>     \"   \".blank()\n\n---\n\nParse this string as though it is JSON and return the object it represents. If it\nis not valid JSON returns the string itself.\n\n      parse: () ->\n        try\n          JSON.parse(this.toString())\n        catch e\n          this.toString()\n\n>     #! example\n>     # this is valid json, so an object is returned\n>     '{\"a\": 3}'.parse()\n\n---\n\nReturns true if this string starts with the given string.\n\n      startsWith: (str) ->\n        @lastIndexOf(str, 0) is 0\n\nReturns true if this string ends with the given string.\n\n      endsWith: (str) ->\n        @indexOf(str, @length - str.length) != -1\n\nGet the file extension of a string.\n\n      extension: ->\n        if extension = this.match(/\\.([^\\.]*)$/, '')?.last()\n          extension\n        else\n          ''\n\n>     #! example\n>     \"README.md\".extension()\n\n---\n\nAssumes the string is something like a file name and returns the\ncontents of the string without the extension.\n\n      withoutExtension: ->\n        this.replace(/\\.[^\\.]*$/, '')\n\n      toInt: (base=10) ->\n        parseInt(this, base)\n\n>     #! example\n>     \"neat.png\".witouthExtension()\n\n---\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/array.coffee": {
          "path": "test/array.coffee",
          "content": "require \"../array\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Array\", ->\n\n  test \"#average\", ->\n    equals [1, 3, 5, 7].average(), 4\n\n  test \"#compact\", ->\n    a = [0, 1, undefined, 2, null, 3, '', 4]\n\n    compacted = a.compact()\n\n    equals(compacted[0], 0)\n    equals(compacted[1], 1)\n    equals(compacted[2], 2)\n    equals(compacted[3], 3)\n    equals(compacted[4], '')\n    equals(compacted[5], 4)\n\n  test \"#copy\", ->\n    a = [1,2,3]\n    b = a.copy()\n\n    ok a != b, \"Original array is not the same array as the copied one\"\n    ok a.length == b.length, \"Both arrays are the same size\"\n    ok a[0] == b[0] && a[1] == b[1] && a[2] == b[2], \"The elements of the two arrays are equal\"\n\n  test \"#flatten\", ->\n    array = [[0,1], [2,3], [4,5]]\n\n    flattenedArray = array.flatten()\n\n    equals flattenedArray.length, 6, \"Flattened array length should equal number of elements in sub-arrays\"\n    equals flattenedArray.first(), 0, \"First element should be first element in first sub-array\"\n    equals flattenedArray.last(), 5, \"Last element should be last element in last sub-array\"\n\n  test \"#rand\", ->\n    array = [1,2,3]\n\n    ok array.indexOf(array.rand()) != -1, \"Array includes randomly selected element\"\n    ok [5].rand() == 5, \"[5].rand() === 5\"\n    ok [].rand() == undefined, \"[].rand() === undefined\"\n\n  test \"#remove\", ->\n    equals [1,2,3].remove(2), 2, \"[1,2,3].remove(2) === 2\"\n    equals [1,3].remove(2), undefined, \"[1,3].remove(2) === undefined\"\n    equals [1,3].remove(3), 3, \"[1,3].remove(3) === 3\"\n\n    array = [1,2,3]\n    array.remove(2)\n    ok array.length == 2, \"array = [1,2,3]; array.remove(2); array.length === 2\"\n    array.remove(3)\n    ok array.length == 1, \"array = [1,3]; array.remove(3); array.length === 1\"\n\n  test \"#map\", ->\n    equals [1].map((x) -> return x + 1 )[0], 2\n\n  test \"#invoke\", ->\n    results = ['hello', 'world', 'cool!'].invoke('substring', 0, 3)\n\n    equals results[0], \"hel\"\n    equals results[1], \"wor\"\n    equals results[2], \"coo\"\n\n  test \"#each\", ->\n    array = [1, 2, 3]\n    count = 0\n\n    equals array, array.each -> count++\n    equals array.length, count\n\n  test \"#eachPair\", ->\n    array = [1, 2, 3]\n    sum = 0\n\n    array.eachPair (a, b) ->\n      sum += a + b\n\n    equals(sum, 12)\n\n  test \"#eachWithObject\", ->\n    array = [1, 2, 3]\n\n    result = array.eachWithObject {}, (element, hash) ->\n      hash[element] = (element + 1).toString()\n\n    equals result[1], \"2\"\n    equals result[2], \"3\"\n    equals result[3], \"4\"\n\n  test \"#shuffle\", ->\n    array = [0, 1, 2, 3, 4, 5]\n\n    shuffledArray = array.shuffle()\n\n    shuffledArray.each (element) ->\n      ok array.indexOf(element) >= 0, \"Every element in shuffled array is in orig array\"\n\n    array.each (element) ->\n      ok shuffledArray.indexOf(element) >= 0, \"Every element in orig array is in shuffled array\"\n\n  test \"#first\", ->\n    equals [2].first(), 2\n    equals [1, 2, 3].first(), 1\n    equals [].first(), undefined\n\n  test \"#last\", ->\n    equals [2].last(), 2\n    equals [1, 2, 3].last(), 3\n    equals [].first(), undefined\n\n  test \"#maxima\", ->\n    maxima = [-52, 0, 78].maxima()\n\n    maxima.each (n) ->\n      equals n, 78\n\n    maxima = [0, 0, 1, 0, 1, 0, 1, 0].maxima()\n\n    equals 3, maxima.length\n\n    maxima.each (n) ->\n      equals n, 1\n\n  test \"#maximum\", ->\n    equals [-345, 38, 8347].maximum(), 8347\n\n  test \"#maximum with function\", ->\n    equals [3, 4, 5].maximum((n) ->\n      n % 4\n    ), 3\n\n  test \"#minima\", ->\n    minima = [-52, 0, 78].minima()\n\n    minima.each (n) ->\n      equals n, -52\n\n    minima = [0, 0, 1, 0, 1, 0, 1, 0].minima()\n\n    equals 5, minima.length\n\n    minima.each (n) ->\n      equals n, 0\n\n  test \"#minimum\", ->\n    equals [-345, 38, 8347].minimum(), -345\n\n  test \"#pipeline\", ->\n    pipe = [\n      (x) -> x * x\n      (x) -> x - 10\n    ]\n\n    equals pipe.pipeline(5), 15\n\n  test \"#extremes\", ->\n    array = [-7, 1, 11, 94]\n\n    extremes = array.extremes()\n\n    equals extremes.min, -7, \"Min is -7\"\n    equals extremes.max, 94, \"Max is 94\"\n\n  test \"#extremes with fn\", ->\n    array = [1, 11, 94]\n\n    extremes = array.extremes (value) ->\n      value % 11\n\n    equals extremes.min, 11, extremes.min\n    equals extremes.max, 94, extremes.max\n\n  test \"#sum\", ->\n    equals [].sum(), 0, \"Empty array sums to zero\"\n    equals [2].sum(), 2, \"[2] sums to 2\"\n    equals [1, 2, 3, 4, 5].sum(), 15, \"[1, 2, 3, 4, 5] sums to 15\"\n\n  test \"#eachSlice\", ->\n    [1, 2, 3, 4, 5, 6].eachSlice 2, (array) ->\n      equals array[0] % 2, 1\n      equals array[1] % 2, 0\n\n  test \"#without\", ->\n    array = [1, 2, 3, 4]\n\n    excluded = array.without([2, 4])\n\n    equals excluded[0], 1\n    equals excluded[1], 3\n\n  test \"#clear\", ->\n    array = [1, 2, 3, 4]\n\n    equals array.length, 4\n    equals array[0], 1\n\n    array.clear()\n\n    equals array.length, 0\n    equals array[0], undefined\n\n  test \"#unique\", ->\n    array = [0, 0, 0, 1, 1, 1, 2, 3]\n\n    equals array.unique().first(), 0\n    equals array.unique().last(), 3\n    equals array.unique().length, 4\n\n  test \"#wrap\", ->\n    array = [0, 1, 2, 3, 4]\n\n    equals array.wrap(0), 0\n    equals array.wrap(-1), 4\n    equals array.wrap(2), 2\n\n  test \"#zip\", ->\n    a = [1, 2, 3]\n    b = [4, 5, 6]\n    c = [7, 8]\n\n    output = a.zip(b, c)\n\n    equals output[0][0], 1\n    equals output[0][1], 4\n    equals output[0][2], 7\n\n    equals output[2][2], undefined\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/function.coffee": {
          "path": "test/function.coffee",
          "content": "require \"../function\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Function\", ->\n\n  test \"#once\", ->\n    score = 0\n\n    addScore = ->\n      score += 100\n\n    onceScore = addScore.once()\n\n    [0..9].map ->\n      onceScore()\n\n    equals score, 100\n\n  test \".identity\", ->\n    I = Function.identity\n\n    [0, 1, true, false, null, undefined].each (x) ->\n      equals I(x), x\n\n  test \"#debounce\", (done) ->\n    fn = (-> ok true; done()).debounce(1)\n\n    # Though called multiple times the function is only triggered once\n    fn()\n    fn()\n    fn()\n\n  test \"#delay\", (done) ->\n    fn = (x, y) ->\n      equals x, 3\n      equals y, \"testy\"\n      done()\n\n    fn.delay 25, 3, \"testy\"\n\n  test \"#defer\", (done) ->\n    fn = (x) ->\n      equals x, 3\n      done()\n\n    fn.defer 3\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/number.coffee": {
          "path": "test/number.coffee",
          "content": "require \"../number\"\n\nok = assert\nequals = assert.equal\ntest = it\n\nequalEnough = (expected, actual, tolerance, message) ->\n  message ||= \"#{expected} within #{tolerance} of #{actual}\"\n\n  ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n\ndescribe \"Number\", ->\n\n  test \"#abs\", ->\n    equals 5.abs(), 5, \"(5).abs() equals 5\"\n    equals 4.2.abs(), 4.2, \"(4.2).abs() equals 4.2\"\n    equals (-1.2).abs(), 1.2, \"(-1.2).abs() equals 1.2\"\n    equals 0.abs(), 0, \"(0).abs() equals 0\"\n\n  test \"#approach\", ->\n    v = 5.approach(6, 0.5)\n    assert.equal v, 5.5, \"#{v} == 5.5\"\n\n  test \"#approachByRatio\", ->\n    assert.equal 1.approachByRatio(2, 1), 2\n    assert.equal 100.approachByRatio(200, 0.10), 110\n\n  test \"#ceil\", ->\n    equals 4.9.ceil(), 5, \"(4.9).floor() equals 5\"\n    equals 4.2.ceil(), 5, \"(4.2).ceil() equals 5\"\n    equals (-1.2).ceil(), -1, \"(-1.2).ceil() equals -1\"\n    equals 3.ceil(), 3, \"(3).ceil() equals 3\"\n\n  test \"#clamp\", ->\n    equals 5.clamp(0, 3), 3\n    equals 5.clamp(-1, 0), 0\n    equals (-5).clamp(0, 1), 0\n    equals 1.clamp(0, null), 1\n    equals (-1).clamp(0, null), 0\n    equals (-10).clamp(-5, 0), -5\n    equals (-10).clamp(null, 0), -10\n    equals 50.clamp(null, 10), 10\n\n  test \"#floor\", ->\n    equals 4.9.floor(), 4, \"(4.9).floor() equals 4\"\n    equals 4.2.floor(), 4, \"(4.2).floor() equals 4\"\n    equals (-1.2).floor(), -2, \"(-1.2).floor() equals -2\"\n    equals 3.floor(), 3, \"(3).floor() equals 3\"\n\n  test \"#round\", ->\n    equals 4.5.round(), 5, \"(4.5).round() equals 5\"\n    equals 4.4.round(), 4, \"(4.4).round() equals 4\"\n\n  test \"#sign\", ->\n    equals 5.sign(), 1, \"Positive number's sign is 1\"\n    equals (-3).sign(), -1, \"Negative number's sign is -1\"\n    equals 0.sign(), 0, \"Zero's sign is 0\"\n\n  test \"#even\", ->\n    [0, 2, -32].each (n) ->\n      ok n.even(), \"#{n} is even\"\n\n    [1, -1, 2.2, -3.784].each (n) ->\n      equals n.even(), false, \"#{n} is not even\"\n\n  test \"#odd\", ->\n    [1, 9, -37].each (n) ->\n      ok n.odd(), \"#{n} is odd\"\n\n    [0, 32, 2.2, -1.1].each (n) ->\n      equals n.odd(), false, \"#{n} is not odd\"\n\n  test \"#times\", ->\n    n = 5\n    equals n.times(->), n, \"returns n\"\n\n  test \"#times called correct amount\", ->\n    n = 5\n    count = 0\n\n    n.times -> count++\n\n    equals n, count, \"returns n\"\n\n  test \"#mod should have a positive result when used with a positive base and a negative number\", ->\n    n = -3\n\n    equals n.mod(8), 5, \"Should 'wrap' and be positive.\"\n\n  test \"#degrees\", ->\n    equals 180.degrees, Math.PI\n    equals 1.degree, Math.TAU / 360\n\n  test \"#rotations\", ->\n    equals 1.rotation, Math.TAU\n    equals 0.5.rotations, Math.TAU / 2\n\n  test \"#turns\", ->\n    equals 1.turn, Math.TAU\n    equals 0.5.turns, Math.TAU / 2\n\n  describe \"NaN safety\", ->\n    it \"should throw immediately rather than return NaN\", ->\n      assert.throws ->\n        NaN.abs()\n      , /NaN/\n\n      assert.throws ->\n        NaN.ceil()\n      , /NaN/\n\n      assert.throws ->\n        NaN.floor()\n      , /NaN/\n\n      assert.throws ->\n        NaN.round()\n      , /NaN/\n\n      assert.throws ->\n        NaN.sign()\n      , /NaN/\n\n      assert.throws ->\n        NaN.mod(2)\n      , /NaN/\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/string.coffee": {
          "path": "test/string.coffee",
          "content": "require \"../string\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"String\", ->\n\n  test \"#blank\", ->\n    equals \"  \".blank(), true, \"A string containing only whitespace should be blank\"\n    equals \"a\".blank(), false, \"A string that contains a letter should not be blank\"\n    equals \"  a \".blank(), false\n    equals \"  \\n\\t \".blank(), true\n\n  test \"#extension\", ->\n    equals \"README\".extension(), \"\"\n    equals \"README.md\".extension(), \"md\"\n    equals \"jquery.min.js\".extension(), \"js\"\n    equals \"src/bouse.js.coffee\".extension(), \"coffee\"\n\n  test \"#parse\", ->\n    equals \"true\".parse(), true, \"parsing 'true' should equal boolean true\"\n    equals \"false\".parse(), false, \"parsing 'true' should equal boolean true\"\n    equals \"7.2\".parse(), 7.2, \"numbers should be cool too\"\n\n    equals '{\"val\": \"a string\"}'.parse().val, \"a string\", \"even parsing objects works\"\n\n    ok ''.parse() == '', \"Empty string parses to exactly the empty string\"\n\n  test \"#startsWith\", ->\n    ok \"cool\".startsWith(\"coo\")\n    equals \"cool\".startsWith(\"oo\"), false\n\n  test \"#toInt\", ->\n    equals \"31.3\".toInt(), 31\n    equals \"31.\".toInt(), 31\n    equals \"-1.02\".toInt(), -1\n\n    equals \"009\".toInt(), 9\n    equals \"0109\".toInt(), 109\n\n    equals \"F\".toInt(16), 15\n\n  test \"#withoutExtension\", ->\n    equals \"neat.png\".withoutExtension(), \"neat\"\n    equals \"not a file\".withoutExtension(), \"not a file\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "util.coffee.md": {
          "path": "util.coffee.md",
          "content": "Util\n====\n\nUtility methods shared in our extensions.\n\n    module.exports =\n\nExtend an object with the properties of other objects.\n\n      extend: (target, sources...) ->\n        for source in sources\n          for name of source\n            target[name] = source[name]\n\n        return target\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "array": {
          "path": "array",
          "content": "(function() {\n  var extend, identity, mod, rand,\n    __slice = [].slice;\n\n  extend = require(\"./util\").extend;\n\n  extend(Array.prototype, {\n    average: function() {\n      return this.sum() / this.length;\n    },\n    compact: function() {\n      return this.select(function(element) {\n        return element != null;\n      });\n    },\n    copy: function() {\n      return this.concat();\n    },\n    clear: function() {\n      this.length = 0;\n      return this;\n    },\n    flatten: function() {\n      return this.inject([], function(a, b) {\n        return a.concat(b);\n      });\n    },\n    invoke: function() {\n      var args, method;\n      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      return this.map(function(element) {\n        return element[method].apply(element, args);\n      });\n    },\n    rand: function() {\n      return this[rand(this.length)];\n    },\n    remove: function(object) {\n      var index;\n      index = this.indexOf(object);\n      if (index >= 0) {\n        return this.splice(index, 1)[0];\n      } else {\n        return void 0;\n      }\n    },\n    include: function(element) {\n      return this.indexOf(element) !== -1;\n    },\n    each: function(iterator, context) {\n      var element, i, _i, _len;\n      if (this.forEach) {\n        this.forEach(iterator, context);\n      } else {\n        for (i = _i = 0, _len = this.length; _i < _len; i = ++_i) {\n          element = this[i];\n          iterator.call(context, element, i, this);\n        }\n      }\n      return this;\n    },\n    eachPair: function(iterator, context) {\n      var a, b, i, j, length, _results;\n      length = this.length;\n      i = 0;\n      _results = [];\n      while (i < length) {\n        a = this[i];\n        j = i + 1;\n        i += 1;\n        _results.push((function() {\n          var _results1;\n          _results1 = [];\n          while (j < length) {\n            b = this[j];\n            j += 1;\n            _results1.push(iterator.call(context, a, b));\n          }\n          return _results1;\n        }).call(this));\n      }\n      return _results;\n    },\n    eachWithObject: function(object, iterator, context) {\n      this.each(function(element, i, self) {\n        return iterator.call(context, element, object, i, self);\n      });\n      return object;\n    },\n    eachSlice: function(n, iterator, context) {\n      var i, len;\n      len = this.length / n;\n      i = -1;\n      while (++i < len) {\n        iterator.call(context, this.slice(i * n, (i + 1) * n), i * n, this);\n      }\n      return this;\n    },\n    pipeline: function(input) {\n      return this.inject(input, function(input, fn) {\n        return fn(input);\n      });\n    },\n    shuffle: function() {\n      var shuffledArray;\n      shuffledArray = [];\n      this.each(function(element) {\n        return shuffledArray.splice(rand(shuffledArray.length + 1), 0, element);\n      });\n      return shuffledArray;\n    },\n    first: function() {\n      return this[0];\n    },\n    last: function() {\n      return this[this.length - 1];\n    },\n    extremes: function(fn) {\n      var max, maxResult, min, minResult;\n      if (fn == null) {\n        fn = identity;\n      }\n      min = max = void 0;\n      minResult = maxResult = void 0;\n      this.each(function(object) {\n        var result;\n        result = fn(object);\n        if (min != null) {\n          if (result < minResult) {\n            min = object;\n            minResult = result;\n          }\n        } else {\n          min = object;\n          minResult = result;\n        }\n        if (max != null) {\n          if (result > maxResult) {\n            max = object;\n            return maxResult = result;\n          }\n        } else {\n          max = object;\n          return maxResult = result;\n        }\n      });\n      return {\n        min: min,\n        max: max\n      };\n    },\n    maxima: function(valueFunction) {\n      if (valueFunction == null) {\n        valueFunction = identity;\n      }\n      return this.inject([-Infinity, []], function(memo, item) {\n        var maxItems, maxValue, value;\n        value = valueFunction(item);\n        maxValue = memo[0], maxItems = memo[1];\n        if (value > maxValue) {\n          return [value, [item]];\n        } else if (value === maxValue) {\n          return [value, maxItems.concat(item)];\n        } else {\n          return memo;\n        }\n      }).last();\n    },\n    maximum: function(valueFunction) {\n      return this.maxima(valueFunction).first();\n    },\n    minima: function(valueFunction) {\n      var inverseFn;\n      if (valueFunction == null) {\n        valueFunction = identity;\n      }\n      inverseFn = function(x) {\n        return -valueFunction(x);\n      };\n      return this.maxima(inverseFn);\n    },\n    minimum: function(valueFunction) {\n      return this.minima(valueFunction).first();\n    },\n    wrap: function(start, length) {\n      var end, i, result;\n      if (length != null) {\n        end = start + length;\n        i = start;\n        result = [];\n        while (i < end) {\n          result.push(this[mod(i, this.length)]);\n          i += 1;\n        }\n        return result;\n      } else {\n        return this[mod(start, this.length)];\n      }\n    },\n    partition: function(iterator, context) {\n      var falseCollection, trueCollection;\n      trueCollection = [];\n      falseCollection = [];\n      this.each(function(element) {\n        if (iterator.call(context, element)) {\n          return trueCollection.push(element);\n        } else {\n          return falseCollection.push(element);\n        }\n      });\n      return [trueCollection, falseCollection];\n    },\n    select: function(iterator, context) {\n      return this.partition(iterator, context)[0];\n    },\n    without: function(values) {\n      return this.reject(function(element) {\n        return values.include(element);\n      });\n    },\n    reject: function(iterator, context) {\n      return this.partition(iterator, context)[1];\n    },\n    inject: function(initial, iterator) {\n      this.each(function(element) {\n        return initial = iterator(initial, element);\n      });\n      return initial;\n    },\n    sum: function() {\n      return this.inject(0, function(sum, n) {\n        return sum + n;\n      });\n    },\n    product: function() {\n      return this.inject(1, function(product, n) {\n        return product * n;\n      });\n    },\n    unique: function() {\n      return this.inject([], function(results, element) {\n        if (results.indexOf(element) === -1) {\n          results.push(element);\n        }\n        return results;\n      });\n    },\n    zip: function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return this.map(function(element, index) {\n        var output;\n        output = args.map(function(arr) {\n          return arr[index];\n        });\n        output.unshift(element);\n        return output;\n      });\n    }\n  });\n\n  identity = function(x) {\n    return x;\n  };\n\n  rand = function(n) {\n    return Math.floor(n * Math.random());\n  };\n\n  mod = function(n, base) {\n    var result;\n    result = n % base;\n    if (result < 0 && base > 0) {\n      result += base;\n    }\n    return result;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "extensions": {
          "path": "extensions",
          "content": "(function() {\n  require(\"./array\");\n\n  require(\"./function\");\n\n  require(\"./number\");\n\n  require(\"./string\");\n\n}).call(this);\n",
          "type": "blob"
        },
        "function": {
          "path": "function",
          "content": "(function() {\n  var extend,\n    __slice = [].slice;\n\n  extend = require(\"./util\").extend;\n\n  extend(Function.prototype, {\n    once: function() {\n      var func, memo, ran;\n      func = this;\n      ran = false;\n      memo = void 0;\n      return function() {\n        if (ran) {\n          return memo;\n        }\n        ran = true;\n        return memo = func.apply(this, arguments);\n      };\n    },\n    debounce: function(wait) {\n      var func, timeout;\n      timeout = null;\n      func = this;\n      return function() {\n        var args, context, later;\n        context = this;\n        args = arguments;\n        later = function() {\n          timeout = null;\n          return func.apply(context, args);\n        };\n        clearTimeout(timeout);\n        return timeout = setTimeout(later, wait);\n      };\n    },\n    delay: function() {\n      var args, func, wait;\n      wait = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      func = this;\n      return setTimeout(function() {\n        return func.apply(null, args);\n      }, wait);\n    },\n    defer: function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return this.delay.apply(this, [1].concat(args));\n    }\n  });\n\n  extend(Function, {\n    identity: function(x) {\n      return x;\n    },\n    noop: function() {}\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "number": {
          "path": "number",
          "content": "(function() {\n  var extend;\n\n  [\"abs\", \"ceil\", \"floor\", \"round\"].forEach(function(method) {\n    return Number.prototype[method] = function() {\n      if (isNaN(this)) {\n        throw \"Can't \" + method + \" NaN\";\n      } else {\n        return Math[method](this);\n      }\n    };\n  });\n\n  extend = require(\"./util\").extend;\n\n  extend(Number.prototype, {\n    approach: function(target, maxDelta) {\n      return this + (target - this).clamp(-maxDelta, maxDelta);\n    },\n    approachByRatio: function(target, ratio) {\n      return this.approach(target, this * ratio);\n    },\n    circularPoints: function() {\n      var n, _i, _results;\n      n = this;\n      return (function() {\n        _results = [];\n        for (var _i = 0; 0 <= n ? _i <= n : _i >= n; 0 <= n ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function(i) {\n        return Point.fromAngle((i / n).turns);\n      });\n    },\n    clamp: function(min, max) {\n      if ((min != null) && (max != null)) {\n        return Math.min(Math.max(this, min), max);\n      } else if (min != null) {\n        return Math.max(this, min);\n      } else if (max != null) {\n        return Math.min(this, max);\n      } else {\n        return this;\n      }\n    },\n    mod: function(base) {\n      var result;\n      if (isNaN(this)) {\n        throw \"Can't mod NaN\";\n      }\n      result = this % base;\n      if (result < 0 && base > 0) {\n        result += base;\n      }\n      return result;\n    },\n    sign: function() {\n      if (this > 0) {\n        return 1;\n      } else if (this < 0) {\n        return -1;\n      } else if (isNaN(this)) {\n        throw \"Can't get sign of NaN\";\n      } else {\n        return 0;\n      }\n    },\n    even: function() {\n      return this.mod(2) === 0;\n    },\n    odd: function() {\n      return this.mod(2) === 1;\n    },\n    times: function(iterator, context) {\n      var i;\n      i = -1;\n      while (++i < this) {\n        iterator.call(context, i);\n      }\n      return i;\n    },\n    snap: function(resolution) {\n      return (n / resolution).floor() * resolution;\n    },\n    truncate: function() {\n      if (this > 0) {\n        return this.floor();\n      } else if (this < 0) {\n        return this.ceil();\n      } else {\n        return this;\n      }\n    }\n  });\n\n  if (!5..rotations) {\n    Object.defineProperty(Number.prototype, 'rotations', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!1..rotation) {\n    Object.defineProperty(Number.prototype, 'rotation', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!5..turns) {\n    Object.defineProperty(Number.prototype, 'turns', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!1..turn) {\n    Object.defineProperty(Number.prototype, 'turn', {\n      get: function() {\n        return this * Math.TAU;\n      }\n    });\n  }\n\n  if (!2..degrees) {\n    Object.defineProperty(Number.prototype, 'degrees', {\n      get: function() {\n        return this * Math.TAU / 360;\n      }\n    });\n  }\n\n  if (!1..degree) {\n    Object.defineProperty(Number.prototype, 'degree', {\n      get: function() {\n        return this * Math.TAU / 360;\n      }\n    });\n  }\n\n  Math.TAU = 2 * Math.PI;\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"extensions\"};",
          "type": "blob"
        },
        "string": {
          "path": "string",
          "content": "(function() {\n  var extend;\n\n  extend = require(\"./util\").extend;\n\n  extend(String.prototype, {\n    blank: function() {\n      return /^\\s*$/.test(this);\n    },\n    parse: function() {\n      var e;\n      try {\n        return JSON.parse(this.toString());\n      } catch (_error) {\n        e = _error;\n        return this.toString();\n      }\n    },\n    startsWith: function(str) {\n      return this.lastIndexOf(str, 0) === 0;\n    },\n    endsWith: function(str) {\n      return this.indexOf(str, this.length - str.length) !== -1;\n    },\n    extension: function() {\n      var extension, _ref;\n      if (extension = (_ref = this.match(/\\.([^\\.]*)$/, '')) != null ? _ref.last() : void 0) {\n        return extension;\n      } else {\n        return '';\n      }\n    },\n    withoutExtension: function() {\n      return this.replace(/\\.[^\\.]*$/, '');\n    },\n    toInt: function(base) {\n      if (base == null) {\n        base = 10;\n      }\n      return parseInt(this, base);\n    }\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/array": {
          "path": "test/array",
          "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../array\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Array\", function() {\n    test(\"#average\", function() {\n      return equals([1, 3, 5, 7].average(), 4);\n    });\n    test(\"#compact\", function() {\n      var a, compacted;\n      a = [0, 1, void 0, 2, null, 3, '', 4];\n      compacted = a.compact();\n      equals(compacted[0], 0);\n      equals(compacted[1], 1);\n      equals(compacted[2], 2);\n      equals(compacted[3], 3);\n      equals(compacted[4], '');\n      return equals(compacted[5], 4);\n    });\n    test(\"#copy\", function() {\n      var a, b;\n      a = [1, 2, 3];\n      b = a.copy();\n      ok(a !== b, \"Original array is not the same array as the copied one\");\n      ok(a.length === b.length, \"Both arrays are the same size\");\n      return ok(a[0] === b[0] && a[1] === b[1] && a[2] === b[2], \"The elements of the two arrays are equal\");\n    });\n    test(\"#flatten\", function() {\n      var array, flattenedArray;\n      array = [[0, 1], [2, 3], [4, 5]];\n      flattenedArray = array.flatten();\n      equals(flattenedArray.length, 6, \"Flattened array length should equal number of elements in sub-arrays\");\n      equals(flattenedArray.first(), 0, \"First element should be first element in first sub-array\");\n      return equals(flattenedArray.last(), 5, \"Last element should be last element in last sub-array\");\n    });\n    test(\"#rand\", function() {\n      var array;\n      array = [1, 2, 3];\n      ok(array.indexOf(array.rand()) !== -1, \"Array includes randomly selected element\");\n      ok([5].rand() === 5, \"[5].rand() === 5\");\n      return ok([].rand() === void 0, \"[].rand() === undefined\");\n    });\n    test(\"#remove\", function() {\n      var array;\n      equals([1, 2, 3].remove(2), 2, \"[1,2,3].remove(2) === 2\");\n      equals([1, 3].remove(2), void 0, \"[1,3].remove(2) === undefined\");\n      equals([1, 3].remove(3), 3, \"[1,3].remove(3) === 3\");\n      array = [1, 2, 3];\n      array.remove(2);\n      ok(array.length === 2, \"array = [1,2,3]; array.remove(2); array.length === 2\");\n      array.remove(3);\n      return ok(array.length === 1, \"array = [1,3]; array.remove(3); array.length === 1\");\n    });\n    test(\"#map\", function() {\n      return equals([1].map(function(x) {\n        return x + 1;\n      })[0], 2);\n    });\n    test(\"#invoke\", function() {\n      var results;\n      results = ['hello', 'world', 'cool!'].invoke('substring', 0, 3);\n      equals(results[0], \"hel\");\n      equals(results[1], \"wor\");\n      return equals(results[2], \"coo\");\n    });\n    test(\"#each\", function() {\n      var array, count;\n      array = [1, 2, 3];\n      count = 0;\n      equals(array, array.each(function() {\n        return count++;\n      }));\n      return equals(array.length, count);\n    });\n    test(\"#eachPair\", function() {\n      var array, sum;\n      array = [1, 2, 3];\n      sum = 0;\n      array.eachPair(function(a, b) {\n        return sum += a + b;\n      });\n      return equals(sum, 12);\n    });\n    test(\"#eachWithObject\", function() {\n      var array, result;\n      array = [1, 2, 3];\n      result = array.eachWithObject({}, function(element, hash) {\n        return hash[element] = (element + 1).toString();\n      });\n      equals(result[1], \"2\");\n      equals(result[2], \"3\");\n      return equals(result[3], \"4\");\n    });\n    test(\"#shuffle\", function() {\n      var array, shuffledArray;\n      array = [0, 1, 2, 3, 4, 5];\n      shuffledArray = array.shuffle();\n      shuffledArray.each(function(element) {\n        return ok(array.indexOf(element) >= 0, \"Every element in shuffled array is in orig array\");\n      });\n      return array.each(function(element) {\n        return ok(shuffledArray.indexOf(element) >= 0, \"Every element in orig array is in shuffled array\");\n      });\n    });\n    test(\"#first\", function() {\n      equals([2].first(), 2);\n      equals([1, 2, 3].first(), 1);\n      return equals([].first(), void 0);\n    });\n    test(\"#last\", function() {\n      equals([2].last(), 2);\n      equals([1, 2, 3].last(), 3);\n      return equals([].first(), void 0);\n    });\n    test(\"#maxima\", function() {\n      var maxima;\n      maxima = [-52, 0, 78].maxima();\n      maxima.each(function(n) {\n        return equals(n, 78);\n      });\n      maxima = [0, 0, 1, 0, 1, 0, 1, 0].maxima();\n      equals(3, maxima.length);\n      return maxima.each(function(n) {\n        return equals(n, 1);\n      });\n    });\n    test(\"#maximum\", function() {\n      return equals([-345, 38, 8347].maximum(), 8347);\n    });\n    test(\"#maximum with function\", function() {\n      return equals([3, 4, 5].maximum(function(n) {\n        return n % 4;\n      }), 3);\n    });\n    test(\"#minima\", function() {\n      var minima;\n      minima = [-52, 0, 78].minima();\n      minima.each(function(n) {\n        return equals(n, -52);\n      });\n      minima = [0, 0, 1, 0, 1, 0, 1, 0].minima();\n      equals(5, minima.length);\n      return minima.each(function(n) {\n        return equals(n, 0);\n      });\n    });\n    test(\"#minimum\", function() {\n      return equals([-345, 38, 8347].minimum(), -345);\n    });\n    test(\"#pipeline\", function() {\n      var pipe;\n      pipe = [\n        function(x) {\n          return x * x;\n        }, function(x) {\n          return x - 10;\n        }\n      ];\n      return equals(pipe.pipeline(5), 15);\n    });\n    test(\"#extremes\", function() {\n      var array, extremes;\n      array = [-7, 1, 11, 94];\n      extremes = array.extremes();\n      equals(extremes.min, -7, \"Min is -7\");\n      return equals(extremes.max, 94, \"Max is 94\");\n    });\n    test(\"#extremes with fn\", function() {\n      var array, extremes;\n      array = [1, 11, 94];\n      extremes = array.extremes(function(value) {\n        return value % 11;\n      });\n      equals(extremes.min, 11, extremes.min);\n      return equals(extremes.max, 94, extremes.max);\n    });\n    test(\"#sum\", function() {\n      equals([].sum(), 0, \"Empty array sums to zero\");\n      equals([2].sum(), 2, \"[2] sums to 2\");\n      return equals([1, 2, 3, 4, 5].sum(), 15, \"[1, 2, 3, 4, 5] sums to 15\");\n    });\n    test(\"#eachSlice\", function() {\n      return [1, 2, 3, 4, 5, 6].eachSlice(2, function(array) {\n        equals(array[0] % 2, 1);\n        return equals(array[1] % 2, 0);\n      });\n    });\n    test(\"#without\", function() {\n      var array, excluded;\n      array = [1, 2, 3, 4];\n      excluded = array.without([2, 4]);\n      equals(excluded[0], 1);\n      return equals(excluded[1], 3);\n    });\n    test(\"#clear\", function() {\n      var array;\n      array = [1, 2, 3, 4];\n      equals(array.length, 4);\n      equals(array[0], 1);\n      array.clear();\n      equals(array.length, 0);\n      return equals(array[0], void 0);\n    });\n    test(\"#unique\", function() {\n      var array;\n      array = [0, 0, 0, 1, 1, 1, 2, 3];\n      equals(array.unique().first(), 0);\n      equals(array.unique().last(), 3);\n      return equals(array.unique().length, 4);\n    });\n    test(\"#wrap\", function() {\n      var array;\n      array = [0, 1, 2, 3, 4];\n      equals(array.wrap(0), 0);\n      equals(array.wrap(-1), 4);\n      return equals(array.wrap(2), 2);\n    });\n    return test(\"#zip\", function() {\n      var a, b, c, output;\n      a = [1, 2, 3];\n      b = [4, 5, 6];\n      c = [7, 8];\n      output = a.zip(b, c);\n      equals(output[0][0], 1);\n      equals(output[0][1], 4);\n      equals(output[0][2], 7);\n      return equals(output[2][2], void 0);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/function": {
          "path": "test/function",
          "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../function\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Function\", function() {\n    test(\"#once\", function() {\n      var addScore, onceScore, score;\n      score = 0;\n      addScore = function() {\n        return score += 100;\n      };\n      onceScore = addScore.once();\n      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function() {\n        return onceScore();\n      });\n      return equals(score, 100);\n    });\n    test(\".identity\", function() {\n      var I;\n      I = Function.identity;\n      return [0, 1, true, false, null, void 0].each(function(x) {\n        return equals(I(x), x);\n      });\n    });\n    test(\"#debounce\", function(done) {\n      var fn;\n      fn = (function() {\n        ok(true);\n        return done();\n      }).debounce(1);\n      fn();\n      fn();\n      return fn();\n    });\n    test(\"#delay\", function(done) {\n      var fn;\n      fn = function(x, y) {\n        equals(x, 3);\n        equals(y, \"testy\");\n        return done();\n      };\n      return fn.delay(25, 3, \"testy\");\n    });\n    return test(\"#defer\", function(done) {\n      var fn;\n      fn = function(x) {\n        equals(x, 3);\n        return done();\n      };\n      return fn.defer(3);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/number": {
          "path": "test/number",
          "content": "(function() {\n  var equalEnough, equals, ok, test;\n\n  require(\"../number\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  equalEnough = function(expected, actual, tolerance, message) {\n    message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n    return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n  };\n\n  describe(\"Number\", function() {\n    test(\"#abs\", function() {\n      equals(5..abs(), 5, \"(5).abs() equals 5\");\n      equals(4.2.abs(), 4.2, \"(4.2).abs() equals 4.2\");\n      equals((-1.2).abs(), 1.2, \"(-1.2).abs() equals 1.2\");\n      return equals(0..abs(), 0, \"(0).abs() equals 0\");\n    });\n    test(\"#approach\", function() {\n      var v;\n      v = 5..approach(6, 0.5);\n      return assert.equal(v, 5.5, \"\" + v + \" == 5.5\");\n    });\n    test(\"#approachByRatio\", function() {\n      assert.equal(1..approachByRatio(2, 1), 2);\n      return assert.equal(100..approachByRatio(200, 0.10), 110);\n    });\n    test(\"#ceil\", function() {\n      equals(4.9.ceil(), 5, \"(4.9).floor() equals 5\");\n      equals(4.2.ceil(), 5, \"(4.2).ceil() equals 5\");\n      equals((-1.2).ceil(), -1, \"(-1.2).ceil() equals -1\");\n      return equals(3..ceil(), 3, \"(3).ceil() equals 3\");\n    });\n    test(\"#clamp\", function() {\n      equals(5..clamp(0, 3), 3);\n      equals(5..clamp(-1, 0), 0);\n      equals((-5).clamp(0, 1), 0);\n      equals(1..clamp(0, null), 1);\n      equals((-1).clamp(0, null), 0);\n      equals((-10).clamp(-5, 0), -5);\n      equals((-10).clamp(null, 0), -10);\n      return equals(50..clamp(null, 10), 10);\n    });\n    test(\"#floor\", function() {\n      equals(4.9.floor(), 4, \"(4.9).floor() equals 4\");\n      equals(4.2.floor(), 4, \"(4.2).floor() equals 4\");\n      equals((-1.2).floor(), -2, \"(-1.2).floor() equals -2\");\n      return equals(3..floor(), 3, \"(3).floor() equals 3\");\n    });\n    test(\"#round\", function() {\n      equals(4.5.round(), 5, \"(4.5).round() equals 5\");\n      return equals(4.4.round(), 4, \"(4.4).round() equals 4\");\n    });\n    test(\"#sign\", function() {\n      equals(5..sign(), 1, \"Positive number's sign is 1\");\n      equals((-3).sign(), -1, \"Negative number's sign is -1\");\n      return equals(0..sign(), 0, \"Zero's sign is 0\");\n    });\n    test(\"#even\", function() {\n      [0, 2, -32].each(function(n) {\n        return ok(n.even(), \"\" + n + \" is even\");\n      });\n      return [1, -1, 2.2, -3.784].each(function(n) {\n        return equals(n.even(), false, \"\" + n + \" is not even\");\n      });\n    });\n    test(\"#odd\", function() {\n      [1, 9, -37].each(function(n) {\n        return ok(n.odd(), \"\" + n + \" is odd\");\n      });\n      return [0, 32, 2.2, -1.1].each(function(n) {\n        return equals(n.odd(), false, \"\" + n + \" is not odd\");\n      });\n    });\n    test(\"#times\", function() {\n      var n;\n      n = 5;\n      return equals(n.times(function() {}), n, \"returns n\");\n    });\n    test(\"#times called correct amount\", function() {\n      var count, n;\n      n = 5;\n      count = 0;\n      n.times(function() {\n        return count++;\n      });\n      return equals(n, count, \"returns n\");\n    });\n    test(\"#mod should have a positive result when used with a positive base and a negative number\", function() {\n      var n;\n      n = -3;\n      return equals(n.mod(8), 5, \"Should 'wrap' and be positive.\");\n    });\n    test(\"#degrees\", function() {\n      equals(180..degrees, Math.PI);\n      return equals(1..degree, Math.TAU / 360);\n    });\n    test(\"#rotations\", function() {\n      equals(1..rotation, Math.TAU);\n      return equals(0.5.rotations, Math.TAU / 2);\n    });\n    test(\"#turns\", function() {\n      equals(1..turn, Math.TAU);\n      return equals(0.5.turns, Math.TAU / 2);\n    });\n    return describe(\"NaN safety\", function() {\n      return it(\"should throw immediately rather than return NaN\", function() {\n        assert.throws(function() {\n          return NaN.abs();\n        }, /NaN/);\n        assert.throws(function() {\n          return NaN.ceil();\n        }, /NaN/);\n        assert.throws(function() {\n          return NaN.floor();\n        }, /NaN/);\n        assert.throws(function() {\n          return NaN.round();\n        }, /NaN/);\n        assert.throws(function() {\n          return NaN.sign();\n        }, /NaN/);\n        return assert.throws(function() {\n          return NaN.mod(2);\n        }, /NaN/);\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/string": {
          "path": "test/string",
          "content": "(function() {\n  var equals, ok, test;\n\n  require(\"../string\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"String\", function() {\n    test(\"#blank\", function() {\n      equals(\"  \".blank(), true, \"A string containing only whitespace should be blank\");\n      equals(\"a\".blank(), false, \"A string that contains a letter should not be blank\");\n      equals(\"  a \".blank(), false);\n      return equals(\"  \\n\\t \".blank(), true);\n    });\n    test(\"#extension\", function() {\n      equals(\"README\".extension(), \"\");\n      equals(\"README.md\".extension(), \"md\");\n      equals(\"jquery.min.js\".extension(), \"js\");\n      return equals(\"src/bouse.js.coffee\".extension(), \"coffee\");\n    });\n    test(\"#parse\", function() {\n      equals(\"true\".parse(), true, \"parsing 'true' should equal boolean true\");\n      equals(\"false\".parse(), false, \"parsing 'true' should equal boolean true\");\n      equals(\"7.2\".parse(), 7.2, \"numbers should be cool too\");\n      equals('{\"val\": \"a string\"}'.parse().val, \"a string\", \"even parsing objects works\");\n      return ok(''.parse() === '', \"Empty string parses to exactly the empty string\");\n    });\n    test(\"#startsWith\", function() {\n      ok(\"cool\".startsWith(\"coo\"));\n      return equals(\"cool\".startsWith(\"oo\"), false);\n    });\n    test(\"#toInt\", function() {\n      equals(\"31.3\".toInt(), 31);\n      equals(\"31.\".toInt(), 31);\n      equals(\"-1.02\".toInt(), -1);\n      equals(\"009\".toInt(), 9);\n      equals(\"0109\".toInt(), 109);\n      return equals(\"F\".toInt(16), 15);\n    });\n    return test(\"#withoutExtension\", function() {\n      equals(\"neat.png\".withoutExtension(), \"neat\");\n      return equals(\"not a file\".withoutExtension(), \"not a file\");\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "util": {
          "path": "util",
          "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.2.0",
      "entryPoint": "extensions",
      "repository": {
        "branch": "master",
        "default_branch": "master",
        "full_name": "distri/extensions",
        "homepage": "",
        "description": "Extensions to Core JS Prototypes",
        "html_url": "https://github.com/distri/extensions",
        "url": "https://api.github.com/repos/distri/extensions",
        "publishBranch": "gh-pages"
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
          "content": "Matrix\n======\n\n```\n   _        _\n  | a  c tx  |\n  | b  d ty  |\n  |_0  0  1 _|\n```\n\nCreates a matrix for 2d affine transformations.\n\n`concat`, `inverse`, `rotate`, `scale` and `translate` return new matrices with\nthe transformations applied. The matrix is not modified in place.\n\nReturns the identity matrix when called with no arguments.\n\n    Matrix = (a, b, c, d, tx, ty) ->\n      if isObject(a)\n        {a, b, c, d, tx, ty} = a\n\n      __proto__: Matrix.prototype\n      a: a ? 1\n      b: b ? 0\n      c: c ? 0\n      d: d ? 1\n      tx: tx ? 0\n      ty: ty ? 0\n\nA `Point` constructor for the methods that return points. This can be overridden\nwith a compatible constructor if you want fancier points.\n\n    Matrix.Point = require \"point\"\n\n    Matrix.prototype =\n\n`concat` returns the result of this matrix multiplied by another matrix\ncombining the geometric effects of the two. In mathematical terms,\nconcatenating two matrixes is the same as combining them using matrix multiplication.\nIf this matrix is A and the matrix passed in is B, the resulting matrix is A x B\nhttp://mathworld.wolfram.com/MatrixMultiplication.html\n\n      concat: (matrix) ->\n        Matrix(\n          @a * matrix.a + @c * matrix.b,\n          @b * matrix.a + @d * matrix.b,\n          @a * matrix.c + @c * matrix.d,\n          @b * matrix.c + @d * matrix.d,\n          @a * matrix.tx + @c * matrix.ty + @tx,\n          @b * matrix.tx + @d * matrix.ty + @ty\n        )\n\n\nReturn a new matrix that is a `copy` of this matrix.\n\n      copy: ->\n        Matrix(@a, @b, @c, @d, @tx, @ty)\n\nGiven a point in the pretransform coordinate space, returns the coordinates of\nthat point after the transformation occurs. Unlike the standard transformation\napplied using the transformPoint() method, the deltaTransformPoint() method\ndoes not consider the translation parameters tx and ty.\n\nReturns a new `Point` transformed by this matrix ignoring tx and ty.\n\n      deltaTransformPoint: (point) ->\n        Matrix.Point(\n          @a * point.x + @c * point.y,\n          @b * point.x + @d * point.y\n        )\n\nReturns a new matrix that is the inverse of this matrix.\nhttp://mathworld.wolfram.com/MatrixInverse.html\n\n      inverse: ->\n        determinant = @a * @d - @b * @c\n\n        Matrix(\n          @d / determinant,\n          -@b / determinant,\n          -@c / determinant,\n          @a / determinant,\n          (@c * @ty - @d * @tx) / determinant,\n          (@b * @tx - @a * @ty) / determinant\n        )\n\nReturns a new matrix that corresponds this matrix multiplied by a\na rotation matrix.\n\nThe first parameter `theta` is the amount to rotate in radians.\n\nThe second optional parameter, `aboutPoint` is the point about which the\nrotation occurs. Defaults to (0,0).\n\n      rotate: (theta, aboutPoint) ->\n        @concat(Matrix.rotation(theta, aboutPoint))\n\nReturns a new matrix that corresponds this matrix multiplied by a\na scaling matrix.\n\n      scale: (sx, sy, aboutPoint) ->\n        @concat(Matrix.scale(sx, sy, aboutPoint))\n\nReturns a new matrix that corresponds this matrix multiplied by a\na skewing matrix.\n\n      skew: (skewX, skewY) ->\n        @concat(Matrix.skew(skewX, skewY))\n\nReturns a string representation of this matrix.\n\n      toString: ->\n        \"Matrix(#{@a}, #{@b}, #{@c}, #{@d}, #{@tx}, #{@ty})\"\n\nReturns the result of applying the geometric transformation represented by the\nMatrix object to the specified point.\n\n      transformPoint: (point) ->\n        Matrix.Point(\n          @a * point.x + @c * point.y + @tx,\n          @b * point.x + @d * point.y + @ty\n        )\n\nTranslates the matrix along the x and y axes, as specified by the tx and ty parameters.\n\n      translate: (tx, ty) ->\n        @concat(Matrix.translation(tx, ty))\n\nCreates a matrix transformation that corresponds to the given rotation,\naround (0,0) or the specified point.\n\n    Matrix.rotate = Matrix.rotation = (theta, aboutPoint) ->\n      rotationMatrix = Matrix(\n        Math.cos(theta),\n        Math.sin(theta),\n        -Math.sin(theta),\n        Math.cos(theta)\n      )\n\n      if aboutPoint?\n        rotationMatrix =\n          Matrix.translation(aboutPoint.x, aboutPoint.y).concat(\n            rotationMatrix\n          ).concat(\n            Matrix.translation(-aboutPoint.x, -aboutPoint.y)\n          )\n\n      return rotationMatrix\n\nReturns a matrix that corresponds to scaling by factors of sx, sy along\nthe x and y axis respectively.\n\nIf only one parameter is given the matrix is scaled uniformly along both axis.\n\nIf the optional aboutPoint parameter is given the scaling takes place\nabout the given point.\n\n    Matrix.scale = (sx, sy, aboutPoint) ->\n      sy = sy || sx\n\n      scaleMatrix = Matrix(sx, 0, 0, sy)\n\n      if aboutPoint\n        scaleMatrix =\n          Matrix.translation(aboutPoint.x, aboutPoint.y).concat(\n            scaleMatrix\n          ).concat(\n            Matrix.translation(-aboutPoint.x, -aboutPoint.y)\n          )\n\n      return scaleMatrix\n\n\nReturns a matrix that corresponds to a skew of skewX, skewY.\n\n    Matrix.skew = (skewX, skewY) ->\n      Matrix(0, Math.tan(skewY), Math.tan(skewX), 0)\n\nReturns a matrix that corresponds to a translation of tx, ty.\n\n    Matrix.translate = Matrix.translation = (tx, ty) ->\n      Matrix(1, 0, 0, 1, tx, ty)\n\nHelpers\n-------\n\n    isObject = (object) ->\n      Object.prototype.toString.call(object) is \"[object Object]\"\n\n    frozen = (object) ->\n      Object.freeze?(object)\n\n      return object\n\nConstants\n---------\n\nA constant representing the identity matrix.\n\n    Matrix.IDENTITY = frozen Matrix()\n\nA constant representing the horizontal flip transformation matrix.\n\n    Matrix.HORIZONTAL_FLIP = frozen Matrix(-1, 0, 0, 1)\n\nA constant representing the vertical flip transformation matrix.\n\n    Matrix.VERTICAL_FLIP = frozen Matrix(1, 0, 0, -1)\n\nExports\n-------\n\n    module.exports = Matrix\n",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "mode": "100644",
          "content": "version: \"0.2.0\"\nentryPoint: \"matrix\"\ndependencies:\n  point: \"distri/point:v0.2.0\"\n",
          "type": "blob"
        },
        "test/matrix.coffee": {
          "path": "test/matrix.coffee",
          "mode": "100644",
          "content": "Matrix = require \"../matrix\"\nPoint = require \"point\"\n\nok = assert\nequals = assert.equal\ntest = it\n\ndescribe \"Matrix\", ->\n\n  TOLERANCE = 0.00001\n  \n  equalEnough = (expected, actual, tolerance, message) ->\n    message ||= \"\" + expected + \" within \" + tolerance + \" of \" + actual\n    ok(expected + tolerance >= actual && expected - tolerance <= actual, message)\n  \n  matrixEqual = (m1, m2) ->\n    equalEnough(m1.a, m2.a, TOLERANCE)\n    equalEnough(m1.b, m2.b, TOLERANCE)\n    equalEnough(m1.c, m2.c, TOLERANCE)\n    equalEnough(m1.d, m2.d, TOLERANCE)\n    equalEnough(m1.tx, m2.tx, TOLERANCE)\n    equalEnough(m1.ty, m2.ty, TOLERANCE)\n  \n  test \"copy constructor\", ->\n   matrix = Matrix(1, 0, 0, 1, 10, 12)\n  \n   matrix2 = Matrix(matrix)\n  \n   ok matrix != matrix2\n   matrixEqual(matrix2, matrix)\n  \n  test \"Matrix() (Identity)\", ->\n    matrix = Matrix()\n  \n    equals(matrix.a, 1, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 1, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n    matrixEqual(matrix, Matrix.IDENTITY)\n  \n  test \"Empty\", ->\n    matrix = Matrix(0, 0, 0, 0, 0, 0)\n  \n    equals(matrix.a, 0, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 0, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n  test \"#copy\", ->\n    matrix = Matrix(2, 0, 0, 2)\n  \n    copyMatrix = matrix.copy()\n  \n    matrixEqual copyMatrix, matrix\n  \n    copyMatrix.a = 4\n  \n    equals copyMatrix.a, 4\n    equals matrix.a, 2, \"Old 'a' value is unchanged\"\n  \n  test \".scale\", ->\n    matrix = Matrix.scale(2, 2)\n  \n    equals(matrix.a, 2, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 2, \"d\")\n  \n    matrix = Matrix.scale(3)\n  \n    equals(matrix.a, 3, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 3, \"d\")\n  \n  test \".scale (about a point)\", ->\n    p = Point(5, 17)\n  \n    transformedPoint = Matrix.scale(3, 7, p).transformPoint(p)\n  \n    equals(transformedPoint.x, p.x, \"Point should remain the same\")\n    equals(transformedPoint.y, p.y, \"Point should remain the same\")\n  \n  test \"#scale (about a point)\", ->\n    p = Point(3, 11)\n  \n    transformedPoint = Matrix.IDENTITY.scale(3, 7, p).transformPoint(p)\n  \n    equals(transformedPoint.x, p.x, \"Point should remain the same\")\n    equals(transformedPoint.y, p.y, \"Point should remain the same\")\n  \n  test \"#skew\", ->\n    matrix = Matrix()\n\n    angle = 0.25 * Math.PI\n  \n    matrix = matrix.skew(angle, 0)\n  \n    equals matrix.c, Math.tan(angle)\n  \n  test \".rotation\", ->\n    matrix = Matrix.rotation(Math.PI / 2)\n  \n    equalEnough(matrix.a, 0, TOLERANCE)\n    equalEnough(matrix.b, 1, TOLERANCE)\n    equalEnough(matrix.c,-1, TOLERANCE)\n    equalEnough(matrix.d, 0, TOLERANCE)\n  \n  test \".rotation (about a point)\", ->\n    p = Point(11, 7)\n  \n    transformedPoint = Matrix.rotation(Math.PI / 2, p).transformPoint(p)\n  \n    equals transformedPoint.x, p.x, \"Point should remain the same\"\n    equals transformedPoint.y, p.y, \"Point should remain the same\"\n  \n  test \"#rotate (about a point)\", ->\n    p = Point(8, 5);\n  \n    transformedPoint = Matrix.IDENTITY.rotate(Math.PI / 2, p).transformPoint(p)\n  \n    equals transformedPoint.x, p.x, \"Point should remain the same\"\n    equals transformedPoint.y, p.y, \"Point should remain the same\"\n  \n  test \"#inverse (Identity)\", ->\n    matrix = Matrix().inverse()\n  \n    equals(matrix.a, 1, \"a\")\n    equals(matrix.b, 0, \"b\")\n    equals(matrix.c, 0, \"c\")\n    equals(matrix.d, 1, \"d\")\n    equals(matrix.tx, 0, \"tx\")\n    equals(matrix.ty, 0, \"ty\")\n  \n  test \"#concat\", ->\n    matrix = Matrix.rotation(Math.PI / 2).concat(Matrix.rotation(-Math.PI / 2))\n  \n    matrixEqual(matrix, Matrix.IDENTITY)\n  \n  test \"#toString\", ->\n    matrix = Matrix(0.5, 2, 0.5, -2, 3, 4.5)\n    matrixEqual eval(matrix.toString()), matrix\n  \n  test \"Maths\", ->\n    a = Matrix(12, 3, 3, 1, 7, 9)\n    b = Matrix(3, 8, 3, 2, 1, 5)\n  \n    c = a.concat(b)\n  \n    equals(c.a, 60)\n    equals(c.b, 17)\n    equals(c.c, 42)\n    equals(c.d, 11)\n    equals(c.tx, 34)\n    equals(c.ty, 17)\n  \n  test \"Order of transformations should match manual concat\", ->\n    tx = 10\n    ty = 5\n    theta = Math.PI/3\n    s = 2\n  \n    m1 = Matrix().translate(tx, ty).scale(s).rotate(theta)\n    m2 = Matrix().concat(Matrix.translation(tx, ty)).concat(Matrix.scale(s)).concat(Matrix.rotation(theta))\n  \n    matrixEqual(m1, m2)\n  \n  test \"IDENTITY is immutable\", ->\n    identity = Matrix.IDENTITY\n  \n    identity.a = 5\n  \n    equals identity.a, 1\n",
          "type": "blob"
        }
      },
      "distribution": {
        "matrix": {
          "path": "matrix",
          "content": "(function() {\n  var Matrix, frozen, isObject;\n\n  Matrix = function(a, b, c, d, tx, ty) {\n    var _ref;\n    if (isObject(a)) {\n      _ref = a, a = _ref.a, b = _ref.b, c = _ref.c, d = _ref.d, tx = _ref.tx, ty = _ref.ty;\n    }\n    return {\n      __proto__: Matrix.prototype,\n      a: a != null ? a : 1,\n      b: b != null ? b : 0,\n      c: c != null ? c : 0,\n      d: d != null ? d : 1,\n      tx: tx != null ? tx : 0,\n      ty: ty != null ? ty : 0\n    };\n  };\n\n  Matrix.Point = require(\"point\");\n\n  Matrix.prototype = {\n    concat: function(matrix) {\n      return Matrix(this.a * matrix.a + this.c * matrix.b, this.b * matrix.a + this.d * matrix.b, this.a * matrix.c + this.c * matrix.d, this.b * matrix.c + this.d * matrix.d, this.a * matrix.tx + this.c * matrix.ty + this.tx, this.b * matrix.tx + this.d * matrix.ty + this.ty);\n    },\n    copy: function() {\n      return Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);\n    },\n    deltaTransformPoint: function(point) {\n      return Matrix.Point(this.a * point.x + this.c * point.y, this.b * point.x + this.d * point.y);\n    },\n    inverse: function() {\n      var determinant;\n      determinant = this.a * this.d - this.b * this.c;\n      return Matrix(this.d / determinant, -this.b / determinant, -this.c / determinant, this.a / determinant, (this.c * this.ty - this.d * this.tx) / determinant, (this.b * this.tx - this.a * this.ty) / determinant);\n    },\n    rotate: function(theta, aboutPoint) {\n      return this.concat(Matrix.rotation(theta, aboutPoint));\n    },\n    scale: function(sx, sy, aboutPoint) {\n      return this.concat(Matrix.scale(sx, sy, aboutPoint));\n    },\n    skew: function(skewX, skewY) {\n      return this.concat(Matrix.skew(skewX, skewY));\n    },\n    toString: function() {\n      return \"Matrix(\" + this.a + \", \" + this.b + \", \" + this.c + \", \" + this.d + \", \" + this.tx + \", \" + this.ty + \")\";\n    },\n    transformPoint: function(point) {\n      return Matrix.Point(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);\n    },\n    translate: function(tx, ty) {\n      return this.concat(Matrix.translation(tx, ty));\n    }\n  };\n\n  Matrix.rotate = Matrix.rotation = function(theta, aboutPoint) {\n    var rotationMatrix;\n    rotationMatrix = Matrix(Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta));\n    if (aboutPoint != null) {\n      rotationMatrix = Matrix.translation(aboutPoint.x, aboutPoint.y).concat(rotationMatrix).concat(Matrix.translation(-aboutPoint.x, -aboutPoint.y));\n    }\n    return rotationMatrix;\n  };\n\n  Matrix.scale = function(sx, sy, aboutPoint) {\n    var scaleMatrix;\n    sy = sy || sx;\n    scaleMatrix = Matrix(sx, 0, 0, sy);\n    if (aboutPoint) {\n      scaleMatrix = Matrix.translation(aboutPoint.x, aboutPoint.y).concat(scaleMatrix).concat(Matrix.translation(-aboutPoint.x, -aboutPoint.y));\n    }\n    return scaleMatrix;\n  };\n\n  Matrix.skew = function(skewX, skewY) {\n    return Matrix(0, Math.tan(skewY), Math.tan(skewX), 0);\n  };\n\n  Matrix.translate = Matrix.translation = function(tx, ty) {\n    return Matrix(1, 0, 0, 1, tx, ty);\n  };\n\n  isObject = function(object) {\n    return Object.prototype.toString.call(object) === \"[object Object]\";\n  };\n\n  frozen = function(object) {\n    if (typeof Object.freeze === \"function\") {\n      Object.freeze(object);\n    }\n    return object;\n  };\n\n  Matrix.IDENTITY = frozen(Matrix());\n\n  Matrix.HORIZONTAL_FLIP = frozen(Matrix(-1, 0, 0, 1));\n\n  Matrix.VERTICAL_FLIP = frozen(Matrix(1, 0, 0, -1));\n\n  module.exports = Matrix;\n\n}).call(this);\n\n//# sourceURL=matrix.coffee",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"matrix\",\"dependencies\":{\"point\":\"distri/point:v0.2.0\"}};",
          "type": "blob"
        },
        "test/matrix": {
          "path": "test/matrix",
          "content": "(function() {\n  var Matrix, Point, equals, ok, test;\n\n  Matrix = require(\"../matrix\");\n\n  Point = require(\"point\");\n\n  ok = assert;\n\n  equals = assert.equal;\n\n  test = it;\n\n  describe(\"Matrix\", function() {\n    var TOLERANCE, equalEnough, matrixEqual;\n    TOLERANCE = 0.00001;\n    equalEnough = function(expected, actual, tolerance, message) {\n      message || (message = \"\" + expected + \" within \" + tolerance + \" of \" + actual);\n      return ok(expected + tolerance >= actual && expected - tolerance <= actual, message);\n    };\n    matrixEqual = function(m1, m2) {\n      equalEnough(m1.a, m2.a, TOLERANCE);\n      equalEnough(m1.b, m2.b, TOLERANCE);\n      equalEnough(m1.c, m2.c, TOLERANCE);\n      equalEnough(m1.d, m2.d, TOLERANCE);\n      equalEnough(m1.tx, m2.tx, TOLERANCE);\n      return equalEnough(m1.ty, m2.ty, TOLERANCE);\n    };\n    test(\"copy constructor\", function() {\n      var matrix, matrix2;\n      matrix = Matrix(1, 0, 0, 1, 10, 12);\n      matrix2 = Matrix(matrix);\n      ok(matrix !== matrix2);\n      return matrixEqual(matrix2, matrix);\n    });\n    test(\"Matrix() (Identity)\", function() {\n      var matrix;\n      matrix = Matrix();\n      equals(matrix.a, 1, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 1, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      equals(matrix.ty, 0, \"ty\");\n      return matrixEqual(matrix, Matrix.IDENTITY);\n    });\n    test(\"Empty\", function() {\n      var matrix;\n      matrix = Matrix(0, 0, 0, 0, 0, 0);\n      equals(matrix.a, 0, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 0, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      return equals(matrix.ty, 0, \"ty\");\n    });\n    test(\"#copy\", function() {\n      var copyMatrix, matrix;\n      matrix = Matrix(2, 0, 0, 2);\n      copyMatrix = matrix.copy();\n      matrixEqual(copyMatrix, matrix);\n      copyMatrix.a = 4;\n      equals(copyMatrix.a, 4);\n      return equals(matrix.a, 2, \"Old 'a' value is unchanged\");\n    });\n    test(\".scale\", function() {\n      var matrix;\n      matrix = Matrix.scale(2, 2);\n      equals(matrix.a, 2, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 2, \"d\");\n      matrix = Matrix.scale(3);\n      equals(matrix.a, 3, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      return equals(matrix.d, 3, \"d\");\n    });\n    test(\".scale (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(5, 17);\n      transformedPoint = Matrix.scale(3, 7, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#scale (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(3, 11);\n      transformedPoint = Matrix.IDENTITY.scale(3, 7, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#skew\", function() {\n      var angle, matrix;\n      matrix = Matrix();\n      angle = 0.25 * Math.PI;\n      matrix = matrix.skew(angle, 0);\n      return equals(matrix.c, Math.tan(angle));\n    });\n    test(\".rotation\", function() {\n      var matrix;\n      matrix = Matrix.rotation(Math.PI / 2);\n      equalEnough(matrix.a, 0, TOLERANCE);\n      equalEnough(matrix.b, 1, TOLERANCE);\n      equalEnough(matrix.c, -1, TOLERANCE);\n      return equalEnough(matrix.d, 0, TOLERANCE);\n    });\n    test(\".rotation (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(11, 7);\n      transformedPoint = Matrix.rotation(Math.PI / 2, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#rotate (about a point)\", function() {\n      var p, transformedPoint;\n      p = Point(8, 5);\n      transformedPoint = Matrix.IDENTITY.rotate(Math.PI / 2, p).transformPoint(p);\n      equals(transformedPoint.x, p.x, \"Point should remain the same\");\n      return equals(transformedPoint.y, p.y, \"Point should remain the same\");\n    });\n    test(\"#inverse (Identity)\", function() {\n      var matrix;\n      matrix = Matrix().inverse();\n      equals(matrix.a, 1, \"a\");\n      equals(matrix.b, 0, \"b\");\n      equals(matrix.c, 0, \"c\");\n      equals(matrix.d, 1, \"d\");\n      equals(matrix.tx, 0, \"tx\");\n      return equals(matrix.ty, 0, \"ty\");\n    });\n    test(\"#concat\", function() {\n      var matrix;\n      matrix = Matrix.rotation(Math.PI / 2).concat(Matrix.rotation(-Math.PI / 2));\n      return matrixEqual(matrix, Matrix.IDENTITY);\n    });\n    test(\"#toString\", function() {\n      var matrix;\n      matrix = Matrix(0.5, 2, 0.5, -2, 3, 4.5);\n      return matrixEqual(eval(matrix.toString()), matrix);\n    });\n    test(\"Maths\", function() {\n      var a, b, c;\n      a = Matrix(12, 3, 3, 1, 7, 9);\n      b = Matrix(3, 8, 3, 2, 1, 5);\n      c = a.concat(b);\n      equals(c.a, 60);\n      equals(c.b, 17);\n      equals(c.c, 42);\n      equals(c.d, 11);\n      equals(c.tx, 34);\n      return equals(c.ty, 17);\n    });\n    test(\"Order of transformations should match manual concat\", function() {\n      var m1, m2, s, theta, tx, ty;\n      tx = 10;\n      ty = 5;\n      theta = Math.PI / 3;\n      s = 2;\n      m1 = Matrix().translate(tx, ty).scale(s).rotate(theta);\n      m2 = Matrix().concat(Matrix.translation(tx, ty)).concat(Matrix.scale(s)).concat(Matrix.rotation(theta));\n      return matrixEqual(m1, m2);\n    });\n    return test(\"IDENTITY is immutable\", function() {\n      var identity;\n      identity = Matrix.IDENTITY;\n      identity.a = 5;\n      return equals(identity.a, 1);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/matrix.coffee",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://strd6.github.io/editor/"
      },
      "version": "0.2.0",
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
        "branch": "master",
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
          "content": "[![Build Status](https://travis-ci.org/distri/observable.svg?branch=npm)](https://travis-ci.org/distri/observable)\n\nObservable\n==========\n\nInstallation\n------------\n\nNode\n\n    npm install o_0\n\nUsage\n-----\n\n    Observable = require \"o_0\"\n\nGet notified when the value changes.\n\n    observable = Observable 5\n\n    observable() # 5\n\n    observable.observe (newValue) ->\n      console.log newValue\n\n    observable 10 # logs 10 to console\n\nArrays\n------\n\nProxy array methods.\n\n    observable = Observable [1, 2, 3]\n\n    observable.forEach (value) ->\n      # 1, 2, 3\n\nFunctions\n---------\n\nAutomagically compute dependencies for observable functions.\n\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n    lastName \"Bro\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Observable\n==========\n\n`Observable` allows for observing arrays, functions, and objects.\n\nFunction dependencies are automagically observed.\n\nStandard array methods are proxied through to the underlying array.\n\n    Observable = (value, context) ->\n\nReturn the object if it is already an observable object.\n\n      return value if typeof value?.observe is \"function\"\n\nMaintain a set of listeners to observe changes and provide a helper to notify each observer.\n\n      listeners = []\n\n      notify = (newValue) ->\n        copy(listeners).forEach (listener) ->\n          listener(newValue)\n\nOur observable function is stored as a reference to `self`.\n\nIf `value` is a function compute dependencies and listen to observables that it depends on.\n\n      if typeof value is 'function'\n        fn = value\n\nOur return function is a function that holds only a cached value which is updated\nwhen it's dependencies change.\n\nThe `magicDependency` call is so other functions can depend on this computed function the\nsame way we depend on other types of observables.\n\n        self = ->\n          # Automagic dependency observation\n          magicDependency(self)\n\n          return value\n\n        self.each = (args...) ->\n          magicDependency(self)\n\n          splat(value).forEach(args...)\n\n        changed = ->\n          value = computeDependencies(self, fn, changed, context)\n          notify(value)\n\n        value = computeDependencies(self, fn, changed, context)\n\n      else\n\nWhen called with zero arguments it is treated as a getter. When called with one argument it is treated as a setter.\n\nChanges to the value will trigger notifications.\n\nThe value is always returned.\n\n        self = (newValue) ->\n          if arguments.length > 0\n            if value != newValue\n              value = newValue\n\n              notify(newValue)\n          else\n            # Automagic dependency observation\n            magicDependency(self)\n\n          return value\n\nThis `each` iterator is similar to [the Maybe monad](http://en.wikipedia.org/wiki/Monad_&#40;functional_programming&#41;#The_Maybe_monad) in that our observable may contain a single value or nothing at all.\n\n      self.each = (args...) ->\n        magicDependency(self)\n\n        if value?\n          [value].forEach(args...)\n\nIf the value is an array then proxy array methods and add notifications to mutation events.\n\n      if Array.isArray(value)\n        [\n          \"concat\"\n          \"every\"\n          \"filter\"\n          \"forEach\"\n          \"indexOf\"\n          \"join\"\n          \"lastIndexOf\"\n          \"map\"\n          \"reduce\"\n          \"reduceRight\"\n          \"slice\"\n          \"some\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            magicDependency(self)\n            value[method](args...)\n\n        [\n          \"pop\"\n          \"push\"\n          \"reverse\"\n          \"shift\"\n          \"splice\"\n          \"sort\"\n          \"unshift\"\n        ].forEach (method) ->\n          self[method] = (args...) ->\n            notifyReturning value[method](args...)\n\n        notifyReturning = (returnValue) ->\n          notify(value)\n\n          return returnValue\n\nAdd some extra helpful methods to array observables.\n\n        extend self,\n          each: (args...) ->\n            self.forEach(args...)\n\n            return self\n\nRemove an element from the array and notify observers of changes.\n\n          remove: (object) ->\n            index = value.indexOf(object)\n\n            if index >= 0\n              notifyReturning value.splice(index, 1)[0]\n\n          get: (index) ->\n            value[index]\n\n          first: ->\n            value[0]\n\n          last: ->\n            value[value.length-1]\n\n      extend self,\n        listeners: listeners\n\n        observe: (listener) ->\n          listeners.push listener\n\n        stopObserving: (fn) ->\n          remove listeners, fn\n\n        toggle: ->\n          self !value\n\n        increment: (n) ->\n          self value + n\n\n        decrement: (n) ->\n          self value - n\n\n        toString: ->\n          \"Observable(#{value})\"\n\n      return self\n\n    Observable.concat = (args...) ->\n      args = Observable(args)\n\n      o = Observable ->\n        flatten args.map(splat)\n\n      o.push = args.push\n\n      return o\n\nExport `Observable`\n\n    module.exports = Observable\n\nAppendix\n--------\n\nThe extend method adds one objects properties to another.\n\n    extend = (target, sources...) ->\n      for source in sources\n        for name of source\n          target[name] = source[name]\n\n      return target\n\nSuper hax for computing dependencies. This needs to be a shared global so that\ndifferent bundled versions of observable libraries can interoperate.\n\n    global.OBSERVABLE_ROOT_HACK = []\n\n    autoDeps = ->\n      last(global.OBSERVABLE_ROOT_HACK)\n\n    magicDependency = (self) ->\n      if observerStack = autoDeps()\n        observerStack.push self\n\n    withBase = (self, update, fn) ->\n      global.OBSERVABLE_ROOT_HACK.push(deps = [])\n\n      try\n        value = fn()\n        self._deps?.forEach (observable) ->\n          observable.stopObserving update\n\n        self._deps = deps\n\n        deps.forEach (observable) ->\n          observable.observe update\n      finally\n        global.OBSERVABLE_ROOT_HACK.pop()\n\n      return value\n\nAutomagically compute dependencies.\n\n    computeDependencies = (self, fn, update, context) ->\n      withBase self, update, ->\n        fn.call(context)\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n\n    copy = (array) ->\n      array.concat([])\n\n    get = (arg) ->\n      if typeof arg is \"function\"\n        arg()\n      else\n        arg\n\n    splat = (item) ->\n      results = []\n\n      if typeof item.forEach is \"function\"\n        item.forEach (i) ->\n          results.push i\n      else\n        result = get item\n\n        results.push result if result?\n\n      results\n\n    last = (array) ->\n      array[array.length - 1]\n\n    flatten = (array) ->\n      array.reduce (a, b) ->\n        a.concat(b)\n      , []\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.2.0-pre.1\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/observable.coffee": {
          "path": "test/observable.coffee",
          "content": "global.Observable = require \"../main\"\n\ndescribe 'Observable', ->\n  it 'should create an observable for an object', ->\n    n = 5\n\n    observable = Observable(n)\n\n    assert.equal(observable(), n)\n\n  it 'should fire events when setting', ->\n    string = \"yolo\"\n\n    observable = Observable(string)\n    observable.observe (newValue) ->\n      assert.equal newValue, \"4life\"\n\n    observable(\"4life\")\n\n  it 'should be idempotent', ->\n    o = Observable(5)\n\n    assert.equal o, Observable(o)\n\n  describe \"#each\", ->\n    it \"should be invoked once if there is an observable\", ->\n      o = Observable(5)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n        assert.equal value, 5\n\n      assert.equal called, 1\n\n    it \"should not be invoked if observable is null\", ->\n      o = Observable(null)\n      called = 0\n\n      o.each (value) ->\n        called += 1\n\n      assert.equal called, 0\n\n  it \"should allow for stopping observation\", ->\n    observable = Observable(\"string\")\n\n    called = 0\n    fn = (newValue) ->\n      called += 1\n      assert.equal newValue, \"4life\"\n\n    observable.observe fn\n\n    observable(\"4life\")\n\n    observable.stopObserving fn\n\n    observable(\"wat\")\n\n    assert.equal called, 1\n\n  it \"should increment\", ->\n    observable = Observable 1\n\n    observable.increment(5)\n\n    assert.equal observable(), 6\n\n  it \"should decremnet\", ->\n    observable = Observable 1\n\n    observable.decrement 5\n\n    assert.equal observable(), -4\n\n  it \"should toggle\", ->\n    observable = Observable false\n\n    observable.toggle()\n    assert.equal observable(), true\n\n    observable.toggle()\n    assert.equal observable(), false\n\n  it \"should trigger when toggling\", (done) ->\n    observable = Observable true\n    observable.observe (v) ->\n      assert.equal v, false\n      done()\n\n    observable.toggle()\n\ndescribe \"Observable Array\", ->\n  it \"should proxy array methods\", ->\n    o = Observable [5]\n\n    o.map (n) ->\n      assert.equal n, 5\n\n  it \"should notify on mutation methods\", (done) ->\n    o = Observable []\n\n    o.observe (newValue) ->\n      assert.equal newValue[0], 1\n\n    o.push 1\n\n    done()\n\n  it \"should have an each method\", ->\n    o = Observable []\n\n    assert o.each\n\n  it \"#get\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.get(2), 2\n\n  it \"#first\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.first(), 0\n\n  it \"#last\", ->\n    o = Observable [0, 1, 2, 3]\n\n    assert.equal o.last(), 3\n\n  it \"#remove\", (done) ->\n    o = Observable [0, 1, 2, 3]\n\n    o.observe (newValue) ->\n      assert.equal newValue.length, 3\n      setTimeout ->\n        done()\n      , 0\n\n    assert.equal o.remove(2), 2\n\n  # TODO: This looks like it might be impossible\n  it \"should proxy the length property\"\n\ndescribe \"Observable functions\", ->\n  it \"should compute dependencies\", (done) ->\n    firstName = Observable \"Duder\"\n    lastName = Observable \"Man\"\n\n    o = Observable ->\n      \"#{firstName()} #{lastName()}\"\n\n    o.observe (newValue) ->\n      assert.equal newValue, \"Duder Bro\"\n\n      done()\n\n    lastName \"Bro\"\n\n  it \"should allow double nesting\", (done) ->\n    bottom = Observable \"rad\"\n    middle = Observable ->\n      bottom()\n    top = Observable ->\n      middle()\n\n    top.observe (newValue) ->\n      assert.equal newValue, \"wat\"\n      assert.equal top(), newValue\n      assert.equal middle(), newValue\n\n      done()\n\n    bottom(\"wat\")\n\n  it \"should work with dynamic dependencies\", ->\n    observableArray = Observable []\n\n    dynamicObservable = Observable ->\n      observableArray.filter (item) ->\n        item.age() > 3\n\n    assert.equal dynamicObservable().length, 0\n\n    observableArray.push\n      age: Observable 1\n\n    observableArray()[0].age 5\n    assert.equal dynamicObservable().length, 1\n\n  it \"should work with context\", ->\n    model =\n      a: Observable \"Hello\"\n      b: Observable \"there\"\n\n    model.c = Observable ->\n      \"#{@a()} #{@b()}\"\n    , model\n\n    assert.equal model.c(), \"Hello there\"\n\n    model.b \"world\"\n\n    assert.equal model.c(), \"Hello world\"\n\n  it \"should be ok even if the function throws an exception\", ->\n    assert.throws ->\n      t = Observable ->\n        throw \"wat\"\n\n    # TODO: Should be able to find a test case that is affected by this rather that\n    # checking it directly\n    assert.equal global.OBSERVABLE_ROOT_HACK.length, 0\n\n  it \"should have an each method\", ->\n    o = Observable ->\n\n    assert o.each\n\n  it \"should not invoke when returning undefined\", ->\n    o = Observable ->\n\n    o.each ->\n      assert false\n\n  it \"should invoke when returning any defined value\", (done) ->\n    o = Observable -> 5\n\n    o.each (n) ->\n      assert.equal n, 5\n      done()\n\n  it \"should work on an array dependency\", ->\n    oA = Observable [1, 2, 3]\n\n    o = Observable ->\n      oA()[0]\n\n    last = Observable ->\n      oA()[oA().length-1]\n\n    assert.equal o(), 1\n\n    oA.unshift 0\n\n    assert.equal o(), 0\n\n    oA.push 4\n\n    assert.equal last(), 4, \"Last should be 4\"\n\n  it \"should work with multiple dependencies\", ->\n    letter = Observable \"A\"\n    checked = ->\n      l = letter()\n      @name().indexOf(l) is 0\n\n    first = {name: Observable(\"Andrew\")}\n    first.checked = Observable checked, first\n\n    second = {name: Observable(\"Benjamin\")}\n    second.checked = Observable checked, second\n\n    assert.equal first.checked(), true\n    assert.equal second.checked(), false\n\n    assert.equal letter.listeners.length, 2\n\n    letter \"B\"\n\n    assert.equal first.checked(), false\n    assert.equal second.checked(), true\n\n  it \"should work with nested observable construction\", ->\n    gen = Observable ->\n      Observable \"Duder\"\n\n    o = gen()\n\n    assert.equal o(), \"Duder\"\n\n    o(\"wat\")\n\n    assert.equal o(), \"wat\"\n\n  describe \"Scoping\", ->\n    it \"should be scoped to optional context\", (done) ->\n      model =\n        firstName: Observable \"Duder\"\n        lastName: Observable \"Man\"\n\n      model.name = Observable ->\n        \"#{@firstName()} #{@lastName()}\"\n      , model\n\n      model.name.observe (newValue) ->\n        assert.equal newValue, \"Duder Bro\"\n\n        done()\n\n      model.lastName \"Bro\"\n\n  describe \"concat\", ->\n    it \"should return an observable array that changes based on changes in inputs\", ->\n      numbers = Observable [1, 2, 3]\n      letters = Observable [\"a\", \"b\", \"c\"]\n      item = Observable({})\n      nullable = Observable null\n\n      observableArray = Observable.concat numbers, \"literal\", letters, item, nullable\n\n      assert.equal observableArray().length, 3 + 1 + 3 + 1\n\n      assert.equal observableArray()[0], 1\n      assert.equal observableArray()[3], \"literal\"\n      assert.equal observableArray()[4], \"a\"\n      assert.equal observableArray()[7], item()\n\n      numbers.push 4\n\n      assert.equal observableArray().length, 9\n\n      nullable \"cool\"\n\n      assert.equal observableArray().length, 10\n\n    it \"should work with observable functions that return arrays\", ->\n      item = Observable(\"wat\")\n\n      computedArray = Observable ->\n        [item()]\n\n      observableArray = Observable.concat computedArray, computedArray\n\n      assert.equal observableArray().length, 2\n\n      assert.equal observableArray()[1], \"wat\"\n\n      item \"yolo\"\n\n      assert.equal observableArray()[1], \"yolo\"\n\n    it \"should have a push method\", ->\n      observableArray = Observable.concat()\n\n      observable = Observable \"hey\"\n\n      observableArray.push observable\n\n      assert.equal observableArray()[0], \"hey\"\n\n      observable \"wat\"\n\n      assert.equal observableArray()[0], \"wat\"\n\n      observableArray.push \"cool\"\n      observableArray.push \"radical\"\n\n      assert.equal observableArray().length, 3\n\n    it \"should be observable\", (done) ->\n      observableArray = Observable.concat()\n\n      observableArray.observe (items) ->\n        assert.equal items.length, 3\n        done()\n\n      observableArray.push [\"A\", \"B\", \"C\"]\n\n    it \"should have an each method\", ->\n      observableArray = Observable.concat([\"A\", \"B\", \"C\"])\n\n      n = 0\n      observableArray.each () ->\n        n += 1\n\n      assert.equal n, 3\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var Observable, autoDeps, computeDependencies, copy, extend, flatten, get, last, magicDependency, remove, splat, withBase,\n    __slice = [].slice;\n\n  Observable = function(value, context) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return copy(listeners).forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      self.each = function() {\n        var args, _ref;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        magicDependency(self);\n        return (_ref = splat(value)).forEach.apply(_ref, args);\n      };\n      changed = function() {\n        value = computeDependencies(self, fn, changed, context);\n        return notify(value);\n      };\n      value = computeDependencies(self, fn, changed, context);\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n    }\n    self.each = function() {\n      var args, _ref;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      magicDependency(self);\n      if (value != null) {\n        return (_ref = [value]).forEach.apply(_ref, args);\n      }\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          magicDependency(self);\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          self.forEach.apply(self, args);\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          return value[index];\n        },\n        first: function() {\n          return value[0];\n        },\n        last: function() {\n          return value[value.length - 1];\n        }\n      });\n    }\n    extend(self, {\n      listeners: listeners,\n      observe: function(listener) {\n        return listeners.push(listener);\n      },\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  Observable.concat = function() {\n    var args, o;\n    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    args = Observable(args);\n    o = Observable(function() {\n      return flatten(args.map(splat));\n    });\n    o.push = args.push;\n    return o;\n  };\n\n  module.exports = Observable;\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = [];\n\n  autoDeps = function() {\n    return last(global.OBSERVABLE_ROOT_HACK);\n  };\n\n  magicDependency = function(self) {\n    var observerStack;\n    if (observerStack = autoDeps()) {\n      return observerStack.push(self);\n    }\n  };\n\n  withBase = function(self, update, fn) {\n    var deps, value, _ref;\n    global.OBSERVABLE_ROOT_HACK.push(deps = []);\n    try {\n      value = fn();\n      if ((_ref = self._deps) != null) {\n        _ref.forEach(function(observable) {\n          return observable.stopObserving(update);\n        });\n      }\n      self._deps = deps;\n      deps.forEach(function(observable) {\n        return observable.observe(update);\n      });\n    } finally {\n      global.OBSERVABLE_ROOT_HACK.pop();\n    }\n    return value;\n  };\n\n  computeDependencies = function(self, fn, update, context) {\n    return withBase(self, update, function() {\n      return fn.call(context);\n    });\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n  copy = function(array) {\n    return array.concat([]);\n  };\n\n  get = function(arg) {\n    if (typeof arg === \"function\") {\n      return arg();\n    } else {\n      return arg;\n    }\n  };\n\n  splat = function(item) {\n    var result, results;\n    results = [];\n    if (typeof item.forEach === \"function\") {\n      item.forEach(function(i) {\n        return results.push(i);\n      });\n    } else {\n      result = get(item);\n      if (result != null) {\n        results.push(result);\n      }\n    }\n    return results;\n  };\n\n  last = function(array) {\n    return array[array.length - 1];\n  };\n\n  flatten = function(array) {\n    return array.reduce(function(a, b) {\n      return a.concat(b);\n    }, []);\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.0-pre.1\"};",
          "type": "blob"
        },
        "test/observable": {
          "path": "test/observable",
          "content": "(function() {\n  global.Observable = require(\"../main\");\n\n  describe('Observable', function() {\n    it('should create an observable for an object', function() {\n      var n, observable;\n      n = 5;\n      observable = Observable(n);\n      return assert.equal(observable(), n);\n    });\n    it('should fire events when setting', function() {\n      var observable, string;\n      string = \"yolo\";\n      observable = Observable(string);\n      observable.observe(function(newValue) {\n        return assert.equal(newValue, \"4life\");\n      });\n      return observable(\"4life\");\n    });\n    it('should be idempotent', function() {\n      var o;\n      o = Observable(5);\n      return assert.equal(o, Observable(o));\n    });\n    describe(\"#each\", function() {\n      it(\"should be invoked once if there is an observable\", function() {\n        var called, o;\n        o = Observable(5);\n        called = 0;\n        o.each(function(value) {\n          called += 1;\n          return assert.equal(value, 5);\n        });\n        return assert.equal(called, 1);\n      });\n      return it(\"should not be invoked if observable is null\", function() {\n        var called, o;\n        o = Observable(null);\n        called = 0;\n        o.each(function(value) {\n          return called += 1;\n        });\n        return assert.equal(called, 0);\n      });\n    });\n    it(\"should allow for stopping observation\", function() {\n      var called, fn, observable;\n      observable = Observable(\"string\");\n      called = 0;\n      fn = function(newValue) {\n        called += 1;\n        return assert.equal(newValue, \"4life\");\n      };\n      observable.observe(fn);\n      observable(\"4life\");\n      observable.stopObserving(fn);\n      observable(\"wat\");\n      return assert.equal(called, 1);\n    });\n    it(\"should increment\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.increment(5);\n      return assert.equal(observable(), 6);\n    });\n    it(\"should decremnet\", function() {\n      var observable;\n      observable = Observable(1);\n      observable.decrement(5);\n      return assert.equal(observable(), -4);\n    });\n    it(\"should toggle\", function() {\n      var observable;\n      observable = Observable(false);\n      observable.toggle();\n      assert.equal(observable(), true);\n      observable.toggle();\n      return assert.equal(observable(), false);\n    });\n    return it(\"should trigger when toggling\", function(done) {\n      var observable;\n      observable = Observable(true);\n      observable.observe(function(v) {\n        assert.equal(v, false);\n        return done();\n      });\n      return observable.toggle();\n    });\n  });\n\n  describe(\"Observable Array\", function() {\n    it(\"should proxy array methods\", function() {\n      var o;\n      o = Observable([5]);\n      return o.map(function(n) {\n        return assert.equal(n, 5);\n      });\n    });\n    it(\"should notify on mutation methods\", function(done) {\n      var o;\n      o = Observable([]);\n      o.observe(function(newValue) {\n        return assert.equal(newValue[0], 1);\n      });\n      o.push(1);\n      return done();\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable([]);\n      return assert(o.each);\n    });\n    it(\"#get\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.get(2), 2);\n    });\n    it(\"#first\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.first(), 0);\n    });\n    it(\"#last\", function() {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      return assert.equal(o.last(), 3);\n    });\n    it(\"#remove\", function(done) {\n      var o;\n      o = Observable([0, 1, 2, 3]);\n      o.observe(function(newValue) {\n        assert.equal(newValue.length, 3);\n        return setTimeout(function() {\n          return done();\n        }, 0);\n      });\n      return assert.equal(o.remove(2), 2);\n    });\n    return it(\"should proxy the length property\");\n  });\n\n  describe(\"Observable functions\", function() {\n    it(\"should compute dependencies\", function(done) {\n      var firstName, lastName, o;\n      firstName = Observable(\"Duder\");\n      lastName = Observable(\"Man\");\n      o = Observable(function() {\n        return \"\" + (firstName()) + \" \" + (lastName());\n      });\n      o.observe(function(newValue) {\n        assert.equal(newValue, \"Duder Bro\");\n        return done();\n      });\n      return lastName(\"Bro\");\n    });\n    it(\"should allow double nesting\", function(done) {\n      var bottom, middle, top;\n      bottom = Observable(\"rad\");\n      middle = Observable(function() {\n        return bottom();\n      });\n      top = Observable(function() {\n        return middle();\n      });\n      top.observe(function(newValue) {\n        assert.equal(newValue, \"wat\");\n        assert.equal(top(), newValue);\n        assert.equal(middle(), newValue);\n        return done();\n      });\n      return bottom(\"wat\");\n    });\n    it(\"should work with dynamic dependencies\", function() {\n      var dynamicObservable, observableArray;\n      observableArray = Observable([]);\n      dynamicObservable = Observable(function() {\n        return observableArray.filter(function(item) {\n          return item.age() > 3;\n        });\n      });\n      assert.equal(dynamicObservable().length, 0);\n      observableArray.push({\n        age: Observable(1)\n      });\n      observableArray()[0].age(5);\n      return assert.equal(dynamicObservable().length, 1);\n    });\n    it(\"should work with context\", function() {\n      var model;\n      model = {\n        a: Observable(\"Hello\"),\n        b: Observable(\"there\")\n      };\n      model.c = Observable(function() {\n        return \"\" + (this.a()) + \" \" + (this.b());\n      }, model);\n      assert.equal(model.c(), \"Hello there\");\n      model.b(\"world\");\n      return assert.equal(model.c(), \"Hello world\");\n    });\n    it(\"should be ok even if the function throws an exception\", function() {\n      assert.throws(function() {\n        var t;\n        return t = Observable(function() {\n          throw \"wat\";\n        });\n      });\n      return assert.equal(global.OBSERVABLE_ROOT_HACK.length, 0);\n    });\n    it(\"should have an each method\", function() {\n      var o;\n      o = Observable(function() {});\n      return assert(o.each);\n    });\n    it(\"should not invoke when returning undefined\", function() {\n      var o;\n      o = Observable(function() {});\n      return o.each(function() {\n        return assert(false);\n      });\n    });\n    it(\"should invoke when returning any defined value\", function(done) {\n      var o;\n      o = Observable(function() {\n        return 5;\n      });\n      return o.each(function(n) {\n        assert.equal(n, 5);\n        return done();\n      });\n    });\n    it(\"should work on an array dependency\", function() {\n      var last, o, oA;\n      oA = Observable([1, 2, 3]);\n      o = Observable(function() {\n        return oA()[0];\n      });\n      last = Observable(function() {\n        return oA()[oA().length - 1];\n      });\n      assert.equal(o(), 1);\n      oA.unshift(0);\n      assert.equal(o(), 0);\n      oA.push(4);\n      return assert.equal(last(), 4, \"Last should be 4\");\n    });\n    it(\"should work with multiple dependencies\", function() {\n      var checked, first, letter, second;\n      letter = Observable(\"A\");\n      checked = function() {\n        var l;\n        l = letter();\n        return this.name().indexOf(l) === 0;\n      };\n      first = {\n        name: Observable(\"Andrew\")\n      };\n      first.checked = Observable(checked, first);\n      second = {\n        name: Observable(\"Benjamin\")\n      };\n      second.checked = Observable(checked, second);\n      assert.equal(first.checked(), true);\n      assert.equal(second.checked(), false);\n      assert.equal(letter.listeners.length, 2);\n      letter(\"B\");\n      assert.equal(first.checked(), false);\n      return assert.equal(second.checked(), true);\n    });\n    it(\"should work with nested observable construction\", function() {\n      var gen, o;\n      gen = Observable(function() {\n        return Observable(\"Duder\");\n      });\n      o = gen();\n      assert.equal(o(), \"Duder\");\n      o(\"wat\");\n      return assert.equal(o(), \"wat\");\n    });\n    describe(\"Scoping\", function() {\n      return it(\"should be scoped to optional context\", function(done) {\n        var model;\n        model = {\n          firstName: Observable(\"Duder\"),\n          lastName: Observable(\"Man\")\n        };\n        model.name = Observable(function() {\n          return \"\" + (this.firstName()) + \" \" + (this.lastName());\n        }, model);\n        model.name.observe(function(newValue) {\n          assert.equal(newValue, \"Duder Bro\");\n          return done();\n        });\n        return model.lastName(\"Bro\");\n      });\n    });\n    return describe(\"concat\", function() {\n      it(\"should return an observable array that changes based on changes in inputs\", function() {\n        var item, letters, nullable, numbers, observableArray;\n        numbers = Observable([1, 2, 3]);\n        letters = Observable([\"a\", \"b\", \"c\"]);\n        item = Observable({});\n        nullable = Observable(null);\n        observableArray = Observable.concat(numbers, \"literal\", letters, item, nullable);\n        assert.equal(observableArray().length, 3 + 1 + 3 + 1);\n        assert.equal(observableArray()[0], 1);\n        assert.equal(observableArray()[3], \"literal\");\n        assert.equal(observableArray()[4], \"a\");\n        assert.equal(observableArray()[7], item());\n        numbers.push(4);\n        assert.equal(observableArray().length, 9);\n        nullable(\"cool\");\n        return assert.equal(observableArray().length, 10);\n      });\n      it(\"should work with observable functions that return arrays\", function() {\n        var computedArray, item, observableArray;\n        item = Observable(\"wat\");\n        computedArray = Observable(function() {\n          return [item()];\n        });\n        observableArray = Observable.concat(computedArray, computedArray);\n        assert.equal(observableArray().length, 2);\n        assert.equal(observableArray()[1], \"wat\");\n        item(\"yolo\");\n        return assert.equal(observableArray()[1], \"yolo\");\n      });\n      it(\"should have a push method\", function() {\n        var observable, observableArray;\n        observableArray = Observable.concat();\n        observable = Observable(\"hey\");\n        observableArray.push(observable);\n        assert.equal(observableArray()[0], \"hey\");\n        observable(\"wat\");\n        assert.equal(observableArray()[0], \"wat\");\n        observableArray.push(\"cool\");\n        observableArray.push(\"radical\");\n        return assert.equal(observableArray().length, 3);\n      });\n      it(\"should be observable\", function(done) {\n        var observableArray;\n        observableArray = Observable.concat();\n        observableArray.observe(function(items) {\n          assert.equal(items.length, 3);\n          return done();\n        });\n        return observableArray.push([\"A\", \"B\", \"C\"]);\n      });\n      return it(\"should have an each method\", function() {\n        var n, observableArray;\n        observableArray = Observable.concat([\"A\", \"B\", \"C\"]);\n        n = 0;\n        observableArray.each(function() {\n          return n += 1;\n        });\n        return assert.equal(n, 3);\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.2.0-pre.1",
      "entryPoint": "main",
      "repository": {
        "branch": "master",
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
        "branch": "master",
        "defaultBranch": "master"
      },
      "dependencies": {}
    },
    "postmaster": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "postmaster\n==========\n\nSend and receive postMessage commands.\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Postmaster\n==========\n\nPostmaster allows a child window that was opened from a parent window to\nreceive method calls from the parent window through the postMessage events.\n\nFigure out who we should be listening to.\n\n    dominant = opener or ((parent != window) and parent) or undefined\n\nBind postMessage events to methods.\n\n    module.exports = (I={}, self={}) ->\n      # Only listening to messages from `opener`\n      addEventListener \"message\", (event) ->\n        if event.source is dominant\n          {method, params, id} = event.data\n\n          try\n            result = self[method](params...)\n\n            send\n              type: \"response\"\n              id: id\n              success: result \n          catch error\n            send\n              type: \"response\"\n              id: id\n              error:\n                message: error.message\n                stack: error.stack\n\n      addEventListener \"unload\", ->\n        send\n          status: \"unload\"\n\n      # Tell our opener that we're ready\n      send\n        status: \"ready\"\n\n      self.sendToParent = send\n\n      return self\n\n    send = (data) ->\n      dominant?.postMessage data, \"*\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.2.3\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/postmaster.coffee": {
          "path": "test/postmaster.coffee",
          "content": "Postmaster = require \"../main\"\n\ndescribe \"Postmaster\", ->\n  it \"should allow sending messages to parent\", ->\n    postmaster = Postmaster()\n\n    postmaster.sendToParent\n      radical: \"true\"\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var dominant, send;\n\n  dominant = opener || ((parent !== window) && parent) || void 0;\n\n  module.exports = function(I, self) {\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    addEventListener(\"message\", function(event) {\n      var error, id, method, params, result, _ref;\n      if (event.source === dominant) {\n        _ref = event.data, method = _ref.method, params = _ref.params, id = _ref.id;\n        try {\n          result = self[method].apply(self, params);\n          return send({\n            type: \"response\",\n            id: id,\n            success: result\n          });\n        } catch (_error) {\n          error = _error;\n          return send({\n            type: \"response\",\n            id: id,\n            error: {\n              message: error.message,\n              stack: error.stack\n            }\n          });\n        }\n      }\n    });\n    addEventListener(\"unload\", function() {\n      return send({\n        status: \"unload\"\n      });\n    });\n    send({\n      status: \"ready\"\n    });\n    self.sendToParent = send;\n    return self;\n  };\n\n  send = function(data) {\n    return dominant != null ? dominant.postMessage(data, \"*\") : void 0;\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.2.3\"};",
          "type": "blob"
        },
        "test/postmaster": {
          "path": "test/postmaster",
          "content": "(function() {\n  var Postmaster;\n\n  Postmaster = require(\"../main\");\n\n  describe(\"Postmaster\", function() {\n    return it(\"should allow sending messages to parent\", function() {\n      var postmaster;\n      postmaster = Postmaster();\n      return postmaster.sendToParent({\n        radical: \"true\"\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.2.3",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.2.3",
        "default_branch": "master",
        "full_name": "distri/postmaster",
        "homepage": null,
        "description": "Send and receive postMessage commands.",
        "html_url": "https://github.com/distri/postmaster",
        "url": "https://api.github.com/repos/distri/postmaster",
        "publishBranch": "gh-pages"
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
    "size": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2014 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "size\n====\n\n2d extent\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Size\n====\n\nA simple 2d extent.\n\n    Size = (width, height) ->\n      if Array.isArray(width)\n        [width, height] = width\n      else if typeof width is \"object\"\n        {width, height} = width\n\n      width: width\n      height: height\n      __proto__: Size.prototype\n\n    Size.prototype =\n      copy: ->\n        Size(this)\n\n      scale: (scalar) ->\n        Size(@width * scalar, @height * scalar)\n\n      toString: ->\n        \"Size(#{@width}, #{@height})\"\n\n      max: (otherSize) ->\n        Size(\n          Math.max(@width, otherSize.width)\n          Math.max(@height, otherSize.height)\n        )\n\n      each: (iterator) ->\n        [0...@height].forEach (y) =>\n          [0...@width].forEach (x) ->\n            iterator(x, y)\n\n      inverse: ->\n        Size(1/@width, 1/@height)\n\n    module.exports = Size\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.4\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "Size = require \"../main\"\n\ndescribe \"Size\", ->\n  it \"should have a width and height\", ->\n    size = Size(10, 10)\n\n    assert.equal size.width, 10\n    assert.equal size.height, 10\n\n  it \"should be createable from an array\", ->\n    size = Size [5, 4]\n\n    assert.equal size.width, 5\n    assert.equal size.height, 4\n\n  it \"should be createable from an object\", ->\n    size = Size\n      width: 6\n      height: 7\n\n    assert.equal size.width, 6\n    assert.equal size.height, 7\n\n  it \"should iterate\", ->\n    size = Size(4, 5)\n    total = 0\n\n    size.each (x, y) ->\n      total += 1\n\n    assert.equal total, 20\n\n  it \"should have no iterations when empty\", ->\n    size = Size(0, 0)\n    total = 0\n\n    size.each (x, y) ->\n      total += 1\n\n    assert.equal total, 0\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var Size;\n\n  Size = function(width, height) {\n    var _ref, _ref1;\n    if (Array.isArray(width)) {\n      _ref = width, width = _ref[0], height = _ref[1];\n    } else if (typeof width === \"object\") {\n      _ref1 = width, width = _ref1.width, height = _ref1.height;\n    }\n    return {\n      width: width,\n      height: height,\n      __proto__: Size.prototype\n    };\n  };\n\n  Size.prototype = {\n    copy: function() {\n      return Size(this);\n    },\n    scale: function(scalar) {\n      return Size(this.width * scalar, this.height * scalar);\n    },\n    toString: function() {\n      return \"Size(\" + this.width + \", \" + this.height + \")\";\n    },\n    max: function(otherSize) {\n      return Size(Math.max(this.width, otherSize.width), Math.max(this.height, otherSize.height));\n    },\n    each: function(iterator) {\n      var _i, _ref, _results;\n      return (function() {\n        _results = [];\n        for (var _i = 0, _ref = this.height; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach((function(_this) {\n        return function(y) {\n          var _i, _ref, _results;\n          return (function() {\n            _results = [];\n            for (var _i = 0, _ref = _this.width; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }\n            return _results;\n          }).apply(this).forEach(function(x) {\n            return iterator(x, y);\n          });\n        };\n      })(this));\n    },\n    inverse: function() {\n      return Size(1 / this.width, 1 / this.height);\n    }\n  };\n\n  module.exports = Size;\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.4\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Size;\n\n  Size = require(\"../main\");\n\n  describe(\"Size\", function() {\n    it(\"should have a width and height\", function() {\n      var size;\n      size = Size(10, 10);\n      assert.equal(size.width, 10);\n      return assert.equal(size.height, 10);\n    });\n    it(\"should be createable from an array\", function() {\n      var size;\n      size = Size([5, 4]);\n      assert.equal(size.width, 5);\n      return assert.equal(size.height, 4);\n    });\n    it(\"should be createable from an object\", function() {\n      var size;\n      size = Size({\n        width: 6,\n        height: 7\n      });\n      assert.equal(size.width, 6);\n      return assert.equal(size.height, 7);\n    });\n    it(\"should iterate\", function() {\n      var size, total;\n      size = Size(4, 5);\n      total = 0;\n      size.each(function(x, y) {\n        return total += 1;\n      });\n      return assert.equal(total, 20);\n    });\n    return it(\"should have no iterations when empty\", function() {\n      var size, total;\n      size = Size(0, 0);\n      total = 0;\n      size.each(function(x, y) {\n        return total += 1;\n      });\n      return assert.equal(total, 0);\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.1.4",
      "entryPoint": "main",
      "repository": {
        "branch": "master",
        "default_branch": "master",
        "full_name": "distri/size",
        "homepage": null,
        "description": "2d extent",
        "html_url": "https://github.com/distri/size",
        "url": "https://api.github.com/repos/distri/size",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "touch-canvas": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "touch-canvas\n============\n\nA canvas you can touch\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "entryPoint: \"touch_canvas\"\nversion: \"0.4.1\"\ndependencies:\n  \"bindable\": \"distri/bindable:v0.1.0\"\n  \"core\": \"distri/core:v0.6.0\"\n  \"pixie-canvas\": \"distri/pixie-canvas:v0.9.2\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/touch.coffee": {
          "path": "test/touch.coffee",
          "content": "TouchCanvas = require \"../touch_canvas\"\n\nextend = (target, sources...) ->\n  for source in sources\n    for name of source\n      target[name] = source[name]\n\n  return target\n\nfireEvent = (element, type, params={}) ->\n  event = document.createEvent(\"Events\")\n  event.initEvent type, true, false\n  extend event, params\n  element.dispatchEvent event\n\ndescribe \"TouchCanvas\", ->\n  it \"should be creatable\", ->\n    c = TouchCanvas()\n    assert c\n\n    document.body.appendChild(c.element())\n\n  it \"should fire events\", (done) ->\n    canvas = TouchCanvas()\n\n    canvas.on \"touch\", (e) ->\n      done()\n\n    fireEvent canvas.element(), \"mousedown\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "touch_canvas.coffee.md": {
          "path": "touch_canvas.coffee.md",
          "content": "Touch Canvas\n============\n\nA canvas you can TOUCH!\n\nDemo\n----\n\n>     #! demo\n>     paint = (position) ->\n>       x = position.x * canvas.width()\n>       y = position.y * canvas.height()\n>\n>       canvas.drawCircle\n>         radius: 10\n>         color: \"red\"\n>         position:\n>           x: x\n>           y: y\n>\n>     canvas.on \"touch\", (p) ->\n>       paint(p)\n>\n>     canvas.on \"move\", (p) ->\n>       paint(p)\n\n----\n\nImplementation\n--------------\n\nA canvas element that reports mouse and touch events. The events\nare scaled to the size of the canvas with [0, 0] being in the top\nleft and a number close to 1 being in the bottom right.\n\nWe track movement outside of the element so the positions are not\nclamped and return their true value if the canvas were to extend.\nThis means that it is possible to receive negative numbers and\nnumbers >= 1 for positions.\n\n    Bindable = require \"bindable\"\n    Core = require \"core\"\n    PixieCanvas = require \"pixie-canvas\"\n\n    TouchCanvas = (I={}) ->\n      self = PixieCanvas I\n\n      Core(I, self)\n\n      self.include Bindable\n\n      element = self.element()\n\n      # Keep track of if the mouse is active in the element\n      active = false\n\nWhen we click within the canvas set the value for the position we clicked at.\n\n      listen element, \"mousedown\", (e) ->\n        e.preventDefault()\n        active = true\n\n        self.trigger \"touch\", localPosition(e)\n\nHandle touch starts\n\n      listen element, \"touchstart\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"touch\", localPosition(touch)\n\nWhen the mouse moves trigger an event with the current position.\n\n      listen element, \"mousemove\", (e) ->\n        e.preventDefault()\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle moves outside of the element if the action was initiated within the element.\n\n      listen document, \"mousemove\", (e) ->\n        if active\n          self.trigger \"move\", localPosition(e)\n\nHandle touch moves.\n\n      listen element, \"touchmove\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"move\", localPosition(touch)\n\nHandle releases.\n\n      listen element, \"mouseup\", (e) ->\n        self.trigger \"release\", localPosition(e)\n        active = false\n\n        return\n\nHandle touch ends.\n\n      listen element, \"touchend\", (e) ->\n        # Global `event`\n        processTouches event, (touch) ->\n          self.trigger \"release\", localPosition(touch)\n\nWhenever the mouse button is released from anywhere, deactivate. Be sure to\ntrigger the release event if the mousedown started within the element.\n\n      listen document, \"mouseup\", (e) ->\n        if active\n          self.trigger \"release\", localPosition(e)\n\n        active = false\n\n        return\n\nHelpers\n-------\n\nProcess touches\n\n      processTouches = (event, fn) ->\n        event.preventDefault()\n\n        if event.type is \"touchend\"\n          # touchend doesn't have any touches, but does have changed touches\n          touches = event.changedTouches\n        else\n          touches = event.touches\n\n        self.debug? Array::map.call touches, ({identifier, pageX, pageY}) ->\n          \"[#{identifier}: #{pageX}, #{pageY} (#{event.type})]\\n\"\n\n        Array::forEach.call touches, fn\n\nLocal event position.\n\n      localPosition = (e) ->\n        rect = element.getBoundingClientRect()\n\n        point =\n          x: (e.pageX - rect.left) / rect.width\n          y: (e.pageY - rect.top) / rect.height\n\n        # Add mouse into touch identifiers as 0\n        point.identifier = (e.identifier + 1) or 0\n\n        return point\n\nReturn self\n\n      return self\n\nAttach an event listener to an element\n\n    listen = (element, event, handler) ->\n      element.addEventListener(event, handler, false)\n\nExport\n\n    module.exports = TouchCanvas\n\nInteractive Examples\n--------------------\n\nThis is what is used to set up the demo at the beginning of this document.\n\n>     #! setup\n>     TouchCanvas = require \"/touch_canvas\"\n>\n>     Interactive.register \"demo\", ({source, runtimeElement}) ->\n>       canvas = TouchCanvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"entryPoint\":\"touch_canvas\",\"version\":\"0.4.1\",\"dependencies\":{\"bindable\":\"distri/bindable:v0.1.0\",\"core\":\"distri/core:v0.6.0\",\"pixie-canvas\":\"distri/pixie-canvas:v0.9.2\"}};",
          "type": "blob"
        },
        "test/touch": {
          "path": "test/touch",
          "content": "(function() {\n  var TouchCanvas, extend, fireEvent,\n    __slice = [].slice;\n\n  TouchCanvas = require(\"../touch_canvas\");\n\n  extend = function() {\n    var name, source, sources, target, _i, _len;\n    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    for (_i = 0, _len = sources.length; _i < _len; _i++) {\n      source = sources[_i];\n      for (name in source) {\n        target[name] = source[name];\n      }\n    }\n    return target;\n  };\n\n  fireEvent = function(element, type, params) {\n    var event;\n    if (params == null) {\n      params = {};\n    }\n    event = document.createEvent(\"Events\");\n    event.initEvent(type, true, false);\n    extend(event, params);\n    return element.dispatchEvent(event);\n  };\n\n  describe(\"TouchCanvas\", function() {\n    it(\"should be creatable\", function() {\n      var c;\n      c = TouchCanvas();\n      assert(c);\n      return document.body.appendChild(c.element());\n    });\n    return it(\"should fire events\", function(done) {\n      var canvas;\n      canvas = TouchCanvas();\n      canvas.on(\"touch\", function(e) {\n        return done();\n      });\n      return fireEvent(canvas.element(), \"mousedown\");\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "touch_canvas": {
          "path": "touch_canvas",
          "content": "(function() {\n  var Bindable, Core, PixieCanvas, TouchCanvas, listen;\n\n  Bindable = require(\"bindable\");\n\n  Core = require(\"core\");\n\n  PixieCanvas = require(\"pixie-canvas\");\n\n  TouchCanvas = function(I) {\n    var active, element, localPosition, processTouches, self;\n    if (I == null) {\n      I = {};\n    }\n    self = PixieCanvas(I);\n    Core(I, self);\n    self.include(Bindable);\n    element = self.element();\n    active = false;\n    listen(element, \"mousedown\", function(e) {\n      e.preventDefault();\n      active = true;\n      return self.trigger(\"touch\", localPosition(e));\n    });\n    listen(element, \"touchstart\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"touch\", localPosition(touch));\n      });\n    });\n    listen(element, \"mousemove\", function(e) {\n      e.preventDefault();\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    listen(document, \"mousemove\", function(e) {\n      if (active) {\n        return self.trigger(\"move\", localPosition(e));\n      }\n    });\n    listen(element, \"touchmove\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"move\", localPosition(touch));\n      });\n    });\n    listen(element, \"mouseup\", function(e) {\n      self.trigger(\"release\", localPosition(e));\n      active = false;\n    });\n    listen(element, \"touchend\", function(e) {\n      return processTouches(event, function(touch) {\n        return self.trigger(\"release\", localPosition(touch));\n      });\n    });\n    listen(document, \"mouseup\", function(e) {\n      if (active) {\n        self.trigger(\"release\", localPosition(e));\n      }\n      active = false;\n    });\n    processTouches = function(event, fn) {\n      var touches;\n      event.preventDefault();\n      if (event.type === \"touchend\") {\n        touches = event.changedTouches;\n      } else {\n        touches = event.touches;\n      }\n      if (typeof self.debug === \"function\") {\n        self.debug(Array.prototype.map.call(touches, function(_arg) {\n          var identifier, pageX, pageY;\n          identifier = _arg.identifier, pageX = _arg.pageX, pageY = _arg.pageY;\n          return \"[\" + identifier + \": \" + pageX + \", \" + pageY + \" (\" + event.type + \")]\\n\";\n        }));\n      }\n      return Array.prototype.forEach.call(touches, fn);\n    };\n    localPosition = function(e) {\n      var point, rect;\n      rect = element.getBoundingClientRect();\n      point = {\n        x: (e.pageX - rect.left) / rect.width,\n        y: (e.pageY - rect.top) / rect.height\n      };\n      point.identifier = (e.identifier + 1) || 0;\n      return point;\n    };\n    return self;\n  };\n\n  listen = function(element, event, handler) {\n    return element.addEventListener(event, handler, false);\n  };\n\n  module.exports = TouchCanvas;\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "version": "0.4.1",
      "entryPoint": "touch_canvas",
      "repository": {
        "branch": "v0.4.1",
        "default_branch": "master",
        "full_name": "distri/touch-canvas",
        "homepage": null,
        "description": "A canvas you can touch",
        "html_url": "https://github.com/distri/touch-canvas",
        "url": "https://api.github.com/repos/distri/touch-canvas",
        "publishBranch": "gh-pages"
      },
      "dependencies": {
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
        "pixie-canvas": {
          "source": {
            "pixie.cson": {
              "path": "pixie.cson",
              "mode": "100644",
              "content": "entryPoint: \"pixie_canvas\"\nversion: \"0.9.2\"\n",
              "type": "blob"
            },
            "pixie_canvas.coffee.md": {
              "path": "pixie_canvas.coffee.md",
              "mode": "100644",
              "content": "Pixie Canvas\n============\n\nPixieCanvas provides a convenient wrapper for working with Context2d.\n\nMethods try to be as flexible as possible as to what arguments they take.\n\nNon-getter methods return `this` for method chaining.\n\n    TAU = 2 * Math.PI\n\n    module.exports = (options={}) ->\n        defaults options,\n          width: 400\n          height: 400\n          init: ->\n\n        canvas = document.createElement \"canvas\"\n        canvas.width = options.width\n        canvas.height = options.height\n\n        context = undefined\n\n        self =\n\n`clear` clears the entire canvas (or a portion of it).\n\nTo clear the entire canvas use `canvas.clear()`\n\n>     #! paint\n>     # Set up: Fill canvas with blue\n>     canvas.fill(\"blue\")\n>\n>     # Clear a portion of the canvas\n>     canvas.clear\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n\n          clear: ({x, y, width, height}={}) ->\n            x ?= 0\n            y ?= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            context.clearRect(x, y, width, height)\n\n            return this\n\nFills the entire canvas (or a specified section of it) with\nthe given color.\n\n>     #! paint\n>     # Paint the town (entire canvas) red\n>     canvas.fill \"red\"\n>\n>     # Fill a section of the canvas white (#FFF)\n>     canvas.fill\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#FFF\"\n\n          fill: (color={}) ->\n            unless (typeof color is \"string\") or color.channels\n              {x, y, width, height, bounds, color} = color\n\n            {x, y, width, height} = bounds if bounds\n\n            x ||= 0\n            y ||= 0\n            width = canvas.width unless width?\n            height = canvas.height unless height?\n\n            @fillColor(color)\n            context.fillRect(x, y, width, height)\n\n            return this\n\nA direct map to the Context2d draw image. `GameObject`s\nthat implement drawable will have this wrapped up nicely,\nso there is a good chance that you will not have to deal with\nit directly.\n\n>     #! paint\n>     $ \"<img>\",\n>       src: \"https://secure.gravatar.com/avatar/33117162fff8a9cf50544a604f60c045\"\n>       load: ->\n>         canvas.drawImage(this, 25, 25)\n\n          drawImage: (args...) ->\n            context.drawImage(args...)\n\n            return this\n\nDraws a circle at the specified position with the specified\nradius and color.\n\n>     #! paint\n>     # Draw a large orange circle\n>     canvas.drawCircle\n>       radius: 30\n>       position: Point(100, 75)\n>       color: \"orange\"\n>\n>     # You may also set a stroke\n>     canvas.drawCircle\n>       x: 25\n>       y: 50\n>       radius: 10\n>       color: \"blue\"\n>       stroke:\n>         color: \"red\"\n>         width: 1\n\nYou can pass in circle objects as well.\n\n>     #! paint\n>     # Create a circle object to set up the next examples\n>     circle =\n>       radius: 20\n>       x: 50\n>       y: 50\n>\n>     # Draw a given circle in yellow\n>     canvas.drawCircle\n>       circle: circle\n>       color: \"yellow\"\n>\n>     # Draw the circle in green at a different position\n>     canvas.drawCircle\n>       circle: circle\n>       position: Point(25, 75)\n>       color: \"green\"\n\nYou may set a stroke, or even pass in only a stroke to draw an unfilled circle.\n\n>     #! paint\n>     # Draw an outline circle in purple.\n>     canvas.drawCircle\n>       x: 50\n>       y: 75\n>       radius: 10\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n>\n\n          drawCircle: ({x, y, radius, position, color, stroke, circle}) ->\n            {x, y, radius} = circle if circle\n            {x, y} = position if position\n\n            radius = 0 if radius < 0\n\n            context.beginPath()\n            context.arc(x, y, radius, 0, TAU, true)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return this\n\nDraws a rectangle at the specified position with given\nwidth and height. Optionally takes a position, bounds\nand color argument.\n\n\n          drawRect: ({x, y, width, height, position, bounds, color, stroke}) ->\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            if color\n              @fillColor(color)\n              context.fillRect(x, y, width, height)\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.strokeRect(x, y, width, height)\n\n            return @\n\n>     #! paint\n>     # Draw a red rectangle using x, y, width and height\n>     canvas.drawRect\n>       x: 50\n>       y: 50\n>       width: 50\n>       height: 50\n>       color: \"#F00\"\n\n----\n\nYou can mix and match position, witdth and height.\n\n>     #! paint\n>     canvas.drawRect\n>       position: Point(0, 0)\n>       width: 50\n>       height: 50\n>       color: \"blue\"\n>       stroke:\n>         color: \"orange\"\n>         width: 3\n\n----\n\nA bounds can be reused to draw multiple rectangles.\n\n>     #! paint\n>     bounds =\n>       x: 100\n>       y: 0\n>       width: 100\n>       height: 100\n>\n>     # Draw a purple rectangle using bounds\n>     canvas.drawRect\n>       bounds: bounds\n>       color: \"green\"\n>\n>     # Draw the outline of the same bounds, but at a different position\n>     canvas.drawRect\n>       bounds: bounds\n>       position: Point(0, 50)\n>       stroke:\n>         color: \"purple\"\n>         width: 2\n\n----\n\nDraw a line from `start` to `end`.\n\n>     #! paint\n>     # Draw a sweet diagonal\n>     canvas.drawLine\n>       start: Point(0, 0)\n>       end: Point(200, 200)\n>       color: \"purple\"\n>\n>     # Draw another sweet diagonal\n>     canvas.drawLine\n>       start: Point(200, 0)\n>       end: Point(0, 200)\n>       color: \"red\"\n>       width: 6\n>\n>     # Now draw a sweet horizontal with a direction and a length\n>     canvas.drawLine\n>       start: Point(0, 100)\n>       length: 200\n>       direction: Point(1, 0)\n>       color: \"orange\"\n\n          drawLine: ({start, end, width, color, direction, length}) ->\n            width ||= 3\n\n            if direction\n              end = direction.norm(length).add(start)\n\n            @lineWidth(width)\n            @strokeColor(color)\n\n            context.beginPath()\n            context.moveTo(start.x, start.y)\n            context.lineTo(end.x, end.y)\n            context.closePath()\n            context.stroke()\n\n            return this\n\nDraw a polygon.\n\n>     #! paint\n>     # Draw a sweet rhombus\n>     canvas.drawPoly\n>       points: [\n>         Point(50, 25)\n>         Point(75, 50)\n>         Point(50, 75)\n>         Point(25, 50)\n>       ]\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawPoly: ({points, color, stroke}) ->\n            context.beginPath()\n            points.forEach (point, i) ->\n              if i == 0\n                context.moveTo(point.x, point.y)\n              else\n                context.lineTo(point.x, point.y)\n            context.lineTo points[0].x, points[0].y\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @strokeColor(stroke.color)\n              @lineWidth(stroke.width)\n              context.stroke()\n\n            return @\n\nDraw a rounded rectangle.\n\nAdapted from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html\n\n>     #! paint\n>     # Draw a purple rounded rectangle with a red outline\n>     canvas.drawRoundRect\n>       position: Point(25, 25)\n>       radius: 10\n>       width: 150\n>       height: 100\n>       color: \"purple\"\n>       stroke:\n>         color: \"red\"\n>         width: 2\n\n          drawRoundRect: ({x, y, width, height, radius, position, bounds, color, stroke}) ->\n            radius = 5 unless radius?\n\n            {x, y, width, height} = bounds if bounds\n            {x, y} = position if position\n\n            context.beginPath()\n            context.moveTo(x + radius, y)\n            context.lineTo(x + width - radius, y)\n            context.quadraticCurveTo(x + width, y, x + width, y + radius)\n            context.lineTo(x + width, y + height - radius)\n            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)\n            context.lineTo(x + radius, y + height)\n            context.quadraticCurveTo(x, y + height, x, y + height - radius)\n            context.lineTo(x, y + radius)\n            context.quadraticCurveTo(x, y, x + radius, y)\n            context.closePath()\n\n            if color\n              @fillColor(color)\n              context.fill()\n\n            if stroke\n              @lineWidth(stroke.width)\n              @strokeColor(stroke.color)\n              context.stroke()\n\n            return this\n\nDraws text on the canvas at the given position, in the given color.\nIf no color is given then the previous fill color is used.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: '#eee'\n>\n>     # A line to indicate the baseline\n>     canvas.drawLine\n>       start: Point(25, 50)\n>       end: Point(125, 50)\n>       color: \"#333\"\n>       width: 1\n>\n>     # Draw some text, note the position of the baseline\n>     canvas.drawText\n>       position: Point(25, 50)\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n\n\n          drawText: ({x, y, text, position, color, font}) ->\n            {x, y} = position if position\n\n            @fillColor(color)\n            @font(font) if font\n            context.fillText(text, x, y)\n\n            return this\n\nCenters the given text on the canvas at the given y position. An x position\nor point position can also be given in which case the text is centered at the\nx, y or position value specified.\n\n>     #! paint\n>     # Fill canvas to indicate bounds\n>     canvas.fill\n>       color: \"#eee\"\n>\n>     # Center text on the screen at y value 25\n>     canvas.centerText\n>       y: 25\n>       color: \"red\"\n>       text: \"It's dangerous to go alone\"\n>\n>     # Center text at point (75, 75)\n>     canvas.centerText\n>       position: Point(75, 75)\n>       color: \"green\"\n>       text: \"take this\"\n\n          centerText: ({text, x, y, position, color, font}) ->\n            {x, y} = position if position\n\n            x = canvas.width / 2 unless x?\n\n            textWidth = @measureText(text)\n\n            @drawText {\n              text\n              color\n              font\n              x: x - (textWidth) / 2\n              y\n            }\n\nSetting the fill color:\n\n`canvas.fillColor(\"#FF0000\")`\n\nPassing no arguments returns the fillColor:\n\n`canvas.fillColor() # => \"#FF000000\"`\n\nYou can also pass a Color object:\n\n`canvas.fillColor(Color('sky blue'))`\n\n          fillColor: (color) ->\n            if color\n              if color.channels\n                context.fillStyle = color.toString()\n              else\n                context.fillStyle = color\n\n              return @\n            else\n              return context.fillStyle\n\nSetting the stroke color:\n\n`canvas.strokeColor(\"#FF0000\")`\n\nPassing no arguments returns the strokeColor:\n\n`canvas.strokeColor() # => \"#FF0000\"`\n\nYou can also pass a Color object:\n\n`canvas.strokeColor(Color('sky blue'))`\n\n          strokeColor: (color) ->\n            if color\n              if color.channels\n                context.strokeStyle = color.toString()\n              else\n                context.strokeStyle = color\n\n              return this\n            else\n              return context.strokeStyle\n\nDetermine how wide some text is.\n\n`canvas.measureText('Hello World!') # => 55`\n\nIt may have accuracy issues depending on the font used.\n\n          measureText: (text) ->\n            context.measureText(text).width\n\nPasses this canvas to the block with the given matrix transformation\napplied. All drawing methods called within the block will draw\ninto the canvas with the transformation applied. The transformation\nis removed at the end of the block, even if the block throws an error.\n\n          withTransform: (matrix, block) ->\n            context.save()\n\n            context.transform(\n              matrix.a,\n              matrix.b,\n              matrix.c,\n              matrix.d,\n              matrix.tx,\n              matrix.ty\n            )\n\n            try\n              block(this)\n            finally\n              context.restore()\n\n            return this\n\nStraight proxy to context `putImageData` method.\n\n          putImageData: (args...) ->\n            context.putImageData(args...)\n\n            return this\n\nContext getter.\n\n          context: ->\n            context\n\nGetter for the actual html canvas element.\n\n          element: ->\n            canvas\n\nStraight proxy to context pattern creation.\n\n          createPattern: (image, repitition) ->\n            context.createPattern(image, repitition)\n\nSet a clip rectangle.\n\n          clip: (x, y, width, height) ->\n            context.beginPath()\n            context.rect(x, y, width, height)\n            context.clip()\n\n            return this\n\nGenerate accessors that get properties from the context object.\n\n        contextAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                context[attr] = newVal\n                return @\n              else\n                context[attr]\n\n        contextAttrAccessor(\n          \"font\",\n          \"globalAlpha\",\n          \"globalCompositeOperation\",\n          \"lineWidth\",\n          \"textAlign\",\n        )\n\nGenerate accessors that get properties from the canvas object.\n\n        canvasAttrAccessor = (attrs...) ->\n          attrs.forEach (attr) ->\n            self[attr] = (newVal) ->\n              if newVal?\n                canvas[attr] = newVal\n                return @\n              else\n                canvas[attr]\n\n        canvasAttrAccessor(\n          \"height\",\n          \"width\",\n        )\n\n        context = canvas.getContext('2d')\n\n        options.init(self)\n\n        return self\n\nHelpers\n-------\n\nFill in default properties for an object, setting them only if they are not\nalready present.\n\n    defaults = (target, objects...) ->\n      for object in objects\n        for name of object\n          unless target.hasOwnProperty(name)\n            target[name] = object[name]\n\n      return target\n\nInteractive Examples\n--------------------\n\n>     #! setup\n>     Canvas = require \"/pixie_canvas\"\n>\n>     window.Point ?= (x, y) ->\n>       x: x\n>       y: y\n>\n>     Interactive.register \"paint\", ({source, runtimeElement}) ->\n>       canvas = Canvas\n>         width: 400\n>         height: 200\n>\n>       code = CoffeeScript.compile(source)\n>\n>       runtimeElement.empty().append canvas.element()\n>       Function(\"canvas\", code)(canvas)\n",
              "type": "blob"
            },
            "test/test.coffee": {
              "path": "test/test.coffee",
              "mode": "100644",
              "content": "Canvas = require \"../pixie_canvas\"\n\ndescribe \"pixie canvas\", ->\n  it \"Should create a canvas\", ->\n    canvas = Canvas\n      width: 400\n      height: 150\n\n    assert canvas\n\n    assert canvas.width() is 400\n",
              "type": "blob"
            }
          },
          "distribution": {
            "pixie": {
              "path": "pixie",
              "content": "module.exports = {\"entryPoint\":\"pixie_canvas\",\"version\":\"0.9.2\"};",
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
          "version": "0.9.2",
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
            "updated_at": "2013-11-29T20:54:07Z",
            "pushed_at": "2013-11-29T20:54:07Z",
            "git_url": "git://github.com/distri/pixie-canvas.git",
            "ssh_url": "git@github.com:distri/pixie-canvas.git",
            "clone_url": "https://github.com/distri/pixie-canvas.git",
            "svn_url": "https://github.com/distri/pixie-canvas",
            "homepage": null,
            "size": 664,
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
            "branch": "v0.9.2",
            "publishBranch": "gh-pages"
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