import { useDragLayer, XYCoord } from 'react-dnd';

import React, { CSSProperties, ReactNode } from 'react';
import { DragTypeEnum } from '../../enums/dragType.enum';
import { Purchase } from '../../reducers/Purchases/Purchases';
import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  opacity: 0.7,
};

const getItemStyles = (
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
): CSSProperties => {
  if (!initialOffset || !currentOffset) {
    return { display: 'none' };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return { transform };
};

interface DragLayerProps {
  item: Purchase;
  itemType: DragTypeEnum;
  initialOffset: XYCoord | null;
  currentOffset: XYCoord | null;
  isDragging: boolean;
}

const CustomDragLayer: React.FC = () => {
  const { itemType, item, currentOffset, initialOffset, isDragging } = useDragLayer<DragLayerProps>(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType() as DragTypeEnum,
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }),
  );

  const renderItem = (): ReactNode => {
    switch (itemType) {
      case DragTypeEnum.Purchase:
        return <PurchaseComponent {...item} />;
      default:
        return null;
    }
  };

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>{renderItem()}</div>
    </div>
  );
};

export default CustomDragLayer;
