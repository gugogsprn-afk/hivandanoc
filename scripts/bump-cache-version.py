#!/usr/bin/env python3
"""Bump cache-bust query params on script tags in HTML files."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION = "20260625"

for path in ROOT.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'(js/i18n\.js)\?v=\d+', rf'\1?v={VERSION}', text)
    text = re.sub(r'(js/common\.js)\?v=\d+', rf'\1?v={VERSION}', text)
    text = re.sub(r'(css/hospital-theme\.css)\?v=\d+', rf'\1?v={VERSION}', text)
    text = re.sub(r'(css/hss-spine\.css)\?v=\d+', rf'\1?v={VERSION}', text)
    text = re.sub(r'(lang/[a-z]{2}\.embed\.js)\?v=\d+', rf'\1?v={VERSION}', text)
    if "js/i18n.js" in text and f"js/i18n.js?v={VERSION}" not in text:
        text = text.replace('src="js/i18n.js"', f'src="js/i18n.js?v={VERSION}"')
    if "js/common.js" in text and f"js/common.js?v={VERSION}" not in text:
        text = text.replace('src="js/common.js"', f'src="js/common.js?v={VERSION}"')
    if "css/hospital-theme.css" in text and f"css/hospital-theme.css?v={VERSION}" not in text:
        text = text.replace('href="css/hospital-theme.css"', f'href="css/hospital-theme.css?v={VERSION}"')
    if "css/hss-spine.css" in text and f"css/hss-spine.css?v={VERSION}" not in text:
        text = text.replace('href="css/hss-spine.css"', f'href="css/hss-spine.css?v={VERSION}"')
    path.write_text(text, encoding="utf-8")
    print("updated", path.name)
