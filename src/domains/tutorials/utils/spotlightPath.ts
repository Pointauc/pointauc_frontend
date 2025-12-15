import { RefObject } from 'react';

export interface SpotlightCutout {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

const DEFAULT_SPOTLIGHT_PADDING = 8;
const DEFAULT_BORDER_RADIUS = 8;

/**
 * Calculate spotlight cutout dimensions for an element
 */
export function calculateSpotlightCutout(
  elementRef: RefObject<HTMLElement> | undefined,
  padding: number = DEFAULT_SPOTLIGHT_PADDING
): SpotlightCutout | null {
  if (!elementRef?.current) {
    return null;
  }

  const rect = elementRef.current.getBoundingClientRect();

  return {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    borderRadius: DEFAULT_BORDER_RADIUS,
  };
}

/**
 * Generate SVG path for spotlight overlay with cutout
 */
export function generateSpotlightPath(cutout: SpotlightCutout, viewportWidth: number, viewportHeight: number): string {
  const { x, y, width, height, borderRadius } = cutout;

  // Ensure cutout doesn't go outside viewport
  const clampedX = Math.max(0, x);
  const clampedY = Math.max(0, y);
  const clampedWidth = Math.min(width, viewportWidth - clampedX);
  const clampedHeight = Math.min(height, viewportHeight - clampedY);
  const clampedRadius = Math.min(borderRadius, clampedWidth / 2, clampedHeight / 2);

  // Create path for the entire viewport
  const viewportPath = `M 0 0 L ${viewportWidth} 0 L ${viewportWidth} ${viewportHeight} L 0 ${viewportHeight} Z`;

  // Create path for the cutout with rounded corners
  const cutoutPath = `
    M ${clampedX + clampedRadius} ${clampedY}
    L ${clampedX + clampedWidth - clampedRadius} ${clampedY}
    Q ${clampedX + clampedWidth} ${clampedY} ${clampedX + clampedWidth} ${clampedY + clampedRadius}
    L ${clampedX + clampedWidth} ${clampedY + clampedHeight - clampedRadius}
    Q ${clampedX + clampedWidth} ${clampedY + clampedHeight} ${clampedX + clampedWidth - clampedRadius} ${clampedY + clampedHeight}
    L ${clampedX + clampedRadius} ${clampedY + clampedHeight}
    Q ${clampedX} ${clampedY + clampedHeight} ${clampedX} ${clampedY + clampedHeight - clampedRadius}
    L ${clampedX} ${clampedY + clampedRadius}
    Q ${clampedX} ${clampedY} ${clampedX + clampedRadius} ${clampedY}
    Z
  `;

  // Combine paths (viewport minus cutout)
  return `${viewportPath} ${cutoutPath}`;
}

/**
 * Generate CSS clip-path for spotlight (alternative to SVG)
 */
export function generateClipPath(cutout: SpotlightCutout, viewportWidth: number, viewportHeight: number): string {
  const { x, y, width, height } = cutout;

  // Use polygon to create a cutout effect
  // This creates a path around the viewport excluding the cutout area
  return `polygon(
    0% 0%,
    0% 100%,
    ${x}px 100%,
    ${x}px ${y}px,
    ${x + width}px ${y}px,
    ${x + width}px ${y + height}px,
    ${x}px ${y + height}px,
    ${x}px 100%,
    100% 100%,
    100% 0%
  )`;
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(elementRef: RefObject<HTMLElement> | undefined): boolean {
  if (!elementRef?.current) {
    return false;
  }

  const rect = elementRef.current.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Scroll element into view if not visible
 */
export function scrollElementIntoView(elementRef: RefObject<HTMLElement> | undefined): void {
  if (!elementRef?.current) {
    return;
  }

  elementRef.current.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
}

