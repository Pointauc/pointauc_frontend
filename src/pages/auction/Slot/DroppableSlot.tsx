import { DragEvent, memo, useCallback, useRef, useState } from 'react';
import './Slot.scss';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { ThunkDispatch } from 'redux-thunk';

import { deleteSlot, setSlotAmount, setSlotName } from '@reducers/Slots/Slots.ts';
import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import {
  logPurchase,
  Purchase,
  removePurchase,
  setDraggedRedemption,
  updateExistBids,
} from '@reducers/Purchases/Purchases.ts';
import slotNamesMap from '@services/SlotNamesMap';
import { useCostConvert } from '@hooks/useCostConvert.ts';
import { openTrailer } from '@reducers/ExtraWindows/ExtraWindows.ts';
import { handleDragOver } from '@utils/common.utils.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';

import SlotComponent from './SlotComponent';

interface DroppableSlotProps {
  index: number;
  slot: Slot;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, slot }) => {
  const pointsRate = useSelector((root: RootState) => root.aucSettings.settings.pointsRate);
  const background = useSelector((root: RootState) => root.aucSettings.settings.background);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isExtraOpen, setIsExtraOpen] = useState<boolean>(false);
  const extraIcon = useRef<HTMLButtonElement>(null);
  const { id, amount, name } = slot;
  const slotElement = useRef<HTMLDivElement>(null);
  const enterCounter = useRef<number>(0);

  const { getMarblesAmount } = useCostConvert();

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
      const redemption: Purchase = JSON.parse(e.dataTransfer.getData('redemption'));
      const { cost, message, isDonation, id: redemptionId } = redemption;
      const addedCost = isDonation ? cost * pointsRate : cost;

      slotNamesMap.set(message, id);
      dispatch(setSlotAmount({ id, amount: Number(amount) + getMarblesAmount(addedCost, !amount) }));
      dispatch(logPurchase({ ...redemption, status: PurchaseStatusEnum.Processed, target: id.toString() }));
      dispatch(removePurchase(redemptionId));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name: message }));
      }
      resetOverStyle();
    },
    [amount, getMarblesAmount, dispatch, id, name, pointsRate, resetOverStyle],
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
        <Typography className='slot-index'>{`${index}.`}</Typography>
        <Typography className='slot-fast-index'>{`#${slot.fastId}`}</Typography>
        <SlotComponent slot={slot} />
      </div>
      <IconButton onClick={handleDelete} className='delete-button' title='Удалить слот' size='large'>
        <DeleteIcon />
      </IconButton>
      <IconButton
        onClick={openExtra}
        className='delete-button'
        title='Дополнительно'
        aria-controls='extra'
        ref={extraIcon}
        size='large'
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id='extra'
        open={isExtraOpen}
        onClose={closeExtra}
        anchorEl={extraIcon.current}
        PaperProps={{ style: { width: '20ch' } }}
        TransitionProps={{ timeout: 100 }}
      >
        <MenuItem onClick={handleOpenTrailer}>Трейлер</MenuItem>
      </Menu>
    </div>
  );
};

const MemorizedDroppableSlot = memo(DroppableSlot);

export default MemorizedDroppableSlot;
