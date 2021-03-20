import React, { FC, MouseEvent, MutableRefObject, useCallback, useEffect, useState } from 'react';
import './Resizer.scss';
import { TRAILER_MIN_SIZE } from '../../../constants/common.constants';
import { Size } from '../../../models/common.model';

interface ResizerProps {
  container: MutableRefObject<HTMLDivElement | null>;
  onResize: (size: Size) => void;
}

const Resizer: FC<ResizerProps> = ({ container, onResize }) => {
  const [mouseOffset, setMouseOffset] = useState<{ bottom: number; right: number }>();

  const handleMouseDown = useCallback(() => {
    if (container.current) {
      const { bottom, right } = container.current.getBoundingClientRect();

      container.current.classList.add('interaction');
      setMouseOffset({ bottom, right });
    }
  }, [container]);
  const handleMouseUp = useCallback(() => {
    setMouseOffset(undefined);

    if (container.current) {
      container.current.classList.remove('interaction');
    }
  }, [container]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (mouseOffset && container.current) {
        const width = Math.max(e.pageX - container.current.offsetLeft, TRAILER_MIN_SIZE.width);
        const height = Math.max(e.pageY - container.current.offsetTop, TRAILER_MIN_SIZE.height);

        container.current.style.width = `${width}px`;
        container.current.style.height = `${height}px`;

        onResize({ width, height });
      }
    },
    [container, mouseOffset, onResize],
  );

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove as any);

    return (): void => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div role="button" className="resizer" onMouseDown={handleMouseDown} tabIndex={0}>
      <div className="resizer-icon" />
    </div>
  );
};

export default Resizer;
