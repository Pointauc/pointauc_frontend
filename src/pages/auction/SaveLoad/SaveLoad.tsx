import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Dialog, DialogContent } from '@mui/material';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { DropzoneArea } from 'react-mui-dropzone';
import { useTranslation } from 'react-i18next';

import SaveLoadService from '@services/SaveLoadService';
import { SaveInfo } from '@models/save.model.ts';
import { RootState } from '@reducers';

import SaveRecord from './SaveRecord/SaveRecord';
import './SaveLoad.scss';

const SaveLoad: FC = () => {
  const { slots } = useSelector((root: RootState) => root.slots);
  const { t } = useTranslation();
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
    <div className='save-load-wrapper'>
      <div className='saves-container'>
        {saveConfig.map((info) => (
          <SaveRecord key={info.timestamp} {...info} onConfigChange={setSaveConfig} />
        ))}
      </div>
      <div className='controls'>
        <Button style={{ marginRight: 10 }} onClick={toggleDialog} variant='outlined'>
          {t('save.fileImport')}
        </Button>
        <Button onClick={handleNewSave} variant='outlined'>
          {t('save.newSave')}
        </Button>
      </div>
      <Dialog open={isImportOpen} onClose={toggleDialog} maxWidth={false}>
        <DialogContent className='image-input-wrapper'>
          <DropzoneArea
            dropzoneClass='drop-zone'
            dropzoneText={t('common.moveFileOrClick')}
            onDrop={handleImportSave}
            filesLimit={1}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaveLoad;
