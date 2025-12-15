import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CompressIcon from '@mui/icons-material/Compress';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import PercentIcon from '@mui/icons-material/Percent';
import PestControlIcon from '@mui/icons-material/PestControl';
import SaveIcon from '@mui/icons-material/Save';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconArchive } from '@tabler/icons-react';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { updateSettings } from '@api/userApi';
import CheckboxButtonGroup from '@components/CheckboxButtonGroup';
import { LINE_BREAK } from '@constants/common.constants.ts';
import { Slot } from '@models/slot.model.ts';
import DeleteAllLots from '@pages/auction/AucActions/DeleteAllLots';
import { RootState } from '@reducers';
import {
  saveSettings,
  setAutoScroll,
  setCompact,
  setShowChances,
  setShowRules,
} from '@reducers/AucSettings/AucSettings';
import { loadFile } from '@utils/common.utils.ts';
import ArchiveModal from '@domains/auction/archive/ui/ArchiveModal';

import LanguageDropdown from '../LanguageDropdown/LanguageDropdown';

import classes from './AucActions.module.css';

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
  const [archiveModalOpen, setArchiveModalOpen] = useState<boolean>(false);

  const selectedOptions = useMemo(() => {
    const map = { showChances, compact, showRules, autoScroll };

    return Object.entries(map).reduce<string[]>((acc, [key, enabled]) => (enabled ? [...acc, key] : acc), []);
  }, [compact, showChances, showRules, autoScroll]);

  const availableOptions: any[] = useMemo(
    () => [
      {
        key: 'showRules',
        label: (
          <Tooltip label={t('auc.showRules')}>
            <Group gap='xs' wrap='nowrap'>
              <VerticalSplitIcon />
              <Text fw={500}>{t('auc.rules')}</Text>
            </Group>
          </Tooltip>
        ),
      },
      {
        key: 'showChances',
        label: (
          <Tooltip label={t('auc.showChances')}>
            <PercentIcon />
          </Tooltip>
        ),
      },
      {
        key: 'compact',
        label: (
          <Tooltip label={t('auc.compactView')}>
            <CompressIcon />
          </Tooltip>
        ),
      },
      {
        key: 'autoScroll',
        label: (
          <Tooltip label={t('auc.autoScroll')}>
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

  const handleArchiveOpen = useCallback(() => {
    setArchiveModalOpen(true);
  }, []);

  const handleArchiveClose = useCallback(() => {
    setArchiveModalOpen(false);
  }, []);

  const totalSum = useMemo(() => slots.reduce((sum, slot) => (slot.amount ? sum + slot.amount : sum), 0), [slots]);

  const toggleTotalSumVisability = useCallback(() => {
    dispatch(saveSettings({ isTotalVisible: !isTotalVisible }));
  }, [dispatch, isTotalVisible]);

  return (
    <Group className={classes.wrapper} justify='center'>
      <Group gap='lg'>
        <Button.Group>
          <Tooltip label='GitHub'>
            <Button
              size='sm'
              component='a'
              target='_blank'
              rel='noopener noreferrer'
              href='https://github.com/Pointauc/pointauc_frontend'
              variant='outline'
              color='primary.3'
            >
              <GitHubIcon />
            </Button>
          </Tooltip>
          <Tooltip label={t('auc.supportCreator')}>
            <Button
              size='sm'
              component='a'
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

        <Button.Group>
          <Tooltip label={t('auc.downloadMarbles')}>
            <Button onClick={downloadMarbles} size='sm' variant='outline' color='primary.3'>
              <DownloadIcon />
            </Button>
          </Tooltip>
          <Tooltip label={t('archive.modal.title')}>
            <Button onClick={handleArchiveOpen} size='sm' variant='outline' color='primary.3'>
              <IconArchive size={20} />
            </Button>
          </Tooltip>
          <Tooltip label={t('auc.sendBugReport')}>
            <Button
              component='a'
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

        <CheckboxButtonGroup options={availableOptions} onChangeActive={selectOptions} activeKeys={selectedOptions} />
      </Group>

      <ArchiveModal opened={archiveModalOpen} onClose={handleArchiveClose} />

      <div className={classes.options}>
        <LanguageDropdown />
      </div>

      <div className={classes.totalSumWrapper}>
        {isTotalVisible && <Text>{t('auc.total', { totalSum })}</Text>}
        <ActionIcon onClick={toggleTotalSumVisability} variant='subtle' className={classes.hideSum} size='lg'>
          {isTotalVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </ActionIcon>
      </div>
    </Group>
  );
};

export default AucActions;
