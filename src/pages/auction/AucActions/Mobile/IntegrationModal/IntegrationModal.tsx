import { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Group, Modal, Popover, Stack, Title } from '@mantine/core';

import { integrationUtils } from '@components/Integration/helpers.ts';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import PubsubSwitchGroup from '@components/Integration/PubsubFlow/components/PubsubSwitchGroup.tsx';
import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import MockBidForm from '@pages/auction/MockBidForm/MockBidForm';
import { RootState } from '@reducers';
import { isProduction } from '@utils/common.utils';

import classes from './IntegrationModal.module.css';

interface IntegrationModalProps {
  opened: boolean;
  onClose: () => void;
}

const IntegrationModal: FC<IntegrationModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);
  const [mockBidOpen, setMockBidOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { available, unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );
  const { donate, points } = useMemo(() => integrationUtils.groupBy.type(available), [available]);
  const labelClassNames = useMemo(
    () => ({
      labelWrapper: classes.switchLabelWrapper,
      body: classes.switchBody,
      track: classes.switchTrack,
      root: classes.switchRoot,
    }),
    [],
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group align='center' gap='sm'>
          <Title order={3}>{t('auc.integrations')}</Title>
          <SwitchAllIntegrations integrations={available} showLabel={false} classNames={labelClassNames} />
        </Group>
      }
      size='md'
      centered
    >
      <Stack gap='md'>
        {donate.length <= 1 &&
          donate.map((integration) => (
            <PubsubSwitch
              key={integration.id}
              switchProps={{ classNames: labelClassNames }}
              integration={integration}
            />
          ))}
        {donate.length > 1 && <PubsubSwitchGroup integrations={donate} classNames={labelClassNames} />}
        {points.map((integration) => (
          <PubsubSwitch key={integration.id} switchProps={{ classNames: labelClassNames }} integration={integration} />
        ))}
        {unavailable.map((integration) => (
          <integration.authFlow.loginComponent key={integration.id} integration={integration} />
        ))}
        {!isProduction() && (
          <>
            <Button ref={anchorRef} onClick={() => setMockBidOpen(true)} variant='filled' color='blue'>
              Send Test Bid
            </Button>
            {mockBidOpen && (
              <Popover
                opened={mockBidOpen}
                onClose={() => setMockBidOpen(false)}
                target={anchorRef.current}
                position='top'
              >
                <MockBidForm />
              </Popover>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
};

export default IntegrationModal;
