import { useLayoutEffect, useRef, useState } from 'react';

import classes from './index.module.css';

interface ChildProps {
  onOptimalSizeChange?: (size: number) => void;
}

interface Props {
  children: (props: ChildProps) => React.ReactNode;
}

const WheelFlexboxAutosizer = ({ children }: Props) => {
  const [optimalSize, setOptimalSize] = useState<number | undefined>();
  const previousHeight = useRef<number | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.flexBasis = optimalSize ? `${optimalSize}px` : '100%';
    }
  }, [optimalSize]);

  const handleSetOptimalSize = (size: number) => {
    setOptimalSize(size);
    if (containerRef.current) {
      containerRef.current.style.flexBasis = `${size}px`;
    }
  };

  useLayoutEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      if (previousHeight.current && previousHeight.current !== height) {
        setOptimalSize(undefined);
        containerRef.current.style.flexBasis = '100%';
      }
      previousHeight.current = height;
    }
  });

  return (
    <div ref={containerRef} className={classes.wheelFlexboxAutosizer}>
      {children({ onOptimalSizeChange: handleSetOptimalSize })}
    </div>
  );
};

export default WheelFlexboxAutosizer;
