import { PurchaseStatusEnum } from '@models/purchase.ts';
import { Lot } from '@models/slot.model.ts';

import type { Purchase } from '@reducers/Purchases/Purchases.ts';

export interface PurchaseLog extends Purchase {
  status: PurchaseStatusEnum;
  target?: string;
  rawCost?: number;
}

interface ActionLogEntryBase {
  id: string;
  type: string;
  timestamp: string;
  revertedAt?: string;
}

export interface LotRenamedActionLogEntry extends ActionLogEntryBase {
  type: 'lot.renamed';
  lotId: string;
  previousName: string | null;
  nextName: string | null;
}

export interface LotPriceChangedActionLogEntry extends ActionLogEntryBase {
  type: 'lot.priceChanged';
  lotId: string;
  lotName: string | null;
  previousAmount: number | null;
  nextAmount: number | null;
  amountDelta: number;
  changeValueType?: 'amount' | 'percentage';
}

export interface LotAddedActionLogEntry extends ActionLogEntryBase {
  type: 'lot.added';
  lot: Lot;
}

export interface LotDeletedActionLogEntry extends ActionLogEntryBase {
  type: 'lot.deleted';
  lot: Lot;
}

export interface LotsReplacedActionLogEntry extends ActionLogEntryBase {
  type: 'lots.replaced';
  previousLots: Lot[];
  nextLots: Lot[];
}

export interface AuctionClearedActionLogEntry extends ActionLogEntryBase {
  type: 'auction.cleared';
  previousLots: Lot[];
  previousPurchases: Purchase[];
}

export interface BidLotChange {
  lotId: string;
  lotName: string | null;
  amountDelta: number;
  contributorName: string | null;
  contributorDelta: number;
  wasCreated?: boolean;
  aliasKey?: string | null;
}

export interface BidProcessedActionLogEntry extends ActionLogEntryBase {
  type: 'bid.processed';
  bidLog: PurchaseLog;
  pendingBid: Purchase;
  lotChanges: BidLotChange[];
}

export interface BidSplitActionLogEntry extends ActionLogEntryBase {
  type: 'bid.split';
  bidLogs: PurchaseLog[];
  pendingBid: Purchase;
  lotChanges: BidLotChange[];
}

export interface BidDeletedActionLogEntry extends ActionLogEntryBase {
  type: 'bid.deleted';
  bidLog: PurchaseLog;
  pendingBid: Purchase;
}

export interface BidUpdatedActionLogEntry extends ActionLogEntryBase {
  type: 'bid.updated';
  previousBid: Purchase;
  nextBid: Purchase;
}

export interface BidRedemptionStatusChangedActionLogEntry extends ActionLogEntryBase {
  type: 'bid.redemptionStatusChanged';
  bidIds: string[];
  previousStatus: PurchaseStatusEnum;
  nextStatus: PurchaseStatusEnum;
}

export type ActionLogEntry =
  | LotRenamedActionLogEntry
  | LotPriceChangedActionLogEntry
  | LotAddedActionLogEntry
  | LotDeletedActionLogEntry
  | LotsReplacedActionLogEntry
  | AuctionClearedActionLogEntry
  | BidProcessedActionLogEntry
  | BidSplitActionLogEntry
  | BidDeletedActionLogEntry
  | BidUpdatedActionLogEntry
  | BidRedemptionStatusChangedActionLogEntry;
