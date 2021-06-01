import React from 'react';
import Stopwatch from '../AucPage/Stopwatch/Stopwatch';
import './ControlColumn.scss';
import PurchaseList from '../PurchaseList/PurchaseList';
import AucActions from '../AucActions/AucActions';
import FastAccessPanel from '../FastAccessPanel/FastAccessPanel';

const ControlColumn: React.FC = () => {
  return (
    <div className="control-column">
      <Stopwatch />
      <FastAccessPanel />
      <PurchaseList />
      <AucActions />
    </div>
  );
};

export default ControlColumn;
