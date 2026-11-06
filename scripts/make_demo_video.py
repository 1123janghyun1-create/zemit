import asyncio
import os
import subprocess
import edge_tts
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

SCENES = [
    {
        "id": 1,
        "text": "Welcome to zemix. The launchpad and community platform built for tech creators, developers, and indie hackers.",
        "badge": "THE LAUNCHPAD FOR TECH BUILDERS",
        "title": "Welcome to zemix",
        "subtitle": "Where side projects meet real users, early feedback, and fellow builders.",
        "chips": ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase", "AI Dev Suite"],
        "accent": (56, 189, 248), # cyan
    },
    {
        "id": 2,
        "text": "Discover inspiring side projects before anyone else. Upvote your favorite builds and watch them rise to the weekly Hall of Fame.",
        "badge": "REAL-TIME LEADERBOARD",
        "title": "Weekly & Monthly Hall of Fame",
        "subtitle": "Transparent community rankings spotlighting the most loved products.",
        "chips": ["#1 SchoolEcho (482 ▲)", "#2 DevCanvas AI (395 ▲)", "#3 FlowLog (318 ▲)"],
        "accent": (251, 191, 36), # amber
    },
    {
        "id": 3,
        "text": "Never lose users to endless redirects. With our live in-app sandbox, visitors can test drive your web app instantly without leaving the page.",
        "badge": "ZERO-REDIRECT PREVIEW",
        "title": "Interactive In-App Sandbox",
        "subtitle": "Test drive live web prototypes natively inside an interactive modal.",
        "chips": ["Desktop & Mobile", "Zero Friction", "Instant Testing", "100% Live"],
        "accent": (168, 85, 247), # purple
    },
    {
        "id": 4,
        "text": "Supercharge your launch. Generate stunning social media card news, and live dynamic README badges for your GitHub repository.",
        "badge": "CREATOR GROWTH SUITE",
        "title": "1-Click Card News & Dynamic Badges",
        "subtitle": "Automate your marketing assets for Instagram, LinkedIn, X, and GitHub.",
        "chips": ["5 Visual Themes", "1:1 / 9:16 / 16:9", "Dynamic SVG Badges", "Instant Copy"],
        "accent": (244, 63, 94), # rose
    },
    {
        "id": 5,
        "text": "Recruit co-founders, gather structured user feedback, and stop building in the dark. Launch your dream project on zemix today!",
        "badge": "TEAM & TESTERS",
        "title": "Find Teammates & Ship Today",
        "subtitle": "Stop building in the dark. Launch your MVP to the world.",
        "chips": ["👥 Looking for Team", "🧪 Beta Testers", "☕ Maker Coffee Chat", "🚀 Launch Now"],
        "accent": (16, 185, 129), # emerald
    },
]

WIDTH, HEIGHT = 1280, 720
FPS = 24

def get_font(size, bold=False):
    font_path = "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf"
    if not os.path.exists(font_path):
        font_path = "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf"
    try:
        return ImageFont.truetype(font_path, size)
    except:
        return ImageFont.load_default()

font_hero = get_font(46, bold=True)
font_title = get_font(38, bold=True)
font_badge = get_font(14, bold=True)
font_sub = get_font(20, bold=False)
font_chip = get_font(15, bold=True)
font_caption = get_font(18, bold=True)
font_meta = get_font(14, bold=False)

def get_audio_duration(file_path):
    cmd = [
        FFMPEG,
        "-i", file_path,
        "-show_entries", "format=duration",
        "-v", "quiet",
        "-of", "csv=p=0"
    ]
    # Fallback duration calculation using ffmpeg
    try:
        proc = subprocess.run([FFMPEG, "-i", file_path], stderr=subprocess.PIPE, text=True)
        for line in proc.stderr.split("\n"):
            if "Duration:" in line:
                part = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = part.split(":")
                return float(h)*3600 + float(m)*60 + float(s)
    except:
        pass
    return 6.0

