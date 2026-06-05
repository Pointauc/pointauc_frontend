import { CSSProperties } from 'react';
import { ListChildComponentProps } from 'react-window';

import ActionLogEntryCard from './ActionLogEntryCard';
import { ActionLogEntry } from './cards/entryTypes';

export interface ActionLogRowData {
  entries: ActionLogEntry[];
  revertingIds: string[];
  onRevert: (entryId: string) => void;
}

const ActionLogRow = ({ index, style, data }: ListChildComponentProps<ActionLogRowData>) => (
  <div style={style as CSSProperties} className='px-0 pb-2'>
    <ActionLogEntryCard
      entry={data.entries[index]}
      isReverting={data.revertingIds.includes(data.entries[index].id)}
      onRevert={data.onRevert}
    />
  </div>
);

export default ActionLogRow;
