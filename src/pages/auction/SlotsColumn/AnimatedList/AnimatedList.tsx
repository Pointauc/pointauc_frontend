import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import clsx from 'clsx';

import { Lot } from '@models/slot.model';
import DroppableSlot from '@pages/auction/Slot/DroppableSlot';

interface AnimatedListClassNames {
  slotWrapper?: string;
}

interface AnimatedListProps {
  slots: Lot[];
  classNames?: AnimatedListClassNames;
  readonly?: boolean;
  highlightedLotId?: string | null;
}

const AnimatedList: FC<AnimatedListProps> = ({ slots, classNames, readonly, highlightedLotId }) => {
  const [isAnimationsActive, setIsAnimationsActive] = useState(false);

  useEffect(() => {
    setIsAnimationsActive(true);
  }, []);

  return (
    <AnimatePresence initial={false}>
      {slots.map((slot, index) => (
        <motion.div
          className={classNames?.slotWrapper}
          key={slot.id}
          layout
          style={{
            flexShrink: 0,
            flexGrow: 0,
            backgroundColor: 'transparent',
            overflow: 'hidden',
          }}
          initial={isAnimationsActive ? { height: 0, opacity: 0 } : false}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DroppableSlot
            index={index + 1}
            slot={slot}
            readonly={readonly}
            isHighlighted={slot.id === highlightedLotId}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default AnimatedList;
