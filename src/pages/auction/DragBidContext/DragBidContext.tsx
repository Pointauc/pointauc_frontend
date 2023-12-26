import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';

interface DraggedBid {
  ref: HTMLDivElement | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const draggedBid: DraggedBid = {
  ref: null,
};

const DragBidContext: FC = () => {
  const { draggedRedemption } = useSelector((root: RootState) => root.purchases);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dragRef.current) {
      draggedBid.ref = dragRef.current;
    }
  }, []);

  return (
    <div style={{ pointerEvents: 'none', position: 'absolute' }} className='drag-context' ref={dragRef}>
      {draggedRedemption && <PurchaseComponent {...draggedRedemption} showBestMatch={false} />}
    </div>
  );
};

export default DragBidContext;
