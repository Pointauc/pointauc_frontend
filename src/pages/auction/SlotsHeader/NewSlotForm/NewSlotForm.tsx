import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, OutlinedInput } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@material-ui/icons/Add';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../../../reducers';
import './NewSlotForm.scss';
import { addSlot } from '../../../../reducers/Slots/Slots';
import { Slot } from '../../../../models/slot.model';
import { updatePercents } from '../../../../services/PercentsRefMap';

const NewSlotForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { showChances, background } = useSelector((root: RootState) => root.aucSettings.settings);
  const [enterIconVisible, setEnterIconVisible] = useState(false);

  const nameInput = useRef<HTMLInputElement>();
  const amountInput = useRef<HTMLInputElement>();

  const wrapperClasses = classNames('new-slot-form', { 'custom-background': background });

  const showEnterIcon = () => setEnterIconVisible(true);
  const hideEnterIcon = () => setEnterIconVisible(false);

  const percentsRef = useRef<HTMLSpanElement>(null);

  const getNewSlot = useCallback((): Partial<Slot> => {
    return {
      amount: Number(amountInput.current?.value) || null,
      name: nameInput.current?.value,
    };
  }, []);

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
      }
    },
    [createNewSlot],
  );

  return (
    <div className={wrapperClasses}>
      <OutlinedInput
        className="slot-name slot-input"
        placeholder={t('auc.newLotName')}
        type="text"
        inputRef={nameInput}
        onKeyPress={createSlotOnEnter}
        onFocus={showEnterIcon}
        onBlur={hideEnterIcon}
      />

      {showChances && <span className="slot-chance" ref={percentsRef} />}

      <OutlinedInput type="number" style={{ display: 'none' }} />
      <OutlinedInput
        className="slot-money slot-input"
        placeholder={t('common.currencySign')}
        type="number"
        inputRef={amountInput}
        onKeyPress={createSlotOnEnter}
        onFocus={showEnterIcon}
        onBlur={hideEnterIcon}
        onChange={updateNewSlotChance}
      />

      <Button
        className="add-slot-button"
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={createNewSlot}
      >
        {t('auc.addPosition')}
        {enterIconVisible && <span> &#9166;</span>}
      </Button>
    </div>
  );
};

export default NewSlotForm;
