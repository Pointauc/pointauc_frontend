import { RefObject, useCallback } from 'react';
import gsap from 'gsap';

// @ts-ignore
import CustomEase from '@utils/CustomEase';
import { SPIN_PATH } from '@constants/wheel.ts';

window.gsap = gsap;

interface Result {
  animate: (rotation: number) => Promise<number>;
}

interface Props {
  wheelCanvas: RefObject<HTMLCanvasElement>;
  spinTime: number;
  onSpin: (rotate: number) => void;
}

export const useWheelAnimator = ({ wheelCanvas, spinTime, onSpin }: Props): Result => {
  const animate = useCallback<Result['animate']>(
    (rotation) => {
      return new Promise<number>((resolve) => {
        if (wheelCanvas.current) {
          const rotationMatch = /rotate\((.*)deg\)/.exec(wheelCanvas.current.style.transform);
          const startRotation = rotationMatch ? Number(rotationMatch[1]) : 0;
          const endPosition = rotation + startRotation;

          gsap.to(wheelCanvas.current, {
            duration: spinTime,
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
    [onSpin, spinTime, wheelCanvas],
  );

  return { animate };
};
