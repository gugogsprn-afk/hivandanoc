#!/usr/bin/env python3
"""Pull site files from production server into local workspace."""
from __future__ import annotations

import os
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parent.parent
REMOTE_DIR = "/var/www/hivandanoc"
SKIP_EXTRACT = {".env", "node_modules", ".git"}


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


def should_skip_member(name: str) -> bool:
    parts = Path(name).parts
    if parts and parts[0] in SKIP_EXTRACT:
        return True
    return any(part in SKIP_EXTRACT for part in parts)


def pull() -> None:
    remote_archive = "/tmp/hivandanoc-pull.tar.gz"
    print(f"==> Creating archive on server: {REMOTE_DIR}")
    ssh = connect()
    cmd = (
        f"cd {REMOTE_DIR} && "
        "tar --exclude=node_modules --exclude=.git -czf "
        f"{remote_archive} ."
    )
    stdin, stdout, stderr = ssh.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    err = stderr.read().decode()
    if code != 0:
        raise RuntimeError(f"Remote tar failed ({code}): {err}")

    tmp = tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False)
    tmp.close()
    local_archive = Path(tmp.name)
    try:
        print(f"==> Downloading {remote_archive}")
        sftp = ssh.open_sftp()
        sftp.get(remote_archive, str(local_archive))
        sftp.close()
        ssh.exec_command(f"rm -f {remote_archive}")
        ssh.close()

        print(f"==> Extracting into {ROOT}")
        with tarfile.open(local_archive, "r:gz") as tar:
            for member in tar.getmembers():
                if should_skip_member(member.name):
                    continue
                tar.extract(member, path=ROOT)
        print("==> Pull complete")
    finally:
        local_archive.unlink(missing_ok=True)


if __name__ == "__main__":
    pull()
