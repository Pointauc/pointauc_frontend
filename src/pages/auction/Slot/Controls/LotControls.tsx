import { TextInputProps } from '@mantine/core';
import { IconHash, IconPlus, IconStarFilled, IconTrash } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, memo, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Lot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { openTrailer } from '@reducers/ExtraWindows/ExtraWindows';
import { addSlot, addSlotAmount, deleteSlot, setSlotAmount, setSlotIsFavorite } from '@reducers/Slots/Slots.ts';
import { percentsRefMap, updatePercents } from '@services/PercentsRefMap.ts';
import { useIsMobile } from '@shared/lib/ui';
import LotContributorSummary from '@shared/ui/LotContributorSummary';
import { animateValue } from '@utils/common.utils.ts';
import { numberUtils } from '@utils/common/number';
import { LotsColumnContext } from '@pages/auction/SlotsColumn/contexts';

import LotActionsPopover from './LotActionsPopover';
import LotNameField from './LotNameField';
import styles from './LotControls.module.css';
import WinningChance from './WinningChance';

interface LotControlsProps {
  lot: Lot;
  readonly?: boolean;
}

const LotControls: FC<LotControlsProps> = ({ lot, readonly }) => {
  const marblesAuc = useSelector((root: RootState) => root.aucSettings.settings.marblesAuc);
  const showChances = useSelector((root: RootState) => root.aucSettings.settings.showChances);
  const showViewerNames = useSelector((root: RootState) => root.aucSettings.settings.showViewerNames);
  const hideAmounts = useSelector((root: RootState) => root.aucSettings.settings.hideAmounts);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { id, amount, name, isFavorite = false } = lot;
  const [currentExtra, setCurrentExtra] = useState<string>('');
  const amountInput = useRef<HTMLInputElement>(null);
  const percentsRef = useRef<HTMLSpanElement>(null);
  const isAmountInitialized = useRef(false);
  const isMobile = useIsMobile();
  const extraInputRef = useRef<HTMLInputElement>(null);
  const lotsColumnContext = useContext(LotsColumnContext);

  useLayoutEffect(() => {
    if (percentsRef.current && showChances) {
      percentsRefMap.set(id, percentsRef.current);
      updatePercents([lot], percentsRefMap, true);
    }

    return (): void => {
      percentsRefMap.delete(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, showChances]);

  const handleExtraChange: TextInputProps['onChange'] = (e): void => {
    setCurrentExtra(e.target.value);
  };

  const handleAddExtra = (): boolean => {
    const amountToAdd = Number(currentExtra);
    if (!amountToAdd) return false;

    dispatch(addSlotAmount({ id, amount: amountToAdd }));
    setCurrentExtra('');
    return true;
  };

  const addExtraAmountOnEnter = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddExtra();
      e.preventDefault();
    }
  };

  const confirmAmount = useCallback(() => {
    if (Number(amountInput.current?.value) === Number(amount)) return;
    dispatch(setSlotAmount({ id, amount: Number(amountInput.current?.value) }));
  }, [dispatch, id, amount]);

  const createNewSlotOnEnter: TextInputProps['onKeyPress'] = (e): void => {
    const inputAmount = Number(amountInput.current?.value) || null;
    const isAmountChanged = amount !== inputAmount;

    if (e.key === 'Enter') {
      if (!isAmountChanged) {
        dispatch(addSlot({}));
      } else {
        dispatch(setSlotAmount({ id, amount: inputAmount || 0 }));
      }
    }
  };

  useLayoutEffect(() => {
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

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  const handleOpenTrailer = useCallback(() => {
    dispatch(openTrailer(name || ''));
  }, [dispatch, name]);

  const isLocked = !!lot.lockedPercentage;

  const toggleFavorite = (): void => {
    dispatch(setSlotIsFavorite({ id, state: !isFavorite }));
  };

  return (
    <>
      <div className={styles.hashContainer}>
        {isFavorite && <IconStarFilled color={'orange'} size={20} />}
        <div className={styles.hash}>
          <IconHash className={styles.hashIcon} size={18} />
          <div>{`${lot.fastId}`}</div>
        </div>
      </div>
      <LotNameField id={id} name={name} isLocked={isLocked} onKeyPress={createNewSlotOnEnter} />
      {showViewerNames && <LotContributorSummary contributors={lot.contributors} hideAmounts={hideAmounts} />}
      {showChances && (
        <WinningChance slotId={id} ref={percentsRef} isLocked={isLocked} lockedPercentage={lot.lockedPercentage} />
      )}
      <LotActionsPopover
        currentExtra={currentExtra}
        extraInputRef={extraInputRef}
        isFavorite={!!isFavorite}
        isMobile={isMobile}
        readonly={!!readonly}
        onAddExtra={handleAddExtra}
        onDelete={handleDelete}
        onExtraChange={handleExtraChange}
        onOpenTrailer={handleOpenTrailer}
        onToggleFavorite={toggleFavorite}
      >
        <input
          className={clsx(styles.input, styles.money)}
          hidden={hideAmounts}
          placeholder={t('common.currencySign')}
          ref={amountInput}
          onBlur={confirmAmount}
          onKeyPress={createNewSlotOnEnter}
          type='number'
          min='0'
        />
        {!readonly && !isMobile && lotsColumnContext.lotWidthType == 'full' && (
          <>
            <button className={styles.iconButton} onClick={handleAddExtra} title={t('lot.addAmount')}>
              <IconPlus />
            </button>
            <input
              className={clsx(styles.input, styles.extra)}
              placeholder={t('common.currencySign')}
              onChange={handleExtraChange}
              value={currentExtra || ''}
              type='number'
              onKeyPress={addExtraAmountOnEnter}
            />
          </>
        )}
        {!readonly && !isMobile && (
          <button onClick={handleDelete} className={styles.iconButton} title={t('lot.delete')}>
            <IconTrash />
          </button>
        )}
      </LotActionsPopover>
    </>
  );
};

export default memo(LotControls);
