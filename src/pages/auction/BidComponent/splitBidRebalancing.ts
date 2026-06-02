import { distributeEvenly, normalizeSplitAmount } from './splitBidSuggestions';

import type { SplitBidDraftEntry } from './splitBidTypes';

const MIN_SPLIT_AMOUNT = 0.01;

export const createEmptySplitEntry = (amount: number, totalAmount: number): SplitBidDraftEntry => ({
  id: Math.random().toString(),
  lotInput: '',
  target: { type: 'new', name: '' },
  amount,
  percentage: totalAmount > 0 ? normalizeSplitAmount((amount / totalAmount) * 100) : 0,
});

export const getPercentageFromAmount = (amount: number, totalAmount: number): number =>
  totalAmount > 0 ? normalizeSplitAmount((amount / totalAmount) * 100) : 0;

export const syncSplitPercentages = (entries: SplitBidDraftEntry[], totalAmount: number): SplitBidDraftEntry[] =>
  entries.map((entry) => ({
    ...entry,
    amount: normalizeSplitAmount(entry.amount),
    percentage: getPercentageFromAmount(entry.amount, totalAmount),
  }));

export const distributeRemovedAmount = (
  entries: SplitBidDraftEntry[],
  amount: number,
  totalAmount: number,
): SplitBidDraftEntry[] => {
  if (!entries.length || amount <= 0) {
    return syncSplitPercentages(entries, totalAmount);
  }

  const totalWeight = entries.reduce((total, entry) => total + Math.max(entry.amount, 0), 0);
  let remainingAmount = normalizeSplitAmount(amount);

  return syncSplitPercentages(
    entries.map((entry, index) => {
      const isLastEntry = index === entries.length - 1;
      const weight = totalWeight > 0 ? Math.max(entry.amount, 0) / totalWeight : 1 / entries.length;
      const amountToAdd = isLastEntry ? remainingAmount : normalizeSplitAmount(amount * weight);
      remainingAmount = normalizeSplitAmount(remainingAmount - amountToAdd);

      return {
        ...entry,
        amount: normalizeSplitAmount(entry.amount + amountToAdd),
      };
    }),
    totalAmount,
  );
};

export const rebalanceEntriesByEditedAmount = (
  entries: SplitBidDraftEntry[],
  editedEntryId: string,
  requestedAmount: number,
  totalAmount: number,
): SplitBidDraftEntry[] => {
  const editedEntry = entries.find((entry) => entry.id === editedEntryId);

  if (!editedEntry || entries.length <= 1) {
    return syncSplitPercentages(
      entries.map((entry) =>
        entry.id === editedEntryId ? { ...entry, amount: normalizeSplitAmount(requestedAmount) } : entry,
      ),
      totalAmount,
    );
  }

  const otherEntries = entries.filter((entry) => entry.id !== editedEntryId);
  const minimumOtherTotal =
    totalAmount >= entries.length * MIN_SPLIT_AMOUNT ? otherEntries.length * MIN_SPLIT_AMOUNT : 0;
  const editedAmount = normalizeSplitAmount(
    Math.min(Math.max(requestedAmount, 0), Math.max(totalAmount - minimumOtherTotal, 0)),
  );
  const otherTargetTotal = normalizeSplitAmount(Math.max(totalAmount - editedAmount, 0));
  const otherCurrentTotal = otherEntries.reduce((total, entry) => total + Math.max(entry.amount, 0), 0);
  let remainingOtherAmount = otherTargetTotal;
  const adjustedOtherEntries = otherEntries.map((entry, index) => {
    const isLastEntry = index === otherEntries.length - 1;
    const weight = otherCurrentTotal > 0 ? Math.max(entry.amount, 0) / otherCurrentTotal : 1 / otherEntries.length;
    const baseAmount = minimumOtherTotal > 0 ? MIN_SPLIT_AMOUNT : 0;
    const weightedAmount = normalizeSplitAmount(Math.max(otherTargetTotal - minimumOtherTotal, 0) * weight);
    const amount = isLastEntry ? remainingOtherAmount : normalizeSplitAmount(baseAmount + weightedAmount);
    remainingOtherAmount = normalizeSplitAmount(remainingOtherAmount - amount);

    return { ...entry, amount };
  });
  const adjustedById = new Map(adjustedOtherEntries.map((entry) => [entry.id, entry]));

  return syncSplitPercentages(
    entries.map((entry) =>
      entry.id === editedEntryId ? { ...entry, amount: editedAmount } : adjustedById.get(entry.id) ?? entry,
    ),
    totalAmount,
  );
};

export const getSuggestedPercentageAmount = (percentage: number, totalAmount: number): number => {
  if (percentage === 33 && totalAmount % 3 === 0) {
    return totalAmount / 3;
  }

  return normalizeSplitAmount((totalAmount * (percentage === 33 ? 33.3 : percentage)) / 100);
};

export const addSplitEntry = (
  entries: SplitBidDraftEntry[],
  remainingAmount: number,
  totalAmount: number,
): SplitBidDraftEntry[] => {
  const nextEntries = [...entries, createEmptySplitEntry(Math.max(remainingAmount, 0), totalAmount)];

  return remainingAmount > 0
    ? syncSplitPercentages(nextEntries, totalAmount)
    : distributeEvenly(nextEntries, totalAmount);
};
