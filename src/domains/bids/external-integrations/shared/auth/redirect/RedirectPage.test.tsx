import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as Integration from '@models/integration';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';

import RedirectPage from './RedirectPage';

vi.mock('@reducers/AucSettings/AucSettings.ts', () => ({ loadUserData: vi.fn() }));

const authenticate = vi.fn<Integration.RedirectFlow['authenticate']>();

const renderRedirectPage = (id: Integration.ID, search: string) => {
  const integration = {
    id,
    authFlow: { type: 'redirect', authenticate },
  } as unknown as Integration.Config<Integration.RedirectFlow>;

  return render(
    <Provider store={configureStore({ reducer: () => ({}) })}>
      <MantineProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={[`/${id}/redirect${search}`]}>
            <Routes>
              <Route path={`/${id}/redirect`} element={<RedirectPage integration={integration} />} />
              <Route path='/settings' element={<div>settings page</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </MantineProvider>
    </Provider>,
  );
};

describe('RedirectPage', () => {
  beforeEach(() => {
    vi.spyOn(notifications, 'show').mockReturnValue('');
    vi.mocked(loadUserData).mockReturnValue(async () => ({}) as never);
    authenticate.mockResolvedValue(undefined);
    sessionStorage.setItem('oxygenDonuts_redirectReturnPath', '/settings');
    sessionStorage.setItem('twitch_redirectReturnPath', '/settings');
  });

  it('returns the user without an error when they declined the request', async () => {
    renderRedirectPage('oxygenDonuts', '?error=access_denied&error_description=The+user+denied+access&state=abc');

    expect(await screen.findByText('settings page')).toBeInTheDocument();
    expect(authenticate).not.toHaveBeenCalled();
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it('returns the user with an error when the service sent no code', async () => {
    renderRedirectPage('oxygenDonuts', '?error=server_error&state=abc');

    expect(await screen.findByText('settings page')).toBeInTheDocument();
    expect(authenticate).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledTimes(1);
  });

  it('finishes a frontend-only login without asking the backend for the user', async () => {
    renderRedirectPage('oxygenDonuts', '?code=the-code&state=abc');

    expect(await screen.findByText('settings page')).toBeInTheDocument();
    expect(authenticate).toHaveBeenCalledWith('the-code');
    expect(loadUserData).not.toHaveBeenCalled();
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it('reloads the user after a login the backend takes part in', async () => {
    renderRedirectPage('twitch', '?code=the-code&state=abc');

    expect(await screen.findByText('settings page')).toBeInTheDocument();
    expect(authenticate).toHaveBeenCalledWith('the-code');
    expect(loadUserData).toHaveBeenCalledTimes(1);
  });
});
