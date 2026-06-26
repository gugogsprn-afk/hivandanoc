#!/usr/bin/env python3
"""Test address-based embed URLs."""
import urllib.request

TESTS = [
    "https://maps.google.com/maps?q=6+Margaryan+St,+Yerevan+0078,+Armenia&z=17&hl=ru&output=embed",
    "https://maps.google.com/maps?q=Healthy+Spine+6+Margaryan+Yerevan&z=17&output=embed",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3737.8!2d44.4782661!3d40.2074194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406aa2da86294267:0x3ebd491e4e41f40!2s6+Margaryan+St,+Yerevan+0078,+Armenia!5e0!3m2!1sru!2sam!4v1719792000000!5m2!1sru!2sam",
]

for url in TESTS:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        final = r.geturl()
    print("---")
    print("in:", url[:90])
    print("final:", final[:140])
    print("view-mode:", "!1m3!2m1" in final)
    print("place-mode:", "!1m18" in final)
