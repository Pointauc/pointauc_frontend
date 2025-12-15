import { RefObject } from 'react';

import { AbsolutePosition, ElementRelativePosition, PredefinedPosition, RelativePosition, TutorialPosition } from '@domains/tutorials/models/tutorial.model';

export interface CalculatedPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
}

const POPUP_OFFSET = 16; // Default offset in pixels

/**
 * Calculate popup position based on predefined position
 */
function calculatePredefinedPosition(position: PredefinedPosition): CalculatedPosition {
  switch (position) {
    case 'center':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case 'top':
      return {
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    case 'bottom':
      return {
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
      };
    case 'right':
      return {
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
      };
  }
}

/**
 * Calculate popup position based on absolute position
 */
function calculateAbsolutePosition(position: AbsolutePosition): CalculatedPosition {
  return {
    top: position.top,
    bottom: position.bottom,
    left: position.left,
    right: position.right,
  };
}

/**
 * Calculate popup position relative to an element
 */
function calculateElementRelativePosition(
  config: ElementRelativePosition,
  elementRef: RefObject<HTMLElement> | undefined,
  popupWidth: number = 320,
  popupHeight: number = 200
): CalculatedPosition {
  if (!elementRef?.current) {
    // Fallback to center if element not found
    return calculatePredefinedPosition('center');
  }

  const rect = elementRef.current.getBoundingClientRect();
  const offsetX = config.offset?.x ?? POPUP_OFFSET;
  const offsetY = config.offset?.y ?? POPUP_OFFSET;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top: number;
  let left: number;

  // Calculate initial position based on relative position
  switch (config.relativePosition) {
    case 'top':
      top = rect.top - popupHeight - offsetY;
      left = rect.left + rect.width / 2 - popupWidth / 2;
      break;
    case 'bottom':
      top = rect.bottom + offsetY;
      left = rect.left + rect.width / 2 - popupWidth / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - popupHeight / 2;
      left = rect.left - popupWidth - offsetX;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - popupHeight / 2;
      left = rect.right + offsetX;
      break;
    case 'top-left':
      top = rect.top - popupHeight - offsetY;
      left = rect.left;
      break;
    case 'top-right':
      top = rect.top - popupHeight - offsetY;
      left = rect.right - popupWidth;
      break;
    case 'bottom-left':
      top = rect.bottom + offsetY;
      left = rect.left;
      break;
    case 'bottom-right':
      top = rect.bottom + offsetY;
      left = rect.right - popupWidth;
      break;
  }

  // Ensure popup stays within viewport bounds
  const padding = 10;
  
  if (left < padding) {
    left = padding;
  } else if (left + popupWidth > viewportWidth - padding) {
    left = viewportWidth - popupWidth - padding;
  }

  if (top < padding) {
    top = padding;
  } else if (top + popupHeight > viewportHeight - padding) {
    top = viewportHeight - popupHeight - padding;
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  };
}

/**
 * Calculate popup position based on tutorial position configuration
 */
export function calculatePopupPosition(
  position: TutorialPosition,
  elementRefs: Map<string, RefObject<HTMLElement>>,
  popupWidth?: number,
  popupHeight?: number
): CalculatedPosition {
  switch (position.type) {
    case 'predefined':
      return calculatePredefinedPosition(position.position);
    case 'absolute':
      return calculateAbsolutePosition(position.position);
    case 'element': {
      const elementRef = elementRefs.get(position.position.elementId);
      return calculateElementRelativePosition(position.position, elementRef, popupWidth, popupHeight);
    }
  }
}

/**
 * Get element bounding rect safely
 */
export function getElementRect(elementRef: RefObject<HTMLElement> | undefined): DOMRect | null {
  if (!elementRef?.current) {
    return null;
  }
  return elementRef.current.getBoundingClientRect();
}

