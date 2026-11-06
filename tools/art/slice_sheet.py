"""Slice a composite asset sheet into individual transparent sprites.

auto mode  (light / checkerboard background): finds each object as a connected blob.
    python tools/slice_sheet.py auto <sheet.png> <out_dir> [merge_px]
    -> writes out_dir/NN.png plus out_dir/_index.png (numbered contact sheet) and _boxes.txt

boxes mode (panel boards): crops named boxes listed in a text file "name l t r b [opaque]".
    python tools/slice_sheet.py boxes <sheet.png> <boxes.txt> <out_dir>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def background_mask(rgb: np.ndarray, dark: bool = False) -> np.ndarray:
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    if dark:  # flat dark panel: anything close to the corner colour
        ref = rgb[1, 1].astype(int)
        light = np.abs(rgb.astype(int) - ref).sum(axis=-1) < 80  # panels carry a soft purple glow
    else:
        mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
        light = (mx - mn < 18) & (mx > 200)  # white / light-grey checkerboard
    labels, _ = ndimage.label(light)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    return np.isin(labels, border[border > 0])


def cut(rgb: np.ndarray, dark: bool = False, holes: bool = False) -> Image.Image:
    """Return RGBA with border-connected background removed and stray specks dropped.

    holes=True also clears large enclosed background patches (inside a loop or a ring frame).
    """
    keep = ~background_mask(rgb, dark)
    if holes:
        r, g, b = (rgb[..., i].astype(int) for i in range(3))
        mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
        light = (mx - mn < 18) & (mx > 200) & keep
        lab, n = ndimage.label(light)
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        keep &= ~np.isin(lab, np.flatnonzero(sizes > 300) + 1)
    lab, n = ndimage.label(keep)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        keep = np.isin(lab, np.flatnonzero(sizes >= 0.01 * sizes.max()) + 1)
    alpha = ndimage.uniform_filter(np.where(keep, 255, 0).astype(float), 3).astype(np.uint8)
    im = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    return im.crop(im.getchannel("A").getbbox())


def auto(sheet: Path, out: Path, merge_px: int = 10) -> None:
    out.mkdir(parents=True, exist_ok=True)
    rgb = np.asarray(Image.open(sheet).convert("RGB"))
    fg = ~background_mask(rgb)
    grown = ndimage.binary_dilation(fg, iterations=merge_px)  # merge parts of one object
    lab, n = ndimage.label(grown)
    boxes = [s for s in ndimage.find_objects(lab) if s is not None]
    boxes = [s for s in boxes if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > 900]
    boxes.sort(key=lambda s: (s[0].start // 120, s[1].start))  # rows of ~120px, then left to right
    idx = Image.fromarray(rgb).convert("RGB")
    draw = ImageDraw.Draw(idx)
    lines = []
    for i, (ys, xs) in enumerate(boxes):
        t, l = max(ys.start - 2, 0), max(xs.start - 2, 0)
        b, r = ys.stop + 2, xs.stop + 2
        cut(rgb[t:b, l:r]).save(out / f"{i:02d}.png")
        draw.rectangle([l, t, r, b], outline=(255, 0, 255), width=2)
        draw.text((l + 3, t + 2), str(i), fill=(255, 0, 255))
        lines.append(f"{i:02d} {l} {t} {r} {b}")
    idx.save(out / "_index.png")
    (out / "_boxes.txt").write_text("\n".join(lines))
    print(f"{len(boxes)} objects -> {out}")


def boxes(sheet: Path, spec: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    rgb = np.asarray(Image.open(sheet).convert("RGB"))
    for line in spec.read_text().splitlines():
        parts = line.split()
        if not parts or parts[0].startswith("#"):
            continue
        name, (l, t, r, b), flags = parts[0], map(int, parts[1:5]), parts[5:]
        piece = rgb[t:b, l:r]
        im = Image.fromarray(piece).convert("RGBA") if "opaque" in flags else cut(piece, "dark" in flags, "holes" in flags)
        im.save(out / f"{name}.png")
    print(f"sliced {spec.name} -> {out}")


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "auto":
        auto(Path(sys.argv[2]), Path(sys.argv[3]), int(sys.argv[4]) if len(sys.argv) > 4 else 10)
    else:
        boxes(Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4]))
