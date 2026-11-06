"""
zemix Live Demonstration Video Generator
Automates Chrome to browse the live local zemix platform, captures real screens,
and edits a polished 1280x720 demonstration video with simulated mouse cursor,
click ripples, browser window frame, and synchronized Korean subtitles.
"""

import io
import math
import os
import time
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION_SEC = 30
TOTAL_FRAMES = FPS * DURATION_SEC

FONT_BOLD = "C:/Windows/Fonts/malgunbd.ttf"
FONT_REG = "C:/Windows/Fonts/malgun.ttf"

def get_font(size, bold=True):
    path = FONT_BOLD if bold else FONT_REG
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def capture_live_screens():
    """Uses Selenium to capture screenshots from the actual running app."""
    print("Launching Chrome Headless to capture live screens from http://localhost:3000 ...")
    options = Options()
    options.add_argument('--headless')
    # Use exact web viewport matching our canvas content area
    options.add_argument('--window-size=1280,900')
    options.add_argument('--force-device-scale-factor=1')
    options.add_argument('--disable-gpu')

    driver = webdriver.Chrome(options=options)
    screens = {}

    try:
        # 1. Homepage Top
        driver.get('http://localhost:3000')
        time.sleep(1.5)
        screens['home_top'] = Image.open(io.BytesIO(driver.get_screenshot_as_png()))
        print("Captured: Homepage Top")

        # 2. Homepage Scrolled (Project Grid)
        driver.execute_script("window.scrollTo(0, 480);")
        time.sleep(0.8)
        screens['home_scroll'] = Image.open(io.BytesIO(driver.get_screenshot_as_png()))
        print("Captured: Homepage Scrolled")

        # 3. Project Detail Page (SchoolEcho or first project)
        # Find first project link
        project_links = [a.get_attribute('href') for a in driver.find_elements("tag name", "a") if '/projects/proj-' in (a.get_attribute('href') or '')]
        target_project_url = project_links[0] if project_links else 'http://localhost:3000/projects/proj-1792574189790'
        
        driver.get(target_project_url)
        time.sleep(1.5)
        screens['project_top'] = Image.open(io.BytesIO(driver.get_screenshot_as_png()))
        print(f"Captured: Project Detail Top ({target_project_url})")

        # 4. Project Detail Scrolled (Feedback section)
        driver.execute_script("window.scrollTo(0, 420);")
        time.sleep(0.8)
        screens['project_scroll'] = Image.open(io.BytesIO(driver.get_screenshot_as_png()))
        print("Captured: Project Detail Scrolled")

        # 5. Explore Page
        driver.get('http://localhost:3000/explore')
        time.sleep(1.2)
        screens['explore_top'] = Image.open(io.BytesIO(driver.get_screenshot_as_png()))
        print("Captured: Explore Page")

        # 6. Builders Page
        driver.get('http://localhost:3000/builders')
        time.sleep(1.2)
        screens['builders_top'] = Image.open(io.BytesIO(driver.get_screenshot_as_png()))
        print("Captured: Builders Page")

    finally:
        driver.quit()

    print("All live screenshots captured successfully!")
    return screens

def draw_cursor(draw, x, y, clicking=False):
    """Draws a clean macOS-style mouse cursor with click effect."""
    # Cursor polygon
    points = [
        (x, y),
        (x, y + 22),
        (x + 6, y + 17),
        (x + 11, y + 26),
        (x + 15, y + 24),
        (x + 10, y + 15),
        (x + 18, y + 15)
    ]
    # Drop shadow
    shadow_pts = [(px + 2, py + 2) for px, py in points]
    draw.polygon(shadow_pts, fill=(0, 0, 0, 100))
    # Main cursor: white with dark outline
    draw.polygon(points, fill=(255, 255, 255, 255), outline=(15, 23, 42, 255))

    # Click ripple effect
    if clicking:
        for r, alpha in [(16, 200), (28, 120), (40, 60)]:
            draw.ellipse([x - r, y - r, x + r, y + r], outline=(56, 189, 248, alpha), width=3)

