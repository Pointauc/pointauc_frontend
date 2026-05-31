import { Button, Menu } from '@mantine/core';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { IconArrowsSplit, IconDice5 } from '@tabler/icons-react';
import clsx from 'clsx';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';

import classes from './BidComponent.module.css';

import type { Lot } from '@models/slot.model';

interface BidActionsProps {
  bestMatch: (Lot & { index: number }) | null;
  isHotkeyTarget?: boolean;
  luckyWheelEnabled: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onAddNewSlot: () => void;
  onAddToBestMatch: () => void;
  onAddToRandomSlot: () => void;
  onOpenSplitBid: () => void;
  onOpenCasino: () => void;
}

const BidActions = ({
  bestMatch,
  isHotkeyTarget,
  luckyWheelEnabled,
  anchorRef,
  onAddNewSlot,
  onAddToBestMatch,
  onAddToRandomSlot,
  onOpenSplitBid,
  onOpenCasino,
}: BidActionsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Button.Group>
        <Button
          variant='outline'
          color='white'
          size='xs'
          fz='sm'
          flex={1}
          className={clsx(classes.actionButton, 'relative')}
          onClick={onAddNewSlot}
        >
          <span className='inline-flex w-full items-center justify-center'>
            {isHotkeyTarget && (
              <HotkeyHint
                actionId={HOTKEY_ACTION_IDS.firstBidNew}
                variant='overlay'
                className='pointer-events-none absolute top-1/2 left-2 -translate-y-1/2'
              />
            )}
            <span>{t('bid.new')}</span>
          </span>
        </Button>
        <Menu position='bottom-end'>
          <Menu.Target>
            <Button
              ref={anchorRef}
              variant='outline'
              color='white'
              size='xs'
              fz='sm'
              className={clsx(classes.actionButton, classes.splitButtonRight)}
            >
              <ArrowDropDownIcon />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconArrowsSplit size={16} />} onClick={onOpenSplitBid}>
              {t('bid.split.menuItem')}
            </Menu.Item>
            <Menu.Item leftSection={<IconDice5 size={16} />} onClick={onAddToRandomSlot}>
              {t('auc.addToRandomSlot')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Button.Group>

      {bestMatch && (
        <Button
          variant='outline'
          color='white'
          size='xs'
          fz='sm'
          className={clsx(classes.actionButton, 'relative')}
          onClick={onAddToBestMatch}
        >
          <span className='inline-flex w-full items-center justify-center'>
            {isHotkeyTarget && (
              <HotkeyHint
                actionId={HOTKEY_ACTION_IDS.firstBidAddToLot}
                variant='overlay'
                className='pointer-events-none absolute top-1/2 left-2 -translate-y-1/2'
              />
            )}
            <span>{t('bid.toLot', { name: bestMatch.name })}</span>
          </span>
        </Button>
      )}

      {luckyWheelEnabled && (
        <Button
          variant='outline'
          color='white'
          size='xs'
          fz='sm'
          className={classes.actionButton}
          onClick={onOpenCasino}
        >
          {t('bid.luckyWheel')}
        </Button>
      )}
    </>
  );
};

export default BidActions;
