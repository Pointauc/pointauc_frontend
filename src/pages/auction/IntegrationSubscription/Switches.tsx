import { Stack } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PubsubSwitch from '@domains/bids/external-integrations/shared/pubsub/ui/PubsubSwitch.tsx';
import PubsubSwitchGroup from '@domains/bids/external-integrations/shared/pubsub/ui/PubsubSwitchGroup.tsx';
import * as Integration from '@models/integration';

import type { HotkeyActionId } from '@shared/lib/hotkeys/hotkeys.types';

interface IntegrationSubscriptionSwitchesProps {
  donationIntegrations: Integration.Config[];
  channelPointIntegrations: Integration.Config[];
  labelClassNames: Record<string, string>;
  donationHotkeyActionId: HotkeyActionId;
  channelPointsHotkeyActionId: HotkeyActionId;
}

const IntegrationSubscriptionSwitches = ({
  donationIntegrations,
  channelPointIntegrations,
  labelClassNames,
  donationHotkeyActionId,
  channelPointsHotkeyActionId,
}: IntegrationSubscriptionSwitchesProps) => {
  const { t } = useTranslation();

  const switchGroups = useMemo(
    () => [
      {
        hotkeyActionId: donationHotkeyActionId,
        integrations: donationIntegrations,
        labelText: t('integration.groups.donations'),
      },
      {
        hotkeyActionId: channelPointsHotkeyActionId,
        integrations: channelPointIntegrations,
        labelText: t('integration.groups.channelPoints'),
      },
    ],
    [channelPointIntegrations, donationHotkeyActionId, donationIntegrations, channelPointsHotkeyActionId, t],
  );

  return (
    <Stack gap='sm'>
      {switchGroups.map(({ hotkeyActionId, integrations, labelText }) => {
        if (integrations.length === 0) {
          return null;
        }

        if (integrations.length === 1) {
          return (
            <PubsubSwitch
              key={integrations[0].id}
              switchProps={{ classNames: labelClassNames }}
              integration={integrations[0]}
              hotkeyActionId={hotkeyActionId}
            />
          );
        }

        return (
          <PubsubSwitchGroup
            key={labelText}
            integrations={integrations}
            classNames={labelClassNames}
            labelText={labelText}
            hotkeyActionId={hotkeyActionId}
          />
        );
      })}
    </Stack>
  );
};

export default IntegrationSubscriptionSwitches;
