import React, {
  Key,
  MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { Overlay, Popover, Stack, Text } from '@mantine/core';

import { WheelItem, WheelItemWithAngle } from '@models/wheel.model.ts';
import { getRandomInclusive, random, shuffle } from '@utils/common.utils.ts';
import { RandomPaceConfig } from '@services/SpinPaceService.ts';
import wheelHelpers from '@components/BaseWheel/helpers.ts';
import { useWheelDrawer } from '@components/BaseWheel/hooks/useWheelDrawer.ts';
import { useWheelAnimator } from '@components/BaseWheel/hooks/useWheelAnimator.ts';
import WinnerBackdrop from '@components/BaseWheel/WinnerBackdrop.tsx';
import TwitchEmotesList from '@components/TwitchEmotesList/TwitchEmotesList';
import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput';
import '@components/BaseWheel/BaseWheel.scss';
import {
  calculateRandomSpinDistance,
  calculateWinnerSpinDistance,
  getWinnerFromDistance,
} from '@features/wheel/lib/geometry';

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
  deleteItem?: (id: Key) => void;
  controller: MutableRefObject<WheelController | null>;
  coreImage?: string | null;
  onCoreImageChange?: (image: string) => void;
  resetWheel?: boolean;
  delay?: number;
  dropOut?: boolean;
}

const BaseWheel = <T extends WheelItem>(props: BaseWheelProps<T>) => {
  const { items, resetWheel, deleteItem, controller, coreImage, onCoreImageChange, dropOut } = props;
  const { t } = useTranslation();
  const { drawWheel, highlightItem, eatAnimation } = useWheelDrawer();

  const [winnerItem, setWinnerItem] = useState<WheelItem | undefined>();

  const wheelCanvas = useRef<HTMLCanvasElement>(null);
  const selectorCanvas = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const coreBackground = useMemo(() => `url(${coreImage})`, [coreImage]);
  const normalizedItems = useMemo(() => wheelHelpers.defineAngle(items), [items]);
  const normalizedRef = useRef(normalizedItems);

  useEffect(() => {
    normalizedRef.current = normalizedItems;
  }, [normalizedItems]);

  const onSpinTick = useCallback((rotation: number): void => {
    const winner = getWinnerFromDistance({ distance: rotation, items: normalizedRef.current });

    if (winner && spinTarget.current) {
      spinTarget.current.innerHTML = winner.name;
    }
  }, []);

  const resizeCanvas = (canvasElement: HTMLCanvasElement | null): void => {
    if (wrapper.current && canvasElement) {
      const canvasSize = Math.max(wrapper.current.clientHeight, wrapper.current.clientWidth) + 8 - 72;
      canvasElement.height = canvasSize;
      canvasElement.width = canvasSize;
      wrapper.current.style.width = `${canvasSize}px`;
    }
  };

  useEffect(() => {
    resizeCanvas(wheelCanvas.current);
    resizeCanvas(selectorCanvas.current);
    // window.addEventListener('resize', updateWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          spinTarget.current.innerHTML = winner.name;

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

  const distanceTo = (id: Key): number => {
    const { startAngle, endAngle } = normalizedRef.current.find(
      ({ id: itemId }) => itemId === id,
    ) as WheelItemWithAngle;
    const fullCircle = Math.PI * 2;

    const x = getRandomInclusive(startAngle / fullCircle, endAngle / fullCircle);

    return (1 - x) * 360 + 270;
  };

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

      const spinDistance = distance ?? generateSpinDistance(winner, duration, seed);

      const endAngle = await animate(spinDistance, duration);

      const winnerItem = winner
        ? normalizedRef.current.find(({ id }) => id === winner)
        : getWinnerFromDistance({ distance: endAngle, items: normalizedRef.current });

      const finalized = await finalizeSpin(winnerItem);

      return finalized ? finalized : Promise.reject(new Error('No winner'));
    },
    [finalizeSpin, animate, generateSpinDistance],
  );

  useEffect(() => {
    if (wheelCanvas.current && selectorCanvas.current) {
      resetPosition();
      drawWheel({ items: normalizedItems, wheelCanvas: wheelCanvas.current, pointerCanvas: selectorCanvas.current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedItems]);

  const clearWinner = useCallback(() => {
    setWinnerItem(undefined);

    if (spinTarget.current) {
      spinTarget.current.innerHTML = t('wheel.winner');
    }
  }, [t]);

  useImperativeHandle(
    controller,
    () => {
      const highlight = (id: Key) => {
        if (wheelCanvas.current && selectorCanvas.current) {
          highlightItem(id, normalizedItems, wheelCanvas.current, selectorCanvas.current);
        }
      };

      const resetStyles = () => {
        if (wheelCanvas.current && selectorCanvas.current) {
          drawWheel({
            items: normalizedItems,
            wheelCanvas: wheelCanvas.current,
            pointerCanvas: selectorCanvas.current,
          });
        }
      };

      const _eatAnimation = async (id: Key, duration?: number) => {
        if (wheelCanvas.current && selectorCanvas.current) {
          await eatAnimation(id, normalizedItems, wheelCanvas.current, selectorCanvas.current, duration);
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
    [clearWinner, controller, resetPosition, spin, normalizedItems],
  );

  const [isClickOusideAllowed, setIsClickOusideAllowed] = useState(true);

  return (
    <div
      style={{ width: '0', height: '100%', display: 'inline-block', pointerEvents: 'none', overflow: 'visible' }}
      ref={wrapper}
    >
      <div className='wheel-target' ref={spinTarget}>
        {t('wheel.winner')}
      </div>
      <div className='wheel-content'>
        <canvas style={{ position: 'absolute', zIndex: 1, top: -18 }} ref={selectorCanvas} />
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
            onDelete={deleteItem ? () => deleteItem(winnerItem.id) : undefined}
            dropOut={dropOut}
          />
        )}
      </div>
    </div>
  );
};

export default BaseWheel;
