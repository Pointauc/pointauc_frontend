import i18next from 'i18next';
import { afterEach, describe, expect, it } from 'vitest';

import { mapDonationToBid } from './donation';
import { ensureRateIsStored, getDefaultRate, loadRate, saveRate } from './rate';

import type { OxygenDonutsDonation } from './donation';

const donation: OxygenDonutsDonation = {
  id: '5b0c8a52-6a0e-4f7e-9c1d-2f1f0f6f3a11',
  donor_name: 'Vasya',
  message: 'Hello from the stream!',
  amount_usd: '12.50',
  paid_at: '2026-11-10T18:42:01Z',
};

const params = { rate: 100, anonymousName: 'Anonymous' };

describe('Oxygen Donuts donation to bid', () => {
  it('converts the dollar amount with the rate of the streamer', () => {
    expect(mapDonationToBid(donation, params)).toEqual({
      id: '5b0c8a52-6a0e-4f7e-9c1d-2f1f0f6f3a11',
      username: 'Vasya',
      message: 'Hello from the stream!',
      timestamp: '2026-11-10T18:42:01Z',
      cost: 1250,
      color: '#000000',
      isDonation: true,
      source: 'oxygenDonuts',
    });

    expect(mapDonationToBid(donation, { ...params, rate: 1 })?.cost).toBe(12.5);
    expect(mapDonationToBid({ ...donation, amount_usd: '0.40' }, { ...params, rate: 1 })?.cost).toBe(0.4);
    expect(mapDonationToBid({ ...donation, amount_usd: '1.99' }, { ...params, rate: 92.37 })?.cost).toBe(183.82);
    expect(mapDonationToBid({ ...donation, amount_usd: '0.07' }, { ...params, rate: 100 })?.cost).toBe(7);
  });

  it('keeps a donation without a name or a message, as a meme purchase has neither', () => {
    const bid = mapDonationToBid({ ...donation, donor_name: null, message: null }, params);

    expect(bid?.username).toBe('Anonymous');
    expect(bid?.message).toBe('');
    expect(mapDonationToBid({ ...donation, donor_name: '  ' }, params)?.username).toBe('Anonymous');
  });

  it('skips a donation whose dollar value is unknown or not positive', () => {
    expect(mapDonationToBid({ ...donation, amount_usd: null }, params)).toBeNull();
    expect(mapDonationToBid({ ...donation, amount_usd: '0.00' }, params)).toBeNull();
    expect(mapDonationToBid({ ...donation, amount_usd: 'abc' }, params)).toBeNull();
  });
});

describe('Oxygen Donuts dollar rate', () => {
  const initialLanguage = i18next.resolvedLanguage;

  afterEach(() => {
    localStorage.clear();
    i18next.resolvedLanguage = initialLanguage;
  });

  it('defaults to roubles for the languages that count auctions in roubles', () => {
    expect(['ru', 'be', 'ru-RU', 'en', 'ua', undefined].map(getDefaultRate)).toEqual([100, 100, 100, 1, 1, 1]);

    i18next.resolvedLanguage = 'ru';
    expect(loadRate()).toBe(100);
    i18next.resolvedLanguage = 'en';
    expect(loadRate()).toBe(1);
  });

  it('stores the rate of the streamer and ignores a value that cannot be used', () => {
    saveRate(92.5);
    expect(loadRate()).toBe(92.5);

    [0, -5, NaN, Infinity].forEach(saveRate);
    expect(loadRate()).toBe(92.5);

    localStorage.setItem('oxygenDonuts_rate', 'not a number');
    expect(loadRate()).toBe(1);
  });

  it('keeps the rate from the moment of login when the interface language changes later', () => {
    i18next.resolvedLanguage = 'ru';
    ensureRateIsStored();
    i18next.resolvedLanguage = 'en';

    expect(loadRate()).toBe(100);
  });
});
