import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NewDropoutDescription = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className='description-dialog' maxWidth='sm' fullWidth>
        <DialogTitle>{t('wheel.newDropout.description')}</DialogTitle>
        <DialogContent dividers className='description-content-dropout'>
          <div className='dropout-wheel-proof'>
            <h2>Как работает рандом?</h2>
            <p className='info'>Весь рандом и все вычисления происходят заранее перед первым прокрутом:</p>
            <ol>
              <li>Определяется финальный победитель согласно шансам обычного колеса</li>
              <li>Генерируется цепочка остальных выбывших, чтобы создать интригу</li>
            </ol>
            <h2>Что значат размеры секторов?</h2>
            <p className='info'>
              То что вы видите в колесе не отражает шансы при прокруте, а по сути сделано для красоты.
            </p>
            <p>
              При общем количестве лотов равном X, размер сектора в колесе обозначает вероятность этого лота НЕ выиграть
              в ОБЫЧНОМ колесе X - 1 раз. Это не используется для выбора победителя, но рисует красивые значения на
              экране.
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