def draw_hexagon(draw, center_x, center_y, radius, outline_color, fill_color=None, width=3):
    import math
    points = []
    for i in range(6):
        angle_deg = 60 * i - 30
        angle_rad = math.radians(angle_deg)
        x = center_x + radius * math.cos(angle_rad)
        y = center_y + radius * math.sin(angle_rad)
        points.append((x, y))
    if fill_color:
        draw.polygon(points, fill=fill_color)
    draw.polygon(points, outline=outline_color)
    # thicker line
    for w in range(1, width):
        p_offset = []
        for i in range(6):
            angle_deg = 60 * i - 30
            angle_rad = math.radians(angle_deg)
            x = center_x + (radius - w) * math.cos(angle_rad)
            y = center_y + (radius - w) * math.sin(angle_rad)
            p_offset.append((x, y))
        draw.polygon(p_offset, outline=outline_color)

def render_frame(scene, progress_in_scene, total_time_sec, total_duration_sec):
    im = Image.new("RGB", (WIDTH, HEIGHT), (7, 12, 27)) # Deep dark cyber navy
    draw = ImageDraw.Draw(im)

    # Ambient gradient glow
    accent = scene["accent"]
    for r in range(180, 0, -10):
        alpha = int(18 * (r / 180))
        glow_color = (
            min(255, int(accent[0] * 0.15 + alpha)),
            min(255, int(accent[1] * 0.15 + alpha)),
            min(255, int(accent[2] * 0.15 + alpha)),
        )
        draw.ellipse([640 - r*2, 300 - r, 640 + r*2, 300 + r], fill=glow_color)

    # Grid background dots
    for x in range(40, WIDTH, 60):
        for y in range(40, HEIGHT, 60):
            draw.point((x, y), fill=(25, 35, 60))

    # Top Header Bar
    draw_hexagon(draw, 50, 40, 16, outline_color=(56, 189, 248), width=2)
    draw.text((75, 28), "zemix", font=font_title, fill=(255, 255, 255))
    draw.text((195, 36), "|  Official Demo Walkthrough", font=font_meta, fill=(148, 163, 184))

    # Time badge top right
    time_str = f"{int(total_time_sec//60)}:{int(total_time_sec%60):02d} / {int(total_duration_sec//60)}:{int(total_duration_sec%60):02d}"
    draw.rounded_rectangle([WIDTH - 160, 26, WIDTH - 40, 56], radius=8, fill=(20, 28, 48), outline=(50, 65, 95))
    draw.text((WIDTH - 145, 33), time_str, font=font_meta, fill=(203, 213, 225))

    # Center Badge
    badge_text = scene["badge"]
    badge_w = len(badge_text) * 9 + 30
    draw.rounded_rectangle([640 - badge_w//2, 110, 640 + badge_w//2, 142], radius=16, fill=(15, 23, 42), outline=accent, width=2)
    draw.text((640 - badge_w//2 + 15, 117), badge_text, font=font_badge, fill=accent)

    # Center Title
    title = scene["title"]
    draw.text((640 - len(title)*13, 165), title, font=font_hero, fill=(255, 255, 255))

    # Center Subtitle
    sub = scene["subtitle"]
    draw.text((640 - len(sub)*5.5, 230), sub, font=font_sub, fill=(148, 163, 184))

    # Scene specific graphics
    if scene["id"] == 1:
        # Giant Hexagon Logo in center
        draw_hexagon(draw, 640, 370, 75, outline_color=(56, 189, 248), fill_color=(15, 23, 42), width=4)
        draw_hexagon(draw, 640, 370, 40, outline_color=(125, 211, 252), width=3)
    elif scene["id"] == 2:
        # Leaderboard Cards
        cards = [
            ("1", "SchoolEcho", "Beta", "482 ▲", (251, 191, 36)),
            ("2", "DevCanvas AI", "MVP", "395 ▲", (203, 213, 225)),
            ("3", "FlowLog Tech", "Public", "318 ▲", (180, 83, 9)),
        ]
        for idx, (rank, name, tag, votes, rank_color) in enumerate(cards):
            cy = 300 + idx * 56
            draw.rounded_rectangle([380, cy, 900, cy + 46], radius=10, fill=(15, 23, 42), outline=(51, 65, 85))
            draw.ellipse([395, cy + 10, 421, cy + 36], fill=rank_color)
            draw.text((404, cy + 13), rank, font=font_badge, fill=(0, 0, 0))
            draw.text((435, cy + 12), name, font=font_chip, fill=(255, 255, 255))
            draw.rounded_rectangle([570, cy + 12, 620, cy + 34], radius=6, fill=(30, 41, 59))
            draw.text((580, cy + 15), tag, font=font_meta, fill=(148, 163, 184))
            draw.text((830, cy + 12), votes, font=font_chip, fill=(244, 63, 94))
    elif scene["id"] == 3:
        # Browser Sandbox Mockup
        draw.rounded_rectangle([360, 285, 920, 470], radius=12, fill=(15, 23, 42), outline=(168, 85, 247), width=2)
        # Browser header
        draw.rounded_rectangle([360, 285, 920, 325], radius=12, fill=(24, 24, 27))
        draw.ellipse([375, 301, 385, 311], fill=(239, 68, 68))
        draw.ellipse([393, 301, 403, 311], fill=(245, 158, 11))
        draw.ellipse([411, 301, 421, 311], fill=(16, 185, 129))
        draw.rounded_rectangle([440, 295, 780, 318], radius=6, fill=(39, 39, 42))
        draw.text((455, 298), "https://schoolecho.app/demo", font=font_meta, fill=(212, 212, 216))
        draw.text((810, 298), "100% LIVE", font=font_meta, fill=(168, 85, 247))
        # Body preview
        draw.text((530, 375), "⚡ Interactive Live Prototype Preview", font=font_chip, fill=(255, 255, 255))
        draw.text((490, 410), "Experience side projects directly inside zemix without tabs.", font=font_meta, fill=(161, 161, 170))
    elif scene["id"] == 4:
        # 3 Card News theme mockups
        themes = [
            ("🌌 Aurora Neon", "Cyber Navy Glow", (56, 189, 248), 340),
            ("🌅 Sunset Glow", "Coral Magenta Vibe", (244, 63, 94), 540),
            ("🌿 Tech Mint", "Dynamic GitHub Badges", (52, 211, 153), 740),
        ]
        for t_title, t_desc, t_color, cx in themes:
            draw.rounded_rectangle([cx, 290, cx + 180, 440], radius=10, fill=(15, 23, 42), outline=t_color, width=2)
            draw.text((cx + 15, 310), t_title, font=font_chip, fill=t_color)
            draw.text((cx + 15, 350), "Card Studio", font=font_sub, fill=(255, 255, 255))
            draw.text((cx + 15, 385), t_desc, font=font_meta, fill=(148, 163, 184))
            draw.rounded_rectangle([cx + 15, 410, cx + 165, 426], radius=4, fill=(30, 41, 59))
    elif scene["id"] == 5:
        # Team & Launch Badges
        roles = [
            "👥 Looking for Frontend Dev",
            "🧪 Looking for Beta Testers",
            "☕ 1:1 Maker Coffee Chat",
        ]
        rx = 340
        for r_text in roles:
            rw = len(r_text) * 10 + 20
            draw.rounded_rectangle([rx, 300, rx + rw, 335], radius=18, fill=(15, 23, 42), outline=(16, 185, 129))
            draw.text((rx + 12, 308), r_text, font=font_chip, fill=(167, 243, 208))
            rx += rw + 15

        # Big CTA Button
        draw.rounded_rectangle([480, 370, 800, 435], radius=16, fill=(37, 99, 235), outline=(56, 189, 248), width=2)
        draw.text((515, 388), "🚀 Launch on zemix.vercel.app", font=font_sub, fill=(255, 255, 255))

    # Chips bottom
    chip_x = 640 - (len(scene["chips"]) * 115) // 2
    for chip in scene["chips"]:
        cw = len(chip) * 9 + 20
        draw.rounded_rectangle([chip_x, 490, chip_x + cw, 522], radius=12, fill=(20, 28, 48), outline=(51, 65, 85))
        draw.text((chip_x + 10, 497), chip, font=font_chip, fill=(203, 213, 225))
        chip_x += cw + 10

    # Subtitles Overlay at bottom
    sub_text = f'"{scene["text"]}"'
    sub_w = min(1100, len(sub_text) * 9 + 40)
    draw.rounded_rectangle([640 - sub_w//2, 570, 640 + sub_w//2, 630], radius=12, fill=(0, 0, 0), outline=(50, 60, 80))
    draw.text((640 - (len(sub_text)*4.3), 588), sub_text, font=font_caption, fill=(255, 255, 255))

    # Bottom Progress Bar
    pct = total_time_sec / total_duration_sec
    draw.rectangle([0, HEIGHT - 8, WIDTH, HEIGHT], fill=(20, 28, 48))
    draw.rectangle([0, HEIGHT - 8, int(WIDTH * pct), HEIGHT], fill=accent)

    return im

async def main():
    os.makedirs("temp_video", exist_ok=True)
    os.makedirs("public", exist_ok=True)
    
    print("Step 1: Generating English AI Voice Audio for each scene...")
    scene_audios = []
    total_duration = 0.0

    for s in SCENES:
        audio_file = f"temp_video/scene_{s['id']}.mp3"
        comm = edge_tts.Communicate(s["text"], voice="en-US-ChristopherNeural", rate="+5%")
        await comm.save(audio_file)
        dur = get_audio_duration(audio_file) + 0.6 # padding
        scene_audios.append({"scene": s, "file": audio_file, "duration": dur})
        total_duration += dur
        print(f"  Scene {s['id']}: {dur:.2f}s -> {s['text'][:40]}...")

    print(f"Total Video Duration: {total_duration:.2f} seconds")

    # Concatenate all scene audios into one master audio track
    concat_list = "temp_video/audio_list.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for sa in scene_audios:
            # write absolute path formatted for ffmpeg
            f.write(f"file '{os.path.abspath(sa['file']).replace(chr(92), '/')}'\n")

    master_audio = "temp_video/master_audio.mp3"
    subprocess.run([
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_list, "-c", "copy", master_audio
    ], check=True)

    print("Step 2: Rendering video frames at 24fps...")
    frame_idx = 0
    current_time = 0.0

    ffmpeg_proc = subprocess.Popen([
        FFMPEG,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", master_audio,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "public/zemix-demo-video.mp4"
    ], stdin=subprocess.PIPE)

    for sa in scene_audios:
        s = sa["scene"]
        dur = sa["duration"]
        frames_in_scene = int(dur * FPS)
        for f in range(frames_in_scene):
            prog = f / frames_in_scene
            img = render_frame(s, prog, current_time, total_duration)
            ffmpeg_proc.stdin.write(img.tobytes())
            current_time += 1.0 / FPS
            frame_idx += 1
            if frame_idx % 72 == 0:
                print(f"  Rendered {frame_idx} frames ({current_time:.1f}s / {total_duration:.1f}s)...")

    ffmpeg_proc.stdin.close()
    ffmpeg_proc.wait()

    # Also copy to desktop for instant convenience
    desktop_dest = "C:\\Users\\1123j\\OneDrive\\Desktop\\zemix-demo-video.mp4"
    import shutil
    shutil.copy("public/zemix-demo-video.mp4", desktop_dest)
    print("SUCCESS!")
    print(f"Generated: public/zemix-demo-video.mp4")
    print(f"Desktop Copy: {desktop_dest}")

if __name__ == "__main__":
    asyncio.run(main())
