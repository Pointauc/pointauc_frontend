import clsx from 'clsx';
import { DragEvent, memo, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Slot } from '@models/slot.model.ts';
import { Purchase, setDraggedRedemption, updateExistBids } from '@reducers/Purchases/Purchases.ts';
import { addBid, setSlotName } from '@reducers/Slots/Slots.ts';
import slotNamesMap from '@services/SlotNamesMap';
import { useIsMobile } from '@shared/lib/ui';
import bidUtils from '@utils/bid.utils';
import { handleDragOver } from '@utils/common.utils.ts';

import LotControls from './Controls/LotControls';
import styles from './DroppableSlot.module.css';

interface DroppableSlotProps {
  index: number;
  slot: Slot;
  readonly?: boolean;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, slot, readonly }) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { id, name } = slot;
  const slotElement = useRef<HTMLDivElement>(null);
  const enterCounter = useRef<number>(0);
  const isMobile = useIsMobile();

  const resetOverStyle = useCallback(() => {
    enterCounter.current = 0;

    requestAnimationFrame(() => {
      if (slotElement.current) {
        slotElement.current.classList.remove(styles.dragOver);
        slotElement.current.classList.remove(styles.removeCost);
      }
    });
  }, []);

  const updateOverStyle = useCallback(
    (enterCounterChange: number, isRemove?: boolean) => {
      enterCounter.current += enterCounterChange;

      if (enterCounter.current > 0) {
        requestAnimationFrame(() => {
          if (slotElement.current) {
            slotElement.current.classList.add(styles.dragOver);

            if (isRemove) {
              slotElement.current.classList.add(styles.removeCost);
            }
          }
        });
      } else {
        resetOverStyle();
      }
    },
    [resetOverStyle],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      const bid: Purchase = JSON.parse(e.dataTransfer.getData('redemption'));
      const name = bidUtils.getName(bid);

      slotNamesMap.set(name, id);
      dispatch(addBid(id, bid));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name }));
      }
      resetOverStyle();
    },
    [dispatch, id, resetOverStyle],
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

  return (
    <div
      className={clsx(styles.root, { [styles.even]: index % 2 === 0 })}
      ref={slotElement}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {!isMobile && <div className={styles.index}>{`${index}`}</div>}
      <LotControls lot={slot} readonly={readonly} />
    </div>
  );
};

export default memo(DroppableSlot);
