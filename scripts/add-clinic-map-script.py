#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VER = "20260712"

for path in ROOT.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    if "js/common.js" not in text:
        continue
    if "js/clinic-map.js" not in text:
        text = text.replace(
            '<script src="js/common.js',
            f'<script src="js/clinic-map.js?v={VER}"></script>\n    <script src="js/common.js',
        )
    text = re.sub(r"(js/clinic-map\.js)\?v=\d+", rf"\1?v={VER}", text)
    text = re.sub(r"(js/common\.js)\?v=\d+", rf"\1?v={VER}", text)
    text = re.sub(r"(js/contacts-map\.js)\?v=\d+", rf"\1?v={VER}", text)
    path.write_text(text, encoding="utf-8")
    print("updated", path.name)
