import { CSSProperties, FC, memo, RefObject, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import FlipMove from 'react-flip-move';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { FixedSizeList } from 'react-window';

import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';

import DroppableSlot from '../Slot/DroppableSlot';

interface SlotsListProps {
  slots: Slot[];
  optimize: boolean;
  containerRef: RefObject<HTMLDivElement>;
}

interface RowProps {
  data: Slot[];
  index: number;
  style: CSSProperties;
}

const Row: FC<RowProps> = ({ index, style, data }) => (
  <div className='slot-grid-wrapper' style={style}>
    <DroppableSlot index={index + 1} slot={data[index]} />
  </div>
);

interface VirtualListProps {
  slots: Slot[];
  height: number;
  compact: boolean;
}

const VirtualLots: FC<VirtualListProps> = ({ slots, height, compact }) => (
  <FixedSizeList
    width='100%'
    height={height}
    itemData={slots}
    itemCount={slots.length}
    itemSize={compact ? 41 : 64}
    overscanCount={20}
    itemKey={(index: any) => slots[index].id}
  >
    {Row}
  </FixedSizeList>
);

const SlotsList: FC<SlotsListProps> = ({ slots, optimize, containerRef }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const compact = useSelector((root: RootState) => root.aucSettings.view.compact);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    if (optimize && !compact) {
      dispatch(
        addAlert({
          message: t('auc.optimizationEnabled'),
          duration: 10000,
          type: AlertTypeEnum.Info,
        }),
      );
    }
  }, [compact, dispatch, optimize, t]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height);
    });

    if (containerRef.current) {
      setHeight(containerRef.current?.getBoundingClientRect().height);

      observer.observe(containerRef.current);
    }
  }, [containerRef]);

  return (
    <Grid container className={classNames('slots-column-list', { 'compact-view': compact, optimize })}>
      {(compact || optimize) && height != null && <VirtualLots slots={slots} height={height} compact={compact} />}
      {!compact && !optimize && (
        <FlipMove typeName={null} enterAnimation='fade' leaveAnimation='fade' maintainContainerHeight>
          {slots.map((slot, index) => (
            <div className='slot-grid-wrapper' key={slot.id}>
              <DroppableSlot index={index + 1} slot={slot} />
            </div>
          ))}
        </FlipMove>
      )}
    </Grid>
  );
};

export default memo(SlotsList);
