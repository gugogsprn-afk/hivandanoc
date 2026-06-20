#!/usr/bin/env python3
"""Install local SSH public key on production server."""
import os
from pathlib import Path

import paramiko

pub = Path.home() / ".ssh" / "id_ed25519.pub"
if not pub.exists():
    raise SystemExit(f"Missing {pub}. Run: ssh-keygen -t ed25519")

key = pub.read_text().strip()
host = os.environ.get("DEPLOY_HOST", "173.212.240.38")
user = os.environ.get("DEPLOY_USER", "root")
password = os.environ.get("DEPLOY_PASSWORD")
key_path = os.environ.get("DEPLOY_SSH_KEY", str(Path.home() / ".ssh" / "id_ed25519"))

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
if Path(key_path).exists():
    try:
        ssh.connect(host, username=user, key_filename=key_path, timeout=60)
    except paramiko.AuthenticationException:
        if not password:
            raise
        ssh.connect(host, username=user, password=password, timeout=60)
elif password:
    ssh.connect(host, username=user, password=password, timeout=60)
else:
    raise SystemExit("Set DEPLOY_PASSWORD or configure SSH key first")

cmd = (
    "mkdir -p ~/.ssh && chmod 700 ~/.ssh && "
    f"grep -qxF '{key}' ~/.ssh/authorized_keys 2>/dev/null || "
    f"echo '{key}' >> ~/.ssh/authorized_keys && "
    "chmod 600 ~/.ssh/authorized_keys"
)
stdin, stdout, stderr = ssh.exec_command(cmd)
code = stdout.channel.recv_exit_status()
ssh.close()
if code != 0:
    raise SystemExit(stderr.read().decode() or f"exit {code}")
print("SSH key installed on server")
