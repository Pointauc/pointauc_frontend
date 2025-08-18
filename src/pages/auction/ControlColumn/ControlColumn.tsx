import { useTimerBroadcasting } from '@features/broadcasting/lib/broadcastHooks/useTimerBroadcasting';

import Stopwatch from '../Stopwatch/Stopwatch';
import PurchaseList from '../PurchaseList/PurchaseList';
import FastAccessPanel from '../FastAccessPanel/FastAccessPanel';

import './ControlColumn.scss';

const ControlColumn: React.FC = () => {
  const timerProps = useTimerBroadcasting();
  return (
    <div className='control-column'>
      <Stopwatch {...timerProps} />
      <FastAccessPanel />
      <PurchaseList />
    </div>
  );
};

export default ControlColumn;
