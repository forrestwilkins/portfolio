import math, struct, zlib

VIEWBOX = 512.0
SPHERE = (256.0, 256.0, 236.0)
SHADOW = (500.0, 408.0, 300.0)
LIGHT = (0xa2, 0xc1, 0xc0)
DARK = (0x3b, 0x59, 0x6e)
GAP_STROKE_WIDTH = 36.0

MERIDIAN = dict(cx=256.0, cy=256.0, rx=110.0, ry=236.0,
                caps=((256.0, 20.0), (256.0, 492.0)))
LATITUDE = dict(cx=256.0, cy=330.0, rx=220.5, ry=68.0,
                caps=((35.5, 330.0), (476.5, 330.0)))

PNG_FILTER_NONE = 0
ICO_HEADER_SIZE = 6
ICO_ENTRY_SIZE = 16

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

def antialiased_coverage(d):
    return min(1.0, max(0.0, 0.5 - d))

def gap_distance(arc, x, y, on_arc_side):
    return abs(ellipse_dist(arc, x, y)) if on_arc_side else cap_dist(arc, x, y)

def render(size):
    s = size / VIEWBOX
    half_gap = GAP_STROKE_WIDTH / 2
    px = bytearray()
    scx, scy, sr = SPHERE
    hcx, hcy, hr = SHADOW
    for iy in range(size):
        px.append(PNG_FILTER_NONE)
        y = (iy + 0.5) / s
        for ix in range(size):
            x = (ix + 0.5) / s

            inside = antialiased_coverage((math.hypot(x - scx, y - scy) - sr) * s)
            if inside <= 0.0:
                px.extend((0, 0, 0, 0))
                continue

            meridian = gap_distance(MERIDIAN, x, y, x >= MERIDIAN['cx'])
            latitude = gap_distance(LATITUDE, x, y, y >= LATITUDE['cy'])
            gap = max(antialiased_coverage((meridian - half_gap) * s),
                      antialiased_coverage((latitude - half_gap) * s))

            alpha = inside * (1.0 - gap)
            if alpha <= 0.0:
                px.extend((0, 0, 0, 0))
                continue

            shade = antialiased_coverage((math.hypot(x - hcx, y - hcy) - hr) * s)
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

def ico_container(images):
    header = struct.pack('<HHH', 0, 1, len(images))
    entries, blobs, offset = [], [], ICO_HEADER_SIZE + ICO_ENTRY_SIZE * len(images)
    for n, data in images.items():
        dimension = n if n < 256 else 0
        entries.append(struct.pack('<BBBBHHII', dimension, dimension,
                                   0, 0, 1, 32, len(data), offset))
        blobs.append(data)
        offset += len(data)
    return header + b''.join(entries) + b''.join(blobs)

OUT = __file__.rsplit('/', 2)[0] + '/view/public/favicon.ico'
SIZES = [16, 32, 48, 64, 128, 256]
images = {}
for n in SIZES:
    images[n] = png(n, render(n))
    print(f'  {n:>3}px -> {len(images[n]):>6} bytes')

ico = ico_container(images)
open(OUT, 'wb').write(ico)
print(f'wrote {OUT}: {len(ico)} bytes, {len(SIZES)} sizes')
