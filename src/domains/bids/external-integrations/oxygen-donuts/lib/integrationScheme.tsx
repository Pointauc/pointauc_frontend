import { notifications } from '@mantine/notifications';
import i18next from 'i18next';

import { OxygenDonutsIcon } from '@domains/bids/external-integrations/oxygen-donuts/ui/Icon';
import OxygenDonutsLoginButton from '@domains/bids/external-integrations/oxygen-donuts/ui/LoginButton';
import OxygenDonutsRateControl from '@domains/bids/external-integrations/oxygen-donuts/ui/RateControl';
import * as Integration from '@models/integration';
import { mergeAuthData } from '@reducers/User/User';
import { store } from '@store';

import { clearAuth, getOxygenDonutsAuthData, loadAccessToken, storeAuth, validateOxygenDonuts } from './authStorage';
import { getWebOrigin, OXYGEN_DONUTS_ID } from './config';
import { consumeCodeVerifier, exchangeCodeForToken, fetchProfile, revokeAccessToken } from './oauth';
import { buildOxygenDonutsFlow } from './pubsubFlow';
import { ensureRateIsStored } from './rate';

import type { OxygenDonutsProfile } from './authStorage';
import type { StreamStopReason } from './stream';

const id = OXYGEN_DONUTS_ID;
const STREAM_STOP_NOTIFICATION_ID = 'oxygenDonuts-stream-stopped';

const clearLocalAuth = (): void => {
  clearAuth();
  store.dispatch(mergeAuthData({ [id]: undefined }));
};

const handleStreamStop = (reason: StreamStopReason): void => {
  const isUnauthorized = reason === 'unauthorized';
  if (isUnauthorized) {
    // The login button is shown again.
    clearLocalAuth();
  }

  notifications.show({
    id: STREAM_STOP_NOTIFICATION_ID,
    title: i18next.t('integration.oxygenDonuts.name'),
    message: i18next.t(
      isUnauthorized ? 'integration.oxygenDonuts.authorizationLost' : 'integration.oxygenDonuts.connectionLost',
    ),
    color: 'red',
    autoClose: false,
    withCloseButton: true,
  });
};

const pubsubFlow = buildOxygenDonutsFlow({ onStop: handleStreamStop });

// The warning stays until the streamer closes it or donations are tracked again.
pubsubFlow.store.subscribe(() => {
  if (pubsubFlow.store.state.subscribed) {
    notifications.hide(STREAM_STOP_NOTIFICATION_ID);
  }
});

const authenticate = async (code: string): Promise<void> => {
  const codeVerifier = consumeCodeVerifier(window.location.search);
  const accessToken = await exchangeCodeForToken(code, codeVerifier);

  let profile: OxygenDonutsProfile;
  try {
    profile = await fetchProfile(accessToken);
  } catch (error) {
    // Do not leave behind a token the app will never use.
    await revokeAccessToken(accessToken);
    throw error;
  }

  storeAuth(accessToken, profile);
  ensureRateIsStored();
  store.dispatch(mergeAuthData({ [id]: getOxygenDonutsAuthData() }));
};

const revoke = async (): Promise<void> => {
  const accessToken = loadAccessToken();

  await pubsubFlow.disconnect();
  clearLocalAuth();

  if (accessToken) {
    await revokeAccessToken(accessToken);
  }
};

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  authenticate,
  validate: validateOxygenDonuts,
  url: () => `${getWebOrigin()}/oauth/authorize`,
  loginComponent: OxygenDonutsLoginButton,
  revoke,
};

const oxygenDonuts: Integration.Config<Integration.RedirectFlow> = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow,
  settingsComponent: OxygenDonutsRateControl,
  branding: {
    icon: OxygenDonutsIcon,
  },
};

export default oxygenDonuts;
