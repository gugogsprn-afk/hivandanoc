#!/usr/bin/env python3
"""Deploy hivandanoc to production (Windows + Linux)."""
from __future__ import annotations

import os
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parent.parent
REMOTE_DIR = "/var/www/hivandanoc"

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "legacy",
    "__pycache__",
    ".cursor",
}
EXCLUDE_FILES = {
    ".env",
}
EXCLUDE_SUFFIXES = {".bat", ".vbs"}
EXCLUDE_PREFIXES = (
    "data/cms/cms.db",
    "data/cms/cms.db-wal",
    "data/cms/cms.db-shm",
    "data/cms/uploads/",
    "data/cms/published/",
)


def should_skip(rel: str) -> bool:
    parts = Path(rel).parts
    if parts and parts[0] in EXCLUDE_DIRS:
        return True
    if any(part in EXCLUDE_DIRS for part in parts):
        return True
    name = Path(rel).name
    if name in EXCLUDE_FILES:
        return True
    if any(name.endswith(s) for s in EXCLUDE_SUFFIXES):
        return True
    normalized = rel.replace("\\", "/")
    return any(normalized.startswith(p) for p in EXCLUDE_PREFIXES)


def create_archive() -> Path:
    tmp = tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False)
    tmp.close()
    archive = Path(tmp.name)
    with tarfile.open(archive, "w:gz") as tar:
        for path in ROOT.rglob("*"):
            rel = path.relative_to(ROOT).as_posix()
            if should_skip(rel):
                continue
            tar.add(path, arcname=rel)
    return archive


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


def run(ssh: paramiko.SSHClient, cmd: str) -> None:
    print(f"==> {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    if out:
        print(out, end="" if out.endswith("\n") else "\n")
    if err:
        print(err, end="" if err.endswith("\n") else "\n", file=sys.stderr)
    if code != 0:
        raise RuntimeError(f"Command failed ({code}): {cmd}")


def deploy() -> None:
    print(f"==> Packaging {ROOT}")
    archive = create_archive()
    remote_archive = "/tmp/hivandanoc-deploy.tar.gz"
    try:
        ssh = connect()
        sftp = ssh.open_sftp()
        print(f"==> Uploading to {remote_archive}")
        sftp.put(str(archive), remote_archive)
        sftp.close()

        run(ssh, f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_archive} -C {REMOTE_DIR}")
        run(ssh, f"rm -f {remote_archive}")

        run(
            ssh,
            f"cd {REMOTE_DIR} && npm ci --omit=dev && "
            "(command -v pm2 >/dev/null || npm install -g pm2) && "
            "pm2 delete hivandanoc-api 2>/dev/null || true && "
            "HOST=127.0.0.1 PORT=8765 NODE_ENV=production pm2 start server/index.js --name hivandanoc-api && "
            "pm2 save",
        )

        run(
            ssh,
            f"cp {REMOTE_DIR}/deploy/nginx-production.conf /etc/nginx/sites-available/hivandanoc && "
            "ln -sf /etc/nginx/sites-available/hivandanoc /etc/nginx/sites-enabled/hivandanoc && "
            "rm -f /etc/nginx/sites-enabled/default && "
            "nginx -t && systemctl reload nginx",
        )

        run(ssh, "curl -s http://127.0.0.1:8765/api/health || true")
        ssh.close()
        print("==> Deploy complete")
        print("    Site: https://healthyspinedoc.com/")
        print("    API:  https://healthyspinedoc.com/api/health")
        print("    IP:   http://173.212.240.38/")
    finally:
        archive.unlink(missing_ok=True)


if __name__ == "__main__":
    deploy()
