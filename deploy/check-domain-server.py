#!/usr/bin/env python3
"""Server-side domain and SSL checks."""
import os
from pathlib import Path

import paramiko

SERVER_IP = "173.212.240.38"


def connect():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    key = Path.home() / ".ssh" / "id_ed25519"
    password = os.environ.get("DEPLOY_PASSWORD")
    if Path(key).exists():
        try:
            ssh.connect(SERVER_IP, username="root", key_filename=str(key), timeout=30)
            return ssh
        except paramiko.AuthenticationException:
            pass
    if password:
        ssh.connect(SERVER_IP, username="root", password=password, timeout=30)
        return ssh
    raise RuntimeError("Cannot connect to server")


def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(">", cmd)
    if out:
        print(out)
    if err:
        print(err)


def main():
    ssh = connect()
    for cmd in [
        "certbot certificates 2>/dev/null | sed -n '1,20p'",
        "grep -r server_name /etc/nginx/sites-enabled/ 2>/dev/null",
        "curl -s -o /dev/null -w '%{http_code}' https://healthyspinedoc.com/",
        "curl -s https://healthyspinedoc.com/api/health",
        "curl -s -o /dev/null -w '%{http_code}' -L https://www.healthyspinedoc.com/ || echo www-fail",
        "dig +short www.healthyspinedoc.com A",
        "dig +short healthyspinedoc.com A",
    ]:
        run(ssh, cmd)
    ssh.close()


if __name__ == "__main__":
    main()
