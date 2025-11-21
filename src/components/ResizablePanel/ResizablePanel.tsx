import { FC, MouseEvent, ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import './ResizablePanel.scss';
import { IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import classNames from 'classnames';
import { Alert, Box, Flex, Group, Paper, Text, Title, Transition } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

import { DragPosition, Size } from '@models/common.model.ts';

import Resizer from './Resizer/Resizer';
import styles from './ResizablePanel.module.css';

const scaleY = {
  in: { opacity: 1, transform: 'scaleY(1)', height: 'auto' },
  out: { opacity: 0, transform: 'scaleY(0)', height: 0 },
  common: { transformOrigin: 'top' },
  transitionProperty: 'transform, opacity, height',
};

interface ResizablePanelProps {
  initialSize: Size;
  title: ReactNode;
  onResize?: (size: Size) => void;
  onClose: () => void;
  children: ReactNode;
  contentRef?: RefObject<HTMLDivElement | null>;
  contentClassName?: string;
}

const ResizablePanel: FC<ResizablePanelProps> = ({
  children,
  initialSize,
  title,
  onClose,
  onResize,
  contentRef,
  contentClassName,
}) => {
  const { t } = useTranslation();
  const [mouseOffset, setMouseOffset] = useState<DragPosition>();
  const container = useRef<HTMLDivElement>(null);
  const [hasSeenDescription, setHasSeenDescription] = useState(
    () => localStorage.getItem('hasSeenResizablePanelDescription') === 'true',
  );

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
      onResize?.({ width, height });
    },
    [onResize],
  );

  const closeDescription = useCallback(() => {
    setHasSeenDescription(true);
    localStorage.setItem('hasSeenResizablePanelDescription', 'true');
  }, []);

  return (
    <Paper
      className={classNames(styles.root, { interaction: !!mouseOffset })}
      ref={container}
      radius='md'
      shadow='lg'
      withBorder
    >
      <Box className={styles.header} onMouseDown={handleMouseDown}>
        <Group align='center' justify='space-between' w='100%'>
          {title}
          <IconButton onClick={onClose} className='resizable-panel-close' title='Закрыть' size='large'>
            <CloseIcon />
          </IconButton>
        </Group>
      </Box>
      <div className={classNames('resizable-panel-content', contentClassName)} ref={contentRef}>
        <Transition mounted={!hasSeenDescription} transition='fade' duration={200}>
          {(styles) => (
            <Alert
              icon={<InfoOutlineIcon />}
              variant='light'
              onClose={closeDescription}
              withCloseButton
              title={<Text size='md'>{t('resizablePanel.description')}</Text>}
              mb='lg'
              style={styles}
            />
          )}
        </Transition>
        {children}
      </div>
      <Resizer container={container} onResize={handleResize} />
    </Paper>
  );
};

export default ResizablePanel;
