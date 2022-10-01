import React, { FC, FocusEvent, useCallback } from 'react';
import dayjs from 'dayjs';
import { Button, TextField, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { SaveInfo } from '../../../../models/save.model';
import { FORMAT } from '../../../../constants/format.constants';
import './SaveRecord.scss';
import SaveLoadService from '../../../../services/SaveLoadService';
import { RootState } from '../../../../reducers';
import { setSlots } from '../../../../reducers/Slots/Slots';
import { loadFile } from '../../../../utils/common.utils';

interface SaveRecordProps extends SaveInfo {
  onConfigChange: (config: SaveInfo[]) => void;
}

const SaveRecord: FC<SaveRecordProps> = ({ timestamp, name, length, onConfigChange }) => {
  const { slots } = useSelector((root: RootState) => root.slots);
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    onConfigChange(SaveLoadService.delete(name));
  }, [name, onConfigChange]);

  const handleSave = useCallback(() => {
    onConfigChange(SaveLoadService.rewrite(slots, name));
  }, [name, onConfigChange, slots]);

  const handleLoad = useCallback(() => {
    dispatch(setSlots(SaveLoadService.getSlots(name)));
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
    <div className="save-record">
      <div className="row">
        <div className="row">
          <TextField variant="outlined" className="name-input" defaultValue={name} onBlur={handleRename} />
          <Typography className="timestamp">{`${length} лотов`}</Typography>
        </div>
        <Typography className="timestamp">{dayjs(timestamp).format(FORMAT.DATE.dateTime)}</Typography>
      </div>
      <div className="row actions">
        <div className="save-actions">
          <Button variant="contained" color="primary" size="small" onClick={handleLoad}>
            Загрузить
          </Button>
          <Button variant="contained" color="primary" size="small" onClick={handleSave}>
            Сохранить
          </Button>
          <Button variant="outlined" color="primary" size="small" onClick={handleDownloadFile}>
            Скачать в файл
          </Button>
        </div>
        <Button variant="outlined" color="secondary" size="small" onClick={handleDelete}>
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default SaveRecord;
