import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { WheelItem, WheelItemWithAngle } from '../models/wheel.model';
import pradenW from '../assets/img/pradenW.png';

interface WheelResult {
  wheelComponent: ReactNode;
  spin: () => void;
}

type Context = CanvasRenderingContext2D;

const centerCircleStyles = {
  backgroundImage: `url(${pradenW})`,
  backgroundColor: 'transparent',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};

const borderWidth = 3;

const useWheel = (items: WheelItem[], onWin: (item: WheelItem) => void): WheelResult => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
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
    console.log(textRadius);
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

  // const animateWheel = (previousRotate: number, nextRotate: number): void => {
  //   const rotationChange = nextRotate - previousRotate;
  // setCanvasStyles({ transition: 'transform 8s cubic-bezier(.55,0,.3,1)', transform: `rotate(${nextRotate}deg)` });
  // setInterpolation([]);
  // const interpolatedValues: number[] = [];
  //
  // anime({
  //   targets: '.wheel',
  // rotate: [
  //   { value: previousRotate + rotationChange * 0.3, duration: 3000, easing: 'easeInCubic' },
  //   { value: previousRotate + rotationChange * 0.85, duration: 2000, easing: 'linear' },
  //   { value: nextRotate, duration: 5000, easing: 'easeOutExpo' },
  // ],
  // rotate: nextRotate,
  // easing: 'cubicBezier(.37,0,.37,1)',
  // easing: () => (t: number): number => {
  //   let res = t;
  // res = 1 - (1 - t) ** 4;
  // interpolatedValues.push(res);
  // return res;

  // if (t < 0.2) {
  //   const localTime = t / 0.2;
  //   res = localTime ** 3 * 0.2;
  // }

  // if (t > 0.6) {
  //   const localTime = (t - 0.6) / 0.4;
  //   res = 1 - (1 - localTime) ** 4;
  //   res = res * 0.4 + 0.6;
  // console.log(`${1 - Math.pow(1 - t, 3)} - ${res}`);
  // }

  // console.log(interpolation);
  // interpolatedValues.push(res);
  // return res;
  // },
  //     duration: 8000,
  //     complete: () => {
  //       console.log('complete');
  //       setInterpolation(interpolatedValues);
  //     },
  //   });
  // };

  const spin = (): void => {
    setWinnerItem(undefined);
    const randomSpin = Math.floor(Math.random() * 360);
    const nextRotate = rotate + 1700 + randomSpin;
    // animateWheel(rotate, nextRotate);
    setRotate(nextRotate);

    setTimeout(() => updateWinner(nextRotate), 9000);
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

  // useEffect(() => {
  //   const ctx: any = document.getElementById('chart');
  //   const labels = interpolation.map((x, index) => index.toString());
  //   if (ctx) {
  //     console.log(interpolation);
  //
  //     const chart = new Chart(ctx, {
  //       type: 'line',
  //       data: {
  //         labels,
  //         datasets: [
  //           {
  //             label: 'Car Speed (mph)',
  //             data: interpolation,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: false,
  //         scales: {
  //           xAxes: [
  //             {
  //               ticks: {
  //                 maxRotation: 90,
  //                 minRotation: 80,
  //               },
  //               gridLines: {
  //                 offsetGridLines: true, // à rajouter
  //               },
  //             },
  //             {
  //               position: 'top',
  //               ticks: {
  //                 maxRotation: 90,
  //                 minRotation: 80,
  //               },
  //               gridLines: {
  //                 offsetGridLines: true, // et matcher pareil ici
  //               },
  //             },
  //           ],
  //           yAxes: [
  //             {
  //               ticks: {
  //                 beginAtZero: true,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     });
  //
  //     chart.update();
  //   }
  // }, [interpolation]);

  const circleStyles: CSSProperties = useMemo(() => {
    const size = offset * 0.2;
    return {
      ...centerCircleStyles,
      top: (offset - size) / 2,
      left: (offset - size) / 2,
      width: size,
      height: size,
      position: 'absolute',
      borderRadius: '100%',
      border: '3px solid #222',
    };
  }, [offset]);

  const wheelComponent = (
    <>
      {/* <div style={{ width: 800, height: 500, position: 'absolute', marginLeft: '50vw' }}> */}
      {/*  <canvas ref={chartRef} id="chart" width="800" height="500" /> */}
      {/* </div> */}
      <div style={{ width: '95vw', height: '95vh', position: 'absolute' }} ref={wrapper}>
        <canvas
          style={{ transform: `rotate(${rotate}deg)`, transition: 'transform 8s cubic-bezier(.4,.0,.25,1)' }}
          ref={canvas}
        />
        <div style={{ left: offset, top: offset / 2 }} className="wheel-selector" />
        <div style={circleStyles} />
        {!!winnerItem && (
          <div style={{ width: offset, height: offset }} className="wheel-winner">
            {winnerItem.name}
          </div>
        )}
      </div>
    </>
  );

  return { spin, wheelComponent };
};

export default useWheel;
