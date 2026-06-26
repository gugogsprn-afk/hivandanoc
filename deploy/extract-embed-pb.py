#!/usr/bin/env python3
"""Extract Google Maps embed pb URL for clinic place."""
import re
import urllib.parse
import urllib.request

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
}

URL = "https://www.google.com/maps/place/6+Margaryan+St,+Yerevan+0078,+Armenia/@40.2074194,44.4782661,17z"


def main() -> None:
    req = urllib.request.Request(URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        html = r.read().decode("utf-8", "replace")
        final = r.geturl()
    print("final url:", final[:200])

    embeds = re.findall(r"https://www\\.google\\.com/maps/embed\\?pb=[^\"'\\s&]+", html)
    print("embed urls found:", len(embeds))
    for e in embeds[:3]:
        print(" ", e[:120], "...")

    place_ids = re.findall(r"0x[0-9a-fA-F]+:0x[0-9a-fA-F]+", html)
    print("hex place ids:", place_ids[:5])

    chij = re.findall(r"ChIJ[\w-]+", html)
    print("ChIJ ids:", chij[:5])

    # pb fragments inside escaped JSON
    pb_raw = re.findall(r"!1m18[^\"'\\]+", html)
    print("pb fragments:", len(pb_raw))
    for p in pb_raw[:2]:
        pb = p.split("\\")[0]
        embed = f"https://www.google.com/maps/embed?pb={urllib.parse.quote(pb, safe='!$()*+,;:@/?')}"
        print("generated:", embed[:180], "...")

    if embeds:
        print("\nBEST:", embeds[0])

    if place_ids:
        pid = place_ids[0]
        lat, lng = 40.2074194, 44.4782661
        q = "6 Margaryan St, Yerevan 0078, Armenia"
        addr = urllib.parse.quote(q)
        pb = (
            f"!1m18!1m12!1m3!1d3041.8!2d{lng}!3d{lat}"
            f"!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s{pid}!2s{addr}"
            f"!5e0!3m2!1sru!2sam!4v1719792000000!5m2!1sru!2sam"
        )
        print("\nPLACE_ID PB:", f"https://www.google.com/maps/embed?pb={pb}"[:200], "...")


if __name__ == "__main__":
    main()
