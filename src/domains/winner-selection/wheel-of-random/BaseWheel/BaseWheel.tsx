import React, {
  Key,
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
import gsap from 'gsap';
import { Overlay, Popover, Stack, Text } from '@mantine/core';
import clsx from 'clsx';

import TwitchEmotesList from '@components/TwitchEmotesList/TwitchEmotesList';
import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput';
import {
  calculateRandomSpinDistance,
  calculateWinnerSpinDistance,
  getWinnerFromDistance,
} from '@domains/winner-selection/wheel-of-random/lib/geometry';
import './BaseWheel.scss';
import { WheelItemWithAngle, WheelItem } from '@models/wheel.model';
import { RandomPaceConfig } from '@services/SpinPaceService';

import WinnerBackdrop from './WinnerBackdrop';
import wheelHelpers from './helpers';
import { defaultWheelDrawer } from './hooks/defaultWheelDrawer';
import { genshinWheelDrawer } from './hooks/genshinWheelDrawer';
import { useWheelAnimator } from './hooks/useWheelAnimator';

export enum DropoutVariant {
  Classic,
  New,
}

export interface SpinParams {
  seed?: number | null;
  duration?: number;
  paceConfig?: RandomPaceConfig;
  winner?: Key;
  distance?: number;
}

export interface WheelController {
  getItems: () => WheelItemWithAngle[];

  clearWinner: () => void;
  spin: (params?: SpinParams) => Promise<WheelItem>;
  resetPosition: () => void;

  highlight: (id: Key) => void;
  resetStyles: () => void;
  eatAnimation: (id: Key, duration?: number) => Promise<void>;
}

export interface BaseWheelProps<T extends WheelItem> {
  items: T[];
  showDeleteConfirmation?: boolean;
  deleteItem?: (id: Key, showConfirmation?: boolean) => void;
  controller: MutableRefObject<WheelController | null>;
  coreImage?: string | null;
  onCoreImageChange?: (image: string) => void;
  onOptimalSizeChange?: (size: number) => void;
  resetWheel?: boolean;
  delay?: number;
  dropOut?: boolean;
  className?: string;
  wheelStyle?: 'default' | 'genshinImpact' | null;
}

// Wheel drawer instances will be created dynamically based on wheelStyle

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

  const wheelCanvas = useRef<HTMLCanvasElement>(null);
  const selectorCanvas = useRef<HTMLCanvasElement>(null);
  const effectsCanvas = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const wheelContent = useRef<HTMLDivElement>(null);
  const effectsManager = useRef<any>(null); // EffectsManager type

  const coreBackground = useMemo(() => `url(${coreImage})`, [coreImage]);
  const normalizedItems = useMemo(() => wheelHelpers.defineAngle(items), [items]);
  const normalizedRef = useRef(normalizedItems);
  const previousStyle = useRef<string | null>(wheelStyle ?? null);

  // Select wheel drawer based on wheelStyle
  const wheelDrawer = useMemo(() => {
    switch (wheelStyle) {
      case 'genshinImpact':
        return genshinWheelDrawer();
      case 'default':
      case null:
      case undefined:
      default:
        return defaultWheelDrawer();
    }
  }, [wheelStyle]);

  const hasEffects = useMemo(() => {
    return 'initializeEffects' in wheelDrawer && 'updateEffects' in wheelDrawer;
  }, [wheelDrawer]);

  useEffect(() => {
    normalizedRef.current = normalizedItems;
  }, [normalizedItems]);

  const onSpinTick = useCallback((rotation: number): void => {
    const winner = getWinnerFromDistance({ distance: rotation, items: normalizedRef.current });

    if (winner && spinTarget.current) {
      spinTarget.current.textContent = winner.name;
    }
  }, []);

  const resetStyles = useCallback(() => {
    if (wheelCanvas.current && selectorCanvas.current) {
      wheelDrawer.drawWheel({
        items: normalizedItems,
        wheelCanvas: wheelCanvas.current,
        pointerCanvas: selectorCanvas.current,
      });

      // Initialize or update effects if effects canvas is available and drawer supports it
      if (effectsCanvas.current && hasEffects) {
        const drawerWithEffects = wheelDrawer as any;
        if (effectsManager.current) {
          drawerWithEffects.updateEffects(effectsManager.current, wheelCanvas.current);
        } else {
          effectsManager.current = drawerWithEffects.initializeEffects(effectsCanvas.current, wheelCanvas.current);
        }
      }
    }
  }, [wheelDrawer, normalizedItems, hasEffects]);

  const resizeCanvas = useCallback((canvasElement: HTMLCanvasElement | null, size: number): void => {
    if (canvasElement) {
      canvasElement.height = size;
      canvasElement.width = size;
    }
  }, []);

  const resizeWheel = useCallback(() => {
    if (!wrapper.current || !spinTarget.current || !wheelCanvas.current || !wheelContent.current) return;

    const canvasSize = Math.min(
      wrapper.current.clientHeight - 20 - spinTarget.current.clientHeight,
      wrapper.current.clientWidth,
    );

    if (canvasSize === wheelCanvas.current.height || canvasSize < 160) {
      return;
    }

    resizeCanvas(wheelCanvas.current, canvasSize);
    resizeCanvas(selectorCanvas.current, canvasSize);
    // Effects canvas will be resized by the CanvasUtils.setupEffectsCanvas method
    wheelContent.current.style.width = `${canvasSize}px`;
    onOptimalSizeChange?.(canvasSize);

    if (wheelCanvas.current && selectorCanvas.current) {
      wheelDrawer.drawWheel({
        items: normalizedRef.current,
        wheelCanvas: wheelCanvas.current,
        pointerCanvas: selectorCanvas.current,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelDrawer]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      resizeWheel();
    });

    if (wrapper.current) {
      resizeWheel();
      resizeObserver.observe(wrapper.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeWheel]);

  const resetPosition = useCallback(() => {
    gsap.to(wheelCanvas.current, {
      duration: 0,
      rotate: 0,
    });
  }, []);

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

  const { animate } = useWheelAnimator({ wheelCanvas, onSpin: onSpinTick });

  const generateSpinDistance = useCallback((winner?: Key, duration = 20, seed?: number | null) => {
    return winner
      ? calculateWinnerSpinDistance({ duration, winnerId: winner, items: normalizedRef.current })
      : calculateRandomSpinDistance({ duration, seed });
  }, []);

  const spin: WheelController['spin'] = useCallback(
    async (params = {}) => {
      const { seed, winner, distance, duration = 20 } = params;
      setWinnerItem(undefined);

      effectsManager.current?.setSpeedMultiplier(5);

      const spinDistance = distance ?? generateSpinDistance(winner, duration, seed);

      const endAngle = await animate(spinDistance, duration);

      const winnerItem = winner
        ? normalizedRef.current.find(({ id }) => id === winner)
        : getWinnerFromDistance({ distance: endAngle, items: normalizedRef.current });

      const finalized = await finalizeSpin(winnerItem);

      effectsManager.current?.setSpeedMultiplier(1);

      return finalized ? finalized : Promise.reject(new Error('No winner'));
    },
    [finalizeSpin, animate, generateSpinDistance],
  );

  useEffect(() => {
    if (wheelCanvas.current && selectorCanvas.current) {
      resetPosition();
      resetStyles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedItems]);

  // Redraw wheel when wheelStyle changes
  useEffect(() => {
    if (previousStyle.current !== wheelStyle) {
      if (wheelCanvas.current && selectorCanvas.current) {
        resetStyles();
      }
    }
    previousStyle.current = wheelStyle ?? null;

    return () => {
      if ('destroy' in wheelDrawer) {
        (wheelDrawer as any).destroy();
      }

      if (effectsManager.current) {
        effectsManager.current.destroy();
        effectsManager.current = null;
      }
    };
  }, [wheelStyle, resetStyles, wheelDrawer]);

  const clearWinner = useCallback(() => {
    setWinnerItem(undefined);

    if (spinTarget.current) {
      spinTarget.current.textContent = t('wheel.winner');
    }
  }, [t]);

  useImperativeHandle(
    controller,
    () => {
      const highlight = (id: Key) => {
        if (wheelCanvas.current && selectorCanvas.current) {
          wheelDrawer.highlightItem(id, normalizedItems, wheelCanvas.current, selectorCanvas.current);
        }
      };

      const _eatAnimation = async (id: Key, duration?: number) => {
        if (wheelCanvas.current && selectorCanvas.current) {
          await wheelDrawer.eatAnimation(id, normalizedItems, wheelCanvas.current, selectorCanvas.current, duration);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearWinner, controller, resetPosition, spin, normalizedItems, wheelDrawer],
  );

  const [isClickOusideAllowed, setIsClickOusideAllowed] = useState(true);

  return (
    <div
      className={clsx('base-wheel-wrapper', className)}
      style={{ width: '100%', height: '100%', display: 'inline-block', pointerEvents: 'none', overflow: 'visible' }}
      ref={wrapper}
    >
      <div ref={wheelContent}>
        <div className='wheel-target' ref={spinTarget}>
          {t('wheel.winner')}
        </div>
        <div className='wheel-content'>
          <canvas style={{ position: 'absolute', zIndex: 1, top: -32 }} ref={selectorCanvas} />
          {hasEffects && (
            <canvas style={{ position: 'absolute', zIndex: 2, pointerEvents: 'none' }} ref={effectsCanvas} />
          )}
          <div className='wheel-canvas-wrapper'>
            <canvas ref={wheelCanvas} />
          </div>
          {onCoreImageChange && (
            <Popover width={420} withArrow position='right' closeOnClickOutside={isClickOusideAllowed}>
              <Popover.Target>
                <div className='wheel-core' style={{ backgroundImage: coreBackground }}>
                  <div className='wheel-core-overlay'>
                    <Overlay color='black' opacity={0.7} />
                    <Text className='wheel-core-text' size='xl'>
                      {t('wheel.coreImage.wheelOverlay')}
                    </Text>
                  </div>
                </div>
              </Popover.Target>
              <Popover.Dropdown mah={430} p={8} className='wheel-core-emotes-list'>
                <Stack gap={0}>
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
          {!onCoreImageChange && <div className='wheel-core' style={{ backgroundImage: coreBackground }}></div>}
          {!!winnerItem && (
            <WinnerBackdrop
              name={winnerItem.name}
              id={winnerItem.id}
              winnerName={dropOut && items.length === 1 ? items[0]?.name : undefined}
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
