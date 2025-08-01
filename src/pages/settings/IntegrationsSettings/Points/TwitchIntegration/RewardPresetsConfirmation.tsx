import { FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

interface RewardPresetsConfirmation {
  open: boolean;
  onCLose: () => void;
  onConfirm: () => void;
}

const RewardPresetsConfirmation: FC<RewardPresetsConfirmation> = ({ open, onCLose, onConfirm }) => {
  const handleConfirmClick = (): void => {
    onConfirm();
    onCLose();
  };

  return (
    <Dialog open={open} onClose={onCLose}>
      <DialogTitle>Внимание</DialogTitle>
      <DialogContent>После обновления наград, текущие выкупы зрителей нельзя будет вернуть!</DialogContent>
      <DialogActions>
        <Button onClick={onCLose} variant='outlined'>
          Закрыть
        </Button>
        <Button variant='contained' onClick={handleConfirmClick} color='primary'>
          Обновить награды
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RewardPresetsConfirmation;
