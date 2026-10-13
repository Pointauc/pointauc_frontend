import fs from 'node:fs';
import path from 'node:path';

import { screen, type BrowserWindow, type Rectangle } from 'electron';

export interface SavedBounds extends Rectangle {
  isMaximized: boolean;
}

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;

const readBoundsFromFile = (filePath: string): SavedBounds | undefined => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent) as Partial<SavedBounds>;
    if (
      typeof parsedData.x !== 'number' ||
      typeof parsedData.y !== 'number' ||
      typeof parsedData.width !== 'number' ||
      typeof parsedData.height !== 'number' ||
      parsedData.width < 400 ||
      parsedData.height < 300
    ) {
      return undefined;
    }

    return {
      x: parsedData.x,
      y: parsedData.y,
      width: parsedData.width,
      height: parsedData.height,
      isMaximized: parsedData.isMaximized === true,
    };
  } catch {
    return undefined;
  }
};

export const checkIsOnScreen = (bounds: Rectangle): boolean => {
  return screen.getAllDisplays().some((display) => {
    const workArea = display.workArea;
    const hasHorizontalOverlap = bounds.x < workArea.x + workArea.width && bounds.x + bounds.width > workArea.x;
    const hasVerticalOverlap = bounds.y < workArea.y + workArea.height && bounds.y + bounds.height > workArea.y;
    return hasHorizontalOverlap && hasVerticalOverlap;
  });
};

export const resolveWindowBounds = (
  filePath: string,
): { x?: number; y?: number; width: number; height: number; isMaximized: boolean } => {
  const savedBounds = readBoundsFromFile(filePath);
  if (!savedBounds || !checkIsOnScreen(savedBounds)) {
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, isMaximized: false };
  }

  return savedBounds;
};

export const bindWindowBounds = (win: BrowserWindow, filePath: string): void => {
  const saveBounds = (): void => {
    if (win.isDestroyed()) {
      return;
    }

    const isMaximized = win.isMaximized();
    const bounds = isMaximized ? win.getNormalBounds() : win.getBounds();
    const payload: SavedBounds = { ...bounds, isMaximized };

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(payload));
    } catch {
      return;
    }
  };

  win.on('resized', saveBounds);
  win.on('moved', saveBounds);
  win.on('close', saveBounds);
};
