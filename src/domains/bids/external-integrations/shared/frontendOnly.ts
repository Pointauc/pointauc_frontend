import { getDonateXAuthData } from '@domains/bids/external-integrations/DonateX/auth.ts';
import { getOxygenDonutsAuthData } from '@domains/bids/external-integrations/oxygen-donuts/lib/authStorage.ts';

import type * as Integration from '@models/integration';
import type { IntegrationDataDto } from '@models/user.model.ts';

// This module is imported by the reducers, so it must not import the store or anything that depends on it.

/**
 * Integrations that work without the Pointauc backend: they authenticate in the browser and keep
 * their auth data in localStorage, so the backend never returns it with the user.
 */
const localAuthDataReaders: Partial<Record<Integration.ID, () => IntegrationDataDto | undefined>> = {
  donatex: getDonateXAuthData,
  oxygenDonuts: getOxygenDonutsAuthData,
};

export const checkIsFrontendOnlyIntegration = (id: Integration.ID): boolean => id in localAuthDataReaders;

export const getFrontendOnlyAuthData = (id: Integration.ID): IntegrationDataDto | undefined =>
  localAuthDataReaders[id]?.();
