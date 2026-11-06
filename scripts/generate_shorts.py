"""
Zemix Shorts Video Generator
Generates a polished 9:16 vertical video (720x1280) ready for YouTube Shorts, Instagram Reels, and TikTok.
"""

import os
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH = 720
HEIGHT = 1280
FPS = 30
DURATION_SEC = 25
TOTAL_FRAMES = FPS * DURATION_SEC

FONT_PATH_BOLD = "C:/Windows/Fonts/malgunbd.ttf"
FONT_PATH_REG = "C:/Windows/Fonts/malgun.ttf"

def get_font(size, bold=True):
    path = FONT_PATH_BOLD if bold else FONT_PATH_REG
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_gradient_background(draw, t):
    # Dynamic dark modern tech gradient with subtle hue shift
    top_color = (15, 23, 42)      # Deep slate #0f172a
    bottom_color = (2, 6, 23)     # Pitch dark #020617
    # Interpolate
    for y in range(0, HEIGHT, 4):
        ratio = y / HEIGHT
        r = int(top_color[0] * (1 - ratio) + bottom_color[0] * ratio)
        g = int(top_color[1] * (1 - ratio) + bottom_color[1] * ratio)
        b = int(top_color[2] * (1 - ratio) + bottom_color[2] * ratio)
        draw.line([(0, y), (WIDTH, y + 4)], fill=(r, g, b), width=4)

    # Ambient glowing circles
    glow_x = int(WIDTH / 2 + math.sin(t * 1.5) * 80)
    glow_y = int(350 + math.cos(t * 1.2) * 60)
    # subtle cyan glow
    glow_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_draw.ellipse(
        [glow_x - 220, glow_y - 220, glow_x + 220, glow_y + 220],
        fill=(56, 189, 248, 25) # soft sky blue
    )
    # subtle violet glow
    glow_draw.ellipse(
        [glow_x - 50, glow_y + 300, glow_x + 350, glow_y + 700],
        fill=(168, 85, 247, 20) # soft purple
    )
    return glow_layer

