import React from 'react';
import { useSelector } from 'react-redux';
import { Switch } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { integrationUtils } from '@components/Integration/helpers.ts';
import { RootState } from '@reducers';

interface Props {
  integrations: Integration.Config[];
  showLabel?: boolean;
  classNames?: any;
}

const SwitchAllIntegrations = ({ integrations, showLabel = true, classNames }: Props) => {
  const subscriptions = useSelector((root: RootState) => root.subscription);
  const { t } = useTranslation();
  const onSwitchAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    integrations.forEach((integration) => {
      integrationUtils.setSubscribeState(integration, e.target.checked);
    });
  };

  const isAllSelected = integrations.every((integration) => subscriptions[integration.id]?.actual);
  const selectAllDisabled = integrations.some((integration) => subscriptions[integration.id]?.loading);

  const label = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>{t('integration.groups.donations')} (</span>
      {integrations.map((integration) => (
        <integration.branding.icon key={integration.id} className={clsx('base-icon', integration.id)} />
      ))}
      <span>)</span>
    </div>
  );

  return (
    <Switch
      wrapperProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
      onChange={onSwitchAll}
      disabled={selectAllDisabled}
      checked={isAllSelected}
      label={showLabel && label}
      classNames={classNames}
    />
  );
};

export default SwitchAllIntegrations;
