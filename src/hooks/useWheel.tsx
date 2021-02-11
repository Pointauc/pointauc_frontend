import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
// eslint-disable-next-line import/no-named-as-default
import CustomEase from '../utils/CustomEase';
import { WheelItem, WheelItemWithAngle } from '../models/wheel.model';
import pradenW from '../assets/img/pradenW.png';
import { shuffle } from '../utils/common.utils';

interface WheelResult {
  wheelComponent: ReactNode;
  spin: () => void;
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

const useWheel = (rawItems: WheelItem[], onWin: (item: WheelItem) => void, background?: string): WheelResult => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const items = useMemo(() => shuffle(rawItems), [rawItems]);
  const totalSize = useMemo(() => items.reduce((acc, { size }) => acc + (size || 1), 0), [items]);
  const [rotate, setRotate] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [winnerItem, setWinnerItem] = useState<WheelItem>();
  // const [canvasStyles, setCanvasStyles] = useState<CSSProperties>({});

  // const [interpolation, setInterpolation] = useState<number[]>([12, 19, 3, 5, 2, 3, 20, 3, 5, 6, 2, 1]);
  // const chartRef = useRef<HTMLCanvasElement>(null);

  const normalizedItems = useMemo(() => {
    let angleOffset = 0;

    return items.map<WheelItemWithAngle>((item) => {
      const angle = (2 * Math.PI * (item.size || 1)) / totalSize;
      const resultItem = { ...item, startAngle: angleOffset, endAngle: angleOffset + angle };
      angleOffset = resultItem.endAngle;

      return resultItem;
    });
  }, [items, totalSize]);
  const normalizedRef = useRef(normalizedItems);
  useEffect(() => {
    normalizedRef.current = normalizedItems;
  }, [normalizedItems]);

  const drawSlice = (ctx: Context, center: number, { startAngle, endAngle, color }: WheelItemWithAngle): void => {
    if (!ctx) {
      return;
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = borderWidth;
    const radius = center - ctx.lineWidth;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(center, center);
    ctx.stroke();
  };

  const drawText = (ctx: Context, center: number, { startAngle, endAngle, name }: WheelItemWithAngle): void => {
    const radius = center - 3;

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    ctx.textBaseline = 'middle';

    const textRadius = (radius - ctx.measureText(name).width) / 1.3;
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

  const resizeCanvas = (): void => {
    if (wrapper.current && canvas.current) {
      const canvasSize = Math.min(wrapper.current.clientHeight, wrapper.current.clientWidth) + 8;

      canvas.current.height = canvasSize;
      canvas.current.width = canvasSize;
      setOffset(canvasSize);
    }
  };

  const updateWinner = (currentRotate: number): void => {
    const degree = 360 - (currentRotate % 360);
    const angle = (degree * Math.PI) / 180;
    const winner = normalizedRef.current.find(({ startAngle, endAngle }) => angle >= startAngle && angle <= endAngle);

    if (winner) {
      onWin(winner);
      setWinnerItem(winner);
    }
  };

  const animateWheel = (previousRotate: number, nextRotate: number): void => {
    if (canvas.current) {
      gsap.to(canvas.current, {
        duration: 20,
        ease: CustomEase.create('custom', 'M0,0,C0.102,0.044,0.157,0.377,0.198,0.554,0.33,1,0.604,1,1,1'),
        rotate: nextRotate,
      });
    }
  };

  const spin = (): void => {
    setWinnerItem(undefined);
    const randomSpin = Math.random() * 360;
    const nextRotate = rotate + 4600 + randomSpin;
    animateWheel(rotate, nextRotate);
    setRotate(nextRotate);

    setTimeout(() => updateWinner(nextRotate), 20000);
  };

  const drawWheel = (): void => {
    const ctx = canvas.current?.getContext('2d');
    const radius = Number(canvas.current?.width) / 2;

    if (ctx) {
      normalizedItems.forEach((item) => drawSlice(ctx, radius, item));
      normalizedItems.forEach((item) => drawText(ctx, radius, item));
    }
  };

  const updateWheel = (): void => {
    resizeCanvas();
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
      top: (offset - size) / 2,
      left: (offset - size) / 2,
      width: size,
      height: size,
      position: 'absolute',
      borderRadius: '100%',
      border: '3px solid #222',
    };
  }, [background, offset]);

  const wheelComponent = (
    <div style={{ width: '80%', height: '80%', position: 'absolute' }} ref={wrapper}>
      <canvas ref={canvas} />
      <div style={{ left: offset, top: offset / 2 }} className="wheel-selector" />
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
