import { Popover } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { setLockedPercentage, setLotPercentage, unlockPercentage } from '@reducers/Slots/Slots';

import PercentageForm, { PercentageFormData } from './PercentageForm';
import styles from './WinningChance.module.css';

interface WinningChanceProps {
  slotId: string;
  amount: number;
  isLocked?: boolean;
  lockedPercentage?: number | null;
  onClick?: () => void;
  ref: React.RefObject<HTMLSpanElement | null>;
}

const WinningChance: FC<WinningChanceProps> = ({ slotId, isLocked = false, lockedPercentage = null, onClick, ref }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [popoverOpened, setPopoverOpened] = useState(false);

  const handlePercentageClick = (): void => {
    setPopoverOpened(true);
  };

  const tooltip =
    isLocked && lockedPercentage ? t('lot.lockedTooltip', { percentage: lockedPercentage }) : t('auc.chanceTooltip');

  const handleSubmit = (formData: PercentageFormData): void => {
    requestAnimationFrame(() => setPopoverOpened(false));

    if (formData.isLocked && formData.percentage > 0) {
      dispatch(setLockedPercentage({ id: slotId, percentage: formData.percentage }));
    }

    if (!formData.isLocked && isLocked) {
      dispatch(unlockPercentage(slotId));
    }

    if (!formData.isLocked && formData.percentage > 0) {
      dispatch(setLotPercentage({ id: slotId, percentage: formData.percentage }));
    }
  };

  const handlePopoverChange = (opened: boolean): void => {
    setPopoverOpened(opened);
  };

  return (
    <Popover
      opened={popoverOpened}
      onChange={handlePopoverChange}
      closeOnClickOutside
      trapFocus
      position='bottom'
      withArrow
      shadow='md'
    >
      <Popover.Target>
        <div
          className={clsx(styles.chanceContainer, { [styles.clickable]: handlePercentageClick })}
          onClick={() => setPopoverOpened((prev) => !prev)}
        >
          <span className={clsx(styles.chance, { [styles.locked]: isLocked })} title={tooltip} ref={ref} />
          {isLocked && <IconLock className={styles.lockIcon} size={14} />}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <PercentageForm slotId={slotId} onSubmit={handleSubmit} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default WinningChance;
