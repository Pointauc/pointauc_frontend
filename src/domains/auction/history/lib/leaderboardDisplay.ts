import { formatCompactMoney, formatCompactNumber } from './formatters';

import type { LeaderboardSort, ParticipantScore } from './statistics';

export const getParticipantInitials = (displayName: string): string => displayName.slice(0, 2).toUpperCase();

export const getParticipantScoreValue = (score: ParticipantScore, sort: LeaderboardSort): string => {
  if (sort === 'points') {
    return formatCompactNumber(score.points);
  }

  if (sort === 'donations') {
    return formatCompactMoney(score.donationCents);
  }

  if (sort === 'participation') {
    return String(score.participation);
  }

  if (sort === 'streak') {
    return String(score.streak);
  }

  return String(score.wins);
};
