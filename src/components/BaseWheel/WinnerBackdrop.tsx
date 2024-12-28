import React, { Key, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Grid from '@mui/material/Grid2';

import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import BidsManagementDialog from '@components/BidsManagementConfirmation/Dialog.tsx';
import { pointsManagementPresets } from '@components/BidsManagementConfirmation/utils.ts';

interface WinnerBackdropProps {
  name: string;
  id: Key;
  onDelete?: () => void;
}

const WinnerBackdrop = (props: WinnerBackdropProps) => {
  const { name, onDelete, id } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [bidManagementOpen, setBidManagementOpen] = useState<boolean>(false);

  const toggleDialog = () => {
    setDialogOpen((prev) => !prev);
  };

  const deleteWinner = () => {
    onDelete?.();
    toggleDialog();
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: t('wheel.lotWasDeleted') }));
  };

  const pointsAction = useMemo(() => pointsManagementPresets.returnAllExcept(id as string), [id]);

  return (
    <div style={{ pointerEvents: 'all' }} className='wheel-winner'>
      {name.startsWith('https://') ? (
        <Link href={name} target='_blank'>
          {name}
        </Link>
      ) : (
        <>{name}</>
      )}
      <Grid container gap={2}>
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

            <Button onClick={() => setBidManagementOpen(true)} variant='outlined' color='primary'>
              {t('wheel.returnPointsToTheRest')}
            </Button>

            <BidsManagementDialog
              open={bidManagementOpen}
              onClose={() => setBidManagementOpen(false)}
              actions={pointsAction}
            >
              <DialogTitle>{t('bidsManagement.modalTitle.returnAllExceptWinner')}</DialogTitle>
            </BidsManagementDialog>
          </>
        )}
      </Grid>
    </div>
  );
};

export default WinnerBackdrop;
