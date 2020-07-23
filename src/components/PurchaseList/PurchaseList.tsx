import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';
import './PurchaseList.scss';

const PurchaseList: React.FC = () => {
  const { purchases } = useSelector((root: RootState) => root.purchases);

  return (
    <div className="purchase-list">
      {purchases.map((purchase) => (
        <PurchaseComponent {...purchase} key={purchase.id} />
      ))}
    </div>
  );
};

export default PurchaseList;
