"""Cut generated assets out of their backgrounds.

Handles: flat #00FF00 green screen, baked-in grey/white checkerboard, white padding.
Usage: python tools/cutout.py <src_dir> <out_dir>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

# Per-file crop (l, t, r, b) inside the source, to drop padding, edge slivers and artifacts.
CROPS = {
    "BG001_L1_sky.png": (424, 462, 1495, 625),
    "BG001_L2_far.png": (421, 478, 1498, 612),
    "BG001_L3_mid.png": (421, 458, 1498, 632),
    "BG001_L4_near.png": (421, 488, 1498, 600),
    "BG001_L5_ground.png": (421, 514, 1498, 576),
    "TRK001_straight-rail.png": (248, 214, 784, 308),
    "TRK007_support.png": (378, 172, 519, 347),
    "VEH001_basic-cart_v01_body.png": (12, 151, 496, 360),
    "VEH001_wheel.png": (8, 21, 238, 234),
    "VEH007_driver.png": (130, 145, 393, 367),
}


# Files whose closed shapes trap checkerboard (chrome elsewhere would be wrongly removed by this rule).
TRAPPED_CHECKER = {"TRK007_support.png"}


def alpha_mask(rgb: np.ndarray, trapped_checker: bool) -> np.ndarray:
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    green = (g > 150) & (r < 140) & (b < 140) & (g - np.maximum(r, b) > 60)
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    checker = (mx - mn < 14) & (mx > 185)  # light, unsaturated = checkerboard / white
    bg = green | checker
    # Only remove background regions connected to the border, so white highlights inside the art survive.
    labels, _ = ndimage.label(bg)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    outside = np.isin(labels, border[border > 0])
    # Pure screen-green is never in the art, so drop it everywhere (e.g. inside the coaster loop).
    pure_green = (g > 200) & (r < 100) & (b < 100)
    # Checkerboard trapped in closed shapes: drop enclosed checker regions bigger than a highlight.
    lab_in, n_in = ndimage.label(checker & ~outside)
    sizes = ndimage.sum(np.ones_like(lab_in), lab_in, range(1, n_in + 1))
    big_holes = np.isin(lab_in, np.flatnonzero(sizes > 400) + 1) if trapped_checker else False
    keep = ~(outside | pure_green | big_holes)
    # Drop stray slivers from neighbouring images: keep only components near the size of the main one.
    lab_fg, n_fg = ndimage.label(keep)
    if n_fg > 1:
        fg_sizes = ndimage.sum(np.ones_like(lab_fg), lab_fg, range(1, n_fg + 1))
        keep = np.isin(lab_fg, np.flatnonzero(fg_sizes >= 0.02 * fg_sizes.max()) + 1)
    alpha = np.where(keep, 255, 0).astype(np.uint8)
    # Soften the edge by one pixel.
    return ndimage.uniform_filter(alpha.astype(float), 3).astype(np.uint8)


def despill(rgb: np.ndarray) -> np.ndarray:
    out = rgb.copy().astype(int)
    lim = np.maximum(out[..., 0], out[..., 2])
    out[..., 1] = np.minimum(out[..., 1], lim + 20)  # pull green fringe back toward neutral
    return out.clip(0, 255).astype(np.uint8)


def main(src: Path, dst: Path) -> None:
    dst.mkdir(parents=True, exist_ok=True)
    for name, box in CROPS.items():
        im = Image.open(src / name).convert("RGB").crop(box)
        rgb = np.asarray(im)
        if name == "BG001_L1_sky.png":
            a = np.full(rgb.shape[:2], 255, np.uint8)  # sky is opaque
        else:
            a = alpha_mask(rgb, name in TRAPPED_CHECKER)
            rgb = despill(rgb)
        out = Image.fromarray(np.dstack([rgb, a]), "RGBA")
        bbox = out.getchannel("A").getbbox()
        assert bbox, f"{name}: cutout removed everything"
        out.crop(bbox).save(dst / name.replace(".png", ".webp"), quality=90)
        print(name, "->", out.crop(bbox).size)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
