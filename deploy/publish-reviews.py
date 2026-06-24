#!/usr/bin/env python3
import paramiko
from pathlib import Path

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("173.212.240.38", username="root", key_filename=str(Path.home() / ".ssh" / "id_ed25519"), timeout=60)
cmds = [
    "sqlite3 /var/www/hivandanoc/data/cms/cms.db \"UPDATE testimonials SET published = 1 WHERE published = 0;\"",
    "curl -s 'http://127.0.0.1:8765/api/v1/public/reviews?lang=ru'",
    "grep -o 'reviews.html' /var/www/hivandanoc/js/common.js | head -1",
]
for cmd in cmds:
    print('===', cmd[:80])
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode())
ssh.close()
