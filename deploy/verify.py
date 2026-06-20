#!/usr/bin/env python3
"""Verify production site health from the server."""
import paramiko
from pathlib import Path

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
key = Path.home() / ".ssh" / "id_ed25519"
ssh.connect("173.212.240.38", username="root", key_filename=str(key), timeout=60)
for cmd in [
    'curl -s -o /dev/null -w "%{http_code}" -H "Host: 173.212.240.38" http://127.0.0.1/',
    'curl -s -H "Host: 173.212.240.38" http://127.0.0.1/api/health',
    "curl -s -o /dev/null -w '%{http_code}' http://173.212.240.38/",
    "curl -s http://173.212.240.38/api/health",
]:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(">", cmd)
    print(stdout.read().decode())
ssh.close()
