"""Install full-resolution art into the game.

Drop originals into art/hd/ using the SAME relative path as the file they replace, any image
extension, e.g.  art/hd/bg/park-sky.png  ->  public/assets/bg/park-sky.webp

    pip install pillow numpy scipy
    python tools/art/ingest.py            # install everything in art/hd/
    python tools/art/ingest.py --check    # report only, write nothing

For each file it:
  - refuses names the game does not use (typos would otherwise be silently ignored),
  - removes a flat #00FF00 or painted-checkerboard background on sprites and parallax layers,
  - trims empty margins on sprites,
  - scales down to the target size (never up) and warns if the source is too small,
  - writes WebP next to the old file, replacing it.
No code changes are needed: the game loads the same paths.
"""
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
OPAQUE_PREFIXES = ("bg/menu", "bg/splash", "bg/loading", "bg/garage", "hub/", "cards/", "event/banner")


def is_opaque(rel):
    return rel.startswith(OPAQUE_PREFIXES) or rel.endswith("-sky.webp")


def has_real_alpha(im):
    if im.mode != "RGBA":
        return False
    a = np.asarray(im.getchannel("A"))
    return (a < 250).mean() > 0.02


def process(path, check):
    rel = path.relative_to(SRC).with_suffix(".webp").as_posix()
    dest = DST / rel
    if not dest.exists():
        return f"SKIP  {rel}: not a file the game uses (check the name)"
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
        if box:
            im = im.crop(box)

    w, h = im.size
    scale = min(tw / w, th / h, 1.0)
    if max(tw / w, th / h) > 1 / 0.7:
        notes.append(f"still small: {w}x{h}, target {tw}x{th}")
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    if not check:
        im.save(dest, quality=88, method=6)
    old = "" if check else " (installed)"
    return f"OK    {rel}: {w}x{h} -> {im.size[0]}x{im.size[1]}{old}" + (f"  ! {'; '.join(notes)}" if notes else "")


def main():
    check = "--check" in sys.argv
    files = [p for p in sorted(SRC.rglob("*")) if p.suffix.lower() in EXTS]
    if not files:
        print(f"No images in {SRC}. Put originals there, named like the files in public/assets/.")
        return
    for p in files:
        print(process(p, check))


if __name__ == "__main__":
    main()
