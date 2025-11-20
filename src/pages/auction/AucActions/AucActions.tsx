import { useCallback, useMemo, useState } from 'react';
import './AucActions.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GitHubIcon from '@mui/icons-material/GitHub';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import PercentIcon from '@mui/icons-material/Percent';
import CompressIcon from '@mui/icons-material/Compress';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PestControlIcon from '@mui/icons-material/PestControl';
import { ThunkDispatch } from '@reduxjs/toolkit';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Button, Text } from '@mantine/core';

import { LINE_BREAK } from '@constants/common.constants.ts';
import { loadFile } from '@utils/common.utils.ts';
import { RootState } from '@reducers';
import { Slot } from '@models/slot.model.ts';
import {
  saveSettings,
  setCompact,
  setShowChances,
  setShowRules,
  setAutoScroll,
} from '@reducers/AucSettings/AucSettings.ts';
import { updateSettings } from '@api/userApi.ts';
import { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import CheckboxButtonGroup from '@components/CheckboxButtonGroup';
import DeleteAllLots from '@pages/auction/AucActions/DeleteAllLots';

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
  const { compact, showRules, autoScroll } = useSelector((root: RootState) => root.aucSettings.view);
  const { activeSettingsPresetId } = useSelector((root: RootState) => root.user);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState<boolean>(false);

  const selectedOptions = useMemo(() => {
    const map = { showChances, compact, showRules, autoScroll };

    return Object.entries(map).reduce<string[]>((acc, [key, enabled]) => (enabled ? [...acc, key] : acc), []);
  }, [compact, showChances, showRules, autoScroll]);

  const availableOptions: Option<string>[] = useMemo(
    () => [
      {
        key: 'showRules',
        label: (
          <Tooltip title={t('auc.showRules')}>
            <Grid container gap={1} alignItems='center' flexWrap='nowrap'>
              <VerticalSplitIcon />
              <Text fw={500}>{t('auc.rules')}</Text>
            </Grid>
          </Tooltip>
        ),
      },
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
      {
        key: 'autoScroll',
        label: (
          <Tooltip title={t('auc.autoScroll')}>
            <SwapVertIcon />
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
      const rulesEnabled = options.includes('showRules');
      const autoScrollEnabled = options.includes('autoScroll');

      dispatch(setShowChances(showChancesEnabled));
      dispatch(setCompact(compactEnabled));
      dispatch(setShowRules(rulesEnabled));
      dispatch(setAutoScroll(autoScrollEnabled));
      updateSettings({ settings: { showChances: showChancesEnabled }, id: activeSettingsPresetId });
    },
    [activeSettingsPresetId, dispatch],
  );

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
      <Grid>
        <Grid container spacing={4}>
          <Grid>
            <Button.Group className='actions-group'>
              <Tooltip title='GitHub'>
                <Button
                  size='sm'
                  component={Link}
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://github.com/Pointauc/pointauc_frontend'
                  variant='outline'
                  color='primary.3'
                >
                  <GitHubIcon />
                </Button>
              </Tooltip>
              <Tooltip title={t('auc.supportCreator')}>
                <Button
                  size='sm'
                  component={Link}
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://www.donationalerts.com/r/kozjar'
                  variant='outline'
                  color='primary.3'
                >
                  <AttachMoneyIcon />
                </Button>
              </Tooltip>
            </Button.Group>
          </Grid>

          <Grid>
            <Button.Group>
              <Tooltip title={t('auc.downloadMarbles')}>
                <Button onClick={downloadMarbles} size='sm' variant='outline' color='primary.3'>
                  <DownloadIcon />
                </Button>
              </Tooltip>
              <Tooltip title={t('auc.saveLoad')}>
                <Button onClick={handleRestoreOpen} size='sm' variant='outline' color='primary.3'>
                  <SaveIcon />
                </Button>
              </Tooltip>
              <Tooltip title={t('auc.sendBugReport')}>
                <Button
                  component={Link}
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://docs.google.com/forms/d/e/1FAIpQLSe9b82ColWOLyomlrqCGXXjFBWhwL7opZycPYz5v1ovwVdbjA/viewform?usp=sf_link'
                  size='sm'
                  variant='outline'
                  color='primary.3'
                >
                  <PestControlIcon />
                </Button>
              </Tooltip>
              <DeleteAllLots />
            </Button.Group>
          </Grid>

          <Grid>
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
        <DialogTitle>{t('auc.saves')}</DialogTitle>
        <DialogContent dividers className='auc-action-dialog-content'>
          <SaveLoad />
        </DialogContent>
      </Dialog>
      <div className='options'>
        <LanguageDropdown />
      </div>
      <div className='total-sum-wrapper'>
        {isTotalVisible && <Typography className='total-sum'>{t('auc.total', { totalSum })}</Typography>}
        <IconButton onClick={toggleTotalSumVisability} className='hide-sum' size='large'>
          {isTotalVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </div>
    </Grid>
  );
};

export default AucActions;
