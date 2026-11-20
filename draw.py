#!/usr/bin/env python3
"""Design prototype for the make.fun news-image-20261120 entry.

Draws a 1024x1024 newspaper-style one-pager summing up the world news of
Friday 20 November 2026. This script is the design reference; the entry's
main.ts re-implements the same layout with an embedded bitmap font so the
submitted program is self-contained and deterministic.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 1024
PAPER = (252, 250, 243)
INK = (20, 20, 20)
RED = (166, 25, 46)
GRAY = (107, 107, 107)
RULE = (201, 194, 180)
LIGHT = (238, 234, 224)

FONT_DIR = "/usr/share/fonts/truetype/dejavu"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


BOLD = "DejaVuSans-Bold.ttf"
REG = "DejaVuSans.ttf"

M = 36
CW = W - 2 * M  # 952


def wrap(draw, text, fnt, width):
    """Greedy word wrap; returns list of lines."""
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_text(draw, text, fnt, width, max_lines, start_size, min_size, name=BOLD):
    """Shrink font until text fits in max_lines; returns (font, lines)."""
    size = start_size
    while size >= min_size:
        f = font(name, size)
        lines = wrap(draw, text, f, width)
        if len(lines) <= max_lines:
            return f, lines
        size -= 1
    f = font(name, min_size)
    return f, wrap(draw, text, f, width)[:max_lines]


def draw_lines(draw, lines, fnt, x, y, color, leading=None):
    if leading is None:
        leading = int(fnt.size * 1.22)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=color)
        y += leading
    return y


def rule(draw, x, y, width, color=RULE, height=1):
    draw.rectangle([x, y, x + width, y + height], fill=color)


def main():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    y = 34
    # ---- Masthead ----
    mast = "THE WORLD IN ONE PAGE"
    mf, _ = fit_text(d, mast, None, CW, 1, 60, 40)
    mw = d.textlength(mast, font=mf)
    d.text(((W - mw) / 2, y), mast, font=mf, fill=INK)
    y += mf.size + 10
    rule(d, M, y, CW, color=INK, height=3)
    y += 8
    date = "FRIDAY, 20 NOVEMBER 2026"
    df = font(BOLD, 28)
    dw = d.textlength(date, font=df)
    d.text(((W - dw) / 2, y), date, font=df, fill=RED)
    y += 36
    sub = "Eight stories that defined the day"
    sf = font(REG, 17)
    sw = d.textlength(sub, font=sf)
    d.text(((W - sw) / 2, y), sub, font=sf, fill=GRAY)
    y += 26
    rule(d, M, y, CW, color=INK, height=1)
    y += 12

    stories = [
        ("MARKETS - NEW YORK",
         "Anthropic lists on Nasdaq and closes 17% higher",
         "The first frontier AI lab to go public raises $81.3 billion; shares open at $111.50 and close at $97.17.",
         True),
        ("MARKETS - NEW YORK",
         "Nvidia slides a sixth day as US stocks sink",
         "The S&P 500 falls 2.02% for a sixth straight loss; the Dow drops below 50,000.",
         False),
        ("JUSTICE - THE HAGUE",
         "World court: Myanmar committed genocide",
         "The ICJ rules Myanmar's forces committed genocide against the Rohingya - a first for a state.",
         False),
        ("MIDDLE EAST - RIYADH",
         "Houthi missile hits Riyadh's tallest tower",
         "The strike blows out windows across eight floors of the Saudi sovereign wealth fund tower.",
         False),
        ("EUROPE - KYIV",
         "Russian barrage hits Kyiv embassies and cathedral",
         "A daytime attack damages the Austrian and Dutch missions; Brussels summons Moscow's envoy.",
         False),
        ("UNITED STATES - WASHINGTON",
         "Trump fires White House cyber chief",
         "The dismissal follows a wave of tech outages rattling US government systems.",
         False),
        ("TECH POLICY - WASHINGTON",
         "US curbs remote access to advanced AI chips",
         "A new BIS rule takes effect: remote computing above 12M TPP needs a licence, with 90 days to comply.",
         False),
        ("AI - MOUNTAIN VIEW",
         "Gemini 4 Neon tops independent AI benchmarks",
         "Google's Neon leads a 35-model business test; Genie 4 opens to Ultra subscribers.",
         False),
    ]

    # ---- Lead story (full width) ----
    kick, head, summ, _ = stories[0]
    kf = font(BOLD, 17)
    d.text((M, y), kick, font=kf, fill=RED)
    y += 24
    hf, hlines = fit_text(d, head, None, CW, 2, 38, 28)
    y = draw_lines(d, hlines, hf, M, y, INK)
    y += 4
    sf2 = font(REG, 20)
    slines = wrap(d, summ, sf2, CW)
    y = draw_lines(d, slines, sf2, M, y, INK)
    y += 10
    rule(d, M, y, CW, color=INK, height=2)
    y += 12

    # ---- Grid: 2 cols x 4 rows; last cell is the markets box ----
    gap = 28
    col_w = (CW - gap) // 2
    rows = [(stories[1], stories[2]), (stories[3], stories[4]),
            (stories[5], stories[6]), (stories[7], None)]
    row_h = 134
    for r, (left, right) in enumerate(rows):
        top = y
        for c, st in enumerate((left, right)):
            x = M + c * (col_w + gap)
            if st is None:
                # markets box
                d.rectangle([x, top, x + col_w, top + row_h - 12], fill=LIGHT)
                bx, by = x + 14, top + 12
                bf = font(BOLD, 16)
                d.text((bx, by), "MARKETS AT THE CLOSE", font=bf, fill=RED)
                by += 26
                mlines = [
                    "S&P 500  -2.02%    Dow  -2.19%",
                    "Nasdaq  -2.25%    ANT  +17.07%",
                    "NVDA  -3.30%    Gold  -4.90%",
                ]
                mf2 = font(REG, 17)
                by = draw_lines(d, mlines, mf2, bx, by, INK, leading=24)
                continue
            kick, head, summ, _ = st
            kf = font(BOLD, 15)
            d.text((x, top), kick, font=kf, fill=RED)
            yy = top + 22
            hf, hlines = fit_text(d, head, None, col_w, 3, 24, 19)
            yy = draw_lines(d, hlines, hf, x, yy, INK)
            yy += 3
            sf2 = font(REG, 17)
            slines = wrap(d, summ, sf2, col_w)
            draw_lines(d, slines[:3], sf2, x, yy, INK, leading=20)
        if r < 3:
            rule(d, M, top + row_h, CW)
        y = top + row_h + (8 if r < 3 else 0)

    # ---- Footer ----
    y = H - 44
    rule(d, M, y, CW, color=INK, height=1)
    y += 8
    foot = "All events of Friday, 20 November 2026, as reported that day.  |  Sources: public wires and filings."
    ff = font(REG, 15)
    fw = d.textlength(foot, font=ff)
    d.text(((W - fw) / 2, y), foot, font=ff, fill=GRAY)

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "entry.png")
    img.save(out, "PNG", optimize=True)
    print("wrote", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    main()
