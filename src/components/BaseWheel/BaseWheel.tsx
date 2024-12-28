import React, { Key, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';

import { WheelItem, WheelItemWithAngle } from '@models/wheel.model.ts';
import { getRandomInclusive, shuffle } from '@utils/common.utils.ts';
import { RandomPaceConfig } from '@services/SpinPaceService.ts';
import wheelHelpers from '@components/BaseWheel/helpers.ts';
import pradenW from '@assets/img/pradenW.png';
import { useWheelDrawer } from '@components/BaseWheel/hooks/useWheelDrawer.ts';
import { useWheelAnimator } from '@components/BaseWheel/hooks/useWheelAnimator.ts';
import '@components/BaseWheel/BaseWheel.scss';
import WinnerBackdrop from '@components/BaseWheel/WinnerBackdrop.tsx';

export enum DropoutVariant {
  Classic,
  New,
}

export interface SpinParams {
  seed?: number | null;
  duration?: number;
  paceConfig?: RandomPaceConfig;
  winner?: Key;
}

export interface WheelController {
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
  isShuffle?: boolean;
  controller: MutableRefObject<WheelController | null>;
  background?: string | null;
  resetWheel?: boolean;
  delay?: number;
}

const calculateFixedAngle = (duration: number): number => duration * 270;

const BaseWheel = <T extends WheelItem>(props: BaseWheelProps<T>) => {
  const { items, resetWheel, deleteItem, isShuffle, controller, background } = props;
  const { t } = useTranslation();
  const { drawWheel, highlightItem, eatAnimation } = useWheelDrawer();

  const [winnerItem, setWinnerItem] = useState<WheelItem>();

  const wheelCanvas = useRef<HTMLCanvasElement>(null);
  const selectorCanvas = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const coreBackground = useMemo(() => `url(${background || pradenW})`, [background]);
  const normalizedItems = useMemo(
    () => wheelHelpers.defineAngle(isShuffle ? shuffle(items) : items),
    [isShuffle, items],
  );
  const normalizedRef = useRef(normalizedItems);

  useEffect(() => {
    normalizedRef.current = normalizedItems;
  }, [normalizedItems]);

  const getWinnerFromRotation = (rotation: number): WheelItemWithAngle | undefined => {
    const angle = wheelHelpers.getWheelAngle(rotation);

    return normalizedRef.current.find(({ startAngle, endAngle }) => angle >= startAngle && angle <= endAngle);
  };

  const onSpinTick = useCallback((rotation: number): void => {
    const winner = getWinnerFromRotation(rotation);

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
  const spinToWinner = useCallback(
    async (winner: Key, duration: number) => {
      const localSpin = distanceTo(winner);
      const spinDistance = Math.round(calculateFixedAngle(duration) / 360) * 360 + localSpin;
      await animate(spinDistance, duration);

      return normalizedRef.current.find(({ id }) => id === winner);
    },
    [animate],
  );

  const spinRandom = useCallback(
    async (duration: number, seed?: number | null) => {
      const spinDistance = calculateFixedAngle(duration) + (seed ? seed : Math.random()) * 360;
      const end = await animate(spinDistance, duration);

      return getWinnerFromRotation(end);
    },
    [animate],
  );

  const spin: WheelController['spin'] = useCallback(
    async (params = {}) => {
      const { seed, winner, duration = 20 } = params;
      setWinnerItem(undefined);
      const winnerItem = await (winner ? spinToWinner(winner, duration) : spinRandom(duration, seed));
      const finalized = await finalizeSpin(winnerItem);

      return finalized ? finalized : Promise.reject(new Error('No winner'));
    },
    [finalizeSpin, spinRandom, spinToWinner],
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

  useEffect(() => {
    const highlight = (id: Key) => {
      if (wheelCanvas.current && selectorCanvas.current) {
        highlightItem(id, normalizedItems, wheelCanvas.current, selectorCanvas.current);
      }
    };

    const resetStyles = () => {
      if (wheelCanvas.current && selectorCanvas.current) {
        drawWheel({ items: normalizedItems, wheelCanvas: wheelCanvas.current, pointerCanvas: selectorCanvas.current });
      }
    };

    const _eatAnimation = async (id: Key, duration?: number) => {
      if (wheelCanvas.current && selectorCanvas.current) {
        await eatAnimation(id, normalizedItems, wheelCanvas.current, selectorCanvas.current, duration);
      }
    };

    controller.current = { spin, clearWinner, resetPosition, highlight, resetStyles, eatAnimation: _eatAnimation };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearWinner, controller, resetPosition, spin, normalizedItems]);

  return (
    <div style={{ width: '0', height: '100%', display: 'inline-block', pointerEvents: 'none' }} ref={wrapper}>
      <div className='wheel-target' ref={spinTarget}>
        {t('wheel.winner')}
      </div>
      <div className='wheel-content'>
        <canvas style={{ position: 'absolute', zIndex: 1 }} ref={selectorCanvas} />
        <canvas ref={wheelCanvas} />
        <div className='wheel-core' style={{ backgroundImage: coreBackground }} />
        {!!winnerItem && (
          <WinnerBackdrop
            name={winnerItem.name}
            id={winnerItem.id}
            onDelete={deleteItem ? () => deleteItem(winnerItem.id) : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default BaseWheel;
