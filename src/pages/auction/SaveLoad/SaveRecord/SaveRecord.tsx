import { FC, FocusEvent, useCallback } from 'react';
import dayjs from 'dayjs';
import { Button, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { SaveInfo } from '@models/save.model.ts';
import { FORMAT } from '@constants/format.constants.ts';
import SaveLoadService from '@services/SaveLoadService';
import { RootState } from '@reducers';
import { setSlots, updateFastIdCounter } from '@reducers/Slots/Slots.ts';
import { loadFile } from '@utils/common.utils.ts';
import './SaveRecord.scss';

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
    <div className='save-record'>
      <div className='row'>
        <div className='row'>
          <TextField variant='outlined' className='name-input' defaultValue={name} onBlur={handleRename} />
          <Typography className='timestamp'>{t('save.lotsAmount', { length })}</Typography>
        </div>
        <Typography className='timestamp'>{dayjs(timestamp).format(FORMAT.DATE.dateTime)}</Typography>
      </div>
      <div className='row actions'>
        <div className='save-actions'>
          <Button variant='contained' color='primary' size='small' onClick={handleLoad}>
            {t('save.load')}
          </Button>
          <Button variant='contained' color='primary' size='small' onClick={handleSave}>
            {t('save.save')}
          </Button>
          <Button variant='outlined' color='primary' size='small' onClick={handleDownloadFile}>
            {t('save.downloadFile')}
          </Button>
        </div>
        <Button variant='outlined' color='secondary' size='small' onClick={handleDelete}>
          {t('save.delete')}
        </Button>
      </div>
    </div>
  );
};

export default SaveRecord;
