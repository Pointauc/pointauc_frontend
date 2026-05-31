import { findBestMatch } from 'string-similarity';

import type { Lot } from '@models/slot.model';
import type { LotSuggestion, SplitBidDraftEntry } from './splitBidTypes';

const SIMILARITY_THRESHOLD = 0.4;
const DIRECTION_WORD_PATTERN = String.raw`(?:to|for|\u043d\u0430|\u0432|\u043a|\u0437\u0430)`;
const COST_UNIT_PATTERN = String.raw`(?:pts?|points?|rub|usd|eur|\$|€|₽|\u0440|\u0440\u0443\u0431|\u0431\u0430\u043b\u043b(?:\u043e\u0432|\u0430)?)`;
const SPLIT_SEPARATOR_PATTERN = /\s*(?:\n|;|,|\+|\||&|\band\b|\bи\b)\s*/gi;
const EVEN_SEPARATOR_PATTERN = /\s*(?:\n|;|,|\+|\/|\||&|\band\b|\bи\b)\s*/gi;

const roundAmount = (value: number): number => Math.round(value * 100) / 100;

const normalizeText = (value: string): string => value.trim().replace(/\s+/g, ' ');

const cleanSplitName = (value: string, removeBoundaryAmounts = true): string => {
  const withoutPercentages = value.replace(/\d+(?:[.,]\d+)?\s*%/g, '');
  const withoutDirections = withoutPercentages.replace(new RegExp(String.raw`\b${DIRECTION_WORD_PATTERN}\b`, 'gi'), ' ');

  if (!removeBoundaryAmounts) {
    return normalizeText(withoutDirections);
  }

  return normalizeText(
    withoutDirections
      .replace(new RegExp(String.raw`^\s*\d+(?:[.,]\d+)?(?:\s*${COST_UNIT_PATTERN})?\s*`, 'gi'), ' ')
      .replace(new RegExp(String.raw`\s*\d+(?:[.,]\d+)?(?:\s*${COST_UNIT_PATTERN})?\s*$`, 'gi'), ' '),
  );
};

const parseNumber = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(',', '.'));

  return Number.isFinite(parsed) ? parsed : null;
};

const buildEntry = (name: string, amount: number, totalAmount: number): SplitBidDraftEntry => ({
  id: Math.random().toString(),
  lotInput: name,
  target: { type: 'new', name },
  amount: roundAmount(amount),
  percentage: totalAmount > 0 ? roundAmount((amount / totalAmount) * 100) : 0,
});

export const getSuggestedLot = (input: string, lots: Lot[]): LotSuggestion | null => {
  const lotNames = lots.map(({ name }) => String(name || ''));
  const searchValue = input.trim();

  if (!searchValue || !lotNames.length) {
    return null;
  }

  const {
    bestMatch: { rating },
    bestMatchIndex,
  } = findBestMatch(searchValue, lotNames);

  return rating > SIMILARITY_THRESHOLD ? { lot: lots[bestMatchIndex], rating } : null;
};

const parseWeightedSegments = (segments: string[], totalAmount: number): SplitBidDraftEntry[] => {
  const parsedSegments = segments
    .map((segment) => {
      const percentage = parseNumber(segment.match(/(\d+(?:[.,]\d+)?)\s*%/)?.[1]);
      const leadingAmount = parseNumber(segment.match(/^\s*(\d+(?:[.,]\d+)?)/)?.[1]);
      const trailingAmount = parseNumber(segment.match(/(\d+(?:[.,]\d+)?)\s*$/)?.[1]);
      const amount = percentage != null ? roundAmount((totalAmount * percentage) / 100) : leadingAmount ?? trailingAmount;
      const name = cleanSplitName(segment);

      return name && amount != null && amount > 0 ? { amount, name } : null;
    })
    .filter((segment): segment is { amount: number; name: string } => Boolean(segment));

  if (parsedSegments.length < 2) {
    return [];
  }

  return parsedSegments.map(({ amount, name }) => buildEntry(name, amount, totalAmount));
};

