#!/usr/bin/env python3
import re
import urllib.request

URL = "https://www.google.com/maps/place/6+Margaryan+St,+Yerevan+0078,+Armenia/@40.2074194,44.4782661,17z"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0"}

req = urllib.request.Request(URL, headers=HEADERS)
with urllib.request.urlopen(req, timeout=30) as r:
    html = r.read().decode("utf-8", "replace")

# All pb strings starting with !1m
matches = re.findall(r"!1m\d[^\\\"\']{80,500}", html)
print("matches", len(matches))
seen = set()
for m in matches:
    if m in seen:
        continue
    seen.add(m)
    if "406aa2" in m or "Margaryan" in m or "40.2074" in m:
        print("---")
        print(m[:400])

# escaped unicode
for m in re.findall(r"\\\\u0026pb=(!1m[^\\\\]+)", html):
    print("escaped pb", m[:200])
