#!/usr/bin/env python3
"""Build a complete, checked staging artifact from this staging worktree."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.staging-build'
SITE = OUT / 'site'
subprocess.run(['python3', 'staging/isolate.py', '--check'], cwd=ROOT, check=True)
if SITE.exists():
    raise SystemExit('Build exists; preserve it or remove only this generated artifact explicitly before rebuilding.')
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=ROOT).split(b'\0')
manifest = []
for raw in sorted(p for p in paths if p):
    name = raw.decode('utf-8')
    if name.startswith(('tests/', 'docs/')) or name in ('.gitignore', 'AGENTS.md') or (name.startswith('staging/') and name != 'staging/guard.js'):
        continue
    src = ROOT / name
    if not src.is_file() or src.is_symlink():
        raise SystemExit(f'Unsafe or missing input: {name}')
    dest = SITE / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    digest = hashlib.sha256(dest.read_bytes()).hexdigest()
    manifest.append({'path': name, 'sha256': digest, 'bytes': dest.stat().st_size})
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
base = subprocess.check_output(['git', 'merge-base', 'HEAD', 'origin/main'], cwd=ROOT, text=True).strip()
dirty = bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=ROOT, text=True).strip())
metadata = {'base_commit': base, 'source_commit': head, 'source_worktree_dirty': dirty, 'note': 'File hashes capture actual preview inputs.', 'files': manifest}
(OUT / 'manifest.json').write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Staging artifact: {SITE}\nFiles: {len(manifest)}\nBase: {base}\nSource: {head}\nManifest: {OUT / "manifest.json"}')
