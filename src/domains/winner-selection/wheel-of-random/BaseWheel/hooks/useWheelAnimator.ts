import { useCallback } from 'react';
import gsap from 'gsap';

// @ts-ignore
import CustomEase from '@utils/CustomEase';
import { random } from '@utils/common.utils.ts';
import { SPIN_PATH } from '@constants/wheel.ts';

window.gsap = gsap;

interface Result {
  animate: (rotation: number, duration: number) => Promise<number>;
  getCurrentRotation: () => number;
}

interface Props {
  getCurrentRotation: () => number;
  setRotation: (rotation: number) => void;
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

export const useWheelAnimator = ({ getCurrentRotation, setRotation, onSpin }: Props): Result => {
  const animate = useCallback<Result['animate']>(
    (rotation, duration) => {
      return new Promise<number>((resolve) => {
        const startRotation = getCurrentRotation();
        const endPosition = rotation + startRotation;
        const animationState = { rotation: startRotation };

        gsap.to(animationState, {
          duration,
          ease: CustomEase.create('custom', SPIN_PATH),
          rotation: endPosition,
          onUpdate: () => {
            setRotation(animationState.rotation);
            onSpin(animationState.rotation);
          },
          onComplete: () => {
            setRotation(endPosition);
            resolve(endPosition);
          },
        });
      });
    },
    [getCurrentRotation, onSpin, setRotation],
  );

  return { animate, getCurrentRotation };
};
