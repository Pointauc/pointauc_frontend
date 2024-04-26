import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';

interface WinnerBackdropProps {
  name: string;
  onDelete?: () => void;
}

const WinnerBackdrop = (props: WinnerBackdropProps) => {
  const { name, onDelete } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setDialogOpen((prev) => !prev);
  };

  const deleteWinner = () => {
    onDelete?.();
    toggleDialog();
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: t('wheel.lotWasDeleted') }));
  };

  return (
    <div style={{ pointerEvents: 'all' }} className='wheel-winner'>
      {name.startsWith('https://') ? (
        <Link href={name} target='_blank'>
          {name}
        </Link>
      ) : (
        <>{name}</>
      )}
      {onDelete && (
        <>
          <Button onClick={toggleDialog} variant='outlined' color='secondary'>
            {t('wheel.deleteLot')}
          </Button>

          <Dialog open={dialogOpen} onClose={toggleDialog}>
            <DialogContent>
              <Typography>{t('wheel.lotDeleteWarning')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={deleteWinner} variant='outlined' color='secondary'>
                {t('wheel.delete')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default WinnerBackdrop;
