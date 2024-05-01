import React from 'react';
import { useSelector } from 'react-redux';
import { Switch } from '@mui/material';

import { integrationUtils } from '@components/Integration/helpers.ts';
import { RootState } from '@reducers';

interface Props {
  integrations: Integration.Config[];
}

const SwitchAllIntegrations = ({ integrations }: Props) => {
  const subscriptions = useSelector((root: RootState) => root.subscription);

  const onSwitchAll = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    e.stopPropagation();
    integrations.forEach((integration) => {
      integrationUtils.setSubscribeState(integration, checked);
    });
  };

  const isAllSelected = integrations.every((integration) => subscriptions[integration.id]?.actual);
  const selectAllDisabled = integrations.some((integration) => subscriptions[integration.id]?.loading);

  return (
    <Switch
      onClick={(e) => e.stopPropagation()}
      onChange={onSwitchAll}
      disabled={selectAllDisabled}
      checked={isAllSelected}
    />
  );
};

export default SwitchAllIntegrations;
