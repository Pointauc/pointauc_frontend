import { Portal } from '@mantine/core';
import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

import BidComponent from '../BidComponent/BidComponent';

import { draggedBid } from './draggedBidStore';

const DragBidContext: FC = () => {
  const { draggedRedemption } = useSelector((root: RootState) => root.purchases);

  const handleRef = useCallback((ref: HTMLDivElement) => {
    draggedBid.ref = ref;
  }, []);

  return (
    <Portal>
      <div style={{ pointerEvents: 'none', position: 'absolute' }} className='drag-context' ref={handleRef}>
        {draggedRedemption && <BidComponent {...draggedRedemption} showBestMatch={false} />}
      </div>
    </Portal>
  );
};

export default DragBidContext;
