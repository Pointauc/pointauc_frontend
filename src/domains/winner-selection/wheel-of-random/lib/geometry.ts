import { Key } from 'react';

import { WheelItemWithAngle } from '@models/wheel.model';
import { getRandomInclusive, random } from '@utils/common.utils.ts';
import wheelHelpers from '@components/BaseWheel/helpers';

/**
 * Calculate the minimum distance of the wheel spin
 * @param duration - The duration of the spin
 * @returns angle in degrees
 */
export const calculateFixedAngle = (duration: number): number => duration * 270;

interface CalculateRandomSpinDistanceParams {
  duration?: number | null;
  seed?: number | null;
}

/**
 * Calculate spin distance randomly
 * @param duration - The duration of the spin
 * @param seed - The seed of the spin
 * @returns angle in degrees
 */
export const calculateRandomSpinDistance = ({ duration, seed }: CalculateRandomSpinDistanceParams): number => {
  const spinDistance = calculateFixedAngle(duration ?? 0) + (seed ? seed : random.value()) * 360;
  return spinDistance;
};

/**
 * Get the distance to the item based on the id
 * @param id - The id of the item
 * @param items - The items to search in
 * @returns angle in degrees
 */
export const distanceToItem = (id: Key, items: WheelItemWithAngle[]): number => {
  const target = items.find(({ id: itemId }) => itemId === id);

  if (!target) {
    throw new Error(`Item with id ${id} not found`);
  }

  const { startAngle, endAngle } = target;

  const fullCircle = Math.PI * 2;
  const x = getRandomInclusive(startAngle / fullCircle, endAngle / fullCircle);
  return (1 - x) * 360 + 270;
};

interface CalculateWinnerSpinDistanceParams {
  duration?: number | null;
  winnerId: Key;
  items: WheelItemWithAngle[];
}

/**
 * Calculate the total distance to the spin winner
 * @param duration - The duration of the spin
 * @param winnerId - The id of the winner
 * @param items - The items to search in
 * @returns angle in degrees
 */
export const calculateWinnerSpinDistance = ({
  duration,
  winnerId,
  items,
}: CalculateWinnerSpinDistanceParams): number => {
  const localSpin = distanceToItem(winnerId, items);
  return Math.round(calculateFixedAngle(duration ?? 0) / 360) * 360 + localSpin;
};

interface GetWinnerFromDistanceParams {
  distance: number;
  items: WheelItemWithAngle[];
}

/**
 * Get the winner based on the total distance of the wheel spin
 * @param distance - The distance to the winner
 * @param items - The items to search in
 * @returns The winner item
 */
export const getWinnerFromDistance = ({
  distance,
  items,
}: GetWinnerFromDistanceParams): WheelItemWithAngle | undefined => {
  const angle = wheelHelpers.getWheelAngle(distance);

  return items.find(({ startAngle, endAngle }) => angle >= startAngle && angle <= endAngle);
};
