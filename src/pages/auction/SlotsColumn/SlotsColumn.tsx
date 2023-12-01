import { useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { ThunkDispatch } from 'redux-thunk';

import { RootState } from '@reducers';

import SlotsHeader from '../SlotsHeader/SlotsHeader';

import SlotsList from './SlotsList';

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const buyoutInput = useRef<HTMLInputElement>(null);
  const { slots, searchTerm } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const {
    settings: { isBuyoutVisible, isTotalVisible },
  } = useSelector((rootReducer: RootState) => rootReducer.aucSettings);
  const { draggedRedemption } = useSelector((root: RootState) => root.purchases);
  const [, setBuyout] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBuyoutChange = (): void => {
    if (buyoutInput.current) {
      setBuyout(Number(buyoutInput.current.value));
    }
  };

  useEffect(() => {
    if (!isBuyoutVisible && buyoutInput.current) {
      setBuyout(null);
      buyoutInput.current.value = '';
    }
  }, [isBuyoutVisible]);

  useEffect(() => {
    if (buyoutInput.current) {
      buyoutInput.current.addEventListener('change', handleBuyoutChange);
    }
  }, [buyoutInput]);

  const slotsColumnClasses = useMemo(
    () => classNames('slots-column', { dragging: !!draggedRedemption }),
    [draggedRedemption],
  );

  const filteredSlots = useMemo(
    () => (searchTerm ? slots.filter(({ name }) => name?.toLowerCase().includes(searchTerm.toLowerCase())) : slots),
    [searchTerm, slots],
  );

  const optimize = useMemo(() => slots.length > 100, [slots.length]);

  return (
    <div className='slots'>
      <SlotsHeader />
      <div className='slots-wrapper'>
        <div className={slotsColumnClasses} ref={containerRef}>
          <SlotsList containerRef={containerRef} slots={filteredSlots} optimize={optimize} />
        </div>
      </div>
    </div>
  );
};

export default SlotsColumn;
