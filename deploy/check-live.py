#!/usr/bin/env python3
import urllib.request

urls = [
    'https://healthyspinedoc.com/appointment.html',
    'https://healthyspinedoc.com/js/api-submit.js',
    'https://healthyspinedoc.com/js/api-config.js',
]
for url in urls:
    t = urllib.request.urlopen(url).read().decode('utf-8', 'replace')
    print('===', url, '===')
    if 'appointment.html' in url:
        for line in t.splitlines():
            if 'api-submit' in line or 'api-config' in line:
                print(line.strip())
    else:
        print('len', len(t))
        print('OLD_MSG', 'Уведомления не настроены' in t)
        print('NEW_FIX', 'typeof window.FORM_API_BASE' in t)
        print('NEW_ERR', 'Сервер уведомлений недоступен' in t)
