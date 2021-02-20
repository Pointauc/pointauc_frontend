import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Purchase, setDraggedRedemption } from '../../reducers/Purchases/Purchases';
import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';
import { isFirefox } from '../../utils/common.utils';

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
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.dataTransfer.setData('redemption', JSON.stringify(purchase));
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      if (cost < 0) {
        e.dataTransfer.setData('remove', 'true');
      }

      dispatch(setDraggedRedemption(id.toString()));
      setIsDragging(true);

      if (redemptionRef.current) {
        const { left, top } = redemptionRef.current.getBoundingClientRect();

        setMouseOffset({ left: e.pageX - left, top: e.pageY - top });

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
    (e: React.DragEvent) => {
      e.preventDefault();

      if (dragRef.current) {
        dragRef.current.style.left = `${e.pageX - mouseOffset.left}px`;
        dragRef.current.style.top = `${e.pageY - mouseOffset.top}px`;
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

    if (isFirefox()) {
      document.addEventListener('dragover', handleDragOver);

      return (): void => document.removeEventListener('dragover', handleDragOver);
    }
  }, [handleDrag]);

  return (
    <>
      <div draggable onDragStart={handleDragStart} onDrag={handleDrag} onDragEnd={handleDragEnd} ref={redemptionRef}>
        <PurchaseComponent {...purchase} isDragging={isDragging} />
      </div>
      <div style={{ pointerEvents: 'none', position: 'absolute' }} hidden className="drag-context" ref={dragRef}>
        <PurchaseComponent {...purchase} />
      </div>
    </>
  );
};

export default memo(DraggableRedemption);
