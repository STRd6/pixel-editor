TODO
====

Full Color Mode
---------------

32bit Color, Custom Palettes, Color Picker

Better Circle Tool
------------------

Calculate midpoint of [start, end], use that as center and radius as length/2

Better Preview
--------------

Handle transparancy

Better performance
------------------

Use true size canvas, not enlarged canvas. Avoid lots of pixel manipulation and
let the canvas drawing functions do the work for us. Blit the 'work' canvas onto
the active layer when the command completes.

Never call `repaint` on the whole editor, all the layers should always paint
themselves, and only the regions necessary should be repainted.

Operate directly on imageData arrays where possible.

Colors as ints?

Vintage Replays
---------------

Be able to display PixieEngine replays

True replays
------------

Capture all user input as events, replay entire event stream.

Better Symmetry
---------------

Multiply events through symmetry so that flood fill and others
can work better with symmetry modes.

Radial symmetry

Bugs
----

V2
====

Hot reload editor state / initial editor state

Documentation

Autosave

Analytics

Layers
  Reorder Layers
  Delete Layers

Sync to server?

Animation Frames
  New Frame
  Delete Frame
  Onion Skin

Copy/Paste

Grid
  Modify Grid Size

Command Console

Scripts

Plugins

Bugs
----

Display transparent preview as transparent instead of white

Done
====
Selection Tool

Transparancy Mode (index 0 or none)

Prompt unsaved on exit

Palette
  Load Palette
  Modify Palette

Tool cursors

Position Display

Tool Hotkeys

Replay

Composite Preview

Zoom In/Out

Resize Image

Export Image

Load Image
Save Image

Save Files to desktop
  .json

Export to desktop
  .png

Open files from a file picker
  .json
  .png or .jpeg

Bugs
----

Replay doesn't reset to initial canvas size

Opening an images keeps old layer instead of replacing

Opening an image that is smaller than the canvas grid spacing issues

Expand canvas when dropping an larger image

Preview Erase/Transparent

Preview Layer in canvas always shows at top

Preview and layers get cut off for larger images

Resize doesn't repaint

Error undoing resize
