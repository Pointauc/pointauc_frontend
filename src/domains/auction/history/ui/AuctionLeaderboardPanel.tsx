import { useMemo, useState, type CSSProperties } from 'react';

import {
  sortParticipantScores,
  type LeaderboardSort,
  type ParticipantScore,
  type RangeTotals,
} from '../lib/statistics';

import AuctionsHighlights, { type AuctionHighlight } from './AuctionsHighlights';
import AuctionLeaderboardCard from './AuctionLeaderboardCard';
import ContributionBreakdownCard from './ContributionBreakdownCard';

export type { AuctionHighlight };

interface AuctionLeaderboardPanelProps {
  scores: ParticipantScore[];
  totals: RangeTotals;
  isSelectedAuction: boolean;
  highlights: AuctionHighlight[];
  maxHeight?: number;
}

interface ContributionShares {
  pointsShare: number;
  donationShare: number;
}

const leaderboardCollapsedLimit = 5;
const leaderboardExpandedLimit = 16;

const getContributionShares = (totals: RangeTotals): ContributionShares => {
  if (!totals.weightedTotal) {
    return { pointsShare: 0, donationShare: 0 };
  }

  return {
    pointsShare: ((totals.weightedTotal - totals.weightedDonationPoints) / totals.weightedTotal) * 100,
    donationShare: (totals.weightedDonationPoints / totals.weightedTotal) * 100,
  };
};

const AuctionLeaderboardPanel = ({
  scores,
  totals,
  isSelectedAuction,
  highlights,
  maxHeight,
}: AuctionLeaderboardPanelProps) => {
  const [sort, setSort] = useState<LeaderboardSort>('wins');
  const [isExpanded, setIsExpanded] = useState(false);
  const sortOptions: LeaderboardSort[] = isSelectedAuction
    ? ['wins', 'points', 'donations', 'participation']
    : ['wins', 'points', 'donations', 'participation', 'streak'];
  const sortedScores = useMemo(() => sortParticipantScores(scores, sort), [scores, sort]);
  const visibleScores = isExpanded
    ? sortedScores.slice(0, leaderboardExpandedLimit)
    : sortedScores.slice(0, leaderboardCollapsedLimit);
  const { pointsShare, donationShare } = getContributionShares(totals);
  const maxHeightStyle = maxHeight
    ? ({ '--auction-leaderboard-max-height': `${maxHeight}px` } as CSSProperties)
    : undefined;
  const maxHeightClassName = maxHeight ? 'xl:max-h-[var(--auction-leaderboard-max-height)]' : '';

  if (isExpanded) {
    return (
      <div className='xl:sticky xl:top-4'>
        <AuctionLeaderboardCard
          sort={sort}
          sortOptions={sortOptions}
          sortedScores={sortedScores}
          visibleScores={visibleScores}
          isExpanded={isExpanded}
          hasMoreScores={sortedScores.length > leaderboardCollapsedLimit}
          onSortChange={setSort}
          onExpandedChange={setIsExpanded}
        />
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 xl:sticky xl:top-4 xl:min-h-0 xl:grid-rows-[auto_minmax(0,1fr)] xl:overflow-hidden ${maxHeightClassName}`}
      style={maxHeightStyle}
    >
      <AuctionLeaderboardCard
        sort={sort}
        sortOptions={sortOptions}
        sortedScores={sortedScores}
        visibleScores={visibleScores}
        isExpanded={isExpanded}
        hasMoreScores={sortedScores.length > leaderboardCollapsedLimit}
        onSortChange={setSort}
        onExpandedChange={setIsExpanded}
      />
      <div className='grid min-h-0 gap-3 xl:grid-rows-[minmax(0,1fr)_auto]'>
        <ContributionBreakdownCard
          totals={totals}
          pointsShare={pointsShare}
          donationShare={donationShare}
          className='xl:h-full'
        />
        <AuctionsHighlights highlights={highlights} />
      </div>
    </div>
  );
};

export default AuctionLeaderboardPanel;
