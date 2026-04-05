import { Overlay, Popover, Stack, Text, Title } from '@mantine/core';
import { throttle } from '@tanstack/react-pacer';
import clsx from 'clsx';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput';
import TwitchEmotesList from '@components/TwitchEmotesList/TwitchEmotesList';
import {
  calculateWinnerSpinDistance,
  getWinnerFromDistance,
} from '@domains/winner-selection/wheel-of-random/lib/geometry';
import { WheelItem, WheelItemWithAngle, WheelStyle } from '@models/wheel.model';
import { RandomPaceConfig } from '@services/SpinPaceService';
import { ID } from '@components/Bracket/components/model';

import classes from './BaseWheel.module.css';
import WinnerBackdrop from './WinnerBackdrop';
import { useWheelAnimator } from './hooks/useWheelAnimator';
import { createWheelRenderer } from './renderers/createWheelRenderer';

import type { WheelRenderer } from './renderers/types';

export enum DropoutVariant {
  Classic,
  New,
}

export interface SpinParams {
  duration: number;
  distance?: number;
  paceConfig?: RandomPaceConfig;
  winnerId: ID;
}

export interface SpinResult {
  changedDistance: number;
  initialDistance: number;
  animate: () => Promise<void>;
}

export interface WheelController {
  getItems: () => WheelItemWithAngle[];

  clearWinner: () => void;
  spin: (params: SpinParams) => SpinResult;
  resetPosition: () => void;

  highlight: (id: ID) => void;
  resetStyles: () => void;
  eatAnimation: (id: ID, duration?: number) => Promise<void>;
}

export interface BaseWheelProps<T extends WheelItem> {
  items: T[];
  showDeleteConfirmation?: boolean;
  deleteItem?: (id: ID, showConfirmation?: boolean) => void;
  controller: MutableRefObject<WheelController | null>;
  coreImage?: string | null;
  onCoreImageChange?: (image: string) => void;
  onOptimalSizeChange?: (size: number) => void;
  resetWheel?: boolean;
  delay?: number;
  dropOut?: boolean;
  className?: string;
  wheelStyle?: WheelStyle | null;
}

