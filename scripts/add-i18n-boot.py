#!/usr/bin/env python3
"""Inject i18n anti-flash boot into public HTML pages."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VER = "20260718"
EMBED_VER = "20260718"

INLINE_PENDING = """    <script>(function(){var c=['hy','ru','en'],l='hy',k='gkb_lang';try{var s=localStorage.getItem(k);if(s&&c.indexOf(s)>=0)l=s;}catch(e){}try{var q=new URLSearchParams(location.search).get('lang');if(q&&c.indexOf(q)>=0)l=q;}catch(e){}document.documentElement.lang=l;document.documentElement.classList.add('i18n-pending');})();</script>"""

HEAD_EMBEDS = f"""    <script src="lang/hy.embed.js?v={EMBED_VER}"></script>
    <script src="lang/ru.embed.js?v={EMBED_VER}"></script>
    <script src="lang/en.embed.js?v={EMBED_VER}"></script>
    <script src="js/i18n-boot.js?v={VER}"></script>"""

EMBED_BLOCK_RE = re.compile(
    r"\s*<script src=\"lang/hy\.embed\.js[^\"]*\"></script>\s*"
    r"<script src=\"lang/ru\.embed\.js[^\"]*\"></script>\s*"
    r"<script src=\"lang/en\.embed\.js[^\"]*\"></script>\s*",
    re.MULTILINE,
)


def fix_page(path: Path) -> bool:
    if "admin" in path.parts:
        return False
    text = path.read_text(encoding="utf-8")
    if "js/i18n.js" not in text and "js/common.js" not in text:
        return False
    orig = text

    if "i18n-pending" not in text and "<head>" in text:
        text = text.replace("<head>", "<head>\n" + INLINE_PENDING, 1)

    if "js/i18n-boot.js" not in text:
        if "</head>" in text:
            text = text.replace("</head>", HEAD_EMBEDS + "\n</head>", 1)
        else:
            return False

    text = EMBED_BLOCK_RE.sub("\n", text)
    text = re.sub(r"(js/i18n-boot\.js)\?v=\d+", rf"\1?v={VER}", text)
    text = re.sub(r"(js/i18n\.js)\?v=\d+", rf"\1?v={VER}", text)
    text = re.sub(r"(lang/hy\.embed\.js)\?v=\d+", rf"\1?v={EMBED_VER}", text)
    text = re.sub(r"(lang/ru\.embed\.js)\?v=\d+", rf"\1?v={EMBED_VER}", text)
    text = re.sub(r"(lang/en\.embed\.js)\?v=\d+", rf"\1?v={EMBED_VER}", text)

    # Neutral placeholders instead of English fallbacks
    replacements = [
        (">Find a Doctor<", ">—<"),
        (">Qualified specialists in spine, joints, and musculoskeletal rehabilitation.<", ">—<"),
        (">Patient Care &amp; Services<", ">—<"),
        (">Comprehensive rehabilitation and treatment programs for spine and joint care.<", ">—<"),
        (">About Healthy Spine<", ">—<"),
        (">Healthy Spine — Medical Rehabilitation Center<", ">—<"),
        ("><strong>Spine and joint rehabilitation in Yerevan</strong><", ">—<"),
        (">Contact<", ">—<"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    count = 0
    for path in sorted(ROOT.glob("*.html")):
        if fix_page(path):
            print("updated", path.name)
            count += 1
    print(f"Done ({count} pages)")


if __name__ == "__main__":
    main()
