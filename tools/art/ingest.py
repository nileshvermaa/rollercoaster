"""Install full-resolution art into the game.

Drop originals into art/hd/ using the SAME relative path as the file they replace, any image
extension, e.g.  art/hd/bg/park-sky.png  ->  public/assets/bg/park-sky.webp

    pip install pillow numpy scipy
    python tools/art/ingest.py            # install everything in art/hd/
    python tools/art/ingest.py --check    # report only, write nothing
    python tools/art/ingest.py --from G:/game/fullresart   # a flat folder of generator exports

With --from, file names are mapped to game paths:
  {world}-{sky|far|mid|near|ground}.png  ->  bg/{world}-{layer}.webp
  FX_{name}.png                          ->  fx/{name}.webp
  BG_{screen}.png                        ->  a screen backdrop (see SCREEN_BG below)

For each file it:
  - refuses names the game does not use (typos would otherwise be silently ignored),
  - removes a flat #00FF00 or painted-checkerboard background on sprites and parallax layers,
  - trims empty margins on sprites,
  - scales down to the target size (never up) and warns if the source is too small,
  - writes WebP next to the old file, replacing it.
No code changes are needed: the game loads the same paths.
"""
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from asset_report import target_for  # noqa: E402
from cutout import alpha_mask, despill  # noqa: E402

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "art" / "hd"
DST = REPO / "public" / "assets"
EXTS = {".png", ".webp", ".jpg", ".jpeg"}

# Full-bleed pictures: never cut out or trimmed.
OPAQUE_PREFIXES = ("bg/menu", "bg/splash", "bg/loading", "bg/garage", "bg/hub", "bg/shop", "hub/", "cards/", "event/banner")


# New assets the game is ready for even though no placeholder file exists yet.
NEW_OK = (re.compile(r"^bg/[a-z]+-ground\.webp$"), re.compile(r"^fx/[a-z-]+\.webp$"), re.compile(r"^bg/(hub|shop)\.webp$"))
# Screen backdrops by generator name. BG_menu has its logo arch dead centre (behind the menu
# buttons), so it backs the hub and settings; BG_menu_alt keeps the centre clear for the menu.
SCREEN_BG = {"splash": "bg/splash.webp", "menu_alt": "bg/menu.webp", "menu": "bg/hub.webp", "shop": "bg/shop.webp",
             "loading": "bg/loading.webp", "garage": "bg/garage.webp"}
WORLDS = ("park", "night", "mountain", "desert", "snow", "volcano")


def map_flat(name):
    """Generator export name -> game path, or None if it isn't something the game uses."""
    stem = Path(name).stem
    m = re.fullmatch(r"([a-z]+)-(sky|far|mid|near|ground)", stem)
    if m and m.group(1) in WORLDS:
        return f"bg/{stem}.webp"
    m = re.fullmatch(r"FX_([a-z-]+)", stem)
    if m:
        return f"fx/{m.group(1)}.webp"
    m = re.fullmatch(r"BG_([a-z_]+)", stem)
    if m and m.group(1) in SCREEN_BG:
        return SCREEN_BG[m.group(1)]
    return None


def is_opaque(rel):
    return rel.startswith(OPAQUE_PREFIXES) or rel.endswith("-sky.webp")


def has_real_alpha(im):
    if im.mode != "RGBA":
        return False
    a = np.asarray(im.getchannel("A"))
    return (a < 250).mean() > 0.02


def process(path, check, rel=None):
    rel = rel or path.relative_to(SRC).with_suffix(".webp").as_posix()
    dest = DST / rel
    if not dest.exists() and not any(p.match(rel) for p in NEW_OK):
        return f"SKIP  {rel}: not a file the game uses (check the name)"
    dest.parent.mkdir(parents=True, exist_ok=True)
    tw, th, _ = target_for(rel)
    im = Image.open(path)
    notes = []

    if is_opaque(rel):
        im = im.convert("RGB")
    else:
        im = im.convert("RGBA")
        if not has_real_alpha(im):
            rgb = np.asarray(im.convert("RGB"))
            a = alpha_mask(rgb, trapped_checker=False)
            if (a < 128).mean() < 0.02:
                notes.append("no transparency found: export with alpha or a flat #00FF00 background")
            im = Image.fromarray(np.dstack([despill(rgb), a]), "RGBA")
            notes.append("background keyed out")
        box = im.getchannel("A").getbbox()
        # Parallax layers and FX strips keep their full frame: their position in the frame matters.
        if box and not (rel.startswith("bg/") or rel.startswith("fx/")):
            im = im.crop(box)

    w, h = im.size
    scale = min(tw / w, th / h, 1.0)
    if max(tw / w, th / h) > 1 / 0.7:
        notes.append(f"still small: {w}x{h}, target {tw}x{th}")
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    if not check:
        im.save(dest, quality=84 if rel.startswith("bg/") else 88, method=6)
    old = "" if check else " (installed)"
    return f"OK    {rel}: {w}x{h} -> {im.size[0]}x{im.size[1]}{old}" + (f"  ! {'; '.join(notes)}" if notes else "")


def main():
    check = "--check" in sys.argv
    if "--from" in sys.argv:
        src = Path(sys.argv[sys.argv.index("--from") + 1])
        for p in sorted(src.iterdir()):
            if p.suffix.lower() not in EXTS:
                continue
            rel = map_flat(p.name)
            print(process(p, check, rel) if rel else f"SKIP  {p.name}: no game slot for this name")
        return
    files = [p for p in sorted(SRC.rglob("*")) if p.suffix.lower() in EXTS]
    if not files:
        print(f"No images in {SRC}. Put originals there, named like the files in public/assets/.")
        return
    for p in files:
        print(process(p, check))


if __name__ == "__main__":
    main()
