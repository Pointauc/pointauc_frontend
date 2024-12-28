import React, { useEffect, useState } from 'react';
import Grid2 from '@mui/material/Grid2';
import { Backdrop, Button, Input } from '@mui/material';
import confetti from 'canvas-confetti';
import { useDispatch } from 'react-redux';

import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
import withLoading from '@decorators/withLoading.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import './index.scss';

interface AukusBackdropProps {
  onClose: () => void;
  open: boolean;
  winner: string;
}

const AukusBackdrop = ({ onClose, open, winner }: AukusBackdropProps) => {
  const [value, setValue] = React.useState<string>(winner);
  useEffect(() => {
    setValue(winner);
  }, [winner]);
  const dispath = useDispatch();
  const inputWidth = `${value.length - 1}ch`;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const zIndex = 2000;
      const shootProps = {
        particleCount: 200,
        spread: 110,
        startVelocity: 80,
        zIndex,
      };

      setTimeout(() => {
        confetti({ ...shootProps, origin: { y: 0.8, x: 0 }, angle: 50 });
        confetti({ ...shootProps, origin: { y: 0.8, x: 1 }, angle: 130 });
      }, 700);
    }
  }, [open]);

  const saveAukusResult = () => {
    withLoading(setLoading, async () => {
      try {
        // await aukusApi.updateResult({ winner_title: value });
        dispath(addAlert({ message: 'Результат сохранен в Аукус', type: AlertTypeEnum.Success }));
      } catch (e: any) {
        dispath(addAlert({ message: `Ошибка сохранения - ${e.message}`, type: AlertTypeEnum.Error }));
      } finally {
        onClose();
      }
    })();
  };

  return (
    <Backdrop
      transitionDuration={{ enter: 2000, exit: 300 }}
      className='aukus-backdrop'
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      open={open}
    >
      <Grid2 direction='column' container spacing={4} alignItems='center'>
        <div className='winner-label'>Победитель</div>
        <Grid2 width='100%'>
          <Input
            inputProps={{ className: 'winner-input', sx: { width: inputWidth } }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Grid2>
        <Grid2 container spacing={2}>
          <Grid2>
            <Button onClick={onClose} size='large' variant='outlined' color='blank'>
              Закрыть
            </Button>
          </Grid2>
          <Grid2>
            <LoadingButton
              isLoading={loading}
              onClick={saveAukusResult}
              sx={{ fontWeight: 'bold' }}
              size='large'
              variant='contained'
              color='primary'
            >
              Выставить как текущий ход
            </LoadingButton>
          </Grid2>
        </Grid2>
      </Grid2>
    </Backdrop>
  );
};

export default AukusBackdrop;
