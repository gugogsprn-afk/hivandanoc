#!/usr/bin/env python3
import paramiko
from pathlib import Path

host = "173.212.240.38"
key = Path.home() / ".ssh" / "id_ed25519"
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username="root", key_filename=str(key), timeout=60)

cmds = [
    "grep -n 'api-submit' /var/www/hivandanoc/appointment.html",
    "grep -c 'typeof window.FORM_API_BASE' /var/www/hivandanoc/js/api-submit.js || true",
    "grep -c 'Уведомления не настроены' /var/www/hivandanoc/js/api-submit.js || true",
    "ls -la /var/www/hivandanoc/js/api-submit.js /var/www/hivandanoc/appointment.html",
    "find /var/www -name appointment.html 2>/dev/null",
]
for cmd in cmds:
    print("===", cmd)
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("ERR:", err)
ssh.close()
