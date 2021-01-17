import React from 'react';
import Stopwatch from '../AucPage/Stopwatch/Stopwatch';
import './ControlColumn.scss';
import PurchaseList from '../PurchaseList/PurchaseList';
import Options from '../Options/Options';

const ControlColumn: React.FC = () => {
  return (
    <div className="control-column">
      <Stopwatch />
      <PurchaseList />
      <Options />
    </div>
  );
};

export default ControlColumn;
