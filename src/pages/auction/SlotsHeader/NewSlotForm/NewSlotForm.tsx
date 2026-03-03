import { ClipboardEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@mantine/core';
import clsx from 'clsx';

import { RootState } from '@reducers';
import { addSlot, setSlots } from '@reducers/Slots/Slots.ts';
import { Slot } from '@models/slot.model.ts';
import { updatePercents } from '@services/PercentsRefMap.ts';
import { OutlineInput } from '@shared/mantine/ui/Input';
import { parseRawInput } from '@domains/auction/archive/lib/parsers';
import { archivedLotsToSlots } from '@domains/auction/archive/lib/converters';

import classes from './NewSlotForm.module.css';

const NewSlotForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const [enterIconVisible, setEnterIconVisible] = useState(false);

  const nameInput = useRef<HTMLInputElement>(null);
  const amountInput = useRef<HTMLInputElement>(null);

  const showEnterIcon = () => setEnterIconVisible(true);
  const hideEnterIcon = () => setEnterIconVisible(false);

  const percentsRef = useRef<HTMLParagraphElement>(null);

  const getNewSlot = useCallback(
    (): Partial<Slot> => ({
      amount: Number(amountInput.current?.value) || null,
      name: nameInput.current?.value,
    }),
    [],
  );

  const updateNewSlotChance = useCallback(() => {
    if (showChances && percentsRef.current) {
      const slot: Slot = { ...getNewSlot(), id: Math.random().toString() } as Slot;
      const refMap = new Map<string, HTMLSpanElement>([[slot.id, percentsRef.current]]);

      updatePercents([...slots, slot], refMap);
    }
  }, [getNewSlot, showChances, slots]);

  useEffect(() => {
    updateNewSlotChance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChances]);

  const resetForm = useCallback(() => {
    if (nameInput.current && amountInput.current) {
      nameInput.current.value = '';
      amountInput.current.value = '';
    }
    updateNewSlotChance();
  }, [updateNewSlotChance]);

  const createNewSlot = useCallback(() => {
    if (nameInput.current && amountInput.current) {
      const slot = getNewSlot();
      dispatch(addSlot(slot));
      resetForm();
    }
  }, [dispatch, getNewSlot, resetForm]);

  const createSlotOnEnter = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        createNewSlot();
        nameInput.current?.focus();
      }
    },
    [createNewSlot],
  );

  const handleNamePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData('text');
      if (!text.includes('\n')) return;

      const lots = parseRawInput(text);
      if (lots.length < 2) return;

      const totalCost = lots.reduce((sum, lot) => sum + (lot.amount ?? 0), 0);
      const confirmed = window.confirm(t('auc.pasteImportConfirm', { count: lots.length, totalCost }));

      if (confirmed) {
        e.preventDefault();
        dispatch(setSlots(archivedLotsToSlots(lots)));
        resetForm();
      }
    },
    [dispatch, resetForm, t],
  );

  return (
    <div className={classes.root}>
      <OutlineInput
        className={classes.slotName}
        placeholder={t('auc.newLotName')}
        ref={nameInput}
        onKeyDown={createSlotOnEnter}
        onPaste={handleNamePaste}
        onFocus={showEnterIcon}
        onBlur={hideEnterIcon}
        classNames={{ input: classes.slotInput }}
      />

      {showChances && <Text fz='lg' ref={percentsRef} />}

      <OutlineInput
        className={classes.slotMoney}
        classNames={{ input: classes.slotInput }}
        placeholder={t('common.currencySign')}
        type='number'
        ref={amountInput}
        onKeyDown={createSlotOnEnter}
        onFocus={showEnterIcon}
        onBlur={hideEnterIcon}
        onChange={updateNewSlotChance}
      />

      <Button
        variant='filled'
        color='primary.3'
        leftSection={<AddIcon />}
        autoContrast
        rightSection={enterIconVisible && <span> &#9166;</span>}
        onClick={createNewSlot}
      >
        {t('auc.addPosition')}
      </Button>
    </div>
  );
};

export default NewSlotForm;
