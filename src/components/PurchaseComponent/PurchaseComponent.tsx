import React from 'react';
import { Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';
import { useDrag } from 'react-dnd';
import { Purchase, removePurchase } from '../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';
import { DRAG_TYPE } from '../../constants/drag.constants';
import { PurchaseDragType } from '../../models/purchase';

const PurchaseComponent: React.FC<Purchase> = (purchase) => {
  const dispatch = useDispatch();
  const { id, message, username, timestamp, cost, children, color } = purchase;

  const handleRemove = (): void => {
    dispatch(removePurchase(id));
  };

  const [collectedProps, drag] = useDrag({
    item: { type: DRAG_TYPE.PURCHASE, ...purchase },
    end: (draggedItem?: PurchaseDragType, monitor?) => {
      if (monitor && monitor.didDrop()) {
        handleRemove();
      }
    },
  });

  const cardStyles = { backgroundColor: color };

  return (
    <Card className="purchase" style={cardStyles} ref={drag}>
      <CardContent>
        <div className="purchase-header">
          <Typography variant="h6">{`${cost} ${username}`}</Typography>
          <IconButton onClick={handleRemove} className="purchase-header-remove-button">
            <CloseIcon />
          </IconButton>
        </div>
        <Typography>{message}</Typography>
      </CardContent>
    </Card>
  );
};

export default PurchaseComponent;
