#!/usr/bin/env python3
"""Find Google Maps embed pb URL for clinic address."""
import re
import urllib.parse
import urllib.request

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
}

URLS = [
    "https://www.google.com/maps/place/6+Margaryan+St,+Yerevan+0078,+Armenia/@40.2074194,44.4782661,17z",
    "https://www.google.com/maps/search/Healthy+Spine+6+Margaryan+Yerevan",
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as r:
        print("final:", r.geturl()[:140])
        return r.read().decode("utf-8", "replace")


def main() -> None:
    for url in URLS:
        print("===", url)
        html = fetch(url)
        for pat in [
            r"ChIJ[\w-]+",
            r"0x[0-9a-fA-F]+:0x[0-9a-fA-F]+",
            r"https://www\.google\.com/maps/embed\?pb=[^\"'\\s]+",
        ]:
            found = re.findall(pat, html)
            if found:
                print(pat, "=>", found[:2])
        print("len", len(html), "\n")

    lat, lng = 40.2074194, 44.4782661
    q = "6 Margaryan St, Yerevan 0078, Armenia"
    # pb template with encoded address in 1s/2s slots (place marker)
    addr_enc = urllib.parse.quote(q)
    pb = (
        "!1m18!1m12!1m3!1d3041.8!2d"
        f"{lng}!3d{lat}"
        "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s"
        f"{addr_enc}!2s{addr_enc}"
        "!5e0!3m2!1sru!2sam!4v1719792000000!5m2!1sru!2sam"
    )
    embed = f"https://www.google.com/maps/embed?pb={pb}"
    print("generated embed:", embed[:160], "...")
    req = urllib.request.Request(embed, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as r:
        print("status", r.status, "final", r.geturl()[:140])


if __name__ == "__main__":
    main()
