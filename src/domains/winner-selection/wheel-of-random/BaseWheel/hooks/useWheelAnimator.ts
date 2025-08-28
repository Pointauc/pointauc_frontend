import { RefObject, useCallback } from 'react';
import gsap from 'gsap';

// @ts-ignore
import CustomEase from '@utils/CustomEase';
import { random } from '@utils/common.utils.ts';
import { SPIN_PATH } from '@constants/wheel.ts';

window.gsap = gsap;

interface Result {
  animate: (rotation: number, duration: number) => Promise<number>;
}

interface Props {
  wheelCanvas: RefObject<HTMLCanvasElement>;
  onSpin: (rotate: number) => void;
}

const buildSpinPaceCurve = (
  endGuide: Vector2 = { x: 0.808, y: 1 },
  middleGuide: Vector2 = { x: 0.344, y: 0.988 },
): string =>
  `'M0,0,C0.102,0.044,0.171,0.365,0.212,0.542,${middleGuide.x},${middleGuide.y},${endGuide.x},${endGuide.y},1,1'`;
const buildRandomCurve = (): string => {
  const endGuide = { x: random.getFloat(0.75, 0.9), y: random.getFloat(0.95, 1, 2, 'max') };
  const middleGuide = { x: random.getFloat(0.3, 0.4, 2, 'min'), y: random.getFloat(0.8, 1) };

  return buildSpinPaceCurve(endGuide, middleGuide);
};

export const useWheelAnimator = ({ wheelCanvas, onSpin }: Props): Result => {
  const animate = useCallback<Result['animate']>(
    (rotation, duration) => {
      return new Promise<number>((resolve) => {
        if (wheelCanvas.current) {
          const rotationMatch = /rotate\((.*)deg\)/.exec(wheelCanvas.current.style.transform);
          const startRotation = rotationMatch ? Number(rotationMatch[1]) : 0;
          const endPosition = rotation + startRotation;

          gsap.to(wheelCanvas.current, {
            duration,
            ease: CustomEase.create('custom', SPIN_PATH, {
              onUpdate: (progress: number) => onSpin(startRotation + rotation * progress),
            }),
            onComplete: () => {
              resolve(endPosition);
            },
            rotate: endPosition,
          });
        } else {
          resolve(0);
        }
      });
    },
    [onSpin, wheelCanvas],
  );

  return { animate };
};
