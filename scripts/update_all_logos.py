"""
Update all logo assets in the repository with the official user-provided high-res logo.
Removes any watermark, generates clean transparent/dark/banner variants, multi-size favicons,
and updates SVG vector files.
"""

import math
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC_PATH = r"C:\Users\1123j\.gemini\antigravity\brain\081a1b7b-79ba-4d2c-b335-518a213ee77d\.user_uploaded\media_1792893449618_e3058bee.png"
FONT_PATH = "C:/Windows/Fonts/malgunbd.ttf"

def generate_svg_path(cx, cy, r, corner_radius):
    angles = [-90, -30, 30, 90, 150, 210]
    sharp_verts = []
    for a in angles:
        rad = math.radians(a)
        sharp_verts.append((cx + r * math.cos(rad), cy + r * math.sin(rad)))
    
    d = corner_radius / math.tan(math.radians(60))
    
    path_cmds = []
    for i in range(6):
        prev_v = sharp_verts[(i - 1) % 6]
        curr_v = sharp_verts[i]
        next_v = sharp_verts[(i + 1) % 6]
        
        v_prev = (prev_v[0] - curr_v[0], prev_v[1] - curr_v[1])
        len_prev = math.hypot(*v_prev)
        u_prev = (v_prev[0] / len_prev, v_prev[1] / len_prev)
        
        v_next = (next_v[0] - curr_v[0], next_v[1] - curr_v[1])
        len_next = math.hypot(*v_next)
        u_next = (v_next[0] / len_next, v_next[1] / len_next)
        
        p_start = (curr_v[0] + u_prev[0] * d, curr_v[1] + u_prev[1] * d)
        p_end = (curr_v[0] + u_next[0] * d, curr_v[1] + u_next[1] * d)
        
        if i == 0:
            path_cmds.append(f"M {p_start[0]:.2f} {p_start[1]:.2f}")
        else:
            path_cmds.append(f"L {p_start[0]:.2f} {p_start[1]:.2f}")
            
        path_cmds.append(f"A {corner_radius:.2f} {corner_radius:.2f} 0 0 1 {p_end[0]:.2f} {p_end[1]:.2f}")
        
    path_cmds.append("Z")
    return " ".join(path_cmds)

