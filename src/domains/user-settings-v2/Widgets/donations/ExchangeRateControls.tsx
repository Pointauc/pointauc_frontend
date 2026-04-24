import { Button, Text, Tooltip } from '@mantine/core';
import { IconArrowBigRightFilled, IconTransfer } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import PointsIcon from '@assets/icons/channelPoints.svg?react';
import FormInput from '@shared/mantine/ui/Input/FormInput';
import { SettingsForm } from '@models/settings.model.ts';

const SwitchPlacesTooltip = () => {
  const { t } = useTranslation();

  return (
    <div className='flex max-w-[380px] flex-col gap-2.5 py-1'>
      <div>
        <Text component='p' fw={600} size='sm'>
          {t('settings.integrationCommon.switchRatesTooltip.title')}
        </Text>
      </div>

      <div className='rounded-md bg-[var(--mantine-color-gray-7)] px-3 py-2'>
        <div className='flex justify-between'>
          <Text component='p' fw={600} size='xs'>
            {t('settings.integrationCommon.switchRatesTooltip.moneyToCoins.title')}
          </Text>
          <Text component='p' size='xs' c='gray' mt={4}>
            {t('settings.integrationCommon.switchRatesTooltip.moneyToCoins.direction')}
          </Text>
        </div>
        <Text component='p' size='xs' mt={4}>
          {t('settings.integrationCommon.switchRatesTooltip.moneyToCoins.description')}
        </Text>
        <Text component='p' size='xs' c='gray' mt={4}>
          {t('settings.integrationCommon.switchRatesTooltip.moneyToCoins.example', {
            currency: t('common.currencySign'),
          })}
        </Text>
      </div>

      <div className='rounded-md bg-[var(--mantine-color-gray-7)] px-3 py-2'>
        <div className='flex justify-between'>
          <Text component='p' fw={600} size='xs'>
            {t('settings.integrationCommon.switchRatesTooltip.pointsToMoney.title')}
          </Text>
          <Text component='p' size='xs' c='gray' mt={4}>
            {t('settings.integrationCommon.switchRatesTooltip.pointsToMoney.direction')}
          </Text>
        </div>
        <Text component='p' size='xs' mt={4}>
          {t('settings.integrationCommon.switchRatesTooltip.pointsToMoney.description')}
        </Text>
        <Text component='p' size='xs' c='gray' mt={4}>
          {t('settings.integrationCommon.switchRatesTooltip.pointsToMoney.example', {
            currency: t('common.currencySign'),
          })}
        </Text>
      </div>
    </div>
  );
};

const ExchangeRateControls = () => {
  const { control, setValue } = useFormContext<SettingsForm>();
  const { t } = useTranslation();

  const reversePointsRate = useWatch({ control, name: 'reversePointsRate' });

  return (
    <div className='flex min-w-0 flex-wrap items-center gap-0'>
      <div className='flex flex-wrap items-center gap-2.5'>
        <Text component='span'>{`1 ${t('common.currencySign')}`}</Text>
        <IconArrowBigRightFilled
          style={{
            transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            transform: reversePointsRate ? 'rotate(180deg)' : undefined,
          }}
        />
        <FormInput
          name='pointsRate'
          control={control}
          type='number'
          w={110}
          size='sm'
          rightSection={<PointsIcon width={20} height={20} />}
        />
      </div>

      <Tooltip label={<SwitchPlacesTooltip />} withArrow multiline withinPortal w={380} position='top-end'>
        <Button
          size='sm'
          variant='transparent'
          className='hover:underline'
          onClick={() => setValue('reversePointsRate', !reversePointsRate, { shouldDirty: true, shouldTouch: true })}
        >
          <div className='flex items-center gap-1'>
            <Text size='sm' fw={500}>
              {t('settings.donations.switchRates')}
            </Text>
            <IconTransfer size={20} />
          </div>
        </Button>
      </Tooltip>
    </div>
  );
};

export default ExchangeRateControls;
