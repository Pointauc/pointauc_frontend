import { ArchivedLot, Lot, LotContributor } from '@models/slot.model';
import { contributorsFromLegacyInvestors } from '@utils/slotContributors.utils';

interface LegacyArchivedLot extends ArchivedLot {
  investors?: string[];
}

const getArchivedLotContributors = (lot: LegacyArchivedLot): LotContributor[] => {
  if (lot.contributors) {
    return lot.contributors.filter((contributor) => contributor.name);
  }

  return contributorsFromLegacyInvestors(lot.investors);
};

/**
 * Converts Slot array to ArchivedLot array by omitting runtime-only properties
 */
export function slotsToArchivedLots(slots: Lot[]): ArchivedLot[] {
  return slots.map((slot) => ({
    name: slot.name,
    amount: slot.amount,
    contributors: slot.contributors,
    isFavorite: slot.isFavorite,
  }));
}

/**
 * Converts ArchivedLot array to Slot array by creating new Slot instances
 */
export function archivedLotsToSlots(lots: ArchivedLot[]): Lot[] {
  return lots.map((lot, index) => ({
    id: Math.random().toString(),
    fastId: index + 1,
    name: lot.name,
    amount: lot.amount,
    extra: null,
    contributors: getArchivedLotContributors(lot),
    lockedPercentage: null,
    isFavorite: lot.isFavorite,
  }));
}
