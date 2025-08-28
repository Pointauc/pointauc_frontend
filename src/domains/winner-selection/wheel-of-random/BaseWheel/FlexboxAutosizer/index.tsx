import { useLayoutEffect, useRef } from 'react';

import classes from './index.module.css';

interface ChildProps {
  onOptimalSizeChange?: (size: number) => void;
}

interface Props {
  children: (props: ChildProps) => React.ReactNode;
}

const WheelFlexboxAutosizer = ({ children }: Props) => {
  const optimalSize = useRef<number | undefined>();
  const previousHeight = useRef<number | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.flexBasis = optimalSize.current ? `${optimalSize.current}px` : '100%';
    }
  }, []);

  const handleSetOptimalSize = (size: number) => {
    optimalSize.current = size;
    if (containerRef.current) {
      containerRef.current.style.flexBasis = `${size}px`;
    }
  };

  useLayoutEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current) return;
        const height = containerRef.current?.clientHeight;
        const isWheelSizeIncreased =
          height > (previousHeight.current ?? Infinity) && height > (optimalSize.current ?? Infinity);
        if (isWheelSizeIncreased && containerRef.current) {
          optimalSize.current = undefined;
          containerRef.current.style.flexBasis = '100%';
        }
        previousHeight.current = height;
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef]);

  return (
    <div ref={containerRef} className={classes.wheelFlexboxAutosizer}>
      {children({ onOptimalSizeChange: handleSetOptimalSize })}
    </div>
  );
};

export default WheelFlexboxAutosizer;
