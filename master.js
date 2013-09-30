(function() {
  var runtime;

  require("hotkeys");

  runtime = require("runtime")(PACKAGE);

  runtime.boot();

  runtime.applyStyleSheet(require('./style'));

}).call(this);
