import React, {
  EventHandler,
  FC,
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSelector } from 'react-redux';
import { Button, Paper, PaperProps } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import InfiniteLoader from 'react-window-infinite-loader';

import PageContainer from '@components/PageContainer/PageContainer.tsx';
import { RootState } from '@reducers';
import { getTotalSize } from '@utils/slots.utils.ts';
import RouletteItem from '@pages/roulette/Item';
import './index.scss';

interface SpeedBreakpoint {
  progress: number;
  speedAtStart: number;
}

// находить расстояние через ускорение
const speedBreakpoints: SpeedBreakpoint[] = [
  { progress: 0, speedAtStart: 0 },
  { progress: 0.3, speedAtStart: 1 },
  { progress: 0.7, speedAtStart: 0.2 },
  { progress: 1, speedAtStart: 0 },
];
const spinTime = 10 * 1000;
const maxSpinSpeedInSec = 2200;

interface GrabState {
  isGrabbing: boolean;
  x: number;
}

const size = 190;
const gap = 12;
const totalSize = size + gap;

const Roulette = () => {
  const slots = useSelector((rootReducer: RootState) => rootReducer.slots.slots);
  const totalSum = useMemo(() => getTotalSize(slots), [slots]);
  const listRef = useRef<FixedSizeList | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);
  const grabState = useRef<GrabState>({ isGrabbing: false, x: 0 });

  const scrollBy = useCallback((distance: number) => {
    scrollRef.current += distance;
    listRef.current?.scrollTo(scrollRef.current);
  }, []);

  const renderSlot = useCallback(
    ({ style, index }: ListChildComponentProps): ReactElement => {
      return <RouletteItem slots={slots} totalSum={totalSum} style={style} index={index} />;
    },
    [slots, totalSum],
  );

  const onClickSpin = () => {
    if (listRef.current) {
      let startTime: number;
      let lastTimestamp: number;

      const spinWheel = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp;
          lastTimestamp = timestamp;

          return requestAnimationFrame(spinWheel);
        }

        const timeSpinned = timestamp - startTime;
        const progress = timeSpinned / spinTime;

        if (progress >= 1) return;

        const targetIndex = speedBreakpoints.findIndex(({ progress }) => progress > progress);
        const target = speedBreakpoints[targetIndex];
        const prev = speedBreakpoints[targetIndex - 1];
        const relativeProgress = (progress - prev.progress) / (target.progress - prev.progress);

        const speedDiff = target.speedAtStart - prev.speedAtStart;
        const speed = (relativeProgress * speedDiff + prev.speedAtStart) * maxSpinSpeedInSec;

        const frameTime = timestamp - lastTimestamp;
        const frameSpeed = (speed * frameTime) / 1000;
        lastTimestamp = timestamp;

        scrollBy(frameSpeed);

        requestAnimationFrame(spinWheel);
      };

      requestAnimationFrame(spinWheel);

      // listRef.current.scrollTo(scroll.current);
    }
  };

  const onMouseDown: PaperProps['onMouseDown'] = (e) => {
    grabState.current = { isGrabbing: true, x: e.pageX };
  };

  const onMouseMove = useCallback(
    (e: any) => {
      if (grabState.current.isGrabbing) {
        const distance = grabState.current.x - e.pageX;

        scrollBy(distance);
        grabState.current = { isGrabbing: true, x: e.pageX };
      }
    },
    [scrollBy],
  );

  useEffect(() => {
    const onMouseUp = (e: any) => {
      grabState.current = { isGrabbing: false, x: e.pageX };
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [onMouseMove]);

  useEffect(() => {
    if (container.current) {
      container.current.style.setProperty('--roulette-size', `${size}px`);
      container.current.style.setProperty('--roulette-gap', `${gap}px`);
    }
  }, [scrollBy]);

  const onListRender = (ref: any) => {
    listRef.current = ref;
    if (container.current) {
      const { width } = container.current.getBoundingClientRect();

      scrollBy((totalSize - (width % totalSize) - gap / 2 - 2) / 2 + totalSize * 10000);
    }
  };

  return (
    <PageContainer>
      <Grid2 container direction='column' alignItems='stretch' justifyContent='center' sx={{ height: '100%' }} gap={2}>
        <Grid2>
          <Paper className='line-roulette' ref={container} onMouseDown={onMouseDown}>
            <div className='line-roulette-indicator' />
            <AutoSizer>
              {({ width, height }) => (
                <FixedSizeList
                  ref={onListRender}
                  direction='horizontal'
                  layout='horizontal'
                  itemSize={totalSize}
                  height={height}
                  itemCount={10000000}
                  width={width}
                >
                  {renderSlot}
                </FixedSizeList>
              )}
            </AutoSizer>
          </Paper>
        </Grid2>
        <Grid2 alignSelf='center'>
          <Button onClick={onClickSpin}>Крутить!</Button>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default Roulette;
