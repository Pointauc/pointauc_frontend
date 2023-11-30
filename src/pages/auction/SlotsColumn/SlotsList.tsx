import { CSSProperties, FC, memo, useEffect, useMemo } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import FlipMove from 'react-flip-move';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';

import DroppableSlot from '../Slot/DroppableSlot';

interface SlotsListProps {
  slots: Slot[];
  optimize: boolean;
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
}

const VirtualLots: FC<VirtualListProps> = ({ slots }) => (
  <FixedSizeList
    width='100%'
    height={780}
    itemData={slots}
    itemCount={slots.length}
    itemSize={66}
    overscanCount={25}
    itemKey={(index) => slots[index].id}
  >
    {Row}
  </FixedSizeList>
);

const SlotsList: FC<SlotsListProps> = ({ slots, optimize }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const compact = useSelector((root: RootState) => root.aucSettings.view.compact);

  useEffect(() => {
    if (optimize && !compact) {
      dispatch(
        addAlert({
          message: t('auc.optimization.enabled'),
          duration: 5000,
          type: AlertTypeEnum.Info,
        }),
      );
    }
  }, [compact, dispatch, optimize, t]);

  return (
    <Grid container className={classNames('slots-column-list', { 'compact-view': compact })}>
      {compact || optimize ? (
        <VirtualLots slots={slots} />
      ) : (
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
