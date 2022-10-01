import React, { useCallback, useState } from 'react';
import './AucActions.scss';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Link,
} from '@material-ui/core';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { LINE_BREAK } from '../../../constants/common.constants';
import { resetPurchases } from '../../../reducers/Purchases/Purchases';
import { isProduction, loadFile } from '../../../utils/common.utils';
import { RootState } from '../../../reducers';
import { Slot } from '../../../models/slot.model';
import { setCompact, setShowChances } from '../../../reducers/AucSettings/AucSettings';
import SaveLoad from '../SaveLoad/SaveLoad';
import { resetSlots } from '../../../reducers/Slots/Slots';
import { updateSettings } from '../../../api/userApi';

const isProd = isProduction();

const getSlotNamesByCount = ({ name, amount }: Slot): string =>
  new Array<string>(Number(amount)).fill(name || '').join(LINE_BREAK);
const createMarbleConfig = (slots: Slot[]): string => slots.map(getSlotNamesByCount).join(LINE_BREAK);

const AucActions: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { showChances } = useSelector((root: RootState) => root.aucSettings.settings);
  const { compact } = useSelector((root: RootState) => root.aucSettings.view);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState<boolean>(false);

  const handleResetSlots = (): void => {
    dispatch(resetSlots());
    dispatch(resetPurchases());
  };

  const downloadMarbles = (): void => {
    loadFile('marbles.csv', createMarbleConfig(slots));
  };

  const handleRestoreOpen = useCallback(() => {
    setConfirmRestoreOpen(true);
  }, []);

  const handleRestoreClose = useCallback(() => {
    setConfirmRestoreOpen(false);
  }, []);

  const handleSetCompact = useCallback(
    (e, checked: boolean) => {
      dispatch(setCompact(checked));
    },
    [dispatch],
  );

  const handleSetShowChances = useCallback(
    (e, checked: boolean) => {
      dispatch(setShowChances(checked));
      updateSettings({ showChances: checked });
    },
    [dispatch],
  );

  return (
    <div className="options-wrapper">
      <FormControlLabel
        control={<Checkbox checked={showChances} onChange={handleSetShowChances} color="primary" />}
        label="Показать шансы на победу"
        className="save-current-slots compact-view-checkbox"
      />
      <div className="options">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          className="da-link gitlab"
          href="https://gitlab.com/Ankirig/woodsauc-renewal"
        >
          GitLab
        </Link>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          className="da-link"
          href="https://www.donationalerts.com/r/kozjar"
        >
          поддержать автора
        </Link>
        <IconButton onClick={handleResetSlots} className="clear-button" title="Очистить все">
          <DeleteSweepIcon />
        </IconButton>
        <FormControlLabel
          control={<Checkbox checked={compact} onChange={handleSetCompact} color="primary" />}
          label="Компактный режим"
          className="save-current-slots compact-view-checkbox"
        />
        {/* <RouteLink to={ROUTES.HELP}> */}
        {/*  <Button className="button" variant="outlined"> */}
        {/*    Гайд */}
        {/*  </Button> */}
        {/* </RouteLink> */}
        <Button className="button marbles" onClick={downloadMarbles} variant="outlined">
          Скачать шары
        </Button>
        <Button className="button restore" onClick={handleRestoreOpen} variant="outlined">
          Сохранение/загрузка
        </Button>
        {/* {!isProd && <MockBidForm />} */}
        <Dialog
          open={confirmRestoreOpen}
          onClose={handleRestoreClose}
          className="confirm-restore"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ваши сохранения</DialogTitle>
          <DialogContent dividers className="content">
            <SaveLoad />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AucActions;
