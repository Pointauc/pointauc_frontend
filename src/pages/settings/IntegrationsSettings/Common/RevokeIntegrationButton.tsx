import React from 'react';
import { useTranslation } from 'react-i18next';
import LinkOffIcon from '@mui/icons-material/LinkOff';

import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
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
    <LoadingButton startIcon={<LinkOffIcon />} isLoading={loading} variant='outlined' color='blank' onClick={revoke}>
      {t('settings.integrationCommon.revoke')}
    </LoadingButton>
  );
};

export default RevokeIntegrationButton;
