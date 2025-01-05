import { DragEvent, memo, useCallback, useRef, useState } from 'react';
import './Slot.scss';
import { Menu, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';

import { addBid, deleteSlot, setSlotName } from '@reducers/Slots/Slots.ts';
import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { Purchase, setDraggedRedemption, updateExistBids } from '@reducers/Purchases/Purchases.ts';
import slotNamesMap from '@services/SlotNamesMap';
import { openTrailer } from '@reducers/ExtraWindows/ExtraWindows.ts';
import { handleDragOver } from '@utils/common.utils.ts';

import SlotComponent from './SlotComponent';

interface DroppableSlotProps {
  index: number;
  slot: Slot;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, slot }) => {
  const { t } = useTranslation();
  const background = useSelector((root: RootState) => root.aucSettings.settings.background);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isExtraOpen, setIsExtraOpen] = useState<boolean>(false);
  const extraIcon = useRef<HTMLButtonElement>(null);
  const { id, amount, name } = slot;
  const slotElement = useRef<HTMLDivElement>(null);
  const enterCounter = useRef<number>(0);

  const resetOverStyle = useCallback(() => {
    enterCounter.current = 0;

    requestAnimationFrame(() => {
      if (slotElement.current) {
        slotElement.current.classList.remove('drag-over');
        slotElement.current.classList.remove('remove-cost');
      }
    });
  }, []);

  const updateOverStyle = useCallback(
    (enterCounterChange: number, isRemove?: boolean) => {
      enterCounter.current += enterCounterChange;

      if (enterCounter.current > 0) {
        requestAnimationFrame(() => {
          if (slotElement.current) {
            slotElement.current.classList.add('drag-over');

            if (isRemove) {
              slotElement.current.classList.add('remove-cost');
            }
          }
        });
      } else {
        resetOverStyle();
      }
    },
    [resetOverStyle],
  );

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  const slotWrapperClasses = classNames('slot-wrapper', { 'custom-background': background });

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      const bid: Purchase = JSON.parse(e.dataTransfer.getData('redemption'));
      const { message } = bid;

      slotNamesMap.set(message, id);
      dispatch(addBid(id, bid));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name: message }));
      }
      resetOverStyle();
    },
    [dispatch, id, name, resetOverStyle],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      updateOverStyle(1, e.dataTransfer.types.includes('remove'));
    },
    [updateOverStyle],
  );

  const handleDragLeave = useCallback(() => {
    updateOverStyle(-1);
  }, [updateOverStyle]);

  const openExtra = useCallback(() => setIsExtraOpen(true), []);
  const closeExtra = useCallback(() => setIsExtraOpen(false), []);

  const handleOpenTrailer = useCallback(() => {
    closeExtra();
    dispatch(openTrailer(name || ''));
  }, [closeExtra, dispatch, name]);

  return (
    <div
      className={slotWrapperClasses}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className='slot' ref={slotElement}>
        <div className='slot-index'>{`${index}.`}</div>
        <div className='slot-fast-index'>{`#${slot.fastId}`}</div>
        <SlotComponent slot={slot} />
      </div>
      <button onClick={handleDelete} className=' slot-icon-button delete-button' title={t('lot.delete')}>
        <DeleteIcon />
      </button>
      <button
        onClick={openExtra}
        className='slot-icon-button delete-button'
        title={t('lot.extra')}
        aria-controls='extra'
        ref={extraIcon}
      >
        <MoreHorizIcon />
      </button>
      <Menu
        id='extra'
        open={isExtraOpen}
        onClose={closeExtra}
        anchorEl={extraIcon.current}
        PaperProps={{ style: { width: '20ch' } }}
        TransitionProps={{ timeout: 100 }}
      >
        <MenuItem onClick={handleOpenTrailer}>{t('lot.trailer')}</MenuItem>
      </Menu>
    </div>
  );
};

const MemorizedDroppableSlot = memo(DroppableSlot);

export default MemorizedDroppableSlot;
