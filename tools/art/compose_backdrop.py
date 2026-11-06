"""Compose a 1920x1080 screen backdrop from a world's full-frame parallax layers.

    python tools/art/compose_backdrop.py <layers_dir> <world> <out.webp> [--x 0.25] [--mood day|dusk|silhouette]

--x picks where along the 3840-wide layers the frame sits (0..1); deeper layers shift less, like
parallax. --mood darkens for menus ('dusk') or turns the scenery into a dark silhouette against the
sky ('silhouette', for the loading screen).
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

W, H = 1920, 1080
FACTORS = {"far": 0.35, "mid": 0.7, "near": 1.0, "ground": 1.0}


def layer_slice(img, x):
    scale = H / img.height
    img = img.resize((round(img.width * scale), H), Image.LANCZOS)
    left = round((img.width - W) * x)
    return img.crop((left, 0, left + W, H))


def compose(src, world, x, mood):
    sky = Image.open(src / f"{world}-sky.png").convert("RGBA").resize((W, H), Image.LANCZOS)
    out = sky
    for name in ("far", "mid", "near", "ground"):
        p = src / f"{world}-{name}.png"
        if not p.exists():
            continue
        lay = layer_slice(Image.open(p).convert("RGBA"), x * FACTORS[name])
        if mood == "silhouette":
            r, g, b, a = lay.split()
            depth = {"far": (120, 70, 150), "mid": (80, 40, 110), "near": (50, 24, 75), "ground": (40, 18, 60)}[name]
            lay = Image.merge("RGBA", (*Image.new("RGB", lay.size, depth).split(), a))
        out = Image.alpha_composite(out, lay)
    # The layers stop at the ground strip's bottom edge; crop there and scale back up so the
    # frame is all scenery (no bare sky band under the ground).
    ground = src / f"{world}-ground.png"
    if ground.exists():
        # The ground's lower edge is bumpy: crop at its highest point across all columns.
        alpha = np.asarray(layer_slice(Image.open(ground).convert("RGBA"), 0).getchannel("A")) > 200
        rows = np.arange(H)[:, None]
        col_bottom = np.where(alpha, rows, -1).max(axis=0)
        bottom = int(np.percentile(col_bottom[col_bottom > 0], 2)) - 2
        if bottom < H - 4:
            cw = round(W * bottom / H)
            left = (W - cw) // 2
            out = out.crop((left, 0, left + cw, bottom)).resize((W, H), Image.LANCZOS)
    out = out.convert("RGB")
    if mood == "dusk":
        out = ImageEnhance.Brightness(out).enhance(0.88)
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=Path)
    ap.add_argument("world")
    ap.add_argument("out", type=Path)
    ap.add_argument("--x", type=float, default=0.0)
    ap.add_argument("--mood", default="day", choices=["day", "dusk", "silhouette"])
    a = ap.parse_args()
    a.out.parent.mkdir(parents=True, exist_ok=True)
    compose(a.src, a.world, a.x, a.mood).save(a.out, quality=86, method=6)
    print("wrote", a.out)
