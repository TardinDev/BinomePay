"""Génère tous les PNG nécessaires pour Expo et Play Store."""
import cairosvg
import os

os.makedirs("assets", exist_ok=True)
os.makedirs("playstore", exist_ok=True)

# Configuration des exports
exports = [
    # Expo assets
    ("svg/logo-static.svg", "assets/icon.png", 1024, 1024),
    ("svg/logo-adaptive-foreground.svg", "assets/adaptive-icon.png", 1024, 1024),
    ("svg/logo-splash.svg", "assets/splash.png", 2048, 2048),
    ("svg/logo-static.svg", "assets/favicon.png", 196, 196),

    # Play Store
    ("svg/logo-static.svg", "playstore/icon-playstore-512.png", 512, 512),
    ("svg/logo-static.svg", "playstore/icon-playstore-1024.png", 1024, 1024),

    # Notification icon (Android) - blanc sur transparent recommandé mais on garde le style
    ("svg/logo-static.svg", "assets/notification-icon.png", 96, 96),

    # Preview pour la doc
    ("svg/logo-static.svg", "assets/logo-preview.png", 512, 512),
]

for src, dst, w, h in exports:
    cairosvg.svg2png(url=src, write_to=dst, output_width=w, output_height=h)
    size_kb = os.path.getsize(dst) / 1024
    print(f"  ✓ {dst} ({w}x{h}) — {size_kb:.1f} KB")

print("\nTous les assets PNG générés avec succès.")
