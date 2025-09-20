import React from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import LinkOffIcon from '@mui/icons-material/LinkOff';

import withLoading from '@decorators/withLoading.ts';

interface Props {
  revoke: () => Promise<void> | void;
}

const RevokeIntegrationButton = (props: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);

  const revoke = () => {
    withLoading(setLoading, async () => {
      await props.revoke();
    })();
  };

  return (
    <Button leftSection={<LinkOffIcon />} loading={loading} size='sm' variant='outline' color='white' onClick={revoke}>
      {t('settings.integrationCommon.revoke')}
    </Button>
  );
};

export default RevokeIntegrationButton;
