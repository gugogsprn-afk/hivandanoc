#!/usr/bin/env python3
"""Upload local .env to production server."""
from __future__ import annotations

import os
import sys
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parent.parent
REMOTE_DIR = "/var/www/hivandanoc"


def connect() -> paramiko.SSHClient:
    host = os.environ.get("DEPLOY_HOST", "173.212.240.38")
    user = os.environ.get("DEPLOY_USER", "root")
    password = os.environ.get("DEPLOY_PASSWORD")
    key_path = os.environ.get("DEPLOY_SSH_KEY", str(Path.home() / ".ssh" / "id_ed25519"))

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    if Path(key_path).exists():
        try:
            ssh.connect(host, username=user, key_filename=key_path, timeout=60)
            return ssh
        except paramiko.AuthenticationException:
            if not password:
                raise

    if not password:
        raise RuntimeError("SSH key auth failed and DEPLOY_PASSWORD is not set")
    ssh.connect(host, username=user, password=password, timeout=60)
    return ssh


def main() -> None:
    env_file = ROOT / ".env"
    if not env_file.exists():
        print(f"ERROR: {env_file} not found. Copy from .env.example and fill values.")
        sys.exit(1)

    ssh = connect()
    sftp = ssh.open_sftp()
    sftp.put(str(env_file), f"{REMOTE_DIR}/.env")
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command(
        f"chmod 600 {REMOTE_DIR}/.env && cd {REMOTE_DIR} && pm2 restart hivandanoc-api && sleep 2 && curl -s http://127.0.0.1:8765/api/health"
    )
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(err, file=sys.stderr)
    ssh.close()
    print("==> .env uploaded and API restarted")


if __name__ == "__main__":
    main()
