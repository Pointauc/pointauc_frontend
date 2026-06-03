import { Button, Menu, Popover, TextInput, TextInputProps } from '@mantine/core';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconPlus, IconStar, IconStarFilled } from '@tabler/icons-react';
import { FC, KeyboardEvent, ReactNode, RefObject, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';

import styles from './LotControls.module.css';

interface LotActionsPopoverProps {
  children: ReactNode;
  currentExtra: string;
  isFavorite: boolean;
  isMobile: boolean;
  readonly: boolean;
  extraInputRef: RefObject<HTMLInputElement | null>;
  onAddExtra: () => boolean;
  onDelete: () => void;
  onExtraChange: TextInputProps['onChange'];
  onOpenTrailer: () => void;
  onToggleFavorite: () => void;
}

const LotActionsPopover: FC<LotActionsPopoverProps> = ({
  children,
  currentExtra,
  extraInputRef,
  isFavorite,
  isMobile,
  readonly,
  onAddExtra,
  onDelete,
  onExtraChange,
  onOpenTrailer,
  onToggleFavorite,
}) => {
  const { t } = useTranslation();
  const [isAddAmountOpened, setIsAddAmountOpened] = useState(false);
  const [isActionsMenuOpened, setIsActionsMenuOpened] = useState(false);

  const handleOpenAddAmount = (): void => {
    setIsActionsMenuOpened(false);
    setIsAddAmountOpened(true);
  };

  const handleAddExtra = (): void => {
    const isAdded = onAddExtra();
    if (isAdded) {
      setIsAddAmountOpened(false);
    }
  };

  const handleExtraKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddExtra();
      e.preventDefault();
    }
  };

  useLayoutEffect(() => {
    if (isAddAmountOpened) {
      extraInputRef.current?.focus();
    }
  }, [extraInputRef, isAddAmountOpened]);

  return (
    <Popover
      opened={isAddAmountOpened}
      onChange={setIsAddAmountOpened}
      position='right'
      shadow='lg'
      trapFocus
      withArrow
      transitionProps={{ duration: 0 }}
    >
      <Popover.Target>
        <div className={styles.moneyWrapper}>
          {children}
          <Menu
            width={200}
            shadow='lg'
            offset={-2}
            position='bottom-start'
            withArrow
            opened={isActionsMenuOpened}
            onChange={setIsActionsMenuOpened}
            returnFocus={false}
            transitionProps={{ duration: 0 }}
          >
            <Menu.Target>
              <button className={styles.iconButton} title={t('lot.extra')} aria-controls='extra'>
                <MoreHorizIcon />
              </button>
            </Menu.Target>
            <Menu.Dropdown id='extra'>
              {!readonly && (
                <Menu.Item onClick={handleOpenAddAmount} leftSection={<IconPlus size={16} />}>
                  {t('lot.addAmount')}
                </Menu.Item>
              )}
              <Menu.Item
                onClick={onToggleFavorite}
                leftSection={isFavorite ? <IconStarFilled size={16} /> : <IconStar size={16} />}
              >
                {t(isFavorite ? 'lot.unpin' : 'lot.pin')}
              </Menu.Item>
              {isMobile && <Menu.Item onClick={onDelete}>{t('lot.delete')}</Menu.Item>}
              <Menu.Item onClick={onOpenTrailer}>{t('lot.trailer')}</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </Popover.Target>
      <Popover.Dropdown className='flex items-center gap-1.5 px-2 py-1.5'>
        <TextInput
          className='w-28'
          ref={extraInputRef}
          placeholder={t('common.currencySign')}
          onChange={onExtraChange}
          value={currentExtra}
          type='number'
          min='0'
          data-autofocus
          onKeyDown={handleExtraKeyDown}
          size='xs'
        />
        <Button
          leftSection={<IconPlus size={14} />}
          rightSection={<HotkeyHint label='Enter' variant='overlay' />}
          onClick={handleAddExtra}
          size='xs'
          px='xs'
        >
          {t('lot.add')}
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
};

export default LotActionsPopover;
