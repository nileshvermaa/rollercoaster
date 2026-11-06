"""Rank every game image by how far below its target resolution it is.

Usage: python tools/art/asset_report.py [--markdown]
Targets are the sizes each asset needs to stay sharp on a 1920x1080 desktop or a retina phone
in landscape. The same table drives docs/ART_NEEDED.md.
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2] / "public" / "assets"

# (path prefix or exact path, target width, target height, why)
TARGETS = [
    ("bg/park-sky", 1920, 1080, "full-screen sky"),
    ("bg/", 1920, 1080, "full-screen backdrop"),
    ("event/banner", 1920, 800, "full-screen event backdrop"),
    ("hub/", 800, 1000, "hub card"),
    ("cards/", 640, 400, "level-select card"),
    ("carts/coaster-wheel", 256, 256, "wheel"),
    ("carts/", 1024, 512, "cart body"),
    ("wheels/", 256, 256, "wheel skin"),
    ("riders/", 512, 512, "seated rider"),
    ("avatars/", 512, 512, "portrait / frame"),
    ("trails/", 1024, 256, "boost trail"),
    ("fx/", 1024, 128, "8-frame effect strip"),
    ("ui/logo", 2048, 1024, "logo"),
    ("ui/ribbon", 1536, 384, "results ribbon"),
    ("ui/plinth", 1024, 512, "display platform"),
    ("ui/stars", 768, 256, "star states"),
    ("", 256, 256, "icon"),
]


def target_for(rel):
    for prefix, w, h, why in TARGETS:
        if rel.startswith(prefix):
            # Parallax layers tile horizontally; shipped at 2880x810 to keep each world ~2 MB.
            if rel.startswith("bg/") and rel.split("-")[-1].split(".")[0] in ("far", "mid", "near", "ground"):
                return 2880, 810, "parallax layer, tiles horizontally"
            if rel.startswith("bg/") and rel.endswith("-sky.webp"):
                return 1920, 1080, "full-screen sky"
            return w, h, why
    return 256, 256, "icon"


def rows():
    out = []
    for f in sorted(ROOT.rglob("*.webp")):
        rel = f.relative_to(ROOT).as_posix()
        w, h = Image.open(f).size
        tw, th, why = target_for(rel)
        out.append((max(tw / w, th / h), rel, w, h, tw, th, why))
    return sorted(out, reverse=True)


if __name__ == "__main__":
    md = "--markdown" in sys.argv
    for ratio, rel, w, h, tw, th, why in rows():
        if md:
            print(f"| `{rel}` | {w}×{h} | {tw}×{th} | {ratio:.1f}× | {why} |")
        else:
            print(f"{ratio:5.1f}x  {rel:34s} have {w}x{h:<5} need {tw}x{th}  ({why})")
