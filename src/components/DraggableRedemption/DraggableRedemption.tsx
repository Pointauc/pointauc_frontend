import React, { DragEvent, FC, memo, useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Purchase, setDraggedRedemption } from '../../reducers/Purchases/Purchases';
import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';

interface DragPosition {
  left: number;
  top: number;
}

const initialPosition: DragPosition = { left: -1000, top: -1000 };

const DraggableRedemption: FC<Purchase> = (purchase) => {
  const dispatch = useDispatch();
  const { id, cost } = purchase;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mouseOffset, setMouseOffset] = useState<DragPosition>(initialPosition);
  const redemptionRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.dataTransfer.setData('redemption', JSON.stringify(purchase));
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      if (cost < 0) {
        e.dataTransfer.setData('remove', 'true');
      }

      dispatch(setDraggedRedemption(id.toString()));
      setIsDragging(true);

      if (redemptionRef.current) {
        const { left, top } = redemptionRef.current.getBoundingClientRect();
        setMouseOffset({ left: e.clientX - left, top: e.clientY - top });

        if (dragRef.current) {
          dragRef.current.style.left = `${left}px`;
          dragRef.current.style.top = `${top}px`;
          dragRef.current.hidden = false;
        }
      }
    },
    [cost, dispatch, id, purchase],
  );

  const handleDragEnd = useCallback((): void => {
    dispatch(setDraggedRedemption(null));
    setIsDragging(false);

    if (dragRef.current) {
      dragRef.current.hidden = true;
    }
  }, [dispatch]);

  const handleDrag = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.persist();

      if (dragRef.current) {
        dragRef.current.style.left = `${e.clientX - mouseOffset.left}px`;
        dragRef.current.style.top = `${e.clientY - mouseOffset.top}px`;
      }
    },
    [mouseOffset.left, mouseOffset.top],
  );

  return (
    <>
      <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrag={handleDrag} ref={redemptionRef}>
        <PurchaseComponent {...purchase} isDragging={isDragging} />
      </div>
      <div style={{ pointerEvents: 'none', position: 'absolute' }} hidden className="drag-context" ref={dragRef}>
        <PurchaseComponent {...purchase} />
      </div>
    </>
  );
};

export default memo(DraggableRedemption);
