import type { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/DropoutVariant';
import type { WheelFormat } from '@constants/wheel';

export type AuctionHistorySelectionMethod = 'direct' | 'wheel';
export type AuctionHistoryWinnerStatus = 'candidate' | 'confirmed' | 'rerolled';
export type AuctionHistoryWheelVariant = 'default' | 'dropout' | 'battleRoyal';
export type AuctionHistoryDropoutVariant = 'classic' | 'new' | 'none';
export type AuctionRequestsKind = 'any' | 'game' | 'movie' | 'video';

export interface CurrentAuctionMetadata {
  name: string;
  requestsKind: AuctionRequestsKind;
}

export interface AuctionHistoryAuction {
  id: string;
  userId?: string;
  name: string;
  requestsKind: AuctionRequestsKind;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  selectionMethod: AuctionHistorySelectionMethod;
  pointsToDonationRatio: number;
  lotCount: number;
  participantCount: number;
  totalAmount: number;
  totalPoints: number;
  totalDonationCents: number;
  createdAt: string;
  schemaVersion: number;
}

export interface AuctionHistoryLot {
  id: string;
  userId?: string;
  auctionId: string;
  name: string | null;
  totalAmount: number;
  totalPoints: number;
  totalDonationCents: number;
}

export interface AuctionHistoryParticipant {
  id: string;
  syncKey?: string;
  userId?: string;
  displayName: string;
  platformKey: Bid.Source | 'unknown';
  auctionCount: number;
  wonLotCount: number;
  bidCount: number;
  totalPoints: number;
  totalDonationCents: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface AuctionHistoryContribution {
  id: string;
  userId?: string;
  auctionId: string;
  lotId: string;
  participantId: string;
  points: number;
  donationCents: number;
  bidsCount: number;
}

export type AuctionHistoryBidKind = 'points' | 'money';

export interface AuctionHistoryBid {
  id: string;
  userId?: string;
  auctionId: string;
  lotId: string;
  participantId: string;
  kind: AuctionHistoryBidKind;
  amount_cents: number;
  amountCents: number;
  currency: string | null;
  createdAt: string;
}

export interface AuctionHistoryWinnerEvent {
  id: string;
  userId?: string;
  auctionId: string;
  lotId: string;
  method: AuctionHistorySelectionMethod;
  status: AuctionHistoryWinnerStatus;
  randomNumber?: number;
  chancePercent?: number;
  wheelVariant?: AuctionHistoryWheelVariant;
  dropoutVariant?: AuctionHistoryDropoutVariant;
  createdAt: string;
}

export type SyncOperation = 'save' | 'delete';
export type SyncEntityType = 'auction';

export interface SyncQueueItem {
  id: string;
  userId: string;
  operation: SyncOperation;
  entityType: SyncEntityType;
  entityId: string;
  payload?: any;
  createdAt: string;
}

export interface PendingAuctionWinnerEvent {
  id: string;
  runtimeLotId: string;
  method: AuctionHistorySelectionMethod;
  status: AuctionHistoryWinnerStatus;
  randomNumber?: number;
  chancePercent?: number;
  wheelVariant?: AuctionHistoryWheelVariant;
  dropoutVariant?: AuctionHistoryDropoutVariant;
  createdAt: string;
}

export interface AuctionHistorySnapshot {
  auction: AuctionHistoryAuction;
  lots: AuctionHistoryLot[];
  bids: AuctionHistoryBid[];
  participants: AuctionHistoryParticipant[];
  winnerEvents: AuctionHistoryWinnerEvent[];
  contributions?: AuctionHistoryContribution[];
}

export interface BuildAuctionHistorySnapshotParams {
  auctionId: string;
  auctionName: string;
  requestsKind: AuctionRequestsKind;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  pointsToDonationRatio: number;
  lots: import('@models/slot.model').Lot[];
  purchases: import('@reducers/ActionsLog/ActionsLog').PurchaseLog[];
  pendingWinnerEvents: PendingAuctionWinnerEvent[];
}

export interface CreateWheelWinnerCandidateParams {
  runtimeLotId: string;
  randomNumber?: number;
  chancePercent?: number;
  format?: WheelFormat;
  dropoutVariant?: DropoutVariant;
}
