import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';
import { useDrag } from 'react-dnd';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Purchase, removePurchase, logPurchase, PurchaseStatusEnum } from '../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';
import { PurchaseDragType } from '../../models/purchase';
import { DragTypeEnum } from '../../enums/dragType.enum';

const PurchaseComponent: React.FC<Purchase> = (purchase) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { id, message, username, cost, color } = purchase;
  const isRemovePurchase = useMemo(() => cost < 0, [cost]);

  const handleRemove = (): void => {
    dispatch(logPurchase({ purchase, status: PurchaseStatusEnum.Deleted }));
    dispatch(removePurchase(id));
  };

  const draggableItem = useMemo(() => ({ type: DragTypeEnum.Purchase, ...purchase }), [purchase]);

  const [, drag, preview] = useDrag({
    item: draggableItem,
    end: (draggedItem?: PurchaseDragType, monitor?) => {
      setIsDragging(false);
      if (monitor && monitor.didDrop()) {
        dispatch(logPurchase({ purchase, status: PurchaseStatusEnum.Processed }));
        dispatch(removePurchase(id));
      }
    },
    begin: () => {
      setIsDragging(true);

      return draggableItem;
    },
  });

  const cardStyles = { backgroundColor: isDragging ? undefined : color };
  const purchaseClasses = classNames(['purchase', { 'drag-placeholder': isDragging, 'remove-cost': isRemovePurchase }]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <>
      <Card className={purchaseClasses} style={cardStyles} ref={drag}>
        <CardContent className="purchase-content">
          <div className="purchase-header">
            <Typography variant="h6">{`${cost} ${username}`}</Typography>
            <IconButton onClick={handleRemove} className="purchase-header-remove-button" title="Удалить слот">
              <CloseIcon />
            </IconButton>
          </div>
          <Typography>{message}</Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default PurchaseComponent;