def draw_browser_frame(canvas, url_text):
    """Draws a modern dark browser chrome header."""
    draw = ImageDraw.Draw(canvas)
    header_h = 44
    draw.rectangle([0, 0, WIDTH, header_h], fill=(30, 41, 59, 255))
    draw.line([(0, header_h), (WIDTH, header_h)], fill=(51, 65, 85, 255), width=1)

    # Window traffic lights
    draw.ellipse([18, 16, 30, 28], fill=(239, 68, 68, 255))  # Close
    draw.ellipse([38, 16, 50, 28], fill=(245, 158, 11, 255)) # Min
    draw.ellipse([58, 16, 70, 28], fill=(16, 185, 129, 255)) # Max

    # Navigation arrows (subtle)
    font_arrow = get_font(14, bold=True)
    draw.text((95, 22), "‹", font=font_arrow, fill=(148, 163, 184), anchor="mm")
    draw.text((115, 22), "›", font=font_arrow, fill=(100, 116, 139), anchor="mm")

    # Address bar
    bar_x1, bar_x2 = 150, WIDTH - 180
    draw.rounded_rectangle([bar_x1, 8, bar_x2, 36], radius=8, fill=(15, 23, 42, 255), outline=(51, 65, 85, 255), width=1)
    url_font = get_font(13, bold=False)
    draw.text((bar_x1 + 14, 22), f"🔒 {url_text}", font=url_font, fill=(148, 163, 184), anchor="lm")

    # Right branding badge
    badge_font = get_font(12, bold=True)
    draw.rounded_rectangle([WIDTH - 150, 10, WIDTH - 20, 34], radius=6, fill=(56, 189, 248, 30), outline=(56, 189, 248, 100))
    draw.text((WIDTH - 85, 22), "zemix LIVE DEMO", font=badge_font, fill=(56, 189, 248), anchor="mm")

def draw_subtitle_card(draw, text, sub_text, icon="💡"):
    """Draws a floating modern subtitle bar at bottom center."""
    card_w = 920
    card_h = 74
    x1 = (WIDTH - card_w) // 2
    y1 = HEIGHT - card_h - 18
    x2 = x1 + card_w
    y2 = y1 + card_h

    # Card background with glow outline
    draw.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=(15, 23, 42, 245), outline=(56, 189, 248, 200), width=2)

    # Icon badge
    draw.ellipse([x1 + 20, y1 + 17, x1 + 60, y1 + 57], fill=(56, 189, 248, 40))
    draw.text((x1 + 40, y1 + 37), icon, font=get_font(20), anchor="mm")

    # Primary Title & Subtitle text
    draw.text((x1 + 75, y1 + 24), text, font=get_font(18, bold=True), fill=(255, 255, 255), anchor="lm")
    draw.text((x1 + 75, y1 + 50), sub_text, font=get_font(14, bold=False), fill=(148, 163, 184), anchor="lm")

def interpolate(val1, val2, t):
    """Smooth cosine ease-in-out interpolation."""
    t = max(0.0, min(1.0, t))
    smooth_t = (1 - math.cos(t * math.pi)) / 2
    return val1 + (val2 - val1) * smooth_t

