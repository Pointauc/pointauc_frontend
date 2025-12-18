import { Slot } from '@models/slot.model';

/**
 * Calculates the total sum of locked percentages across all slots
 */
export const calculateTotalLockedPercentage = (slots: Slot[]): number => {
  return slots.reduce((sum, slot) => {
    return sum + (slot.lockedPercentage ?? 0);
  }, 0);
};

/**
 * Calculates the amount for a locked slot based on total of other (non-locked) lots
 * Formula: lockedAmount = totalOfOtherLots * (lockedPercentage / (100 - totalLockedPercentage))
 */
export const calculateLockedAmount = (
  totalOfOtherLots: number,
  lockedPercentage: number,
  totalLockedPercentage: number,
): number => {
  const denominator = 100 - totalLockedPercentage;
  if (denominator <= 0) return 0;

  return totalOfOtherLots * (lockedPercentage / denominator);
};

/**
 * Recalculates all locked slots based on current state
 * Returns a new slots array with updated amounts for locked slots
 */
export const recalculateAllLockedSlots = (
  slots: Slot[],
  extraLockedLot?: { id: string | number; percentage: number },
): Slot[] => {
  let totalLockedPercentage: number = 0;
  let totalOfOtherLots: number = 0;

  const getLotLockedPercentage = (slot: Slot): number => {
    if (extraLockedLot?.id === slot.id) {
      return extraLockedLot.percentage;
    }
    return slot.lockedPercentage ?? 0;
  };

  slots.forEach((slot) => {
    const lockedPercentage = getLotLockedPercentage(slot);
    if (lockedPercentage > 0) {
      totalLockedPercentage += lockedPercentage;
    } else if (slot.amount != null && slot.amount > 0) {
      totalOfOtherLots += slot.amount;
    }
  });

  // If no locked slots or total locked >= 100%, return slots as is
  if (totalLockedPercentage === 0 || totalLockedPercentage >= 100) {
    return slots;
  }

  // Update locked slots with recalculated amounts
  return slots.map((slot) => {
    const lockedPercentage = getLotLockedPercentage(slot);
    if (lockedPercentage > 0) {
      const newAmount = calculateLockedAmount(totalOfOtherLots, lockedPercentage, totalLockedPercentage);
      return { ...slot, amount: newAmount };
    }
    return slot;
  });
};