def draw_rounded_card(draw, box, fill, radius=24, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def render_frame(frame_idx):
    sec = frame_idx / FPS
    img = Image.new("RGBA", (WIDTH, HEIGHT), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background
    glow = draw_gradient_background(draw, sec)
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # 2. Top Progress Bar
    progress = frame_idx / TOTAL_FRAMES
    bar_width = int(WIDTH * progress)
    draw.rectangle([0, 0, WIDTH, 8], fill=(30, 41, 59, 255))
    draw.rectangle([0, 0, bar_width, 8], fill=(56, 189, 248, 255)) # Cyan bar

    # 3. Top Branding Tag
    draw_rounded_card(draw, [260, 45, 460, 85], fill=(30, 41, 59, 220), radius=20, outline=(71, 85, 105, 255), width=1)
    brand_font = get_font(20, bold=True)
    draw.text((360, 65), "🚀 zemix.kr", font=brand_font, fill=(241, 245, 249), anchor="mm")

    # 4. Content by Timeline
    # Scene 1: 0 ~ 5s (The Hook)
    if sec < 5.0:
        # Title Hook
        hook_font = get_font(42, bold=True)
        sub_font = get_font(28, bold=False)

        draw.text((360, 240), "사이드 프로젝트", font=hook_font, fill=(148, 163, 184), anchor="mm")
        draw.text((360, 305), "열심히 만들었는데...", font=hook_font, fill=(255, 255, 255), anchor="mm")

        # Sad Visitor Counter Card
        pulse = 1.0 + math.sin(sec * 6) * 0.03
        cw = int(520 * pulse)
        ch = int(240 * pulse)
        cx, cy = 360, 560
        card_box = [cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2]

        draw_rounded_card(draw, card_box, fill=(30, 41, 59, 240), radius=28, outline=(239, 68, 68, 200), width=3)
        draw.text((cx, cy - 45), "오늘의 실시간 방문자 수", font=get_font(26, bold=False), fill=(148, 163, 184), anchor="mm")
        draw.text((cx, cy + 30), "0 명 😭", font=get_font(72, bold=True), fill=(239, 68, 68), anchor="mm")

        # Subtitle box
        draw_rounded_card(draw, [60, 860, 660, 950], fill=(0, 0, 0, 180), radius=20)
        draw.text((360, 905), "어디에 홍보해야 할지 막막하셨죠?", font=get_font(32, bold=True), fill=(250, 204, 21), anchor="mm")

    # Scene 2: 5s ~ 12s (The Solution - zemix Intro)
    elif sec < 12.0:
        t_scene = sec - 5.0
        # Title
        draw.text((360, 200), "국내 인디 빌더를 위한", font=get_font(30, bold=False), fill=(148, 163, 184), anchor="mm")
        draw.text((360, 260), "사이드 프로젝트 쇼케이스", font=get_font(44, bold=True), fill=(56, 189, 248), anchor="mm")

        # Mockup Project Card
        card_y = 520 - int(math.sin(min(t_scene * 2, math.pi / 2)) * 30)
        draw_rounded_card(draw, [80, card_y - 180, 640, card_y + 220], fill=(30, 41, 59, 255), radius=24, outline=(56, 189, 248, 180), width=2)

        # Card header & Tag
        draw_rounded_card(draw, [110, card_y - 150, 230, card_y - 110], fill=(56, 189, 248, 40), radius=12)
        draw.text((170, card_y - 130), "🔥 인기 프로젝트", font=get_font(18, bold=True), fill=(56, 189, 248), anchor="mm")

        # Project title & Tagline
        draw.text((110, card_y - 70), "SchoolEcho (스쿨에코)", font=get_font(34, bold=True), fill=(255, 255, 255))
        draw.text((110, card_y - 20), "학생들을 위한 익명 소통 피드백 서비스", font=get_font(22, bold=False), fill=(148, 163, 184))

        # Tech tags
        tags = ["Next.js", "React", "Supabase", "Tailwind"]
        tx = 110
        for tag in tags:
            tw = len(tag) * 14 + 20
            draw_rounded_card(draw, [tx, card_y + 35, tx + tw, card_y + 75], fill=(51, 65, 85, 255), radius=8)
            draw.text((tx + tw//2, card_y + 55), tag, font=get_font(17, bold=True), fill=(226, 232, 240), anchor="mm")
            tx += tw + 10

        # Stats bar
        draw.line([(110, card_y + 110), (610, card_y + 110)], fill=(51, 65, 85, 255), width=1)
        views = int(120 + t_scene * 85)
        likes = int(34 + t_scene * 15)
        draw.text((110, card_y + 150), f"👀 조회수 {views}", font=get_font(22, bold=True), fill=(148, 163, 184))
        draw.text((310, card_y + 150), f"❤️ 좋아요 {likes}", font=get_font(22, bold=True), fill=(244, 63, 94))
        draw.text((510, card_y + 150), "💬 피드백 12", font=get_font(22, bold=True), fill=(56, 189, 248))

        # Subtitle box
        draw_rounded_card(draw, [50, 860, 670, 950], fill=(0, 0, 0, 180), radius=20)
        draw.text((360, 905), "내 프로젝트를 세상에 멋지게 알리세요!", font=get_font(32, bold=True), fill=(255, 255, 255), anchor="mm")

    # Scene 3: 12s ~ 19s (Key Benefits: Feedback + SEO + Portfolio)
    elif sec < 19.0:
        t_scene = sec - 12.0
        draw.text((360, 190), "zemix에 올리면 좋은 점", font=get_font(42, bold=True), fill=(255, 255, 255), anchor="mm")

        # 3 Benefit Cards
        benefits = [
            ("✨ 3분 만에 무료 프로젝트 등록", "데모 링크, 깃허브, 스택까지 한 번에", (56, 189, 248)),
            ("💬 동료 개발자들의 솔직한 피드백", "응원 하트와 개선 아이디어 수집", (244, 63, 94)),
            ("🔍 구글 검색봇 자동 크롤링 & SEO", "검색엔진에 자동 등록되어 유입 증가", (34, 197, 94)),
        ]

        for i, (b_title, b_desc, b_color) in enumerate(benefits):
            # Animate stagger
            offset_y = 320 + i * 160
            anim_prog = min(max((t_scene - i * 0.5) * 2, 0), 1)
            cur_x = int(-200 * (1 - anim_prog) + 70)

            draw_rounded_card(draw, [cur_x, offset_y, cur_x + 580, offset_y + 130], fill=(30, 41, 59, 240), radius=20, outline=b_color, width=2)
            draw.text((cur_x + 35, offset_y + 35), b_title, font=get_font(26, bold=True), fill=(255, 255, 255))
            draw.text((cur_x + 35, offset_y + 80), b_desc, font=get_font(20, bold=False), fill=(148, 163, 184))

        # Subtitle box
        draw_rounded_card(draw, [50, 860, 670, 950], fill=(0, 0, 0, 180), radius=20)
        draw.text((360, 905), "동료 빌더들의 피드백과 구글 SEO까지!", font=get_font(32, bold=True), fill=(250, 204, 21), anchor="mm")

    # Scene 4: 19s ~ 25s (Call to Action)
    else:
        t_scene = sec - 19.0
        draw.text((360, 250), "지금 바로 무료로", font=get_font(36, bold=False), fill=(148, 163, 184), anchor="mm")
        draw.text((360, 320), "내 프로젝트 등록하기! 🚀", font=get_font(48, bold=True), fill=(255, 255, 255), anchor="mm")

        # Big CTA Button
        bounce = math.sin(t_scene * 8) * 8
        btn_box = [110, 460 + int(bounce), 610, 570 + int(bounce)]
        draw_rounded_card(draw, btn_box, fill=(14, 165, 233, 255), radius=30, outline=(255, 255, 255, 200), width=3)
        draw.text((360, 515 + int(bounce)), "👉 zemix 둘러보기", font=get_font(38, bold=True), fill=(255, 255, 255), anchor="mm")

        # Bottom Instructions Card
        draw_rounded_card(draw, [90, 660, 630, 800], fill=(30, 41, 59, 240), radius=20, outline=(71, 85, 105, 255), width=1)
        draw.text((360, 705), "📌 프로필 링크 or 고정 댓글 확인", font=get_font(26, bold=True), fill=(250, 204, 21), anchor="mm")
        draw.text((360, 755), "토이프로젝트 / AI툴 / 웹앱 모두 환영!", font=get_font(22, bold=False), fill=(203, 213, 225), anchor="mm")

        # Subtitle box
        draw_rounded_card(draw, [50, 860, 670, 950], fill=(0, 0, 0, 180), radius=20)
        draw.text((360, 905), "고정 댓글 링크에서 지금 확인해보세요!", font=get_font(32, bold=True), fill=(56, 189, 248), anchor="mm")

    # Watermark
    draw.text((360, 1220), "zemix | 사이드 프로젝트 쇼케이스", font=get_font(18, bold=False), fill=(100, 116, 139), anchor="mm")

    # Convert to RGB OpenCV format (BGR)
    rgb_img = img.convert("RGB")
    frame = np.array(rgb_img)
    return cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

def main():
    output_path = os.path.abspath("zemix_shorts.mp4")
    print(f"Generating video to: {output_path}")
    print(f"Total frames: {TOTAL_FRAMES} ({FPS} FPS, {DURATION_SEC}s, {WIDTH}x{HEIGHT})")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, FPS, (WIDTH, HEIGHT))

    for f in range(TOTAL_FRAMES):
        frame = render_frame(f)
        out.write(frame)
        if f % 90 == 0:
            print(f"Progress: {f}/{TOTAL_FRAMES} frames ({int(f/TOTAL_FRAMES*100)}%)")

    out.release()
    print("Done! Video successfully generated at:", output_path)

if __name__ == "__main__":
    main()