def process_logos():
    print("Loading source logo...")
    src_img = Image.open(SRC_PATH).convert("RGBA")
    arr = np.array(src_img)

    # 1. Clean original (remove watermark in bottom right 880..1024, 880..1024)
    # The background is uniform around [238, 238, 237]
    bg_color = np.median(arr[50:100, 50:100], axis=(0,1)).astype(np.uint8)
    clean_arr = arr.copy()
    # Inpaint or replace corner area with pure background color
    clean_arr[870:1024, 870:1024, :3] = bg_color[:3]
    clean_original = Image.fromarray(clean_arr)
    
    os.makedirs("public/branding", exist_ok=True)
    clean_original.save("public/branding/zemix-logo-original.png")
    print("Saved public/branding/zemix-logo-original.png (Cleaned 1024x1024)")

    # 2. Extract smooth alpha mask for transparent logos
    rgb = clean_arr[:, :, :3].astype(np.float32)
    luminance = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    bg_lum = np.median(luminance[50:100, 50:100])

    # Anti-aliased alpha
    alpha = np.clip((bg_lum - luminance) / (bg_lum - 35), 0, 1) * 255
    alpha = alpha.astype(np.uint8)

    # Mask out outer borders
    mask = np.zeros_like(alpha)
    mask[160:860, 190:830] = 1
    alpha = alpha * mask

    # 3. Transparent Black PNG (for light themes, documents)
    black_png = np.zeros((1024, 1024, 4), dtype=np.uint8)
    black_png[:, :, 3] = alpha
    img_black = Image.fromarray(black_png)
    img_black.save("public/branding/zemix-logo-transparent.png")
    print("Saved public/branding/zemix-logo-transparent.png")

    # 4. Transparent White PNG (for dark themes)
    white_png = np.full((1024, 1024, 4), 255, dtype=np.uint8)
    white_png[:, :, 3] = alpha
    img_white = Image.fromarray(white_png)
    img_white.save("public/branding/zemix-logo-transparent-white.png")
    print("Saved public/branding/zemix-logo-transparent-white.png")

    # 5. 2048x2048 Dark Theme Badge (public/branding/zemix-logo-2048.png & public/logo.png)
    size_2k = 2048
    badge_2k = Image.new("RGBA", (size_2k, size_2k), (10, 15, 29, 255))
    draw_badge = ImageDraw.Draw(badge_2k)

    # Subtle ambient radial glow behind logo
    cx, cy = size_2k // 2, size_2k // 2
    glow = Image.new("RGBA", (size_2k, size_2k), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([cx - 500, cy - 500, cx + 500, cy + 500], fill=(56, 189, 248, 30))
    glow_draw.ellipse([cx - 300, cy - 300, cx + 300, cy + 300], fill=(99, 102, 241, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
    badge_2k = Image.alpha_composite(badge_2k, glow)

    # Squircle frame
    draw_badge = ImageDraw.Draw(badge_2k)
    draw_badge.rounded_rectangle(
        [100, 100, size_2k - 100, size_2k - 100],
        radius=360,
        outline=(30, 41, 59, 255),
        width=16
    )

    # Paste white logo emblem in center
    logo_white_scaled = img_white.resize((1400, 1400), Image.Resampling.LANCZOS)
    badge_2k.paste(logo_white_scaled, (cx - 700, cy - 700), logo_white_scaled)
    badge_2k.save("public/branding/zemix-logo-2048.png")
    badge_2k.save("public/logo.png")
    print("Saved public/branding/zemix-logo-2048.png and public/logo.png")

    # 6. High-res Banner (2400x800)
    banner_w, banner_h = 2400, 800
    banner = Image.new("RGBA", (banner_w, banner_h), (10, 15, 29, 255))
    
    # Ambient glows
    bg_glow = Image.new("RGBA", (banner_w, banner_h), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_glow)
    bg_draw.ellipse([100, 100, 700, 700], fill=(56, 189, 248, 35))
    bg_draw.ellipse([1200, 100, 2200, 700], fill=(124, 58, 237, 25))
    bg_glow = bg_glow.filter(ImageFilter.GaussianBlur(radius=100))
    banner = Image.alpha_composite(banner, bg_glow)

    # Paste logo on left
    banner_logo = img_white.resize((500, 500), Image.Resampling.LANCZOS)
    banner.paste(banner_logo, (150, 150), banner_logo)

    banner_draw = ImageDraw.Draw(banner)
    try:
        font_brand = ImageFont.truetype(FONT_PATH, 190)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 62)
    except:
        font_brand = font_sub = ImageFont.load_default()

    banner_draw.text((720, 310), "zemix", font=font_brand, fill=(255, 255, 255), anchor="lm")
    banner_draw.text((730, 480), "사이드 프로젝트 & 빌더 쇼케이스", font=font_sub, fill=(148, 163, 184), anchor="lm")
    banner.save("public/branding/zemix-banner-2400.png")
    print("Saved public/branding/zemix-banner-2400.png")

    # 7. Standard App & PWA Icons (icon.png, icon-192, icon-48, icon-32, icon-16, apple-touch-icon)
    icon_base = Image.new("RGBA", (512, 512), (10, 15, 29, 255))
    icon_draw = ImageDraw.Draw(icon_base)
    icon_draw.rounded_rectangle([20, 20, 492, 492], radius=110, outline=(51, 65, 85, 255), width=6)
    scaled_symbol = img_white.resize((360, 360), Image.Resampling.LANCZOS)
    icon_base.paste(scaled_symbol, (76, 76), scaled_symbol)
    
    icon_base.save("public/icon.png")
    icon_base.resize((192, 192), Image.Resampling.LANCZOS).save("public/icon-192.png")
    icon_base.resize((180, 180), Image.Resampling.LANCZOS).save("public/apple-touch-icon.png")
    icon_base.resize((48, 48), Image.Resampling.LANCZOS).save("public/icon-48.png")
    icon_base.resize((32, 32), Image.Resampling.LANCZOS).save("public/icon-32.png")
    icon_base.resize((16, 16), Image.Resampling.LANCZOS).save("public/icon-16.png")
    print("Saved standard PWA and web icons")

    # 8. Favicon.ico (multi-resolution 16, 32, 48)
    favicon_imgs = [
        icon_base.resize((16, 16), Image.Resampling.LANCZOS),
        icon_base.resize((32, 32), Image.Resampling.LANCZOS),
        icon_base.resize((48, 48), Image.Resampling.LANCZOS),
    ]
    favicon_imgs[0].save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    favicon_imgs[0].save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("Saved public/favicon.ico and app/favicon.ico")

    # 9. Master Vector SVGs (public/logo.svg, public/icon.svg, app/icon.svg)
    # Using the exact mathematical rounded hexagon path
    path_512 = generate_svg_path(256, 256, 172, 28)
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background Squircle -->
  <rect x="16" y="16" width="480" height="480" rx="104" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="8" />
  
  <!-- Subtle Ambient Glow -->
  <circle cx="256" cy="256" r="160" fill="url(#centerGlow)" />

  <!-- Official Rounded Hexagon Emblem -->
  <path d="{path_512}" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="24" 
        stroke-linecap="round" 
        stroke-linejoin="round" />
</svg>
'''
    with open("public/logo.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open("public/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open("app/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Saved public/logo.svg, public/icon.svg, and app/icon.svg")

    print("ALL LOGO ASSETS PROCESSED SUCCESSFULLY!")

if __name__ == "__main__":
    process_logos()
