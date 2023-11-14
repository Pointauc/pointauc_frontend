import { FC, ReactNode, useCallback, useState } from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { unstable_useBlocker as useBlocker, useNavigate } from 'react-router-dom';

import './ConfirmFormOnLeave.scss';

interface ConfirmFormOnLeaveProps {
  isDirtyForm: boolean;
  onSubmit?: () => void;
  content?: (onClose: () => void, onConfirm: () => void) => ReactNode;
}

const ConfirmFormOnLeave: FC<ConfirmFormOnLeaveProps> = ({ onSubmit, isDirtyForm, content }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [nextLocation, setNextLocation] = useState<string>('');
  const navigate = useNavigate();

  useBlocker(({ nextLocation }) => {
    const { state, pathname } = nextLocation;
    if (isDirtyForm && !state?.forcePush) {
      setIsOpen(true);
      setNextLocation(pathname);

      return true;
    }

    return false;
  });

  const handleClose = useCallback(() => navigate(nextLocation, { state: { forcePush: true } }), [nextLocation]);
  const handleConfirm = useCallback(() => {
    onSubmit?.();
    handleClose();
  }, [handleClose, onSubmit]);

  if (content && isOpen) return <>{content(handleClose, handleConfirm)}</>;

  return (
    <Dialog open={isOpen} className='form-confirm-dialog'>
      <DialogTitle>Применить несохраненные изменения?</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose}>Отменить</Button>
        <Button onClick={handleConfirm} color='primary' autoFocus>
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmFormOnLeave;
