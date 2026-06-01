import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { debounce, throttle } from '@tanstack/react-pacer';

import { RootState } from '@reducers';
import { useIsMobile } from '@shared/lib/ui';

import SlotsHeader from '../SlotsHeader/SlotsHeader';

import SlotsList from './List/SlotsList';
import classes from './SlotsColumn.module.css';
import { LotsColumnContextType, LotsColumnContext } from './contexts';

const SlotsColumn: React.FC = () => {
  const buyoutInput = useRef<HTMLInputElement>(null);
  const { slots, searchTerm } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const isBuyoutVisible = useSelector((rootReducer: RootState) => rootReducer.aucSettings.settings.isBuyoutVisible);
  const showViewerNames = useSelector((rootReducer: RootState) => rootReducer.aucSettings.settings.showViewerNames);
  const [, setBuyout] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [lotWidthType, setLotWidthType] = useState<LotsColumnContextType['lotWidthType']>('full');

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

  useLayoutEffect(() => {
    const syncLotWidth = throttle(
      () => {
        if (!rootRef.current?.checkVisibility()) {
          return;
        }

        const breakpoint = showViewerNames ? 970 : 910;
        if (rootRef.current.clientWidth > breakpoint) {
          setLotWidthType('full');
        } else {
          setLotWidthType('compact');
        }
      },
      {
        wait: 250,
        leading: true,
        trailing: true,
      },
    );

    const resizeObserver = new ResizeObserver(syncLotWidth);
    if (rootRef.current) {
      resizeObserver.observe(rootRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [rootRef, showViewerNames]);

  return (
    <div className={classes.root} ref={rootRef}>
      {!isMobile && <SlotsHeader />}
      <div className={classes.wrapper}>
        <div className={classes.column} ref={containerRef}>
          <LotsColumnContext.Provider value={{ lotWidthType }}>
            <SlotsList containerRef={containerRef} slots={filteredSlots} optimize={optimize} />
          </LotsColumnContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default SlotsColumn;
