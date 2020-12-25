import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reducers';
import './Wheel.scss';
import LoadingPage from '../../LoadingPage/LoadingPage';

const Wheel: React.FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [isLoading, setIsLoading] = useState(true);

  const slotsQuery = useMemo(() => {
    const params = new URLSearchParams();

    slots.forEach(({ name }, index) => params.append(`c${index + 1}`, name || ''));

    return params.toString();
  }, [slots]);

  const weights = useMemo(() => slots.map(({ amount }) => amount).join(', '), [slots]);
  const handleFrameLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div style={{ width: 700, height: 700, overflow: 'hidden' }}>
      {isLoading && <LoadingPage style={{ width: 700, height: 700 }} />}
      <iframe
        title="Wheel"
        src={`https://wheeldecide.com/e.php?${slotsQuery}&time=5&weights=${weights}`}
        width="700"
        height="700"
        scrolling="no"
        frameBorder="0"
        onLoad={handleFrameLoad}
      />
    </div>
  );
};

export default Wheel;
