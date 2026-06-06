import { Text } from '@mantine/core';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers/index';

import { ACTION_LOG_ROW_HEIGHT } from './constants';
import ActionLogRow, { ActionLogRowData } from './ActionLogRow';

interface ActionLogsListProps {
  revertingIds: string[];
  onRevert: (entryId: string) => void;
}

const ActionLogsList: FC<ActionLogsListProps> = ({ revertingIds, onRevert }) => {
  const { t } = useTranslation();
  const logs = useSelector((root: RootState) => root.actionsLog.entries);
  const entries = useMemo(() => [...logs].reverse(), [logs]);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<VariableSizeList<ActionLogRowData>>(null);
  const rowHeightsRef = useRef<Record<string, number>>({});
  const previousEntryIdsRef = useRef<string[]>([]);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const updateHeight = (): void => setHeight(container.getBoundingClientRect().height);
    const observer = new ResizeObserver(updateHeight);

    updateHeight();
    observer.observe(container);

    return (): void => observer.disconnect();
  }, []);

  useEffect(() => {
    const previousEntryIds = previousEntryIdsRef.current;
    const currentEntryIds = entries.map((entry) => entry.id);
    const currentEntryIdSet = new Set(currentEntryIds);
    const firstChangedIndex = currentEntryIds.findIndex((entryId, index) => previousEntryIds[index] !== entryId);

    rowHeightsRef.current = Object.fromEntries(
      Object.entries(rowHeightsRef.current).filter(([entryId]) => currentEntryIdSet.has(entryId)),
    );

    if (firstChangedIndex >= 0 || previousEntryIds.length !== currentEntryIds.length) {
      listRef.current?.resetAfterIndex(Math.max(firstChangedIndex, 0), true);
    }

    previousEntryIdsRef.current = currentEntryIds;
  }, [entries]);

  const getItemSize = useCallback(
    (index: number): number => rowHeightsRef.current[entries[index]?.id] ?? ACTION_LOG_ROW_HEIGHT,
    [entries],
  );

  const setRowHeight = useCallback(
    (entryId: string, rowHeight: number): void => {
      if (rowHeightsRef.current[entryId] === rowHeight) {
        return;
      }

      const entryIndex = entries.findIndex((entry) => entry.id === entryId);

      rowHeightsRef.current = {
        ...rowHeightsRef.current,
        [entryId]: rowHeight,
      };

      if (entryIndex >= 0) {
        listRef.current?.resetAfterIndex(entryIndex);
      }
    },
    [entries],
  );

  const itemData = useMemo<ActionLogRowData>(
    () => ({ entries, revertingIds, onRevert, setRowHeight }),
    [entries, revertingIds, onRevert, setRowHeight],
  );

  return (
    <div ref={containerRef} className='min-h-0 w-[310px] flex-1'>
      {entries.length === 0 ? (
        <Text size='sm' c='dimmed' ta='center' mt='md'>
          {t('actionsLog.empty')}
        </Text>
      ) : (
        height > 0 && (
          <VariableSizeList
            ref={listRef}
            width='100%'
            height={height}
            itemCount={entries.length}
            itemData={itemData}
            itemSize={getItemSize}
            estimatedItemSize={ACTION_LOG_ROW_HEIGHT}
            overscanCount={8}
            itemKey={(index, data) => data.entries[index].id}
          >
            {ActionLogRow}
          </VariableSizeList>
        )
      )}
    </div>
  );
};

export default ActionLogsList;
