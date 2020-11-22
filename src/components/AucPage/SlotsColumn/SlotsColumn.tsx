import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { FormControlLabel, Grid, IconButton, Input, Radio, RadioGroup, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import VerticalSplitRoundedIcon from '@material-ui/icons/VerticalSplitRounded';
import ReorderRoundedIcon from '@material-ui/icons/ReorderRounded';
import FlipMove from 'react-flip-move';
import { RootState } from '../../../reducers';
import { addSlot, createSlotFromPurchase } from '../../../reducers/Slots/Slots';
import { PurchaseDragType } from '../../../models/purchase';
import { DragTypeEnum } from '../../../enums/dragType.enum';
import { setNotification } from '../../../reducers/notifications/notifications';
import { DEFAULT_SLOT_NAME } from '../../../constants/slots.constants';
import DroppableSlot from '../Slot/DroppableSlot';

const TwoColumnIcon = VerticalSplitRoundedIcon;
const SingleColumnIcon = ReorderRoundedIcon;

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch();
  const buyoutInput = useRef<HTMLInputElement>(null);
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const {
    settings: { isBuyoutVisible, background },
  } = useSelector((rootReducer: RootState) => rootReducer.aucSettings);
  const [buyout, setBuyout] = useState<number | null>(null);
  const [slotWidth, setSlotWidth] = useState<6 | 12>(12);

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

  const winnerSlot = useMemo(() => slots[0], [slots]);

  useEffect(() => {
    const { name, amount } = winnerSlot;

    if (isBuyoutVisible && buyout && amount && amount >= buyout) {
      dispatch(setNotification(`${name || DEFAULT_SLOT_NAME} выкупили за ${amount}!`));
    }
  }, [buyout, dispatch, isBuyoutVisible, winnerSlot]);

  const addButtonClasses = useMemo(
    () =>
      classNames(
        'add-button',
        { 'drop-help': canDrop && !isOver },
        { 'drag-over': isOver },
        { 'custom-background': background },
      ),
    [background, canDrop, isOver],
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

  const handleSlotWidthChange = (e: ChangeEvent<HTMLInputElement>, value: string): void => {
    const newWidth = Number(value);
    if (newWidth === 6 || newWidth === 12) {
      setSlotWidth(newWidth);
    }
  };

  return (
    <Grid container direction="column" wrap="nowrap" className="slots">
      <div className={buyoutStyles}>
        <Typography className="slots-column-buyout-title" variant="h4">
          Выкуп...
        </Typography>
        <Input className="slots-column-buyout-input" placeholder="₽" inputRef={buyoutInput} type="number" />
      </div>

      <Grid container wrap="nowrap" className="slots-wrapper">
        <Grid container className="slots-column" direction="column" wrap="nowrap">
          <Grid container className="slots-column-list" spacing={1}>
            <FlipMove typeName={null} enterAnimation="fade" leaveAnimation="fade" maintainContainerHeight>
              {slots.map((slot, index) => (
                <Grid key={slot.id} item xs={slotWidth}>
                  <DroppableSlot index={index + 1} {...slot} />
                </Grid>
              ))}
            </FlipMove>
          </Grid>
          <IconButton onClick={handleAddSlot} className={addButtonClasses} title="Добавить слот" ref={drops}>
            <AddBoxIcon fontSize="large" />
          </IconButton>
        </Grid>

        <RadioGroup value={slotWidth} onChange={handleSlotWidthChange} row className="slots-width-wrapper">
          <FormControlLabel
            control={<Radio icon={<SingleColumnIcon />} checkedIcon={<SingleColumnIcon />} />}
            label=""
            value={12}
          />
          <FormControlLabel
            control={<Radio icon={<TwoColumnIcon />} checkedIcon={<TwoColumnIcon />} />}
            label=""
            value={6}
          />
        </RadioGroup>
      </Grid>
    </Grid>
  );
};

export default SlotsColumn;
