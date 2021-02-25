import React, { DragEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, IconButton, Input, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import classNames from 'classnames';
import { RootState } from '../../../reducers';
import { addSlot, createSlotFromPurchase } from '../../../reducers/Slots/Slots';
import { handleDragOver } from '../../../utils/common.utils';
import SlotsList from './SlotsList';
import {
  Bid,
  logPurchase,
  PurchaseStatusEnum,
  removePurchase,
  setDraggedRedemption,
  updateExistBids,
} from '../../../reducers/Purchases/Purchases';
import { Slot } from '../../../models/slot.model';

// const TwoColumnIcon = VerticalSplitRoundedIcon;
// const SingleColumnIcon = ReorderRoundedIcon;

interface SlotsColumnProps {
  slots: Slot[];
  index: 0 | 1;
}

const SlotsColumn: FC<SlotsColumnProps> = ({ slots, index }) => {
  const dispatch = useDispatch();
  const buyoutInput = useRef<HTMLInputElement>(null);
  const {
    settings: { isBuyoutVisible, background },
  } = useSelector((rootReducer: RootState) => rootReducer.aucSettings);
  const { draggedRedemption } = useSelector((root: RootState) => root.purchases);
  const [, setBuyout] = useState<number | null>(null);
  const [slotWidth] = useState<6 | 12>(12);
  const [enterCounter, setEnterCounter] = useState<number>(0);
  const isOver = useMemo(() => !!enterCounter, [enterCounter]);

  const handleAddSlot = (): void => {
    dispatch(addSlot(index));
  };

  const addButtonClasses = useMemo(
    () => classNames('add-button', { 'drag-over': isOver }, { 'custom-background': background }),
    [background, isOver],
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

  // const handleSlotWidthChange = (e: ChangeEvent<HTMLInputElement>, value: string): void => {
  //   const newWidth = Number(value);
  //   if (newWidth === 6 || newWidth === 12) {
  //     setSlotWidth(newWidth);
  //   }
  // };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLButtonElement>) => {
      const redemption: Bid = JSON.parse(e.dataTransfer.getData('redemption'));
      dispatch(createSlotFromPurchase({ ...redemption, index }));
      dispatch(logPurchase({ ...redemption, status: PurchaseStatusEnum.Processed, target: redemption.id.toString() }));
      dispatch(removePurchase(redemption.id));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);
      setEnterCounter(0);
    },
    [dispatch, index],
  );

  const handleDragEnter = useCallback(() => {
    setEnterCounter((prevState) => prevState + 1);
  }, []);

  const handleDragLeave = useCallback(() => {
    setEnterCounter((prevState) => prevState - 1);
  }, []);

  const slotsColumnClasses = useMemo(() => classNames('slots-column', { dragging: !!draggedRedemption }), [
    draggedRedemption,
  ]);

  return (
    <Grid container direction="column" wrap="nowrap" className="slots">
      <div className={buyoutStyles}>
        <Typography className="slots-column-buyout-title" variant="h4">
          Выкуп...
        </Typography>
        <Input className="slots-column-buyout-input" placeholder="₽" inputRef={buyoutInput} type="number" />
      </div>

      <Grid container wrap="nowrap" className="slots-wrapper">
        <Grid container className={slotsColumnClasses} direction="column" wrap="nowrap">
          <SlotsList slots={slots} slotWidth={slotWidth} />
          <IconButton
            onClick={handleAddSlot}
            className={addButtonClasses}
            title="Добавить слот"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <AddBoxIcon fontSize="large" />
          </IconButton>
        </Grid>

        {/* <RadioGroup value={slotWidth} onChange={handleSlotWidthChange} row className="slots-width-wrapper"> */}
        {/*  <FormControlLabel */}
        {/*    control={<Radio icon={<SingleColumnIcon />} checkedIcon={<SingleColumnIcon />} />} */}
        {/*    label="" */}
        {/*    value={12} */}
        {/*  /> */}
        {/*  <FormControlLabel */}
        {/*    control={<Radio icon={<TwoColumnIcon />} checkedIcon={<TwoColumnIcon />} />} */}
        {/*    label="" */}
        {/*    value={6} */}
        {/*  /> */}
        {/* </RadioGroup> */}
      </Grid>
    </Grid>
  );
};

export default SlotsColumn;
