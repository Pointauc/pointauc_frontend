import React from 'react';
import Stopwatch from '../AucPage/Stopwatch/Stopwatch';
import './ControlColumn.scss';
import PurchaseList from '../PurchaseList/PurchaseList';

const ControlColumn: React.FC = () => {
  return (
    <div className="control-column">
      <Stopwatch />
      <PurchaseList />
    </div>
  );
};

export default ControlColumn;
