import type {
  AuctionHistoryAuction,
  AuctionHistoryBid,
  AuctionHistoryContribution,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
  AuctionHistoryWinnerEvent,
} from '../model/types';

export interface AuctionHistoryDetails {
  auction: AuctionHistoryAuction;
  lots: AuctionHistoryLot[];
  bids: AuctionHistoryBid[];
  winnerEvents: AuctionHistoryWinnerEvent[];
  contributions?: AuctionHistoryContribution[];
}

export interface AuctionHistoryRangeDetails {
  lots: AuctionHistoryLot[];
  bids: AuctionHistoryBid[];
  winnerEvents: AuctionHistoryWinnerEvent[];
  contributions?: AuctionHistoryContribution[];
}

abstract class AuctionHistoryApi {
  abstract getAuctions(userId?: string): Promise<AuctionHistoryAuction[]>;
  abstract getAuctionsByDateRange(startAt: string, endAt: string, userId?: string): Promise<AuctionHistoryAuction[]>;
  abstract getParticipants(userId?: string): Promise<AuctionHistoryParticipant[]>;
  abstract getDetails(auctionId: string, userId?: string): Promise<AuctionHistoryDetails | null>;
  abstract getRangeDetails(startAt: string, endAt: string, userId?: string): Promise<AuctionHistoryRangeDetails>;
  abstract saveSnapshot(snapshot: AuctionHistorySnapshot, userId?: string): Promise<void>;
  abstract deleteAuction(auctionId: string, userId?: string): Promise<void>;
  abstract getNextDefaultName(language?: string, userId?: string): Promise<string>;
}

export default AuctionHistoryApi;
