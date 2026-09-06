#!/usr/bin/env python3
"""
gen-blog-images - unique editorial hero graphics for the blog.

One visual system (site ground #0b0d10, brand yellow #facc15, quiet
supporting strokes), one truthful data-motif per article drawn from the
article's own numbers. No AI-photo gloss, no reuse. 1200x630 webp.

Placeholder-quality note: these are the DESIGNED stand-ins until Cal
supplies real photography (see docs/NEXT_SPRINT.md shot list).
"""
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
M = 72
INK = (11, 13, 16)
YELLOW = (250, 204, 21)
YELLOW_DIM = (250, 204, 21, 90)
WHITE = (255, 255, 255)
GREY = (148, 155, 165)
MUTE = (255, 255, 255, 26)
GREEN = (74, 222, 128)
SKY = (56, 189, 248)
RED = (248, 113, 113)

def font(size, bold=True):
    # Helvetica.ttc: index 0 regular, 1 bold (macOS)
    try:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size, index=1 if bold else 0)
    except Exception:
        return ImageFont.load_default()

def canvas():
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img, "RGBA")
    # soft radial lift top-left + vignette
    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-500, -420, 800, 500], fill=26)
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    img.paste(Image.new("RGB", (W, H), (26, 28, 33)), (0, 0), glow)
    d = ImageDraw.Draw(img, "RGBA")
    # faint dot grid
    for x in range(M, W - M + 1, 56):
        for y in range(M, H - M + 1, 56):
            d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(255, 255, 255, 10))
    return img, d

def chrome(d, eyebrow, headline, sub=None):
    d.text((M, M - 8), eyebrow.upper(), font=font(21), fill=YELLOW)
    d.rectangle([M, M + 26, M + 46, M + 29], fill=YELLOW)
    f = font(52)
    lines = headline.split("\n")
    y = H - M - 30 - 56 * len(lines) - (30 if sub else 0)
    for ln in lines:
        d.text((M, y), ln, font=f, fill=WHITE)
        y += 58
    if sub:
        d.text((M, y + 2), sub, font=font(23, bold=False), fill=GREY)

def bars(d, x, y, w, h, values, color=YELLOW, dim_after=None, gap=0.35):
    n = len(values)
    bw = w / n
    mx = max(values) or 1
    for i, v in enumerate(values):
        bh = (v / mx) * h
        c = color if (dim_after is None or i < dim_after) else (color[0], color[1], color[2], 80)
        d.rounded_rectangle([x + i * bw, y + h - bh, x + i * bw + bw * (1 - gap), y + h], 6, fill=c)

def line_chart(d, x, y, w, h, values, color=YELLOW, width=6, fill_alpha=36):
    mx, mn = max(values), min(values)
    rng = (mx - mn) or 1
    pts = [(x + i * w / (len(values) - 1), y + h - (v - mn) / rng * h) for i, v in enumerate(values)]
    d.polygon(pts + [(x + w, y + h), (x, y + h)], fill=(color[0], color[1], color[2], fill_alpha))
    d.line(pts, fill=color, width=width, joint="curve")
    lx, ly = pts[-1]
    d.ellipse([lx - 9, ly - 9, lx + 9, ly + 9], fill=color)

# TMY monthly generation (matches the site's own dataset, kWh per 4kWp)
TMY = [164, 238, 355, 454, 554, 597, 571, 511, 411, 312, 195, 138]

MX, MY, MW, MH = 560, 120, 560, 330   # standard motif box (right side)

def m_bill(d):
    for i in range(6):
        y = MY + i * 52
        wln = [420, 300, 360, 260, 400, 330][i]
        d.rounded_rectangle([MX, y, MX + wln, y + 22], 6, fill=MUTE)
    y = MY + 2 * 52
    d.rounded_rectangle([MX - 14, y - 10, MX + 470, y + 34], 10, outline=YELLOW, width=4)
    d.text((MX + 380, y - 2), "€0.34/kWh", font=font(26), fill=YELLOW)

