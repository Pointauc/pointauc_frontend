import React, { useEffect, useState } from 'react';
import { Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';
import { useDrag } from 'react-dnd';
import classNames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Purchase, removePurchase } from '../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';
import { PurchaseDragType } from '../../models/purchase';
import { DragTypeEnum } from '../../enums/dragType.enum';

const PurchaseComponent: React.FC<Purchase> = (purchase) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { id, message, username, cost, color } = purchase;

  const handleRemove = (): void => {
    dispatch(removePurchase(id));
  };

  const [, drag, preview] = useDrag({
    item: { type: DragTypeEnum.Purchase, ...purchase },
    end: (draggedItem?: PurchaseDragType, monitor?) => {
      setIsDragging(false);
      if (monitor && monitor.didDrop()) {
        handleRemove();
      }
    },
    begin: () => setIsDragging(true),
  });

  const cardStyles = { backgroundColor: isDragging ? undefined : color };
  const purchaseClasses = classNames(['purchase', { 'drag-placeholder': isDragging }]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <>
      <Card className={purchaseClasses} style={cardStyles} ref={drag}>
        <CardContent className="purchase-content">
          <div className="purchase-header">
            <Typography variant="h6">{`${cost} ${username}`}</Typography>
            <IconButton onClick={handleRemove} className="purchase-header-remove-button">
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
