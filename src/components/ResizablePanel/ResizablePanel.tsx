import React, { FC, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import './ResizablePanel.scss';
import { IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames';
import Resizer from './Resizer/Resizer';
import { DragPosition, Size } from '../../models/common.model';

interface ResizablePanelProps {
  initialSize: Size;
  title: string;
  onResize: (size: Size) => void;
  onClose: () => void;
}

const ResizablePanel: FC<ResizablePanelProps> = ({ children, initialSize, title, onClose, onResize }) => {
  const [mouseOffset, setMouseOffset] = useState<DragPosition>();
  const container = useRef<HTMLDivElement>(null);

  const setContainerSize = useCallback(({ width, height }: Size) => {
    if (container.current) {
      container.current.style.width = `${width}px`;
      container.current.style.height = `${height}px`;
    }
  }, []);

  useEffect(() => {
    setContainerSize(initialSize);
  }, [initialSize, setContainerSize]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (container.current) {
      const { left, top } = container.current.getBoundingClientRect();

      setMouseOffset({ left: e.pageX - left, top: e.pageY - top });
    }
  }, []);
  const handleMouseUp = useCallback(() => {
    setMouseOffset(undefined);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (mouseOffset && container.current) {
        const { width, height } = container.current.getBoundingClientRect();
        const {
          screen: { width: screenWidth, height: screenHeight },
        } = window;
        const offsetLeft = e.pageX - mouseOffset.left;
        const offsetTop = e.pageY - mouseOffset.top;
        const left = screenWidth > offsetLeft + width ? Math.max(offsetLeft, 0) : screenWidth - width;
        const top = screenHeight > offsetTop + height ? Math.max(offsetTop, 0) : screenHeight - height;

        container.current.style.left = `${left}px`;
        container.current.style.top = `${top}px`;
      }
    },
    [mouseOffset],
  );

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove as any);

    return (): void => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleResize = useCallback(
    ({ width, height }: Size) => {
      onResize({ width, height });
    },
    [onResize],
  );

  return (
    <div className={classNames('resizable-panel', { interaction: !!mouseOffset })} ref={container}>
      <Typography role="button" className="resizable-panel-header" onMouseDown={handleMouseDown} variant="h5">
        {`Трейлер: ${title}`}
        <IconButton onClick={onClose} className="resizable-panel-close" title="Закрыть">
          <CloseIcon />
        </IconButton>
      </Typography>
      <div className="resizable-panel-content">{children}</div>
      <Resizer container={container} onResize={handleResize} />
    </div>
  );
};

export default ResizablePanel;
