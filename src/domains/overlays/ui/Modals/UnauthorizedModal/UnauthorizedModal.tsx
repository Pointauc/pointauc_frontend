import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Divider, Modal, Stack, Text, Title } from '@mantine/core';

import { integrationUtils } from '@components/Integration/helpers';
import INTEGRATIONS from '@components/Integration/integrations';
import { RootState } from '@reducers';

import classes from './UnauthorizedModal.module.css';

interface UnauthorizedModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Modal shown to unauthorized users trying to access overlay features.
 * Displays available authentication methods via integration login components.
 */
const UnauthorizedModal: FC<UnauthorizedModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation();
  const user = useSelector((root: RootState) => root.user);

  const { unavailable } = useMemo(
    () => integrationUtils.groupBy.availability(INTEGRATIONS, user.authData),
    [user.authData],
  );

  const { partner: partnerIntegrations, regular: regularIntegrations } = useMemo(
    () => integrationUtils.groupBy.partner(unavailable),
    [unavailable],
  );

  const hasPartnerAndRegular = partnerIntegrations.length > 0 && regularIntegrations.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={2} className={classes.title}>
          {t('overlays.unauthorized.title')}
        </Title>
      }
      size='lg'
      centered
      classNames={{ root: classes.modal }}
    >
      <Stack gap='lg'>
        <Stack gap='md'>
          <Text size='md'>{t('overlays.unauthorized.description')}</Text>
          <Text size='sm' c='dimmed'>
            {t('overlays.unauthorized.hint')}
          </Text>
        </Stack>

        <Stack gap='sm'>
          <Text size='sm' fw={600}>
            {t('overlays.unauthorized.authMethodsTitle')}
          </Text>
          {partnerIntegrations.map((integration) => (
            <integration.authFlow.loginComponent key={integration.id} integration={integration} />
          ))}
          {hasPartnerAndRegular && <Divider />}
          {regularIntegrations.map((integration) => (
            <integration.authFlow.loginComponent key={integration.id} integration={integration} />
          ))}
        </Stack>
      </Stack>
    </Modal>
  );
};

export default UnauthorizedModal;
