import { RefObject, useCallback, useMemo, useState } from 'react';

import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import useInitWrapper from '@domains/winner-selection/wheel-of-random/lib/strategy/useInitWrapper';
import { WheelItem } from '@models/wheel.model';
import { getSlotFromSeed } from '@services/PredictionService';
import { random } from '@utils/common.utils.ts';

import useDropoutSpinEnd from './useDropoutSpinEnd';

/**
 * "Pointer" dropout variant.
 *
 * Sectors keep their normal size — proportional to the lot bid, exactly like the
 * default wheel. The elimination is NOT recalculated by any inverse-percentage
 * math: it is decided purely by where the pointer physically stops. A bigger bid
 * means a bigger sector and therefore a higher chance the pointer lands on it, and
 * whoever the arrow points at is eliminated. "На ком остановится, тот и выбьется".
 */
const usePointerDropout = (controller: RefObject<WheelController | null>): Wheel.FormatHook => {
  const [_items, setItems] = useState<WheelItem[] | undefined>();
  const items = useMemo(() => _items || [], [_items]);

  const { initialItems, init } = useInitWrapper(setItems);

  // Keep the real bid as the slice size — no inversion, so the wheel looks like a
  // regular proportional wheel.
  const displayItems = useMemo(
    () => items.map((item) => ({ ...item, originalAmount: item.amount })),
    [items],
  );

  const onSpinEnd = useDropoutSpinEnd({ controller, setItems });

  const getNextWinnerId = ({ items }: Wheel.GetNextWinnerIdParams): Wheel.GetNextWinnerIdResult => {
    // Pick proportionally to the rendered sector sizes — i.e. exactly where the
    // pointer stops. No separate percentage logic for who drops out.
    const seed = random.value();
    const eliminatedItemId = items[getSlotFromSeed(items, seed)].id;
    const finalWinnerId = items.find(({ id }) => id !== eliminatedItemId)?.id;
    const isFinalSpin = items.length === 2 && finalWinnerId != null;

    return { id: eliminatedItemId, isFinalSpin, finalWinnerId };
  };

  const reset = useCallback(() => {
    setItems(initialItems);
    controller.current?.clearWinner();
    controller.current?.resetPosition();
  }, [controller, initialItems]);

  return {
    items: displayItems,
    init,
    getNextWinnerId,
    onSpinEnd,
    reset,
  };
};

export default usePointerDropout;
