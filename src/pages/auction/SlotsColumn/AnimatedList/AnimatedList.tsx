import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import clsx from 'clsx';

import { Slot } from '@models/slot.model';
import DroppableSlot from '@pages/auction/Slot/DroppableSlot';

interface AnimatedListClassNames {
  slotWrapper?: string;
}

interface AnimatedListProps {
  slots: Slot[];
  classNames?: AnimatedListClassNames;
  readonly?: boolean;
}

const AnimatedList: FC<AnimatedListProps> = ({ slots, classNames, readonly }) => {
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
          <DroppableSlot index={index + 1} slot={slot} readonly={readonly} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default AnimatedList;
