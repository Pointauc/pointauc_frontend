import { Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCrown, IconDiamond, IconHeart, IconTrophy, IconUsers } from '@tabler/icons-react';
import { useElementSize } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import PageContainer from '@components/PageContainer/PageContainer';
import { resetActiveAuctionHistory } from '@domains/auction/history/model/activeAuctionHistorySlice';
import { setCurrentAuctionMetadata } from '@domains/auction/history/lib/currentAuctionMetadata';
import { resetPurchases } from '@reducers/Purchases/Purchases';
import { setSlots } from '@reducers/Slots/Slots';
import { RootState } from '@reducers';

import {
  auctionHistoryQueryKeys,
  useDeleteAuctionHistory,
  useAuctionHistoryAuctions,
  useAuctionHistoryDetails,
  useAuctionHistoryParticipants,
  useAuctionHistoryRangeDetails,
} from '../api/hooks';
import auctionHistoryApi from '../api/IndexedDBAdapter';
import { checkIsAuctionStateEmpty } from '../lib/activeAuctionState';
import {
  formatCompactMoney,
  formatCompactNumber,
  formatDate,
  fromDateKey,
  getPreviousDateKey,
  toDateKey,
} from '../lib/formatters';
import {
  buildAuctionCardSummaries,
  buildParticipantScores,
  createParticipantNameResolver,
  getEffectiveWinnerLot,
  getAuctionTotalAmount,
  getTopContributorName,
  resolveRangeTotals,
  sortParticipantScores,
  type HeatmapMode,
} from '../lib/statistics';
import { buildRestoredAuctionLots } from '../lib/restoreAuctionLots';
import { AUCTION_HISTORY_PAGE_SIZE } from '../model/constants';
import { auctionHistoryMetricColors } from '../config/metricColors';

import AuctionActivitySection from './AuctionActivitySection';
import AuctionLeaderboardPanel, { type AuctionHighlight } from './AuctionLeaderboardPanel';
import LotsList from './LotsList';
import MetricStrip from './MetricStrip';
import SelectedAuctionView from './SelectedAuctionView';

import type { TFunction } from 'i18next';
import type { AuctionHistoryRangeDetails } from '../api/AuctionHistoryApi';
import type { AuctionHistoryAuction } from '../model/types';

type DateRangeValue = [string | null, string | null];

