import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildElectron } from './bundle.mjs';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const backendOrigin = process.env.DESKTOP_BACKEND_ORIGIN?.trim() || 'https://pointauc.com';
const publicOrigin = process.env.DESKTOP_PUBLIC_ORIGIN?.trim() || 'https://pointauc.com';

const executeCommand = (command, commandArguments, customEnvironment = process.env) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, commandArguments, {
      cwd: rootDirectory,
      stdio: 'inherit',
      shell: true,
      env: customEnvironment,
    });

    childProcess.on('error', reject);
    childProcess.on('exit', (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${commandArguments.join(' ')} exited with code ${exitCode}`));
    });
  });
};

console.log('Building Vite client for desktop application...');
await executeCommand('pnpm', ['run', 'build:client']);

console.log('Compiling Electron main and preload bundles...');
await buildElectron({
  'process.env.DESKTOP_BACKEND_ORIGIN': JSON.stringify(backendOrigin),
  'process.env.DESKTOP_PUBLIC_ORIGIN': JSON.stringify(publicOrigin),
});

const applicationDirectory = path.join(rootDirectory, 'dist-electron/app');
fs.rmSync(applicationDirectory, { recursive: true, force: true });
fs.mkdirSync(applicationDirectory, { recursive: true });

fs.copyFileSync(
  path.join(rootDirectory, 'electron/dist/main.cjs'),
  path.join(applicationDirectory, 'main.cjs'),
);
fs.copyFileSync(
  path.join(rootDirectory, 'electron/dist/preload.cjs'),
  path.join(applicationDirectory, 'preload.cjs'),
);

const sourceIconPath = path.join(rootDirectory, 'electron/icon.ico');
const targetAppIconPath = path.join(applicationDirectory, 'icon.ico');
if (fs.existsSync(sourceIconPath)) {
  fs.copyFileSync(sourceIconPath, targetAppIconPath);
}

fs.cpSync(path.join(rootDirectory, 'dist'), path.join(applicationDirectory, 'dist'), { recursive: true });
fs.rmSync(path.join(applicationDirectory, 'dist/server'), { recursive: true, force: true });

const rootPackageJson = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'package.json'), 'utf8'));
fs.writeFileSync(
  path.join(applicationDirectory, 'package.json'),
  JSON.stringify(
    {
      name: 'pointauc',
      version: rootPackageJson.version,
      private: true,
      description: 'Pointauc desktop client',
      author: 'Pointauc',
      main: 'main.cjs',
    },
    null,
    2,
  ),
);

console.log('Packaging desktop application with electron-builder...');
await executeCommand(
  'pnpm',
  ['exec', 'electron-builder', '--win', 'nsis', '--x64', '--config', 'electron-builder.yml', '--publish', 'never'],
  {
    ...process.env,
    CSC_IDENTITY_AUTO_DISCOVERY: 'false',
  },
);
