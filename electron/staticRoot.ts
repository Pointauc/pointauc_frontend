import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';

import { checkIsSmoke } from './desktopEnv';

export const resolveStaticRoot = (): string => {
  const distRoot = path.join(app.getAppPath(), 'dist');
  if (fs.existsSync(path.join(distRoot, 'index.html'))) {
    return distRoot;
  }

  if (!checkIsSmoke()) {
    throw new Error('Missing Vite client build at dist/index.html');
  }

  const smokeRoot = path.join(app.getPath('temp'), 'pointauc-desktop-smoke');
  fs.mkdirSync(smokeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(smokeRoot, 'index.html'),
    '<!doctype html><html><head><meta charset="utf-8"><title>Pointauc</title></head><body>smoke</body></html>',
  );
  return smokeRoot;
};
