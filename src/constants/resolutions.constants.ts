import { CanvasResolutionDto } from '@api/openapi/types.gen';

export interface ResolutionOption {
  label: string;
  value: CanvasResolutionDto;
  aspectRatio: number;
}

export const CANVAS_RESOLUTIONS: ResolutionOption[] = [
  {
    label: 'Laptop (1366×768)',
    value: { width: 1366, height: 768 },
    aspectRatio: 1366 / 768,
  },
  {
    label: 'Full HD (1920×1080)',
    value: { width: 1920, height: 1080 },
    aspectRatio: 1920 / 1080,
  },
  {
    label: 'QHD 2K (2560×1440)',
    value: { width: 2560, height: 1440 },
    aspectRatio: 2560 / 1440,
  },
  {
    label: 'Ultra Wide QHD (3440×1440)',
    value: { width: 3440, height: 1440 },
    aspectRatio: 3440 / 1440,
  },
  {
    label: '4K UHD (3840×2160)',
    value: { width: 3840, height: 2160 },
    aspectRatio: 3840 / 2160,
  },
];

/**
 * Detects the default canvas resolution based on user's screen size
 */
export const detectDefaultResolution = (): CanvasResolutionDto => {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  // Find the closest resolution that fits the user's screen
  for (const resolution of CANVAS_RESOLUTIONS) {
    if (resolution.value.width <= screenWidth && resolution.value.height <= screenHeight) {
      return resolution.value;
    }
  }

  // Fallback to Full HD if no resolution fits
  return CANVAS_RESOLUTIONS[1].value;
};

/**
 * Finds a resolution option by its dimensions
 */
export const findResolutionOption = (canvasResolution: CanvasResolutionDto): ResolutionOption | undefined => {
  return CANVAS_RESOLUTIONS.find(
    (option) => option.value.width === canvasResolution.width && option.value.height === canvasResolution.height,
  );
};
