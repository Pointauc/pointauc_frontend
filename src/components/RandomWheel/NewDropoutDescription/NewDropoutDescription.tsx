import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NewDropoutDescription = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    setIsOpen(localStorage.getItem('newDropoutSeen') !== 'true');
    localStorage.setItem('newDropoutSeen', 'true');
  }, []);

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className='description-dialog' maxWidth='sm' fullWidth>
        <DialogTitle>{t('wheel.newDropout.explanation.title')}</DialogTitle>
        <DialogContent dividers className='description-content-dropout'>
          <div
            className='dropout-wheel-proof'
            dangerouslySetInnerHTML={{ __html: t('wheel.newDropout.explanation.content') }}
          ></div>
        </DialogContent>
      </Dialog>

      <button onClick={() => setIsOpen(true)} type='button' className='description-link'>
        {t('wheel.newDropout.explanation.button')}
      </button>
    </>
  );
};

export default NewDropoutDescription;
