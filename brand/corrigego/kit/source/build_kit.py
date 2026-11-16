"""Build the Corrige Go logo kit SVGs (concept E, "Scan + visto"). Usage: python build_kit.py <font.ttf> <out_dir>"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

VIOLET, INK, BG, WHITE = "#6E56CF", "#0C0D0E", "#F8FAFC", "#FFFFFF"
font_path, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)


def corner(t, arm, R):
    """Top-left scanner corner on the 256 grid, frame edge at 32: thickness t, arm end at `arm`,
    outer radius R, inner radius R-t, round caps."""
    e, h, r = 32, t / 2, R - t
    i = e + t  # inner edge
    return (f"M{arm - h:g} {e}A{h:g} {h:g} 0 0 1 {arm - h:g} {i}H{e + R:g}"
            f"A{r:g} {r:g} 0 0 0 {i} {e + R:g}V{arm - h:g}A{h:g} {h:g} 0 0 1 {e} {arm - h:g}"
            f"V{e + R:g}A{R:g} {R:g} 0 0 1 {e + R:g} {e}Z")


def check(A, B, C, h):
    """Outlined check stroke A->B->C, half-width h, round caps and round outer join, sharp inner corner."""
    import math
    def unit(p, q):
        dx, dy = q[0] - p[0], q[1] - p[1]; L = math.hypot(dx, dy); return dx / L, dy / L
    u1, u2 = unit(A, B), unit(B, C)
    l1, r1 = (u1[1], -u1[0]), (-u1[1], u1[0])   # inner (top) / outer normals
    l2, r2 = (u2[1], -u2[0]), (-u2[1], u2[0])
    off = lambda p, n: (p[0] + h * n[0], p[1] + h * n[1])
    a_in, a_out, b_o1, b_o2, c_out, c_in = off(A, l1), off(A, r1), off(B, r1), off(B, r2), off(C, r2), off(C, l2)
    # inner corner: intersect inner offset lines a_in + s*u1 and c_in + t*u2
    det = u1[0] * (-u2[1]) - u1[1] * (-u2[0])
    dx, dy = c_in[0] - a_in[0], c_in[1] - a_in[1]
    s = (dx * (-u2[1]) - dy * (-u2[0])) / det
    v = (a_in[0] + s * u1[0], a_in[1] + s * u1[1])
    f = lambda p: f"{p[0]:.2f} {p[1]:.2f}"
    return (f"M{f(a_out)}L{f(b_o1)}A{h} {h} 0 0 0 {f(b_o2)}L{f(c_out)}A{h} {h} 0 0 0 {f(c_in)}"
            f"L{f(v)}L{f(a_in)}A{h} {h} 0 0 0 {f(a_out)}Z")


def symbol(small=False):
    # Master: corners 24 thick (r32 outer), check 28 thick. Small cut (<=32 px): heavier corners and check.
    if small:
        t, arm, R, ck = 30, 100, 38, check((86, 132), (114, 160), (170, 104), 17)
    else:
        t, arm, R, ck = 24, 98, 32, check((90, 130), (116, 156), (166, 106), 14)
    p = corner(t, arm, R)
    flips = ["", ' transform="matrix(-1 0 0 1 256 0)"', ' transform="matrix(1 0 0 -1 0 256)"',
             ' transform="matrix(-1 0 0 -1 256 256)"']
    return "".join(f'<path{f} d="{p}"/>' for f in flips) + f'<path d="{ck}"/>'


def g(fill, tx=0, ty=0, s=1, small=False):
    t = f' transform="translate({tx:g} {ty:g}) scale({s:g})"' if (tx or ty or s != 1) else ''
    return f'<g fill="{fill}"{t}>{symbol(small)}</g>'


def svg(vb, body, title="Corrige Go"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>{title}</title>{body}</svg>\n'


def write(name, text):
    with open(os.path.join(out, name), "w", encoding="utf-8") as f:
        f.write(text)


# --- wordmark: Plus Jakarta Sans Bold (OFL), outlined
font = instantiateVariableFont(TTFont(font_path), {"wght": 700})
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
upm, cap = font["head"].unitsPerEm, font["OS/2"].sCapHeight
CAP_PX = 88                      # cap height in lockup units (symbol is 192 tall)
k = CAP_PX / cap
track = -0.02 * upm              # display-size tightening
x, parts = 0.0, []
for ch in "Corrige Go":
    gn = cmap[ord(ch)]
    if ch != " ":
        pen = SVGPathPen(gs)
        gs[gn].draw(TransformPen(pen, (k, 0, 0, -k, x * k, 0)))
        parts.append(pen.getCommands())
    x += hmtx[gn][0] + track
word_w = (x - track) * k
word_d = " ".join(parts)
desc = 0.24 * CAP_PX * 1.0      # room for the g descender

def word(fill, tx, ty):
    return f'<path fill="{fill}" transform="translate({tx:.1f} {ty:.1f})" d="{word_d}"/>'

# --- symbols
for name, c in [("violet", VIOLET), ("ink", INK), ("black", "#000000"), ("white", WHITE)]:
    write(f"corrigego-symbol-{name}.svg", svg("0 0 256 256", g(c)))
write("corrigego-symbol-small-violet.svg", svg("0 0 256 256", g(VIOLET, small=True)))
write("corrigego-symbol-small-white.svg", svg("0 0 256 256", g(WHITE, small=True)))

# --- app icon: full-bleed violet, OS applies the mask; mark ~60% of tile
s = 0.62
write("corrigego-app-icon.svg", svg("0 0 256 256",
      f'<rect width="256" height="256" fill="{VIOLET}"/>' + g(WHITE, 128 - 128 * s, 128 - 128 * s, s)))

# --- horizontal lockup: symbol bbox 32..224; gap ~2 x corner thickness
gap = 52
base = 128 + CAP_PX / 2          # caps centred on the symbol
W = 192 + gap + word_w
def horizontal(sym, txt, bg=None):
    pad = 48 if bg else 0
    b = f'<rect x="{-pad}" y="{32 - pad}" width="{W + 2 * pad:.1f}" height="{192 + 2 * pad}" rx="0" fill="{bg}"/>' if bg else ''
    return svg(f"{-pad} {32 - pad} {W + 2 * pad:.1f} {192 + 2 * pad}",
               b + g(sym, -32, 0) + word(txt, 192 + gap, base))

write("corrigego-lockup-horizontal.svg", horizontal(VIOLET, INK))
write("corrigego-lockup-horizontal-black.svg", horizontal("#000000", "#000000"))
write("corrigego-lockup-horizontal-white.svg", horizontal(WHITE, WHITE))
write("corrigego-lockup-horizontal-on-violet.svg", horizontal(WHITE, WHITE, VIOLET))
write("corrigego-lockup-horizontal-on-ink.svg", horizontal(VIOLET, WHITE, INK))

# --- stacked lockup: symbol centred over the wordmark, gap = 1 x corner-to-bubble spacing x2
SW = max(word_w, 192)
sg = 40
H = 192 + sg + CAP_PX + desc
def stacked(sym, txt):
    return svg(f"0 0 {SW:.1f} {H:.1f}",
               g(sym, (SW - 192) / 2 - 32, -32) + word(txt, (SW - word_w) / 2, 192 + sg + CAP_PX))
write("corrigego-lockup-stacked.svg", stacked(VIOLET, INK))
write("corrigego-lockup-stacked-white.svg", stacked(WHITE, WHITE))

# --- wordmark only
write("corrigego-wordmark.svg", svg(f"0 {-CAP_PX} {word_w:.1f} {CAP_PX + desc:.1f}", word(INK, 0, 0)))
print("ok", round(word_w, 1))
