import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DuelWheelProof from '@components/RandomWheel/DuelWheelProof/DuelWheelProof.tsx';

const DuelDescription = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} className='description-dialog' maxWidth='sm' fullWidth>
        <DialogTitle>Описание дуэльного режима</DialogTitle>
        <DialogContent dividers className='description-dialog-content'>
          <DuelWheelProof />
        </DialogContent>
      </Dialog>
      <button onClick={() => setOpen(true)} type='button' className='description-link'>
        {t('wheel.howItWorks')}
      </button>
    </>
  );
};

export default DuelDescription;
