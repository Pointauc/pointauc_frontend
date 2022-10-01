import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Typography } from '@material-ui/core';
import classNames from 'classnames';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { RootState } from '../../../reducers';
import { getCookie } from '../../../utils/common.utils';
import SlotsList from './SlotsList';
import { setAucSettings } from '../../../reducers/AucSettings/AucSettings';
import SlotsHeader from '../SlotsHeader/SlotsHeader';

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch();
  const buyoutInput = useRef<HTMLInputElement>(null);
  const { slots, searchTerm } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const {
    settings: { isBuyoutVisible, isTotalVisible },
  } = useSelector((rootReducer: RootState) => rootReducer.aucSettings);
  const { draggedRedemption } = useSelector((root: RootState) => root.purchases);
  const [, setBuyout] = useState<number | null>(null);

  const handleBuyoutChange = (): void => {
    if (buyoutInput.current) {
      setBuyout(Number(buyoutInput.current.value));
    }
  };

  useEffect(() => {
    if (!isBuyoutVisible && buyoutInput.current) {
      setBuyout(null);
      buyoutInput.current.value = '';
    }
  }, [isBuyoutVisible]);

  useEffect(() => {
    if (buyoutInput.current) {
      buyoutInput.current.addEventListener('change', handleBuyoutChange);
    }
  }, [buyoutInput]);

  useEffect(() => {
    const newVisible = getCookie('showTotal');

    dispatch(setAucSettings({ isTotalVisible: newVisible === 'true' }));
  }, [dispatch]);

  const slotsColumnClasses = useMemo(
    () => classNames('slots-column', { dragging: !!draggedRedemption }),
    [draggedRedemption],
  );

  const totalSum = useMemo(() => slots.reduce((sum, slot) => (slot.amount ? sum + slot.amount : sum), 0), [slots]);

  const toggleTotalSumVisability = useCallback(() => {
    document.cookie = `showTotal=${!isTotalVisible}; expires=Fri, 31 Dec 9999 23:59:59 GMT\``;
    dispatch(setAucSettings({ isTotalVisible: !isTotalVisible }));
  }, [dispatch, isTotalVisible]);

  const filteredSlots = useMemo(
    () => (searchTerm ? slots.filter(({ name }) => name?.toLowerCase().includes(searchTerm.toLowerCase())) : slots),
    [searchTerm, slots],
  );

  return (
    <div className="slots">
      <SlotsHeader />
      <div className="slots-wrapper">
        <div className={slotsColumnClasses}>
          <SlotsList slots={filteredSlots} />
          <div className="slots-footer">
            <div className="total-sum-container">
              {isTotalVisible && <Typography className="total-sum">{`Всего: ${totalSum} ₽`}</Typography>}
              <IconButton onClick={toggleTotalSumVisability} className="hide-sum">
                {isTotalVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotsColumn;
