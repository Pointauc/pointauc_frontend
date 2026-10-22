import posthog from 'posthog-js';

import { isBrowser } from '@utils/ssr.ts';
import { DEFAULT_BANNER_EXPERIMENTS_CONFIG } from '@domains/promotions/config/bannerExperimentsConfig';
import {
  ActiveBannerExperiments,
  BannerExperimentsConfig,
  FrequencyCappedParams,
  FrequencyExperimentVariant,
  SlotsExperimentVariant,
} from '@domains/promotions/model/experimentTypes';

export const ANALYTICS_DISTINCT_ID_STORAGE_KEY = 'pointauc_analytics_distinct_id';

// Ensure posthog has an active instance in browser so featureFlags.override works out-of-the-box in dev
if (isBrowser && !(posthog as unknown as { __loaded?: boolean }).__loaded) {
  try {
    posthog.init('local-dev', {
      api_host: 'http://localhost',
      autocapture: false,
      advanced_disable_decide: true,
      disable_session_recording: true,
    });
  } catch {
    // Ignore initialization errors
  }
}

/**
 * Maps a string deterministically to a floating point value in [0, 1) using 32-bit FNV-1a.
 */
export const hashStringToRatio = (str: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
};

/**
 * Returns a persistent distinct ID for local assignment fallback when PostHog is not initialized.
 */
export const getAnalyticsDistinctId = (): string => {
  if (!isBrowser) {
    return 'server_fallback';
  }

  try {
    const phId = posthog.get_distinct_id?.();
    if (phId && typeof phId === 'string' && phId.trim().length > 0) {
      return phId;
    }
  } catch {
    // Ignore PostHog errors
  }

  try {
    const cached = window.localStorage.getItem(ANALYTICS_DISTINCT_ID_STORAGE_KEY);
    if (cached) {
      return cached;
    }

    const generated = 'pa_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    window.localStorage.setItem(ANALYTICS_DISTINCT_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return 'memory_fallback';
  }
};

/**
 * Deterministically assigns a variant according to weighted ratios for an experiment key.
 */
export const assignVariantByRatio = <TVariant extends string>(
  distinctId: string,
  experimentKey: string,
  ratios: Record<TVariant, number>,
  defaultVariant: TVariant,
): TVariant => {
  const entries = Object.entries(ratios) as [TVariant, number][];
  const total = entries.reduce((acc, [_, weight]) => acc + Math.max(0, weight), 0);

  if (total <= 0) {
    return defaultVariant;
  }

  const hash = hashStringToRatio(`${distinctId}:${experimentKey}`);
  let cumulative = 0;

  for (const [variant, weight] of entries) {
    const normalizedWeight = Math.max(0, weight) / total;
    cumulative += normalizedWeight;
    if (hash < cumulative) {
      return variant;
    }
  }

  return entries[entries.length - 1]?.[0] ?? defaultVariant;
};

/**
 * Parses PostHog feature flag variant and maps standard 'control' or custom names.
 */
const normalizeFrequencyVariant = (
  rawVariant: unknown,
): FrequencyExperimentVariant | null => {
  if (typeof rawVariant !== 'string') {
    return null;
  }
  if (rawVariant === 'control' || rawVariant === 'probabilistic') {
    return 'probabilistic';
  }
  if (rawVariant === 'frequency_capped') {
    return 'frequency_capped';
  }
  return null;
};

const normalizeSlotsVariant = (
  rawVariant: unknown,
): SlotsExperimentVariant | null => {
  if (typeof rawVariant !== 'string') {
    return null;
  }
  if (rawVariant === 'control' || rawVariant === 'standard') {
    return 'standard';
  }
  if (rawVariant === 'auction_slot') {
    return 'auction_slot';
  }
  return null;
};

interface PostHogFrequencyPayload {
  maxImpressions?: number;
  max_impressions?: number;
  windowHours?: number;
  window_hours?: number;
  windowMs?: number;
  window_ms?: number;
}

