import React from 'react';
import Stopwatch from '../Stopwatch/Stopwatch';
import './ControlColumn.scss';
import PurchaseList from '../PurchaseList/PurchaseList';
import FastAccessPanel from '../FastAccessPanel/FastAccessPanel';

const ControlColumn: React.FC = () => {
  return (
    <div className="control-column">
      <Stopwatch />
      <FastAccessPanel />
      <PurchaseList />
    </div>
  );
};

export default ControlColumn;
