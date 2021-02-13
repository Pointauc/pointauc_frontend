import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { findBestMatch } from 'string-similarity';
import { Typography } from '@material-ui/core';
import { RootState } from '../../../reducers';
import DroppableSlot from '../Slot/DroppableSlot';
import './BestMatchSlot.scss';
import { Slot } from '../../models/slot.model';

interface BestMatchSlotProps {
  slots: Slot[];
}

const BestMatchSlot: FC<BestMatchSlotProps> = ({ slots }) => {
  const { draggedRedemption, purchases } = useSelector((root: RootState) => root.purchases);

  const draggedBidName = useMemo(() => purchases.find(({ id }) => id === draggedRedemption)?.message || '', [
    draggedRedemption,
    purchases,
  ]);

  const slotNames = useMemo(() => slots.map(({ name }) => name || ''), [slots]);

  const bestMatch = useMemo(() => {
    if (!slotNames.length) {
      return null;
    }

    const {
      bestMatch: { rating },
      bestMatchIndex,
    } = findBestMatch(draggedBidName, slotNames);

    return rating > 0.5 ? { ...slots[bestMatchIndex], index: bestMatchIndex + 1 } : null;
  }, [draggedBidName, slotNames, slots]);

  if (!bestMatch || !draggedRedemption) {
    return null;
  }

  return (
    <div className="best-match-container">
      <Typography variant="h6">Наилучшее сопадение:</Typography>
      <DroppableSlot {...bestMatch} />
    </div>
  );
};

export default BestMatchSlot;
