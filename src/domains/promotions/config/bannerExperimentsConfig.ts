import posthog from 'posthog-js';

import { BannerExperimentsConfig } from '@domains/promotions/model/experimentTypes';

// ============================================================================
// Local Development: Force AB Testing Variants
// Uncomment the snippet below to force specific variants locally:
// ============================================================================
// if (typeof window !== 'undefined') {
//   if (!posthog.__loaded) {
//     posthog.init('dev-dummy-key', {
//       api_host: 'https://us.i.posthog.com',
//       autocapture: false,
//       advanced_disable_decide: true,
//       disable_session_recording: true,
//     });
//   }
//   posthog.featureFlags?.override({
//     'promotion-banner-slots': 'auction_slot', // 'standard' | 'auction_slot'
//     'promotion-banner-frequency': 'probabilistic', // 'probabilistic' | 'frequency_capped'
//   });
// }

export const DEFAULT_FREQUENCY_CAPPED_PARAMS = {
  maxImpressions: 3,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
};

export const DEFAULT_BANNER_EXPERIMENTS_CONFIG: BannerExperimentsConfig = {
  frequency: {
    key: 'promotion-banner-frequency',
    enabled: true,
    variants: ['probabilistic', 'frequency_capped'] as const,
    ratios: {
      probabilistic: 0.5,
      frequency_capped: 0.5,
    },
    defaultVariant: 'probabilistic',
    params: DEFAULT_FREQUENCY_CAPPED_PARAMS,
  },
  slots: {
    key: 'promotion-banner-slots',
    enabled: true,
    variants: ['standard', 'auction_slot'] as const,
    ratios: {
      standard: 0.9,
      auction_slot: 0.1, // 90% standard to 10% auction slot
    },
    defaultVariant: 'standard',
  },
};
