import React from 'react';
import { Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';
import { Purchase, removePurchase } from '../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';

const PurchaseComponent: React.FC<Purchase> = (purchase) => {
  const dispatch = useDispatch();
  const { id, message, username, timestamp, cost, children, color } = purchase;
  const cardStyles = { backgroundColor: color };

  const handleRemove = (): void => {
    dispatch(removePurchase(id));
  };

  return (
    <Card className="purchase" style={cardStyles}>
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
