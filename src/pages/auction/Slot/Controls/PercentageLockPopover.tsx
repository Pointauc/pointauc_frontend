import { ActionIcon, Button, Group, NumberInput, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconLock, IconLockOpen } from '@tabler/icons-react';
import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import { calculateTotalLockedPercentage } from '@utils/lockedPercentage.utils';

export interface PercentageFormData {
  percentage: number;
  isLocked: boolean;
}

interface PercentageFormProps {
  slotId: string;
  onSubmit: (data: PercentageFormData) => void;
  isLockedInitial: boolean;
  getCurrentPercentage: () => number;
}

const PercentageForm: FC<PercentageFormProps> = ({ slotId, onSubmit, isLockedInitial, getCurrentPercentage }) => {
  const { t } = useTranslation();
  const slots = useSelector((root: RootState) => root.slots.slots);
  const [percentage, setPercentage] = useState<number>(getCurrentPercentage());
  const [isLocked, setIsLocked] = useState<boolean>(isLockedInitial);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalLockedPercentage = calculateTotalLockedPercentage(slots);
  const otherLockedPercentage = isLockedInitial ? totalLockedPercentage - percentage : totalLockedPercentage;
  const wouldExceed100 = otherLockedPercentage + percentage >= 100;

  const handleApply = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit({ percentage, isLocked });
  };

  const handleToggleLock = (): void => {
    setIsLocked(!isLocked);
  };

  useEffect(() => {
    if (wouldExceed100) {
      setIsLocked(false);
    }
  }, [wouldExceed100]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [percentage]);

  return (
    <form onSubmit={handleApply}>
      <Text fw={600} fz={14} c='dark.0' mb='xs'>
        {t('lot.changePercentage')}
      </Text>
      <Group gap='xs' wrap='nowrap'>
        <NumberInput
          ref={inputRef}
          value={percentage}
          onChange={(value) => setPercentage(Number(value) || 0)}
          min={0}
          max={100}
          w={80}
          rightSection={<Text>{'%'}</Text>}
        />
        <Tooltip label={wouldExceed100 ? t('lot.cannotLock') : t('lot.lockPercentage')} position='bottom' withArrow>
          <div>
            <ActionIcon
              variant={isLocked ? 'filled' : 'light'}
              color={isLocked ? 'yellow' : 'gray'}
              onClick={handleToggleLock}
              disabled={wouldExceed100 && !isLocked}
              size='input-sm'
              aria-label={isLocked ? t('lot.lockPercentage') : 'Unlock'}
            >
              {isLocked ? <IconLock size={18} /> : <IconLockOpen size={18} />}
            </ActionIcon>
          </div>
        </Tooltip>
        <Button variant='filled' leftSection={<IconCheck size={18} />} size='sm' type='submit'>
          {t('lot.applyPercentage')}
        </Button>
      </Group>
    </form>
  );
};

export default PercentageForm;