def m_ber(d):
    grades = ["A", "B", "C", "D", "E", "F", "G"]
    cols = [GREEN, (134, 222, 96), (190, 220, 80), YELLOW, (250, 160, 60), (248, 120, 80), RED]
    for i, g in enumerate(grades):
        y = MY + i * 46
        wd = 300 - i * 30
        d.rounded_rectangle([MX, y, MX + wd, y + 34], 8, fill=cols[i] + ((255,) if len(cols[i]) == 3 else ()))
        d.text((MX + 12, y + 4), g, font=font(24), fill=INK)
    d.line([MX + 420, MY + 250, MX + 420, MY + 40], fill=WHITE, width=6)
    d.polygon([(MX + 400, MY + 60), (MX + 420, MY + 24), (MX + 440, MY + 60)], fill=WHITE)
    d.text((MX + 370, MY + 270), "after solar", font=font(22, bold=False), fill=GREY)

def m_nc6(d):
    d.rounded_rectangle([MX + 40, MY - 10, MX + 400, MY + 320], 18, outline=(255, 255, 255, 70), width=4)
    for i in range(5):
        y = MY + 30 + i * 52
        d.rounded_rectangle([MX + 80, y, MX + 200, y + 18], 5, fill=MUTE)
        bx = MX + 320
        d.rounded_rectangle([bx, y - 6, bx + 34, y + 28], 8, outline=YELLOW, width=3)
        if i < 4:
            d.line([bx + 7, y + 11, bx + 15, y + 20, bx + 29, y + 1], fill=YELLOW, width=4)

def m_ev(d):
    hours = [0.1, 0.1, 0.1, 0.1, 0.2, 0.5, 1.4, 2.4, 3.4, 4.2, 4.8, 5.0]
    line_chart(d, MX, MY + 30, MW - 60, MH - 80, hours, color=SKY)
    d.text((MX + MW - 200, MY + 8), "battery %", font=font(21, bold=False), fill=GREY)
    d.polygon([(MX + 70, MY + 140), (MX + 100, MY + 100), (MX + 86, MY + 100), (MX + 116, MY + 60)], outline=YELLOW, width=5)

def m_grant(d):
    d.text((MX + 20, MY + 10), "€1,800", font=font(150), fill=YELLOW)
    d.text((MX + 26, MY + 190), "SEAI grant · Republic of Ireland", font=font(24, bold=False), fill=GREY)
    bars(d, MX + 24, MY + 236, 440, 90, [10, 9, 7.5, 6], color=(255, 255, 255, 70), dim_after=None)
    d.text((MX + 24, MY + 322), "2023   2024   2025   2026", font=font(20, bold=False), fill=GREY)

def m_cost(d):
    segs = [(0.44, YELLOW, "panels"), (0.22, (255, 255, 255, 120), "inverter"), (0.2, (255, 255, 255, 70), "install"), (0.14, SKY, "scaffold")]
    x = MX
    for frac, col, _ in segs:
        wd = frac * (MW - 40)
        d.rounded_rectangle([x, MY + 110, x + wd - 8, MY + 190], 10, fill=col)
        x += wd
    d.text((MX, MY + 210), "what a system actually costs", font=font(22, bold=False), fill=GREY)
    d.text((MX, MY + 10), "€6k–€8k", font=font(76), fill=WHITE)

def m_winter(d):
    line_chart(d, MX, MY + 40, MW - 60, MH - 100, TMY)
    d.rectangle([MX + (MW - 60) * 10 / 11 - 40, MY + 30, MX + MW - 60 + 10, MY + MH - 60], outline=(255, 255, 255, 60), width=3)
    d.text((MX, MY), "kWh per month, 4 kWp", font=font(21, bold=False), fill=GREY)

def m_export(d):
    gen = [0, 1, 3, 6, 8, 9, 8, 6, 3, 1, 0]
    line_chart(d, MX, MY + 40, MW - 60, MH - 110, gen, color=YELLOW)
    d.line([MX, MY + 130, MX + MW - 60, MY + 130], fill=GREEN, width=5)
    d.text((MX + MW - 250, MY + 96), "€0.21/kWh export", font=font(24), fill=GREEN)

