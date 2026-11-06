"""
Generates ultra-high resolution (2048x2048 and 4096x4096) zemix logos with antialiasing,
gradients, ambient glow, and transparent/dark variations.
"""

import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SIZE = 2048
FONT_PATH = "C:/Windows/Fonts/malgunbd.ttf"

def create_hq_logo(transparent=False):
    # Render at 2x and downscale for super crisp antialiasing
    scale = 2
    w = SIZE * scale
    h = SIZE * scale

    if transparent:
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    else:
        # Dark gradient background
        img = Image.new("RGBA", (w, h), (10, 15, 29, 255))
        draw_bg = ImageDraw.Draw(img)
        # Radial gradient from center
        center_x, center_y = w // 2, h // 2
        for r in range(w // 2, 0, -8):
            ratio = r / (w // 2)
            cr = int(10 * ratio + 15 * (1 - ratio))
            cg = int(15 * ratio + 23 * (1 - ratio))
            cb = int(29 * ratio + 42 * (1 - ratio))
            draw_bg.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(cr, cg, cb, 255))

    # Squircle Container if not fully transparent
    draw = ImageDraw.Draw(img)
    margin = 80 * scale
    radius = 380 * scale

    if not transparent:
        # Outer squircle border
        draw.rounded_rectangle(
            [margin, margin, w - margin, h - margin],
            radius=radius,
            fill=(15, 23, 42, 255),
            outline=(30, 41, 59, 255),
            width=20 * scale
        )

    # Ambient Core Glow
    glow_size = int(600 * scale)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    cx, cy = w // 2, h // 2
    g_draw.ellipse(
        [cx - glow_size, cy - glow_size, cx + glow_size, cy + glow_size],
        fill=(59, 130, 246, 70)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80 * scale))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # Hexagon Math
    outer_r = 540 * scale
    stroke_w = 110 * scale

    def get_hex_points(center, r):
        pts = []
        for i in range(6):
            angle_deg = 60 * i - 30
            angle_rad = math.radians(angle_deg)
            x = center[0] + r * math.cos(angle_rad)
            y = center[1] + r * math.sin(angle_rad)
            pts.append((x, y))
        return pts

    outer_hex = get_hex_points((cx, cy), outer_r)

    # Draw Outer Hexagon with gradient simulation
    # Segments with smooth color transition
    colors = [
        (56, 189, 248),  # Cyan
        (37, 99, 235),   # Blue
        (99, 102, 241),  # Indigo
        (124, 58, 237),  # Violet
        (99, 102, 241),  # Indigo
        (37, 99, 235)    # Blue
    ]

    for i in range(6):
        p1 = outer_hex[i]
        p2 = outer_hex[(i + 1) % 6]
        c1 = colors[i]
        c2 = colors[(i + 1) % 6]
        # Draw multi-step lines for gradient
        steps = 40
        for s in range(steps):
            t1 = s / steps
            t2 = (s + 1) / steps
            lx1 = p1[0] * (1 - t1) + p2[0] * t1
            ly1 = p1[1] * (1 - t1) + p2[1] * t1
            lx2 = p1[0] * (1 - t2) + p2[0] * t2
            ly2 = p1[1] * (1 - t2) + p2[1] * t2
            cr = int(c1[0] * (1 - t1) + c2[0] * t1)
            cg = int(c1[1] * (1 - t1) + c2[1] * t1)
            cb = int(c1[2] * (1 - t1) + c2[2] * t1)
            draw.line([(lx1, ly1), (lx2, ly2)], fill=(cr, cg, cb, 255), width=stroke_w)

    # Rounded vertex caps
    for pt in outer_hex:
        draw.ellipse([pt[0] - stroke_w//2, pt[1] - stroke_w//2, pt[0] + stroke_w//2, pt[1] + stroke_w//2], fill=(56, 189, 248, 255))

    # Inner Core Hexagon (Maker Spark)
    inner_r = 220 * scale
    inner_hex = get_hex_points((cx, cy), inner_r)
    # Fill with cyan to blue core
    draw.polygon(inner_hex, fill=(37, 99, 235, 255), outline=(255, 255, 255, 255))
    
    # Inner bright star
    star_r = 130 * scale
    star_hex = get_hex_points((cx, cy), star_r)
    draw.polygon(star_hex, fill=(103, 232, 249, 255))

    # Center white shine dot
    draw.ellipse([cx - 25*scale, cy - 25*scale, cx + 25*scale, cy + 25*scale], fill=(255, 255, 255, 255))

    # Downscale 2x with Lanczos for super smooth anti-aliased output
    final_img = img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    return final_img

def create_horizontal_banner():
    w = 2400
    h = 800
    img = Image.new("RGBA", (w, h), (10, 15, 29, 255))
    draw = ImageDraw.Draw(img)

    # Ambient glow
    g = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    gd.ellipse([100, 100, 700, 700], fill=(56, 189, 248, 45))
    gd.ellipse([1200, 100, 2200, 700], fill=(124, 58, 237, 30))
    g = g.filter(ImageFilter.GaussianBlur(radius=100))
    img = Image.alpha_composite(img, g)
    draw = ImageDraw.Draw(img)

    # Logo on left
    logo = create_hq_logo(transparent=True).resize((520, 520), Image.Resampling.LANCZOS)
    img.paste(logo, (140, 140), logo)

    # Typography on right
    try:
        font_brand = ImageFont.truetype(FONT_PATH, 190)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 62)
    except:
        font_brand = font_sub = ImageFont.load_default()

    draw.text((720, 310), "zemix", font=font_brand, fill=(255, 255, 255), anchor="lm")
    draw.text((730, 480), "사이드 프로젝트 & 빌더 쇼케이스", font=font_sub, fill=(148, 163, 184), anchor="lm")

    return img

def main():
    os.makedirs("public/branding", exist_ok=True)

    # 1. Square App Icon / Logo (2048x2048 Dark Squircle)
    dark_logo = create_hq_logo(transparent=False)
    dark_logo.save("public/branding/zemix-logo-2048.png")
    dark_logo.save("public/logo.png") # Update main logo
    print("Saved public/branding/zemix-logo-2048.png")

    # 2. Transparent Icon (2048x2048 PNG)
    trans_logo = create_hq_logo(transparent=True)
    trans_logo.save("public/branding/zemix-logo-transparent.png")
    print("Saved public/branding/zemix-logo-transparent.png")

    # 3. Horizontal Banner Logo (2400x800)
    banner = create_horizontal_banner()
    banner.save("public/branding/zemix-banner-2400.png")
    print("Saved public/branding/zemix-banner-2400.png")

    print("All High-Res Logos generated successfully!")

if __name__ == "__main__":
    main()
