import bidUtils from '@utils/bid.utils.ts';
import { numberUtils } from '@utils/common/number.ts';

import { OXYGEN_DONUTS_ID } from './config';

import type { Purchase } from '@reducers/Purchases/Purchases.ts';

/**
 * The part of a `donation.created` payload the auction needs.
 * Both donation kinds (`donation` and `meme`) are bids.
 */
export interface OxygenDonutsDonation {
  id: string;
  donor_name: string | null;
  message: string | null;
  /** US dollars as text, e.g. "12.50". `null` when the dollar value of the payment is unknown. */
  amount_usd: string | null;
  paid_at: string;
}

interface BidParams {
  /** Auction units per one US dollar. */
  rate: number;
  anonymousName: string;
}

/**
 * Converts a donation to a bid. Returns `null` when the donation has no usable dollar amount.
 */
export const mapDonationToBid = (
  donation: OxygenDonutsDonation,
  { rate, anonymousName }: BidParams,
): Purchase | null => {
  if (donation.amount_usd == null) return null;

  const cost = numberUtils.roundFixed(Number(donation.amount_usd) * rate, 2);
  if (!bidUtils.isValidCost(cost)) return null;

  return {
    id: donation.id,
    username: donation.donor_name?.trim() || anonymousName,
    message: donation.message ?? '',
    timestamp: donation.paid_at,
    cost,
    color: '#000000',
    isDonation: true,
    source: OXYGEN_DONUTS_ID,
  };
};
