import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, OutlinedInput, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { DropzoneArea } from 'react-mui-dropzone';
import { useTranslation } from 'react-i18next';
import readXlsxFile from 'read-excel-file';

import SaveLoadService from '@services/SaveLoadService';
import { SaveInfo } from '@models/save.model.ts';
import { RootState } from '@reducers';
import { createSlot } from '@reducers/Slots/Slots.ts';
import { Slot } from '@models/slot.model.ts';
import { sortSlots } from '@utils/common.utils.ts';

import SaveRecord from './SaveRecord/SaveRecord';
import './SaveLoad.scss';

const SaveLoad: FC = () => {
  const { slots } = useSelector((root: RootState) => root.slots);
  const { t } = useTranslation();
  const [currentSheet, setCurrentSheet] = useState<File>();
  const [nameColumnIndex, setNameColumnIndex] = useState<number>(Number(localStorage.getItem('nameColumnIndex')) || 1);
  const [costColumnIndex, setCostColumnIndex] = useState<number>(Number(localStorage.getItem('costColumnIndex')) || 2);
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

  useEffect(() => {
    localStorage.setItem('nameColumnIndex', String(nameColumnIndex));
    localStorage.setItem('costColumnIndex', String(costColumnIndex));
  }, [nameColumnIndex, costColumnIndex]);

  const toggleDialog = (): void => {
    setIsImportOpen((prevOpened) => !prevOpened);
  };
  const handleImportSave = useCallback(async ([file]: File[]) => {
    const reader = new FileReader();
    const extension = /\.([^.]*)$/.exec(file.name);

    if (extension?.[1] === 'xlsx') {
      setCurrentSheet(file);
      return;
    }

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        setSaveConfig(SaveLoadService.newSave(JSON.parse(reader.result), file.name));
      }

      toggleDialog();
    };

    reader.readAsText(file);
  }, []);

  const importSheet = async () => {
    if (!currentSheet) {
      return;
    }

    const rows = await readXlsxFile(currentSheet);
    const uniqueRows = new Map<string, number>();
    rows.forEach((row) => {
      const key = String(row[nameColumnIndex - 1]);
      const cost = Number(row[costColumnIndex - 1]);
      const existedCost = uniqueRows.get(key);

      if (existedCost) {
        uniqueRows.set(key, existedCost + cost);
        return;
      }

      uniqueRows.set(key, cost);
    });

    const slots: Slot[] = [];
    for (const [key, value] of uniqueRows) {
      slots.push(createSlot({ name: key, amount: value }));
    }
    const sorted = sortSlots(slots);

    setSaveConfig(SaveLoadService.newSave(sorted, currentSheet.name));
    setCurrentSheet(undefined);
    toggleDialog();
  };

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
      <Dialog open={currentSheet != null} onClose={() => setCurrentSheet(undefined)}>
        <DialogContent>
          <div>
            <Typography>{t('save.nameColumnIndex')}</Typography>
            <OutlinedInput
              value={nameColumnIndex}
              onChange={(e) => setNameColumnIndex(Number(e.target.value))}
              type='number'
            />
          </div>
          <div>
            <Typography>{t('save.costColumnIndex')}</Typography>
            <OutlinedInput
              value={costColumnIndex}
              onChange={(e) => setCostColumnIndex(Number(e.target.value))}
              type='number'
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={importSheet}>{t('common.apply')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SaveLoad;
