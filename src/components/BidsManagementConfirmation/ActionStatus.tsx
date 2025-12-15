import { Progress, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import classes from './BidsManagementConfirmation.module.css';

interface ActionStatusProps {
  status: API.RequestStatus;
}

function ActionStatus({ status }: ActionStatusProps) {
  const { t } = useTranslation();

  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return <Progress className={classes.loadingProgress} value={100} animated />;
  }

  return (
    <Text c={status === 'success' ? 'green' : 'red'} className={classes.actionStatus}>
      {t(`bidsManagement.requestStatus.${status}`)}
    </Text>
  );
}

export default ActionStatus;
