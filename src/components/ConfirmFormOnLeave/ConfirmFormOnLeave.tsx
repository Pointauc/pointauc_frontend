import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import history from '../../constants/history';
import './ConfirmFormOnLeave.scss';

interface ConfirmFormOnLeaveProps {
  isDirtyForm: boolean;
  onSubmit: () => void;
}

const ConfirmFormOnLeave: FC<ConfirmFormOnLeaveProps> = ({ onSubmit, isDirtyForm }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [nextLocation, setNextLocation] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line consistent-return
    const unBlock = history.block(({ pathname, state }) => {
      if (isDirtyForm && !state?.forcePush) {
        setIsOpen(true);
        setNextLocation(pathname);

        return false;
      }
    });

    return (): void => unBlock();
  }, [isDirtyForm]);

  const handleClose = useCallback(() => history.push(nextLocation, { forcePush: true }), [nextLocation]);
  const handleConfirm = useCallback(() => {
    onSubmit();
    handleClose();
  }, [handleClose, onSubmit]);

  return (
    <Dialog open={isOpen} className="form-confirm-dialog">
      <DialogTitle>Применить несохраненные изменения?</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Отменить
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmFormOnLeave;