const parseAmountMarkerSegments = (message: string, totalAmount: number): SplitBidDraftEntry[] => {
  const markerRegex = new RegExp(
    String.raw`(^|\s)(\d+(?:[.,]\d+)?)(?:\s*${COST_UNIT_PATTERN})?(\s+${DIRECTION_WORD_PATTERN}\s+|\s+)`,
    'gi',
  );
  const markers = [...message.matchAll(markerRegex)]
    .map((match) => {
      const prefix = match[1] ?? '';
      const directionPart = match[3] ?? '';
      const amount = parseNumber(match[2]);
      const startsAtMessageStart = match.index === 0 || message.slice(0, match.index).trim().length === 0;
      const hasDirectionWord = new RegExp(DIRECTION_WORD_PATTERN, 'i').test(directionPart);
      const canUseAmountAsMarker = amount != null && amount >= 10;

      if (!startsAtMessageStart && !hasDirectionWord && !canUseAmountAsMarker) {
        return null;
      }

      return {
        amount,
        markerStart: match.index + prefix.length,
        nameStart: match.index + match[0].length,
      };
    })
    .filter(
      (marker): marker is { amount: number; markerStart: number; nameStart: number } =>
        marker?.amount != null && marker.amount > 0,
    );

  if (markers.length < 2) {
    return [];
  }

  const parsedSegments = markers
    .map((marker, index) => {
      const nextMarker = markers[index + 1];
      const rawName = message.slice(marker.nameStart, nextMarker?.markerStart ?? message.length);
      const name = cleanSplitName(rawName, false);

      return name ? { amount: marker.amount, name } : null;
    })
    .filter((segment): segment is { amount: number; name: string } => Boolean(segment));

  return parsedSegments.length > 1
    ? parsedSegments.map(({ amount, name }) => buildEntry(name, amount, totalAmount))
    : [];
};

const parseEvenSegments = (message: string, totalAmount: number): SplitBidDraftEntry[] => {
  const segments = message
    .split(EVEN_SEPARATOR_PATTERN)
    .map((segment) => cleanSplitName(segment, false))
    .filter((segment) => segment.length > 0);

  if (segments.length < 2) {
    return [];
  }

  const baseAmount = roundAmount(totalAmount / segments.length);
  let remainingAmount = totalAmount;

  return segments.map((segment, index) => {
    const amount = index === segments.length - 1 ? roundAmount(remainingAmount) : baseAmount;
    remainingAmount = roundAmount(remainingAmount - amount);

    return buildEntry(segment, amount, totalAmount);
  });
};

export const buildSmartSplitEntries = (message: string, totalAmount: number): SplitBidDraftEntry[] => {
  const normalizedMessage = normalizeText(message);
  const weightedEntries = parseWeightedSegments(normalizedMessage.split(SPLIT_SEPARATOR_PATTERN), totalAmount);

  if (weightedEntries.length > 1) {
    return weightedEntries;
  }

  const amountMarkerEntries = parseAmountMarkerSegments(normalizedMessage, totalAmount);

  if (amountMarkerEntries.length > 1) {
    return amountMarkerEntries;
  }

  const evenEntries = parseEvenSegments(normalizedMessage, totalAmount);

  return evenEntries.length > 1 ? evenEntries : [buildEntry(normalizedMessage, totalAmount, totalAmount)];
};

export const applyLotSuggestions = (entries: SplitBidDraftEntry[], lots: Lot[]): SplitBidDraftEntry[] =>
  entries.map((entry) => {
    const suggestion = getSuggestedLot(entry.lotInput, lots);

    if (!suggestion) {
      return entry;
    }

    return {
      ...entry,
      lotInput: String(suggestion.lot.name || entry.lotInput),
      target: { type: 'existing', lotId: suggestion.lot.id, name: suggestion.lot.name },
    };
  });

export const distributeEvenly = (entries: SplitBidDraftEntry[], totalAmount: number): SplitBidDraftEntry[] => {
  if (!entries.length) {
    return entries;
  }

  const baseAmount = roundAmount(totalAmount / entries.length);
  let remainingAmount = totalAmount;

  return entries.map((entry, index) => {
    const amount = index === entries.length - 1 ? roundAmount(remainingAmount) : baseAmount;
    remainingAmount = roundAmount(remainingAmount - amount);

    return {
      ...entry,
      amount,
      percentage: totalAmount > 0 ? roundAmount((amount / totalAmount) * 100) : 0,
    };
  });
};

export const normalizeSplitAmount = roundAmount;
