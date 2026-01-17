import { Menu, TextInputProps } from '@mantine/core';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconHash, IconPlus, IconTrash, IconStar, IconStarFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { openTrailer } from '@reducers/ExtraWindows/ExtraWindows';
import {
  addExtra,
  addSlot,
  deleteSlot,
  setSlotAmount,
  setSlotIsFavorite,
  setSlotName
} from '@reducers/Slots/Slots.ts';
import { percentsRefMap, updatePercents } from '@services/PercentsRefMap.ts';
import { useIsMobile } from '@shared/lib/ui';
import { animateValue } from '@utils/common.utils.ts';
import { numberUtils } from '@utils/common/number';

import styles from './LotControls.module.css';
import WinningChance from './WinningChance';

interface LotControlsProps {
  lot: Slot;
  readonly?: boolean;
}

const LotControls: FC<LotControlsProps> = ({ lot, readonly }) => {
  const marblesAuc = useSelector((root: RootState) => root.aucSettings.settings.marblesAuc);
  const showChances = useSelector((root: RootState) => root.aucSettings.settings.showChances);
  const hideAmounts = useSelector((root: RootState) => root.aucSettings.settings.hideAmounts);
  const favoritesIsEnable = useSelector((root: RootState) => root.aucSettings.settings.favoritesIsEnable);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { id, extra, amount, name, isFavorite } = lot;
  const [currentName, setCurrentName] = useState(name);
  const [currentExtra, setCurrentExtra] = useState(extra);
  const amountInput = useRef<HTMLInputElement>(null);
  const percentsRef = useRef<HTMLSpanElement>(null);
  const isAmountInitialized = useRef(false);
  const isMobile = useIsMobile();
  const extraInputRef = useRef<HTMLInputElement>(null);

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

  const handleNameBlur: TextInputProps['onBlur'] = (e): void => {
    if (name === e.target.value) return;
    dispatch(setSlotName({ id, name: e.target.value }));
  };
  const handleNameChange: TextInputProps['onChange'] = (e): void => {
    setCurrentName(e.target.value);
  };

  const updateExtraAmount = (value: number | null): void => {
    setCurrentExtra(value);
    if (extraInputRef.current) {
      const extraLength = Number(value?.toString().length);
      extraInputRef.current.style.width = `${extraLength && extraLength > 4 ? 2 + extraLength * 1.1 : 7}ch`;
    }
  };

  const handleExtraChange: TextInputProps['onChange'] = (e): void => {
    updateExtraAmount(Number(e.target.value));
  };

  const handleAddExtra = (): void => {
    dispatch(addExtra({ id, extra: Number(currentExtra) }));
    updateExtraAmount(null);
  };

  const confirmAmount = useCallback(() => {
    if (Number(amountInput.current?.value) === Number(amount)) return;
    dispatch(setSlotAmount({ id, amount: Number(amountInput.current?.value) }));
  }, [dispatch, id, amount]);

  const addExtraAmountOnEnter = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      handleAddExtra();
      e.preventDefault();
    }
  };

  const createNewSlotOnEnter = (e: any): void => {
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

  useEffect(() => {
    if (name !== currentName) setCurrentName(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  const handleOpenTrailer = useCallback(() => {
    dispatch(openTrailer(name || ''));
  }, [dispatch, name]);

  const isLocked = !!lot.lockedPercentage;

  function toggleFavorite() {
    dispatch(setSlotIsFavorite({ id, state: !isFavorite }));
  }

  return (
    <>
      {favoritesIsEnable && (
        <button
          onClick={toggleFavorite}
          className={styles.iconButton}
          title={t(isFavorite ? 'lot.unpin' : 'lot.pin')}
        >
          { isFavorite ? <IconStarFilled color={'orange'} /> : <IconStar color={'#fff2'} /> }
        </button>
      )}
      <div className={styles.hashContainer}>
        <div className={styles.hash}>
          <IconHash className={styles.hashIcon} size={18} />
          <div>{`${lot.fastId}`}</div>
        </div>
      </div>
      <input
        className={clsx(styles.input, styles.name, { [styles.lockedLot]: isLocked })}
        placeholder={t('auc.lotName')}
        onBlur={handleNameBlur}
        onChange={handleNameChange}
        onKeyPress={createNewSlotOnEnter}
        value={currentName ?? ''}
      />
      {showChances && (
        <WinningChance slotId={id} ref={percentsRef} isLocked={isLocked} lockedPercentage={lot.lockedPercentage} />
      )}
      <div className={styles.moneyWrapper}>
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
        {!readonly && !isMobile && (
          <>
            <button className={styles.iconButton} onClick={handleAddExtra} title={t('lot.addAmount')}>
              <IconPlus />
            </button>
            <input
              className={clsx(styles.input, styles.extra)}
              ref={extraInputRef}
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
        <Menu width={200} shadow='lg' offset={-2} position='bottom-start' withArrow>
          <Menu.Target>
            <button className={styles.iconButton} title={t('lot.extra')} aria-controls='extra'>
              <MoreHorizIcon />
            </button>
          </Menu.Target>
          <Menu.Dropdown id='extra'>
            {isMobile && <Menu.Item onClick={handleDelete}>{t('lot.delete')}</Menu.Item>}
            <Menu.Item onClick={handleOpenTrailer}>{t('lot.trailer')}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </>
  );
};

export default memo(LotControls);
