Pixel Editor
============

It edits pixels

[Live Demo](https://danielx.net/pixel-editor/)

Embedding Instructions
======================

The editor will send a `postMessage` to its parent window when "Save" is clicked.

One thing to note is that this is pointing to the latest version of
https://danielx.net/pixel-editor/ so it might break out from under you. You'd
probably want to host a stable version of the editor on your own service after
you get it working if you care about that kind of thing.

```html
    <html>
    <body>
    </body>
    <iframe src="https://danielx.net/pixel-editor/" width="100%" height="100%"></iframe>
    <script>
    window.addEventListener("message", receiveMessage, false);
    function receiveMessage(event) {
      var origin = event.origin;

      if (origin !== "https://danielx.net") {
        return;
      }

      var data = event.data;
      if (data.method === "save") {
        var image = data.image; // HTML5 Blob object
        var width = data.width;
        var height = data.height;

        // Post to your server, etc
        console.log(data);
      }
    }
    <\/script>
    </html>
```

Developer Instructions
======================

Fork on Github https://github.com/STRd6/pixel-editor/fork

Go to http://danielx.net/editor

Load your fork by clicking "Load Repo" and typing in "<username>/pixel-editor"

When it loads click "Run" to make sure it works

Click "New Feature" to start working on a feature branch

Modify the code and click "Run" to see your changes.

Click "Save" to push the code to your feature branch

Review your branch on Github to make a pull request.

Hopefully that works, but if not open an issue at https://github.com/STRd6/editor/issues/
and let me know what's not working.
