import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const electronOutputDirectory = path.join(rootDirectory, 'electron/dist');

export const createElectronBuildOptions = (defineOverrides = {}) => ({
  entryPoints: {
    main: path.join(rootDirectory, 'electron/main.ts'),
    preload: path.join(rootDirectory, 'electron/preload.ts'),
  },
  bundle: true,
  platform: 'node',
  target: 'node22',
  outdir: electronOutputDirectory,
  external: ['electron'],
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
  sourcemap: Object.keys(defineOverrides).length === 0,
  define: defineOverrides,
  logLevel: 'info',
});

export const buildElectron = (defineOverrides) => esbuild.build(createElectronBuildOptions(defineOverrides));

const checkIsDirectRun = () => {
  return Boolean(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url));
};

if (checkIsDirectRun()) {
  await buildElectron();
}
