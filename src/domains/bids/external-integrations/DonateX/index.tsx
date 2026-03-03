import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr';
import { Store } from '@tanstack/react-store';
import EventEmitter from 'eventemitter3';

import DonateXSvg from '@assets/icons/donatex.svg';
import { InvalidTokenError } from '@domains/bids/external-integrations/shared/helpers.ts';
import { mergeAuthData } from '@reducers/User/User.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';
import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import * as Integration from '@models/integration';
import { store } from '@store';

import {
  BASE_URL,
  buildAuthorizeUrl,
  DonateXDonation,
  fetchProfile,
  getDonateXAuthData,
  ensureFreshAccessToken,
  exchangeCodeForToken,
  PKCE_VERIFIER_KEY,
  storeProfile,
  storeTokens,
  validateDonateX,
} from './auth.ts';
import styles from './index.module.css';

const authenticate = async (code: string) => {
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error('Missing PKCE verifier');
  }

  const tokenData = await exchangeCodeForToken(code, verifier);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  storeTokens(tokenData);

  const profile = await fetchProfile(tokenData.access_token);
  storeProfile(profile);

  const authData = getDonateXAuthData();
  if (authData) {
    store.dispatch(
      mergeAuthData({
        donatex: authData,
      }),
    );
  }
};

const revoke = () => {
  localStorage.removeItem('donatex_authToken');
  localStorage.removeItem('donatex_refreshToken');
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  localStorage.removeItem('donatex_profile');
  store.dispatch(mergeAuthData({ donatex: undefined }));
};

const DonateXLoginButton = ({ integration, classes }: Integration.LoginButtonProps<Integration.RedirectFlow>) => {
  const handleAuth = async (): Promise<void> => {
    try {
      const url = await buildAuthorizeUrl();
      window.open(url, '_self');
    } catch (e) {
      console.error('Failed to start DonateX auth', e);
    }
  };

  return (
    <IntegrationLoginButton
      integration={integration}
      onClick={() => void handleAuth()}
      classes={{ ...classes, button: styles.loginButton }}
    />
  );
};

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  authenticate,
  validate: validateDonateX,
  url: () => `${BASE_URL}/connect/authorize`,
  loginComponent: DonateXLoginButton,
  revoke,
};

const parseMessage = (donation: DonateXDonation): Purchase => ({
  id: donation.id,
  username: donation.username ?? 'Аноним',
  message: donation.message,
  timestamp: donation.timestamp,
  cost: donation.amountInRub,
  color: '#000000',
  isDonation: true,
  source: 'donatex',
});

const buildSignalRFlow = (): Integration.PubsubFlow => {
  const store = new Store({
    subscribed: false,
    loading: false,
  });
  const events = new EventEmitter<Integration.PubsubEvents>();
  let connection: HubConnection | null = null;

  const ensureConnection = async (): Promise<void> => {
    const accessToken = await ensureFreshAccessToken();
    if (!accessToken) throw new InvalidTokenError();

    if (!connection) {
      connection = new HubConnectionBuilder()
        .withUrl(`${BASE_URL}/public-donations-hub`, {
          accessTokenFactory: async () => (await ensureFreshAccessToken()) ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.on('DonationCreated', (payload: DonateXDonation) => {
        events.emit('bid', parseMessage(payload));
      });

      connection.onreconnected(() => store.setState((state) => ({ ...state, subscribed: true })));
      connection.onclose(() => store.setState((state) => ({ ...state, subscribed: false })));
    }

    if (connection.state !== HubConnectionState.Connected) {
      await connection.start();
    }
  };

  const connect = async (_userId?: string): Promise<void> => {
    try {
      store.setState({ subscribed: true, loading: true });
      await ensureConnection();
      store.setState({ subscribed: true, loading: false });
    } catch (e) {
      if (e instanceof InvalidTokenError) {
        revoke();
      }
      store.setState({ subscribed: false, loading: false });
      throw e;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (connection && connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
    store.setState({ subscribed: false, loading: false });
  };

  return {
    events,
    store,
    connect,
    disconnect,
  };
};

const donatex: Integration.Config = {
  id: 'donatex',
  type: 'donate',
  authFlow,
  pubsubFlow: buildSignalRFlow(),
  branding: {
    icon: () => <img src={DonateXSvg} alt='DonateX' className={styles.icon} />,
  },
};

export default donatex;
