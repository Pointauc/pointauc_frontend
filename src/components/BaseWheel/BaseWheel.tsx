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

interface SpinParams {
  seed?: number | null;
  paceConfig?: RandomPaceConfig;
  winner?: Key;
}

export interface WheelController {
  clearWinner: () => void;
  spin: (params?: SpinParams) => void;
  reset: () => void;
}

interface BaseWheelProps<T extends WheelItem> {
  items: T[];
  deleteItem?: (id: Key) => void;
  onWin?: (winner: T) => void;
  isShuffle?: boolean;
  controller: MutableRefObject<WheelController | null>;
  background?: string | null;
  spinTime?: number;
  resetWheel?: boolean;
}

const BaseWheel = <T extends WheelItem>(props: BaseWheelProps<T>) => {
  const { items, resetWheel, onWin, deleteItem, isShuffle, spinTime = 20, controller, background } = props;
  const { t } = useTranslation();
  const { drawWheel } = useWheelDrawer();

  const [winnerItem, setWinnerItem] = useState<WheelItem>();

  const wheelCanvas = useRef<HTMLCanvasElement>(null);
  const selectorCanvas = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const coreBackground = useMemo(() => `url(${background || pradenW})`, [background]);
  const normalizedItems = useMemo(() => {
    return wheelHelpers.defineAngle(isShuffle ? shuffle(items) : items);
  }, [isShuffle, items]);
  const normalizedRef = useRef(normalizedItems);

  useEffect(() => {
    normalizedRef.current = normalizedItems;
  }, [normalizedItems]);

  const getWinnerFromRotation = (rotation: number): WheelItemWithAngle | undefined => {
    const angle = wheelHelpers.getWheelAngle(rotation);

    return normalizedRef.current.find(({ startAngle, endAngle }) => angle >= startAngle && angle <= endAngle);
  };

  const onSpin = useCallback((rotation: number): void => {
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

  const reset = useCallback(() => {
    gsap.to(wheelCanvas.current, {
      duration: 0,
      rotate: 0,
    });
  }, []);

  const predictedWinner = useRef<Key | null>(null);
  const onSpinEnd = useCallback(
    (rotate: number): void => {
      const winner = predictedWinner.current
        ? normalizedRef.current.find(({ id }) => id === predictedWinner.current)
        : getWinnerFromRotation(rotate);
      predictedWinner.current = null;

      if (winner && spinTarget.current) {
        setWinnerItem(winner);
        spinTarget.current.innerHTML = winner.name;

        if (resetWheel) {
          setTimeout(() => {
            onWin?.(winner as any);
            reset();
          }, 350);
        } else {
          onWin?.(winner as any);
        }
      }
    },
    [onWin, reset, resetWheel],
  );

  const generateLocalSpin = (seed?: number | null): number => (seed ? seed : Math.random()) * 360;

  const distanceTo = (id: Key): number => {
    const { startAngle, endAngle } = normalizedRef.current.find(
      ({ id: itemId }) => itemId === id,
    ) as WheelItemWithAngle;
    const fullCircle = Math.PI * 2;

    const x = getRandomInclusive(startAngle / fullCircle, endAngle / fullCircle);

    return (1 - x) * 360 + 270;
  };

  const { animate } = useWheelAnimator({ wheelCanvas, onComplete: onSpinEnd, onSpin, spinTime });
  const spin: WheelController['spin'] = useCallback(
    (params = {}): void => {
      const { paceConfig, seed, winner } = params;
      setWinnerItem(undefined);
      const fixedSpin = (paceConfig ? 270 : 240) * spinTime;

      if (winner) {
        const randomSpin = distanceTo(winner);
        const newFixedSpin = Math.round(fixedSpin / 360) * 360;

        animate(newFixedSpin + randomSpin);
        predictedWinner.current = winner;
      } else {
        const randomSpin = generateLocalSpin(seed);
        animate(fixedSpin + randomSpin);
      }
    },
    [animate, spinTime],
  );

  useEffect(() => {
    if (wheelCanvas.current && selectorCanvas.current) {
      drawWheel(normalizedItems, wheelCanvas.current, selectorCanvas.current);
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
    controller.current = { spin, clearWinner, reset };
  }, [clearWinner, controller, reset, spin]);

  return (
    <div
      style={{ width: '0', height: '100%', display: 'inline-block', marginRight: 45, pointerEvents: 'none' }}
      ref={wrapper}
    >
      <div className='wheel-target' ref={spinTarget}>
        {t('wheel.winner')}
      </div>
      <div className='wheel-content'>
        <canvas style={{ position: 'absolute', zIndex: 1 }} ref={selectorCanvas} />
        <canvas ref={wheelCanvas} />
        <div className='wheel-core' style={{ backgroundImage: coreBackground }} />
        {!!winnerItem && (
          <WinnerBackdrop name={winnerItem.name} onDelete={deleteItem ? () => deleteItem(winnerItem.id) : undefined} />
        )}
      </div>
    </div>
  );
};

export default BaseWheel;
