import i18next from 'i18next';

const RATE_STORAGE_KEY = 'oxygenDonuts_rate';

export const MIN_RATE = 0.01;
export const MAX_RATE = 1_000_000;

// Oxygen Donuts reports amounts in US dollars, while auctions in these languages are counted in roubles.
const ROUBLE_LANGUAGES = ['ru', 'be'];
const ROUBLE_DEFAULT_RATE = 100;
const DEFAULT_RATE = 1;

export const checkIsValidRate = (rate: unknown): rate is number =>
  typeof rate === 'number' && Number.isFinite(rate) && rate >= MIN_RATE && rate <= MAX_RATE;

export const getDefaultRate = (language: string | undefined): number => {
  const baseLanguage = language?.toLowerCase().split('-')[0] ?? '';

  return ROUBLE_LANGUAGES.includes(baseLanguage) ? ROUBLE_DEFAULT_RATE : DEFAULT_RATE;
};

/**
 * How many auction units one US dollar is worth ("1 $ = N").
 */
export const loadRate = (): number => {
  const storedRate = localStorage.getItem(RATE_STORAGE_KEY);
  const rate = storedRate === null ? NaN : Number(storedRate);

  return checkIsValidRate(rate) ? rate : getDefaultRate(i18next.resolvedLanguage ?? i18next.language);
};

export const saveRate = (rate: number): void => {
  if (!checkIsValidRate(rate)) return;

  localStorage.setItem(RATE_STORAGE_KEY, String(rate));
};

/**
 * Stores the current default as the streamer's rate unless they already have one,
 * so that switching the interface language later does not silently change bid amounts.
 */
export const ensureRateIsStored = (): void => {
  saveRate(loadRate());
};
