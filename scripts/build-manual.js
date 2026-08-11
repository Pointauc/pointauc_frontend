#!/usr/bin/env node

/* eslint-env node */

import { spawnSync } from 'node:child_process';

/**
 * Reproduces the production workflow's local build steps while keeping the
 * environment values from the root .env file available to every child process.
 */
const runCommand = (command, argumentsList, useShell = false) => {
  const result = spawnSync(command, argumentsList, {
    shell: useShell,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const runPackageScript = (argumentsList) => {
  if (process.platform === 'win32') {
    runCommand('cmd.exe', ['/d', '/s', '/c', [packageManager, ...argumentsList].join(' ')], false);
    return;
  }

  runCommand(packageManager, argumentsList);
};

runPackageScript(['build:ssg']);
runCommand(process.execPath, ['scripts/generate-source-hashes.js']);
runPackageScript(['docs:build']);
