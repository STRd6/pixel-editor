Download Pixi Paint
===================

Pixi Paint is a pay what you want pixel editor. Try it out!

Our primary focus is on ease of use and simplicity. Pixi Paint is fun for
beginners and experts alike to explore limited palette pixel art.

<h3>Features</h3>

- Brushes and Shapes
- Color Picker
- Line Tool
- Total Palette Control
- 4 Symmetry Modes
- 2 Transparency Modes
- Unlimited Undo
- Adjustable Zoom
- Optional Grid
- Replays
- Export to .png

---

Suggested Donation $1.99
------------------------

Please donate if Pixi Paint is fun or useful for you!

<button class="paymentButton">Pay with Card</button>

Download
--------

[Windows](http://0.pixiecdn.com/PixiePaint-win.zip)

[OSX](http://0.pixiecdn.com/PixiePaint-osx.zip)

Pixi Paint is [open source software](https://github.com/STRd6/pixel-editor).

---

>     #! setup
>     # TODO: Figure out the right way to add analytics to all docs/app pages
>     require("analytics").init("UA-3464282-15")
>     require("/stripe-payment")(".paymentButton")
>
>     $("li.example").remove() # Hack to hide setup code
>
>     $(".content").eq(0).empty()
>     .append($ "<h2>", text: "Live Demo")
>     $(".content").eq(1).empty()
>     .append($ "<iframe>", src: "https://danielx.net/pixel-editor/", style: "border: none; border-top: 1px solid gray", width: 768, height: 640)
