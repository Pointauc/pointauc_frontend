import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import { ThunkDispatch } from 'redux-thunk';
import Fuse from 'fuse.js';

import { RootState } from '@reducers';

import SlotsHeader from '../SlotsHeader/SlotsHeader';

import SlotsList from './SlotsList';
import { Slot } from '@models/slot.model';

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
    const input = buyoutInput.current;
    if (input) {
      input.addEventListener('change', handleBuyoutChange);
      return () => {
        input.removeEventListener('change', handleBuyoutChange);
      };
    }
  }, [buyoutInput]);

  const slotsColumnClasses = useMemo(
    () => classNames('slots-column', { dragging: !!draggedRedemption }),
    [draggedRedemption],
  );

  const fuse = useMemo(() => new Fuse(slots, {
    keys: ['name', 'fastId'],
    threshold: 0.3,
    ignoreLocation: true,
  }), [slots]);

  const [filteredSlots, setFilteredSlots] = useState(slots);
  const filterSlots = useCallback((slots: Slot[], searchTerm: string) => {
    if (!searchTerm) return slots;
    const fuseResults = fuse.search(searchTerm);
    return fuseResults.map(result => result.item);
  }, [fuse]);

  const throttledSetFilteredSlots = useRef<ReturnType<typeof throttle>>();

  useEffect(() => {
    throttledSetFilteredSlots.current = throttle(
      (slots: Slot[], searchTerm: string) => {
        setFilteredSlots(filterSlots(slots, searchTerm));
      },
      250
    );
    return () => {
      throttledSetFilteredSlots.current?.cancel();
    };
  }, [filterSlots]);

  useEffect(() => {
    throttledSetFilteredSlots.current?.(slots, searchTerm);
  }, [searchTerm, slots]);

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
