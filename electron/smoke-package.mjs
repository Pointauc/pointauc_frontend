import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executablePath = path.join(rootDirectory, 'release/win-unpacked/Pointauc.exe');

if (!fs.existsSync(executablePath)) {
  console.error(`Packaged executable not found at ${executablePath}`);
  process.exit(1);
}

console.log(`Starting packaged desktop smoke test: ${executablePath}`);

const child = spawn(executablePath, [], {
  cwd: rootDirectory,
  env: {
    ...process.env,
    DESKTOP_SMOKE: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  stdout += text;
  process.stdout.write(text);
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  stderr += text;
  process.stderr.write(text);
});

const timeoutMilliseconds = 45000;
const timeoutId = setTimeout(() => {
  console.error(`Smoke test timed out after ${timeoutMilliseconds / 1000}s`);
  child.kill();
  process.exit(1);
}, timeoutMilliseconds);

child.on('error', (error) => {
  clearTimeout(timeoutId);
  console.error('Failed to spawn packaged desktop executable:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  clearTimeout(timeoutId);
  const combinedOutput = `${stdout}\n${stderr}`;
  const isOk = code === 0 && combinedOutput.includes('DESKTOP_SMOKE_OK');

  if (isOk) {
    console.log('Packaged desktop smoke test succeeded.');
    process.exit(0);
  } else {
    console.error(`Packaged desktop smoke test failed with exit code ${code}.`);
    process.exit(1);
  }
});
