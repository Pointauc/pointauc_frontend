import { isBrowser } from '@utils/ssr';

import type { AuctionRequestsKind, CurrentAuctionMetadata } from '../model/types';

const CURRENT_AUCTION_METADATA_KEY = 'pointauc.currentAuctionMetadata';

export const DEFAULT_AUCTION_REQUESTS_KIND: AuctionRequestsKind = 'any';

const checkIsAuctionRequestsKind = (value: unknown): value is AuctionRequestsKind =>
  value === 'any' || value === 'game' || value === 'movie' || value === 'video';

export const normalizeCurrentAuctionMetadata = (
  metadata: Partial<CurrentAuctionMetadata> | null | undefined,
): CurrentAuctionMetadata => ({
  name: metadata?.name?.trim() ?? '',
  requestsKind: checkIsAuctionRequestsKind(metadata?.requestsKind)
    ? metadata.requestsKind
    : DEFAULT_AUCTION_REQUESTS_KIND,
});

export const getCurrentAuctionMetadata = (): CurrentAuctionMetadata => {
  if (!isBrowser) {
    return normalizeCurrentAuctionMetadata(null);
  }

  try {
    const rawMetadata = localStorage.getItem(CURRENT_AUCTION_METADATA_KEY);
    return normalizeCurrentAuctionMetadata(rawMetadata ? JSON.parse(rawMetadata) : null);
  } catch (err) {
    console.error('Could not read current auction metadata:', err);
    return normalizeCurrentAuctionMetadata(null);
  }
};

export const setCurrentAuctionMetadata = (metadata: CurrentAuctionMetadata): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(CURRENT_AUCTION_METADATA_KEY, JSON.stringify(normalizeCurrentAuctionMetadata(metadata)));
};
