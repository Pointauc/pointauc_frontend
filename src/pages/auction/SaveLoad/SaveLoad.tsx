import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import readXlsxFile from 'read-excel-file';

import SaveLoadService from '@services/SaveLoadService';
import { SaveInfo } from '@models/save.model.ts';
import { RootState } from '@reducers';
import { createSlot } from '@reducers/Slots/Slots.ts';
import { Slot } from '@models/slot.model.ts';
import { sortSlots } from '@utils/common.utils.ts';
import array from '@utils/dataType/array.ts';

import SaveRecord from './SaveRecord/SaveRecord';
import classes from './SaveLoad.module.css';

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
  const handleImportSave = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = /\.([^.]*)$/.exec(file.name);

    if (extension?.[1] === 'xlsx') {
      setCurrentSheet(file);
      return;
    }

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        let data: Slot[] = [];

        if (extension?.[1] === 'csv') {
          const frequency = array.frequencyMap(reader.result.split('\n'));

          data = Object.entries(frequency).map<Slot>(([name, amount]) => createSlot({ name, amount }));
        } else {
          data = JSON.parse(reader.result);
        }

        setSaveConfig(SaveLoadService.newSave(data, file.name));
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
    <div className={classes.root}>
      <div className={classes.savesContainer}>
        {saveConfig.map((info) => (
          <SaveRecord key={info.timestamp} {...info} onConfigChange={setSaveConfig} />
        ))}
      </div>
      <Group className={classes.controls} justify='center'>
        <Button onClick={toggleDialog} variant='outline'>
          {t('save.fileImport')}
        </Button>
        <Button onClick={handleNewSave} variant='outline'>
          {t('save.newSave')}
        </Button>
      </Group>

      <Modal opened={isImportOpen} onClose={toggleDialog} title={t('save.fileImport')} size='lg'>
        <Dropzone className={classes.dropZone} onDrop={handleImportSave} multiple={false}>
          <Group justify='center' mih={180} style={{ pointerEvents: 'none' }}>
            <Text size='lg' c='dimmed'>
              {t('common.moveFileOrClick')}
            </Text>
          </Group>
        </Dropzone>
      </Modal>

      <Modal
        opened={currentSheet != null}
        onClose={() => setCurrentSheet(undefined)}
        title={t('save.fileImport')}
        size='sm'
      >
        <Stack className={classes.sheetSettings}>
          <div>
            <Text size='sm' mb='xs'>
              {t('save.nameColumnIndex')}
            </Text>
            <TextInput
              value={nameColumnIndex}
              onChange={(e) => setNameColumnIndex(Number(e.target.value))}
              type='number'
            />
          </div>
          <div>
            <Text size='sm' mb='xs'>
              {t('save.costColumnIndex')}
            </Text>
            <TextInput
              value={costColumnIndex}
              onChange={(e) => setCostColumnIndex(Number(e.target.value))}
              type='number'
            />
          </div>
          <Button onClick={importSheet}>{t('common.apply')}</Button>
        </Stack>
      </Modal>
    </div>
  );
};

export default SaveLoad;
