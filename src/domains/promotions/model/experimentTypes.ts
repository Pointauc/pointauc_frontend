export type FrequencyExperimentVariant = 'probabilistic' | 'frequency_capped';

export type SlotsExperimentVariant = 'standard' | 'auction_slot';

export interface FrequencyCappedParams {
  maxImpressions: number;
  windowMs: number;
}

export interface ExperimentVariantConfig<TVariant extends string> {
  key: string;
  enabled: boolean;
  variants: readonly TVariant[];
  ratios: Record<TVariant, number>;
  defaultVariant: TVariant;
}

export interface BannerExperimentsConfig {
  frequency: ExperimentVariantConfig<FrequencyExperimentVariant> & {
    params: FrequencyCappedParams;
  };
  slots: ExperimentVariantConfig<SlotsExperimentVariant>;
}

export interface ActiveBannerExperiments {
  frequencyVariant: FrequencyExperimentVariant;
  slotsVariant: SlotsExperimentVariant;
  frequencyParams: FrequencyCappedParams;
}

export interface FrequencyCapStatus {
  impressionsCount: number;
  maxImpressions: number;
  windowMs: number;
  isCapped: boolean;
  cooldownExpiresAt: number | null;
}
