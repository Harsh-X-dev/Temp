import os
from PIL import Image, ImageDraw, ImageFont

logo_path = "/Users/yuvar/StudioProjects/AstroVedansh/GemoStone_Frontend_WebApp/public/assets/logo/GemoStoneLogo.png"
public_dir = "/Users/yuvar/StudioProjects/AstroVedansh/GemoStone_Frontend_WebApp/public"
app_dir = "/Users/yuvar/StudioProjects/AstroVedansh/GemoStone_Frontend_WebApp/app"

print(f"Loading new logo from: {logo_path}")
logo = Image.open(logo_path).convert("RGBA")

# 1. Favicon & App Icons Generation
sizes = {
    "favicon-16x16.png": (16, 16),
    "favicon-32x32.png": (32, 32),
    "apple-touch-icon.png": (180, 180),
    "android-chrome-192x192.png": (192, 192),
    "android-chrome-512x512.png": (512, 512),
}

for filename, size in sizes.items():
    icon = Image.new("RGBA", size, (0, 0, 0, 0))
    logo_copy = logo.copy()
    logo_copy.thumbnail(size, Image.Resampling.LANCZOS)
    
    offset_x = (size[0] - logo_copy.width) // 2
    offset_y = (size[1] - logo_copy.height) // 2
    icon.paste(logo_copy, (offset_x, offset_y), logo_copy)
    
    output_path = os.path.join(public_dir, filename)
    icon.save(output_path, "PNG")
    print(f"Saved {output_path}")

# Generate favicon.ico (multi-resolution format)
ico_img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
logo_copy = logo.copy()
logo_copy.thumbnail((32, 32), Image.Resampling.LANCZOS)
ico_img.paste(logo_copy, ((32 - logo_copy.width) // 2, (32 - logo_copy.height) // 2), logo_copy)

ico_public_path = os.path.join(public_dir, "favicon.ico")
ico_app_path = os.path.join(app_dir, "favicon.ico")
ico_img.save(ico_public_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
ico_img.save(ico_app_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("Saved favicon.ico to public and app dirs")

# Sync app router icons
icon_32 = Image.open(os.path.join(public_dir, "favicon-32x32.png"))
icon_32.save(os.path.join(app_dir, "icon.png"))
apple_180 = Image.open(os.path.join(public_dir, "apple-touch-icon.png"))
apple_180.save(os.path.join(app_dir, "apple-icon.png"))
print("Synced icon.png and apple-icon.png in app dir")

# 2. Generate Cover Banner (OG Image 1200x630)
og_width, og_height = 1200, 630
# Matching background color #FF6D1C (255, 109, 28)
bg_color = (255, 109, 28, 255)
og = Image.new("RGBA", (og_width, og_height), bg_color)
draw = ImageDraw.Draw(og)

# Add subtle inner border
draw.rectangle([16, 16, og_width - 16, og_height - 16], outline=(255, 255, 255, 120), width=3)

# Logo icon thumbnail (scaled ~240x240)
logo_og = logo.copy()
logo_og.thumbnail((260, 260), Image.Resampling.LANCZOS)
logo_x = (og_width - logo_og.width) // 2
logo_y = 70
og.paste(logo_og, (logo_x, logo_y), logo_og)

# Fonts
try:
    font_brand = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 52)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
    font_domain = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
except Exception:
    font_brand = font_sub = font_badge = font_domain = ImageFont.load_default()

# Title text: GemoStone
brand_text = "GemoStone"
brand_bbox = draw.textbbox((0, 0), brand_text, font=font_brand)
brand_w = brand_bbox[2] - brand_bbox[0]
draw.text(((og_width - brand_w) // 2, 345), brand_text, fill=(255, 255, 255, 255), font=font_brand)

# Tagline text
tagline = "Certified Rudraksha, Pyrite & Spiritual Gemstones"
tagline_bbox = draw.textbbox((0, 0), tagline, font=font_sub)
tagline_w = tagline_bbox[2] - tagline_bbox[0]
draw.text(((og_width - tagline_w) // 2, 415), tagline, fill=(255, 255, 255, 240), font=font_sub)

# Trust badges
badges_text = "100% Lab Certified  •  Siddha Energized  •  By AstroVedansh"
badge_bbox = draw.textbbox((0, 0), badges_text, font=font_badge)
badge_w = badge_bbox[2] - badge_bbox[0]
draw.text(((og_width - badge_w) // 2, 465), badges_text, fill=(255, 243, 224, 255), font=font_badge)

# Domain Pill at bottom
domain_text = "https://gemostone.com"
domain_bbox = draw.textbbox((0, 0), domain_text, font=font_domain)
domain_w = domain_bbox[2] - domain_bbox[0]
pill_x1 = (og_width - domain_w) // 2 - 24
pill_y1 = 520
pill_x2 = (og_width + domain_w) // 2 + 24
pill_y2 = 565
draw.rounded_rectangle([pill_x1, pill_y1, pill_x2, pill_y2], radius=22, fill=(255, 255, 255, 255))
draw.text(((og_width - domain_w) // 2, 530), domain_text, fill=(255, 109, 28, 255), font=font_domain)

og_rgb = og.convert("RGB")
og_public_path = os.path.join(public_dir, "og-image.png")
og_app_path = os.path.join(app_dir, "opengraph-image.png")
og_rgb.save(og_public_path, "PNG")
og_rgb.save(og_app_path, "PNG")
print(f"Saved matched OG Image Cover Banner to {og_public_path} and {og_app_path}")
