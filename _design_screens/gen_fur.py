# Generates tex/fur.png: a tileable, realistic fur strand overlay (white highlights + soft dark
# undercoat strands on transparent). skins.js tints it by sitting it over the block colour.
import math, random, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S, SS = 192, 3            # tile size, supersample
N = S * SS
random.seed(7)
ROOT = os.path.dirname(os.path.abspath(__file__))

def strands(count, lmin, lmax, w, amin, amax):
    m = Image.new('L', (N, N), 0)
    d = ImageDraw.Draw(m)
    for _ in range(count):
        x, y = random.uniform(0, N), random.uniform(0, N)
        a = math.radians(random.gauss(90, 55))          # mostly downward, lots of tousle
        ln = random.uniform(lmin, lmax) * SS
        curl = random.uniform(-.9, .9)
        al = int(random.uniform(amin, amax))
        pts, px, py = [], x, y
        for i in range(9):
            pts.append((px, py))
            px += math.cos(a) * ln / 8; py += math.sin(a) * ln / 8
            a += curl / 8
        for ox in (-N, 0, N):
            for oy in (-N, 0, N):
                d.line([(p[0] + ox, p[1] + oy) for p in pts], fill=al, width=max(1, int(w * SS)))
    return m.resize((S, S), Image.LANCZOS)

dark = strands(16000, 4, 9, 1.1, 50, 140).filter(ImageFilter.GaussianBlur(.7))
mid = strands(16000, 4, 10, 1.1, 80, 190).filter(ImageFilter.GaussianBlur(.35))
light = strands(11000, 3, 8, .9, 120, 255).filter(ImageFilter.GaussianBlur(.25))
sheen = strands(1800, 5, 11, 1.0, 200, 255)

out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
def layer(mask, rgb, scale=1.0):
    global out
    l = Image.new('RGBA', (S, S), rgb + (0,))
    l.putalpha(mask.point(lambda v: int(v * scale)))
    out = Image.alpha_composite(out, l)
layer(dark, (120, 40, 80), .3)      # undercoat shadow (plum, reads as depth in any colour)
layer(mid, (255, 255, 255), .30)
layer(light, (255, 255, 255), .5)
layer(sheen, (255, 255, 255), .8)
os.makedirs(os.path.join(ROOT, 'tex'), exist_ok=True)
out.save(os.path.join(ROOT, 'tex', 'fur.png'), optimize=True)
print(os.path.getsize(os.path.join(ROOT, 'tex', 'fur.png')))
