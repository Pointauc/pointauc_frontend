import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { FilledInputProps, IconButton, OutlinedInput, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './Slot.scss';
import './SlotCompact.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@mantine/core';

import { Slot } from '@models/slot.model.ts';
import { addExtra, addSlot, setSlotAmount, setSlotExtra, setSlotName } from '@reducers/Slots/Slots.ts';
import { animateValue } from '@utils/common.utils.ts';
import { percentsRefMap, updatePercents } from '@services/PercentsRefMap.ts';
import { RootState } from '@reducers';
import { numberUtils } from '@utils/common/number';
import { useIsMobile } from '@shared/lib/ui';

import styles from './SlotComponent.module.css';

interface SlotComponentProps {
  slot: Slot;
  readonly?: boolean;
}

const SlotComponent: FC<SlotComponentProps> = ({ slot, readonly }) => {
  const marblesAuc = useSelector((root: RootState) => root.aucSettings.settings.marblesAuc);
  const showChances = useSelector((root: RootState) => root.aucSettings.settings.showChances);
  const hideAmounts = useSelector((root: RootState) => root.aucSettings.settings.hideAmounts);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { id, extra, amount, name } = slot;
  const [currentName, setCurrentName] = useState(name);
  const [currentExtra, setCurrentExtra] = useState(extra);
  const amountInput = useRef<HTMLInputElement>(null);
  const percentsRef = useRef<HTMLSpanElement>(null);
  const isAmountInitialized = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (percentsRef.current) {
      percentsRefMap.set(id, percentsRef.current);
      updatePercents([slot], percentsRefMap, true);
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

  const addExtraAmountOnEnter = (e: React.KeyboardEvent<HTMLDivElement>): void => {
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
        const finalValue = numberUtils.roundFixed(amount, 2);
        if (finalValue.toString() !== amountInput.current.value) {
          animateValue(
            amountInput.current,
            Number(amountInput.current.value),
            finalValue,
            marblesAuc || !isAmountInitialized.current ? 0 : undefined,
          );
        }
      }

      isAmountInitialized.current = true;
    }
  }, [amount, marblesAuc]);
  useEffect(() => {
    if (name !== currentName) setCurrentName(name);
    if (extra !== currentExtra) setCurrentExtra(extra);
  }, [name, extra]);

  const extraLength = Number(currentExtra?.toString().length);
  const extraFieldWidth = `${extraLength > 4 ? 2 + extraLength * 1.1 : 7}ch`;
  const showError =  amount === null ? false : amount  < 1 ? true : false
  return (
    <>
      <TextInput
        variant='unstyled'
        size='lg'
        classNames={{ input: styles.input, root: styles.name }}
        radius={0}
        placeholder={t('auc.lotName')}
        onBlur={handleNameBlur}
        onChange={handleNameChange}
        onKeyPress={createNewSlotOnEnter}
        value={currentName ?? ''}
      />
      {showChances && <span className='slot-chance' title={t('auc.chanceTooltip')} ref={percentsRef} />}
      <TextInput
        variant='unstyled'
        size='lg'
        classNames={{ input: styles.input, root: styles.money }}
        radius={0}
        hidden={hideAmounts}
        placeholder={t('common.currencySign')}
        ref={amountInput}
        onKeyPress={createNewSlotOnEnter}
        error={showError}
        type='number'
      />
      {!readonly && !isMobile && (
        <>
          <button className='slot-icon-button slot-add-extra' onClick={handleAddExtra} title={t('lot.addAmount')}>
            <AddIcon />
          </button>
          <TextInput
            fz='xl'
            variant='unstyled'
            size='lg'
            classNames={{ input: styles.input, root: styles.extra }}
            radius={0}
            style={{ width: extraFieldWidth }}
            placeholder={t('common.currencySign')}
            onBlur={handleExtraBlur}
            onChange={handleExtraChange}
            value={currentExtra || ''}
            type='number'
            onKeyPress={addExtraAmountOnEnter}
          />
        </>
      )}
    </>
  );
};

const MemorizedSlotComponent = memo(SlotComponent);

export default MemorizedSlotComponent;
