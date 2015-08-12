TODO
====

Opacity/Alpha

Polishing
---------

Icons, Icon offsets for tools

Thumbnail viewing mini-map rectangle

Responsive Design
-----------------

Styling for mobile viewports.

Better Symmetry/Multi Modes
---------------------------

Multiply events through symmetry so that flood fill and others
can work better with symmetry modes.

Radial symmetry

Simple Replays
--------------

Make sure replays can be saved and loaded

Vintage Replays
---------------

Be able to display PixieEngine replays

Brush Options
-------------

Should symmetry be a per-brush option, along with brush sizes, etc?

Memory Usage
------------

Reduce memory usage in undo using dirty regions.

Platforms
---------

Chrome Web Store
Downloadable
Others?

Promotional Media
-----------------

Screenshots
Promo images

Documentation
-------------

Manual
Tutorials
Plugins

Bugs
----

Eraser

V2
====

True replays
------------

Capture all user input as events, replay entire event stream.

Minimize Memory Footprint
-------------------------

Use quadtrees for diffing regions in undo stack.


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

Palette styling, editing palette colors

Preview window on large images

Eye dropper

Better performance
------------------

Use true size canvas, not enlarged canvas. Avoid lots of pixel manipulation and
let the canvas drawing functions do the work for us. Blit the 'work' canvas onto
the active layer when the command completes.

Never call `repaint` on the whole editor, all the layers should always paint
themselves, and only the regions necessary should be repainted.

Operate directly on imageData arrays where possible.

Better Circle Tool
------------------

Calculate midpoint of [start, end], use that as center and radius as length/2

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
