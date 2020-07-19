import React from 'react';
import Stopwatch from '../Stopwatch/Stopwatch';
import './ControlColumn.scss';

const ControlColumn: React.FC = () => {
  return (
    <div className="control-column">
      <Stopwatch />
    </div>
  );
};

export default ControlColumn;
