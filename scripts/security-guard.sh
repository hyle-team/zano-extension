#!/usr/bin/env bash
#
# Security pattern guard for Zano Companion.
# Fails if known trust-boundary footguns reappear in src/. These map to the
# 1.2.1 security fix: a web page must never be able to impersonate the
# extension's own UI, and the localhost gate must be an exact host check.
#
# Run locally:  bash scripts/security-guard.sh   (or: npm run security:guard)
#
set -euo pipefail
cd "$(dirname "$0")/.."

files=$(find src -type f \( -name '*.ts' -o -name '*.tsx' \))
fail=0

# Drop matches whose code portion (after "file:line:") is a comment.
strip_comments() { grep -vE '^[^:]*:[0-9]+:[[:space:]]*(//|\*|/\*)' || true; }

forbid() { # label, ERE pattern, advice
	local label="$1" pattern="$2" advice="$3" hits
	hits=$(printf '%s\n' "$files" | xargs grep -nE "$pattern" 2>/dev/null | strip_comments || true)
	if [ -n "$hits" ]; then
		echo "FAIL: $label"
		echo "$hits" | sed 's/^/    /'
		echo "    -> $advice"
		echo
		fail=1
	fi
}

require() { # label, file, ERE pattern
	local label="$1" file="$2" pattern="$3"
	if ! grep -qE "$pattern" "$file" 2>/dev/null; then
		echo "FAIL: $label"
		echo "    expected /$pattern/ in $file"
		echo
		fail=1
	fi
}

echo "Running security pattern guard..."
echo

# --- Forbidden patterns (the bugs fixed in 1.2.1) -------------------------
forbid "Extension-UI check must compare origins, not substring-match a URL" \
	'\.includes\([[:space:]]*chrome\.runtime\.getURL' \
	"Use isExtensionFrontend(): a web page can put the extension id in its own URL, so substring matching is forgeable."

forbid "Do not substring-match trust fields on the message sender" \
	'sender\.(url|origin)\.includes\(' \
	"Compare parsed origins (isExtensionFrontend), not substrings of sender.url/origin."

forbid "Localhost gate must be an exact loopback host check, not a prefix" \
	'\.startsWith\([^)]*http://localhost' \
	"Use isSecureOrigin(): startsWith('http://localhost') also admits http://localhost.evil.com."

# --- Required gates (don't silently remove the trust boundary) ------------
require "Frontend trust gate present in permission middleware" \
	src/app/utils/permission.ts 'isExtensionFrontend'
require "Frontend trust gate present in background worker" \
	src/background/background.ts 'isExtensionFrontend'
require "SELF_ONLY_REQUESTS gate present in background worker" \
	src/background/background.ts 'SELF_ONLY_REQUESTS'

if [ "$fail" -ne 0 ]; then
	echo "Security guard FAILED. See findings above."
	exit 1
fi
echo "Security guard passed."
