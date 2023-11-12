import { useCallback, useMemo, useState } from 'react';
import './AucActions.scss';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Link,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useTranslation } from 'react-i18next';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GitHubIcon from '@mui/icons-material/GitHub';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import PercentIcon from '@mui/icons-material/Percent';
import CompressIcon from '@mui/icons-material/Compress';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ThunkDispatch } from '@reduxjs/toolkit';

import { LINE_BREAK } from '@constants/common.constants.ts';
import { resetPurchases } from '@reducers/Purchases/Purchases.ts';
import { loadFile } from '@utils/common.utils.ts';
import { RootState } from '@reducers';
import { Slot } from '@models/slot.model.ts';
import { saveSettings, setCompact, setShowChances } from '@reducers/AucSettings/AucSettings.ts';
import { resetSlots } from '@reducers/Slots/Slots.ts';
import { updateSettings } from '@api/userApi.ts';
import { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import CheckboxButtonGroup from '@components/CheckboxButtonGroup';

import SaveLoad from '../SaveLoad/SaveLoad';
import LanguageDropdown from '../LanguageDropdown/LanguageDropdown';

const getSlotNamesByCount = ({ name, amount }: Slot): string =>
  new Array<string>(Number(amount)).fill(name || '').join(LINE_BREAK);
const createMarbleConfig = (slots: Slot[]): string => slots.map(getSlotNamesByCount).join(LINE_BREAK);

const AucActions: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { showChances, isTotalVisible } = useSelector((root: RootState) => root.aucSettings.settings);
  const { compact } = useSelector((root: RootState) => root.aucSettings.view);
  const { activeSettingsPresetId } = useSelector((root: RootState) => root.user);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState<boolean>(false);

  const selectedOptions = useMemo(() => {
    const map = { showChances, compact };

    return Object.entries(map).reduce<string[]>((acc, [key, enabled]) => (enabled ? [...acc, key] : acc), []);
  }, [compact, showChances]);

  const availableOptions: Option<string>[] = useMemo(
    () => [
      {
        key: 'showChances',
        label: (
          <Tooltip title={t('auc.showChances')}>
            <PercentIcon />
          </Tooltip>
        ),
      },
      {
        key: 'compact',
        label: (
          <Tooltip title={t('auc.compactView')}>
            <CompressIcon />
          </Tooltip>
        ),
      },
    ],
    [t],
  );

  const selectOptions = useCallback(
    (options: string[]) => {
      const showChancesEnabled = options.includes('showChances');
      const compactEnabled = options.includes('compact');

      dispatch(setShowChances(showChancesEnabled));
      dispatch(setCompact(compactEnabled));
      updateSettings({ settings: { showChances: showChancesEnabled }, id: activeSettingsPresetId });
    },
    [activeSettingsPresetId, dispatch],
  );

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

  const totalSum = useMemo(() => slots.reduce((sum, slot) => (slot.amount ? sum + slot.amount : sum), 0), [slots]);

  const toggleTotalSumVisability = useCallback(() => {
    dispatch(saveSettings({ isTotalVisible: !isTotalVisible }));
  }, [dispatch, isTotalVisible]);

  return (
    <Grid container justifyContent='center' className='options-wrapper'>
      <Grid item>
        <Grid container item spacing={4}>
          <Grid item>
            <ButtonGroup size='large' className='actions-group'>
              <Tooltip title='GitHub'>
                <Link target='_blank' rel='noopener noreferrer' href='https://github.com/Pointauc/pointauc_frontend'>
                  <Button startIcon={<GitHubIcon />} />
                </Link>
              </Tooltip>
              <Tooltip title={t('auc.supportCreator')}>
                <Link target='_blank' rel='noopener noreferrer' href='https://www.donationalerts.com/r/kozjar'>
                  <Button startIcon={<AttachMoneyIcon />} />
                </Link>
              </Tooltip>
              <Tooltip title={t('auc.downloadMarbles')}>
                <Button onClick={downloadMarbles} startIcon={<DownloadIcon />} />
              </Tooltip>
              <Tooltip title={t('auc.saveLoad')}>
                <Button onClick={handleRestoreOpen} startIcon={<SaveIcon />} />
              </Tooltip>
              <Tooltip title='Очистить все'>
                <Button onClick={handleResetSlots} startIcon={<DeleteSweepIcon />} />
              </Tooltip>
            </ButtonGroup>
          </Grid>

          <Grid item>
            <CheckboxButtonGroup
              options={availableOptions}
              onChangeActive={selectOptions}
              activeKeys={selectedOptions}
            />
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        open={confirmRestoreOpen}
        onClose={handleRestoreClose}
        className='confirm-restore'
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Ваши сохранения</DialogTitle>
        <DialogContent dividers className='auc-action-dialog-content'>
          <SaveLoad />
        </DialogContent>
      </Dialog>

      <div className='options'>
        <LanguageDropdown />
      </div>

      <div className='total-sum-wrapper'>
        {isTotalVisible && <Typography className='total-sum'>{`Всего: ${totalSum} ₽`}</Typography>}
        <IconButton onClick={toggleTotalSumVisability} className='hide-sum' size='large'>
          {isTotalVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </div>
    </Grid>
  );
};

export default AucActions;
