import { Component, FC, FunctionComponent, JSX } from 'react';
import { Store } from '@tanstack/react-store';
import EventEmitter from 'eventemitter3';

import { Purchase } from '@reducers/Purchases/Purchases';

export type ID = 'donatePay' | 'da' | 'twitch' | 'tourniquet' | 'ihaq' | 'donatex' | 'donatePayEu' | 'donateHelper';
export type BidType = 'donate' | 'points';

export interface LoginButtonClasses {
  button?: string;
}

export interface LoginButtonProps<Flow extends AuthFlow = AuthFlow> {
  integration: Config<Flow>;
  classes?: LoginButtonClasses;
}

export interface PubsubComponentProps {
  integration: Config;
}

export enum IconSize {
  SMALL = 22,
  MEDIUM = 32,
}

interface IconProps {
  /**
   * Size of the icon in pixels. Possible values are 22px and 32px.
   */
  size?: IconSize;
}

export interface Branding {
  /**
   * This icon will be associated with the service.
   */
  icon: FC<IconProps>;
  /**
   * Partner branding adds extra styles and exposure
   */
  partner?: boolean;
  /**
   * This description will be displayed on the login button (only when `partner` is `true`)
   */
  description?: string;
}

export interface AuthFlowCommon<ButtonProps> {
  /**
   * Checks if the user is authenticated and the authentication is valid.
   *
   * Possible outcomes:
   * `true` - User will see controls like a pubsub switch and extra settings.
   * `false` - User will see only the login button.
   */
  validate: () => boolean;
  /**
   * The component that will be displayed for unauthenticated users. Clicking on this button should start authentication flow.
   */
  loginComponent: FunctionComponent<ButtonProps>;
  /**
   * Called when the user wants to revoke the authentication. This should clear the service data from the app.
   */
  revoke: () => Promise<void> | void;
}

export interface RedirectFlow extends AuthFlowCommon<LoginButtonProps<RedirectFlow>> {
  type: 'redirect';
  authenticate: (code: string) => Promise<unknown>;
  url: () => string;
  redirectCodeQueryKey?: string;
}

export interface TokenFlow extends AuthFlowCommon<LoginButtonProps<TokenFlow>> {
  type: 'token';
  authenticate: (accessToken: string) => Promise<unknown>;
  getAccessToken: () => string;
}

export type AuthFlow = TokenFlow | RedirectFlow;

export type PubsubEvents = {
  /**
   * Trigger this event when a new bid is received from the service.
   */
  bid: (bid: Purchase) => void;
};

export interface PubsubSubscription {
  /**
   * Is the connection established and the service is listening for new bids.
   *
   * *Note: reset this value to `false` when the connection is lost or there is an error.*
   */
  subscribed: boolean;
  /**
   * Is the service currently establishing a connection.
   */
  loading: boolean;
}

export interface PubsubFlow {
  /**
   * Notifies the App about new bids from the service.
   */
  events: EventEmitter<PubsubEvents>;
  /**
   * Called when the user wants to START receiving bids from the service.
   */
  connect: () => Promise<void>;
  /**
   * Called when the user wants to STOP receiving bids from the service.
   */
  disconnect: () => Promise<void>;
  /**
   * Stores the current service state.
   */
  store: Store<PubsubSubscription>;
}

/**
 * Final configuration object for the service.
 *
 * This system is designed in a way that allows to integrate a new service without touching the rest of the app.
 * You don't need to learn the codebase - just implement this interface and you're good to go.
 */
export interface Config<TAuth extends AuthFlow = AuthFlow, TPubsub extends PubsubFlow = PubsubFlow> {
  id: ID;
  /**
   * `donate` - if the service works with real money
   *
   * `points` - if the service works with virtual currency which cannot be converted to real money
   */
  type: BidType;
  /**
   * Describes how the service authenticates the user.
   */
  authFlow: TAuth;
  /**
   * Describes how this App receives real-time updates from the service.
   */
  pubsubFlow: TPubsub;
  /**
   * Describes how the service is displayed across the app.
   */
  branding: Branding;
}
