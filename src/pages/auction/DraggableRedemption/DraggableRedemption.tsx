import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Purchase, setDraggedRedemption } from '../../../reducers/Purchases/Purchases';
import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';
import { draggedBid } from '../DragBidContext/DragBidContext';
import { DragPosition } from '../../../models/common.model';

const initialPosition: DragPosition = { left: -1000, top: -1000 };

const DraggableRedemption: FC<Purchase> = (purchase) => {
  const dispatch = useDispatch();
  const { cost } = purchase;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mouseOffset, setMouseOffset] = useState<DragPosition>(initialPosition);
  const redemptionRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.dataTransfer.setData('redemption', JSON.stringify(purchase));
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      if (cost < 0) {
        e.dataTransfer.setData('remove', 'true');
      }

      dispatch(setDraggedRedemption(purchase));
      setIsDragging(true);

      if (redemptionRef.current) {
        const { left, top } = redemptionRef.current.getBoundingClientRect();

        setMouseOffset({ left: e.pageX - left, top: e.pageY - top });

        if (draggedBid.ref) {
          draggedBid.ref.style.left = `${left}px`;
          draggedBid.ref.style.top = `${top}px`;
          draggedBid.ref.hidden = false;
        }
      }
    },
    [cost, dispatch, purchase],
  );

  const handleDragEnd = useCallback((): void => {
    dispatch(setDraggedRedemption(null));
    setIsDragging(false);

    if (draggedBid.ref) {
      draggedBid.ref.hidden = true;
    }
  }, [dispatch]);

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (draggedBid.ref) {
        draggedBid.ref.style.left = `${e.pageX - mouseOffset.left}px`;
        draggedBid.ref.style.top = `${e.pageY - mouseOffset.top}px`;
      }
    },
    [mouseOffset.left, mouseOffset.top],
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    let isFrameRequested = false;
    const handleDragOver = (e: DragEvent): void => {
      if (!isFrameRequested) {
        requestAnimationFrame(() => {
          handleDrag(e as any);

          isFrameRequested = false;
        });

        isFrameRequested = true;
      }
    };

    document.addEventListener('dragover', handleDragOver);

    return (): void => document.removeEventListener('dragover', handleDragOver);
  }, [handleDrag]);

  return (
    <>
      <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} ref={redemptionRef}>
        <PurchaseComponent {...purchase} isDragging={isDragging} />
      </div>
    </>
  );
};

export default memo(DraggableRedemption);
