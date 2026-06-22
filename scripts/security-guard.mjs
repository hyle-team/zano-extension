#!/usr/bin/env node
//
// Generic, dependency-free security pattern guard.
//
// Reads `security-guard.config.json` from the repo root and fails (exit 1) if:
//   - any `forbid` regex matches a non-comment line in the scanned files, or
//   - any `require` regex is missing from a non-comment line of its target file.
//
// This is a REGRESSION TRIPWIRE for known footguns, not a security analysis:
// regex matching is evadable and `require` only proves a symbol appears on a
// code line, not that it is wired into the control flow. Pair it with real SAST
// (CodeQL/Semgrep) and the AI review.
//
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const root = process.cwd();
const configPath = join(root, 'security-guard.config.json');

if (!existsSync(configPath)) {
	console.log('No security-guard.config.json at repo root — nothing to check.');
	process.exit(0);
}

const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
const roots = cfg.scan?.roots ?? ['src'];
const exts = cfg.scan?.extensions ?? ['.ts', '.tsx'];
const skipDirs = new Set([
	'node_modules', '.git', 'build', 'dist', '.ci-security',
	...(cfg.scan?.ignore ?? []),
]);

// lstat (do NOT follow symlinks): a symlink can escape the repo root or form a
// cycle. Skip symlinked entries entirely.
function walk(dir, acc) {
	for (const name of readdirSync(dir)) {
		if (skipDirs.has(name)) continue;
		const p = join(dir, name);
		let st;
		try {
			st = lstatSync(p);
		} catch {
			continue;
		}
		if (st.isSymbolicLink()) continue;
		if (st.isDirectory()) walk(p, acc);
		else if (st.isFile() && exts.includes(extname(name))) acc.push(p);
	}
	return acc;
}

const files = [];
for (const r of roots) {
	const abs = join(root, r);
	if (existsSync(abs) && !lstatSync(abs).isSymbolicLink()) walk(abs, files);
}

const contents = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));
const isComment = (line) => /^\s*(\/\/|\*|\/\*)/.test(line);

let failed = false;
const fail = (label, lines) => {
	failed = true;
	console.log(`FAIL: ${label}`);
	for (const l of lines) console.log('    ' + l);
	console.log();
};

for (const rule of cfg.forbid ?? []) {
	const re = new RegExp(rule.pattern);
	const hits = [];
	for (const f of files) {
		contents.get(f).split('\n').forEach((line, i) => {
			if (!isComment(line) && re.test(line)) {
				hits.push(`${relative(root, f)}:${i + 1}: ${line.trim()}`);
			}
		});
	}
	if (hits.length) fail(rule.label, rule.advice ? [...hits, `-> ${rule.advice}`] : hits);
}

for (const rule of cfg.require ?? []) {
	const target = join(root, rule.file);
	const re = new RegExp(rule.pattern);
	// Must match a NON-comment line — a comment that merely mentions the symbol
	// must not satisfy the rule (that is the whole point of `require`).
	const ok =
		existsSync(target) &&
		readFileSync(target, 'utf8').split('\n').some((line) => !isComment(line) && re.test(line));
	if (!ok) fail(rule.label, [`expected /${rule.pattern}/ on a code line in ${rule.file}`]);
}

if (failed) {
	console.log('Security guard FAILED. See findings above.');
	process.exit(1);
}
console.log(`Security guard passed (${files.length} files scanned).`);