const BaseWheel = <T extends WheelItem>(props: BaseWheelProps<T>) => {
  const {
    items,
    showDeleteConfirmation,
    resetWheel,
    deleteItem,
    controller,
    coreImage,
    onCoreImageChange,
    dropOut,
    className,
    onOptimalSizeChange,
    wheelStyle,
  } = props;
  const { t } = useTranslation();

  const [winnerItem, setWinnerItem] = useState<WheelItem | undefined>();
  const [coreSize, setCoreSize] = useState(160);
  const [coreBorderWidth, setCoreBorderWidth] = useState(3);

  const wheelCanvas = useRef<HTMLCanvasElement>(null);
  const foregroundCanvas = useRef<HTMLCanvasElement>(null);
  const coreElement = useRef<HTMLDivElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const wheelContent = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WheelRenderer | null>(null);
  const normalizedRef = useRef<WheelItemWithAngle[]>([]);
  const latestItemsRef = useRef(items);

  const coreBackground = useMemo(() => `url(${coreImage})`, [coreImage]);

  useEffect(() => {
    latestItemsRef.current = items;
  }, [items]);

  const setCoreFillColor = useCallback((color?: string | null) => {
    if (coreElement.current) {
      coreElement.current.style.backgroundColor = color || 'transparent';
    }
  }, []);

  const onSpinTick = useCallback(
    (rotation: number): void => {
      const winner = getWinnerFromDistance({ distance: rotation, items: normalizedRef.current });

      if (winner && spinTarget.current) {
        spinTarget.current.textContent = winner.name;
      }
      setCoreFillColor(winner?.color);
    },
    [setCoreFillColor],
  );

  const resetStyles = useCallback(() => {
    rendererRef.current?.draw();
  }, []);

  const firstResizeDrawRef = useRef(false);

  const resizeWheel = useCallback(() => {
    if (!wrapper.current || !spinTarget.current || !wheelContent.current || !rendererRef.current) return;

    const targetWheelSize = Math.min(
      wrapper.current.clientHeight - 20 - spinTarget.current.clientHeight,
      wrapper.current.clientWidth,
    );

    if (targetWheelSize < 160) {
      return;
    }

    const nextTargetWheelSize = Math.round(targetWheelSize);
    if (rendererRef.current.getLayout()?.targetWheelSize === nextTargetWheelSize) {
      return;
    }

    rendererRef.current.setLayout(nextTargetWheelSize);
    const layout = rendererRef.current.getLayout();
    if (!layout) {
      return;
    }

    wheelContent.current.style.width = `${layout.targetWheelSize}px`;
    wheelContent.current.style.height = `${layout.targetWheelSize}px`;
    if (wheelCanvas.current) {
      wheelCanvas.current.style.left = `${-layout.overflowPadding}px`;
      wheelCanvas.current.style.top = `${-layout.overflowPadding}px`;
    }
    if (foregroundCanvas.current) {
      foregroundCanvas.current.style.left = `${-layout.overflowPadding}px`;
      foregroundCanvas.current.style.top = `${-layout.overflowPadding}px`;
    }
    onOptimalSizeChange?.(layout.targetWheelSize);
    setCoreSize(layout.targetWheelSize * 0.2);
    setCoreBorderWidth(Math.max(2, (layout.targetWheelSize / 800) * 3));
    firstResizeDrawRef.current = true;

    resetStyles();
  }, [onOptimalSizeChange, resetStyles]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(
      throttle(
        () => {
          resizeWheel();
        },
        { wait: 30, trailing: true },
      ),
    );

    if (wrapper.current) {
      resizeWheel();
      resizeObserver.observe(wrapper.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeWheel]);

  useEffect(() => {
    rendererRef.current?.destroy();
    rendererRef.current = createWheelRenderer(wheelStyle, {
      wheelCanvas,
      foregroundCanvas,
    });
    rendererRef.current.setItems(latestItemsRef.current);
    normalizedRef.current = rendererRef.current.getItems();
    const winner = getWinnerFromDistance({ distance: rendererRef.current.getRotation(), items: normalizedRef.current });
    setCoreFillColor(winner?.color);
    resizeWheel();

    if (firstResizeDrawRef.current) {
      rendererRef.current.draw();
    }

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [resizeWheel, setCoreFillColor, wheelStyle]);

  const resetPosition = useCallback(() => {
    rendererRef.current?.setRotation(0);
    const winner = getWinnerFromDistance({ distance: 0, items: normalizedRef.current });
    setCoreFillColor(winner?.color);
  }, [setCoreFillColor]);

  const finalizeSpin = useCallback(
    (winner?: WheelItemWithAngle): Promise<WheelItem | null> => {
      return new Promise((resolve) => {
        if (winner && spinTarget.current) {
          setWinnerItem(winner);
          spinTarget.current.textContent = winner.name;

          if (resetWheel) {
            setTimeout(() => {
              resolve(winner);
              resetPosition();
            }, 350);
          } else {
            resolve(winner);
          }
        } else {
          resolve(null);
        }
      });
    },
    [resetPosition, resetWheel],
  );

  const getCurrentRotation = useCallback(() => rendererRef.current?.getRotation() ?? 0, []);
  const setRotation = useCallback((rotation: number) => {
    rendererRef.current?.setRotation(rotation);
  }, []);
  const { animate } = useWheelAnimator({ getCurrentRotation, setRotation, onSpin: onSpinTick });

  const spin: WheelController['spin'] = useCallback(
    ({ winnerId, duration, distance }: SpinParams): SpinResult => {
      setWinnerItem(undefined);

      rendererRef.current?.setSpeedMultiplier(5);

      const initialDistance = getCurrentRotation();
      const spinDistance =
        distance ?? calculateWinnerSpinDistance({ duration, winnerId, items: normalizedRef.current });
      const distanceOffset = initialDistance % 360;

      const changedDistance = spinDistance - distanceOffset;

      const animateWheel: SpinResult['animate'] = async () => {
        await animate(changedDistance, duration);

        const winnerItem = normalizedRef.current.find(({ id }) => id === winnerId);

        await finalizeSpin(winnerItem);

        rendererRef.current?.setSpeedMultiplier(1);
      };

      return {
        changedDistance,
        initialDistance,
        animate: animateWheel,
      };
    },
    [getCurrentRotation, animate, finalizeSpin],
  );

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setItems(items);
      normalizedRef.current = rendererRef.current.getItems();
      const winner = getWinnerFromDistance({
        distance: rendererRef.current.getRotation(),
        items: normalizedRef.current,
      });
      setCoreFillColor(winner?.color);

      if (firstResizeDrawRef.current) {
        resetPosition();
        resetStyles();
      }
    }
  }, [items, resetPosition, resetStyles, setCoreFillColor]);

  const clearWinner = useCallback(() => {
    setWinnerItem(undefined);

    if (spinTarget.current) {
      spinTarget.current.textContent = t('wheel.winner');
    }
  }, [t]);

  useImperativeHandle(
    controller,
    () => {
      const highlight = (id: ID) => {
        rendererRef.current?.highlightItem(id);
      };

      const _eatAnimation = async (id: ID, duration?: number) => {
        await rendererRef.current?.eatAnimation(id, duration);
      };

      return {
        spin,
        clearWinner,
        resetPosition,
        highlight,
        resetStyles,
        eatAnimation: _eatAnimation,
        getItems: () => normalizedRef.current,
      };
    },
    [clearWinner, resetPosition, resetStyles, spin],
  );

  const [isClickOusideAllowed, setIsClickOusideAllowed] = useState(true);

  return (
    <div
      className={clsx('base-wheel-wrapper', className)}
      style={{ width: '100%', height: '100%', display: 'inline-block', pointerEvents: 'none', overflow: 'visible' }}
      ref={wrapper}
    >
      <div>
        <Title order={2} className={classes.wheelTarget} ref={spinTarget}>
          {t('wheel.winner')}
        </Title>
        <div ref={wheelContent} className={classes.wheelContent}>
          <canvas style={{ position: 'absolute', zIndex: 1, inset: 0, pointerEvents: 'none' }} ref={foregroundCanvas} />
          <div className={classes.wheelCanvasWrapper}>
            <canvas ref={wheelCanvas} />
          </div>
          {onCoreImageChange && (
            <Popover width={420} withArrow position='right' closeOnClickOutside={isClickOusideAllowed}>
              <Popover.Target>
                <div
                  ref={coreElement}
                  className={classes.wheelCore}
                  style={{
                    backgroundImage: coreBackground,
                    width: coreSize,
                    height: coreSize,
                    borderWidth: coreBorderWidth,
                    borderColor: '#fff',
                  }}
                >
                  <div className={classes.wheelCoreOverlay}>
                    <Overlay color='black' opacity={0.7} />
                    <Text className={classes.wheelCoreText} size='xl'>
                      {t('wheel.coreImage.wheelOverlay')}
                    </Text>
                  </div>
                </div>
              </Popover.Target>
              <Popover.Dropdown mah={430} p={8} className={classes.wheelCoreEmotesList}>
                <Stack gap='sm'>
                  <ImageLinkInput
                    dialogTitle={t('wheel.coreImage.customImageDialogTitle')}
                    buttonTitle={t('wheel.loadCustomMessage')}
                    buttonClass='upload-wheel-image'
                    onChange={onCoreImageChange}
                    onModalOpenChange={(isOpened) => setIsClickOusideAllowed(!isOpened)}
                  />
                  <TwitchEmotesList setActiveEmote={onCoreImageChange} />
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}
          {!onCoreImageChange && (
            <div
              ref={coreElement}
              className={classes.wheelCore}
              style={{
                backgroundImage: coreBackground,
                width: coreSize,
                height: coreSize,
                borderWidth: coreBorderWidth,
                borderColor: '#fff',
              }}
            ></div>
          )}
          {!!winnerItem && (
            <WinnerBackdrop
              currentSpinWinner={winnerItem}
              id={winnerItem.id}
              finalWinner={dropOut && items.length === 1 ? items[0] : null}
              onDelete={
                deleteItem ? (showConfirmation?: boolean) => deleteItem(winnerItem.id, showConfirmation) : undefined
              }
              showDeleteConfirmation={showDeleteConfirmation}
              dropOut={dropOut}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseWheel;
