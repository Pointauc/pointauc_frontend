import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

import * as esbuild from 'esbuild';

import { createElectronBuildOptions } from './bundle.mjs';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nodeRequire = createRequire(import.meta.url);
const electronBinaryPath = nodeRequire('electron');
const developmentUrl = 'http://localhost:3000';

let isStopping = false;
let isRestarting = false;
let electronChildProcess = null;
let viteServerInstance = null;
let esbuildBuildContext = null;

const stopElectronProcess = () => {
  if (!electronChildProcess || electronChildProcess.exitCode !== null) {
    return;
  }

  isRestarting = true;
  electronChildProcess.kill();
};

const startElectronProcess = () => {
  if (isStopping) {
    return;
  }

  stopElectronProcess();
  const environmentVariables = { ...process.env };
  delete environmentVariables.ELECTRON_RUN_AS_NODE;

  electronChildProcess = spawn(electronBinaryPath, ['.'], {
    cwd: rootDirectory,
    stdio: 'inherit',
    env: environmentVariables,
  });

  electronChildProcess.on('exit', (exitCode) => {
    if (isRestarting) {
      isRestarting = false;
      return;
    }

    if (!isStopping) {
      void shutdownProcess(exitCode ?? 0);
    }
  });
};

const shutdownProcess = async (exitCode) => {
  if (isStopping) {
    return;
  }

  isStopping = true;
  stopElectronProcess();
  await viteServerInstance?.close();
  await esbuildBuildContext?.dispose();
  process.exit(exitCode);
};

process.on('SIGINT', () => {
  void shutdownProcess(0);
});

process.on('SIGTERM', () => {
  void shutdownProcess(0);
});

let isViteReady = false;

esbuildBuildContext = await esbuild.context({
  ...createElectronBuildOptions(),
  plugins: [
    {
      name: 'restart-electron-on-build',
      setup(build) {
        build.onEnd((result) => {
          if (isStopping || result.errors.length > 0 || !isViteReady) {
            return;
          }

          startElectronProcess();
        });
      },
    },
  ],
});

await esbuildBuildContext.watch();

viteServerInstance = await createServer({
  configFile: path.join(rootDirectory, 'vite.config.ts'),
  clearScreen: false,
  server: {
    open: false,
    port: 3000,
    strictPort: true,
  },
});

await viteServerInstance.listen();
isViteReady = true;

console.log(`Pointauc desktop development server running: ${developmentUrl}`);
startElectronProcess();
