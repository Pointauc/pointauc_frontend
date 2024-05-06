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
        <DialogTitle>{t('wheel.newDropout.description')}</DialogTitle>
        <DialogContent dividers className='description-content-dropout'>
          <div className='dropout-wheel-proof'>
            <h2>Обязательно прочтите перед тем как крутить</h2>
            <p className='info'>Весь рандом и все вычисления происходят заранее перед первым прокрутом:</p>
            <ol>
              <li>Определяется финальный победитель согласно шансам обычного колеса</li>
              <li>Генерируется цепочка остальных выбывших, чтобы создать интригу</li>
            </ol>
            <h2>Что значат размеры секторов?</h2>
            <p className='info'>
              То что вы видите в колесе не отражает шансы при прокруте, а сделано для красоты. Колесо подкручивает
              победителей согласно заранее опеределенной очереди.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <button onClick={() => setIsOpen(true)} type='button' className='description-link'>
        {t('wheel.newDropout.description')}
      </button>
    </>
  );
};

export default NewDropoutDescription;
