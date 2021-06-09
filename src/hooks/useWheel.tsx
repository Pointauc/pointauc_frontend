import React, { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
// eslint-disable-next-line import/no-named-as-default
import CustomEase from '../utils/CustomEase';
import { WheelItem, WheelItemWithAngle } from '../models/wheel.model';
import pradenW from '../assets/img/pradenW.png';
import { fitText, shuffle } from '../utils/common.utils';
import SpinPaceService, { RandomPaceConfig } from '../services/SpinPaceService';
import { SPIN_PATH } from '../constants/wheel';
import PredictionService from '../services/PredictionService';

interface WheelResult {
  wheelComponent: ReactNode;
  clearWinner: () => void;
  spin: (seed?: number, paceConfig?: RandomPaceConfig) => void;
}

interface WheelConfig {
  rawItems: WheelItem[];
  onWin: (item: WheelItem) => void;
  background?: string | null;
  spinTime?: number;
  dropout?: boolean;
  dropoutRate?: number;
  randomPaceConfig?: RandomPaceConfig;
}

window.gsap = gsap;

type Context = CanvasRenderingContext2D;

const centerCircleStyles = (background?: string | null): CSSProperties => ({
  backgroundImage: `url(${background || pradenW})`,
  backgroundColor: 'transparent',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
});

const borderWidth = 3;
const maxTextLength = 21;
const selectorAngle = (Math.PI / 2) * 3;

const getWheelAngle = (rotate: number): number => {
  const degree = 360 - (rotate % 360);
  const angle = (degree * Math.PI) / 180 + selectorAngle;

  return angle > Math.PI * 2 ? angle - Math.PI * 2 : angle;
};

const useWheel = ({
  rawItems,
  background,
  dropout,
  onWin,
  spinTime = 20,
  dropoutRate = 1,
}: WheelConfig): WheelResult => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wheelSelector = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const shuffledItems = useMemo(() => shuffle(rawItems), [rawItems]);
  const items = useMemo(
    () => shuffledItems.map(({ size, ...rest }) => ({ ...rest, size: (size || 1) ** dropoutRate })),
    [dropoutRate, shuffledItems],
  );
  const totalSize = useMemo(() => items.reduce((acc, { size }) => acc + (size || 1), 0), [items]);
  const [rotate, setRotate] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [winnerItem, setWinnerItem] = useState<WheelItem>();

  const getReverseSize = useCallback(
    (size: number) => PredictionService.getReverseSize(size, totalSize, rawItems.length),
    [rawItems.length, totalSize],
  );

  const normalizedItems = useMemo(() => {
    let angleOffset = 0;
    const actualItems = dropout ? items.map((item) => ({ ...item, size: getReverseSize(item.size || 1) })) : items;
    const actualTotalSize = dropout ? actualItems.reduce((acc, { size }) => acc + (size || 1), 0) : totalSize;

    return actualItems.map<WheelItemWithAngle>((item) => {
      const size = (item.size || 1) / actualTotalSize;
      const angle = 2 * Math.PI * size;
      const resultItem = {
        ...item,
        startAngle: angleOffset,
        endAngle: angleOffset + angle,
        name: fitText(item.name, maxTextLength),
      };
      angleOffset = resultItem.endAngle;

      return resultItem;
    });
  }, [dropout, getReverseSize, items, totalSize]);

  const normalizedRef = useRef(normalizedItems);

  useEffect(() => {
    normalizedRef.current = normalizedItems;
  }, [normalizedItems]);

  const drawSlice = (
    ctx: Context,
    center: number,
    { startAngle, endAngle, color }: Pick<WheelItemWithAngle, 'startAngle' | 'endAngle' | 'color'>,
    pieEdgeDefault?: { x: number; y: number },
  ): void => {
    if (!ctx) {
      return;
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = borderWidth;

    const pieEdge = pieEdgeDefault || { x: center, y: center };
    const radius = center - ctx.lineWidth;

    ctx.beginPath();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(pieEdge.x, pieEdge.y);
    ctx.stroke();
  };

  const drawText = (ctx: Context, center: number, { startAngle, endAngle, name }: WheelItemWithAngle): void => {
    if ((endAngle - startAngle) / Math.PI / 2 < 0.017) {
      return;
    }

    const radius = center - 3;

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    ctx.textBaseline = 'middle';

    const offsetModifier = -name.length * 0.007 + 1.3;
    const textRadius = (radius - ctx.measureText(name).width) / offsetModifier;
    const centerAngle = endAngle - (endAngle - startAngle) / 2;
    const textCoords = {
      x: textRadius * Math.cos(centerAngle) + borderWidth,
      y: textRadius * Math.sin(centerAngle) + borderWidth,
    };

    ctx.translate(textCoords.x + radius, textCoords.y + radius);
    ctx.rotate(centerAngle);
    ctx.fillText(name, 0, 0);
    ctx.restore();
  };

  const resizeCanvas = (canvasElement: HTMLCanvasElement | null): void => {
    if (wrapper.current && canvasElement) {
      const canvasSize = Math.max(wrapper.current.clientHeight, wrapper.current.clientWidth) + 8 - 72;
      canvasElement.height = canvasSize;
      canvasElement.width = canvasSize;
      wrapper.current.style.width = `${canvasSize}px`;
      setOffset(canvasSize);
    }
  };

  const getWinner = (previousRotate: number, nextRotate: number, progress = 1): WheelItemWithAngle | undefined => {
    const currentRotate = previousRotate + nextRotate * progress;
    const angle = getWheelAngle(currentRotate);

    return normalizedRef.current.find(({ startAngle, endAngle }) => angle >= startAngle && angle <= endAngle);
  };

  const onWheelSpin = (previousRotate: number, nextRotate: number, progress: number): void => {
    const winner = getWinner(previousRotate, nextRotate, progress);

    if (!winner || !spinTarget.current) {
      return;
    }

    spinTarget.current.innerHTML = winner.name;
  };

  const handleWin = (previousRotate: number, nextRotate: number): void => {
    const winner = getWinner(previousRotate, nextRotate);

    if (winner && spinTarget.current) {
      onWin(winner);
      setWinnerItem(winner);
      spinTarget.current.innerHTML = winner.name;
    }
  };

  const animateWheel = (previousRotate: number, nextRotate: number, paceConfig?: RandomPaceConfig): number => {
    if (canvas.current) {
      const wheelPath = paceConfig ? new SpinPaceService(paceConfig, 270 * spinTime, spinTime).createPath() : SPIN_PATH;
      const realSpinChange = Number(wheelPath.split(',').splice(-1, 1)[0]) * (nextRotate - previousRotate);
      console.log(wheelPath);
      gsap.to(canvas.current, {
        duration: spinTime,
        ease: CustomEase.create('custom', wheelPath, {
          onUpdate: onWheelSpin.bind(undefined, previousRotate, nextRotate - previousRotate),
        }),
        onComplete: handleWin.bind(undefined, previousRotate, realSpinChange),
        rotate: nextRotate,
      });

      return previousRotate + realSpinChange;
    }

    return 0;
  };

  const spin = (seed?: number | null, paceConfig?: RandomPaceConfig): void => {
    setWinnerItem(undefined);
    const winningSeed = seed && !dropout ? seed : Math.random();
    const randomSpin = winningSeed * 360;
    const nextRotate = rotate + (paceConfig ? 270 : 240) * spinTime + randomSpin;
    const correctNextRotate = animateWheel(rotate, nextRotate, paceConfig);
    setRotate(correctNextRotate);
  };

  const drawWheel = (): void => {
    const ctx = canvas.current?.getContext('2d');
    const selectorCtx = wheelSelector.current?.getContext('2d');
    const radius = Number(canvas.current?.width) / 2;

    if (ctx) {
      normalizedItems.forEach((item) => drawSlice(ctx, radius, item));
      normalizedItems.forEach((item) => drawText(ctx, radius, item));
    }

    if (selectorCtx) {
      drawSlice(
        selectorCtx,
        radius,
        { startAngle: selectorAngle - 0.12, endAngle: selectorAngle + 0.12, color: '#353535' },
        { x: radius, y: 45 },
      );
    }
  };

  const updateWheel = (): void => {
    resizeCanvas(canvas.current);
    resizeCanvas(wheelSelector.current);
    drawWheel();
  };

  useEffect(() => {
    // window.addEventListener('resize', updateWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedItems]);

  const clearWinner = useCallback(() => {
    setWinnerItem(undefined);

    if (spinTarget.current) {
      spinTarget.current.innerHTML = 'Победитель';
    }
  }, []);

  const circleStyles: CSSProperties = useMemo(() => {
    const size = offset * 0.2;
    return {
      ...centerCircleStyles(background),
      top: (offset - size) / 2 + 58,
      left: (offset - size) / 2,
      width: size,
      height: size,
      position: 'absolute',
      borderRadius: '100%',
      border: '3px solid #eee',
    };
  }, [background, offset]);

  const wheelComponent = (
    <div
      style={{ width: '0', height: '100%', display: 'inline-block', marginRight: 45, pointerEvents: 'none' }}
      ref={wrapper}
    >
      <div style={{ width: offset }} className="wheel-target" ref={spinTarget}>
        Победитель
      </div>
      <canvas style={{ position: 'absolute', zIndex: 1 }} ref={wheelSelector} />
      <canvas ref={canvas} />
      <div style={circleStyles} />
      {!!winnerItem && (
        <div style={{ width: offset, height: offset }} className="wheel-winner">
          {winnerItem.name}
        </div>
      )}
    </div>
  );

  return { spin, wheelComponent, clearWinner };
};

export default useWheel;
