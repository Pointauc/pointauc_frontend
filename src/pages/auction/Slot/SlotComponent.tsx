import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, OutlinedInput } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './Slot.scss';
import './SlotCompact.scss';
import { useDispatch, useSelector } from 'react-redux';
import { FilledInputProps } from '@material-ui/core/FilledInput';
import { useTranslation } from 'react-i18next';
import { Slot } from '../../../models/slot.model';
import { addExtra, addSlot, setSlotAmount, setSlotExtra, setSlotName } from '../../../reducers/Slots/Slots';
import { animateValue } from '../../../utils/common.utils';
import { RootState } from '../../../reducers';
import { percentsRefMap } from '../../../services/PercentsRefMap';

const SlotComponent: React.FC<Slot> = ({ id, extra, amount, name }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { marblesAuc, showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const [currentName, setCurrentName] = useState(name);
  const [currentExtra, setCurrentExtra] = useState(extra);
  const amountInput = useRef<HTMLInputElement>(null);
  const percentsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (percentsRef.current) {
      percentsRefMap.set(id, percentsRef.current);
    }

    return (): void => {
      percentsRefMap.delete(id);
    };
  }, [id, showChances]);

  const handleNameBlur: FilledInputProps['onBlur'] = (e): void => {
    dispatch(setSlotName({ id, name: e.target.value }));
  };
  const handleNameChange: FilledInputProps['onChange'] = (e): void => {
    setCurrentName(e.target.value);
  };

  const handleExtraBlur: FilledInputProps['onBlur'] = (e): void => {
    dispatch(setSlotExtra({ id, extra: Number(e.target.value) }));
  };
  const handleExtraChange: FilledInputProps['onChange'] = (e): void => {
    setCurrentExtra(Number(e.target.value));
  };

  const handleAddExtra = (): void => {
    dispatch(addExtra(id));
  };

  const confirmAmount = useCallback(() => {
    dispatch(setSlotAmount({ id, amount: Number(amountInput.current?.value) }));
  }, [dispatch, id]);

  const addExtraAmountOnEnter = (e: any): void => {
    if (e.key === 'Enter') {
      dispatch(setSlotExtra({ id, extra: Number(currentExtra) }));
      setCurrentExtra(null);
      handleAddExtra();
      e.preventDefault();
    }
  };

  const createNewSlotOnEnter = (e: any): void => {
    const inputAmount = Number(amountInput.current?.value) || null;
    const isAmountChanged = amount !== inputAmount;

    if (e.key === 'Enter' && !isAmountChanged) {
      dispatch(addSlot({}));
    }
  };

  useEffect(() => {
    if (amountInput.current) {
      amountInput.current.onchange = confirmAmount;
    }
  }, [confirmAmount]);

  useEffect(() => {
    if (amountInput.current) {
      if (amount === null) {
        amountInput.current.value = '';
      } else {
        animateValue(
          amountInput.current,
          Number(amountInput.current.value),
          Number(amount),
          marblesAuc ? 0 : undefined,
        );
      }
    }
  }, [amount, marblesAuc]);
  useEffect(() => setCurrentName(name), [name]);
  useEffect(() => setCurrentExtra(extra), [extra]);

  const extraLength = Number(currentExtra?.toString().length);
  const extraFieldWidth = `${extraLength > 3 ? 5 + extraLength : 8}ch`;

  return (
    <>
      <OutlinedInput
        className="slot-name slot-input"
        placeholder={t('auc.lotName')}
        onBlur={handleNameBlur}
        onChange={handleNameChange}
        onKeyPress={createNewSlotOnEnter}
        value={currentName}
      />
      {showChances && <span className="slot-chance" ref={percentsRef} />}
      <OutlinedInput
        className="slot-money slot-input"
        placeholder={t('common.currencySign')}
        inputRef={amountInput}
        onKeyPress={createNewSlotOnEnter}
        type="number"
      />
      <IconButton className="slot-add-extra" onClick={handleAddExtra} title="Прибавить стоимость">
        <AddIcon />
      </IconButton>
      <OutlinedInput
        className="slot-money slot-input"
        style={{ width: extraFieldWidth }}
        placeholder={t('common.currencySign')}
        onBlur={handleExtraBlur}
        onChange={handleExtraChange}
        value={currentExtra || ''}
        type="number"
        onKeyPress={addExtraAmountOnEnter}
      />
    </>
  );
};

export default memo(SlotComponent);