def render_demo_video():
    screens = capture_live_screens()
    output_path = os.path.abspath("zemix_live_demo.mp4")
    print(f"Rendering demo video to: {output_path} ({WIDTH}x{HEIGHT} @ {FPS} FPS, {DURATION_SEC}s)")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, FPS, (WIDTH, HEIGHT))

    content_top = 44 # below browser chrome
    content_h = HEIGHT - content_top

    # Helper to crop/fit captured screen into content area
    def prepare_screen(img, scroll_y=0):
        # crop width 1280, height content_h from img
        crop_box = (0, scroll_y, WIDTH, scroll_y + content_h)
        return img.crop(crop_box)

    home_top_cropped = prepare_screen(screens['home_top'], 0)
    home_scroll_cropped = prepare_screen(screens['home_scroll'], 0)
    proj_top_cropped = prepare_screen(screens['project_top'], 0)
    proj_scroll_cropped = prepare_screen(screens['project_scroll'], 0)
    explore_cropped = prepare_screen(screens['explore_top'], 0)
    builders_cropped = prepare_screen(screens['builders_top'], 0)

    # Load 3D logo for intro / outro
    logo_path = "public/branding/zemix-logo-3d-v1.jpg"
    logo_3d = Image.open(logo_path).resize((180, 180), Image.Resampling.LANCZOS) if os.path.exists(logo_path) else None

    for f in range(TOTAL_FRAMES):
        sec = f / FPS
        canvas = Image.new("RGBA", (WIDTH, HEIGHT), (15, 23, 42, 255))

        # --- Scene Routing ---
        # 1. Intro (0 ~ 2.5s)
        if sec < 2.5:
            draw = ImageDraw.Draw(canvas)
            # Ambient background
            for y in range(0, HEIGHT, 4):
                ratio = y / HEIGHT
                r = int(10 * (1 - ratio) + 3 * ratio)
                g = int(15 * (1 - ratio) + 7 * ratio)
                b = int(29 * (1 - ratio) + 18 * ratio)
                draw.line([(0, y), (WIDTH, y + 4)], fill=(r, g, b), width=4)

            # Center 3D Logo
            if logo_3d:
                canvas.paste(logo_3d, (WIDTH // 2 - 90, 160))

            draw = ImageDraw.Draw(canvas)
            draw.text((WIDTH // 2, 390), "zemix", font=get_font(52, bold=True), fill=(255, 255, 255), anchor="mm")
            draw.text((WIDTH // 2, 450), "사이드 프로젝트 & 인디 빌더 쇼케이스 플랫폼", font=get_font(24, bold=False), fill=(56, 189, 248), anchor="mm")
            draw.text((WIDTH // 2, 530), "실제 웹사이트 시연 투어를 시작합니다 ✨", font=get_font(18, bold=False), fill=(148, 163, 184), anchor="mm")

        # 2. Homepage Hero & Scroll (2.5s ~ 8.0s)
        elif sec < 8.0:
            t = (sec - 2.5) / 5.5
            # Transition from home_top to home_scroll around t=0.5
            current_screen = home_top_cropped if t < 0.45 else home_scroll_cropped
            canvas.paste(current_screen, (0, content_top))

            draw_browser_frame(canvas, "https://zemix.kr/")

            # Mouse cursor moving towards project card
            cx = interpolate(300, 480, t)
            cy = interpolate(250, 460, t)
            is_click = (0.85 < t < 0.98) # click at end
            draw = ImageDraw.Draw(canvas)
            draw_cursor(draw, cx, cy, clicking=is_click)

            draw_subtitle_card(
                draw,
                "1. 메인 홈: 국내 개발자들의 최신 사이드 프로젝트 탐색",
                "카테고리별 인기 프로젝트와 실시간 투표 랭킹을 한눈에 확인합니다.",
                icon="🚀"
            )

        # 3. Project Detail Page & Features (8.0s ~ 15.0s)
        elif sec < 15.0:
            t = (sec - 8.0) / 7.0
            current_screen = proj_top_cropped if t < 0.55 else proj_scroll_cropped
            canvas.paste(current_screen, (0, content_top))

            draw_browser_frame(canvas, "https://zemix.kr/projects/schoolecho")

            # Mouse cursor moves to Like button and clicks
            cx = interpolate(200, 360, min(t * 2, 1.0))
            cy = interpolate(300, 490, min(t * 2, 1.0))
            is_click = (0.28 < t < 0.42) # Heart like click!
            draw = ImageDraw.Draw(canvas)
            draw_cursor(draw, cx, cy, clicking=is_click)

            draw_subtitle_card(
                draw,
                "2. 프로젝트 상세: 데모 웹사이트, 기술 스택, 실시간 응원(좋아요)",
                "개발자가 작성한 상세 소개와 사용 스택을 확인하고 피드백을 남길 수 있습니다.",
                icon="❤️"
            )

        # 4. Explore & Search Filters (15.0s ~ 21.0s)
        elif sec < 21.0:
            t = (sec - 15.0) / 6.0
            canvas.paste(explore_cropped, (0, content_top))
            draw_browser_frame(canvas, "https://zemix.kr/explore")

            # Mouse cursor moves across filter chips
            cx = interpolate(350, 720, t)
            cy = interpolate(190, 220, t)
            is_click = (0.45 < t < 0.60)
            draw = ImageDraw.Draw(canvas)
            draw_cursor(draw, cx, cy, clicking=is_click)

            draw_subtitle_card(
                draw,
                "3. 둘러보기(Explore): 웹, AI, 오픈소스 등 관심 태그 검색",
                "원하는 기술 스택이나 주제별로 최적의 사이드 프로젝트를 필터링합니다.",
                icon="🔍"
            )

        # 5. Builders Page (21.0s ~ 26.5s)
        elif sec < 26.5:
            t = (sec - 21.0) / 5.5
            canvas.paste(builders_cropped, (0, content_top))
            draw_browser_frame(canvas, "https://zemix.kr/builders")

            # Mouse cursor hovers over builder card
            cx = interpolate(250, 420, t)
            cy = interpolate(280, 360, t)
            draw = ImageDraw.Draw(canvas)
            draw_cursor(draw, cx, cy, clicking=False)

            draw_subtitle_card(
                draw,
                "4. 빌더 프로필: 메이커 포트폴리오 & 제작한 프로젝트 모음",
                "개발자가 제작한 모든 프로젝트를 모아볼 수 있는 개인 포트폴리오를 제공합니다.",
                icon="👨‍💻"
            )

        # 6. Outro CTA (26.5s ~ 30.0s)
        else:
            t = (sec - 26.5) / 3.5
            draw = ImageDraw.Draw(canvas)
            for y in range(0, HEIGHT, 4):
                ratio = y / HEIGHT
                r = int(10 * (1 - ratio) + 3 * ratio)
                g = int(15 * (1 - ratio) + 7 * ratio)
                b = int(29 * (1 - ratio) + 18 * ratio)
                draw.line([(0, y), (WIDTH, y + 4)], fill=(r, g, b), width=4)

            if logo_3d:
                canvas.paste(logo_3d, (WIDTH // 2 - 90, 150))

            draw = ImageDraw.Draw(canvas)
            draw.text((WIDTH // 2, 380), "당신의 프로젝트를 등록하세요!", font=get_font(42, bold=True), fill=(255, 255, 255), anchor="mm")
            draw.text((WIDTH // 2, 440), "3분 만에 무료 등록 • 구글 검색 자동 노출 • 피드백 수집", font=get_font(22, bold=False), fill=(56, 189, 248), anchor="mm")

            # Big CTA button with bounce
            bounce = int(math.sin(t * 8) * 5)
            btn_box = [WIDTH // 2 - 220, 500 + bounce, WIDTH // 2 + 220, 560 + bounce]
            draw.rounded_rectangle(btn_box, radius=16, fill=(14, 165, 233, 255), outline=(255, 255, 255, 200), width=2)
            draw.text((WIDTH // 2, 530 + bounce), "👉 zemix.kr 바로가기", font=get_font(24, bold=True), fill=(255, 255, 255), anchor="mm")

        # Top Global Progress Bar (0% ~ 100%)
        progress = f / TOTAL_FRAMES
        bar_w = int(WIDTH * progress)
        p_draw = ImageDraw.Draw(canvas)
        p_draw.rectangle([0, 0, WIDTH, 4], fill=(30, 41, 59, 255))
        p_draw.rectangle([0, 0, bar_w, 4], fill=(56, 189, 248, 255))

        # Write frame to video
        frame_rgb = canvas.convert("RGB")
        frame_bgr = cv2.cvtColor(np.array(frame_rgb), cv2.COLOR_RGB2BGR)
        out.write(frame_bgr)

        if f % 150 == 0:
            print(f"Render progress: {f}/{TOTAL_FRAMES} frames ({int(f/TOTAL_FRAMES*100)}%)")

    out.release()
    print("Demo video rendering complete:", output_path)

if __name__ == "__main__":
    render_demo_video()
