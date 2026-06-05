import { Switch } from '@mantine/core';
import React, { useMemo } from 'react';

import { connectIntegrationWithTimeout } from '@domains/bids/external-integrations/shared/pubsub/subscriptionTimeout';
import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import * as Integration from '@models/integration';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';

import type { HotkeyActionId } from '@shared/lib/hotkeys/hotkeys.types';

interface Props {
  integrations: Integration.Config[];
  showLabel?: boolean;
  classNames?: any;
  labelText?: string;
  hotkeyActionId?: HotkeyActionId;
}

const SwitchAllIntegrations = ({ integrations, showLabel = true, classNames, labelText, hotkeyActionId }: Props) => {
  const onSwitchAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    integrations.forEach((integration) => {
      if (e.target.checked) {
        connectIntegrationWithTimeout(integration).catch((err) => console.error(err));
      } else {
        integration.pubsubFlow.disconnect();
      }
    });
  };
  const subscriptions = useMergedSubscriptionsState(integrations);

  const selectAllDisabled = useMemo(() => {
    return integrations.some((integration) => subscriptions?.[integration.id]?.loading);
  }, [integrations, subscriptions]);

  const isAllSelected = useMemo(() => {
    return integrations.every((integration) => subscriptions?.[integration.id]?.subscribed);
  }, [integrations, subscriptions]);

  const label = (
    <span className='inline-flex w-full items-center justify-between gap-2'>
      {showLabel && labelText ? (
        <span className='inline-flex items-center gap-1'>
          <span>{labelText}</span>
          <span>(</span>
          {integrations.map((integration) => (
            <integration.branding.icon key={integration.id} size={32} />
          ))}
          <span>)</span>
        </span>
      ) : null}
      {hotkeyActionId ? <HotkeyHint actionId={hotkeyActionId} /> : null}
    </span>
  );

  return (
    <Switch
      wrapperProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
      onChange={onSwitchAll}
      disabled={selectAllDisabled}
      checked={isAllSelected}
      label={showLabel || hotkeyActionId ? label : undefined}
      classNames={classNames}
    />
  );
};

export default SwitchAllIntegrations;
