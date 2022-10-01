import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button, Dialog, DialogContent } from '@material-ui/core';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { DropzoneArea } from 'material-ui-dropzone';
import SaveLoadService from '../../../services/SaveLoadService';
import { SaveInfo } from '../../../models/save.model';
import SaveRecord from './SaveRecord/SaveRecord';
import { RootState } from '../../../reducers';
import './SaveLoad.scss';

const SaveLoad: FC = () => {
  const { slots } = useSelector((root: RootState) => root.slots);
  const initialSaves = useMemo(
    () =>
      SaveLoadService.getSavesConfig().sort(
        ({ timestamp: a }, { timestamp: b }) => dayjs(b).valueOf() - dayjs(a).valueOf(),
      ),
    [],
  );
  const [saveConfig, setSaveConfig] = useState<SaveInfo[]>(initialSaves);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const handleNewSave = useCallback(() => setSaveConfig(SaveLoadService.newSave(slots)), [slots]);
  const toggleDialog = (): void => {
    setIsImportOpen((prevOpened) => !prevOpened);
  };
  const handleImportSave = useCallback(([file]: File[]) => {
    const reader = new FileReader();

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        setSaveConfig(SaveLoadService.newSave(JSON.parse(reader.result), file.name));
      }

      toggleDialog();
    };

    reader.readAsText(file);
  }, []);

  return (
    <div className="save-load-wrapper">
      <div className="saves-container">
        {saveConfig.map((info) => (
          <SaveRecord key={info.timestamp} {...info} onConfigChange={setSaveConfig} />
        ))}
      </div>
      <div className="controls">
        <Button style={{ marginRight: 10 }} onClick={toggleDialog} variant="outlined">
          Импорт из файла
        </Button>
        <Button onClick={handleNewSave} variant="outlined">
          Новое сохранение
        </Button>
      </div>
      <Dialog open={isImportOpen} onClose={toggleDialog} maxWidth={false}>
        <DialogContent className="image-input-wrapper">
          <DropzoneArea
            dropzoneClass="drop-zone"
            dropzoneText="Перетащите сюда файл или нажмите"
            onDrop={handleImportSave}
            filesLimit={1}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaveLoad;
