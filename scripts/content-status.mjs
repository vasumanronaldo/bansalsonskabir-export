#!/usr/bin/env node
/**
 * pnpm content:status            report on client content
 * pnpm content:status --strict   exit 1 if anything is unapproved or has [TK]
 *
 * Reads content/client/*. JSON files use `_approved` / `_needs`.
 * Markdown files use YAML front matter `approved:` / `needs:`.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// resolve relative to the repo root so this works from any cwd
const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'client');
const strict = process.argv.includes('--strict');

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  amber: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function parse(file) {
  const raw = readFileSync(join(DIR, file), 'utf8');
  const tk = (raw.match(/\[TK\]/g) || []).length;

  if (file.endsWith('.json')) {
    const j = JSON.parse(raw);
    return { file, approved: j._approved === true, needs: j._needs || [], tk };
  }

  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return { file, approved: false, needs: ['missing front matter'], tk };

  const approved = /^approved:\s*true\s*$/m.test(fm[1]);
  const needsLine = fm[1].match(/^needs:\s*\[(.*)\]\s*$/m);
  const needs = needsLine
    ? needsLine[1].split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  return { file, approved, needs, tk };
}

const files = readdirSync(DIR)
  .filter((f) => (f.endsWith('.json') || f.endsWith('.md')) && f !== 'README.md')
  .sort();

const rows = files.map(parse);

console.log('');
console.log(c.bold('  Client content status'));
console.log(c.dim('  ─────────────────────────────────────────────────────────────'));

for (const r of rows) {
  const mark = r.approved ? c.green('  approved') : c.amber('  DRAFT   ');
  const tk = r.tk ? c.red(`  ${r.tk} × [TK]`) : '';
  console.log(`${mark}  ${r.file.padEnd(22)}${tk}`);
  if (!r.approved && r.needs.length) {
    console.log(c.dim(`             needs: ${r.needs.join(', ')}`));
  }
}

const draft = rows.filter((r) => !r.approved);
const totalTk = rows.reduce((n, r) => n + r.tk, 0);

console.log(c.dim('  ─────────────────────────────────────────────────────────────'));
console.log(
  `  ${rows.length - draft.length}/${rows.length} approved` +
    (totalTk ? c.red(`   ·   ${totalTk} unfilled [TK] markers`) : '')
);

if (totalTk) {
  console.log(c.dim('  find them:  grep -rn "\\[TK\\]" content/client'));
}
console.log('');

if (strict && (draft.length || totalTk)) {
  console.error(
    c.red('  Blocked: unapproved content or unfilled [TK] markers. Not safe to publish.\n')
  );
  process.exit(1);
}
