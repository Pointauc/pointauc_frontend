import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DropoutWheelProof from '@components/RandomWheel/DropoutWheelProof/DropoutWheelProof.tsx';

const ClassicDropoutDescription = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(localStorage.getItem('classicDropoutSeen') !== 'true');
    localStorage.setItem('classicDropoutSeen', 'true');
  }, []);

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} className='description-dialog dropout' maxWidth='md' fullWidth>
        <DialogTitle>{t('wheel.dropoutProof')}</DialogTitle>
        <DialogContent dividers className='description-content-dropout'>
          <DropoutWheelProof />
        </DialogContent>
      </Dialog>
      <button onClick={() => setOpen(true)} type='button' className='description-link'>
        {t('wheel.readBeforeUsage')}
      </button>
    </>
  );
};

export default ClassicDropoutDescription;
