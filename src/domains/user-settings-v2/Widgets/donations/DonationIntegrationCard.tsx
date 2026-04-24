import { Text } from '@mantine/core';
import { useStore } from '@tanstack/react-store';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getActiveRegion } from '@domains/bids/external-integrations/DonatePay/index.tsx';
import RevokeIntegrationButton from '@pages/settings/IntegrationsSettings/Common/RevokeIntegrationButton.tsx';

import type { Config } from '@models/integration';

interface DonationIntegrationCardProps {
  integration: Config;
}

const DonationIntegrationCard = ({ integration }: DonationIntegrationCardProps) => {
  const { t } = useTranslation();
  const { id, branding } = integration;
  const { subscribed, loading } = useStore(integration.pubsubFlow.store, (state) => state);

  const status = loading ? 'loading' : subscribed ? 'active' : 'inactive';
  const Icon = branding.icon;

  const displayName = useMemo(() => {
    const baseName = t(`integration.${id}.name`);

    if (id === 'donatePay') {
      const region = getActiveRegion();

      if (region) {
        return `${baseName} (${region.toUpperCase()})`;
      }
    }

    return baseName;
  }, [id, t]);

  const handleToggle = useCallback(() => {
    if (loading) {
      return;
    }

    if (subscribed) {
      void integration.pubsubFlow.disconnect();
      return;
    }

    void integration.pubsubFlow.connect();
  }, [integration, loading, subscribed]);

  const statusText = loading
    ? t('settings.donations.integrationConnecting')
    : subscribed
    ? t('settings.donations.integrationActive')
    : t('settings.donations.integrationInactive');

  return (
    <div
      className={clsx(
        'bg-paper-700 cursor-pointer overflow-hidden rounded-lg border transition-colors duration-150',
        status === 'inactive' && 'border-paper-500 hover:border-paper-400 hover:bg-paper-800',
        status === 'active' && 'hover:bg-paper-800 border-emerald-700 hover:border-emerald-800',
        status === 'loading' && 'hover:bg-paper-800 border-sky-800',
      )}
      data-status={status}
      role='button'
      tabIndex={0}
      aria-pressed={subscribed}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className='flex h-[46px] items-center gap-4 px-4'>
        <span
          className={clsx(
            'relative inline-flex h-5 w-5 flex-none rounded-full border-2',
            status === 'inactive' && 'border-dashed border-slate-500',
            status === 'loading' && 'animate-spin border-transparent border-t-sky-500',
            status === 'active' && 'border-emerald-500 bg-emerald-950',
          )}
          data-status={status}
          aria-hidden='true'
        >
          <span className={clsx('absolute inset-1 rounded-full', status === 'active' && 'bg-emerald-500')} />
        </span>

        <div className='flex min-w-0 flex-nowrap items-center gap-1.5'>
          <Icon size={22} />
          <Text fw={600} size='sm' truncate>
            {displayName}
          </Text>
        </div>
      </div>

      <div className='px-2 pb-2' onClick={(event) => event.stopPropagation()}>
        <RevokeIntegrationButton
          revoke={integration.authFlow.revoke}
          className='border-paper-200 hover:border-paper-100 hover:bg-paper-600 w-full border'
        />
      </div>
    </div>
  );
};

export default DonationIntegrationCard;
