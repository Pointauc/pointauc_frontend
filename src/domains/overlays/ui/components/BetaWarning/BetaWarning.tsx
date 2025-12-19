import { Alert, Anchor, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import classes from './BetaWarning.module.css';

function BetaWarning() {
  const { t } = useTranslation();

  return (
    <Alert
      icon={<IconAlertTriangle size={20} />}
      title={t('overlays.betaWarning.title')}
      color='yellow'
      variant='light'
      className={classes.alert}
    >
      <Text size='sm' mb='xs'>
        {t('overlays.betaWarning.description')}
      </Text>
      <Text size='sm'>
        {t('overlays.betaWarning.reportIssue')}{' '}
        <Anchor href='https://github.com/Pointauc/pointauc_frontend/issues/new' target='_blank' rel='noreferrer'>
          {t('overlays.betaWarning.createGithubIssue')}
        </Anchor>{' '}
        {t('overlays.betaWarning.or')}{' '}
        <Anchor href='https://t.me/kozjarych' target='_blank' rel='noreferrer'>
          {t('overlays.betaWarning.contactTelegram')}
        </Anchor>
        .
      </Text>
    </Alert>
  );
}

export default BetaWarning;

