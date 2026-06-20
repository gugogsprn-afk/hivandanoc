#!/usr/bin/env python3
"""Check domain DNS and HTTPS on production."""
import os
import socket
import ssl
import urllib.request
from pathlib import Path

import paramiko

DOMAIN = "healthyspinedoc.com"
SERVER_IP = "173.212.240.38"


def connect():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    key = Path.home() / ".ssh" / "id_ed25519"
    ssh.connect(SERVER_IP, username="root", key_filename=str(key), timeout=60)
    return ssh


def main():
    try:
        ip = socket.gethostbyname(DOMAIN)
        print(f"DNS {DOMAIN} -> {ip}")
    except Exception as e:
        print(f"DNS error: {e}")
        ip = None

    for url in [
        f"https://{DOMAIN}/",
        f"https://{DOMAIN}/api/health",
        f"https://www.{DOMAIN}/",
    ]:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "deploy-check"})
            with urllib.request.urlopen(req, timeout=15) as r:
                print(f"{url} -> {r.status}")
        except Exception as e:
            print(f"{url} -> {e}")

    ssh = connect()
    for cmd in [
        "ls -la /etc/letsencrypt/live/healthyspinedoc.com/ 2>/dev/null || echo NO_CERT",
        "nginx -t 2>&1",
        "curl -s -o /dev/null -w '%{http_code}' https://healthyspinedoc.com/",
        "curl -s https://healthyspinedoc.com/api/health",
    ]:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(">", cmd)
        print(stdout.read().decode())
    ssh.close()


if __name__ == "__main__":
    main()
