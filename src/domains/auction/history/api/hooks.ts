import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import auctionHistoryApi from './IndexedDBAdapter';

import type { AuctionHistorySnapshot } from '../model/types';

export const auctionHistoryQueryKeys = {
  all: ['auction-history'] as const,
  auctions: () => [...auctionHistoryQueryKeys.all, 'auctions'] as const,
  auctionsByRange: (startAt: string, endAt: string) =>
    [...auctionHistoryQueryKeys.auctions(), startAt, endAt] as const,
  participants: () => [...auctionHistoryQueryKeys.all, 'participants'] as const,
  details: (auctionId: string | null) => [...auctionHistoryQueryKeys.all, 'details', auctionId] as const,
  rangeDetails: (startAt: string, endAt: string) =>
    [...auctionHistoryQueryKeys.all, 'range-details', startAt, endAt] as const,
  nextDefaultName: (language?: string) => [...auctionHistoryQueryKeys.all, 'next-default-name', language] as const,
};

export const useAuctionHistoryAuctions = (startAt: string, endAt: string) =>
  useQuery({
    queryKey: auctionHistoryQueryKeys.auctionsByRange(startAt, endAt),
    queryFn: () => auctionHistoryApi.getAuctionsByDateRange(startAt, endAt),
  });

export const useAuctionHistoryParticipants = () =>
  useQuery({
    queryKey: auctionHistoryQueryKeys.participants(),
    queryFn: () => auctionHistoryApi.getParticipants(),
  });

export const useAuctionHistoryDetails = (auctionId: string | null) =>
  useQuery({
    queryKey: auctionHistoryQueryKeys.details(auctionId),
    queryFn: () => (auctionId ? auctionHistoryApi.getDetails(auctionId) : null),
    enabled: Boolean(auctionId),
  });

export const useAuctionHistoryRangeDetails = (startAt: string, endAt: string) =>
  useQuery({
    queryKey: auctionHistoryQueryKeys.rangeDetails(startAt, endAt),
    queryFn: () => auctionHistoryApi.getRangeDetails(startAt, endAt),
  });

export const useNextAuctionHistoryDefaultName = () => {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: auctionHistoryQueryKeys.nextDefaultName(i18n.language),
    queryFn: () => auctionHistoryApi.getNextDefaultName(i18n.language),
  });
};

export const useSaveAuctionHistorySnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (snapshot: AuctionHistorySnapshot) => auctionHistoryApi.saveSnapshot(snapshot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionHistoryQueryKeys.all });
    },
  });
};
