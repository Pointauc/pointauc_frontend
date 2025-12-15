import { useEffect, useState } from 'react';

import { HighlightStyle } from '@domains/tutorials/models/tutorial.model';
import { getElementRect } from '@domains/tutorials/utils/positionCalculator';

import styles from './ElementHighlighter.module.css';

interface ElementHighlighterProps {
  elementRef: React.RefObject<HTMLElement> | undefined;
  highlightStyle: HighlightStyle;
}

function ElementHighlighter({ elementRef, highlightStyle }: ElementHighlighterProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (highlightStyle.type === 'none' || !elementRef?.current) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const newRect = getElementRect(elementRef);
      setRect(newRect);
    };

    updateRect();

    // Update position on scroll and resize
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [elementRef, highlightStyle.type]);

  if (!rect || highlightStyle.type === 'none' || highlightStyle.type === 'spotlight') {
    return null;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    zIndex: 9998,
  };

  if (highlightStyle.type === 'outline') {
    style.border = `3px solid ${highlightStyle.outlineColor || 'var(--mantine-primary-color-filled)'}`;
    style.borderRadius = '8px';
  } else if (highlightStyle.type === 'background') {
    style.backgroundColor = highlightStyle.backgroundColor || 'rgba(66, 153, 225, 0.2)';
    style.borderRadius = '8px';
  }

  return (
    <div
      className={highlightStyle.type === 'outline' ? styles.outlineHighlight : styles.backgroundHighlight}
      style={style}
    />
  );
}

export default ElementHighlighter;

