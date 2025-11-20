import { Group, Paper, Stack, Title } from '@mantine/core';
import { FC, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuctionOverlayDto, WheelOverlayDto } from '@api/openapi/types.gen';

import AuctionOverlayPreview from '../../../Auction/ui/Preview/AuctionOverlayPreview';
import WheelOverlayPreview from '../../../Wheel/ui/Preview/WheelOverlayPreview';
import { Overlay } from '../../../model/overlay.types';

import CanvasResolutionSelector from './CanvasResolutionSelector/CanvasResolutionSelector';
import classes from './PreviewSection.module.css';
import ResizeController from './ResizeController';

interface PreviewSectionProps {
  overlay: Overlay;
  onTransformUpdate?: (transform: Overlay['transform']) => void;
}

interface FitInsideTheBoxParams {
  container: {
    width: number;
    height: number;
  };
  content: {
    width: number;
    height: number;
  };
}

const fitInsideTheBox = ({ container, content }: FitInsideTheBoxParams) => {
  // Calculate scale factors for both dimensions
  const scaleX = container.width / content.width;
  const scaleY = container.height / content.height;

  // Use the smaller scale to ensure content fits within both dimensions
  const scale = Math.min(scaleX, scaleY);

  // Calculate the new dimensions maintaining aspect ratio
  const width = content.width * scale;
  const height = content.height * scale;

  return { width, height };
};

const PreviewSection: FC<PreviewSectionProps> = ({ overlay, onTransformUpdate }) => {
  const { t } = useTranslation();
  const topContainerRef = useRef<HTMLDivElement>(null);
  const previewTopContainerRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const aspectRatioWrapperRef = useRef<HTMLDivElement>(null);
  const canvasResolution = overlay.canvasResolution;
  const [currentScale, setCurrentScale] = useState(1);

  // Calculate dynamic viewport units based on canvas resolution
  const viewportUnits = {
    '--vh': `${canvasResolution.height / 100}px`,
    '--vw': `${canvasResolution.width / 100}px`,
    '--vmin': `${Math.min(canvasResolution.width, canvasResolution.height) / 100}px`,
    '--vmax': `${Math.max(canvasResolution.width, canvasResolution.height) / 100}px`,
  } as React.CSSProperties;

  const renderOverlayPreview = () => {
    if (overlay.type === 'Auction') {
      return <AuctionOverlayPreview overlay={overlay as AuctionOverlayDto} />;
    } else if (overlay.type === 'Wheel') {
      return <WheelOverlayPreview overlay={overlay as WheelOverlayDto} />;
    }
    return null;
  };

  useLayoutEffect(() => {
    if (previewTopContainerRef.current && topContainerRef.current && aspectRatioWrapperRef.current) {
      const previewTopContainerRect = previewTopContainerRef.current.getBoundingClientRect();
      const topContainerRect = topContainerRef.current.getBoundingClientRect();

      const topOffset = previewTopContainerRect.top - topContainerRect.top + 1;
      // offset size for left, right, bottom  sides
      const defaultOffset = previewTopContainerRect.left - topContainerRect.left + 1;

      const availableWidth = topContainerRect.width - defaultOffset * 2;
      const availableHeight = topContainerRect.height - topOffset - defaultOffset;

      const { width, height } = fitInsideTheBox({
        container: {
          width: availableWidth,
          height: availableHeight,
        },
        content: {
          width: canvasResolution.width,
          height: canvasResolution.height,
        },
      });

      aspectRatioWrapperRef.current.style.width = `${width}px`;
      aspectRatioWrapperRef.current.style.height = `${height}px`;
    }
  }, [canvasResolution]);

  useLayoutEffect(() => {
    if (containerRef.current && canvasResolution) {
      const containerRect = containerRef.current.getBoundingClientRect();
      // console.log('containerRect', containerRect);
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Calculate scale to fit both width and height for current canvas resolution
      const scaleX = containerWidth / canvasResolution.width;
      const scaleY = containerHeight / canvasResolution.height;
      const newScale = Math.min(scaleX, scaleY);

      setCurrentScale(newScale);

      if (viewportRef.current) {
        viewportRef.current.style.transform = `scale(${newScale})`;
      }
    }
  }, [canvasResolution]);

  return (
    <div className={classes.topContainer} ref={topContainerRef}>
      <Paper withBorder p='md' bg='dark.6' shadow='md'>
        <Stack gap='lg' h='100%'>
          <Group justify='space-between' align='center'>
            <Title order={3}>{t('overlays.preview.title')}</Title>
            <CanvasResolutionSelector />
          </Group>

          <Paper
            withBorder
            radius='0'
            style={{
              flex: 1,
              padding: 0,
            }}
            ref={previewTopContainerRef}
            className={classes.previewTopContainer}
          >
            <div
              className={classes.aspectRatioWrapper}
              ref={aspectRatioWrapperRef}
              style={{
                aspectRatio: `${canvasResolution.width} / ${canvasResolution.height}`,
              }}
            >
              <div className={classes.aspectRatioContent}>
                <div ref={containerRef} className={classes.previewContainer}>
                  <div
                    className={classes.previewViewport}
                    ref={viewportRef}
                    style={{
                      width: canvasResolution.width,
                      minWidth: canvasResolution.width,
                      maxWidth: canvasResolution.width,
                      height: canvasResolution.height,
                      minHeight: canvasResolution.height,
                      maxHeight: canvasResolution.height,
                      ...viewportUnits,
                    }}
                  >
                    <div className={classes.previewContent}>
                      <ResizeController
                        overlay={overlay}
                        onTransformUpdate={onTransformUpdate}
                        containerWidth={canvasResolution.width}
                        containerHeight={canvasResolution.height}
                        scaleFactor={currentScale}
                      >
                        {renderOverlayPreview()}
                      </ResizeController>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </Stack>
      </Paper>
    </div>
  );
};

export default PreviewSection;
