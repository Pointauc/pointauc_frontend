import { Button, Group, Popover, Text, Tooltip } from '@mantine/core';
import CompressIcon from '@mui/icons-material/Compress';
import DownloadIcon from '@mui/icons-material/Download';
import PercentIcon from '@mui/icons-material/Percent';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { updateSettings } from '@api/userApi';
import CheckboxButtonGroup from '@components/CheckboxButtonGroup';
import { LINE_BREAK } from '@constants/common.constants.ts';
import ArchiveModal from '@domains/auction/archive/ui/ArchiveModal';
import { Lot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { setAutoScroll, setCompact, setShowChances, setShowRules } from '@reducers/AucSettings/AucSettings';
import { loadFile } from '@utils/common.utils.ts';

import LanguageDropdown from '../LanguageDropdown/LanguageDropdown';

import classes from './AucActions.module.css';
import TotalAmount from './TotalAmount/TotalAmount';
import NewAuctionButton from './NewAuction/NewAuctionButton';

const getSlotNamesByCount = ({ name, amount }: Lot): string =>
  new Array<string>(Number(amount)).fill(name || '').join(LINE_BREAK);
const createMarbleConfig = (slots: Lot[]): string => slots.map(getSlotNamesByCount).join(LINE_BREAK);

const AucActions: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { showChances, marblesAuc } = useSelector((root: RootState) => root.aucSettings.settings);
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

  return (
    <Group className={classes.wrapper} justify='center'>
      <Group gap='lg'>
        <Button.Group>
          {marblesAuc && (
            <Tooltip label={t('auc.downloadMarbles')}>
              <Button onClick={downloadMarbles} size='sm' variant='outline' color='primary.3'>
                <DownloadIcon />
              </Button>
            </Tooltip>
          )}
          <Tooltip label={t('archive.modal.title')}>
            <Button onClick={handleArchiveOpen} size='sm' variant='outline' color='primary.3'>
              <IconDeviceFloppy size={20} />
            </Button>
          </Tooltip>
        </Button.Group>

        <CheckboxButtonGroup options={availableOptions} onChangeActive={selectOptions} activeKeys={selectedOptions} />
      </Group>

      <Button.Group>
        <NewAuctionButton />
      </Button.Group>

      <ArchiveModal opened={archiveModalOpen} onClose={handleArchiveClose} />

      <div className={classes.options}>
        <LanguageDropdown />
      </div>

      <TotalAmount />
    </Group>
  );
};

export default AucActions;
