import type {
  AuctionHistoryAuction,
  AuctionHistoryContribution,
  AuctionHistoryLot,
  AuctionHistoryParticipant,
  AuctionHistorySnapshot,
  AuctionHistoryWinnerEvent,
} from '../model/types';

export interface AuctionHistoryDetails {
  auction: AuctionHistoryAuction;
  lots: AuctionHistoryLot[];
  contributions: AuctionHistoryContribution[];
  winnerEvents: AuctionHistoryWinnerEvent[];
}

export interface AuctionHistoryRangeDetails {
  lots: AuctionHistoryLot[];
  contributions: AuctionHistoryContribution[];
  winnerEvents: AuctionHistoryWinnerEvent[];
}

abstract class AuctionHistoryApi {
  abstract getAuctions(): Promise<AuctionHistoryAuction[]>;
  abstract getAuctionsByDateRange(startAt: string, endAt: string): Promise<AuctionHistoryAuction[]>;
  abstract getParticipants(): Promise<AuctionHistoryParticipant[]>;
  abstract getDetails(auctionId: string): Promise<AuctionHistoryDetails | null>;
  abstract getRangeDetails(startAt: string, endAt: string): Promise<AuctionHistoryRangeDetails>;
  abstract saveSnapshot(snapshot: AuctionHistorySnapshot): Promise<void>;
  abstract deleteAuction(auctionId: string): Promise<void>;
  abstract getNextDefaultName(language?: string): Promise<string>;
}

export default AuctionHistoryApi;
