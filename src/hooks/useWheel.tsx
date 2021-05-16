import React, { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
// eslint-disable-next-line import/no-named-as-default
import CustomEase from '../utils/CustomEase';
import { WheelItem, WheelItemWithAngle } from '../models/wheel.model';
import pradenW from '../assets/img/pradenW.png';
import { fitText, shuffle } from '../utils/common.utils';

interface WheelResult {
  wheelComponent: ReactNode;
  spin: () => void;
}

interface WheelConfig {
  rawItems: WheelItem[];
  onWin: (item: WheelItem) => void;
  background?: string;
  spinTime?: number;
  dropout?: boolean;
  dropoutRate?: number;
}

window.gsap = gsap;

type Context = CanvasRenderingContext2D;

const centerCircleStyles = (background?: string): CSSProperties => ({
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
  dropoutRate = 10,
}: WheelConfig): WheelResult => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wheelSelector = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const items = useMemo(() => shuffle(rawItems), [rawItems]);
  const totalSize = useMemo(() => items.reduce((acc, { size }) => acc + (size || 1), 0), [items]);
  const [rotate, setRotate] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [winnerItem, setWinnerItem] = useState<WheelItem>();

  const getReverseSize = useCallback(
    (size: number) => (1 - size / totalSize) ** ((rawItems.length * 1.3 * dropoutRate) / 10),
    [dropoutRate, rawItems.length, totalSize],
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
      const canvasSize = Math.min(wrapper.current.clientHeight, wrapper.current.clientWidth) + 8;

      canvasElement.height = canvasSize;
      canvasElement.width = canvasSize;
      setOffset(canvasSize);
    }
  };

  const onWheelSpin = (previousRotate: number, nextRotate: number, progress: number): void => {
    const currentRotate = previousRotate + nextRotate * progress;
    const angle = getWheelAngle(currentRotate);
    const winner = normalizedRef.current.find(({ startAngle, endAngle }) => angle >= startAngle && angle <= endAngle);

    if (!winner || !spinTarget.current) {
      return;
    }

    if (progress === 1) {
      onWin(winner);
      setWinnerItem(winner);
      setRotate(0);
      gsap.to(canvas.current, {
        duration: 0.1,
        ease: CustomEase.create('custom', 'M0,0,C0.102,0.044,0.157,0.377,0.198,0.554,0.33,1,0.604,1,1,1'),
        rotate: 0,
      });
    }
    spinTarget.current.innerHTML = winner.name;
  };

  const animateWheel = (previousRotate: number, nextRotate: number): void => {
    if (canvas.current) {
      gsap.to(canvas.current, {
        duration: spinTime,
        ease: CustomEase.create('custom', 'M0,0,C0.102,0.044,0.157,0.377,0.198,0.554,0.33,1,0.604,1,1,1', {
          onUpdate: onWheelSpin.bind(undefined, previousRotate, nextRotate),
        }),
        rotate: nextRotate,
      });
    }
  };

  const spin = (): void => {
    setWinnerItem(undefined);
    const randomSpin = Math.random() * 360;
    const nextRotate = rotate + 230 * spinTime + randomSpin;
    animateWheel(rotate, nextRotate);
    setRotate(nextRotate);
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
    window.addEventListener('resize', updateWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedItems]);

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
    <div style={{ width: '80%', height: '80%', position: 'absolute' }} ref={wrapper}>
      <div style={{ width: offset }} className="wheel-target" ref={spinTarget}>
        Победитель
      </div>
      <canvas style={{ position: 'absolute', zIndex: 100 }} ref={wheelSelector} />
      <canvas ref={canvas} />
      <div style={circleStyles} />
      {!!winnerItem && (
        <div style={{ width: offset, height: offset }} className="wheel-winner">
          {winnerItem.name}
        </div>
      )}
    </div>
  );

  return { spin, wheelComponent };
};

export default useWheel;
