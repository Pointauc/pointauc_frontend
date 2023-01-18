import React, { CSSProperties, Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
// eslint-disable-next-line import/no-named-as-default
import { Button, Dialog, DialogActions, DialogContent, Link, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CustomEase from '../utils/CustomEase';
import { WheelItem, WheelItemWithAngle } from '../models/wheel.model';
import pradenW from '../assets/img/pradenW.png';
import { fitText, shuffle } from '../utils/common.utils';
import SpinPaceService, { RandomPaceConfig } from '../services/SpinPaceService';
import { SPIN_PATH } from '../constants/wheel';
import PredictionService from '../services/PredictionService';
import { addAlert } from '../reducers/notifications/notifications';
import { AlertTypeEnum } from '../models/alert.model';

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
  deleteItem?: (id: Key) => void;
  isShuffle?: boolean;
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
const maxWinnerLength = 35;
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
  deleteItem,
  spinTime = 20,
  dropoutRate = 1,
  isShuffle = true,
}: WheelConfig): WheelResult => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const wheelSelector = useRef<HTMLCanvasElement>(null);
  const spinTarget = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const shuffledItems = useMemo(() => (isShuffle ? shuffle(rawItems) : rawItems), [isShuffle, rawItems]);
  const items = useMemo<WheelItem[]>(
    () => shuffledItems.map(({ amount, ...rest }) => ({ ...rest, amount: (amount || 1) ** dropoutRate })),
    [dropoutRate, shuffledItems],
  );
  const totalSize = useMemo(() => items.reduce((acc, { amount }) => acc + (amount || 1), 0), [items]);
  const [rotate, setRotate] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [winnerItem, setWinnerItem] = useState<WheelItem>();

  const getReverseSize = useCallback(
    (size: number) => PredictionService.getReverseSize(size, totalSize, rawItems.length),
    [rawItems.length, totalSize],
  );

  const normalizedItems = useMemo(() => {
    let angleOffset = 0;
    const actualItems = dropout ? items.map((item) => ({ ...item, amount: getReverseSize(item.amount || 1) })) : items;
    const actualTotalSize = dropout ? actualItems.reduce((acc, { amount }) => acc + (amount || 1), 0) : totalSize;

    return actualItems.map<WheelItemWithAngle>((item) => {
      const size = (item.amount || 1) / actualTotalSize;
      const angle = 2 * Math.PI * size;
      const resultItem = {
        ...item,
        startAngle: angleOffset,
        endAngle: angleOffset + angle,
        name: item.name,
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
    const text = fitText(name, maxTextLength);

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    ctx.textBaseline = 'middle';

    const offsetModifier = -text.length * 0.007 + 1.3;
    const textRadius = (radius - ctx.measureText(text).width) / offsetModifier;
    const centerAngle = endAngle - (endAngle - startAngle) / 2;
    const textCoords = {
      x: textRadius * Math.cos(centerAngle) + borderWidth,
      y: textRadius * Math.sin(centerAngle) + borderWidth,
    };

    ctx.translate(textCoords.x + radius, textCoords.y + radius);
    ctx.rotate(centerAngle);
    ctx.fillText(text, 0, 0);
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

    spinTarget.current.innerHTML = fitText(winner.name, maxWinnerLength);
  };

  const handleWin = (previousRotate: number, nextRotate: number): void => {
    const winner = getWinner(previousRotate, nextRotate);

    if (winner && spinTarget.current) {
      onWin(winner);
      setWinnerItem(winner);
      spinTarget.current.innerHTML = fitText(winner.name, maxWinnerLength);
    }
  };

  const animateWheel = (previousRotate: number, nextRotate: number, paceConfig?: RandomPaceConfig): number => {
    if (canvas.current) {
      const wheelPath = paceConfig ? new SpinPaceService(paceConfig, 270 * spinTime, spinTime).createPath() : SPIN_PATH;
      const realSpinChange = Number(wheelPath.split(',').splice(-1, 1)[0]) * (nextRotate - previousRotate);

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
    drawWheel();
  };

  useEffect(() => {
    resizeCanvas(canvas.current);
    resizeCanvas(wheelSelector.current);
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
      spinTarget.current.innerHTML = t('wheel.winner');
    }
  }, [t]);

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

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setDialogOpen((prev) => !prev);
  };

  const deleteWinner = () => {
    if (deleteItem && winnerItem) {
      deleteItem(winnerItem.id);
      toggleDialog();
      dispatch(addAlert({ type: AlertTypeEnum.Success, message: 'лот был удален' }));
    }
  };

  const wheelComponent = (
    <div
      style={{ width: '0', height: '100%', display: 'inline-block', marginRight: 45, pointerEvents: 'none' }}
      ref={wrapper}
    >
      <Dialog open={dialogOpen} onClose={toggleDialog}>
        <DialogContent>
          <Typography>Это действие удалит лот не только из колеса, но и из самого аукциона.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteWinner} variant="outlined" color="secondary">
            {t('wheel.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ width: offset }} className="wheel-target" ref={spinTarget}>
        {t('wheel.winner')}
      </div>
      <canvas style={{ position: 'absolute', zIndex: 1 }} ref={wheelSelector} />
      <canvas ref={canvas} />
      <div style={circleStyles} />
      {!!winnerItem && (
        <div style={{ width: offset, height: offset, pointerEvents: 'all' }} className="wheel-winner">
          {winnerItem.name.startsWith('https://') ? (
            <Link href={winnerItem.name} target="_blank">
              {winnerItem.name}
            </Link>
          ) : (
            <>{winnerItem.name}</>
          )}
          {deleteItem && !dropout && (
            <Button onClick={toggleDialog} variant="outlined" color="secondary">
              {t('wheel.deleteLot')}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return { spin, wheelComponent, clearWinner };
};

export default useWheel;