def m_battery(d):
    soc = [20, 18, 16, 15, 20, 45, 75, 95, 100, 96, 80, 55, 35, 24]
    line_chart(d, MX, MY + 40, MW - 60, MH - 100, soc, color=GREEN)
    d.text((MX, MY), "battery charge across the day", font=font(21, bold=False), fill=GREY)
    d.rounded_rectangle([MX + 430, MY + 240, MX + 520, MY + 300], 12, outline=GREEN, width=5)
    d.rectangle([MX + 520, MY + 258, MX + 532, MY + 282], fill=GREEN)

def m_planning(d):
    d.polygon([(MX + 60, MY + 180), (MX + 250, MY + 40), (MX + 440, MY + 180)], outline=(255, 255, 255, 120), width=5)
    d.rectangle([MX + 100, MY + 180, MX + 400, MY + 300], outline=(255, 255, 255, 120), width=5)
    for i in range(3):
        for j in range(2):
            d.rounded_rectangle([MX + 150 + i * 72, MY + 96 + j * 44, MX + 210 + i * 72, MY + 132 + j * 44], 4, fill=YELLOW_DIM, outline=YELLOW, width=2)
    d.text((MX + 130, MY + 320), "under 12 m² · no planning needed", font=font(22, bold=False), fill=GREY)

def m_panels_compare(d):
    vals = [22.3, 22.8, 23.1]
    names = ["LONGi", "Jinko", "Trina"]
    for i, (v, n) in enumerate(zip(vals, names)):
        x = MX + i * 170
        hgt = (v - 21) / 2.5 * 220
        d.rounded_rectangle([x, MY + 260 - hgt, x + 120, MY + 260], 10, fill=YELLOW if i == 2 else (255, 255, 255, 80))
        d.text((x + 14, MY + 270), n, font=font(24), fill=WHITE if i == 2 else GREY)
        d.text((x + 14, MY + 232 - hgt), f"{v}%", font=font(22), fill=INK if i == 2 else GREY)

def m_dublin(d):
    m_planning(d)  # placeholder never used; dublin gets a real photo

def m_news_grant(d):
    d.line([MX, MY + 160, MX + MW - 80, MY + 160], fill=YELLOW, width=8)
    for i, yr in enumerate(["2024", "2025", "2026"]):
        x = MX + 60 + i * 170
        d.ellipse([x - 10, MY + 150, x + 10, MY + 170], fill=YELLOW)
        d.text((x - 28, MY + 190), yr, font=font(24, bold=False), fill=GREY)
    d.text((MX, MY + 40), "€1,800 · unchanged", font=font(56), fill=WHITE)

def m_heatpump(d):
    heat = [8, 7.5, 6, 4, 2.5, 1.5, 1.2, 1.4, 2.5, 4.5, 6.5, 8]
    line_chart(d, MX, MY + 40, MW - 60, MH - 100, TMY, color=YELLOW, fill_alpha=26)
    line_chart(d, MX, MY + 40, MW - 60, MH - 100, heat, color=SKY, fill_alpha=20)
    d.text((MX, MY), "solar output", font=font(21), fill=YELLOW)
    d.text((MX + 180, MY), "· heat-pump demand", font=font(21), fill=SKY)

def m_smartmeter(d):
    cx, cy, r = MX + 250, MY + 230, 190
    for a in range(-180, 1, 12):
        x1 = cx + (r - 18) * math.cos(math.radians(a)); y1 = cy + (r - 18) * math.sin(math.radians(a))
        x2 = cx + r * math.cos(math.radians(a)); y2 = cy + r * math.sin(math.radians(a))
        col = YELLOW if a > -70 else (255, 255, 255, 60)
        d.line([x1, y1, x2, y2], fill=col, width=6)
    d.text((cx - 96, cy - 60), "24.7 kWh", font=font(44), fill=WHITE)
    d.text((cx - 96, cy - 8), "today · half-hourly reads", font=font(21, bold=False), fill=GREY)

def m_howmany(d):
    for i in range(10):
        r, c = divmod(i, 5)
        x = MX + 40 + c * 96
        y = MY + 60 + r * 130
        filled = i < 10
        d.rounded_rectangle([x, y, x + 80, y + 112], 8, fill=YELLOW_DIM if filled else MUTE, outline=YELLOW if filled else (255, 255, 255, 60), width=3)
    d.text((MX + 40, MY + 320), "10 panels, about 4.3 kWp, a typical 3-bed", font=font(22, bold=False), fill=GREY)

