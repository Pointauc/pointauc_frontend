import React from 'react';
import { LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import '@components/BidsManagementConfirmation/ActionStatus.scss';

interface ActionStatusProps {
  status: API.RequestStatus;
}

const ActionStatus = ({ status }: ActionStatusProps) => {
  const { t } = useTranslation();

  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div>
        <LinearProgress className='loading-bid-action' />
      </div>
    );
  }

  return (
    <Typography color={status === 'success' ? '#66bb6a' : 'error'} className='bid-action-status'>
      {t(`bidsManagement.requestStatus.${status}`)}
    </Typography>
  );
};

export default ActionStatus;
