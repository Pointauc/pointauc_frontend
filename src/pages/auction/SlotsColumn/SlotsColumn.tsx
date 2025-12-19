import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import { useIsMobile } from '@shared/lib/ui';

import SlotsHeader from '../SlotsHeader/SlotsHeader';

import SlotsList from './List/SlotsList';
import classes from './SlotsColumn.module.css';

const SlotsColumn: React.FC = () => {
  const buyoutInput = useRef<HTMLInputElement>(null);
  const { slots, searchTerm } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const {
    settings: { isBuyoutVisible, isTotalVisible },
  } = useSelector((rootReducer: RootState) => rootReducer.aucSettings);
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

  const filteredSlots = useMemo(
    () => (searchTerm ? slots.filter(({ name }) => name?.toLowerCase().includes(searchTerm.toLowerCase())) : slots),
    [searchTerm, slots],
  );

  const optimize = useMemo(() => slots.length > 50, [slots.length]);
  const isMobile = useIsMobile();

  return (
    <div className={classes.root}>
      {!isMobile && <SlotsHeader />}
      <div className={classes.wrapper}>
        <div className={classes.column} ref={containerRef}>
          <SlotsList containerRef={containerRef} slots={filteredSlots} optimize={optimize} />
        </div>
      </div>
    </div>
  );
};

export default SlotsColumn;
