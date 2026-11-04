#!/usr/bin/env python3
"""Apply and audit staging-only safeguards. Never run this on a production branch."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
MOCK = '/__senso_staging_mock__/form'
CSP = "form-action 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'"
MARKER = '<meta name="senso-staging-only" content="do-not-publish-to-production">'
PROTECTION = MARKER + '\n<meta http-equiv="Content-Security-Policy" content="' + CSP + '">\n<script src="/staging/guard.js"></script>'
ENDPOINT = re.compile(r'https://formspree\.io/f/[A-Za-z0-9]+', re.I)

def pages():
    result = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=ROOT)
    return sorted(ROOT / p.decode() for p in result.split(b'\0') if p.endswith(b'.html'))

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else '--check'
    if mode not in ('--apply', '--check'):
        raise SystemExit('Use --apply or --check')
    branch = subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip()
    if not branch.startswith('staging/'):
        raise SystemExit('Refusing to operate outside a staging/ branch')
    errors, form_count = [], 0
    headers = (ROOT / '_headers').read_text(encoding='utf-8')
    if 'X-Robots-Tag: noindex, nofollow, noarchive' not in headers or 'Content-Security-Policy: ' + CSP not in headers:
        errors.append('_headers: missing unconditional noindex or staging CSP')
    if not (ROOT / 'staging' / 'guard.js').is_file():
        errors.append('staging/guard.js missing')
    for path in pages():
        text = path.read_text(encoding='utf-8')
        if mode == '--apply':
            text = ENDPOINT.sub(MOCK, text)
            if MARKER not in text:
                text, count = re.subn(r'(<head(?:\s[^>]*)?>)', lambda m: m.group(1) + '\n' + PROTECTION, text, count=1, flags=re.I)
                if count != 1:
                    raise SystemExit(f'Missing or ambiguous head in {path.relative_to(ROOT)}')
            path.write_text(text, encoding='utf-8')
        form_count += len(re.findall(r'<form\b', text, re.I))
        if MARKER not in text or PROTECTION not in text or ENDPOINT.search(text):
            errors.append(str(path.relative_to(ROOT)))
        for tag in re.findall(r'<form\b[^>]*>', text, re.I | re.S):
            action = re.search(r'\baction\s*=\s*["\']([^"\']*)', tag, re.I)
            if action and re.match(r'(?:https?:)?//', action.group(1), re.I):
                errors.append(f'{path.relative_to(ROOT)}: external form action')
    if errors:
        raise SystemExit('Unsafe or unprotected pages:\n' + '\n'.join(errors))
    print(f'Staging safeguards verified: {len(pages())} HTML pages, {form_count} forms; branch {branch}')

if __name__ == '__main__':
    main()
