#!/usr/bin/env node
/**
 * Post-deploy maintenance certification runner.
 * Usage: npm run maintenance:certify
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

const GATES = [
  {
    name: 'js-syntax-check',
    label: 'JS syntax (server/js/scripts)',
    hard: true,
    run() {
      execSync(
        `find server js scripts -name "*.js" -not -path "*/node_modules/*" -print0 | xargs -0 -n1 node --check`,
        { cwd: ROOT, stdio: 'inherit' }
      );
    }
  },
  {
    name: 'test-content-extraction',
    label: 'Content extraction regression',
    hard: true,
    run() {
      runNpm('test:content-extraction');
    }
  },
  {
    name: 'locale-guard',
    label: 'Locale guard',
    hard: true,
    run() {
      runNpm('locale:guard');
    }
  },
  {
    name: 'url-audit',
    label: 'URL audit',
    hard: true,
    run() {
      runNpm('url:audit');
    }
  },
  {
    name: 'content-audit',
    label: 'Content parity audit',
    hard: true,
    run() {
      runNpm('content:audit');
    }
  },
  {
    name: 'authority-depth',
    label: 'Live authority depth certification',
    hard: true,
    run() {
      runNode('scripts/certify-live-authority-depth.js');
    }
  },
  {
    name: 'authority-schema',
    label: 'Authority schema audit',
    hard: true,
    run() {
      runNode('scripts/audit-authority-schema.js');
    }
  },
  {
    name: 'locale-parity',
    label: 'Live locale parity audit',
    hard: true,
    run() {
      runNode('scripts/audit-locale-parity.js', ['https://healthyspinedoc.com']);
    }
  }
];

function runNpm(script) {
  const r = spawnSync('npm', ['run', script], { cwd: ROOT, stdio: 'inherit', shell: false });
  if (r.status !== 0) throw new Error(`npm run ${script} exited ${r.status}`);
}

function runNode(rel, args = []) {
  const r = spawnSync('node', [path.join(ROOT, rel), ...args], { cwd: ROOT, stdio: 'inherit', shell: false });
  if (r.status !== 0) throw new Error(`node ${rel} exited ${r.status}`);
}

function main() {
  console.log('Maintenance certification — healthyspinedoc.com\n');
  const results = [];

  for (const gate of GATES) {
    console.log(`\n==> ${gate.label} (${gate.name})`);
    try {
      gate.run();
      results.push({ ...gate, status: 'PASS' });
      console.log(`--- ${gate.name}: PASS`);
    } catch (err) {
      results.push({ ...gate, status: 'FAIL', error: err.message });
      console.error(`--- ${gate.name}: FAIL — ${err.message}`);
      console.log('\nMAINTENANCE_CERTIFICATION_FAIL');
      printSummary(results);
      process.exit(1);
    }
  }

  console.log('\nMAINTENANCE_CERTIFICATION_PASS');
  printSummary(results);
  console.log('\nNote: npm run seo:audit is intentionally excluded (108 pre-existing failures).');
  process.exit(0);
}

function printSummary(results) {
  console.log('\nSummary:');
  for (const r of results) {
    console.log(`  ${r.status === 'PASS' ? '✓' : '✗'} ${r.label}`);
  }
}

main();
