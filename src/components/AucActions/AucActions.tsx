import React, { useCallback, useEffect, useState } from 'react';
import './AucActions.scss';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Link,
} from '@material-ui/core';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { Link as RouteLink } from 'react-router-dom';
import { setUsername } from '../../reducers/User/User';
import { LINE_BREAK, USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { resetSlots, setSlots } from '../../reducers/Slots/Slots';
import { resetPurchases } from '../../reducers/Purchases/Purchases';
import { isProduction, loadFile } from '../../utils/common.utils';
import { RootState } from '../../reducers';
import { Slot } from '../../models/slot.model';
import MockBidForm from './MockBidForm/MockBidForm';
import { LocalStorageEnum } from '../../models/common.model';
import { setCompact } from '../../reducers/AucSettings/AucSettings';
import ROUTES from '../../constants/routes.constants';

const isProd = isProduction();

const getSlotNamesByCount = ({ name, amount }: Slot): string =>
  new Array<string>(Number(amount)).fill(name || '').join(LINE_BREAK);
const createMarbleConfig = (slots: Slot[]): string => slots.map(getSlotNamesByCount).join(LINE_BREAK);

const AucActions: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { compact } = useSelector((root: RootState) => root.aucSettings.view);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState<boolean>(false);
  const [saveCurrentSlots, setSaveCurrentSlots] = useState<boolean>(false);

  const handleResetSlots = (): void => {
    dispatch(resetSlots());
    dispatch(resetPurchases());
  };

  useEffect(() => {
    const username = Cookies.get(USERNAME_COOKIE_KEY);
    if (username) {
      dispatch(setUsername(username));
    }
  }, [dispatch]);

  const downloadMarbles = (): void => {
    loadFile('marbles.csv', createMarbleConfig(slots));
  };

  const handleRestoreOpen = useCallback(() => {
    setConfirmRestoreOpen(true);
  }, []);

  const handleRestoreClose = useCallback(() => {
    setConfirmRestoreOpen(false);
    setSaveCurrentSlots(false);
  }, []);

  const restoreSlots = useCallback(() => {
    const nextSlots = JSON.parse(localStorage.getItem(LocalStorageEnum.Slots) || '[]');

    if (saveCurrentSlots) {
      localStorage.setItem(LocalStorageEnum.Slots, JSON.stringify(slots));
    }

    dispatch(setSlots(nextSlots));
    handleRestoreClose();
  }, [dispatch, handleRestoreClose, saveCurrentSlots, slots]);

  const handleCheck = useCallback((event, checked: boolean) => {
    setSaveCurrentSlots(checked);
  }, []);

  const handleSetCompact = useCallback(
    (e, checked: boolean) => {
      dispatch(setCompact(checked));
    },
    [dispatch],
  );

  return (
    <div className="options">
      <Link
        target="_blank"
        rel="noopener noreferrer"
        className="da-link"
        href="https://www.donationalerts.com/r/kozjar"
      >
        поддержка
      </Link>
      <IconButton onClick={handleResetSlots} className="clear-button" title="Очистить все">
        <DeleteSweepIcon />
      </IconButton>
      <FormControlLabel
        control={<Checkbox checked={compact} onChange={handleSetCompact} color="primary" />}
        label="Компактный режим (W.I.P.)"
        className="save-current-slots"
      />
      {/* <ServerStatus /> */}
      <RouteLink to={ROUTES.HELP}>
        <Button className="button" variant="outlined">
          Гайд
        </Button>
      </RouteLink>
      <Button className="button marbles" onClick={downloadMarbles} variant="outlined">
        Скачать шары
      </Button>
      <Button className="button restore" onClick={handleRestoreOpen} variant="outlined">
        Восстановить лоты
      </Button>
      {!isProd && <MockBidForm />}
      <Dialog open={confirmRestoreOpen} onClose={handleRestoreClose} className="confirm-restore">
        <DialogTitle>Внимание</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Текущие лоты будут перезаписаны сохраненной версией, которая была перед прошлым закрытием/обновлением
            страницы.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <FormControlLabel
            control={<Checkbox checked={saveCurrentSlots} onChange={handleCheck} color="primary" />}
            label="Сохранить текущие лоты"
            className="save-current-slots"
          />
          <Button onClick={handleRestoreClose}>Отменить</Button>
          <Button color="primary" onClick={restoreSlots}>
            Перезаписать
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AucActions;
