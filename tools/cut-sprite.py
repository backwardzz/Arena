"""Remove a plain light background from a generated character image.

Usage: python3 tools/cut-sprite.py input.png output.png [--height 256] [--hole x,y ...]
Flood-fills near-white pixels connected to the image border, so white
areas enclosed by outlines (hair, highlights) are kept.
"""
import argparse
import numpy as np
from PIL import Image
from scipy import ndimage

p = argparse.ArgumentParser()
p.add_argument("src"); p.add_argument("dst")
p.add_argument("--height", type=int, default=256, help="output sprite height (0 = keep)")
p.add_argument("--hole", action="append", default=[], help="x,y of an enclosed background gap to clear (repeatable)")
p.add_argument("--tol", type=int, default=40, help="max distance from white")
a = p.parse_args()

img = np.asarray(Image.open(a.src).convert("RGBA")).astype(np.int16)
dist = (255 - img[..., :3]).max(axis=2)
light = dist <= a.tol
labels, _ = ndimage.label(light)
edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
seeds = [labels[int(y), int(x)] for x, y in (h.split(",") for h in a.hole)]
bg = np.isin(labels, [*edge[edge > 0], *[l for l in seeds if l > 0]])

# soft 1px edge: partially fade light pixels touching the background
alpha = np.where(bg, 0, 255).astype(np.float32)
near = ndimage.binary_dilation(bg) & ~bg & (dist < 90)
alpha[near] = np.clip(dist[near] / 90 * 255, 0, 255)
img[..., 3] = alpha.astype(np.int16)

out = Image.fromarray(img.astype(np.uint8), "RGBA")
out = out.crop(out.getbbox())
if a.height:
    w = round(out.width * a.height / out.height)
    out = out.resize((w, a.height), Image.LANCZOS)
out.save(a.dst)
print(f"saved {a.dst} {out.size}")
