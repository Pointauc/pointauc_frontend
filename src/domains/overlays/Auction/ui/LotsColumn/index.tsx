import { FC, useEffect, useRef } from 'react';

import SlotsList from '@pages/auction/SlotsColumn/List/SlotsList';
import { Slot } from '@models/slot.model';
import useAutoScroll from '@hooks/useAutoScroll';
import { updatePercents } from '@services/PercentsRefMap.ts';

import classes from './index.module.css';

interface LotsColumnProps {
  items: Slot[];
  autoScroll: boolean;
  scrollSpeed: number;
}

const LotsColumn: FC<LotsColumnProps> = ({ items, autoScroll, scrollSpeed }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoScroll(containerRef, items.length, autoScroll, {
    scrollSpeed,
    pauseOnEdgesDuration: 2,
    mouseResumeDelay: 5,
  });

  useEffect(() => {
    updatePercents(items);
  }, [items]);

  return (
    <div className={classes.scrollCol} ref={containerRef}>
      <SlotsList slots={items} optimize={false} containerRef={containerRef} readonly isTransparentUi />
    </div>
  );
};

export default LotsColumn;
