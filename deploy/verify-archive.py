#!/usr/bin/env python3
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from deploy import create_archive, ROOT
import tarfile

archive = create_archive()
with tarfile.open(archive, 'r:gz') as tar:
    for name in ['appointment.html', 'js/api-submit.js', 'js/api-config.js']:
        try:
            m = tar.getmember(name)
            f = tar.extractfile(m)
            data = f.read().decode('utf-8', 'replace')
            print('===', name, '===')
            if name.endswith('.html'):
                for line in data.splitlines():
                    if 'api-submit' in line or 'api-config' in line:
                        print(line.strip())
            else:
                print('OLD', 'Уведомления не настроены' in data)
                print('NEW', 'typeof window.FORM_API_BASE' in data)
        except KeyError:
            print('MISSING', name)
archive.unlink()
