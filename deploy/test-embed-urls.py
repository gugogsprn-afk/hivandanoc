#!/usr/bin/env python3
"""Test Google Maps embed URL variants."""
import urllib.parse
import urllib.request

LAT, LNG = 40.2074194, 44.4782661
PID = "0x406aa2da86294267:0x3ebd491e4e41f40"
NAME = "6+Margaryan+St,+Yerevan+0078,+Armenia"

URLS = [
    f"https://maps.google.com/maps?q={LAT},{LNG}&z=17&output=embed",
    f"https://maps.google.com/maps?q={LAT},{LNG}+({urllib.parse.quote('Healthy Spine')})&z=17&output=embed",
    f"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3041.8!2d{LNG}!3d{LAT}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s{PID}!2s{NAME}!5e0!3m2!1sru!2sam!4v1719792000000!5m2!1sru!2sam",
    f"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3041.8!2d{LNG}!3d{LAT}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s{urllib.parse.quote(PID, safe='')}!2s{NAME}!5e0!3m2!1sru!2sam!4v1719792000000!5m2!1sru!2sam",
]

for url in URLS:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        final = r.geturl()
        body = r.read(800).decode("utf-8", "replace")
    print("---")
    print(url[:100], "...")
    print("final:", final[:130])
    print("has !1m18 in final:", "!1m18" in final)
    print("has !1m3 in final:", "!1m3!2m1" in final)
