import { ActionIcon, Button, Group, NumberInput, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconLock, IconLockOpen } from '@tabler/icons-react';
import { FC, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import { calculateTotalLockedPercentage } from '@utils/lockedPercentage.utils';
import { calculateLotPercentage, getValidAmount } from '@services/PercentsRefMap';

export interface PercentageFormData {
  percentage: number;
  isLocked: boolean;
}

interface PercentageFormProps {
  slotId: string;
  onSubmit: (data: PercentageFormData) => void;
}

const PercentageForm: FC<PercentageFormProps> = ({ slotId, onSubmit }) => {
  const { t } = useTranslation();
  const slots = useSelector((root: RootState) => root.slots.slots);
  const inputRef = useRef<HTMLInputElement>(null);

  const initiaTruePercentage = useMemo(() => {
    const slot = slots.find((slot) => slot.id === slotId);
    const total = slots.reduce((accum, { amount }) => accum + getValidAmount(amount), 0) || 1;
    return calculateLotPercentage(slot?.amount ?? 0, total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialFormData = useMemo(() => {
    return {
      percentage: Number(initiaTruePercentage.toFixed(1)) || 0,
      isLocked: false,
    };
  }, [initiaTruePercentage]);

  const { control, handleSubmit, watch, setValue, formState } = useForm<PercentageFormData>({
    defaultValues: initialFormData,
  });

  const percentage = watch('percentage');
  const isLocked = watch('isLocked');

  const totalLockedPercentage = calculateTotalLockedPercentage(slots);
  const otherLockedPercentage = initialFormData.isLocked
    ? totalLockedPercentage - initialFormData.percentage
    : totalLockedPercentage;
  const wouldExceed100 = otherLockedPercentage + percentage >= 100;

  const handleToggleLock = (): void => {
    setValue('isLocked', !isLocked);
  };

  useEffect(() => {
    if (wouldExceed100) {
      setValue('isLocked', false);
    }
  }, [wouldExceed100, setValue]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>): void => {
    handleSubmit((data) => {
      return onSubmit({
        ...data,
        percentage: formState.dirtyFields.percentage ? data.percentage : initiaTruePercentage,
      });
    })(e);
  };

  return (
    <form onSubmit={submit}>
      <Text fw={600} fz={14} c='dark.0' mb='xs'>
        {t('lot.changePercentage')}
      </Text>
      <Group gap='xs' wrap='nowrap'>
        <Controller
          control={control}
          name='percentage'
          render={({ field }) => (
            <NumberInput
              ref={inputRef}
              value={field.value}
              onChange={(value) => field.onChange(typeof value === 'number' ? value : 0)}
              min={0}
              max={100}
              w={80}
              rightSection={<Text>{'%'}</Text>}
            />
          )}
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
