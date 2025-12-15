import { useEffect, useState } from 'react';

import { HighlightStyle } from '@domains/tutorials/models/tutorial.model';
import { calculateSpotlightCutout, generateSpotlightPath, SpotlightCutout } from '@domains/tutorials/utils/spotlightPath';

import styles from './SpotlightOverlay.module.css';

interface SpotlightOverlayProps {
  elementRef: React.RefObject<HTMLElement> | undefined;
  highlightStyle: HighlightStyle;
  onOverlayClick?: () => void;
}

function SpotlightOverlay({ elementRef, highlightStyle, onOverlayClick }: SpotlightOverlayProps) {
  const [cutout, setCutout] = useState<SpotlightCutout | null>(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (highlightStyle.type !== 'spotlight') {
      setCutout(null);
      return;
    }

    const updateCutout = () => {
      const newCutout = calculateSpotlightCutout(elementRef, highlightStyle.spotlightPadding);
      setCutout(newCutout);
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateCutout();

    // Update on scroll and resize
    window.addEventListener('scroll', updateCutout, true);
    window.addEventListener('resize', updateCutout);

    return () => {
      window.removeEventListener('scroll', updateCutout, true);
      window.removeEventListener('resize', updateCutout);
    };
  }, [elementRef, highlightStyle.type, highlightStyle.spotlightPadding]);

  if (!cutout || highlightStyle.type !== 'spotlight') {
    return null;
  }

  const svgPath = generateSpotlightPath(cutout, viewportSize.width, viewportSize.height);

  const handleClick = (e: React.MouseEvent) => {
    // Check if click is outside the cutout area
    const clickX = e.clientX;
    const clickY = e.clientY;

    const isOutsideCutout =
      clickX < cutout.x ||
      clickX > cutout.x + cutout.width ||
      clickY < cutout.y ||
      clickY > cutout.y + cutout.height;

    if (isOutsideCutout && onOverlayClick) {
      onOverlayClick();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClick}>
      <svg
        className={styles.svg}
        width={viewportSize.width}
        height={viewportSize.height}
        xmlns='http://www.w3.org/2000/svg'
      >
        <path d={svgPath} fill='rgba(0, 0, 0, 0.7)' fillRule='evenodd' />
      </svg>
    </div>
  );
}

export default SpotlightOverlay;

