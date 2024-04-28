namespace Integration {
  import { Component, FunctionComponent } from 'react';

  import EventEmitter from '@utils/EventEmitter.ts';

  type ID = 'donatePay';
  type BidType = 'donate' | 'points';

  interface LoginButtonProps<Flow extends AuthFlow = AuthFlow> {
    integration: Config<Flow>;
  }

  interface PubsubComponentProps {
    integration: Config<AuthFlow>;
  }

  interface Branding {
    // color: string;
    icon: Component;
  }

  interface RedirectFlow {
    type: 'redirect';
    url: string;
    params: Record<string, string | number>;
  }

  interface TokenFlow {
    type: 'token';
    authenticate: (accessToken: string) => Promise<unknown>;
    loginComponent: FunctionComponent<LoginButtonProps<TokenFlow>>;
    validate: () => boolean;
    getAccessToken: () => string;
  }

  type AuthFlow = TokenFlow;

  type PubsubEvents = 'subscribed' | 'unsubscribed' | 'bid';

  interface PubsubFlow {
    events: EventEmitter<PubsubEvents>;
    connect: (userId: string) => Promise<void>;
    disconnect: () => Promise<void>;
  }

  interface Config<TAuth extends AuthFlow = AuthFlow> {
    id: ID;
    type: BidType;
    authFlow: TAuth;
    pubsubFlow: PubsubFlow;
    branding: Branding;
  }
}
