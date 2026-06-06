import { ActionLogEntry } from './cards/entryTypes';

export interface ActionLogCardProps<Entry extends ActionLogEntry = ActionLogEntry> {
  entry: Entry;
  isReverting: boolean;
  onRevert: (entryId: string) => void;
}
