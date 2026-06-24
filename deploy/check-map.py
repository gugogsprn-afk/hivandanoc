#!/usr/bin/env python3
import json, urllib.request, re

h = urllib.request.urlopen('https://healthyspinedoc.com/data/hospital.embed.js').read().decode()
m = re.search(r'window\.__HOSPITAL_BASE__\s*=\s*(\{.*\});', h, re.S)
if m:
    data = json.loads(m.group(1))
    hosp = data.get('hospital', {})
    print('embed hospital:', {k: hosp.get(k) for k in ['address','mapsQuery','mapLat','mapLng']})

c = json.loads(urllib.request.urlopen('https://healthyspinedoc.com/api/v1/public/content?lang=hy').read().decode())
hosp2 = c.get('hospital', {})
print('cms hospital:', {k: hosp2.get(k) for k in ['address','mapsQuery','mapLat','mapLng']})

# test embed url
lat, lng = 40.2074194, 44.4782661
url = f'https://maps.google.com/maps?q={lat},{lng}&z=17&output=embed'
print('embed url', url)
r = urllib.request.urlopen(url)
print('google status', r.status, 'final', r.geturl()[:120])