const getAuctionHighlights = ({
  auctions,
  rangeDetails,
  selectedAuction,
  resolveParticipantName,
  t,
}: {
  auctions: AuctionHistoryAuction[];
  rangeDetails: AuctionHistoryRangeDetails;
  selectedAuction?: AuctionHistoryAuction;
  resolveParticipantName: (participantId: string) => string;
  t: TFunction;
}): AuctionHighlight[] => {
  const scores = buildParticipantScores(auctions, rangeDetails, resolveParticipantName);
  const highestPointsContributor = sortParticipantScores(scores, 'points')[0];
  const highestDonationContributor = sortParticipantScores(scores, 'donations')[0];

  if (selectedAuction) {
    const mostActiveParticipant = [...scores].sort((first, second) => second.bidCount - first.bidCount)[0];
    const winnerLot = getEffectiveWinnerLot(rangeDetails.lots, rangeDetails.winnerEvents);
    const winnerName = winnerLot
      ? getTopContributorName(
          winnerLot.id,
          rangeDetails.contributions,
          resolveParticipantName,
          selectedAuction.pointsToDonationRatio,
        )
      : undefined;

    return [
      {
        label: t('auctionHistory.contextStats.mostActiveParticipant'),
        value: mostActiveParticipant?.displayName ?? '-',
        helper: mostActiveParticipant
          ? t('auctionHistory.contextStats.bidsHelper', { count: mostActiveParticipant.bidCount })
          : undefined,
        icon: <IconUsers size={18} />,
        color: 'violet',
      },
      {
        label: t('auctionHistory.contextStats.winner'),
        value: winnerName ?? '-',
        helper: winnerLot?.name,
        icon: <IconCrown size={18} />,
        color: 'yellow',
      },
      {
        label: t('auctionHistory.contextStats.highestPointsContributor'),
        value: highestPointsContributor ? formatCompactNumber(highestPointsContributor.points) : '-',
        helper: highestPointsContributor?.displayName,
        icon: <IconDiamond size={18} />,
        color: 'teal',
      },
      {
        label: t('auctionHistory.contextStats.highestDonationContributor'),
        value: highestDonationContributor ? formatCompactMoney(highestDonationContributor.donationCents) : '-',
        helper: highestDonationContributor?.displayName,
        icon: <IconHeart size={18} />,
        color: 'red',
      },
    ];
  }

  const totalAmountByAuctionId = new Map<string, number>();
  rangeDetails.lots.forEach((lot) => {
    const totalAmount = Number(lot.totalAmount);
    totalAmountByAuctionId.set(
      lot.auctionId,
      (totalAmountByAuctionId.get(lot.auctionId) ?? 0) + (Number.isFinite(totalAmount) ? totalAmount : 0),
    );
  });

  const resolveAuctionTotalAmount = (auction: AuctionHistoryAuction) =>
    getAuctionTotalAmount(auction, totalAmountByAuctionId.get(auction.id) ?? 0);
  const biggestAuction = [...auctions].sort(
    (first, second) => resolveAuctionTotalAmount(second) - resolveAuctionTotalAmount(first),
  )[0];
  const mostGenerousAuction = [...auctions].sort(
    (first, second) => second.totalDonationCents - first.totalDonationCents,
  )[0];
  const highestPointsAuction = [...auctions].sort((first, second) => second.totalPoints - first.totalPoints)[0];
  const mostPopularAuction = [...auctions].sort((first, second) => second.participantCount - first.participantCount)[0];

  return [
    {
      label: t('auctionHistory.contextStats.biggestAuction'),
      value: biggestAuction ? formatCompactNumber(resolveAuctionTotalAmount(biggestAuction)) : '-',
      helper: biggestAuction ? `${biggestAuction.name} · ${formatDate(biggestAuction.startedAt)}` : undefined,
      icon: <IconTrophy size={22} />,
      color: auctionHistoryMetricColors.auctions,
    },
    {
      label: t('auctionHistory.contextStats.mostParticipantsAuction'),
      value: mostPopularAuction ? formatCompactNumber(mostPopularAuction.participantCount) : '-',
      helper: mostPopularAuction
        ? `${mostPopularAuction.name} · ${formatDate(mostPopularAuction.startedAt)}`
        : undefined,
      icon: <IconUsers size={22} />,
      color: auctionHistoryMetricColors.participants,
    },
    {
      label: t('auctionHistory.contextStats.highestPointsAuction'),
      value: highestPointsAuction ? formatCompactNumber(highestPointsAuction.totalPoints) : '-',
      helper: highestPointsAuction
        ? `${highestPointsAuction.name} · ${formatDate(highestPointsAuction.startedAt)}`
        : undefined,
      icon: <IconDiamond size={22} />,
      color: auctionHistoryMetricColors.points,
    },
    {
      label: t('auctionHistory.contextStats.mostGenerousAuction'),
      value: mostGenerousAuction ? formatCompactMoney(mostGenerousAuction.totalDonationCents) : '-',
      helper: mostGenerousAuction
        ? `${mostGenerousAuction.name} · ${formatDate(mostGenerousAuction.startedAt)}`
        : undefined,
      icon: <IconHeart size={22} />,
      color: auctionHistoryMetricColors.donations,
    },
  ];
};

const AuctionHistoryPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { ref: leftPanelRef, height: leftPanelHeight } = useElementSize();
  const [dateRange, setDateRange] = useState<DateRangeValue>([getPreviousDateKey(365), toDateKey(new Date())]);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('auctionCount');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deletingAuctionId, setDeletingAuctionId] = useState<string | null>(null);
  const [restoringAuctionId, setRestoringAuctionId] = useState<string | null>(null);
  const isCurrentAuctionEmpty = useSelector((state: RootState) => checkIsAuctionStateEmpty(state));
  const deleteAuctionMutation = useDeleteAuctionHistory();
  const startDate = dateRange[0] ?? getPreviousDateKey(365);
  const endDate = dateRange[1] ?? dateRange[0] ?? toDateKey(new Date());
  const startAt = fromDateKey(startDate);
  const endAt = fromDateKey(endDate, true);
  const { data: auctions = [], isLoading: isAuctionsLoading } = useAuctionHistoryAuctions(startAt, endAt);
  const { data: rangeDetails = { lots: [], contributions: [], winnerEvents: [] }, isLoading: isRangeLoading } =
    useAuctionHistoryRangeDetails(startAt, endAt);
  const { data: participants = [] } = useAuctionHistoryParticipants();
  const { data: selectedDetails, isLoading: isSelectedLoading } = useAuctionHistoryDetails(selectedAuctionId);

  const resolveParticipantName = useMemo(() => createParticipantNameResolver(participants), [participants]);
  const selectedRangeDetails = useMemo(
    () =>
      selectedDetails
        ? {
            lots: selectedDetails.lots,
            contributions: selectedDetails.contributions,
            winnerEvents: selectedDetails.winnerEvents,
          }
        : null,
    [selectedDetails],
  );
  const panelAuctions = useMemo(
    () => (selectedDetails ? [selectedDetails.auction] : auctions),
    [auctions, selectedDetails],
  );
  const panelRangeDetails = useMemo(() => selectedRangeDetails ?? rangeDetails, [rangeDetails, selectedRangeDetails]);

  const totals = useMemo(
    () => resolveRangeTotals(panelAuctions, panelRangeDetails),
    [panelAuctions, panelRangeDetails],
  );
  const participantScores = useMemo(
    () => buildParticipantScores(panelAuctions, panelRangeDetails, resolveParticipantName),
    [panelAuctions, panelRangeDetails, resolveParticipantName],
  );
  const auctionHighlights = useMemo(
    () =>
      getAuctionHighlights({
        auctions: panelAuctions,
        rangeDetails: panelRangeDetails,
        selectedAuction: selectedDetails?.auction,
        resolveParticipantName,
        t,
      }),
    [panelAuctions, panelRangeDetails, resolveParticipantName, selectedDetails?.auction, t],
  );

  const auctionSummaries = useMemo(
    () => buildAuctionCardSummaries(auctions, rangeDetails, resolveParticipantName),
    [auctions, rangeDetails, resolveParticipantName],
  );
  const filteredSummaries = selectedDay
    ? auctionSummaries.filter((summary) => summary.auction.startedAt.slice(0, 10) === selectedDay)
    : auctionSummaries;
  const totalPages = Math.max(1, Math.ceil(filteredSummaries.length / AUCTION_HISTORY_PAGE_SIZE));
  const visibleSummaries = filteredSummaries.slice(
    (page - 1) * AUCTION_HISTORY_PAGE_SIZE,
    page * AUCTION_HISTORY_PAGE_SIZE,
  );
  const isLoading = isAuctionsLoading || isRangeLoading;
  const isFullAuctionListPage = !selectedAuctionId && visibleSummaries.length === AUCTION_HISTORY_PAGE_SIZE;
  const leaderboardMaxHeight = isFullAuctionListPage && leftPanelHeight > 0 ? leftPanelHeight : undefined;

  const biggestWinningLotName = totals.biggestWinningLot?.name
    ? getTopContributorName(
        totals.biggestWinningLot.id,
        panelRangeDetails.contributions,
        resolveParticipantName,
        panelAuctions.find((auction) => auction.id === totals.biggestWinningLot?.auctionId)?.pointsToDonationRatio ?? 1,
      )
    : undefined;

  const handleDeleteAuction = async (auctionId: string): Promise<void> => {
    setDeletingAuctionId(auctionId);

    try {
      await deleteAuctionMutation.mutateAsync(auctionId);
      if (selectedAuctionId === auctionId) {
        setSelectedAuctionId(null);
      }
      notifications.show({ color: 'green', message: t('auctionHistory.notifications.deleted') });
    } catch (err) {
      console.error(err);
      notifications.show({ color: 'red', message: t('auctionHistory.notifications.deleteError') });
    } finally {
      setDeletingAuctionId(null);
    }
  };

  const handleRestoreAuction = async (auctionId: string): Promise<void> => {
    setRestoringAuctionId(auctionId);

    try {
      const details = await auctionHistoryApi.getDetails(auctionId);
      if (!details) {
        notifications.show({ color: 'red', message: t('auctionHistory.notifications.restoreError') });
        return;
      }

      dispatch(resetActiveAuctionHistory());
      dispatch(resetPurchases());
      dispatch(setSlots(buildRestoredAuctionLots(details, participants)));
      setCurrentAuctionMetadata({
        name: details.auction.name,
        requestsKind: details.auction.requestsKind,
      });
      await queryClient.invalidateQueries({ queryKey: auctionHistoryQueryKeys.nextDefaultName() });
      notifications.show({ color: 'green', message: t('auctionHistory.notifications.restored') });
    } catch (err) {
      console.error(err);
      notifications.show({ color: 'red', message: t('auctionHistory.notifications.restoreError') });
    } finally {
      setRestoringAuctionId(null);
    }
  };

  return (
    <PageContainer title={t('auctionHistory.page.title')}>
      <Stack gap='lg'>
        {isLoading ? (
          <div className='flex min-h-80 items-center justify-center'>
            <Loader />
          </div>
        ) : (
          <div className='flex flex-col gap-4 pb-3'>
            <MetricStrip totals={totals} biggestWinningLotName={biggestWinningLotName} />
            <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,12fr)_5fr]'>
              <Stack ref={leftPanelRef} gap='md'>
                <AuctionActivitySection
                  auctions={auctions}
                  endDate={endDate}
                  heatmapMode={heatmapMode}
                  selectedDay={selectedDay}
                  onHeatmapModeChange={setHeatmapMode}
                  onDaySelect={(dayKey) => {
                    setSelectedDay(dayKey);
                    setSelectedAuctionId(null);
                    setPage(1);
                  }}
                />
                {selectedAuctionId && selectedDetails ? (
                  <SelectedAuctionView
                    details={selectedDetails}
                    participants={participants}
                    onBack={() => setSelectedAuctionId(null)}
                  />
                ) : selectedAuctionId && isSelectedLoading ? (
                  <div className='flex min-h-64 items-center justify-center'>
                    <Loader />
                  </div>
                ) : (
                  <LotsList
                    dateRange={dateRange}
                    selectedDay={selectedDay}
                    visibleSummaries={visibleSummaries}
                    totalPages={totalPages}
                    page={page}
                    onDateRangeChange={(value) => {
                      setDateRange(value);
                      setPage(1);
                      setSelectedDay(null);
                    }}
                    onPageChange={setPage}
                    onClearDayFilter={() => setSelectedDay(null)}
                    onSelectAuction={setSelectedAuctionId}
                    onDeleteAuction={(auctionId) => handleDeleteAuction(auctionId).catch((err) => console.error(err))}
                    onRestoreAuction={handleRestoreAuction}
                    isCurrentAuctionEmpty={isCurrentAuctionEmpty}
                    deletingAuctionId={deletingAuctionId}
                    restoringAuctionId={restoringAuctionId}
                  />
                )}
              </Stack>
              <AuctionLeaderboardPanel
                scores={participantScores}
                totals={totals}
                isSelectedAuction={Boolean(selectedDetails)}
                highlights={auctionHighlights}
                maxHeight={leaderboardMaxHeight}
              />
            </div>
          </div>
        )}
      </Stack>
    </PageContainer>
  );
};

export default AuctionHistoryPage;
