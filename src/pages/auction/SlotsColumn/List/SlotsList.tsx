import { Box } from '@mantine/core';
import clsx from 'clsx';
import { FC, memo, RefObject, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useStore } from '@tanstack/react-store';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import useAutoScroll from '@hooks/useAutoScroll';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { Slot } from '@models/slot.model.ts';
import DroppableSlot from '@pages/auction/Slot/DroppableSlot';
import AnimatedList from '@pages/auction/SlotsColumn/AnimatedList/AnimatedList';
import { RootState } from '@reducers';
import { addAlert } from '@reducers/notifications/notifications.ts';
import userSettingsStore from '@domains/user-settings/store/store';

import classes from './SlotsList.module.css';

interface SlotsListProps {
  slots: Slot[];
  optimize: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  readonly?: boolean;
  isTransparentUi?: boolean;
}

const Row = ({ index, style, data }: ListChildComponentProps<Slot[]>) => (
  <div style={style as any}>
    <DroppableSlot index={index + 1} slot={data[index]} />
  </div>
);

interface VirtualListProps {
  slots: Slot[];
  height: number;
  compact: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

const VirtualLots: FC<VirtualListProps> = ({ slots, height, compact, containerRef }) => (
  <FixedSizeList
    outerRef={containerRef}
    width='100%'
    height={height}
    itemData={slots}
    itemCount={slots.length}
    itemSize={compact ? 41 : 54}
    overscanCount={20}
    itemKey={(index: any) => slots[index].id}
  >
    {Row as any}
  </FixedSizeList>
);

const SlotsList: FC<SlotsListProps> = ({ slots, optimize, containerRef, readonly, isTransparentUi }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const compact = useStore(userSettingsStore, (state) => state.compact);
  const autoScroll = useStore(userSettingsStore, (state) => state.autoScroll);
  const background = useSelector((root: RootState) => root.aucSettings.settings.background);
  const [height, setHeight] = useState<number>();
  const containerVirtualRef = useRef<HTMLDivElement>(null);

  useAutoScroll(compact || optimize ? containerVirtualRef : containerRef, slots.length, autoScroll, {
    scrollSpeed: 50,
    pauseOnEdgesDuration: 2,
    mouseResumeDelay: 5,
  });

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
    <Box
      className={clsx(classes.root, {
        'compact-view': compact,
        'custom-background': background || isTransparentUi,
      })}
    >
      {(compact || optimize) && height != null && (
        <VirtualLots slots={slots} height={height} compact={compact} containerRef={containerVirtualRef} />
      )}
      {!compact && !optimize && <AnimatedList slots={slots} />}
    </Box>
  );
};

export default memo(SlotsList);
