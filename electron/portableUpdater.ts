import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

import { app, type BrowserWindow } from 'electron';

import { UPDATE_AVAILABLE_CHANNEL, UPDATE_DOWNLOADED_CHANNEL } from './channels';

const GITHUB_OWNER = 'Pointauc';
const GITHUB_REPO = 'pointauc_frontend';
const LATEST_YML_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/latest.yml`;
const LATEST_ASAR_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/app.asar`;

export const checkIsPortable = (): boolean => {
  if (process.env.POINTAUC_PORTABLE === '1') {
    return true;
  }

  const uninstallerPath = path.join(path.dirname(process.resourcesPath), 'Uninstall Pointauc.exe');
  return !fs.existsSync(uninstallerPath);
};

export const isNewerVersion = (remoteVersion: string, localVersion: string): boolean => {
  const clean = (v: string) =>
    v
      .trim()
      .replace(/^v/, '')
      .split('-')[0]
      .split('.')
      .map((n) => parseInt(n, 10) || 0);

  const [rMaj = 0, rMin = 0, rPatch = 0] = clean(remoteVersion);
  const [lMaj = 0, lMin = 0, lPatch = 0] = clean(localVersion);

  if (rMaj !== lMaj) {
    return rMaj > lMaj;
  }
  if (rMin !== lMin) {
    return rMin > lMin;
  }
  return rPatch > lPatch;
};

const resolveLatestVersionFromManifest = (manifestText: string): string | undefined => {
  const match = manifestText.match(/^version:\s*([^\r\n]+)/m);
  return match ? match[1].trim() : undefined;
};

export const applyPortableAsarUpdate = (): boolean => {
  const currentAsar = path.join(process.resourcesPath, 'app.asar');
  const newAsar = path.join(process.resourcesPath, 'app.asar.new');
  const exePath = app.getPath('exe');
  const appDirectory = path.dirname(exePath);

  if (!fs.existsSync(newAsar)) {
    return false;
  }

  const stat = fs.statSync(newAsar);
  if (stat.size < 1024 * 1024) {
    console.error('Downloaded app.asar.new is too small, aborting update.');
    try {
      fs.unlinkSync(newAsar);
    } catch {
      // Ignore cleanup error
    }
    return false;
  }

  const batchScriptPath = path.join(app.getPath('temp'), `pointauc-portable-update-${Date.now()}.bat`);
  const batchScriptContent = [
    '@echo off',
    'chcp 65001 >nul',
    'timeout /t 1 /nobreak >nul',
    ':retry',
    `del /f /q "${currentAsar}" >nul 2>&1`,
    `if exist "${currentAsar}" (`,
    '  timeout /t 1 /nobreak >nul',
    '  goto retry',
    ')',
    `move /y "${newAsar}" "${currentAsar}" >nul`,
    `start "" "${exePath}"`,
    '(goto) 2>nul & del "%~f0"',
  ].join('\r\n');

  fs.writeFileSync(batchScriptPath, batchScriptContent, 'utf8');

  spawn('cmd.exe', ['/c', batchScriptPath], {
    detached: true,
    stdio: 'ignore',
    cwd: appDirectory,
  }).unref();

  app.exit(0);
  return true;
};

export const checkForPortableUpdates = async (win: BrowserWindow): Promise<void> => {
  try {
    const manifestResponse = await fetch(LATEST_YML_URL, {
      headers: { 'User-Agent': `Pointauc-Desktop/${app.getVersion()}` },
      redirect: 'follow',
    });

    if (!manifestResponse.ok) {
      return;
    }

    const manifestText = await manifestResponse.text();
    const latestVersion = resolveLatestVersionFromManifest(manifestText);

    if (!latestVersion || !isNewerVersion(latestVersion, app.getVersion())) {
      return;
    }

    if (!win.isDestroyed()) {
      win.webContents.send(UPDATE_AVAILABLE_CHANNEL, { version: latestVersion });
    }

    const newAsarPath = path.join(process.resourcesPath, 'app.asar.new');
    const asarResponse = await fetch(LATEST_ASAR_URL, {
      headers: { 'User-Agent': `Pointauc-Desktop/${app.getVersion()}` },
      redirect: 'follow',
    });

    if (!asarResponse.ok || !asarResponse.body) {
      throw new Error(`Failed to download app.asar: ${asarResponse.status}`);
    }

    const fileStream = fs.createWriteStream(newAsarPath);
    const bodyStream = Readable.fromWeb(asarResponse.body as Parameters<typeof Readable.fromWeb>[0]);
    await finished(bodyStream.pipe(fileStream));

    if (!win.isDestroyed()) {
      win.webContents.send(UPDATE_DOWNLOADED_CHANNEL, { version: latestVersion });
    }
  } catch (err) {
    console.error('Portable autoUpdater check failed:', err);
  }
};
