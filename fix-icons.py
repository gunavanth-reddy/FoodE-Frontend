
from PIL import Image
from pathlib import Path

res = Path("android/app/src/main/res")

sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, size in sizes.items():
    path = res / folder / "ic_launcher.png"

    if not path.exists():
        print(f"Missing: {path}")
        continue

    try:
        with Image.open(path) as img:
            img.load()
            img = img.convert("RGBA")
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            img.save(path, format="PNG", optimize=True)

        print(f"Fixed: {path} ({size}x{size})")

    except Exception as e:
        print(f"Error: {path}: {e}")
