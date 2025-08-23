import { CanvasResolutionDto, TransformDto } from '@api/openapi/types.gen';

export interface ResolutionOption {
  label: string;
  value: CanvasResolutionDto;
}

export const CANVAS_RESOLUTIONS: ResolutionOption[] = [
  {
    label: 'HD (1280×720)',
    value: { width: 1280, height: 720 },
  },
  {
    label: 'Laptop (1366×768)',
    value: { width: 1366, height: 768 },
  },
  {
    label: 'Full HD (1920×1080)',
    value: { width: 1920, height: 1080 },
  },
  {
    label: 'QHD 2K (2560×1440)',
    value: { width: 2560, height: 1440 },
  },
  {
    label: 'Ultra Wide QHD (3440×1440)',
    value: { width: 3440, height: 1440 },
  },
  {
    label: '4K UHD (3840×2160)',
    value: { width: 3840, height: 2160 },
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
    console.log('resolution', resolution.value.width, resolution.value.height, screenWidth, screenHeight);
    if (resolution.value.width === screenWidth && resolution.value.height === screenHeight) {
      console.log('resolution selected', resolution.value);
      return resolution.value;
    }
  }

  // Fallback to Full HD if no resolution fits
  return CANVAS_RESOLUTIONS[2].value;
};

/**
 * Finds a resolution option by its dimensions
 */
export const findResolutionOption = (canvasResolution: CanvasResolutionDto): ResolutionOption | undefined => {
  return CANVAS_RESOLUTIONS.find(
    (option) => option.value.width === canvasResolution.width && option.value.height === canvasResolution.height,
  );
};

interface BuildTransformProps {
  canvasResolution: CanvasResolutionDto;
  padding?: number;
}

export const buildTransform = ({ canvasResolution, padding: customPadding }: BuildTransformProps): TransformDto => {
  const padding = customPadding ?? Math.min(canvasResolution.width, canvasResolution.height) * 0.05;
  const width = canvasResolution.width - padding * 2;
  const height = canvasResolution.height - padding * 2;

  return {
    origin: {
      X: padding,
      Y: padding,
    },
    size: {
      width,
      height,
    },
  };
};