const parseFrequencyParams = (
  defaultParams: FrequencyCappedParams,
  payload: unknown,
): FrequencyCappedParams => {
  if (!payload || typeof payload !== 'object') {
    return defaultParams;
  }

  const parsed = payload as PostHogFrequencyPayload;
  const max = parsed.maxImpressions ?? parsed.max_impressions ?? defaultParams.maxImpressions;
  let windowMs = parsed.windowMs ?? parsed.window_ms;

  if (!windowMs) {
    const hours = parsed.windowHours ?? parsed.window_hours;
    if (typeof hours === 'number' && hours > 0) {
      windowMs = hours * 60 * 60 * 1000;
    }
  }

  return {
    maxImpressions: typeof max === 'number' && max > 0 ? max : defaultParams.maxImpressions,
    windowMs: typeof windowMs === 'number' && windowMs > 0 ? windowMs : defaultParams.windowMs,
  };
};

export interface ResolveExperimentsOptions {
  config?: BannerExperimentsConfig;
  distinctId?: string;
  forceFrequencyVariant?: FrequencyExperimentVariant;
  forceSlotsVariant?: SlotsExperimentVariant;
}

export const resolveBannerExperiments = (
  options?: ResolveExperimentsOptions,
): ActiveBannerExperiments => {
  const config = options?.config ?? DEFAULT_BANNER_EXPERIMENTS_CONFIG;
  const distinctId = options?.distinctId ?? getAnalyticsDistinctId();

  // 1. Resolve Frequency Experiment
  let frequencyVariant: FrequencyExperimentVariant = config.frequency.defaultVariant;
  let frequencyParams: FrequencyCappedParams = config.frequency.params;

  if (options?.forceFrequencyVariant) {
    frequencyVariant = options.forceFrequencyVariant;
  } else if (config.frequency.enabled) {
    let phVariant: unknown;
    let phPayload: unknown;

    if (isBrowser) {
      try {
        phVariant = posthog.getFeatureFlag(config.frequency.key);
        phPayload = posthog.getFeatureFlagPayload(config.frequency.key);
      } catch {
        // Ignore PostHog evaluation errors
      }
    }

    const normalizedPh = normalizeFrequencyVariant(phVariant);
    if (normalizedPh) {
      frequencyVariant = normalizedPh;
    } else {
      frequencyVariant = assignVariantByRatio(
        distinctId,
        config.frequency.key,
        config.frequency.ratios,
        config.frequency.defaultVariant,
      );
    }

    frequencyParams = parseFrequencyParams(config.frequency.params, phPayload);
  }

  // 2. Resolve Slots Experiment
  let slotsVariant: SlotsExperimentVariant = config.slots.defaultVariant;

  if (options?.forceSlotsVariant) {
    slotsVariant = options.forceSlotsVariant;
  } else if (config.slots.enabled) {
    let phVariant: unknown;

    if (isBrowser) {
      try {
        phVariant = posthog.getFeatureFlag(config.slots.key);
      } catch {
        // Ignore PostHog evaluation errors
      }
    }

    const normalizedPh = normalizeSlotsVariant(phVariant);
    if (normalizedPh) {
      slotsVariant = normalizedPh;
    } else {
      slotsVariant = assignVariantByRatio(
        distinctId,
        config.slots.key,
        config.slots.ratios,
        config.slots.defaultVariant,
      );
    }
  }

  return {
    frequencyVariant,
    slotsVariant,
    frequencyParams,
  };
};

export const subscribeToBannerExperiments = (
  callback: (experiments: ActiveBannerExperiments) => void,
  options?: ResolveExperimentsOptions,
): (() => void) => {
  if (!isBrowser) {
    return () => {};
  }

  try {
    return posthog.onFeatureFlags(() => {
      callback(resolveBannerExperiments(options));
    });
  } catch {
    return () => {};
  }
};
