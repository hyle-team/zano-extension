#!/usr/bin/env node
//
// Generic, dependency-free security pattern guard.
//
// Reads `security-guard.config.json` from the repo root and fails (exit 1) if:
//   - any `forbid` regex matches a non-comment line in the scanned files, or
//   - any `require` regex is missing from its target file.
//
// Drop this file + a config into any repo to get a regression guard for that
// repo's known footguns. No dependencies.
//
// Run locally:  node scripts/security-guard.mjs   (or: npm run security:guard)
//
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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
const skipDirs = new Set(['node_modules', '.git', 'build', 'dist', ...(cfg.scan?.ignore ?? [])]);

function walk(dir, acc) {
	for (const name of readdirSync(dir)) {
		if (skipDirs.has(name)) continue;
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) walk(p, acc);
		else if (exts.includes(extname(name))) acc.push(p);
	}
	return acc;
}

const files = [];
for (const r of roots) {
	const abs = join(root, r);
	if (existsSync(abs)) walk(abs, files);
}

// Cache file contents once.
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
	const ok = existsSync(target) && new RegExp(rule.pattern).test(readFileSync(target, 'utf8'));
	if (!ok) fail(rule.label, [`expected /${rule.pattern}/ in ${rule.file}`]);
}

if (failed) {
	console.log('Security guard FAILED. See findings above.');
	process.exit(1);
}
console.log(`Security guard passed (${files.length} files scanned).`);
