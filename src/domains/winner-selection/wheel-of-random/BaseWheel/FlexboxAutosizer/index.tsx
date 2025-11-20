import { useCallback, useLayoutEffect, useRef } from 'react';

import classes from './index.module.css';

interface ChildProps {
  onOptimalSizeChange?: (size: number) => void;
}

interface Props {
  children: (props: ChildProps) => React.ReactNode;
}

const getMinWidth = (element: Element): number => {
  return parseFloat(getComputedStyle(element).minWidth);
};

const WheelFlexboxAutosizer = ({ children }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticContainerRef = useRef<HTMLDivElement>(null);

  const getAvailableSpace = (): number => {
    const parent = containerRef.current?.parentElement;
    const fullWidth = parent?.clientWidth || 0;
    if (!containerRef.current) return fullWidth;

    const siblings = parent?.children;

    if (!siblings) return fullWidth;

    const siblingsWidth = Array.from(siblings).reduce((acc, sibling) => acc + (getMinWidth(sibling) || 0), 0);
    const gap = parseFloat(getComputedStyle(parent).gap);
    return fullWidth - siblingsWidth - gap * (siblings.length - 1);
  };

  const getWheelSize = useCallback(() => {
    if (!containerRef.current) return;
    const availableSpace = getAvailableSpace();
    const wheelSize = Math.min(availableSpace, containerRef.current.clientHeight - 20 - 38);
    return wheelSize;
  }, []);

  const updateWheelSize = useCallback(() => {
    if (!containerRef.current) return;
    const wheelSize = getWheelSize();
    containerRef.current.style.flexBasis = `${wheelSize}px`;
  }, [getWheelSize]);

  useLayoutEffect(() => {
    if (containerRef.current && staticContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        updateWheelSize();
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef, updateWheelSize]);

  return (
    <div ref={containerRef} className={classes.flexibleContainer}>
      <div ref={staticContainerRef} className={classes.wheelStaticContainer}>
        {children({})}
      </div>
    </div>
  );
};

export default WheelFlexboxAutosizer;
