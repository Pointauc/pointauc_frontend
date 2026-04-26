import { Group, Switch, SwitchProps, Text } from '@mantine/core';
import { useStore } from '@tanstack/react-store';
import classNames from 'classnames';
import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getActiveRegion } from '@domains/bids/external-integrations/DonatePay/index.tsx';
import * as Integration from '@models/integration';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';

import type { HotkeyActionId } from '@shared/lib/hotkeys/hotkeys.types';

interface Props extends Integration.PubsubComponentProps {
  hideTitle?: boolean;
  switchProps?: SwitchProps;
  hotkeyActionId?: HotkeyActionId;
}

const PubsubSwitch: FC<Props> = ({ integration, hideTitle, switchProps, hotkeyActionId }) => {
  const { id } = integration;
  const { t } = useTranslation();
  const { subscribed, loading } = useStore<Integration.PubsubSubscription>(integration.pubsubFlow.store);
  const Icon = integration.branding.icon;

  const handleSwitchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      if (e.target.checked) {
        integration.pubsubFlow.connect();
      } else {
        integration.pubsubFlow.disconnect();
      }
    },
    [integration],
  );

  const displayName = useMemo(() => {
    const baseName = t(`integration.${id}.name`);

    // Show region code for DonatePay when authenticated
    if (id === 'donatePay') {
      const region = getActiveRegion();
      if (region) {
        return `${baseName} (${region.toUpperCase()})`;
      }
    }

    return baseName;
  }, [id, t]);

  return (
    <Switch
      onChange={handleSwitchChange}
      className={classNames('integration-switch', id)}
      {...switchProps}
      disabled={loading}
      checked={subscribed}
      label={
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Icon />
            {!hideTitle && <Text fw={500}>{displayName}</Text>}
          </div>
          {hotkeyActionId ? <HotkeyHint actionId={hotkeyActionId} /> : null}
        </div>
      }
    />
  );
};

export default PubsubSwitch;
