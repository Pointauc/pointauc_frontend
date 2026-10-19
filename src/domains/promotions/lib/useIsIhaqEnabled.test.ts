import { describe, expect, it } from 'vitest';

import ihaq from '@domains/bids/external-integrations/ihaq/lib/integrationScheme';
import {
  checkIsIhaqEnabled,
  selectIsIhaqAuthValid,
  selectIsUserAuthLoading,
} from '@domains/promotions/lib/useIsIhaqEnabled';
import { RootState } from '@reducers';

describe('useIsIhaqEnabled helpers', () => {
  it('returns true when ihaq auth is valid', () => {
    const mockState = {
      user: {
        authData: {
          ihaq: {
            isValid: true,
            id: '123',
            username: 'testuser',
          },
        },
      },
    } as unknown as RootState;

    expect(selectIsIhaqAuthValid(mockState)).toBe(true);
    expect(checkIsIhaqEnabled(mockState)).toBe(true);
  });

  it('returns false when authData does not have ihaq', () => {
    const mockState = {
      user: {
        authData: {},
      },
    } as unknown as RootState;

    // ensure pubsub is disconnected
    ihaq.pubsubFlow.store.setState({ subscribed: false, loading: false });

    expect(selectIsIhaqAuthValid(mockState)).toBe(false);
    expect(checkIsIhaqEnabled(mockState)).toBe(false);
  });

  it('returns false when ihaq auth is explicitly invalid', () => {
    const mockState = {
      user: {
        authData: {
          ihaq: {
            isValid: false,
            id: '123',
            username: 'testuser',
          },
        },
      },
    } as unknown as RootState;

    ihaq.pubsubFlow.store.setState({ subscribed: false, loading: false });

    expect(selectIsIhaqAuthValid(mockState)).toBe(false);
    expect(checkIsIhaqEnabled(mockState)).toBe(false);
  });

  it('returns true when pubsub subscription is active even without authData', () => {
    const mockState = {
      user: {
        authData: {},
      },
    } as unknown as RootState;

    ihaq.pubsubFlow.store.setState({ subscribed: true, loading: false });

    expect(selectIsIhaqAuthValid(mockState)).toBe(false);
    expect(checkIsIhaqEnabled(mockState)).toBe(true);

    // cleanup
    ihaq.pubsubFlow.store.setState({ subscribed: false, loading: false });
  });

  it('returns false for selectIsUserAuthLoading when user is already loaded', () => {
    const loadedState = {
      user: { username: 'testuser' },
    } as unknown as RootState;
    expect(selectIsUserAuthLoading(loadedState)).toBe(false);
  });

  it('returns false for selectIsUserAuthLoading for guest users without session cookie', () => {
    const guestState = {
      user: { username: null },
    } as unknown as RootState;
    expect(selectIsUserAuthLoading(guestState)).toBe(false);
  });
});
