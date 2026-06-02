import { Badge, Button, Menu } from '@mantine/core';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { IconArrowsSplit, IconDice5 } from '@tabler/icons-react';
import clsx from 'clsx';
import { RefObject, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';

import classes from './BidComponent.module.css';
import { buildSmartSplitEntries } from './splitBidSuggestions';

import type { Lot } from '@models/slot.model';

interface BidActionsMenuContentProps {
  suggestionText: string;
  totalAmount: number;
  onAddToRandomSlot: () => void;
  onOpenSplitBid: () => void;
}

interface BidActionsProps {
  bestMatch: (Lot & { index: number }) | null;
  isHotkeyTarget?: boolean;
  luckyWheelEnabled: boolean;
  suggestionText: string;
  totalAmount: number;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onAddNewSlot: () => void;
  onAddToBestMatch: () => void;
  onAddToRandomSlot: () => void;
  onOpenSplitBid: () => void;
  onOpenCasino: () => void;
}

const BidActionsMenuContent = ({
  suggestionText,
  totalAmount,
  onAddToRandomSlot,
  onOpenSplitBid,
}: BidActionsMenuContentProps) => {
  const { t } = useTranslation();
  const suggestedSplitCount = useMemo(
    () => buildSmartSplitEntries(suggestionText, totalAmount).length,
    [suggestionText, totalAmount],
  );
  const shouldShowSplitCount = suggestedSplitCount > 1;

  return (
    <>
      <Menu.Item
        leftSection={<IconArrowsSplit size={16} />}
        rightSection={shouldShowSplitCount ? <Badge size='xs'>{suggestedSplitCount}</Badge> : undefined}
        onClick={onOpenSplitBid}
      >
        {t('bid.split.menuItem')}
      </Menu.Item>
      <Menu.Item leftSection={<IconDice5 size={16} />} onClick={onAddToRandomSlot}>
        {t('auc.addToRandomSlot')}
      </Menu.Item>
    </>
  );
};

const BidActions = ({
  bestMatch,
  isHotkeyTarget,
  luckyWheelEnabled,
  suggestionText,
  totalAmount,
  anchorRef,
  onAddNewSlot,
  onAddToBestMatch,
  onAddToRandomSlot,
  onOpenSplitBid,
  onOpenCasino,
}: BidActionsProps) => {
  const { t } = useTranslation();
  const [isMenuOpened, setIsMenuOpened] = useState(false);

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
        <Menu position='bottom-end' opened={isMenuOpened} onChange={setIsMenuOpened}>
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
            {isMenuOpened && (
              <BidActionsMenuContent
                suggestionText={suggestionText}
                totalAmount={totalAmount}
                onAddToRandomSlot={onAddToRandomSlot}
                onOpenSplitBid={onOpenSplitBid}
              />
            )}
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
