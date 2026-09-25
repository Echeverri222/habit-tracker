"""Generate Habit Tower's pixel-art app icons (PWA + iOS + favicon).

Run: python3 scripts/icons.py   (needs Pillow)
"""
import random

from PIL import Image, ImageColor

SKY = ["#070b24", "#0b1133", "#101845", "#162055", "#1c2862"]
C = {
    "trim": "#2a2f3d", "wall": "#efe6cf", "shade": "#d6caa9", "slab": "#8b90a0",
    "glass": "#2b3350", "teal": "#1f4f5c", "sign": "#10262d", "cream": "#f2f7f7",
    "gold": "#ffd35a", "green": "#6fe39a", "cyan": "#5fd3f3", "red": "#ff7a7a",
    "purple": "#c79bff", "beacon": "#ff4040", "pole": "#6b7080", "moon": "#f4efd8",
    "crater": "#d8d0b0", "road": "#262935", "lane": "#d8c46a", "dirt": "#6a4526",
    "curb": "#b8bcc8", "door": "#6b7080", "star": "#ffffff", "glare": "#fff8e0",
}

# 32x32 scene built pixel by pixel; '.' = sky.
G = [["."] * 32 for _ in range(32)]


def put(x, y, ch):
    if 0 <= x < 32 and 0 <= y < 32:
        G[y][x] = ch


def rect(x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(x, y, ch)


for x, y in [(2, 1), (13, 1), (30, 3), (1, 12), (30, 14), (2, 21), (29, 22)]:
    put(x, y, "*")

# moon
rect(25, 2, 28, 5, "M")
for x, y in [(25, 2), (28, 2), (25, 5), (28, 5)]:
    put(x, y, ".")
put(26, 3, "c")

# antenna + beacon
rect(22, 2, 22, 9, "p")
put(21, 5, "p")
put(23, 5, "p")
rect(22, 0, 22, 1, "b")

# roof sign "HT"
rect(5, 3, 17, 8, "T")
rect(6, 4, 16, 7, "s")
for x, y in [(7, 4), (7, 5), (7, 6), (7, 7), (8, 5), (8, 6), (9, 4), (9, 5), (9, 6), (9, 7)]:
    put(x, y, "H")  # H (2px stem for weight)
for x in range(11, 16):
    put(x, 4, "H")  # T bar
rect(13, 5, 13, 7, "H")
put(7, 9, "p")
put(15, 9, "p")

# roof ledge + tower body
rect(4, 10, 27, 10, "r")
rect(5, 11, 26, 26, "k")
rect(6, 11, 25, 26, "w")

# three habit floors: wall, 2 rows of windows, slab
FLOORS = ["1234", "32g1", "4125"]
for i, pattern in enumerate(FLOORS):
    y = 11 + i * 4
    for j, ch in enumerate(pattern):
        x = 7 + j * 5
        rect(x, y + 1, x + 2, y + 2, ch)
        if ch != "g":
            put(x, y + 1, "h")  # glare
    rect(6, y + 3, 25, y + 3, "S")

# lobby door
rect(14, 24, 17, 26, "d")
rect(15, 24, 16, 26, "g")

# street
rect(0, 27, 31, 27, "c")
rect(0, 28, 31, 29, "R")
for x in range(1, 32, 6):
    rect(x, 29, x + 2, 29, "L")
rect(0, 30, 31, 31, "D")

ART = ["".join(r) for r in G]

KEY = {
    "*": "star", "b": "beacon", "p": "pole", "M": "moon", "c": "crater",
    "T": "teal", "s": "sign", "H": "cream", "r": "trim", "k": "trim",
    "w": "wall", "S": "slab", "d": "door", "g": "glass",
    "1": "gold", "2": "green", "3": "cyan", "4": "red", "5": "purple",
    "6": "gold", "7": "cyan", "R": "road", "h": "glare", "L": "lane", "D": "dirt",
}


def sky(y, n):
    return SKY[min(len(SKY) - 1, y * len(SKY) // n)]


def draw(pad=0):
    """Return the scene on a (32+2*pad)^2 grid; padding extends sky and ground."""
    n = 32 + 2 * pad
    img = Image.new("RGB", (n, n))
    px = img.load()
    for y in range(n):
        sy = y - pad
        for x in range(n):
            sx = x - pad
            if sy < 0:
                ch = "."
            elif sy > 31:
                ch = "D"
            elif sy >= 27:
                ch = ART[sy][min(max(sx, 0), 31)] if 0 <= sx < 32 else ART[sy][0]
            else:
                ch = ART[sy][sx] if 0 <= sx < 32 else "."
            if ch == "c" and sy >= 27:
                color = C["curb"]
            elif ch in KEY:
                color = C[KEY[ch]]
            else:
                color = sky(y, n)
            px[x, y] = ImageColor.getrgb(color)
    return img


def save(img, size, path):
    img.resize((size, size), Image.NEAREST).save(path, optimize=True)


base = draw()
save(base, 64, "app/icon.png")
save(base, 192, "public/icons/icon-192.png")
save(base, 512, "public/icons/icon-512.png")
# iOS and maskable icons get breathing room so masks/rounding never clip the tower.
save(draw(pad=2), 180, "app/apple-icon.png")
save(draw(pad=6), 512, "public/icons/maskable-512.png")
print("icons written")


# ---- iOS launch screens -------------------------------------------------------
# (css width, css height, device pixel ratio)
DEVICES = [
    (440, 956, 3), (402, 874, 3), (420, 912, 3), (430, 932, 3), (393, 852, 3),
    (428, 926, 3), (390, 844, 3), (375, 812, 3), (414, 896, 2), (375, 667, 2),
]


def splash(w, h):
    P = w // 44  # size of one art pixel in device pixels
    cols, rows = -(-w // P), -(-h // P)
    top = int(rows * 0.70) - 27  # street sits ~70% down, like the app
    rnd = random.Random(2026)
    stars = {(rnd.randrange(cols), rnd.randrange(top + 24)) for _ in range(cols * rows // 90)}
    left = (cols - 32) // 2
    img = Image.new("RGB", (cols, rows))
    px = img.load()
    for y in range(rows):
        ay = y - top
        for x in range(cols):
            ax = x - left
            if ay > 31:
                ch = "d" if rnd.random() < 0.05 else "D"
            elif ay >= 27:
                if 0 <= ax < 32:
                    ch = ART[ay][ax]
                elif ay == 29:
                    ch = "L" if (ax - 1) % 6 < 3 else "R"
                else:
                    ch = ART[ay][0]
            elif 0 <= ay and 0 <= ax < 32:
                ch = ART[ay][ax]
            else:
                ch = "*" if (x, y) in stars else "."
            if ch == "c" and ay >= 27:
                color = C["curb"]
            elif ch == "d" and ay > 31:
                color = "#4a2f19"
            elif ch in KEY:
                color = C[KEY[ch]]
            else:
                color = sky(max(0, min(y, top + 26)), top + 27)
            px[x, y] = ImageColor.getrgb(color)
    return img.resize((cols * P, rows * P), Image.NEAREST).crop((0, 0, w, h))


import os

os.makedirs("public/splash", exist_ok=True)
for cw, ch_, dpr in DEVICES:
    w, h = cw * dpr, ch_ * dpr
    splash(w, h).save(f"public/splash/{w}x{h}.png", optimize=True)
print("splash screens written")
