import { FC, FocusEvent, useCallback } from 'react';
import dayjs from 'dayjs';
import { Button, Group, Text, TextInput } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { SaveInfo } from '@models/save.model.ts';
import { FORMAT } from '@constants/format.constants.ts';
import SaveLoadService from '@services/SaveLoadService';
import { RootState } from '@reducers';
import { setSlots, updateFastIdCounter } from '@reducers/Slots/Slots.ts';
import { loadFile } from '@utils/common.utils.ts';

import classes from './SaveRecord.module.css';

interface SaveRecordProps extends SaveInfo {
  onConfigChange: (config: SaveInfo[]) => void;
}

const SaveRecord: FC<SaveRecordProps> = ({ timestamp, name, length, onConfigChange }) => {
  const { slots } = useSelector((root: RootState) => root.slots);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleDelete = useCallback(() => {
    onConfigChange(SaveLoadService.delete(name));
  }, [name, onConfigChange]);

  const handleSave = useCallback(() => {
    onConfigChange(SaveLoadService.rewrite(slots, name));
  }, [name, onConfigChange, slots]);

  const handleLoad = useCallback(() => {
    const slots = SaveLoadService.getSlots(name);
    dispatch(setSlots(slots));
    updateFastIdCounter(slots);
  }, [dispatch, name]);

  const handleRename = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      onConfigChange(SaveLoadService.rename(name, e.target.value));
    },
    [name, onConfigChange],
  );

  const handleDownloadFile = useCallback(() => {
    loadFile(name, JSON.stringify(SaveLoadService.getSlots(name)));
  }, [name]);

  return (
    <div className={classes.root}>
      <Group className={classes.row} justify='space-between'>
        <Group>
          <TextInput className={classes.nameInput} defaultValue={name} onBlur={handleRename} />
          <Text c='dimmed'>{t('save.lotsAmount', { length })}</Text>
        </Group>
        <Text c='dimmed'>{dayjs(timestamp).format(FORMAT.DATE.dateTime)}</Text>
      </Group>
      <Group className={classes.actions} justify='space-between'>
        <Group className={classes.saveActions}>
          <Button size='sm' onClick={handleLoad}>
            {t('save.load')}
          </Button>
          <Button size='sm' onClick={handleSave}>
            {t('save.save')}
          </Button>
          <Button variant='outline' size='sm' onClick={handleDownloadFile}>
            {t('save.downloadFile')}
          </Button>
        </Group>
        <Button variant='outline' color='red' size='sm' onClick={handleDelete}>
          {t('save.delete')}
        </Button>
      </Group>
    </div>
  );
};

export default SaveRecord;
