#!/usr/bin/env python3
"""Run CMS sync on production server."""
import os
from pathlib import Path
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
key = Path.home() / ".ssh" / "id_ed25519"
password = os.environ.get("DEPLOY_PASSWORD")
try:
    ssh.connect("173.212.240.38", username="root", key_filename=str(key), timeout=30)
except Exception:
    ssh.connect("173.212.240.38", username="root", password=password, timeout=30)

for cmd in [
    "cd /var/www/hivandanoc && node scripts/seed-doctors-from-json.js",
    "cd /var/www/hivandanoc && node scripts/sync-lang-to-db.js",
    "curl -s 'https://healthyspinedoc.com/api/v1/public/content?lang=hy' | python3 -c \"import sys,json;d=json.load(sys.stdin);print([x.get('name') for x in d.get('doctors',[])])\"",
]:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(">", cmd)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(err)
ssh.close()
