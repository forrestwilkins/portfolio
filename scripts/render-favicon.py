"""Rasterises view/public/favicon.svg into a multi-size favicon.ico.

    python3 scripts/render-favicon.py     # writes favicon.ico beside the svg

The geometry below is a hand port of the shapes in favicon.svg, so the two
have to be kept in step: change the SVG and this needs the same edit. It
exists because macOS ships no SVG rasteriser that preserves alpha - qlmanage
flattens it onto white - and this avoids adding an image toolchain just to
regenerate one icon.
"""

import math, struct, zlib

# Geometry mirrors favicon.svg exactly, in its 512 unit viewBox
SPHERE = (256.0, 256.0, 236.0)
SHADOW = (500.0, 408.0, 300.0)
LIGHT = (162, 193, 192)          # #a2c1c0, muted sea green
DARK = (59, 89, 110)             # #3b596e, muted slate blue
HALF_GAP = 18.0                  # stroke-width 36

# Meridian: ellipse centred on the sphere, right half only, poles as caps
MERIDIAN = dict(cx=256.0, cy=256.0, rx=110.0, ry=236.0,
                caps=((256.0, 20.0), (256.0, 492.0)))
# Latitude: endpoints sit at the ellipse's horizontal extremes, lower half only
LATITUDE = dict(cx=256.0, cy=330.0, rx=220.5, ry=68.0,
                caps=((35.5, 330.0), (476.5, 330.0)))

def ellipse_dist(p, x, y):
    u = (x - p['cx']) / p['rx']
    v = (y - p['cy']) / p['ry']
    f = u * u + v * v - 1.0
    gx = 2.0 * u / p['rx']
    gy = 2.0 * v / p['ry']
    g = math.hypot(gx, gy)
    return f / g if g > 1e-9 else 1e9

def cap_dist(p, x, y):
    return min(math.hypot(x - cx, y - cy) for cx, cy in p['caps'])

def coverage(d):
    """1 inside, 0 outside, with a one pixel antialiased edge."""
    return min(1.0, max(0.0, 0.5 - d))

def render(size):
    s = size / 512.0
    px = bytearray()
    scx, scy, sr = SPHERE
    hcx, hcy, hr = SHADOW
    for iy in range(size):
        px.append(0)  # PNG filter byte
        y = (iy + 0.5) / s
        for ix in range(size):
            x = (ix + 0.5) / s

            inside = coverage((math.hypot(x - scx, y - scy) - sr) * s)
            if inside <= 0.0:
                px.extend((0, 0, 0, 0))
                continue

            # Gaps: on the arc's own half use the ellipse, elsewhere the round
            # cap at the nearest endpoint
            dm = abs(ellipse_dist(MERIDIAN, x, y)) if x >= 256.0 else cap_dist(MERIDIAN, x, y)
            dl = abs(ellipse_dist(LATITUDE, x, y)) if y >= 330.0 else cap_dist(LATITUDE, x, y)
            gap = max(coverage((dm - HALF_GAP) * s), coverage((dl - HALF_GAP) * s))

            alpha = inside * (1.0 - gap)
            if alpha <= 0.0:
                px.extend((0, 0, 0, 0))
                continue

            shade = coverage((math.hypot(x - hcx, y - hcy) - hr) * s)
            px.extend(tuple(round(lo + (hi - lo) * shade) for lo, hi in zip(LIGHT, DARK))
                      + (round(alpha * 255),))
    return bytes(px)

def png(size, raw):
    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9))
            + chunk(b'IEND', b''))

OUT = __file__.rsplit('/', 2)[0] + '/view/public/favicon.ico'
SIZES = [16, 32, 48, 64, 128, 256]
images = {}
for n in SIZES:
    images[n] = png(n, render(n))
    print(f'  {n:>3}px -> {len(images[n]):>6} bytes')



# A real ICO container: header, one directory entry per size, then the PNGs
entries, blobs, offset = [], [], 6 + 16 * len(SIZES)
for n in SIZES:
    data = images[n]
    entries.append(struct.pack('<BBBBHHII', n if n < 256 else 0, n if n < 256 else 0,
                               0, 0, 1, 32, len(data), offset))
    blobs.append(data)
    offset += len(data)
ico = struct.pack('<HHH', 0, 1, len(SIZES)) + b''.join(entries) + b''.join(blobs)
open(OUT, 'wb').write(ico)
print(f'wrote {OUT}: {len(ico)} bytes, {len(SIZES)} sizes')
