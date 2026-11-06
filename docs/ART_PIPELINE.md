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

## Dropping art in

Replace the file in `public/assets/` with the same name; no code changes needed. Current files are
low-resolution placeholders sliced from composite sheets. Target sizes: backgrounds 1920 px wide,
carts 512 px wide, UI icons 256 px.

| File | Used for |
| --- | --- |
| `bg/park-{sky,far,mid,near}.webp` | gameplay parallax layers |
| `bg/splash.webp`, `bg/garage.webp` | title/menu and garage backgrounds |
| `carts/<id>.webp`, `carts/wheel.webp`, `carts/driver.webp` | the cart, wheels and Dave |
| `ui/logo.webp`, `ui/fuel.webp`, `ui/karen.webp`, `ui/ribbon.webp` | logo, fuel can, Karen, results ribbon |