def m_besttime(d):
    line_chart(d, MX, MY + 40, MW - 60, MH - 100, TMY, color=(255, 255, 255, 90), fill_alpha=14)
    x = MX + (MW - 60) * 2 / 11
    d.line([x, MY + 20, x, MY + MH - 60], fill=YELLOW, width=6)
    d.text((x + 14, MY + 24), "install in spring,", font=font(24), fill=YELLOW)
    d.text((x + 14, MY + 54), "catch the whole summer", font=font(24), fill=YELLOW)

def m_landlord(d):
    for i in range(4):
        y = MY + 40 + i * 70
        d.rounded_rectangle([MX, y, MX + 300, y + 46], 10, fill=MUTE)
        d.text((MX + 16, y + 8), f"Tenant year {i+1}", font=font(22, bold=False), fill=GREY)
        d.text((MX + 340, y + 6), "+ €", font=font(28), fill=GREEN)
        bars(d, MX + 400, y + 6, 120, 36, [1, 1.1, 1.2, 1.3][: i + 1], color=GREEN)

MOTIFS = {
    "how-to-read-electricity-bill-ireland-solar": (m_bill, "Savings", "Read your bill\nlike an installer", "the two numbers that size your system"),
    "do-solar-panels-improve-ber-rating-ireland": (m_ber, "Grants", "Solar and your\nBER rating", "what actually moves the grade"),
    "nc6-form-solar-grid-connection-ireland": (m_nc6, "Guides", "The NC6 form,\ndemystified", "grid connection without the jargon"),
    "solar-panels-ev-charger-ireland": (m_ev, "Technology", "Charge the car\nfrom the roof", "sizing solar for an EV household"),
    "complete-guide-seai-solar-grant-2026": (m_grant, "Grants", "The SEAI grant,\nstart to finish", "who qualifies and how it gets paid"),
    "how-much-do-solar-panels-cost-ireland-2026": (m_cost, "Savings", "What solar\nreally costs", "2026 prices, before and after grant"),
    "solar-panels-in-winter-do-they-work": (m_winter, "Guides", "Yes, panels work\nin December", "a real year of Irish generation"),
    "clean-export-guarantee-explained": (m_export, "Grants", "Get paid for\nyour surplus", "the Clean Export Guarantee explained"),
    "battery-storage-is-it-worth-the-extra-cost": (m_battery, "Savings", "Is a battery\nworth it?", "the honest maths on storage"),
    "planning-permission-solar-panels-ireland": (m_planning, "Guides", "Planning permission:\nusually not needed", "the rules in plain English"),
    "longi-vs-jinko-vs-trina-best-solar-panels": (m_panels_compare, "Technology", "LONGi, Jinko\nor Trina?", "the panels we actually fit, compared"),
    "seai-grant-stay-e1800-2026-what-it-means": (m_news_grant, "News", "The grant holds\nat €1,800", "what 2026 means for your timing"),
    "solar-panels-and-heat-pumps-perfect-partnership": (m_heatpump, "Guides", "Solar and\nheat pumps", "why the pairing works in Ireland"),
    "smart-meter-required-solar-panels-ireland": (m_smartmeter, "Guides", "Do you need\na smart meter?", "export payments and your meter"),
    "how-many-solar-panels-do-i-need-ireland": (m_howmany, "Guides", "How many panels\ndo you need?", "sizing from your own usage"),
    "best-time-of-year-to-get-solar-panels-ireland": (m_besttime, "Savings", "The best time\nto go solar", "install timing and the summer curve"),
    "solar-panels-rental-property-landlord-guide": (m_landlord, "Grants", "Solar for\nlandlords", "grants, BER and rental value"),
}

def main():
    import os
    os.makedirs("public/blog", exist_ok=True)
    for slug, (motif, eyebrow, headline, sub) in MOTIFS.items():
        img, d = canvas()
        motif(d)
        chrome(d, f"Solar Ireland · {eyebrow}", headline, sub)
        img.save(f"public/blog/{slug}.webp", "WEBP", quality=82)
        print("made", slug)
    print(f"\n{len(MOTIFS)} graphics generated")

if __name__ == "__main__":
    main()
