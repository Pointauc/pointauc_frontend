import React, { useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Input, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import { RootState } from '../../../reducers';
import SlotComponent from '../Slot/SlotComponent';
import { addSlot, createSlotFromPurchase } from '../../../reducers/Slots/Slots';
import { Slot } from '../../../models/slot.model';
import { PurchaseDragType } from '../../../models/purchase';
import { DragTypeEnum } from '../../../enums/dragType.enum';
import { setNotification } from '../../../reducers/notifications/notifications';
import { DEFAULT_SLOT_NAME } from '../../../constants/slots.constants';

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch();
  const buyoutInput = useRef<HTMLInputElement>(null);
  const [buyout, setBuyout] = useState<number | null>(null);
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const {
    settings: { isBuyoutVisible },
  } = useSelector((rootReducer: RootState) => rootReducer.aucSettings);

  const handleAddSlot = (): void => {
    dispatch(addSlot());
  };

  const [{ isOver, canDrop }, drops] = useDrop({
    accept: DragTypeEnum.Purchase,
    drop: (purchase: PurchaseDragType) => dispatch(createSlotFromPurchase(purchase)),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const sortedSlots = useMemo(() => [...slots].sort((a: Slot, b: Slot) => Number(b.amount) - Number(a.amount)), [
    slots,
  ]);

  const winnerSlot = useMemo(() => sortedSlots[0], [sortedSlots]);

  useEffect(() => {
    const { name, amount } = winnerSlot;

    if (isBuyoutVisible && buyout && amount && amount >= buyout) {
      dispatch(setNotification(`${name || DEFAULT_SLOT_NAME} выкупили за ${amount}!`));
    }
  }, [buyout, dispatch, isBuyoutVisible, winnerSlot]);

  const addButtonClasses = useMemo(
    () => classNames('add-button', { 'drop-help': canDrop && !isOver }, { 'drag-over': isOver }),
    [canDrop, isOver],
  );

  const handleBuyoutChange = (): void => {
    if (buyoutInput.current) {
      setBuyout(Number(buyoutInput.current.value));
    }
  };

  const buyoutStyles = classNames('slots-column-buyout', { hidden: !isBuyoutVisible });

  useEffect(() => {
    if (!isBuyoutVisible && buyoutInput.current) {
      setBuyout(null);
      buyoutInput.current.value = '';
    }
  }, [isBuyoutVisible]);

  useEffect(() => {
    if (buyoutInput.current) {
      buyoutInput.current.addEventListener('change', handleBuyoutChange);
    }
  }, [buyoutInput]);

  return (
    <div className="slots-column">
      <div className={buyoutStyles}>
        <Typography className="slots-column-buyout-title" variant="h4">
          Выкуп...
        </Typography>
        <Input className="slots-column-buyout-input" placeholder="₽" inputRef={buyoutInput} type="number" />
      </div>
      <div className="slots-column-list">
        {sortedSlots.map((slot) => (
          <SlotComponent key={slot.id} {...slot} />
        ))}
      </div>
      <IconButton onClick={handleAddSlot} className={addButtonClasses} title="Добавить слот" ref={drops}>
        <AddBoxIcon fontSize="large" />
      </IconButton>
    </div>
  );
};

export default SlotsColumn;
