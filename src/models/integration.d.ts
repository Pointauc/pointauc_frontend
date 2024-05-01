namespace Integration {
  import { Component, FunctionComponent } from 'react';

  import EventEmitter from '@utils/EventEmitter.ts';

  type ID = 'donatePay' | 'da' | 'twitch';
  type BidType = 'donate' | 'points';

  interface LoginButtonProps<Flow extends AuthFlow = AuthFlow> {
    integration: Config<Flow>;
  }

  interface PubsubComponentProps {
    integration: Config;
  }

  interface Branding {
    icon: Component;
  }

  interface AuthFlowCommon {
    validate: () => boolean;
    loginComponent: FunctionComponent<LoginButtonProps<TokenFlow>>;
    revoke: () => Promise<void> | void;
  }

  interface RedirectFlow extends AuthFlowCommon {
    type: 'redirect';
    authenticate: (code: string) => Promise<unknown>;
    url: string;
  }

  interface TokenFlow extends AuthFlowCommon {
    type: 'token';
    authenticate: (accessToken: string) => Promise<unknown>;
    getAccessToken: () => string;
  }

  type AuthFlow = TokenFlow | RedirectFlow;

  type PubsubEvents = 'subscribed' | 'unsubscribed' | 'bid';

  interface PubsubFlow {
    events: EventEmitter<PubsubEvents>;
    connect: (userId: string) => Promise<void>;
    disconnect: () => Promise<void>;
    async: boolean;
  }

  interface Config<TAuth extends AuthFlow = AuthFlow> {
    id: ID;
    type: BidType;
    authFlow: TAuth;
    pubsubFlow: PubsubFlow;
    branding: Branding;
  }
}
