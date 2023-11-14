import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Typography } from '@mui/material';
import classNames from 'classnames';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ThunkDispatch } from 'redux-thunk';

import { RootState } from '@reducers';
import { saveSettings } from '@reducers/AucSettings/AucSettings.ts';

import SlotsHeader from '../SlotsHeader/SlotsHeader';

import SlotsList from './SlotsList';

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
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

  const slotsColumnClasses = useMemo(
    () => classNames('slots-column', { dragging: !!draggedRedemption }),
    [draggedRedemption],
  );

  const filteredSlots = useMemo(
    () => (searchTerm ? slots.filter(({ name }) => name?.toLowerCase().includes(searchTerm.toLowerCase())) : slots),
    [searchTerm, slots],
  );

  return (
    <div className='slots'>
      <SlotsHeader />
      <div className='slots-wrapper'>
        <div className={slotsColumnClasses}>
          <SlotsList slots={filteredSlots} />
        </div>
      </div>
    </div>
  );
};

export default SlotsColumn;
