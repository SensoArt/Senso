#!/usr/bin/env python3
"""Serve the built artifact locally with staging security headers; no POST handler."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '.staging-build' / 'site'
sys.path.insert(0, str(ROOT / 'staging'))
from isolate import CSP

if not SITE.is_dir():
    raise SystemExit('Run python3 staging/build.py first')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)
    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow, noarchive')
        self.send_header('Content-Security-Policy', CSP)
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
print(f'Staging on http://127.0.0.1:{port}/', flush=True)
server.serve_forever()
