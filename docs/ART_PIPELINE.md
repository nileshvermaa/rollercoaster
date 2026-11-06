# Art pipeline

The look comes from AI-generated painted art (backgrounds, carts, characters) plus live vector UI
(buttons, panels, gauges, text) built in CSS/SVG.

## Making art

Prompts for every asset, phase by phase, are in [art-prompts/](art-prompts/). Rules that matter:

- **One asset per generation**, downloaded as the original file, never a screenshot of a grid.
- The object fills ~85% of the canvas.
- Real transparency, or a flat `#00FF00` background. **Never a painted checkerboard.**
- Background layers: full width, tile left-to-right, separate files per parallax layer.

## Cutting art out

```bash
pip install pillow numpy scipy
python tools/art/cutout.py <raw_dir> <out_dir>                         # green screen / checkerboard → alpha
python tools/art/slice_sheet.py boxes <sheet.png> <boxes.txt> <out_dir> # slice a composite sheet by named boxes
```

## Composing screen backdrops from world layers

```bash
python tools/art/compose_backdrop.py <layers_dir> park public/assets/bg/menu.webp --x 0.66 --mood dusk
```

`--x` slides the frame along the layers, `--mood` is `day`, `dusk` or `silhouette` (loading screen).
Today's splash, menu and loading backdrops were made this way from the park layers.

## Dropping art in

Put the original in `art/hd/` under the same path and run `python tools/art/ingest.py` (see
[ART_NEEDED.md](ART_NEEDED.md) for the priority list and prompts). Current files are
low-resolution placeholders sliced from composite sheets. Target sizes: backgrounds 1920×1080 (parallax layers 3840×1080),
carts 1024×512, riders and portraits 512×512, UI icons 256×256.

| File | Used for |
| --- | --- |
| `bg/park-{sky,far,mid,near}.webp` | gameplay parallax layers |
| `bg/splash.webp`, `bg/garage.webp` | title/menu and garage backgrounds |
| `carts/<id>.webp`, `carts/coaster-wheel.webp`, `riders/*.webp` | carts, wheels and riders |
| `ui/logo.webp`, `ui/fuel.webp`, `ui/ribbon.webp` | logo, fuel can, results ribbon |
