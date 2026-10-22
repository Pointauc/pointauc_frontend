import { describe, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';

import {
  assignVariantByRatio,
  hashStringToRatio,
  resolveBannerExperiments,
} from '@domains/promotions/lib/bannerExperiments';
import { BannerExperimentsConfig, SlotsExperimentVariant } from '@domains/promotions/model/experimentTypes';

vi.mock('posthog-js', () => ({
  default: {
    getFeatureFlag: vi.fn(),
    getFeatureFlagPayload: vi.fn(),
    onFeatureFlags: vi.fn(),
    get_distinct_id: vi.fn(() => 'test_distinct_user_1'),
    featureFlags: {
      override: vi.fn(),
    },
  },
}));

describe('bannerExperiments', () => {
  it('hashStringToRatio produces deterministic numbers in [0, 1)', () => {
    const val1 = hashStringToRatio('user_1:experiment_a');
    const val2 = hashStringToRatio('user_1:experiment_a');
    const val3 = hashStringToRatio('user_2:experiment_a');

    expect(val1).toBe(val2);
    expect(val1).toBeGreaterThanOrEqual(0);
    expect(val1).toBeLessThan(1);
    expect(val1).not.toBe(val3);
  });

  it('assignVariantByRatio adheres to 90% to 10% ratio distribution across diverse users', () => {
    const ratios: Record<SlotsExperimentVariant, number> = {
      standard: 0.9,
      auction_slot: 0.1,
    };

    let auctionSlotCount = 0;
    const totalUsers = 1000;

    for (let i = 0; i < totalUsers; i++) {
      const variant = assignVariantByRatio<SlotsExperimentVariant>(
        `user_${i}`,
        'promotion-banner-slots',
        ratios,
        'standard',
      );
      if (variant === 'auction_slot') {
        auctionSlotCount++;
      }
    }

    const percentage = auctionSlotCount / totalUsers;
    // With 1000 samples and 10% ratio, expected ~100 (range 70 to 130)
    expect(percentage).toBeGreaterThan(0.06);
    expect(percentage).toBeLessThan(0.14);
  });

  it('resolves variants using PostHog feature flags when available', () => {
    vi.mocked(posthog.getFeatureFlag).mockImplementation((key) => {
      if (key === 'promotion-banner-slots') return 'auction_slot';
      if (key === 'promotion-banner-frequency') return 'frequency_capped';
      return undefined;
    });

    vi.mocked(posthog.getFeatureFlagPayload).mockReturnValue({
      maxImpressions: 5,
      windowHours: 12,
    });

    const experiments = resolveBannerExperiments();

    expect(experiments.slotsVariant).toBe('auction_slot');
    expect(experiments.frequencyVariant).toBe('frequency_capped');
    expect(experiments.frequencyParams.maxImpressions).toBe(5);
    expect(experiments.frequencyParams.windowMs).toBe(12 * 60 * 60 * 1000);
  });

  it('falls back to deterministic assignment when PostHog returns undefined', () => {
    vi.mocked(posthog.getFeatureFlag).mockReturnValue(undefined);
    vi.mocked(posthog.getFeatureFlagPayload).mockReturnValue(undefined);

    const testConfig: BannerExperimentsConfig = {
      frequency: {
        key: 'test-freq',
        enabled: true,
        variants: ['probabilistic', 'frequency_capped'],
        ratios: { probabilistic: 1, frequency_capped: 0 },
        defaultVariant: 'probabilistic',
        params: { maxImpressions: 3, windowMs: 86400000 },
      },
      slots: {
        key: 'test-slots',
        enabled: true,
        variants: ['standard', 'auction_slot'],
        ratios: { standard: 0, auction_slot: 1 },
        defaultVariant: 'standard',
      },
    };

    const experiments = resolveBannerExperiments({
      config: testConfig,
      distinctId: 'user_fixed',
    });

    expect(experiments.frequencyVariant).toBe('probabilistic');
    expect(experiments.slotsVariant).toBe('auction_slot');
  });

  it('respects force variant overrides', () => {
    const experiments = resolveBannerExperiments({
      forceFrequencyVariant: 'frequency_capped',
      forceSlotsVariant: 'auction_slot',
    });

    expect(experiments.frequencyVariant).toBe('frequency_capped');
    expect(experiments.slotsVariant).toBe('auction_slot');
  });
});
